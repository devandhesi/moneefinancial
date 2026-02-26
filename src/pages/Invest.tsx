import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, Search, Sparkles, X, Loader2,
  Sun, Moon, BarChart3, Bitcoin, Layers, Activity, Flame, MessageCircle,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import PendingTradesWidget from "@/components/widgets/PendingTradesWidget";
import { searchStocks, getTrendingStocks, type TrendingStock, type StockSearchResult } from "@/lib/market-api";
import { toast } from "sonner";
import { useTimezone } from "@/hooks/use-timezone";

/* ── Market status hook ───────────────────────────────────────── */

function useMarketStatus(userTimezone: string) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const mins = et.getHours() * 60 + et.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && mins >= 570 && mins < 960;

  const displayTime = now.toLocaleTimeString("en-US", {
    timeZone: userTimezone, hour: "numeric", minute: "2-digit", hour12: true,
  });
  const tzLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimezone, timeZoneName: "short",
  }).formatToParts(now).find(p => p.type === "timeZoneName")?.value || "";

  let statusText: string;
  if (isOpen) {
    const closeET = new Date(et); closeET.setHours(16, 0, 0, 0);
    const diffMs = closeET.getTime() - et.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
    statusText = diffH > 0 ? `Closes in ${diffH}h ${diffM}m` : `Closes in ${diffM}m`;
  } else {
    const nextOpen = new Date(et);
    if (mins >= 960 || !isWeekday) {
      let daysToAdd = 1;
      const nextDay = (day + 1) % 7;
      if (nextDay === 0) daysToAdd = 2;
      else if (nextDay === 6) daysToAdd = 3;
      else if (day === 0) daysToAdd = 1;
      nextOpen.setDate(nextOpen.getDate() + daysToAdd);
    }
    nextOpen.setHours(9, 30, 0, 0);
    const localOpen = new Date(now.getTime() + (nextOpen.getTime() - et.getTime()));
    const localStr = localOpen.toLocaleTimeString([], { timeZone: userTimezone, hour: "numeric", minute: "2-digit", hour12: true });
    const userNow = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
    const isToday = localOpen.toDateString() === userNow.toDateString();
    const isTomorrow = new Date(userNow.getTime() + 86_400_000).toDateString() === localOpen.toDateString();
    const dayLabel = isToday ? "today" : isTomorrow ? "tomorrow" : localOpen.toLocaleDateString([], { weekday: "short" });
    statusText = `Opens ${dayLabel} at ${localStr}`;
  }
  return { isOpen, displayTime, tzLabel, statusText };
}

/* ── Static data for non-stock tabs ───────────────────────────── */

const mkSparkline = (base: number, vol: number) =>
  Array.from({ length: 16 }, (_, i) => ({ i, v: base + Math.sin(i * 0.6) * vol + (Math.random() - 0.4) * vol * 0.7 }));

interface AssetItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  extra?: string;
  sparkline: { i: number; v: number }[];
}

const FUTURES: AssetItem[] = [
  { symbol: "ES", name: "E-mini S&P 500", price: 5895.25, change: 0.32, extra: "Mar 2026", sparkline: mkSparkline(5880, 20) },
  { symbol: "NQ", name: "E-mini NASDAQ-100", price: 21480.50, change: 0.58, extra: "Mar 2026", sparkline: mkSparkline(21400, 80) },
  { symbol: "YM", name: "E-mini Dow", price: 43150.00, change: -0.14, extra: "Mar 2026", sparkline: mkSparkline(43100, 60) },
  { symbol: "RTY", name: "E-mini Russell 2000", price: 2045.30, change: 0.42, extra: "Mar 2026", sparkline: mkSparkline(2040, 10) },
  { symbol: "CL", name: "Crude Oil WTI", price: 78.34, change: -1.12, extra: "Apr 2026", sparkline: mkSparkline(78, 2) },
  { symbol: "GC", name: "Gold", price: 2342.80, change: 0.45, extra: "Apr 2026", sparkline: mkSparkline(2340, 15) },
  { symbol: "SI", name: "Silver", price: 27.45, change: 0.92, extra: "Mar 2026", sparkline: mkSparkline(27, 1) },
  { symbol: "NG", name: "Natural Gas", price: 1.78, change: -2.34, extra: "Mar 2026", sparkline: mkSparkline(1.8, 0.1) },
  { symbol: "ZB", name: "US Treasury Bond", price: 118.16, change: 0.08, extra: "Mar 2026", sparkline: mkSparkline(118, 1) },
  { symbol: "6E", name: "Euro FX", price: 1.0856, change: -0.15, extra: "Mar 2026", sparkline: mkSparkline(1.085, 0.003) },
];

