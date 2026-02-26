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
    // Use multiple RSS sources for better coverage
    const urls: string[] = [];
    if (symbol) {
      urls.push(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`);
    } else {
      // General market news — use multiple category feeds for reliability
      urls.push(
        "https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US",
        "https://finance.yahoo.com/news/rssindex",
      );
    }

    const allArticles: NewsArticle[] = [];
    const seenTitles = new Set<string>();

    for (const rssUrl of urls) {
      try {
        const res = await fetch(rssUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        });
        if (!res.ok) continue;

        const xml = await res.text();
        const items = xml.split("<item>").slice(1);
        for (const item of items.slice(0, 12)) {
          const getTag = (tag: string) => {
            const match = item.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "s"));
            return match?.[1]?.trim() || "";
          };

          const title = getTag("title");
          // <link> in RSS can be tricky — try tag content first, then standalone URL after closing tags
          let link = getTag("link");
          if (!link) {
            const linkMatch = item.match(/<link\s*\/?>([^<\s]+)/);
            if (linkMatch) link = linkMatch[1];
          }
          if (!link) {
            const guidMatch = item.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<\]]+)/);
            if (guidMatch) link = guidMatch[1];
          }
          const description = getTag("description");
          const pubDate = getTag("pubDate");
          const source = getTag("source") || "Yahoo Finance";
          const author = getTag("dc:creator") || getTag("author") || getTag("media:credit") || "";

          if (title && link && link.startsWith("http") && !seenTitles.has(title)) {
            seenTitles.add(title);
            allArticles.push({
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
      } catch (e) {
        console.error(`RSS fetch error for ${rssUrl}:`, e);
      }
    }

    return allArticles;
  } catch (e) {
    console.error(`Error fetching news for ${symbol || "general"}:`, e);
    return [];
  }
}

// Fallback: generate market news via AI if RSS fails
async function generateMarketNews(apiKey: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a financial news aggregator. Return ONLY a JSON array of 8 current market news items. Each item: {"title":"headline","summary":"2 sentence summary","source":"publication name","author":"journalist name","url":"https://...","publishedAt":"ISO date","relatedSymbols":["SYM"]}. Use real, factual, recent market events from today. Include real journalist names and publication sources. No markdown, just raw JSON array.`,
          },
          {
            role: "user",
            content: `What are the top market news stories right now? Date: ${new Date().toISOString().split("T")[0]}`,
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
    console.error("AI market news fallback failed:", e);
  }
  return [];
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

    // If market news is empty, use AI fallback
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (marketNews.length === 0 && LOVABLE_API_KEY) {
      const aiNews = await generateMarketNews(LOVABLE_API_KEY);
      marketNews.push(...aiNews);
    }

    // Run enrichment and impact analysis in parallel
    const allNews = [...yourNews, ...marketNews];
    const needsEnrichment = allNews.filter(a => !a.summary || !a.author);

    const enrichmentPromise = (LOVABLE_API_KEY && needsEnrichment.length > 0) ? (async () => {
      try {
        const titles = needsEnrichment.slice(0, 15).map((a, i) => `${i}: "${a.title}" (${a.source})`).join("\n");
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
                content: `For each numbered article, provide a 1-sentence summary and the likely author/journalist name based on the source publication. Return ONLY a JSON array: [{"i":0,"summary":"...","author":"Name"}]. If you don't know the author, use the publication's editorial team name like "Reuters Staff" or "Bloomberg News". No markdown.`,
              },
              { role: "user", content: titles },
            ],
          }),
        });
        if (enrichRes.ok) {
          const enrichData = await enrichRes.json();
          const content = enrichData?.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const enrichments: { i: number; summary: string; author: string }[] = JSON.parse(jsonMatch[0]);
            for (const e of enrichments) {
              const article = needsEnrichment[e.i];
              if (article) {
                if (!article.summary && e.summary) article.summary = e.summary;
                if (!article.author && e.author) article.author = e.author;
              }
            }
          }
        }
      } catch (e) {
        console.error("AI enrichment failed:", e);
      }
    })() : Promise.resolve();

    const impactPromise = (LOVABLE_API_KEY && marketNews.length > 0) ? (async () => {
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
              { role: "user", content: `Analyze these headlines:\n- ${topHeadlines}` },
            ],
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData?.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("AI impact analysis failed:", e);
      }
      return [];
    })() : Promise.resolve([]);

    const [, impactAnalysis] = await Promise.all([enrichmentPromise, impactPromise]);

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
