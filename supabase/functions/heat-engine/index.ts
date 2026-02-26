import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Default watchlist of popular tickers to scan
const DEFAULT_TICKERS = ["AAPL", "TSLA", "NVDA", "AMD", "META", "AMZN", "MSFT", "GOOGL", "SOFI", "PLTR", "GME", "AMC", "MARA", "COIN", "RIOT", "SPY", "QQQ", "SMCI", "ARM", "AVGO"];

function formatLargeNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function fetchYahooChart(symbol: string, range: string, interval: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    await res.text();
    throw new Error(`Yahoo API error for ${symbol}: ${res.status}`);
  }
  return await res.json();
}

function computeHeatScore(data3m: any, data1d: any, symbol: string) {
  const chart3m = data3m?.chart?.result?.[0];
  const chart1d = data1d?.chart?.result?.[0];
  const meta = chart3m?.meta || {};

  if (!chart3m || !chart1d) {
    return null;
  }

  const closes3m = (chart3m.indicators?.quote?.[0]?.close || []).filter((v: any) => v != null);
  const volumes3m = (chart3m.indicators?.quote?.[0]?.volume || []).filter((v: any) => v != null);
  const highs3m = (chart3m.indicators?.quote?.[0]?.high || []).filter((v: any) => v != null);
  const lows3m = (chart3m.indicators?.quote?.[0]?.low || []).filter((v: any) => v != null);

  const volumes1d = (chart1d.indicators?.quote?.[0]?.volume || []).filter((v: any) => v != null);

  if (closes3m.length < 20 || volumes3m.length < 20) return null;

  const price = closes3m[closes3m.length - 1];
  const prevClose = closes3m.length > 1 ? closes3m[closes3m.length - 2] : price;

  // --- Volume subscore (max 30) ---
  const avgVol30 = volumes3m.slice(-30).reduce((s: number, v: number) => s + v, 0) / Math.min(volumes3m.length, 30);
  const currentVol = volumes3m[volumes3m.length - 1] || 0;
  const volMultiple = avgVol30 > 0 ? currentVol / avgVol30 : 1;

  // Volume acceleration (last 3 sessions)
  const recentVols = volumes3m.slice(-3);
  const volAccelerating = recentVols.length >= 3 && recentVols[2] > recentVols[1] && recentVols[1] > recentVols[0];

  let volumeScore = 0;
  if (volMultiple >= 3) volumeScore += 25;
  else if (volMultiple >= 2) volumeScore += 18;
  else if (volMultiple >= 1.5) volumeScore += 12;
  else if (volMultiple >= 1.2) volumeScore += 6;
  if (volAccelerating) volumeScore += 5;
  volumeScore = Math.min(30, volumeScore);

  // --- Momentum subscore (max 20) ---
  const fiveDayReturn = closes3m.length >= 5 ? ((price - closes3m[closes3m.length - 6]) / closes3m[closes3m.length - 6]) * 100 : 0;
  const sma20 = closes3m.slice(-20).reduce((s: number, v: number) => s + v, 0) / 20;
  const aboveSma20 = price > sma20;

  // Range breakout
  const rangeHigh = Math.max(...closes3m.slice(-20));
  const nearBreakout = price >= rangeHigh * 0.98;

  let momentumScore = 0;
  if (fiveDayReturn > 10) momentumScore += 14;
  else if (fiveDayReturn > 5) momentumScore += 10;
  else if (fiveDayReturn > 2) momentumScore += 6;
  else if (fiveDayReturn > 0) momentumScore += 2;
  if (aboveSma20) momentumScore += 3;
  if (nearBreakout) momentumScore += 3;
  momentumScore = Math.min(20, momentumScore);

  // --- Volatility subscore (max 15) ---
  const ranges3m = highs3m.map((h: number, i: number) => lows3m[i] ? (h - lows3m[i]) / lows3m[i] * 100 : 0);
  const sortedRanges = [...ranges3m].sort((a, b) => a - b);
  const medianRange = sortedRanges[Math.floor(sortedRanges.length / 2)] || 0;
  const todayRange = ranges3m.length > 0 ? ranges3m[ranges3m.length - 1] : 0;
  const rangeExpansion = medianRange > 0 ? todayRange / medianRange : 1;

  // Volatility percentile
  const returns = closes3m.slice(1).map((c: number, i: number) => Math.abs((c - closes3m[i]) / closes3m[i]) * 100);
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const currentReturn = returns.length > 0 ? returns[returns.length - 1] : 0;
  const volPercentile = sortedReturns.length > 0 ? (sortedReturns.filter((r: number) => r <= currentReturn).length / sortedReturns.length) * 100 : 50;

  let volatilityScore = 0;
  if (rangeExpansion > 2) volatilityScore += 10;
  else if (rangeExpansion > 1.5) volatilityScore += 7;
  else if (rangeExpansion > 1) volatilityScore += 4;
  if (volPercentile > 80) volatilityScore += 5;
  else if (volPercentile > 60) volatilityScore += 3;
  volatilityScore = Math.min(15, volatilityScore);

  // --- Options subscore (max 15) -- simulated from volume patterns
  // Without real options data, estimate from volume spike patterns
  let optionsScore = 0;
  if (volMultiple > 2.5 && fiveDayReturn > 3) optionsScore += 10;
  else if (volMultiple > 1.8) optionsScore += 6;
  if (volAccelerating && volMultiple > 1.5) optionsScore += 5;
  optionsScore = Math.min(15, optionsScore);

  // --- Attention subscore (max 10) -- proxy from volume + price action
  let attentionScore = 0;
  if (volMultiple > 3 && Math.abs(fiveDayReturn) > 5) attentionScore += 8;
  else if (volMultiple > 2) attentionScore += 5;
  else if (volMultiple > 1.5) attentionScore += 2;
  if (nearBreakout) attentionScore += 2;
  attentionScore = Math.min(10, attentionScore);

  // --- Liquidity subscore (max 10) ---
  const marketCap = meta.marketCap || 0;
  const avgDollarVol = avgVol30 * price;
  let liquidityScore = 10; // start high, penalize illiquid

  if (marketCap < 300_000_000) liquidityScore -= 4; // small cap
  else if (marketCap < 2_000_000_000) liquidityScore -= 2;
  if (avgDollarVol < 5_000_000) liquidityScore -= 4;
  else if (avgDollarVol < 20_000_000) liquidityScore -= 2;
  liquidityScore = Math.max(0, Math.min(10, liquidityScore));

  const totalScore = Math.round(volumeScore + momentumScore + volatilityScore + optionsScore + attentionScore + liquidityScore);

  // --- Overheat detection ---
  let isOverheated = false;
  const rsi = computeRSI(closes3m);
  if (rsi > 80 && volMultiple > 2 && fiveDayReturn > 8) isOverheated = true;
  if (volMultiple > 3 && momentumScore < 5) isOverheated = true; // volume but no follow through

  // --- Stage ---
  let stage: string;
  if (isOverheated) stage = "overheated";
  else if (totalScore >= 70) stage = "breakout_watch";
  else if (totalScore >= 50) stage = "building_pressure";
  else if (totalScore >= 30) stage = "warming";
  else stage = "cold";

  // --- Confidence ---
  let confidence = 70; // base confidence with volume-only data
  if (volMultiple > 1) confidence += 10;
  if (closes3m.length >= 60) confidence += 10;
  // Lower confidence since we don't have real options/social data
  confidence -= 15;
  confidence = Math.max(20, Math.min(95, confidence));

  // --- Drivers ---
  const drivers: string[] = [];
  if (volumeScore >= 18) drivers.push(`Volume ${volMultiple.toFixed(1)}x above average`);
  if (momentumScore >= 10) drivers.push(`Strong 5-day return: ${fiveDayReturn > 0 ? "+" : ""}${fiveDayReturn.toFixed(1)}%`);
  if (volatilityScore >= 7) drivers.push(`Volatility expansion detected`);
  if (nearBreakout) drivers.push(`Near 20-day range breakout`);
  if (volAccelerating) drivers.push(`Volume accelerating over 3 sessions`);
  if (isOverheated) drivers.push(`Overheated — late stage participation risk`);
  if (rsi > 70) drivers.push(`RSI elevated at ${rsi.toFixed(0)}`);
  if (aboveSma20) drivers.push(`Trading above 20-day SMA`);

  return {
    symbol,
    heat_score: totalScore,
    stage,
    volume_subscore: volumeScore,
    momentum_subscore: momentumScore,
    volatility_subscore: volatilityScore,
    options_subscore: optionsScore,
    attention_subscore: attentionScore,
    liquidity_subscore: liquidityScore,
    confidence_level: confidence,
    drivers,
    detail: {
      price,
      change: +(price - prevClose).toFixed(2),
      changePercent: +((price - prevClose) / prevClose * 100).toFixed(2),
      volMultiple: +volMultiple.toFixed(2),
      fiveDayReturn: +fiveDayReturn.toFixed(2),
      rsi: +rsi.toFixed(1),
      sma20: +sma20.toFixed(2),
      rangeExpansion: +rangeExpansion.toFixed(2),
      volPercentile: +volPercentile.toFixed(0),
      marketCap: formatLargeNumber(marketCap),
      avgDollarVol: formatLargeNumber(avgDollarVol),
      name: meta.shortName || meta.longName || symbol,
    },
  };
}

function computeRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const delta = closes[i] - closes[i - 1];
    if (delta > 0) avgGain += delta;
    else avgLoss -= delta;
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const delta = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (delta > 0 ? delta : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (delta < 0 ? -delta : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const symbols: string[] = body.symbols || DEFAULT_TICKERS;
    const singleSymbol: string | null = body.symbol || null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If single symbol requested, check cache first
    if (singleSymbol) {
      const { data: cached } = await supabase
        .from("heat_engine_snapshots")
        .select("*")
        .eq("symbol", singleSymbol)
        .order("computed_at", { ascending: false })
        .limit(1);

      if (cached && cached.length > 0) {
        const age = Date.now() - new Date(cached[0].computed_at).getTime();
        if (age < 15 * 60 * 1000) {
          return new Response(JSON.stringify({ snapshots: cached }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Compute fresh
      const [data3m, data1d] = await Promise.all([
        fetchYahooChart(singleSymbol, "3mo", "1d"),
        fetchYahooChart(singleSymbol, "1d", "5m"),
      ]);

      const result = computeHeatScore(data3m, data1d, singleSymbol);
      if (result) {
        await supabase.from("heat_engine_snapshots").insert({
          symbol: result.symbol,
          heat_score: result.heat_score,
          stage: result.stage,
          volume_subscore: result.volume_subscore,
          momentum_subscore: result.momentum_subscore,
          volatility_subscore: result.volatility_subscore,
          options_subscore: result.options_subscore,
          attention_subscore: result.attention_subscore,
          liquidity_subscore: result.liquidity_subscore,
          confidence_level: result.confidence_level,
          drivers: result.drivers,
          detail: result.detail,
        });

        return new Response(JSON.stringify({ snapshots: [result] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ snapshots: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch mode: check cache for all symbols
    const { data: allCached } = await supabase
      .from("heat_engine_snapshots")
      .select("*")
      .in("symbol", symbols)
      .order("computed_at", { ascending: false });

    // Find latest per symbol
    const latestBySymbol: Record<string, any> = {};
    for (const row of allCached || []) {
      if (!latestBySymbol[row.symbol]) latestBySymbol[row.symbol] = row;
    }

    const stale: string[] = [];
    const fresh: any[] = [];
    const now = Date.now();

    for (const sym of symbols) {
      const cached = latestBySymbol[sym];
      if (cached && (now - new Date(cached.computed_at).getTime()) < 15 * 60 * 1000) {
        fresh.push(cached);
      } else {
        stale.push(sym);
      }
    }

    // Fetch stale in batches of 5 to avoid rate limits
    const results: any[] = [...fresh];
    for (let i = 0; i < stale.length; i += 5) {
      const batch = stale.slice(i, i + 5);
      const fetches = batch.map(async (sym) => {
        try {
          const [data3m, data1d] = await Promise.all([
            fetchYahooChart(sym, "3mo", "1d"),
            fetchYahooChart(sym, "1d", "5m"),
          ]);
          return computeHeatScore(data3m, data1d, sym);
        } catch (e) {
          console.error(`Failed to compute heat for ${sym}:`, e);
          return null;
        }
      });
      const batchResults = await Promise.all(fetches);
      for (const r of batchResults) {
        if (r) {
          results.push(r);
          // Store in DB
          await supabase.from("heat_engine_snapshots").insert({
            symbol: r.symbol,
            heat_score: r.heat_score,
            stage: r.stage,
            volume_subscore: r.volume_subscore,
            momentum_subscore: r.momentum_subscore,
            volatility_subscore: r.volatility_subscore,
            options_subscore: r.options_subscore,
            attention_subscore: r.attention_subscore,
            liquidity_subscore: r.liquidity_subscore,
            confidence_level: r.confidence_level,
            drivers: r.drivers,
            detail: r.detail,
          });
        }
      }
    }

    // Sort by heat score descending
    results.sort((a, b) => (b.heat_score || 0) - (a.heat_score || 0));

    return new Response(JSON.stringify({ snapshots: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("heat-engine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