const CRYPTO: AssetItem[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67845.00, change: 1.20, extra: "24h vol $42B", sparkline: mkSparkline(67500, 400) },
  { symbol: "ETH", name: "Ethereum", price: 3456.78, change: 2.15, extra: "24h vol $18B", sparkline: mkSparkline(3420, 40) },
  { symbol: "SOL", name: "Solana", price: 142.56, change: 3.45, extra: "24h vol $3.2B", sparkline: mkSparkline(140, 5) },
  { symbol: "BNB", name: "BNB", price: 612.30, change: 0.78, extra: "24h vol $1.8B", sparkline: mkSparkline(610, 8) },
  { symbol: "XRP", name: "Ripple", price: 0.6234, change: -0.56, extra: "24h vol $1.4B", sparkline: mkSparkline(0.62, 0.01) },
  { symbol: "ADA", name: "Cardano", price: 0.4567, change: 1.89, extra: "24h vol $520M", sparkline: mkSparkline(0.45, 0.01) },
  { symbol: "AVAX", name: "Avalanche", price: 38.92, change: 4.12, extra: "24h vol $680M", sparkline: mkSparkline(38, 2) },
  { symbol: "DOGE", name: "Dogecoin", price: 0.0834, change: -1.23, extra: "24h vol $890M", sparkline: mkSparkline(0.083, 0.003) },
  { symbol: "DOT", name: "Polkadot", price: 7.45, change: 0.34, extra: "24h vol $310M", sparkline: mkSparkline(7.4, 0.2) },
  { symbol: "LINK", name: "Chainlink", price: 18.67, change: 2.56, extra: "24h vol $750M", sparkline: mkSparkline(18.5, 0.5) },
];

const OPTIONS_CHAINS: {
  symbol: string;
  underlying: string;
  type: "Call" | "Put";
  strike: number;
  expiry: string;
  premium: number;
  change: number;
  iv: number;
  volume: number;
  oi: number;
  delta: number;
}[] = [
  { symbol: "AAPL", underlying: "Apple", type: "Call", strike: 230, expiry: "Mar 21", premium: 4.85, change: 12.5, iv: 28.3, volume: 45200, oi: 128000, delta: 0.42 },
  { symbol: "AAPL", underlying: "Apple", type: "Put", strike: 220, expiry: "Mar 21", premium: 3.20, change: -8.2, iv: 30.1, volume: 32100, oi: 95000, delta: -0.35 },
  { symbol: "TSLA", underlying: "Tesla", type: "Call", strike: 280, expiry: "Mar 21", premium: 12.40, change: 18.6, iv: 52.4, volume: 89300, oi: 245000, delta: 0.48 },
  { symbol: "TSLA", underlying: "Tesla", type: "Put", strike: 250, expiry: "Mar 21", premium: 8.90, change: -5.3, iv: 55.1, volume: 67400, oi: 198000, delta: -0.38 },
  { symbol: "NVDA", underlying: "NVIDIA", type: "Call", strike: 900, expiry: "Mar 21", premium: 28.50, change: 22.1, iv: 45.8, volume: 125000, oi: 310000, delta: 0.55 },
  { symbol: "NVDA", underlying: "NVIDIA", type: "Put", strike: 850, expiry: "Mar 21", premium: 18.75, change: -12.4, iv: 48.2, volume: 78600, oi: 220000, delta: -0.32 },
  { symbol: "SPY", underlying: "S&P 500 ETF", type: "Call", strike: 590, expiry: "Mar 21", premium: 6.30, change: 8.9, iv: 14.2, volume: 320000, oi: 890000, delta: 0.52 },
  { symbol: "SPY", underlying: "S&P 500 ETF", type: "Put", strike: 580, expiry: "Mar 21", premium: 4.45, change: -6.1, iv: 15.8, volume: 285000, oi: 760000, delta: -0.40 },
  { symbol: "QQQ", underlying: "NASDAQ-100 ETF", type: "Call", strike: 510, expiry: "Mar 21", premium: 8.20, change: 14.3, iv: 18.5, volume: 180000, oi: 520000, delta: 0.50 },
  { symbol: "AMZN", underlying: "Amazon", type: "Call", strike: 190, expiry: "Mar 21", premium: 5.60, change: 9.8, iv: 32.1, volume: 56800, oi: 142000, delta: 0.46 },
];

