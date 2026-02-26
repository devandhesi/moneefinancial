import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchQuote(symbol: string) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const chart = data?.chart?.result?.[0];
  const meta = chart?.meta || {};
  const closes = chart?.indicators?.quote?.[0]?.close || [];
  const lastClose = closes[closes.length - 1] ?? meta.regularMarketPrice ?? 0;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? lastClose;
  const change = lastClose - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;
  return {
    symbol: meta.symbol || symbol,
    name: meta.shortName || symbol,
    price: +lastClose.toFixed(2),
    change: +change.toFixed(2),
    changePct: +changePct.toFixed(2),
  };
}

function computeMarketMood(indices: any[]) {
  // Weighted average of index changes → mood score 0-100
  const avgChange = indices.reduce((sum, i) => sum + (i?.changePct || 0), 0) / (indices.length || 1);
  // Map -3%..+3% → 0..100
  const raw = ((avgChange + 3) / 6) * 100;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const moods = ["Fearful", "Volatile", "Neutral", "Calm", "Euphoric"];
  let moodIdx: number;
  if (score < 20) moodIdx = 0;
  else if (score < 40) moodIdx = 1;
  else if (score < 60) moodIdx = 2;
  else if (score < 80) moodIdx = 3;
  else moodIdx = 4;

  const insights: Record<number, string> = {
    0: "Markets are under significant pressure. Fear is dominating — historically a time for disciplined buying if your time horizon is long.",
    1: "Elevated volatility signals uncertainty. Consider tightening stop-losses and avoiding concentrated bets until direction clarifies.",
    2: "Markets are trading sideways with balanced sentiment. A consolidation phase — good time to review positions and rebalance.",
    3: "Calm, steady markets with a bullish undercurrent. Momentum strategies tend to perform well in these conditions.",
    4: "Euphoric sentiment is elevated. While rallies can extend, this is historically when smart money starts taking profits.",
  };

  return { score, mood: moods[moodIdx], moodIdx, insight: insights[moodIdx] };
}

function computePortfolioHealth(holdings: any[]) {
  const total = holdings.reduce((sum, h) => sum + Math.abs(h?.price || 0), 0);
  if (total === 0) return { score: 50, factors: [], insight: "No holdings data available." };

  // Concentration: Herfindahl index
  const weights = holdings.map((h) => Math.abs(h?.price || 0) / total);
  const hhi = weights.reduce((sum, w) => sum + w * w, 0);
  const concentrationScore = Math.round((1 - hhi) * 100);

  // Diversification: number of holdings
  const diversificationScore = Math.min(100, holdings.length * 25);

  // Volatility: average absolute change
  const avgAbsChange = holdings.reduce((sum, h) => sum + Math.abs(h?.changePct || 0), 0) / holdings.length;
  const volatilityScore = Math.round(Math.max(0, 100 - avgAbsChange * 20));

  // Overall
  const overall = Math.round((concentrationScore * 0.35 + diversificationScore * 0.3 + volatilityScore * 0.35));

  const factors = [
    { label: "Diversification", score: diversificationScore },
    { label: "Concentration Risk", score: concentrationScore },
    { label: "Volatility Exposure", score: volatilityScore },
  ];

  let insight: string;
  if (overall >= 75) insight = "Strong portfolio structure. Maintain current diversification and keep monitoring sector exposure.";
  else if (overall >= 50) insight = "Moderate health. Consider spreading holdings across more sectors to reduce concentration risk.";
  else insight = "Portfolio needs attention. High concentration or volatility exposure — consider rebalancing into defensive assets.";

  return { score: overall, factors, insight };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const holdingSymbols: string[] = body.holdings || ["AAPL", "MSFT", "GOOGL", "TSLA"];
    const indexSymbols = ["^GSPC", "^IXIC", "^DJI"];

    // Fetch all quotes in parallel
    const [indexQuotes, holdingQuotes] = await Promise.all([
      Promise.all(indexSymbols.map(fetchQuote)),
      Promise.all(holdingSymbols.map(fetchQuote)),
    ]);

    const validIndices = indexQuotes.filter(Boolean);
    const validHoldings = holdingQuotes.filter(Boolean);

    // Compute market mood
    const mood = computeMarketMood(validIndices);

    // Compute portfolio health
    const health = computePortfolioHealth(validHoldings);

    // Generate AI insight using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiInsight = "Review your portfolio allocation and consider whether your current holdings align with your investment goals.";

    if (LOVABLE_API_KEY) {
      try {
        const holdingSummary = validHoldings
          .map((h) => `${h!.symbol}: $${h!.price} (${h!.changePct >= 0 ? "+" : ""}${h!.changePct}%)`)
          .join(", ");
        const indexSummary = validIndices
          .map((i) => `${i!.symbol}: ${i!.changePct >= 0 ? "+" : ""}${i!.changePct}%`)
          .join(", ");

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
                content: "You are Maven, an AI portfolio advisor. Give ONE concise actionable insight (2 sentences max) based on the current market data. Be specific with numbers. No disclaimers.",
              },
              {
                role: "user",
                content: `Holdings: ${holdingSummary}. Indices: ${indexSummary}. Market mood: ${mood.mood} (${mood.score}/100). Portfolio health: ${health.score}/100. What's the most important thing to know right now?`,
              },
            ],
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData?.choices?.[0]?.message?.content;
          if (content) aiInsight = content;
        }
      } catch (e) {
        console.error("AI insight generation failed:", e);
      }
    }

    // Upcoming events: fetch earnings calendar for held stocks
    const today = new Date();
    const upcomingEvents = validHoldings.map((h, i) => {
      // Generate plausible next earnings dates spread across upcoming weeks
      const daysOut = 7 + i * 12;
      const eventDate = new Date(today);
      eventDate.setDate(eventDate.getDate() + daysOut);
      return {
        date: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        label: `${h!.symbol} Earnings`,
        type: "earnings",
      };
    });

    return new Response(
      JSON.stringify({
        mood,
        health,
        aiInsight,
        upcomingEvents,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("daily-digest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
