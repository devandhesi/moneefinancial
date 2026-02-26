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

async function classifyNeedsWebSearch(userMessage: string, tickers: string[], apiKey: string): Promise<{ needsSearch: boolean; searchQueries: string[] }> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You decide if a user message needs real-time web search. Output ONLY valid JSON.

ALWAYS return needsSearch=true if:
- The question mentions ANY specific stock ticker, company name, or asks about any company (always search for latest news/earnings)
- Asks about current events, recent news, politics, legislation, earnings, IPOs, mergers, regulations
- Asks "what happened", "what's going on", "latest", "today", "this week", "recently"
- Asks about market sentiment, Fed decisions, economic data releases
- Could benefit from current information to give a better answer

Only return needsSearch=false for:
- Pure education questions (e.g. "what is a P/E ratio")
- General strategy questions with no time sensitivity

Output format:
{"needsSearch": true, "searchQueries": ["query 1", "query 2"]}

Generate 1-3 search queries optimized for finding the most relevant financial news. Include the company/ticker name explicitly. If tickers are mentioned, ALWAYS include a query like "[TICKER] earnings news latest 2026".

Current tickers detected: ${tickers.join(", ") || "none"}`
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0,
      }),
    });

    if (!res.ok) return { needsSearch: tickers.length > 0, searchQueries: tickers.map(t => `${t} stock latest news earnings 2026`) };
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const queries = parsed.searchQueries || (parsed.searchQuery ? [parsed.searchQuery] : []);
      return { needsSearch: !!parsed.needsSearch, searchQueries: queries.length ? queries : [userMessage] };
    }
  } catch (e) {
    console.error("classify error:", e);
  }
  // Default: if tickers found, always search
  if (tickers.length > 0) return { needsSearch: true, searchQueries: tickers.map(t => `${t} stock latest news`) };
  return { needsSearch: false, searchQueries: [] };
}

async function webSearch(queries: string[]): Promise<string> {
  const allResults: string[] = [];
  const seenTitles = new Set<string>();

  for (const query of queries.slice(0, 3)) {
    // Google News RSS
    try {
      const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
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
          if (title && !seenTitles.has(title.toLowerCase())) {
            seenTitles.add(title.toLowerCase());
            const dateStr = pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
            allResults.push(`• ${title}${source ? ` — ${source}` : ""}${dateStr ? ` (${dateStr})` : ""}${desc ? `\n  ${desc.slice(0, 200)}` : ""}`);
          }
        }
      }
    } catch (e) {
      console.error("Google News RSS error:", e);
    }

    // Yahoo Finance RSS
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
          if (title && !seenTitles.has(title.toLowerCase())) {
            seenTitles.add(title.toLowerCase());
            const dateStr = pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
            allResults.push(`• ${title}${dateStr ? ` (${dateStr})` : ""}`);
          }
        }
      }
    } catch (e) {
      console.error("Yahoo RSS error:", e);
    }
  }

  if (allResults.length === 0) return "";
  return `## WEB SEARCH RESULTS for: ${queries.join(", ")}\n\n${allResults.slice(0, 15).join("\n\n")}`;
}

// ── system prompt ────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are Maven — a sharp, friendly money mentor inside the Monee app. Think of yourself as that one friend who actually knows finance and explains things without jargon or condescension.

YOUR SCOPE — ALL THINGS MONEY
You cover everything related to money and personal finance:
- Stocks, ETFs, crypto, commodities, indices, options
- Budgeting, saving, spending habits, emergency funds
- Debt management, credit scores, loans, mortgages
- Retirement planning, 401k, IRAs, pensions
- Side income, freelancing, salary negotiation
- Taxes, insurance, estate planning
- Financial psychology, spending triggers, money mindset
- Economic news, inflation, interest rates, Fed policy
- Real estate investing, REITs

If someone asks something truly unrelated to money/finance, gently steer back with humor.

PERSONALITY
- Warm but direct. You're not a corporate chatbot.
- Vary your response length naturally. A simple question gets 1-3 sentences. A complex analysis gets detailed sections.
- Use casual language when appropriate. "Honestly," "Here's the deal," "Look," etc.
- Show personality. Have opinions (with caveats). Be occasionally witty.
- Never start with "Great question!" or "That's a fantastic question!" — just answer.
- Don't repeat the user's question back to them.
- Mix up your formatting. Not every response needs headers and bullets. Sometimes a clean paragraph is better.

TICKER HANDLING
- When you mention a stock ticker, ALWAYS format it as $TICKER (e.g. $NVDA, $AAPL, $TSLA). This is critical — the app turns $TICKER into clickable links.
- Detect tickers in user messages: NVDA, $TSLA, SHOP.TO, etc.
- If the user says "it", "that stock", "they" — assume the most recently discussed ticker.

LIVE DATA RULES
- You may receive LIVE MARKET DATA, RECENT NEWS, and WEB SEARCH RESULTS below.
- If live data is provided, use those exact numbers. Never invent prices.
- If web search results exist, synthesize them naturally. Don't just list headlines.
- If no data is available, say so honestly.

WHEN DISCUSSING A SPECIFIC STOCK
Keep it clean and scannable:

**$TICKER — Company Name**

Current price and trend (from live data if available). What's driving the move. 2-3 things to watch. Risks worth knowing. Your honest take.

Don't use the same rigid template every time. Adapt based on what's interesting about the stock right now.

FORMATTING RULES
- Short paragraphs (2-3 sentences max)
- Use **bold** for tickers ($TICKER format), key numbers, and emphasis
- Bullets only when listing 3+ items
- Headers only for multi-section responses
- Keep most responses under 200 words. Go longer only when the topic demands it.
- End with something actionable or a follow-up question when natural — but don't force it.

Always end stock-specific analysis with:
*Not financial advice — just Maven's take.*`;

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
      classifyNeedsWebSearch(latestText, tickers, LOVABLE_API_KEY),
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
    if (searchClassification.needsSearch && searchClassification.searchQueries.length > 0) {
      console.log("Web search triggered for:", searchClassification.searchQueries);
      const searchResults = await webSearch(searchClassification.searchQueries);
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
