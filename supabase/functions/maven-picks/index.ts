import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SECTOR_MAP: Record<string, string> = {
  AAPL: "Technology", MSFT: "Technology", GOOGL: "Technology", META: "Technology",
  AMZN: "Consumer Cyclical", TSLA: "Consumer Cyclical", NVDA: "Technology",
  AMD: "Technology", INTC: "Technology", AVGO: "Technology", QCOM: "Technology",
  JPM: "Financials", BAC: "Financials", GS: "Financials", V: "Financials", MA: "Financials",
  JNJ: "Healthcare", UNH: "Healthcare", PFE: "Healthcare", ABBV: "Healthcare", LLY: "Healthcare",
  XOM: "Energy", CVX: "Energy", COP: "Energy",
  PG: "Consumer Defensive", KO: "Consumer Defensive", PEP: "Consumer Defensive",
  WMT: "Consumer Defensive", COST: "Consumer Defensive",
  DIS: "Communication", NFLX: "Communication",
  CAT: "Industrials", DE: "Industrials", HON: "Industrials",
  NEE: "Utilities", DUK: "Utilities", SO: "Utilities",
  AMT: "Real Estate", PLD: "Real Estate",
  SPY: "ETF-Broad", QQQ: "ETF-Tech", VTI: "ETF-Broad", VOO: "ETF-Broad",
  BND: "Fixed Income", AGG: "Fixed Income", TLT: "Fixed Income",
  XLV: "Healthcare ETF", XLF: "Financials ETF", XLE: "Energy ETF",
  XLK: "Technology ETF", XLU: "Utilities ETF", XLP: "Consumer Staples ETF",
  SCHD: "Dividend ETF", VYM: "Dividend ETF", DVY: "Dividend ETF",
  IWM: "Small Cap ETF", VB: "Small Cap ETF",
};

const ALL_SECTORS = [
  "Technology", "Healthcare", "Financials", "Energy", "Consumer Defensive",
  "Consumer Cyclical", "Communication", "Industrials", "Utilities", "Real Estate",
  "Materials", "Fixed Income",
];

