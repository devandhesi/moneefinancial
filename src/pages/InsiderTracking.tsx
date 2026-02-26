import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Loader2, Filter, ExternalLink, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock insider data based on ceo.ca style
const MOCK_INSIDERS = [
  { id: "1", name: "Jensen Huang", title: "CEO", company: "NVIDIA Corp", symbol: "NVDA", action: "Sell", shares: 120000, price: 875.50, value: 105060000, date: "2026-02-24", change: -2.1 },
  { id: "2", name: "Tim Cook", title: "CEO", company: "Apple Inc", symbol: "AAPL", action: "Sell", shares: 50000, price: 228.30, value: 11415000, date: "2026-02-23", change: -0.8 },
  { id: "3", name: "Satya Nadella", title: "CEO", company: "Microsoft Corp", symbol: "MSFT", action: "Sell", shares: 35000, price: 415.20, value: 14532000, date: "2026-02-22", change: -1.5 },
  { id: "4", name: "Elon Musk", title: "CEO", company: "Tesla Inc", symbol: "TSLA", action: "Buy", shares: 200000, price: 195.40, value: 39080000, date: "2026-02-21", change: 4.2 },
  { id: "5", name: "Mark Zuckerberg", title: "CEO", company: "Meta Platforms", symbol: "META", action: "Sell", shares: 75000, price: 520.80, value: 39060000, date: "2026-02-20", change: -1.8 },
  { id: "6", name: "Andy Jassy", title: "CEO", company: "Amazon.com", symbol: "AMZN", action: "Sell", shares: 25000, price: 185.60, value: 4640000, date: "2026-02-19", change: -0.5 },
  { id: "7", name: "Lisa Su", title: "CEO", company: "AMD Inc", symbol: "AMD", action: "Sell", shares: 40000, price: 168.90, value: 6756000, date: "2026-02-18", change: -3.1 },
  { id: "8", name: "Jamie Dimon", title: "CEO", company: "JPMorgan Chase", symbol: "JPM", action: "Buy", shares: 15000, price: 198.50, value: 2977500, date: "2026-02-17", change: 1.2 },
  { id: "9", name: "Alex Karp", title: "CEO", company: "Palantir Tech", symbol: "PLTR", action: "Sell", shares: 500000, price: 22.80, value: 11400000, date: "2026-02-16", change: -5.2 },
  { id: "10", name: "Brian Moynihan", title: "CEO", company: "Bank of America", symbol: "BAC", action: "Buy", shares: 50000, price: 37.20, value: 1860000, date: "2026-02-15", change: 0.8 },
];

const fmtValue = (v: number) => {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
};

type FilterType = "all" | "buy" | "sell";

const InsiderTracking = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = MOCK_INSIDERS.filter(i => {
    if (filter === "buy" && i.action !== "Buy") return false;
    if (filter === "sell" && i.action !== "Sell") return false;
    if (search) {
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.symbol.toLowerCase().includes(q) || i.company.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">Insider Tracking</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Track CEO & executive trading activity · Inspired by SEDI filings</p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div className="mt-5 flex gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card flex flex-1 items-center gap-2 px-3 py-2.5">
          <Search size={14} className="text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ticker, or company..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" />
        </div>
        <div className="flex gap-1">
          {(["all", "buy", "sell"] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${filter === f ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div className="mt-4 grid grid-cols-3 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold">{MOCK_INSIDERS.filter(i => i.action === "Buy").length}</p>
          <p className="text-[10px] text-muted-foreground">Insider Buys</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold">{MOCK_INSIDERS.filter(i => i.action === "Sell").length}</p>
          <p className="text-[10px] text-muted-foreground">Insider Sells</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-lg font-bold">{fmtValue(MOCK_INSIDERS.reduce((s, i) => s + i.value, 0))}</p>
          <p className="text-[10px] text-muted-foreground">Total Value</p>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div className="mt-4 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {filtered.map((insider, i) => (
          <motion.div
            key={insider.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4 cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/invest/${insider.symbol}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${insider.action === "Buy" ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss"}`}>
                    {insider.action.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold">{insider.symbol}</span>
                  <span className="text-xs text-muted-foreground">· {insider.company}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="text-xs font-medium">{insider.name}</p>
                  <span className="text-[10px] text-muted-foreground">{insider.title}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{fmtValue(insider.value)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {insider.shares.toLocaleString()} shares @ ${insider.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{new Date(insider.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span className={`flex items-center gap-0.5 text-[10px] font-medium ${insider.change >= 0 ? "text-gain" : "text-loss"}`}>
                {insider.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {insider.change >= 0 ? "+" : ""}{insider.change}% since filing
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="text-[11px] text-muted-foreground">Data sourced from public SEDI/SEC filings · For educational purposes only</p>
      </motion.div>
    </div>
  );
};

export default InsiderTracking;
