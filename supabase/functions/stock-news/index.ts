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
  thumbnail?: string;
}

async function fetchYahooNews(symbol?: string): Promise<NewsArticle[]> {
  try {
    const endpoint = symbol
      ? `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
      : null;

    // Use Yahoo RSS feed for news
    const rssUrl = symbol
      ? `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`
      : `https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US`;

    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const articles: NewsArticle[] = [];

    // Simple XML parsing for RSS items
    const items = xml.split("<item>").slice(1);
    for (const item of items.slice(0, 10)) {
      const getTag = (tag: string) => {
        const match = item.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "s"));
        return match?.[1]?.trim() || "";
      };

      const title = getTag("title");
      const link = getTag("link");
      const description = getTag("description");
      const pubDate = getTag("pubDate");
      const source = getTag("source") || "Yahoo Finance";
      // Extract author from dc:creator, author, or credit tags
      const author = getTag("dc:creator") || getTag("author") || getTag("media:credit") || "";

      if (title && link) {
        articles.push({
          title,
          summary: description.replace(/<[^>]*>/g, "").slice(0, 200),
          url: link,
          source,
          author,
          publishedAt: pubDate || new Date().toISOString(),
          relatedSymbols: symbol ? [symbol] : [],
        });
      }
    }

    return articles;
  } catch (e) {
    console.error(`Error fetching news for ${symbol || "general"}:`, e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const holdings: string[] = body.holdings || ["AAPL", "MSFT", "GOOGL", "TSLA"];

    // Fetch news for each holding + general market news in parallel
    const [generalNews, ...holdingNews] = await Promise.all([
      fetchYahooNews(), // General market news
      ...holdings.map((s) => fetchYahooNews(s)),
    ]);

    // Deduplicate holding news
    const seenUrls = new Set<string>();
    const yourNews: NewsArticle[] = [];
    for (const articles of holdingNews) {
      for (const a of articles) {
        if (!seenUrls.has(a.url)) {
          seenUrls.add(a.url);
          yourNews.push(a);
        }
      }
    }

    // Deduplicate general news (exclude already shown in holdings)
    const marketNews: NewsArticle[] = [];
    for (const a of generalNews) {
      if (!seenUrls.has(a.url)) {
        seenUrls.add(a.url);
        marketNews.push(a);
      }
    }

    // Generate AI impact analysis for top market stories
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let impactAnalysis: { title: string; impact: string }[] = [];

    if (LOVABLE_API_KEY && marketNews.length > 0) {
      try {
        const topHeadlines = marketNews.slice(0, 5).map((n) => n.title).join("\n- ");
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `You analyze stock market news headlines and explain their market impact in 1 short sentence each. Return ONLY a JSON array like: [{"title":"headline","impact":"brief impact"}]. No markdown, no code blocks, just raw JSON.`,
              },
              {
                role: "user",
                content: `Analyze these headlines:\n- ${topHeadlines}`,
              },
            ],
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData?.choices?.[0]?.message?.content || "";
          // Try to parse JSON from the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            impactAnalysis = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        console.error("AI impact analysis failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        yourNews: yourNews.slice(0, 15),
        marketNews: marketNews.slice(0, 20),
        impactAnalysis,
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
