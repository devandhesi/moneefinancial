import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Sector mapping for common stocks
const SECTOR_MAP: Record<string, string> = {
  AAPL: "Technology", MSFT: "Technology", GOOGL: "Technology", GOOG: "Technology",
  META: "Technology", AMZN: "Consumer Cyclical", TSLA: "Consumer Cyclical",
  NVDA: "Technology", AMD: "Technology", INTC: "Technology", AVGO: "Technology",
  QCOM: "Technology", TSM: "Technology", ASML: "Technology", MU: "Technology",
  JPM: "Financials", BAC: "Financials", GS: "Financials", MS: "Financials",
  WFC: "Financials", C: "Financials", V: "Financials", MA: "Financials",
  JNJ: "Healthcare", UNH: "Healthcare", PFE: "Healthcare", ABBV: "Healthcare",
  MRK: "Healthcare", LLY: "Healthcare", TMO: "Healthcare",
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy",
  PG: "Consumer Defensive", KO: "Consumer Defensive", PEP: "Consumer Defensive",
  WMT: "Consumer Defensive", COST: "Consumer Defensive",
  DIS: "Communication", NFLX: "Communication", CMCSA: "Communication",
  T: "Communication", VZ: "Communication",
  CAT: "Industrials", DE: "Industrials", HON: "Industrials", UPS: "Industrials",
  BA: "Industrials", RTX: "Industrials", GE: "Industrials",
  NEE: "Utilities", DUK: "Utilities", SO: "Utilities",
  AMT: "Real Estate", PLD: "Real Estate", CCI: "Real Estate",
  LIN: "Materials", APD: "Materials", SHW: "Materials",
  SPY: "ETF-Broad", QQQ: "ETF-Tech", DIA: "ETF-Broad", IWM: "ETF-Small Cap",
  VTI: "ETF-Broad", VOO: "ETF-Broad", ARKK: "ETF-Innovation",
  BTC: "Crypto", ETH: "Crypto", SOL: "Crypto",
};

// Thematic clustering
const THEME_MAP: Record<string, string[]> = {
  "Semiconductors": ["NVDA", "AMD", "INTC", "AVGO", "QCOM", "TSM", "ASML", "MU"],
  "Big Tech": ["AAPL", "MSFT", "GOOGL", "GOOG", "META", "AMZN"],
  "AI/ML": ["NVDA", "MSFT", "GOOGL", "META", "AMD", "PLTR", "AI"],
  "Banking": ["JPM", "BAC", "GS", "MS", "WFC", "C"],
  "Pharma": ["JNJ", "PFE", "ABBV", "MRK", "LLY"],
  "Oil & Gas": ["XOM", "CVX", "COP", "SLB"],
  "EV/Clean Energy": ["TSLA", "RIVN", "LCID", "NEE", "ENPH"],
};

function getSector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] || "Other";
}

function estimateVolatility(positions: any[]): { score: string; level: number } {
  // Estimate based on sector mix
  const highVolSectors = new Set(["Technology", "Crypto", "ETF-Innovation", "Consumer Cyclical"]);
  const lowVolSectors = new Set(["Consumer Defensive", "Utilities", "Healthcare", "ETF-Broad"]);

  let totalValue = 0;
  let highVolValue = 0;
  let lowVolValue = 0;

  for (const pos of positions) {
    const sector = getSector(pos.symbol);
    const val = pos.market_value || pos.quantity * (pos.market_price || pos.average_price || 0);
    totalValue += val;
    if (highVolSectors.has(sector)) highVolValue += val;
    if (lowVolSectors.has(sector)) lowVolValue += val;
  }

  if (totalValue === 0) return { score: "low", level: 1 };

  const highVolPct = highVolValue / totalValue;
  const lowVolPct = lowVolValue / totalValue;

  if (highVolPct > 0.6) return { score: "high", level: 3 };
  if (highVolPct > 0.35 && lowVolPct < 0.3) return { score: "medium", level: 2 };
  return { score: "low", level: 1 };
}

