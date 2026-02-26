import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map frontend range keys to Yahoo Finance params
const rangeMap: Record<string, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "1W": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1d" },
  "3M": { range: "3mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  "ALL": { range: "max", interval: "1wk" },
};

// Helper to map crypto/commodity symbols to Yahoo tickers if needed
const mapSymbol = (s: string) => {
  const sym = s.toUpperCase();
  // Crypto
  if (sym === "BTC") return "BTC-USD";
  if (sym === "ETH") return "ETH-USD";
  if (sym === "SOL") return "SOL-USD";
  if (sym === "BNB") return "BNB-USD";
  if (sym === "XRP") return "XRP-USD";
  if (sym === "ADA") return "ADA-USD";
  if (sym === "AVAX") return "AVAX-USD";
  if (sym === "DOGE") return "DOGE-USD";
  if (sym === "DOT") return "DOT-USD";
  if (sym === "LINK") return "LINK-USD";
  // Commodities (Futures)
  if (sym === "GC" || sym === "GOLD") return "GC=F";
  if (sym === "SI" || sym === "SILVER") return "SI=F";
  if (sym === "CL" || sym === "OIL") return "CL=F";
  if (sym === "NG" || sym === "NATGAS") return "NG=F";
  if (sym === "HG" || sym === "COPPER") return "HG=F";
  if (sym === "PL" || sym === "PLATINUM") return "PL=F";
  if (sym === "ZW" || sym === "WHEAT") return "ZW=F";
  if (sym === "ZC" || sym === "CORN") return "ZC=F";
  return sym;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const rawSymbol = body.symbol;
    const timeRange = body.range || "3M";

    if (!rawSymbol) {
      return new Response(JSON.stringify({ error: "Symbol required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const symbol = mapSymbol(rawSymbol);
    const params = rangeMap[timeRange] || rangeMap["3M"];

    const chartRes = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${params.interval}&range=${params.range}&includePrePost=false`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    if (!chartRes.ok) {
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

    const isIntraday = params.interval !== "1d" && params.interval !== "1wk" && params.interval !== "1mo";

    const chartPoints = timestamps.map((ts: number, i: number) => {
      const d = new Date(ts * 1000);
      let dateStr: string;
      if (isIntraday) {
        dateStr = d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
      } else if (params.interval === "1wk") {
        dateStr = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      } else {
        dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return {
        date: dateStr,
        timestamp: ts,
        price: closes[i] != null ? +closes[i].toFixed(2) : null,
        open: opens[i] != null ? +opens[i].toFixed(2) : null,
        high: highs[i] != null ? +highs[i].toFixed(2) : null,
        low: lows[i] != null ? +lows[i].toFixed(2) : null,
        close: closes[i] != null ? +closes[i].toFixed(2) : null,
        volume: volumes[i] != null ? volumes[i] : 0,
      };
    }).filter((p: any) => p.price !== null);

    const lastClose = closes[closes.length - 1] ?? meta.regularMarketPrice ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? (closes.length > 1 ? closes[closes.length - 2] : lastClose);
    const change = lastClose - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

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
      marketCap: meta.marketCap ? formatLargeNumber(meta.marketCap) : "N/A",
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
