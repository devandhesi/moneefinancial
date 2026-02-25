import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Search, Sparkles, X, Loader2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import PendingTradesWidget from "@/components/widgets/PendingTradesWidget";
import { searchStocks, getTrendingStocks, type TrendingStock, type StockSearchResult } from "@/lib/market-api";
import { toast } from "sonner";

const suggestedForYou = [
  { symbol: "VTI", name: "Vanguard Total Market", reason: "Reduces your single-stock concentration risk" },
  { symbol: "XLV", name: "Health Care Select", reason: "Zero healthcare exposure detected" },
  { symbol: "BND", name: "Vanguard Total Bond", reason: "Adds stability given your high-volatility tilt" },
];

const Invest = () => {
  const [activeSector, setActiveSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistOpen, setWatchlistOpen] = useState(true);
  const navigate = useNavigate();

  // Load watchlist
  useEffect(() => {
    const load = () => {
      try { setWatchlist(JSON.parse(localStorage.getItem("monee-watchlist") || "[]")); } catch { setWatchlist([]); }
    };
    load();
    const handleStorage = (e: StorageEvent) => { if (e.key === "monee-watchlist") load(); };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(s => s !== symbol);
    localStorage.setItem("monee-watchlist", JSON.stringify(updated));
    setWatchlist(updated);
    toast.success(`${symbol} removed from watchlist`);
  };

  // Load trending stocks on mount
  useEffect(() => {
    getTrendingStocks()
      .then(setTrendingStocks)
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load market data");
      })
      .finally(() => setIsLoadingTrending(false));
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchStocks(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const sectors = ["All", ...new Set(trendingStocks.map((s) => s.sector).filter(Boolean))];

  const filteredStocks = trendingStocks.filter((stock) => {
    return activeSector === "All" || stock.sector === activeSector;
  });

  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className="px-5 pt-14 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Invest</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse, analyze, and simulate trades · Live data</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div className="glass-card mt-4 flex items-center gap-2 px-4 py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <Search size={16} className="text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search any stock, ETF, or company..."
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
          <motion.div
            className="mt-2 space-y-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {searchResults.length === 0 && !isSearching && (
              <div className="py-4 text-center text-sm text-muted-foreground">No results found</div>
            )}
            {searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={() => {
                  setSearchQuery("");
                  navigate(`/invest/${result.symbol}`);
                }}
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

      {/* Watchlist */}
      {!showSearchResults && watchlist.length > 0 && (
        <motion.div className="mt-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <button onClick={() => setWatchlistOpen(!watchlistOpen)} className="flex w-full items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2">
              <Star size={14} className="text-muted-foreground" />
              Watchlist
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">{watchlist.length}</span>
            </span>
            {watchlistOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {watchlistOpen && (
              <motion.div className="mt-2 flex gap-2 overflow-x-auto pb-1" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                {watchlist.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => navigate(`/invest/${symbol}`)}
                    className="glass-card group flex shrink-0 items-center gap-2 px-3 py-2 transition-shadow hover:shadow-md"
                  >
                    <Star size={12} className="fill-foreground text-foreground" />
                    <span className="text-xs font-semibold">{symbol}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromWatchlist(symbol); }}
                      className="ml-1 rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Rest of page hidden during search */}
      {!showSearchResults && (
        <>
          <motion.div className="mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size={14} className="text-muted-foreground" />
              <span>Suggested for you</span>
            </div>
            <div className="mt-2 space-y-2">
              {suggestedForYou.map((s) => (
                <button key={s.symbol} onClick={() => navigate(`/invest/${s.symbol}`)} className="glass-card flex w-full items-center justify-between p-3 text-left transition-shadow hover:shadow-md">
                  <div>
                    <p className="text-sm font-semibold">{s.symbol} <span className="font-normal text-muted-foreground">· {s.name}</span></p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{s.reason}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sector filter */}
          <motion.div className="mt-5 flex gap-2 overflow-x-auto pb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            {sectors.map((s) => (
              <button key={s} onClick={() => setActiveSector(s)} className={`whitespace-nowrap rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${activeSector === s ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </motion.div>

          {/* Trending */}
          <motion.div className="mt-5 flex items-center justify-between text-sm font-medium" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} />
              <span>{activeSector === "All" ? "Trending" : activeSector}</span>
              <span className="text-[10px] font-normal text-muted-foreground">· Live</span>
            </div>
            <span className="text-xs text-muted-foreground">{filteredStocks.length} stocks</span>
          </motion.div>

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
                return (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.03 * i }}
                    className="glass-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md cursor-pointer"
                    onClick={() => navigate(`/invest/${stock.symbol}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xs font-bold">{stock.symbol.slice(0, 2)}</div>
                      <div>
                        <p className="text-sm font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${stock.price.toFixed(2)}</p>
                      <p className={`flex items-center justify-end gap-0.5 text-xs ${isPositive ? "text-gain" : "text-loss"}`}>
                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {Math.abs(stock.change)}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pending panel (desktop) */}
            <div className="hidden xl:block xl:w-72 xl:shrink-0">
              <PendingTradesWidget />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Invest;
