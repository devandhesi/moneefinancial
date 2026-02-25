import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, TrendingUp, ArrowUpRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => {
      try {
        setWatchlist(JSON.parse(localStorage.getItem("monee-watchlist") || "[]"));
      } catch {
        setWatchlist([]);
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter((s) => s !== symbol);
    localStorage.setItem("monee-watchlist", JSON.stringify(updated));
    setWatchlist(updated);
    toast.success(`${symbol} removed from watchlist`);
  };

  const filtered = watchlist.filter((s) =>
    s.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {watchlist.length} stock{watchlist.length !== 1 ? "s" : ""} saved
        </p>
      </motion.div>

      {/* Search */}
      {watchlist.length > 3 && (
        <motion.div
          className="glass-card flex items-center gap-3 px-4 py-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter watchlist..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </motion.div>
      )}

      {/* Empty state */}
      {watchlist.length === 0 && (
        <motion.div
          className="glass-card flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-4 rounded-2xl bg-secondary p-4">
            <Star size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium">No stocks saved yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            Star stocks from the Invest page to add them to your watchlist for
            quick access.
          </p>
          <button
            onClick={() => navigate("/invest")}
            className="mt-5 flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <TrendingUp size={16} />
            Browse Stocks
          </button>
        </motion.div>
      )}

      {/* Watchlist items */}
      <AnimatePresence mode="popLayout">
        {filtered.map((symbol, i) => (
          <motion.div
            key={symbol}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card group flex cursor-pointer items-center justify-between px-5 py-4 transition-shadow hover:shadow-md"
            onClick={() => navigate(`/invest/${symbol}`)}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Star
                  size={16}
                  className="fill-foreground text-foreground"
                />
              </div>
              <div>
                <p className="text-sm font-semibold">{symbol}</p>
                <p className="text-xs text-muted-foreground">Tap to view details</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ArrowUpRight
                size={16}
                className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWatchlist(symbol);
                }}
                className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                title="Remove from watchlist"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filter && filtered.length === 0 && watchlist.length > 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No stocks matching "{filter}"
        </p>
      )}
    </div>
  );
};

export default Watchlist;
