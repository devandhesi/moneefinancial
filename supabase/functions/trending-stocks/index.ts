import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRENDING_SYMBOLS = [
  "AAPL", "NVDA", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "JPM", "JNJ", "UNH", "GS", "XOM",
  "V", "WMT", "PG", "MA", "HD", "DIS", "NFLX", "AMD"
];

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch each symbol's chart data (1d range) to get current price
    const results = await Promise.all(
      TRENDING_SYMBOLS.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`,
            { headers: { "User-Agent": "Mozilla/5.0" } }
          );
          if (!res.ok) return null;
          const data = await res.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) return null;
          const price = meta.regularMarketPrice ?? 0;
          const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
          const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          return {
            symbol,
            name: meta.shortName || meta.longName || symbol,
            price: +price.toFixed(2),
            change: +change.toFixed(2),
            sector: mapSector(symbol),
            marketCap: 0,
          };
        } catch {
          return null;
        }
      })
    );

    const stocks = results.filter(Boolean);

    return new Response(JSON.stringify({ stocks }), {
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