function detectThematicClusters(symbols: string[]): string[] {
  const warnings: string[] = [];
  const upperSymbols = symbols.map(s => s.toUpperCase());

  for (const [theme, themeSymbols] of Object.entries(THEME_MAP)) {
    const overlap = themeSymbols.filter(s => upperSymbols.includes(s));
    if (overlap.length >= 3) {
      warnings.push(`${theme} clustering: ${overlap.join(", ")} (${overlap.length} holdings)`);
    }
  }
  return warnings;
}

function generateAllocation(
  portfolioValue: number,
  cashBalance: number,
  positions: any[],
) {
  const totalValue = portfolioValue + cashBalance;
  if (totalValue === 0) {
    return {
      portfolioValue: 0, cashBalance: 0, cashPercent: 0,
      sectorBreakdown: {}, positionBreakdown: [],
      largestPositionPercent: 0, largestSector: "", largestSectorPercent: 0,
      volatility: { score: "low", level: 1 },
      concentrationWarnings: [], thematicWarnings: [],
      suggestedCashTarget: 10, suggestedMaxPosition: 20,
      plans: getPlans(10, 20, {}),
    };
  }

  const cashPercent = (cashBalance / totalValue) * 100;

  // Build sector breakdown
  const sectorTotals: Record<string, number> = {};
  const positionBreakdown: { symbol: string; value: number; percent: number; sector: string }[] = [];

  for (const pos of positions) {
    const val = pos.market_value || pos.quantity * (pos.market_price || pos.average_price || 0);
    const sector = getSector(pos.symbol);
    sectorTotals[sector] = (sectorTotals[sector] || 0) + val;
    positionBreakdown.push({
      symbol: pos.symbol,
      value: val,
      percent: (val / totalValue) * 100,
      sector,
    });
  }

  positionBreakdown.sort((a, b) => b.value - a.value);

  // Largest position and sector
  const largestPos = positionBreakdown[0];
  const largestPositionPercent = largestPos ? largestPos.percent : 0;

  let largestSector = "";
  let largestSectorValue = 0;
  for (const [sector, val] of Object.entries(sectorTotals)) {
    if (val > largestSectorValue) {
      largestSectorValue = val;
      largestSector = sector;
    }
  }
  const largestSectorPercent = totalValue > 0 ? (largestSectorValue / totalValue) * 100 : 0;

  // Volatility
  const volatility = estimateVolatility(positions);

  // Position size guidance
  let suggestedMaxPosition: number;
  if (totalValue < 10000) suggestedMaxPosition = 20;
  else if (totalValue < 50000) suggestedMaxPosition = 15;
  else suggestedMaxPosition = 10;

  // Cash guidance
  let suggestedCashTarget: number;
  if (volatility.level >= 3) suggestedCashTarget = 20;
  else if (volatility.level === 2) suggestedCashTarget = 12;
  else suggestedCashTarget = 7;

  // Concentration warnings
  const concentrationWarnings: string[] = [];
  for (const pos of positionBreakdown) {
    if (pos.percent > suggestedMaxPosition) {
      concentrationWarnings.push(
        `${pos.symbol} at ${pos.percent.toFixed(1)}% exceeds recommended ${suggestedMaxPosition}% max`
      );
    }
  }
  if (largestSectorPercent > 40) {
    concentrationWarnings.push(
      `${largestSector} at ${largestSectorPercent.toFixed(1)}% exceeds 40% sector concentration limit`
    );
  }

  // Thematic clustering
  const thematicWarnings = detectThematicClusters(positions.map(p => p.symbol));

  // Sector breakdown as percentages
  const sectorBreakdown: Record<string, number> = {};
  for (const [sector, val] of Object.entries(sectorTotals)) {
    sectorBreakdown[sector] = +((val / totalValue) * 100).toFixed(1);
  }
  if (cashPercent > 0) {
    sectorBreakdown["Cash"] = +cashPercent.toFixed(1);
  }

  const plans = getPlans(suggestedCashTarget, suggestedMaxPosition, sectorBreakdown);

  return {
    portfolioValue, cashBalance, cashPercent,
    sectorBreakdown, positionBreakdown: positionBreakdown.slice(0, 10),
    largestPositionPercent, largestSector, largestSectorPercent,
    volatility, concentrationWarnings, thematicWarnings,
    suggestedCashTarget, suggestedMaxPosition, plans,
  };
}