const INDICES: AssetItem[] = [
  { symbol: "^GSPC", name: "S&P 500", price: 5892.41, change: 0.34, extra: "US Large Cap", sparkline: mkSparkline(5880, 25) },
  { symbol: "^IXIC", name: "NASDAQ Composite", price: 19234.11, change: 0.59, extra: "US Tech-heavy", sparkline: mkSparkline(19200, 60) },
  { symbol: "^DJI", name: "Dow Jones", price: 43128.90, change: -0.12, extra: "US Blue Chip", sparkline: mkSparkline(43100, 100) },
  { symbol: "^RUT", name: "Russell 2000", price: 2045.30, change: 0.42, extra: "US Small Cap", sparkline: mkSparkline(2040, 12) },
  { symbol: "^VIX", name: "CBOE Volatility", price: 14.32, change: -4.53, extra: "Fear Gauge", sparkline: mkSparkline(14.5, 1.5) },
  { symbol: "^GSPTSE", name: "S&P/TSX", price: 24856.30, change: 0.35, extra: "Canada", sparkline: mkSparkline(24800, 50) },
  { symbol: "^FTSE", name: "FTSE 100", price: 8245.60, change: 0.39, extra: "UK", sparkline: mkSparkline(8230, 30) },
  { symbol: "^GDAXI", name: "DAX", price: 18456.80, change: -0.13, extra: "Germany", sparkline: mkSparkline(18450, 40) },
  { symbol: "^N225", name: "Nikkei 225", price: 38542.60, change: 0.64, extra: "Japan", sparkline: mkSparkline(38400, 150) },
  { symbol: "^HSI", name: "Hang Seng", price: 17635.20, change: -0.63, extra: "Hong Kong", sparkline: mkSparkline(17700, 80) },
];

const suggestedForYou = [
  { symbol: "VTI", name: "Vanguard Total Market", reason: "Reduces your single-stock concentration risk" },
  { symbol: "XLV", name: "Health Care Select", reason: "Zero healthcare exposure detected" },
  { symbol: "BND", name: "Vanguard Total Bond", reason: "Adds stability given your high-volatility tilt" },
];

type AssetTab = "stocks" | "futures" | "crypto" | "options" | "indices";

const TABS: { id: AssetTab; label: string; icon: typeof TrendingUp }[] = [
  { id: "stocks", label: "Stocks", icon: TrendingUp },
  { id: "futures", label: "Futures", icon: Flame },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "options", label: "Options", icon: Layers },
  { id: "indices", label: "Indices", icon: BarChart3 },
];

/* ── Helpers ───────────────────────────────────────────────────── */

function formatPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return p.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

/* ── Reusable row component ───────────────────────────────────── */

