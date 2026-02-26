// Mock market data for heatmap - sectors and tickers
export interface HeatmapTicker {
  id: string;
  symbol: string;
  label: string;
  sector: string;
  change_1d: number;
  change_1w: number;
  change_1m: number;
  volume_mult: number;
  market_cap: number;
  market_cap_label: "micro" | "small" | "mid" | "large";
  heat_score: number;
}

export interface HeatmapSector {
  id: string;
  label: string;
  change_1d: number;
  change_1w: number;
  change_1m: number;
  volume_mult: number;
  tickers: HeatmapTicker[];
  weight: number; // relative size
}

const CAP_LABEL = (cap: number): "micro" | "small" | "mid" | "large" => {
  if (cap >= 10e9) return "large";
  if (cap >= 2e9) return "mid";
  if (cap >= 300e6) return "small";
  return "micro";
};

function makeTicker(symbol: string, label: string, sector: string, cap: number): HeatmapTicker {
  const c1d = (Math.random() - 0.45) * 8;
  const c1w = (Math.random() - 0.45) * 14;
  const c1m = (Math.random() - 0.4) * 22;
  const volMult = 0.6 + Math.random() * 3.2;
  const heat = Math.min(100, Math.max(0, Math.round(
    Math.abs(c1d) * 6 + volMult * 8 + Math.abs(c1w) * 2 + Math.random() * 10
  )));

  return {
    id: symbol,
    symbol,
    label,
    sector,
    change_1d: +c1d.toFixed(2),
    change_1w: +c1w.toFixed(2),
    change_1m: +c1m.toFixed(2),
    volume_mult: +volMult.toFixed(2),
    market_cap: cap,
    market_cap_label: CAP_LABEL(cap),
    heat_score: heat,
  };
}

export function getHeatmapData(): HeatmapSector[] {
  const sectors: { name: string; weight: number; tickers: [string, string, number][] }[] = [
    {
      name: "Technology", weight: 28, tickers: [
        ["AAPL", "Apple", 3.4e12], ["MSFT", "Microsoft", 3.1e12], ["NVDA", "NVIDIA", 3.0e12],
        ["GOOGL", "Alphabet", 2.0e12], ["META", "Meta Platforms", 1.4e12], ["AVGO", "Broadcom", 800e9],
        ["ORCL", "Oracle", 390e9], ["CRM", "Salesforce", 270e9], ["AMD", "AMD", 220e9],
        ["INTC", "Intel", 110e9], ["SHOP", "Shopify", 90e9], ["PLTR", "Palantir", 60e9],
      ],
    },
    {
      name: "Healthcare", weight: 14, tickers: [
        ["UNH", "UnitedHealth", 480e9], ["JNJ", "J&J", 380e9], ["LLY", "Eli Lilly", 750e9],
        ["PFE", "Pfizer", 160e9], ["ABBV", "AbbVie", 290e9], ["MRK", "Merck", 280e9],
        ["TMO", "Thermo Fisher", 200e9], ["ABT", "Abbott", 190e9],
      ],
    },
    {
      name: "Financials", weight: 13, tickers: [
        ["JPM", "JPMorgan", 580e9], ["V", "Visa", 550e9], ["MA", "Mastercard", 420e9],
        ["BAC", "Bank of America", 300e9], ["GS", "Goldman Sachs", 150e9], ["MS", "Morgan Stanley", 140e9],
        ["SOFI", "SoFi", 12e9], ["COIN", "Coinbase", 50e9],
      ],
    },
    {
      name: "Consumer Discretionary", weight: 11, tickers: [
        ["AMZN", "Amazon", 1.9e12], ["TSLA", "Tesla", 800e9], ["HD", "Home Depot", 360e9],
        ["NKE", "Nike", 120e9], ["SBUX", "Starbucks", 110e9], ["MCD", "McDonald's", 200e9],
      ],
    },
    {
      name: "Communication", weight: 9, tickers: [
        ["GOOG", "Alphabet C", 2.0e12], ["DIS", "Disney", 180e9], ["NFLX", "Netflix", 280e9],
        ["CMCSA", "Comcast", 160e9], ["SPOT", "Spotify", 70e9],
      ],
    },
    {
      name: "Industrials", weight: 8, tickers: [
        ["CAT", "Caterpillar", 170e9], ["BA", "Boeing", 130e9], ["HON", "Honeywell", 140e9],
        ["UPS", "UPS", 110e9], ["RTX", "RTX Corp", 150e9],
      ],
    },
    {
      name: "Energy", weight: 5, tickers: [
        ["XOM", "ExxonMobil", 450e9], ["CVX", "Chevron", 280e9], ["COP", "ConocoPhillips", 130e9],
        ["SLB", "Schlumberger", 60e9],
      ],
    },
    {
      name: "Materials", weight: 3, tickers: [
        ["LIN", "Linde", 200e9], ["APD", "Air Products", 60e9], ["FCX", "Freeport", 55e9],
      ],
    },
    {
      name: "Utilities", weight: 3, tickers: [
        ["NEE", "NextEra", 150e9], ["DUK", "Duke Energy", 80e9], ["SO", "Southern Co", 85e9],
      ],
    },
    {
      name: "Real Estate", weight: 3, tickers: [
        ["PLD", "Prologis", 110e9], ["AMT", "American Tower", 90e9], ["SPG", "Simon Property", 50e9],
      ],
    },
    {
      name: "Consumer Staples", weight: 3, tickers: [
        ["PG", "P&G", 370e9], ["KO", "Coca-Cola", 260e9], ["PEP", "PepsiCo", 230e9],
        ["WMT", "Walmart", 500e9],
      ],
    },
  ];

  return sectors.map(s => {
    const tickers = s.tickers.map(([sym, name, cap]) => makeTicker(sym, name, s.name, cap));
    const avgChange1d = tickers.reduce((a, t) => a + t.change_1d, 0) / tickers.length;
    const avgChange1w = tickers.reduce((a, t) => a + t.change_1w, 0) / tickers.length;
    const avgChange1m = tickers.reduce((a, t) => a + t.change_1m, 0) / tickers.length;
    const avgVol = tickers.reduce((a, t) => a + t.volume_mult, 0) / tickers.length;

    return {
      id: s.name.toLowerCase().replace(/\s+/g, "-"),
      label: s.name,
      change_1d: +avgChange1d.toFixed(2),
      change_1w: +avgChange1w.toFixed(2),
      change_1m: +avgChange1m.toFixed(2),
      volume_mult: +avgVol.toFixed(2),
      tickers,
      weight: s.weight,
    };
  });
}
