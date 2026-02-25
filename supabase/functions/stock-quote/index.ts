import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { symbol } = await req.json();
    if (!symbol) {
      return new Response(JSON.stringify({ error: "Symbol required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chartRes = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo&includePrePost=false`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    if (!chartRes.ok) {
      const txt = await chartRes.text();
      console.error("Chart API error:", chartRes.status, txt);
      throw new Error(`Chart API failed: ${chartRes.status}`);
    }

    const chartData = await chartRes.json();
    const chart = chartData?.chart?.result?.[0];
    const meta = chart?.meta || {};
    const timestamps = chart?.timestamp || [];
    const quote = chart?.indicators?.quote?.[0] || {};
    const closes = quote.close || [];
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const volumes = quote.volume || [];

    const chartPoints = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: closes[i] != null ? +closes[i].toFixed(2) : null,
      open: opens[i] != null ? +opens[i].toFixed(2) : null,
      high: highs[i] != null ? +highs[i].toFixed(2) : null,
      low: lows[i] != null ? +lows[i].toFixed(2) : null,
      close: closes[i] != null ? +closes[i].toFixed(2) : null,
      volume: volumes[i] != null ? Math.round(volumes[i] / 1_000_000) : 0,
    })).filter((p: any) => p.price !== null);

    // Extract price info from meta + last data points
    const lastClose = closes[closes.length - 1] ?? meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? (closes.length > 1 ? closes[closes.length - 2] : lastClose);
    const change = lastClose - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    // Compute stats from chart data
    const validHighs = highs.filter((v: number | null) => v != null);
    const validLows = lows.filter((v: number | null) => v != null);
    const dayHigh = validHighs.length ? validHighs[validHighs.length - 1] : lastClose;
    const dayLow = validLows.length ? validLows[validLows.length - 1] : lastClose;
    const dayOpen = opens.length ? opens[opens.length - 1] ?? lastClose : lastClose;
    const fiftyTwoWeekHigh = meta.fiftyTwoWeekHigh ?? (validHighs.length ? Math.max(...validHighs) : lastClose);
    const fiftyTwoWeekLow = meta.fiftyTwoWeekLow ?? (validLows.length ? Math.min(...validLows) : lastClose);

    const totalVolume = volumes.reduce((sum: number, v: number | null) => sum + (v || 0), 0);
    const avgVolume = volumes.length ? totalVolume / volumes.length : 0;

    const result = {
      symbol: meta.symbol || symbol,
      name: meta.shortName || meta.longName || symbol,
      price: +lastClose.toFixed(2),
      previousClose: +prevClose.toFixed(2),
      change: +change.toFixed(2),
      changePercent: +changePercent.toFixed(2),
      open: dayOpen != null ? +dayOpen.toFixed(2) : 0,
      dayHigh: dayHigh != null ? +dayHigh.toFixed(2) : 0,
      dayLow: dayLow != null ? +dayLow.toFixed(2) : 0,
      volume: volumes[volumes.length - 1] ?? 0,
      marketCap: "N/A",
      peRatio: "N/A",
      fiftyTwoWeekHigh: +fiftyTwoWeekHigh.toFixed(2),
      fiftyTwoWeekLow: +fiftyTwoWeekLow.toFixed(2),
      avgVolume: formatLargeNumber(Math.round(avgVolume)),
      dividendYield: "N/A",
      beta: null,
      chart: chartPoints,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-quote error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatLargeNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}
