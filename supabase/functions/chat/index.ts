import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Maven, an elite AI portfolio intelligence assistant inside a stock trading education app.

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
Current price context, recent movement, and short-term direction.

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
- Comparisons: Use a quick side-by-side format

## PERSONALITY
- Smart friend who works at a hedge fund — sharp, direct, no fluff
- Proactively flags risks others would miss
- Uses real numbers and specifics, never vague
- Occasionally drops a relevant insight they didn't ask for

## RULES
- Always clarify this is educational/simulated analysis, not financial advice
- If you don't know something, say so — never fabricate data
- Reference their portfolio context naturally, don't force it`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
