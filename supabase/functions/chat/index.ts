import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── helpers ──────────────────────────────────────────────

function extractTickers(text: string): string[] {
  const upper = (text || "").toUpperCase();

  const stopWords = new Set([
    "I",
    "A",
    "AM",
    "AN",
    "AS",
    "AT",
    "BE",
    "BY",
    "DO",
    "GO",
    "HE",
    "IF",
    "IN",
    "IS",
    "IT",
    "ME",
    "MY",
    "NO",
    "OF",
    "OH",
    "OK",
    "ON",
    "OR",
    "OUR",
    "SO",
    "TO",
    "UP",
    "US",
    "WE",
    "ADD",
    "ALL",
    "AND",
    "ANY",
    "ARE",
    "ASK",
    "BIG",
    "BUT",
    "BUY",
    "CAN",
    "DAY",
    "DID",
    "END",
    "FAR",
    "FEW",
    "FOR",
    "GET",
    "GOT",
    "HAS",
    "HAD",
    "HER",
    "HIM",
    "HIS",
    "HOW",
    "ITS",
    "LET",
    "LOT",
    "MAY",
    "NEW",
    "NOT",
    "NOW",
    "OLD",
    "ONE",
    "OUT",
    "OWN",
    "PUT",
    "RAN",
    "RUN",
    "SAY",
    "SET",
    "SHE",
    "THE",
    "TOO",
    "TOP",
    "TRY",
    "TWO",
    "USE",
    "WAS",
    "WAY",
    "WHO",
    "WHY",
    "WIN",
    "WON",
    "YES",
    "YET",
    "YOU",
    "ALSO",
    "BEEN",
    "BEST",
    "BOTH",
    "CAME",
    "COME",
    "DOES",
    "DONE",
    "DOWN",
    "EACH",
    "EVEN",
    "FIND",
    "FROM",
    "GAVE",
    "GIVE",
    "GOES",
    "GOOD",
    "GROW",
    "HAVE",
    "HEAD",
    "HELP",
    "HERE",
    "HIGH",
    "HOLD",
    "HOME",
    "INTO",
    "JUST",
    "KEEP",
    "KIND",
    "KNOW",
    "LAST",
    "LEFT",
    "LIKE",
    "LINE",
    "LIST",
    "LONG",
    "LOOK",
    "MADE",
    "MAIN",
    "MAKE",
    "MANY",
    "MORE",
    "MOST",
    "MUCH",
    "MUST",
    "NAME",
    "NEAR",
    "NEED",
    "NEXT",
    "ONLY",
    "OPEN",
    "OVER",
    "PART",
    "PLAY",
    "REAL",
    "RISK",
    "SAID",
    "SAME",
    "SELL",
    "SHOW",
    "SIDE",
    "SOME",
    "SUCH",
    "SURE",
    "TAKE",
    "TELL",
    "THAN",
    "THAT",
    "THEM",
    "THEN",
    "THEY",
    "THIS",
    "TIME",
    "TURN",
    "VERY",
    "WANT",
    "WELL",
    "WENT",
    "WERE",
    "WHAT",
    "WHEN",
    "WILL",
    "WITH",
    "WORK",
    "YEAR",
    "YOUR",
    "ABOUT",
    "AFTER",
    "BEING",
    "BELOW",
    "COULD",
    "EVERY",
    "FIRST",
    "GREAT",
    "LARGE",
    "MIGHT",
    "NEVER",
    "OTHER",
    "POINT",
    "RIGHT",
    "SHALL",
    "SINCE",
    "SMALL",
    "STILL",
    "STOCK",
    "THEIR",
    "THERE",
    "THESE",
    "THINK",
    "THREE",
    "TODAY",
    "UNDER",
    "UNTIL",
    "USING",
    "WHICH",
    "WHILE",
    "WORLD",
    "WOULD",
    "PRICE",
    "SHARE",
    "WORTH",
    "TREND",
    "TRADE",
    "CLOSE",
    "CHART",
    "WATCH",
    "AVOID",
    "TRACK",
    "START",
    "SHORT",
    "ETF",
    "CEO",
    "CFO",
    "IPO",
    "SEC",
    "GDP",
    "CPI",
    "FED",
    "USD",
    "CAD",
  ]);

  const found: string[] = [];

  // 1) $TICKER or $TICKER.SFX
  for (const m of upper.matchAll(/\$([A-Z]{1,5})(?:\.([A-Z]{1,3}))?\b/g)) {
    const base = m[1];
    const t = m[2] ? `${base}.${m[2]}` : base;
    if (!stopWords.has(base)) found.push(t);
  }

  // 2) TICKER.SFX (supports .V .TO .NE .CN etc)
  for (const m of upper.matchAll(/\b([A-Z]{1,5})\.([A-Z]{1,3})\b/g)) {
    const base = m[1];
    const sfx = m[2];
    if (!stopWords.has(base)) found.push(`${base}.${sfx}`);
  }

  // 3) Plain TICKER
  for (const m of upper.matchAll(/\b([A-Z]{1,5})\b/g)) {
    const t = m[1];
    if (!stopWords.has(t)) found.push(t);
  }

  // De dupe, keep order, cap
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
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol,
      )}?interval=1d&range=5d&includePrePost=false`,
      { headers: { "User-Agent": "Mozilla/5.0" } },
    );

    if (!res.ok) {
      await res.text().catch(() => null);
      return null;
    }

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

    const avgVol = volumes.length
      ? volumes.reduce((s: number, v: number | null) => s + (v || 0), 0) / volumes.length
      : 0;

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

// ── system prompt ────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are Maven inside Monee, a stocks and investing only assistant.

SCOPE LOCK
- You only discuss: stocks, ETFs, indices, sectors, earnings, valuation, macro, portfolio construction, risk, trading mechanics, and investing psychology.
- If a user asks anything not related to investing, respond with 1 sentence redirecting back to investing, then ask a stock focused question.

TICKER HANDLING
- Detect tickers in formats like NVDA, TSLA, SHOP.TO, SMN.V, KCP.V, and $TICKER.
- If the user says it, that, this, they, assume they refer to the most recently mentioned ticker.
- If multiple tickers are present and the user did not ask for a comparison, ask which ticker to focus on.

LIVE DATA RULES
- You may receive a LIVE MARKET DATA block below for detected tickers.
- If live data is provided, you MUST use those exact numbers and you MUST NOT invent prices, percent changes, market cap, or ranges.
- If no live data is available for a ticker, say you do not have the live quote and ask for the correct symbol or a screenshot.

NEWS RULE
- Do not invent headlines, catalysts, or breaking news.
- If asked for news, say you can summarize if the user pastes links, or if a news feed is integrated.

STYLE
- Short paragraphs (2 to 3 sentences max)
- Use **bold** for tickers and key numbers
- Use bullet points and section headers
- Direct tone, no guarantees
- End with a clear next step
- Keep under 250 words unless asked for more

WHEN USER ASKS ABOUT A STOCK
Use this structure:

## {TICKER} — {Company Name}

**Price & Trend**
Use exact live price, change, and 5 day trend from the LIVE MARKET DATA block if present.

**What to Watch**
3 to 6 concrete things to watch next (filings, financings, earnings, guidance, volume, key levels, sector read through). No made up headlines.

**Risk Check**
Call out the biggest risks, especially dilution, liquidity, and concentration.

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

    // Extract tickers from the latest user message + recent context
    const recentText = (messages || [])
      .slice(-4)
      .filter((m: any) => m?.role === "user")
      .map((m: any) => String(m?.content || ""))
      .join(" ");

    const tickers = extractTickers(recentText);

    // Fetch live quotes in parallel
    let marketDataBlock = "";
    if (tickers.length > 0) {
      const quotes = await Promise.all(tickers.map(fetchQuote));
      const validQuotes = quotes.filter(Boolean) as string[];

      if (validQuotes.length > 0) {
        marketDataBlock =
          `\n\n## LIVE MARKET DATA (as of ${new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          })} ET)\n\n` + validQuotes.join("\n\n");
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
        messages: [{ role: "system", content: systemPrompt }, ...(messages || [])],
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

      const t = await response.text().catch(() => "");
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
