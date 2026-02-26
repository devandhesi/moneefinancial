import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── helpers ──────────────────────────────────────────────

function extractTickers(text: string): string[] {
  // 1. Explicit $TICKER mentions
  const explicit = [...text.matchAll(/\$([A-Z]{1,5})\b/g)].map(m => m[1]);

  // 2. Detect any uppercase word that looks like a ticker (1-5 chars, all caps)
  //    Filter out common English words that aren't tickers
  const stopWords = new Set([
    "I","A","AM","AN","AS","AT","BE","BY","DO","GO","HE","IF","IN","IS","IT",
    "ME","MY","NO","OF","OH","OK","ON","OR","OUR","SO","TO","UP","US","WE",
    "ADD","ALL","AND","ANY","ARE","ASK","BIG","BUT","BUY","CAN","DAY","DID",
    "END","FAR","FEW","FOR","GET","GOT","HAS","HAD","HER","HIM","HIS","HOW",
    "ITS","LET","LOT","MAY","NEW","NOT","NOW","OLD","ONE","OUR","OUT","OWN",
    "PUT","RAN","RUN","SAY","SET","SHE","THE","TOO","TOP","TRY","TWO","USE",
    "WAS","WAY","WHO","WHY","WIN","WON","YES","YET","YOU",
    "ALSO","BEEN","BEST","BOTH","CAME","COME","DOES","DONE","DOWN","EACH",
    "EVEN","FIND","FROM","GAVE","GIVE","GOES","GOOD","GROW","HAVE","HEAD",
    "HELP","HERE","HIGH","HOLD","HOME","INTO","JUST","KEEP","KIND","KNOW",
    "LAST","LEFT","LIKE","LINE","LIST","LONG","LOOK","MADE","MAIN","MAKE",
    "MANY","MORE","MOST","MUCH","MUST","NAME","NEAR","NEED","NEXT","ONLY",
    "OPEN","OVER","PART","PLAY","REAL","RISK","SAID","SAME","SELL","SHOW",
    "SIDE","SOME","SUCH","SURE","TAKE","TELL","THAN","THAT","THEM","THEN",
    "THEY","THIS","TIME","TURN","VERY","WANT","WELL","WENT","WERE","WHAT",
    "WHEN","WILL","WITH","WORK","YEAR","YOUR",
    "ABOUT","AFTER","BEING","BELOW","COULD","EVERY","FIRST","GREAT","LARGE",
    "MIGHT","NEVER","OTHER","POINT","RIGHT","SHALL","SINCE","SMALL","STILL",
    "STOCK","THEIR","THERE","THESE","THINK","THREE","TODAY","UNDER","UNTIL",
    "USING","WHICH","WHILE","WORLD","WOULD","PRICE","SHARE","WORTH","TREND",
    "TRADE","CLOSE","CHART","WATCH","AVOID","TRACK","START","SHORT",
    "ETF","CEO","CFO","IPO","SEC","GDP","CPI","FED","APR","MAR","JAN","FEB",
    "JUN","JUL","AUG","SEP","OCT","NOV","DEC","MON","TUE","WED","THU","FRI",
    "SAT","SUN","EST","PST","CST","USD","EUR","GBP","CAD","AUD","JPY","CNY",
  ]);

  const words = text.match(/\b[A-Z]{1,5}\b/g) || [];
  const candidates = words.filter(w => !stopWords.has(w) && w.length >= 1);

  const all = [...new Set([...explicit, ...candidates])];
  return all.slice(0, 5); // cap at 5 to keep response fast
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "N/A";
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
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) { await res.text(); return null; }
    const data = await res.json();
    const chart = data?.chart?.result?.[0];
    if (!chart) return null;

    const meta = chart.meta || {};
    const closes = chart.indicators?.quote?.[0]?.close || [];
    const volumes = chart.indicators?.quote?.[0]?.volume || [];
    const timestamps = chart.timestamp || [];

    const price = meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;

    // 5-day trend
    const validCloses = closes.filter((c: number | null) => c != null);
    const fiveDayStart = validCloses.length > 0 ? validCloses[0] : price;
    const fiveDayChange = fiveDayStart ? ((price - fiveDayStart) / fiveDayStart * 100) : 0;

    const avgVol = volumes.length ? volumes.reduce((s: number, v: number | null) => s + (v || 0), 0) / volumes.length : 0;

    return [
      `${meta.symbol || symbol} (${meta.shortName || meta.longName || symbol})`,
      `  Price: $${fmt(price)} | Change: ${change >= 0 ? '+' : ''}${fmt(change)} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)`,
      `  5-Day Trend: ${fiveDayChange >= 0 ? '+' : ''}${fiveDayChange.toFixed(2)}%`,
      `  Prev Close: $${fmt(prevClose)} | Day Range: $${fmt(meta.regularMarketDayLow)}–$${fmt(meta.regularMarketDayHigh)}`,
      `  52W Range: $${fmt(meta.fiftyTwoWeekLow)}–$${fmt(meta.fiftyTwoWeekHigh)}`,
      `  Avg Volume: ${fmtLarge(Math.round(avgVol))}`,
      `  Market Cap: ${meta.marketCap ? fmtLarge(meta.marketCap) : 'N/A'}`,
      `  Exchange: ${meta.exchangeName || 'N/A'} | Currency: ${meta.currency || 'USD'}`,
    ].join("\n");
  } catch (e) {
    console.error(`Failed to fetch quote for ${symbol}:`, e);
    return null;
  }
}