// Suggestion pool: diversified picks across sectors
const SUGGESTION_POOL: { symbol: string; name: string; sector: string }[] = [
  { symbol: "VTI", name: "Vanguard Total Market", sector: "ETF-Broad" },
  { symbol: "VOO", name: "Vanguard S&P 500", sector: "ETF-Broad" },
  { symbol: "QQQ", name: "Invesco Nasdaq 100", sector: "ETF-Tech" },
  { symbol: "XLV", name: "Health Care Select SPDR", sector: "Healthcare" },
  { symbol: "XLF", name: "Financial Select SPDR", sector: "Financials" },
  { symbol: "XLE", name: "Energy Select SPDR", sector: "Energy" },
  { symbol: "XLP", name: "Consumer Staples SPDR", sector: "Consumer Defensive" },
  { symbol: "XLU", name: "Utilities Select SPDR", sector: "Utilities" },
  { symbol: "XLK", name: "Technology Select SPDR", sector: "Technology" },
  { symbol: "BND", name: "Vanguard Total Bond", sector: "Fixed Income" },
  { symbol: "SCHD", name: "Schwab US Dividend Equity", sector: "Dividend" },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "Small Cap" },
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Defensive" },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Defensive" },
  { symbol: "NEE", name: "NextEra Energy", sector: "Utilities" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrials" },
  { symbol: "AMT", name: "American Tower", sector: "Real Estate" },
  { symbol: "LLY", name: "Eli Lilly", sector: "Healthcare" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Technology" },
  { symbol: "COST", name: "Costco Wholesale", sector: "Consumer Defensive" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials" },
  { symbol: "VYM", name: "Vanguard High Dividend Yield", sector: "Dividend" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury", sector: "Fixed Income" },
  { symbol: "AGG", name: "iShares Core US Aggregate Bond", sector: "Fixed Income" },
];

function getSector(symbol: string): string {
  return SECTOR_MAP[symbol.toUpperCase()] || "Other";
}

function generatePicks(
  holdings: { ticker: string; quantity: number; avg_cost: number | null }[],
  cashBalance: number,
): { symbol: string; name: string; reason: string }[] {
  const holdingSymbols = new Set(holdings.map(h => h.ticker.toUpperCase()));
  const totalInvested = holdings.reduce((s, h) => s + h.quantity * (h.avg_cost || 0), 0);
  const totalValue = totalInvested + cashBalance;

  // Analyze sector exposure
  const sectorExposure: Record<string, number> = {};
  for (const h of holdings) {
    const sector = getSector(h.ticker);
    const val = h.quantity * (h.avg_cost || 0);
    sectorExposure[sector] = (sectorExposure[sector] || 0) + val;
  }

  // Find missing sectors
  const missingSectors = ALL_SECTORS.filter(s => !sectorExposure[s] || (sectorExposure[s]! / totalValue) < 0.03);

  // Find over-concentrated sectors (>35%)
  const overConcentrated: string[] = [];
  for (const [sector, val] of Object.entries(sectorExposure)) {
    if (totalValue > 0 && (val / totalValue) > 0.35) {
      overConcentrated.push(sector);
    }
  }

  // Check portfolio characteristics
  const hasFixedIncome = holdings.some(h => ["BND", "AGG", "TLT", "BNDX"].includes(h.ticker.toUpperCase()));
  const hasDividends = holdings.some(h => ["SCHD", "VYM", "DVY", "HDV"].includes(h.ticker.toUpperCase()));
  const hasBroadETF = holdings.some(h => ["VTI", "VOO", "SPY", "IVV"].includes(h.ticker.toUpperCase()));
  const positionCount = holdings.length;
  const cashPercent = totalValue > 0 ? (cashBalance / totalValue) * 100 : 100;

  const picks: { symbol: string; name: string; reason: string }[] = [];
  const usedSymbols = new Set<string>();

  function addPick(symbol: string, name: string, reason: string) {
    if (picks.length >= 3) return;
    if (holdingSymbols.has(symbol) || usedSymbols.has(symbol)) return;
    picks.push({ symbol, name, reason });
    usedSymbols.add(symbol);
  }

  // Empty portfolio
  if (holdings.length === 0) {
    addPick("VTI", "Vanguard Total Market", "Start with broad market exposure — one fund covers 4,000+ US stocks");
    addPick("SCHD", "Schwab US Dividend Equity", "Build passive income with quality dividend-paying companies");
    addPick("BND", "Vanguard Total Bond", "Add stability with investment-grade bonds to balance equity risk");
    return picks;
  }

  // Priority 1: Missing broad diversification
  if (!hasBroadETF && positionCount < 5) {
    addPick("VTI", "Vanguard Total Market", `With only ${positionCount} position${positionCount > 1 ? "s" : ""}, a total market fund reduces your single-stock risk`);
  }

  // Priority 2: Over-concentration
  for (const sector of overConcentrated) {
    const pct = ((sectorExposure[sector]! / totalValue) * 100).toFixed(0);
    // Suggest something from a different sector
    const diversifiers = SUGGESTION_POOL.filter(s =>
      getSector(s.symbol) !== sector && !holdingSymbols.has(s.symbol) && !usedSymbols.has(s.symbol)
    );
    if (diversifiers.length > 0) {
      const pick = diversifiers[Math.floor(Math.random() * Math.min(3, diversifiers.length))];
      addPick(pick.symbol, pick.name, `${sector} is ${pct}% of your portfolio — diversify into ${pick.sector || "other sectors"}`);
    }
  }

  // Priority 3: Missing sector exposure
  for (const sector of missingSectors) {
    const candidates = SUGGESTION_POOL.filter(s =>
      s.sector.toLowerCase().includes(sector.toLowerCase()) && !holdingSymbols.has(s.symbol) && !usedSymbols.has(s.symbol)
    );
    if (candidates.length > 0) {
      const pick = candidates[0];
      addPick(pick.symbol, pick.name, `Zero ${sector.toLowerCase()} exposure detected — add balance to your portfolio`);
    }
  }

  // Priority 4: No fixed income
  if (!hasFixedIncome && picks.length < 3) {
    addPick("BND", "Vanguard Total Bond", "No fixed income detected — bonds add stability during market volatility");
  }

  // Priority 5: No dividend focus
  if (!hasDividends && picks.length < 3) {
    addPick("SCHD", "Schwab US Dividend Equity", "Add dividend income — quality companies that consistently pay shareholders");
  }

  // Priority 6: High cash allocation
  if (cashPercent > 30 && picks.length < 3) {
    addPick("VOO", "Vanguard S&P 500", `${cashPercent.toFixed(0)}% in cash — consider deploying into a low-cost index fund`);
  }

  // Fill remaining slots with smart random picks
  if (picks.length < 3) {
    const remaining = SUGGESTION_POOL.filter(s => !holdingSymbols.has(s.symbol) && !usedSymbols.has(s.symbol));
    // Prefer picks from missing sectors
    const missingSectorPicks = remaining.filter(s =>
      missingSectors.some(ms => s.sector.toLowerCase().includes(ms.toLowerCase()))
    );
    const pool = missingSectorPicks.length > 0 ? missingSectorPicks : remaining;
    const shuffled = pool.sort(() => Math.random() - 0.5);
    for (const p of shuffled) {
      if (picks.length >= 3) break;
      addPick(p.symbol, p.name, `Adds ${p.sector.toLowerCase()} exposure to complement your current holdings`);
    }
  }

  return picks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get sim account
    const { data: simAccount } = await admin
      .from("sim_accounts")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!simAccount) {
      // No portfolio yet — return starter picks
      const picks = generatePicks([], 0);
      return new Response(JSON.stringify({ picks }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get positions and cash
    const [{ data: positions }, { data: cash }] = await Promise.all([
      admin.from("sim_positions").select("ticker, quantity, avg_cost").eq("sim_account_id", simAccount.id).gt("quantity", 0),
      admin.from("sim_cash_balances").select("available").eq("sim_account_id", simAccount.id).eq("currency", "USD").limit(1).single(),
    ]);

    const picks = generatePicks(
      (positions || []) as { ticker: string; quantity: number; avg_cost: number | null }[],
      cash?.available || 0,
    );

    return new Response(JSON.stringify({ picks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Maven picks error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
