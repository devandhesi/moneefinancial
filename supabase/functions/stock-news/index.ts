import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string;
  relatedSymbols: string[];
  category?: string;
}

function parseRssItems(xml: string, defaultSource: string, symbols: string[]): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const items = xml.split("<item>").slice(1);
  for (const item of items.slice(0, 15)) {
    const getTag = (tag: string) => {
      const match = item.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "s"));
      return match?.[1]?.trim() || "";
    };
    const title = getTag("title");
    let link = getTag("link");
    if (!link) {
      const m = item.match(/<link\s*\/?>([^<\s]+)/);
      if (m) link = m[1];
    }
    if (!link) {
      const m = item.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<\]]+)/);
      if (m) link = m[1];
    }
    const description = getTag("description");
    const pubDate = getTag("pubDate");
    const source = getTag("source") || defaultSource;
    const author = getTag("dc:creator") || getTag("author") || getTag("media:credit") || "";

    if (title && link && link.startsWith("http")) {
      articles.push({
        title,
        summary: description.replace(/<[^>]*>/g, "").slice(0, 200),
        url: link,
        source,
        author,
        publishedAt: pubDate || new Date().toISOString(),
        relatedSymbols: symbols,
      });
    }
  }
  return articles;
}

async function fetchRss(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  if (!res.ok) return "";
  return res.text();
}

async function fetchSymbolNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const xml = await fetchRss(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`);
    return parseRssItems(xml, "Yahoo Finance", [symbol]);
  } catch { return []; }
}

async function fetchGeneralMarketNews(): Promise<NewsArticle[]> {
  const urls = [
    "https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US",
    "https://finance.yahoo.com/news/rssindex",
  ];
  const results: NewsArticle[] = [];
  for (const url of urls) {
    try {
      const xml = await fetchRss(url);
      results.push(...parseRssItems(xml, "Yahoo Finance", []));
    } catch {}
  }
  return results;
}

async function fetchSectorNews(sector: string): Promise<NewsArticle[]> {
  try {
    const query = encodeURIComponent(`${sector} stocks market`);
    const xml = await fetchRss(`https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`);
    const articles = parseRssItems(xml, "Google News", []);
    articles.forEach(a => a.category = sector);
    return articles;
  } catch { return []; }
}

// Trending tickers to fetch news for
const TRENDING_SYMBOLS = ["NVDA", "AAPL", "TSLA", "META", "AMZN", "MSFT", "AMD", "GOOG", "PLTR", "SMCI"];
const SECTORS = ["Technology", "Healthcare", "Energy", "Financials", "Consumer"];

async function aiEnrich(apiKey: string, articles: NewsArticle[]): Promise<void> {
  const needsEnrich = articles.filter(a => !a.summary || !a.author).slice(0, 20);
  if (needsEnrich.length === 0) return;
  try {
    const titles = needsEnrich.map((a, i) => `${i}: "${a.title}" (${a.source})`).join("\n");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: `For each numbered article, provide a 1-sentence summary and the likely author/journalist name. Return ONLY a JSON array: [{"i":0,"summary":"...","author":"Name"}]. If unknown author, use editorial team name like "Reuters Staff". No markdown.` },
          { role: "user", content: titles },
        ],
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const enrichments: { i: number; summary: string; author: string }[] = JSON.parse(jsonMatch[0]);
      for (const e of enrichments) {
        const article = needsEnrich[e.i];
        if (article) {
          if (!article.summary && e.summary) article.summary = e.summary;
          if (!article.author && e.author) article.author = e.author;
        }
      }
    }
  } catch {}
}

async function aiImpactAnalysis(apiKey: string, headlines: string[]): Promise<{ title: string; impact: string }[]> {
  if (headlines.length === 0) return [];
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: `Analyze stock market news headlines and explain market impact in 1 short sentence each. Return ONLY JSON array: [{"title":"headline","impact":"brief impact"}]. No markdown.` },
          { role: "user", content: `Analyze:\n- ${headlines.join("\n- ")}` },
        ],
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return [];
}

function dedup(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const holdings: string[] = body.holdings || [];
    const watchlist: string[] = body.watchlist || [];
    const trending: string[] = body.trending || TRENDING_SYMBOLS;

    // Fetch all categories in parallel
    const [generalNews, ...symbolResults] = await Promise.all([
      fetchGeneralMarketNews(),
      ...holdings.map(s => fetchSymbolNews(s)),
      ...watchlist.map(s => fetchSymbolNews(s)),
      ...trending.slice(0, 8).map(s => fetchSymbolNews(s)),
      ...SECTORS.map(s => fetchSectorNews(s)),
    ]);

    const holdingsCount = holdings.length;
    const watchlistCount = watchlist.length;
    const trendingCount = Math.min(trending.length, 8);

    const holdingsNews = dedup(symbolResults.slice(0, holdingsCount).flat());
    const watchlistNews = dedup(symbolResults.slice(holdingsCount, holdingsCount + watchlistCount).flat());
    const trendingNews = dedup(symbolResults.slice(holdingsCount + watchlistCount, holdingsCount + watchlistCount + trendingCount).flat());
    const sectorNews = dedup(symbolResults.slice(holdingsCount + watchlistCount + trendingCount).flat());
    const marketNews = dedup(generalNews);

    // AI enrichment + impact analysis in parallel
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const allArticles = [...holdingsNews, ...watchlistNews, ...trendingNews, ...sectorNews, ...marketNews];

    if (LOVABLE_API_KEY) {
      const topHeadlines = marketNews.slice(0, 5).map(n => n.title);
      const [, impactAnalysis] = await Promise.all([
        aiEnrich(LOVABLE_API_KEY, allArticles),
        aiImpactAnalysis(LOVABLE_API_KEY, topHeadlines),
      ]);

      return new Response(
        JSON.stringify({
          holdingsNews: holdingsNews.slice(0, 20),
          watchlistNews: watchlistNews.slice(0, 20),
          trendingNews: trendingNews.slice(0, 20),
          sectorNews: sectorNews.slice(0, 20),
          marketNews: marketNews.slice(0, 25),
          impactAnalysis,
          generatedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        holdingsNews: holdingsNews.slice(0, 20),
        watchlistNews: watchlistNews.slice(0, 20),
        trendingNews: trendingNews.slice(0, 20),
        sectorNews: sectorNews.slice(0, 20),
        marketNews: marketNews.slice(0, 25),
        impactAnalysis: [],
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("stock-news error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