function getPlans(cashTarget: number, maxPos: number, sectors: Record<string, number>) {
  const defensiveSectors = ["Consumer Defensive", "Utilities", "Healthcare", "ETF-Broad"];
  const growthSectors = ["Technology", "Consumer Cyclical", "Communication"];

  const hasDefensive = Object.keys(sectors).some(s => defensiveSectors.includes(s));
  const deficitSectors = defensiveSectors.filter(s => !sectors[s] || sectors[s] < 5);

  return {
    conservative: {
      label: "Conservative",
      targetCash: Math.min(cashTarget + 8, 30),
      maxPosition: Math.max(maxPos - 3, 5),
      guidance: [
        `Increase cash buffer to ${Math.min(cashTarget + 8, 30)}%`,
        deficitSectors.length > 0
          ? `Add exposure to ${deficitSectors.slice(0, 2).join(", ")}`
          : "Maintain defensive allocation",
        `Cap any single position at ${Math.max(maxPos - 3, 5)}%`,
      ],
      buckets: { "Large Cap Value": 40, "Defensive": 30, "Fixed Income/Cash": 25, "Growth": 5 },
    },
    balanced: {
      label: "Balanced",
      targetCash: cashTarget,
      maxPosition: maxPos,
      guidance: [
        `Maintain cash at ${cashTarget}%`,
        "Add to underweight sectors for diversification",
        `Cap positions at ${maxPos}%`,
      ],
      buckets: { "Large Cap": 35, "Growth": 25, "Defensive": 20, "Cash": 15, "Speculative": 5 },
    },
    aggressive: {
      label: "Aggressive",
      targetCash: Math.max(cashTarget - 4, 3),
      maxPosition: Math.min(maxPos + 5, 25),
      guidance: [
        "Deploy cash into momentum sectors",
        `Allow concentration up to ${Math.min(maxPos + 5, 25)}%`,
        `Keep emergency buffer at ${Math.max(cashTarget - 4, 3)}%`,
      ],
      buckets: { "Growth": 40, "Large Cap": 25, "Speculative": 20, "Defensive": 10, "Cash": 5 },
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === "analyze") {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Get positions and accounts
      const [{ data: positions }, { data: accounts }] = await Promise.all([
        admin.from("broker_positions").select("*").eq("user_id", user.id),
        admin.from("broker_accounts").select("*").eq("user_id", user.id),
      ]);

      const totalCash = (accounts || []).reduce((sum: number, a: any) => sum + (a.cash || 0), 0);
      const totalInvested = (positions || []).reduce((sum: number, p: any) => {
        return sum + (p.market_value || p.quantity * (p.market_price || p.average_price || 0));
      }, 0);

      const result = generateAllocation(totalInvested, totalCash, positions || []);

      // Save snapshot
      await supabase.from("capital_allocation_snapshots").insert({
        user_id: user.id,
        portfolio_value: totalInvested + totalCash,
        cash_percent: result.cashPercent,
        largest_position_percent: result.largestPositionPercent,
        largest_sector_percent: result.largestSectorPercent,
        volatility_score: result.volatility.score,
        suggested_cash_target: result.suggestedCashTarget,
        suggested_max_position: result.suggestedMaxPosition,
        sector_breakdown: result.sectorBreakdown,
        deployment_guidance: result.plans,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "history") {
      const { data } = await supabase
        .from("capital_allocation_snapshots")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("Capital allocation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
