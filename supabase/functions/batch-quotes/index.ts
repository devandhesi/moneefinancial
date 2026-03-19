import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map symbols to Yahoo tickers
const mapSymbol = (s: string): string => {
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
  // Commodities
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

interface QuoteResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  sparkline: number[];
}

async function fetchQuote(rawSymbol: string): Promise<QuoteResult | null> {
  try {
    const yahooSymbol = mapSymbol(rawSymbol);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=3mo&includePrePost=false`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const chart = data?.chart?.result?.[0];
    if (!chart) return null;

    const meta = chart.meta || {};
    const quotes = chart.indicators?.quote?.[0] || {};
    const closes = (quotes.close || []).filter((v: number | null) => v != null);
    const highs = (quotes.high || []).filter((v: number | null) => v != null);
    const lows = (quotes.low || []).filter((v: number | null) => v != null);
    const volumes = (quotes.volume || []).filter((v: number | null) => v != null);

    const price = meta.regularMarketPrice ?? (closes.length ? closes[closes.length - 1] : 0);
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    const totalVol = volumes.reduce((s: number, v: number) => s + v, 0);

    // Build sparkline from all intraday closes for accuracy
    const sparkline: number[] = closes.map((v: number) => +v.toFixed(2));

    return {
      symbol: rawSymbol.toUpperCase(),
      name: meta.shortName || meta.longName || rawSymbol,
      price: +price.toFixed(2),
      change: +change.toFixed(2),
      changePercent: +changePercent.toFixed(2),
      volume: totalVol,
      marketCap: meta.marketCap || 0,
      dayHigh: highs.length ? +Math.max(...highs).toFixed(2) : +price.toFixed(2),
      dayLow: lows.length ? +Math.min(...lows).toFixed(2) : +price.toFixed(2),
      previousClose: +prevClose.toFixed(2),
      sparkline,
    };
  } catch (e) {
    console.error(`Failed to fetch ${rawSymbol}:`, e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const symbols: string[] = body.symbols || [];

    if (!symbols.length) {
      return new Response(JSON.stringify({ quotes: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all in parallel (cap at 50 to avoid abuse)
    const batch = symbols.slice(0, 50);
    const results = await Promise.all(batch.map(fetchQuote));
    const quotes = results.filter(Boolean);

    return new Response(JSON.stringify({ quotes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("batch-quotes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", quotes: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
