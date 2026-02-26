import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractTickers(text: string): string[] {
  const upper = (text || "").toUpperCase();

  const stopWords = new Set([
    "I","A","AM","AN","AS","AT","BE","BY","DO","GO","HE","IF","IN","IS","IT","ME","MY","NO","OF","OH","OK","ON","OR","OUR","SO","TO","UP","US","WE",
    "ADD","ALL","AND","ANY","ARE","ASK","BIG","BUT","BUY","CAN","DAY","DID","END","FAR","FEW","FOR","GET","GOT","HAS","HAD","HER","HIM","HIS","HOW","ITS","LET","LOT","MAY","NEW","NOT","NOW","OLD","ONE","OUT","OWN","PUT","RAN","RUN","SAY","SET","SHE","THE","TOO","TOP","TRY","TWO","USE","WAS","WAY","WHO","WHY","WIN","WON","YES","YET","YOU",
    "ALSO","BEEN","BEST","BOTH","CAME","COME","DOES","DONE","DOWN","EACH","EVEN","FIND","FROM","GAVE","GIVE","GOES","GOOD","GROW","HAVE","HEAD","HELP","HERE","HIGH","HOLD","HOME","INTO","JUST","KEEP","KIND","KNOW","LAST","LEFT","LIKE","LINE","LIST","LONG","LOOK","MADE","MAIN","MAKE","MANY","MORE","MOST","MUCH","MUST","NAME","NEAR","NEED","NEXT","ONLY","OPEN","OVER","PART","PLAY","REAL","RISK","RIGHT","SAID","SAME","SELL","SHOW","SIDE","SOME","SUCH","SURE","TAKE","TELL","THAN","THAT","THEM","THEN","THEY","THIS","TIME","TURN","VERY","WANT","WELL","WENT","WERE","WHAT","WHEN","WILL","WITH","WORK","YEAR","YOUR",
    "ABOUT","AFTER","BEING","BELOW","COULD","EVERY","FIRST","GREAT","LARGE","MIGHT","NEVER","OTHER","POINT","RIGHT","SHALL","SINCE","SMALL","STILL","STOCK","THEIR","THERE","THESE","THINK","THREE","TODAY","UNDER","UNTIL","USING","WHICH","WHILE","WORLD","WOULD","PRICE","SHARE","WORTH","TREND","TRADE","CLOSE","CHART","WATCH","AVOID","TRACK","START","SHORT",
    "ETF","CEO","CFO","IPO","SEC","GDP","CPI","FED","USD","CAD",
  ]);

  const found: string[] = [];
  for (const m of upper.matchAll(/\$([A-Z]{1,5})(?:\.([A-Z]{1,3}))?\b/g)) {
    const base = m[1];
    const t = m[2] ? `${base}.${m[2]}` : base;
    if (!stopWords.has(base)) found.push(t);
  }
  for (const m of upper.matchAll(/\b([A-Z]{1,5})\.([A-Z]{1,3})\b/g)) {
    const base = m[1];
    if (!stopWords.has(base)) found.push(`${base}.${m[2]}`);
  }
  for (const m of upper.matchAll(/\b([A-Z]{1,5})\b/g)) {
    const t = m[1];
    if (!stopWords.has(t)) found.push(t);
  }

  const unique: string[] = [];
  for (const t of found) {
    if (!unique.includes(t)) unique.push(t);
    if (unique.length >= 5) break;
  }
  return unique;
}

function fmt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  return n.toFixed(2);
}

