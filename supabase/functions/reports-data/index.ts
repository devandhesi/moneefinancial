import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface InsiderReport {
  insider: string;
  company: string;
  symbol: string;
  transactionType: string; // "Purchase" | "Sale" | "Grant" etc.
  shares: number;
  price: number;
  value: number;
  date: string;
  source: string;
  url: string;
}

interface NewsItem {
  title: string;
  summary: string;
  author: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

// Fetch SEDI-style insider trading data via multiple RSS/news sources
async function fetchInsiderReports(symbols?: string[]): Promise<InsiderReport[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return [];

  const symbolList = symbols?.length ? symbols.join(", ") : "major Canadian and US stocks (TSX, NYSE, NASDAQ)";
  const today = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a financial data aggregator specializing in SEDI (System for Electronic Disclosure by Insiders) and SEC insider trading filings. Return ONLY a JSON array of the most recent real insider transactions for ${symbolList}. Each item must have: {"insider":"Full Name, Title","company":"Company Name","symbol":"TICKER","transactionType":"Purchase|Sale|Grant|Exercise","shares":number,"price":number,"value":number,"date":"YYYY-MM-DD","source":"SEDI|SEC Form 4|TMX","url":"https://..."}. Use REAL, FACTUAL, VERIFIED insider transactions from public filings. Include the insider's actual title (CEO, CFO, Director, etc). Return 10-15 items. No markdown.`,
          },
          {
            role: "user",
            content: `What are the most recent SEDI and SEC insider trading filings as of ${today}? Include both Canadian (TSX/TSXV) and US (NYSE/NASDAQ) insider transactions.`,
          },
        ],
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Insider reports fetch failed:", e);
  }
  return [];
}

// Fetch StockWatch-style data: who's buying what, volume spikes, notable activity
async function fetchStockWatchData(): Promise<any[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return [];

  const today = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a StockWatch market surveillance analyst. Return ONLY a JSON array of notable stock activity including institutional buying/selling, unusual volume, block trades, and significant insider moves. Each item: {"symbol":"TICKER","company":"Name","activity":"Institutional Buy|Insider Purchase|Block Trade|Unusual Volume|Short Selling","actor":"Fund/Person Name","details":"Brief description of the activity","volume":number,"priceChange":number,"date":"YYYY-MM-DD","significance":"high|medium|low","source":"StockWatch|MarketBeat|Finviz|WhaleWisdom"}. Return 12-15 real, factual items from today and recent days. No markdown.`,
          },
          {
            role: "user",
            content: `What are today's most notable stock market activities and who is buying/selling? Date: ${today}. Include institutional moves, insider trades, unusual volume, and significant block trades across TSX, NYSE, and NASDAQ.`,
          },
        ],
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("StockWatch fetch failed:", e);
  }
  return [];
}

// Fetch market news from RSS feeds with proper attribution
async function fetchMarketNews(): Promise<NewsItem[]> {
  const articles: NewsItem[] = [];
  const seenTitles = new Set<string>();

  const feeds = [
    { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US", category: "Markets" },
    { url: "https://news.google.com/rss/search?q=stock+market+insider+trading&hl=en-US&gl=US&ceid=US:en", category: "Insider Trading" },
    { url: "https://news.google.com/rss/search?q=SEDI+insider+filing+Canada&hl=en-CA&gl=CA&ceid=CA:en", category: "SEDI Filings" },
    { url: "https://news.google.com/rss/search?q=SEC+form+4+insider+transaction&hl=en-US&gl=US&ceid=US:en", category: "SEC Filings" },
  ];

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const res = await fetch(feed.url, { headers: { "User-Agent": UA } });
        if (!res.ok) return [];
        const xml = await res.text();
        const items = xml.split("<item>").slice(1, 10);
        const parsed: NewsItem[] = [];

        for (const item of items) {
          const getTag = (tag: string) => {
            const match = item.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "s"));
            return match?.[1]?.trim() || "";
          };

          const title = getTag("title");
          let link = getTag("link");
          if (!link) {
            const linkMatch = item.match(/<link\s*\/?>([^<\s]+)/);
            if (linkMatch) link = linkMatch[1];
          }
          if (!link) {
            const guidMatch = item.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<\]]+)/);
            if (guidMatch) link = guidMatch[1];
          }
          const desc = getTag("description").replace(/<[^>]*>/g, "").slice(0, 250);
          const pubDate = getTag("pubDate");
          const source = getTag("source") || "Google News";
          const author = getTag("dc:creator") || getTag("author") || "";

          if (title && link && link.startsWith("http") && !seenTitles.has(title)) {
            seenTitles.add(title);
            parsed.push({
              title,
              summary: desc,
              author: author || source,
              source,
              url: link,
              publishedAt: pubDate || new Date().toISOString(),
              category: feed.category,
            });
          }
        }
        return parsed;
      } catch {
        return [];
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") articles.push(...r.value);
  }

  // Enrich missing authors/summaries via AI
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const needsEnrich = articles.filter(a => !a.summary || a.author === a.source);
  if (LOVABLE_API_KEY && needsEnrich.length > 0) {
    try {
      const titles = needsEnrich.slice(0, 12).map((a, i) => `${i}: "${a.title}" (${a.source})`).join("\n");
      const enrichRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `For each numbered article, provide a 1-sentence summary and the likely author/journalist. Return ONLY a JSON array: [{"i":0,"summary":"...","author":"Name"}]. Use real journalist names when possible. No markdown.`,
            },
            { role: "user", content: titles },
          ],
        }),
      });
      if (enrichRes.ok) {
        const d = await enrichRes.json();
        const content = d?.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const enrichments: { i: number; summary: string; author: string }[] = JSON.parse(jsonMatch[0]);
          for (const e of enrichments) {
            const a = needsEnrich[e.i];
            if (a) {
              if ((!a.summary || a.summary.length < 10) && e.summary) a.summary = e.summary;
              if (a.author === a.source && e.author) a.author = e.author;
            }
          }
        }
      }
    } catch (e) {
      console.error("News enrichment failed:", e);
    }
  }

  return articles;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const symbols: string[] = body.symbols || [];
    const section: string = body.section || "all"; // "news" | "sedi" | "stockwatch" | "all"

    const promises: Promise<any>[] = [];

    if (section === "all" || section === "news") promises.push(fetchMarketNews());
    else promises.push(Promise.resolve([]));

    if (section === "all" || section === "sedi") promises.push(fetchInsiderReports(symbols));
    else promises.push(Promise.resolve([]));

    if (section === "all" || section === "stockwatch") promises.push(fetchStockWatchData());
    else promises.push(Promise.resolve([]));

    const [news, insiderReports, stockWatch] = await Promise.all(promises);

    return new Response(
      JSON.stringify({
        news,
        insiderReports,
        stockWatch,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("reports-data error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
