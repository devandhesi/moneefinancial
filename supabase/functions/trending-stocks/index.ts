import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRENDING_SYMBOLS = [
  "AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "JPM", "JNJ", "UNH", "GS", "XOM",
  "V", "WMT", "PG", "MA", "HD", "DIS", "NFLX", "AMD"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const symbols = TRENDING_SYMBOLS.join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance quote failed: ${response.status}`);
    }

    const data = await response.json();
    const quotes = (data?.quoteResponse?.result || []).map((q: any) => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChangePercent != null ? +q.regularMarketChangePercent.toFixed(2) : 0,
      sector: q.sector || mapSector(q.symbol),
      marketCap: q.marketCap ?? 0,
    }));

    return new Response(JSON.stringify({ stocks: quotes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trending-stocks error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", stocks: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapSector(symbol: string): string {
  const sectorMap: Record<string, string> = {
    AAPL: "Technology", NVDA: "Technology", MSFT: "Technology", AMZN: "Technology",
    GOOGL: "Technology", META: "Technology", AMD: "Technology", NFLX: "Technology",
    TSLA: "Energy", XOM: "Energy",
    JPM: "Finance", GS: "Finance", V: "Finance", MA: "Finance",
    JNJ: "Healthcare", UNH: "Healthcare",
    WMT: "Consumer", PG: "Consumer", HD: "Consumer", DIS: "Consumer",
  };
  return sectorMap[symbol] || "Other";
}