function AssetRow({ item, index, onClick }: { item: AssetItem; index: number; onClick?: () => void }) {
  const isPositive = item.change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.025 * index }}
      className="glass-card flex w-full cursor-pointer items-center justify-between p-4 text-left transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xs font-bold">
          {item.symbol.replace("^", "").slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-semibold">{item.symbol}</p>
          <p className="text-xs text-muted-foreground">{item.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Sparkline */}
        <div className="hidden h-8 w-16 sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={item.sparkline}>
              <defs>
                <linearGradient id={`sg-${item.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} strokeWidth={1.5} fill={`url(#sg-${item.symbol})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium tabular-nums">${formatPrice(item.price)}</p>
          <div className="flex items-center justify-end gap-1">
            <p className={`flex items-center gap-0.5 text-xs tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
              {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {isPositive ? "+" : ""}{item.change.toFixed(2)}%
            </p>
            {item.extra && <span className="text-[9px] text-muted-foreground">· {item.extra}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Component ───────────────────────────────────────────── */

const Invest = () => {
  const { timezone } = useTimezone();
  const [activeTab, setActiveTab] = useState<AssetTab>("stocks");
  const [activeSector, setActiveSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [optionFilter, setOptionFilter] = useState<"All" | "Call" | "Put">("All");
  const navigate = useNavigate();

  useEffect(() => {
    getTrendingStocks()
      .then(setTrendingStocks)
      .catch((e) => { console.error(e); toast.error("Failed to load market data"); })
      .finally(() => setIsLoadingTrending(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try { setSearchResults(await searchStocks(searchQuery)); }
      catch (e) { console.error(e); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sectors = ["All", ...new Set(trendingStocks.map((s) => s.sector).filter(Boolean))];
  const filteredStocks = trendingStocks.filter((stock) => activeSector === "All" || stock.sector === activeSector);
  const showSearchResults = searchQuery.trim().length > 0;
  const { isOpen: marketOpen, displayTime, tzLabel, statusText: marketStatusText } = useMarketStatus(timezone);

  const filteredOptions = OPTIONS_CHAINS.filter(o => optionFilter === "All" || o.type === optionFilter);

  return (
    <div className="px-5 pb-24 pt-14 lg:pb-8 lg:pt-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Invest</h1>
            <p className="mt-1 text-sm text-muted-foreground">Stocks, futures, crypto, options & indices</p>
          </div>
          <div className="glass-card flex items-center gap-2.5 px-3.5 py-2">
            {marketOpen ? <Sun size={16} className="text-gain" /> : <Moon size={16} className="text-muted-foreground" />}
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${marketOpen ? "bg-gain animate-pulse" : "bg-muted-foreground/40"}`} />
                <span className="text-xs font-medium">{marketOpen ? "Market Open" : "Market Closed"}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{displayTime} {tzLabel} · {marketStatusText}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Class Tabs */}
      <motion.div
        className="mt-4 flex gap-1 rounded-2xl bg-secondary p-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-all ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="invest-tab"
                  className="absolute inset-0 rounded-xl bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Search Bar */}
      <motion.div className="glass-card mt-3 flex items-center gap-2 px-4 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {isSearching && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div className="mt-2 space-y-1" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
            {searchResults.length === 0 && !isSearching && (
              <div className="py-4 text-center text-sm text-muted-foreground">No results found</div>
            )}
            {searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={() => { setSearchQuery(""); navigate(`/invest/${result.symbol}`); }}
                className="glass-card flex w-full items-center justify-between p-3 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-bold">
                    {result.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{result.symbol}</p>
                    <p className="text-xs text-muted-foreground">{result.name}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{result.type} · {result.exchange}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      {!showSearchResults && (
        <AnimatePresence mode="wait">
          {/* ── STOCKS ─────────────────────────────────────────── */}
          {activeTab === "stocks" && (
            <motion.div key="stocks" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Suggested */}
              <div className="mt-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles size={14} className="text-muted-foreground" />
                  <span>Suggested for you</span>
                </div>
                <div className="mt-2 space-y-2">
                  {suggestedForYou.map((s) => (
                    <div key={s.symbol} className="glass-card flex w-full items-center justify-between p-3 transition-shadow hover:shadow-md">
                      <button onClick={() => navigate(`/invest/${s.symbol}`)} className="flex-1 text-left">
                        <p className="text-sm font-semibold">{s.symbol} <span className="font-normal text-muted-foreground">· {s.name}</span></p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{s.reason}</p>
                      </button>
                      <div className="flex items-center gap-1.5 ml-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/chat?q=Tell me about ${s.symbol} (${s.name}) and why it might be a good addition to my portfolio. ${s.reason}`); }}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          title="Ask Maven"
                        >
                          <MessageCircle size={12} />
                          <span className="hidden sm:inline">Ask Maven</span>
                        </button>
                        <button onClick={() => navigate(`/invest/${s.symbol}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector filter */}
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {sectors.map((s) => (
                  <button key={s} onClick={() => setActiveSector(s)} className={`whitespace-nowrap rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${activeSector === s ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Trending */}
              <div className="mt-5 flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} />
                  <span>{activeSector === "All" ? "Trending" : activeSector}</span>
                  <span className="text-[10px] font-normal text-muted-foreground">· Live</span>
                </div>
                <span className="text-xs text-muted-foreground">{filteredStocks.length} stocks</span>
              </div>

              <div className="mt-3 flex gap-6">
                <div className="min-w-0 flex-1 space-y-2 pb-6">
                  {isLoadingTrending && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={20} className="animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isLoadingTrending && filteredStocks.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">No stocks match your filter</div>
                  )}
                  {filteredStocks.map((stock, i) => {
                    const isPositive = stock.change >= 0;
                    const sparkline = mkSparkline(stock.price, stock.price * 0.02);
                    return (
                      <motion.div
                        key={stock.symbol}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.03 * i }}
                        className="glass-card flex w-full cursor-pointer items-center justify-between p-4 text-left transition-shadow hover:shadow-md"
                        onClick={() => navigate(`/invest/${stock.symbol}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xs font-bold">{stock.symbol.slice(0, 2)}</div>
                          <div>
                            <p className="text-sm font-semibold">{stock.symbol}</p>
                            <p className="text-xs text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden h-8 w-16 sm:block">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={sparkline}>
                                <defs>
                                  <linearGradient id={`sg-stock-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke={isPositive ? "hsl(var(--gain))" : "hsl(var(--loss))"} strokeWidth={1.5} fill={`url(#sg-stock-${stock.symbol})`} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium tabular-nums">${stock.price.toFixed(2)}</p>
                            <p className={`flex items-center justify-end gap-0.5 text-xs tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
                              {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                              {isPositive ? "+" : ""}{stock.change.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="hidden xl:block xl:w-72 xl:shrink-0">
                  <PendingTradesWidget />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── FUTURES ────────────────────────────────────────── */}
          {activeTab === "futures" && (
            <motion.div key="futures" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity size={14} className="text-muted-foreground" />
                  <span>Futures trade nearly 24 hours</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Sun 6pm – Fri 5pm ET with a daily 5pm–6pm break. Crypto futures trade 24/7.
                </p>
              </div>
              <div className="space-y-2">
                {FUTURES.map((item, i) => (
                  <AssetRow key={item.symbol} item={item} index={i} onClick={() => navigate(`/invest/${item.symbol}`)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CRYPTO ─────────────────────────────────────────── */}
          {activeTab === "crypto" && (
            <motion.div key="crypto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Bitcoin size={14} className="text-muted-foreground" />
                  <span>Crypto markets are open 24/7</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Prices update continuously. All volumes shown are rolling 24-hour.
                </p>
              </div>

              {/* Quick stats strip */}
              <div className="grid grid-cols-3 gap-2">
                <div className="glass-card px-3 py-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Total Market Cap</p>
                  <p className="text-sm font-semibold">$2.54T</p>
                </div>
                <div className="glass-card px-3 py-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">24h Volume</p>
                  <p className="text-sm font-semibold">$89.2B</p>
                </div>
                <div className="glass-card px-3 py-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">BTC Dominance</p>
                  <p className="text-sm font-semibold">52.4%</p>
                </div>
              </div>

              <div className="space-y-2">
                {CRYPTO.map((item, i) => (
                  <AssetRow key={item.symbol} item={item} index={i} onClick={() => navigate(`/invest/${item.symbol}`)} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── OPTIONS ────────────────────────────────────────── */}
          {activeTab === "options" && (
            <motion.div key="options" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Layers size={14} className="text-muted-foreground" />
                  <span>Most Active Options</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Highest volume contracts across major underlyings. IV = Implied Volatility, OI = Open Interest.
                </p>
              </div>

              {/* Call / Put filter */}
              <div className="flex gap-2">
                {(["All", "Call", "Put"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOptionFilter(f)}
                    className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
                      optionFilter === f ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f === "All" ? "All" : f + "s"}
                  </button>
                ))}
              </div>

              {/* Options table */}
              <div className="space-y-2">
                {filteredOptions.map((opt, i) => (
                  <motion.div
                    key={`${opt.symbol}-${opt.type}-${opt.strike}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="glass-card cursor-pointer p-4 transition-shadow hover:shadow-md"
                    onClick={() => navigate(`/invest/${opt.symbol}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                          opt.type === "Call" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                        }`}>
                          {opt.type}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{opt.symbol} <span className="font-normal text-muted-foreground">${opt.strike}</span></p>
                          <p className="text-[10px] text-muted-foreground">{opt.underlying} · Exp {opt.expiry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">${opt.premium.toFixed(2)}</p>
                        <p className={`text-[10px] font-medium tabular-nums ${opt.change >= 0 ? "text-gain" : "text-loss"}`}>
                          {opt.change >= 0 ? "+" : ""}{opt.change.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex gap-4 border-t border-border/30 pt-2.5">
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">IV</p>
                        <p className="text-xs font-medium tabular-nums">{opt.iv}%</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Delta</p>
                        <p className="text-xs font-medium tabular-nums">{opt.delta.toFixed(2)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Volume</p>
                        <p className="text-xs font-medium tabular-nums">{(opt.volume / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">OI</p>
                        <p className="text-xs font-medium tabular-nums">{(opt.oi / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── INDICES ────────────────────────────────────────── */}
          {activeTab === "indices" && (
            <motion.div key="indices" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BarChart3 size={14} className="text-muted-foreground" />
                  <span>Global Indices</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Major benchmarks across North America, Europe, and Asia-Pacific.
                </p>
              </div>
              <div className="space-y-2">
                {INDICES.map((item, i) => (
                  <AssetRow key={item.symbol} item={item} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Invest;
