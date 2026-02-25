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

    // Fetch quote + chart data in parallel
    const [quoteRes, chartRes] = await Promise.all([
      fetch(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,summaryDetail,defaultKeyStatistics`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
      fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo`, {
        headers: { "User-Agent": "Mozilla/5.0" },
      }),
    ]);

    if (!quoteRes.ok || !chartRes.ok) {
      throw new Error(`Yahoo Finance API failed: quote=${quoteRes.status}, chart=${chartRes.status}`);
    }

    const [quoteData, chartData] = await Promise.all([quoteRes.json(), chartRes.json()]);

    const price = quoteData?.quoteSummary?.result?.[0]?.price;
    const summary = quoteData?.quoteSummary?.result?.[0]?.summaryDetail;
    const keyStats = quoteData?.quoteSummary?.result?.[0]?.defaultKeyStatistics;
    const chart = chartData?.chart?.result?.[0];

    const timestamps = chart?.timestamp || [];
    const closes = chart?.indicators?.quote?.[0]?.close || [];
    const opens = chart?.indicators?.quote?.[0]?.open || [];
    const highs = chart?.indicators?.quote?.[0]?.high || [];
    const lows = chart?.indicators?.quote?.[0]?.low || [];
    const volumes = chart?.indicators?.quote?.[0]?.volume || [];

    const chartPoints = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: closes[i] != null ? +closes[i].toFixed(2) : null,
      open: opens[i] != null ? +opens[i].toFixed(2) : null,
      high: highs[i] != null ? +highs[i].toFixed(2) : null,
      low: lows[i] != null ? +lows[i].toFixed(2) : null,
      close: closes[i] != null ? +closes[i].toFixed(2) : null,
      volume: volumes[i] != null ? Math.round(volumes[i] / 1_000_000) : 0,
    })).filter((p: any) => p.price !== null);

    const result = {
      symbol: price?.symbol || symbol,
      name: price?.shortName || price?.longName || symbol,
      price: price?.regularMarketPrice?.raw ?? 0,
      previousClose: price?.regularMarketPreviousClose?.raw ?? 0,
      change: price?.regularMarketChange?.raw ?? 0,
      changePercent: price?.regularMarketChangePercent?.raw ?? 0,
      open: price?.regularMarketOpen?.raw ?? 0,
      dayHigh: price?.regularMarketDayHigh?.raw ?? 0,
      dayLow: price?.regularMarketDayLow?.raw ?? 0,
      volume: price?.regularMarketVolume?.raw ?? 0,
      marketCap: price?.marketCap?.fmt ?? "N/A",
      peRatio: summary?.trailingPE?.fmt ?? keyStats?.trailingPE?.fmt ?? "N/A",
      fiftyTwoWeekHigh: summary?.fiftyTwoWeekHigh?.raw ?? 0,
      fiftyTwoWeekLow: summary?.fiftyTwoWeekLow?.raw ?? 0,
      avgVolume: summary?.averageVolume?.fmt ?? "N/A",
      dividendYield: summary?.dividendYield?.fmt ?? "N/A",
      beta: summary?.beta?.raw ?? keyStats?.beta?.raw ?? null,
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
