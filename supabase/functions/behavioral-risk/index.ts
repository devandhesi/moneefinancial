import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ────────────────────────────────────────────────

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86400000;
}

function hoursBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 3600000;
}

// ── Analysis engine ────────────────────────────────────────

interface Fill {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  executed_at: string;
  order_id: string | null;
}

interface Order {
  symbol: string;
  side: string;
  quantity: number;
  status: string | null;
  order_type: string | null;
  created_at: string | null;
  updated_at: string | null;
}

function analyzeTrading(fills: Fill[], orders: Order[]) {
  const flags: { id: string; label: string; description: string; severity: string }[] = [];
  let score = 100;

  if (fills.length < 2 && orders.length < 2) {
    return {
      disciplineScore: 100,
      flags: [],
      overtradingFlag: false,
      revengeFlag: false,
      sizeEscalationFlag: false,
      drawdownFlag: false,
      momentumChasingFlag: false,
      avgTradeFrequency: 0,
      avgPositionSize: 0,
      avgHoldingDuration: 0,
      flagsDetail: [],
      trendData: { frequencyByWeek: [], sizeByWeek: [], scoreHistory: [] },
      guidance: [],
    };
  }

  // Sort fills chronologically
  const sortedFills = [...fills].sort(
    (a, b) => new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime()
  );
  const sortedOrders = [...orders].filter(o => o.created_at).sort(
    (a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()
  );

  // ── Compute baseline metrics (all data) ──

  const positionSizes = sortedFills.map(f => f.quantity * f.price);
  const medianSize = median(positionSizes);
  const meanSize = mean(positionSizes);
  const sizeStd = stdDev(positionSizes);

  // Trade frequency: group by day
  const dayMap = new Map<string, number>();
  for (const f of sortedFills) {
    const day = f.executed_at.substring(0, 10);
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  }
  const dailyCounts = Array.from(dayMap.values());
  const avgDailyFreq = mean(dailyCounts);

  // Weekly frequency for trend
  const weekMap = new Map<string, { count: number; totalSize: number }>();
  for (const f of sortedFills) {
    const d = new Date(f.executed_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().substring(0, 10);
    const entry = weekMap.get(weekKey) || { count: 0, totalSize: 0 };
    entry.count++;
    entry.totalSize += f.quantity * f.price;
    weekMap.set(weekKey, entry);
  }

  const weekKeys = Array.from(weekMap.keys()).sort();
  const frequencyByWeek = weekKeys.map(w => ({ week: w, count: weekMap.get(w)!.count }));
  const sizeByWeek = weekKeys.map(w => ({
    week: w,
    avgSize: weekMap.get(w)!.count > 0
      ? +(weekMap.get(w)!.totalSize / weekMap.get(w)!.count).toFixed(2)
      : 0,
  }));

  // Estimate P&L from fills (buy then sell same symbol)
  const openPositions = new Map<string, { qty: number; avgPrice: number }>();
  const closedTrades: { symbol: string; pnl: number; closedAt: string }[] = [];

  for (const f of sortedFills) {
    const existing = openPositions.get(f.symbol);
    if (f.side === "buy") {
      if (existing) {
        const totalQty = existing.qty + f.quantity;
        const totalCost = existing.avgPrice * existing.qty + f.price * f.quantity;
        openPositions.set(f.symbol, { qty: totalQty, avgPrice: totalCost / totalQty });
      } else {
        openPositions.set(f.symbol, { qty: f.quantity, avgPrice: f.price });
      }
    } else if (f.side === "sell" && existing && existing.qty > 0) {
      const sellQty = Math.min(f.quantity, existing.qty);
      const pnl = (f.price - existing.avgPrice) * sellQty;
      closedTrades.push({ symbol: f.symbol, pnl, closedAt: f.executed_at });
      const remaining = existing.qty - sellQty;
      if (remaining > 0) {
        openPositions.set(f.symbol, { qty: remaining, avgPrice: existing.avgPrice });
      } else {
        openPositions.delete(f.symbol);
      }
    }
  }

  // ── Detect: Revenge Trading ──
  let revengeFlag = false;
  for (let i = 0; i < closedTrades.length; i++) {
    const trade = closedTrades[i];
    if (trade.pnl < 0) {
      // Check if trade frequency increases within 24h after loss
      const lossTime = new Date(trade.closedAt).getTime();
      const tradesAfter = sortedFills.filter(f => {
        const t = new Date(f.executed_at).getTime();
        return t > lossTime && t < lossTime + 86400000;
      });
      // Check if frequency elevated or size increased
      if (tradesAfter.length >= Math.max(avgDailyFreq * 1.5, 3)) {
        revengeFlag = true;
        const afterSizes = tradesAfter.map(f => f.quantity * f.price);
        const avgAfterSize = mean(afterSizes);
        if (avgAfterSize > medianSize * 1.2) {
          flags.push({
            id: "revenge_size",
            label: "Revenge Trading",
            description: "Trading frequency elevated after loss with increased position sizing.",
            severity: "high",
          });
          score -= 15;
        } else {
          flags.push({
            id: "revenge_freq",
            label: "Revenge Trading",
            description: "Trading frequency elevated after loss.",
            severity: "medium",
          });
          score -= 10;
        }
        break;
      }
    }
  }

  // ── Detect: Size Escalation ──
  let sizeEscalationFlag = false;
  let consecutiveLosses = 0;
  for (let i = 0; i < closedTrades.length; i++) {
    if (closedTrades[i].pnl < 0) {
      consecutiveLosses++;
      if (consecutiveLosses >= 2 && i + 1 < sortedFills.length) {
        // Check next trade size
        const nextTrades = sortedFills.filter(
          f => new Date(f.executed_at).getTime() > new Date(closedTrades[i].closedAt).getTime()
        );
        if (nextTrades.length > 0) {
          const nextSize = nextTrades[0].quantity * nextTrades[0].price;
          if (nextSize > medianSize * 1.4) {
            sizeEscalationFlag = true;
            flags.push({
              id: "size_escalation",
              label: "Size Escalation",
              description: "Position sizing increasing during drawdown.",
              severity: "high",
            });
            score -= 12;
            break;
          }
        }
      }
    } else {
      consecutiveLosses = 0;
    }
  }

  // ── Detect: Overtrading ──
  let overtradingFlag = false;
  // Compare last 7 days vs 30 day average
  const now = Date.now();
  const recentFills = sortedFills.filter(
    f => now - new Date(f.executed_at).getTime() < 7 * 86400000
  );
  const baselineFills = sortedFills.filter(
    f => now - new Date(f.executed_at).getTime() < 30 * 86400000
  );

  const recentDailyRate = recentFills.length / 7;
  const baselineDailyRate = baselineFills.length / 30;

  if (baselineDailyRate > 0 && recentDailyRate > baselineDailyRate * 2) {
    overtradingFlag = true;
    flags.push({
      id: "overtrading",
      label: "Overtrading",
      description: "Trade frequency significantly above baseline.",
      severity: "medium",
    });
    score -= 10;
  }

  // ── Detect: Momentum Chasing ──
  let momentumChasingFlag = false;
  // If average holding time of recent trades is very short
  const holdingDurations: number[] = [];
  for (const ct of closedTrades) {
    // Find corresponding buy
    const buyFill = sortedFills.find(
      f => f.symbol === ct.symbol && f.side === "buy" &&
        new Date(f.executed_at).getTime() < new Date(ct.closedAt).getTime()
    );
    if (buyFill) {
      holdingDurations.push(hoursBetween(buyFill.executed_at, ct.closedAt));
    }
  }
  const avgHoldingHrs = mean(holdingDurations);
  if (holdingDurations.length >= 3 && avgHoldingHrs < 4) {
    momentumChasingFlag = true;
    flags.push({
      id: "momentum_chasing",
      label: "Momentum Chasing",
      description: "High probability of momentum chasing behavior.",
      severity: "medium",
    });
    score -= 8;
  }

  // ── Detect: Drawdown Instability ──
  let drawdownFlag = false;
  const totalPnl = closedTrades.reduce((s, t) => s + t.pnl, 0);
  const peakEquity = closedTrades.reduce((peak, t) => {
    const running = closedTrades
      .filter(ct => new Date(ct.closedAt).getTime() <= new Date(t.closedAt).getTime())
      .reduce((s, ct) => s + ct.pnl, 0);
    return Math.max(peak, running);
  }, 0);
  const drawdownPct = peakEquity > 0 ? ((peakEquity - totalPnl) / peakEquity) * 100 : 0;

  if (drawdownPct > 15 && overtradingFlag) {
    drawdownFlag = true;
    flags.push({
      id: "drawdown_instability",
      label: "Drawdown Instability",
      description: "Risk behavior increasing during drawdown.",
      severity: "high",
    });
    score -= 15;
  }

  // ── Positive adjustments ──
  if (sizeStd > 0 && meanSize > 0) {
    const cv = sizeStd / meanSize; // coefficient of variation
    if (cv < 0.2) score = Math.min(100, score + 5); // very consistent
    else if (cv > 0.6) score -= 5; // very inconsistent
  }

  score = Math.max(0, Math.min(100, score));

  // ── Guidance ──
  const guidance: { action: string; detail: string }[] = [];
  if (revengeFlag) {
    guidance.push({
      action: "Pause trading for 24 hours after significant losses",
      detail: "Behavioral data indicates elevated activity following drawdowns.",
    });
  }
  if (sizeEscalationFlag) {
    guidance.push({
      action: `Reduce position size to baseline median ($${medianSize.toFixed(0)})`,
      detail: "Position sizing has deviated above historical norms during losing periods.",
    });
  }
  if (overtradingFlag) {
    guidance.push({
      action: `Cap trades to ${Math.ceil(avgDailyFreq + 1)} per day`,
      detail: "Recent frequency exceeds 30-day baseline by a statistically significant margin.",
    });
  }
  if (momentumChasingFlag) {
    guidance.push({
      action: "Set minimum holding period of 1 hour before exit",
      detail: "Average holding duration suggests reactive rather than planned entries.",
    });
  }
  if (drawdownFlag) {
    guidance.push({
      action: "Set fixed risk per trade at 1-2% of portfolio",
      detail: "Risk exposure is increasing during drawdown, compounding potential losses.",
    });
  }
  if (guidance.length === 0) {
    guidance.push({
      action: "Maintain current discipline",
      detail: "No significant behavioral deviations detected. Continue with established patterns.",
    });
  }

  // Score history (simulated weekly trend)
  const scoreHistory = weekKeys.map((w, i) => {
    // Degrade score slightly for weeks with flags
    const weekFills = sortedFills.filter(f => {
      const d = new Date(f.executed_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().substring(0, 10) === w;
    });
    const weekFreq = weekFills.length;
    const baselineFreq = mean(frequencyByWeek.map(fw => fw.count));
    let weekScore = 100;
    if (baselineFreq > 0 && weekFreq > baselineFreq * 1.5) weekScore -= 10;
    const weekSizes = weekFills.map(f => f.quantity * f.price);
    if (weekSizes.length > 1 && stdDev(weekSizes) / mean(weekSizes) > 0.5) weekScore -= 8;
    return { week: w, score: Math.max(40, Math.min(100, weekScore)) };
  });

  return {
    disciplineScore: Math.round(score),
    overtradingFlag,
    revengeFlag,
    sizeEscalationFlag,
    drawdownFlag,
    momentumChasingFlag,
    avgTradeFrequency: +avgDailyFreq.toFixed(2),
    avgPositionSize: +meanSize.toFixed(2),
    avgHoldingDuration: +avgHoldingHrs.toFixed(1),
    flagsDetail: flags,
    trendData: { frequencyByWeek, sizeByWeek, scoreHistory },
    guidance,
  };
}

// ── Server ─────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "analyze") {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const [{ data: fills }, { data: orders }] = await Promise.all([
        admin.from("broker_fills").select("*").eq("user_id", user.id).order("executed_at", { ascending: true }),
        admin.from("broker_orders").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);

      const result = analyzeTrading(fills || [], orders || []);

      // Save snapshot
      await supabase.from("behavioral_metrics").insert({
        user_id: user.id,
        discipline_score: result.disciplineScore,
        overtrading_flag: result.overtradingFlag,
        revenge_flag: result.revengeFlag,
        size_escalation_flag: result.sizeEscalationFlag,
        drawdown_flag: result.drawdownFlag,
        momentum_chasing_flag: result.momentumChasingFlag,
        avg_trade_frequency: result.avgTradeFrequency,
        avg_position_size: result.avgPositionSize,
        avg_holding_duration: result.avgHoldingDuration,
        flags_detail: result.flagsDetail,
        trend_data: result.trendData,
        guidance: result.guidance,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "history") {
      const { data } = await supabase
        .from("behavioral_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("Behavioral risk error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