function fmtLarge(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function fetchQuote(symbol: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    if (!res.ok) { await res.text().catch(() => null); return null; }
    const data = await res.json();
    const chart = data?.chart?.result?.[0];
    if (!chart) return null;

    const meta = chart.meta || {};
    const closes = chart.indicators?.quote?.[0]?.close || [];
    const volumes = chart.indicators?.quote?.[0]?.volume || [];
    const price = meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    const validCloses = closes.filter((c: number | null) => c != null);
    const fiveDayStart = validCloses.length ? validCloses[0] : price;
    const fiveDayChange = fiveDayStart ? ((price - fiveDayStart) / fiveDayStart) * 100 : 0;
    const avgVol = volumes.length ? volumes.reduce((s: number, v: number | null) => s + (v || 0), 0) / volumes.length : 0;

    return [
      `${meta.symbol || symbol} (${meta.shortName || meta.longName || symbol})`,
      `  Price: $${fmt(price)} | Change: ${change >= 0 ? "+" : ""}${fmt(change)} (${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%)`,
      `  5-Day Trend: ${fiveDayChange >= 0 ? "+" : ""}${fiveDayChange.toFixed(2)}%`,
      `  Prev Close: $${fmt(prevClose)} | Day Range: $${fmt(meta.regularMarketDayLow)}–$${fmt(meta.regularMarketDayHigh)}`,
      `  52W Range: $${fmt(meta.fiftyTwoWeekLow)}–$${fmt(meta.fiftyTwoWeekHigh)}`,
      `  Avg Volume: ${fmtLarge(Math.round(avgVol))}`,
      `  Market Cap: ${meta.marketCap ? fmtLarge(meta.marketCap) : "N/A"}`,
      `  Exchange: ${meta.exchangeName || "N/A"} | Currency: ${meta.currency || "USD"}`,
    ].join("\n");
  } catch (e) {
    console.error(`Failed to fetch quote for ${symbol}:`, e);
    return null;
  }
}

async function fetchNews(symbol: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const items = xml.split("<item>").slice(1, 6);
    const headlines: string[] = [];
    for (const item of items) {
      const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s);
      const title = titleMatch?.[1]?.trim();
      const pubDate = dateMatch?.[1]?.trim();
      if (title) {
        const ago = pubDate ? ` (${new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })})` : "";
        headlines.push(`  • ${title}${ago}`);
      }
    }
    return headlines.length ? `Recent headlines for ${symbol}:\n${headlines.join("\n")}` : null;
  } catch (e) {
    console.error(`Failed to fetch news for ${symbol}:`, e);
    return null;
  }
}

// ── Web Search via AI Gateway ────────────────────────────

async function classifyNeedsWebSearch(userMessage: string, apiKey: string): Promise<{ needsSearch: boolean; searchQuery: string }> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You classify whether a user message requires a real-time web search to answer properly. Output ONLY valid JSON.
If the question is about current events, recent news, politics, legislation, regulatory changes, economic developments, earnings results, IPOs, mergers, geopolitical events, or anything requiring information from the last few days/weeks, output:
{"needsSearch": true, "searchQuery": "<optimized search query for financial/market impact>"}

If the question is a general knowledge question, stock analysis using existing data, or investing education, output:
{"needsSearch": false, "searchQuery": ""}

Always bias toward searching if uncertain. Frame search queries to find financial/market impact.`
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0,
      }),
    });

    if (!res.ok) return { needsSearch: false, searchQuery: "" };
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { needsSearch: !!parsed.needsSearch, searchQuery: parsed.searchQuery || userMessage };
    }
  } catch (e) {
    console.error("classify error:", e);
  }
  return { needsSearch: false, searchQuery: "" };
}

async function webSearch(query: string): Promise<string> {
  const results: string[] = [];

  // 1. Google News RSS
  try {
    const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " financial market")}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(googleNewsUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const xml = await res.text();
      const items = xml.split("<item>").slice(1, 8);
      for (const item of items) {
        const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s);
        const sourceMatch = item.match(/<source[^>]*>(.*?)<\/source>/s);
        const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/s);
        const title = titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim();
        const pubDate = dateMatch?.[1]?.trim();
        const source = sourceMatch?.[1]?.replace(/<[^>]+>/g, "").trim();
        const desc = descMatch?.[1]?.replace(/<[^>]+>/g, "").trim();
        if (title) {
          const dateStr = pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
          results.push(`• ${title}${source ? ` — ${source}` : ""}${dateStr ? ` (${dateStr})` : ""}${desc ? `\n  ${desc.slice(0, 200)}` : ""}`);
        }
      }
    }
  } catch (e) {
    console.error("Google News RSS error:", e);
  }

  // 2. Yahoo Finance general news RSS
  try {
    const yahooUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(query)}&region=US&lang=en-US`;
    const res = await fetch(yahooUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const xml = await res.text();
      const items = xml.split("<item>").slice(1, 6);
      for (const item of items) {
        const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
        const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/s);
        const title = titleMatch?.[1]?.trim();
        const pubDate = dateMatch?.[1]?.trim();
        if (title && !results.some(r => r.includes(title))) {
          const dateStr = pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
          results.push(`• ${title}${dateStr ? ` (${dateStr})` : ""}`);
        }
      }
    }
  } catch (e) {
    console.error("Yahoo RSS error:", e);
  }

  if (results.length === 0) return "";
  return `## WEB SEARCH RESULTS for "${query}"\n\n${results.join("\n\n")}`;
}

