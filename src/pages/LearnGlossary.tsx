import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, BookOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GLOSSARY = [
  { term: "P/E Ratio", def: "Price divided by earnings per share — measures how much investors pay per dollar of earnings.", cat: "Valuation" },
  { term: "Market Cap", def: "Share price × total shares outstanding — indicates company size (micro, small, mid, large, mega).", cat: "Fundamentals" },
  { term: "Dividend Yield", def: "Annual dividend ÷ share price — shows income return on investment.", cat: "Income" },
  { term: "Beta", def: "Measures stock volatility vs the market. β > 1 = more volatile, β < 1 = less volatile.", cat: "Risk" },
  { term: "EPS", def: "Earnings Per Share — net income divided by outstanding shares.", cat: "Fundamentals" },
  { term: "RSI", def: "Relative Strength Index — momentum indicator: >70 overbought, <30 oversold.", cat: "Technical" },
  { term: "SMA", def: "Simple Moving Average — average closing price over N periods, smooths noise.", cat: "Technical" },
  { term: "EMA", def: "Exponential Moving Average — weighted average giving more weight to recent prices.", cat: "Technical" },
  { term: "Bollinger Bands", def: "SMA ± 2 standard deviations — shows volatility and potential reversal zones.", cat: "Technical" },
  { term: "MACD", def: "Moving Average Convergence Divergence — trend-following momentum indicator.", cat: "Technical" },
  { term: "Volume", def: "Number of shares/contracts traded in a period — confirms price moves.", cat: "Technical" },
  { term: "52-Week High/Low", def: "Highest and lowest prices in the past year — context for current price.", cat: "Fundamentals" },
  { term: "ETF", def: "Exchange-Traded Fund — basket of securities that trades like a single stock.", cat: "Products" },
  { term: "Index Fund", def: "Fund that tracks a market index like the S&P 500 — low cost, broad diversification.", cat: "Products" },
  { term: "Dollar-Cost Averaging", def: "Investing fixed amounts at regular intervals regardless of price.", cat: "Strategy" },
  { term: "Diversification", def: "Spreading investments across assets to reduce risk.", cat: "Strategy" },
  { term: "Asset Allocation", def: "Dividing portfolio among different asset classes (stocks, bonds, cash).", cat: "Strategy" },
  { term: "Bull Market", def: "Extended period of rising prices — generally 20%+ gain from recent low.", cat: "Market" },
  { term: "Bear Market", def: "Extended period of falling prices — generally 20%+ decline from recent high.", cat: "Market" },
  { term: "Liquidity", def: "How easily an asset can be bought/sold without affecting its price.", cat: "Market" },
  { term: "Compound Interest", def: "Interest calculated on initial principal AND accumulated interest — exponential growth.", cat: "Fundamentals" },
  { term: "Inflation", def: "General increase in prices over time, reducing purchasing power of money.", cat: "Economics" },
  { term: "Federal Reserve", def: "US central bank — sets monetary policy, interest rates, and manages money supply.", cat: "Economics" },
  { term: "GDP", def: "Gross Domestic Product — total value of goods and services produced by a country.", cat: "Economics" },
  { term: "Yield Curve", def: "Graph of bond yields across maturities — inversion often predicts recession.", cat: "Economics" },
  { term: "Short Selling", def: "Borrowing shares to sell, hoping to buy back cheaper — profits from price declines.", cat: "Strategy" },
  { term: "Stop Loss", def: "Order to sell a security when it reaches a specified price — limits downside risk.", cat: "Strategy" },
  { term: "Limit Order", def: "Order to buy/sell at a specific price or better — gives price control.", cat: "Strategy" },
  { term: "Market Order", def: "Order to buy/sell immediately at current market price — fastest execution.", cat: "Strategy" },
  { term: "ROI", def: "Return on Investment — (gain - cost) / cost × 100 — measures profitability.", cat: "Fundamentals" },
];

const categories = ["All", ...new Set(GLOSSARY.map(g => g.cat))];

const LearnGlossary = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const filtered = useMemo(() => {
    return GLOSSARY.filter(g => {
      const matchesSearch = !search || g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCat === "All" || g.cat === activeCat;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCat]);

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/learn")} className="rounded-xl p-2 transition-colors hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Financial Glossary 📖</h1>
            <p className="text-xs text-muted-foreground">{GLOSSARY.length} terms every investor should know</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="glass-card mt-4 flex items-center gap-2 px-4 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <Search size={16} className="text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search terms..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
      </motion.div>

      {/* Categories */}
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
              activeCat === cat ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Terms */}
      <div className="mt-4 space-y-2">
        {filtered.map((g, i) => (
          <motion.div
            key={g.term}
            className="glass-card p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{g.term}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{g.def}</p>
              </div>
              <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground ml-3">{g.cat}</span>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No terms match your search</div>
        )}
      </div>
    </div>
  );
};

export default LearnGlossary;
