import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getStockQuote } from "@/lib/market-api";
import { supabase } from "@/integrations/supabase/client";

interface WatchlistItem {
  symbol: string;
  price?: number;
  change?: number;
  changePct?: number;
  loading: boolean;
  suggestion?: string;
  suggestionLoading?: boolean;
}

const Watchlist = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  // Load watchlist and fetch prices
  useEffect(() => {
    const load = async () => {
      try {
        const symbols: string[] = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
        if (symbols.length === 0) { setItems([]); return; }
        
        setItems(symbols.map(s => ({ symbol: s, loading: true })));

        // Fetch prices in parallel
        const results = await Promise.allSettled(
          symbols.map(async (symbol) => {
            const quote = await getStockQuote(symbol, "1D");
            return { symbol, price: quote.price, change: quote.change, changePct: quote.changePercent };
          })
        );

        setItems(symbols.map((symbol, i) => {
          const result = results[i];
          if (result.status === "fulfilled") {
            return { ...result.value, loading: false };
          }
          return { symbol, loading: false };
        }));
      } catch {
        const symbols: string[] = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
        setItems(symbols.map(s => ({ symbol: s, loading: false })));
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch AI suggestions for all items
  const fetchSuggestions = async () => {
    const symbolsWithPrices = items.filter(i => i.price);
    if (symbolsWithPrices.length === 0) return;

    setItems(prev => prev.map(i => ({ ...i, suggestionLoading: true })));

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Give me a one-word recommendation (Buy, Sell, or Hold) and a one-sentence reason for each of these stocks I'm watching: ${symbolsWithPrices.map(i => `${i.symbol} at $${i.price?.toFixed(2)} (${i.changePct && i.changePct >= 0 ? "+" : ""}${i.changePct?.toFixed(2)}% today)`).join(", ")}. Format: SYMBOL: Recommendation - Reason`
            }
          ]
        }
      });

      // Parse streaming response
      if (data) {
        const text = typeof data === "string" ? data : "";
        // Set suggestions from response
        setItems(prev => prev.map(i => {
          const regex = new RegExp(`${i.symbol}:\\s*(Buy|Sell|Hold)\\s*[-–]\\s*(.+?)(?=\\n|$)`, "i");
          const match = text.match(regex);
          return {
            ...i,
            suggestion: match ? `${match[1]} — ${match[2].trim()}` : undefined,
            suggestionLoading: false,
          };
        }));
      }
    } catch {
      setItems(prev => prev.map(i => ({ ...i, suggestionLoading: false })));
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    const watchlist: string[] = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
    const updated = watchlist.filter((s) => s !== symbol);
    localStorage.setItem("monee-watchlist", JSON.stringify(updated));
    setItems(prev => prev.filter(i => i.symbol !== symbol));
    toast.success(`${symbol} removed from watchlist`);
  };

  const filtered = items.filter((i) =>
    i.symbol.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} stock{items.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={fetchSuggestions}
              className="glass-card flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:shadow-md"
            >
              <Sparkles size={13} />
              Get AI Signals
            </button>
          )}
        </div>
      </motion.div>

      {/* Search */}
      {items.length > 3 && (
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
      {items.length === 0 && (
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
        {filtered.map((item, i) => (
          <motion.div
            key={item.symbol}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
            onClick={() => navigate(`/invest/${item.symbol}`)}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Star size={16} className="fill-foreground text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.symbol}</p>
                  {item.loading ? (
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  ) : item.price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">${item.price.toFixed(2)}</span>
                      <span className={`flex items-center gap-0.5 text-xs ${(item.changePct ?? 0) >= 0 ? "text-gain" : "text-loss"}`}>
                        {(item.changePct ?? 0) >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {(item.changePct ?? 0) >= 0 ? "+" : ""}{item.changePct?.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Tap to view</p>
                  )}
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
                    removeFromWatchlist(item.symbol);
                  }}
                  className="rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  title="Remove from watchlist"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* AI Suggestion */}
            {item.suggestionLoading && (
              <div className="border-t border-border/30 px-5 py-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Analyzing...</span>
              </div>
            )}
            {item.suggestion && !item.suggestionLoading && (
              <div className="border-t border-border/30 px-5 py-2.5 flex items-center gap-2">
                <Sparkles size={12} className="shrink-0 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{item.suggestion}</span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {filter && filtered.length === 0 && items.length > 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No stocks matching "{filter}"
        </p>
      )}
    </div>
  );
};

export default Watchlist;