// ── system prompt ────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are Maven inside Monee, a stocks and investing only assistant.

SCOPE LOCK
- You only discuss: stocks, ETFs, indices, sectors, earnings, valuation, macro, portfolio construction, risk, trading mechanics, investing psychology, and financial/economic news that affects markets.
- Political, legislative, and geopolitical events are IN SCOPE when the user asks about their market or economic impact.
- If a user asks anything completely unrelated to investing or markets, respond with 1 sentence redirecting back to investing.

TICKER HANDLING
- Detect tickers in formats like NVDA, TSLA, SHOP.TO, SMN.V, KCP.V, and $TICKER.
- If the user says it, that, this, they, assume they refer to the most recently mentioned ticker.

LIVE DATA RULES
- You may receive LIVE MARKET DATA, RECENT NEWS, and WEB SEARCH RESULTS blocks below.
- If live data is provided, you MUST use those exact numbers. Do NOT invent prices, percent changes, market cap, or ranges.
- If web search results are provided, synthesize them into a clear, sourced analysis. Reference the sources. Connect news to market impact.
- If no data is available, acknowledge it and give your best analysis based on general knowledge.

WEB SEARCH ANALYSIS
- When web search results are provided, your job is to:
  1. Summarize the key findings clearly
  2. Explain the market/financial impact
  3. Connect to specific stocks, sectors, or asset classes affected
  4. Provide actionable takeaways for investors
- Always cite which sources you're drawing from
- Be clear about what is fact (from sources) vs your analysis

STYLE
- Short paragraphs (2 to 3 sentences max)
- Use **bold** for tickers and key numbers
- Use bullet points and section headers
- Direct tone, no guarantees
- End with a clear next step
- Keep under 300 words unless the topic warrants more detail

WHEN USER ASKS ABOUT A STOCK
Use this structure:

## {TICKER} — {Company Name}

**Price & Trend**
Use exact live price, change, and 5 day trend from the LIVE MARKET DATA block if present.

**What to Watch**
3 to 6 concrete things to watch next.

**Risk Check**
Call out the biggest risks.

**Maven's Take**
Choose one: Buy, Hold, Trim, Avoid.
One line rationale.

End with:
Educational analysis only, not financial advice.`;

// ── main ─────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Extract the latest user message
    const latestUserMsg = [...(messages || [])].reverse().find((m: any) => m?.role === "user");
    const latestText = String(latestUserMsg?.content || "");

    // Extract tickers from recent context
    const recentText = (messages || [])
      .slice(-4)
      .filter((m: any) => m?.role === "user")
      .map((m: any) => String(m?.content || ""))
      .join(" ");
    const tickers = extractTickers(recentText);

    // Run web search classification AND ticker data fetch in parallel
    const [searchClassification, quotes, newsResults] = await Promise.all([
      classifyNeedsWebSearch(latestText, LOVABLE_API_KEY),
      tickers.length > 0 ? Promise.all(tickers.map(fetchQuote)) : Promise.resolve([]),
      tickers.length > 0 ? Promise.all(tickers.map(fetchNews)) : Promise.resolve([]),
    ]);

    // Build context blocks
    let contextBlock = "";

    // Market data
    const validQuotes = (quotes as (string | null)[]).filter(Boolean) as string[];
    const validNews = (newsResults as (string | null)[]).filter(Boolean) as string[];
    if (validQuotes.length > 0) {
      contextBlock += `\n\n## LIVE MARKET DATA (as of ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET)\n\n` + validQuotes.join("\n\n");
    }
    if (validNews.length > 0) {
      contextBlock += `\n\n## RECENT NEWS\n\n` + validNews.join("\n\n");
    }

    // Web search if needed
    if (searchClassification.needsSearch && searchClassification.searchQuery) {
      console.log("Web search triggered for:", searchClassification.searchQuery);
      const searchResults = await webSearch(searchClassification.searchQuery);
      if (searchResults) {
        contextBlock += `\n\n${searchResults}`;
      }
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + contextBlock;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...(messages || [])],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text().catch(() => "");
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