// ── system prompt ────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are Maven, an elite AI portfolio intelligence assistant inside a stock trading education app.

## CRITICAL: USE THE LIVE MARKET DATA PROVIDED
You will receive REAL-TIME stock data below. ALWAYS use these exact numbers in your responses — never guess or use outdated prices. If live data is provided for a ticker, cite the exact price, change %, and trends from it.

## RESPONSE STYLE
- Use SHORT paragraphs (2-3 sentences max each)
- Use **bold** for key numbers, tickers, and important terms
- Use bullet points and sections with headers (##) to break up info
- Be direct and opinionated — no wishy-washy hedging
- Always end with a clear, actionable takeaway
- Keep total response under 250 words unless user asks for detail

## WHEN USER ASKS ABOUT A STOCK TICKER
Structure your response EXACTLY like this:

## {TICKER} — {Company Name}

**Price & Trend**
Current price (USE THE EXACT PRICE FROM LIVE DATA), today's change, and 5-day trend direction.

**What's Moving It**
1-2 key catalysts or news items driving the stock right now.

**Portfolio Impact**
How this fits the user's portfolio (they have ~68% tech exposure, moderate risk, ~3 week avg hold period). Flag concentration risk if relevant.

**Maven's Take**
Your direct recommendation: Buy / Hold / Trim / Avoid, with a one-line rationale.

---
*Educational analysis only — not financial advice.*

## FOR OTHER QUESTIONS
- Financial concepts: Explain simply with a real example, then connect it to their portfolio
- Portfolio questions: Reference their context (heavy tech ~68%, short holds ~3 weeks, moderate risk)
- Strategy questions: Give a concrete, numbered action plan
- Comparisons: Use a quick side-by-side format with the REAL prices from live data

## PERSONALITY
- Smart friend who works at a hedge fund — sharp, direct, no fluff
- Proactively flags risks others would miss
- Uses real numbers and specifics, never vague
- Occasionally drops a relevant insight they didn't ask for

## RULES
- ALWAYS use the exact live market data provided — never make up prices
- Always clarify this is educational/simulated analysis, not financial advice
- If you don't know something, say so — never fabricate data
- Reference their portfolio context naturally, don't force it`;

// ── main ─────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Extract tickers from the latest user message + recent context
    const recentText = messages
      .slice(-3)
      .filter((m: any) => m.role === "user")
      .map((m: any) => m.content)
      .join(" ");
    const tickers = extractTickers(recentText);

    // Fetch live quotes in parallel
    let marketDataBlock = "";
    if (tickers.length > 0) {
      const quotes = await Promise.all(tickers.map(fetchQuote));
      const validQuotes = quotes.filter(Boolean);
      if (validQuotes.length > 0) {
        marketDataBlock = `\n\n## 📊 LIVE MARKET DATA (as of ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET)\n\n${validQuotes.join("\n\n")}`;
      }
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + marketDataBlock;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
