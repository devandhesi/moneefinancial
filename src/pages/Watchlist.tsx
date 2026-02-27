import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Loader2, Sparkles, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getStockQuote } from "@/lib/market-api";
import { streamChat } from "@/lib/chat-stream";
import MicroSparkline from "@/components/widgets/MicroSparkline";

import StockAlertButton from "@/components/StockAlertButton";
import { useWatchlist } from "@/hooks/use-watchlist";

interface WatchlistItem {
  symbol: string;
  price?: number;
  change?: number;
  changePct?: number;
  loading: boolean;
  suggestion?: string;
  suggestionLoading?: boolean;
  signal?: "Buy" | "Sell" | "Hold";
  reason?: string;
  sparkData?: number[];
}

const SIGNAL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Buy: { bg: "bg-gain/15", text: "text-gain", label: "BUY" },
  Sell: { bg: "bg-loss/15", text: "text-loss", label: "SELL" },
  Hold: { bg: "bg-muted", text: "text-muted-foreground", label: "HOLD" },
};

const Watchlist = () => {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();
  const { symbols: watchlistSymbols, removeSymbol, loading: watchlistLoading } = useWatchlist();

  // Load prices when watchlist symbols change
  useEffect(() => {
    if (watchlistLoading) return;
    const load = async () => {
      const symbols = watchlistSymbols;
      if (symbols.length === 0) { setItems([]); return; }
      
      setItems(symbols.map(s => ({ symbol: s, loading: true })));

      const results = await Promise.allSettled(
        symbols.map(async (symbol) => {
          const quote = await getStockQuote(symbol, "1D");
          const sparkData = quote.chart?.map((p) => p.close).filter(Boolean) || [];
          return { symbol, price: quote.price, change: quote.change, changePct: quote.changePercent, sparkData };
        })
      );

      setItems(symbols.map((symbol, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          return { ...result.value, loading: false };
        }
        return { symbol, loading: false };
      }));
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [watchlistSymbols, watchlistLoading]);

  // Fetch AI signals
  const fetchSuggestions = async () => {
    const symbolsWithPrices = items.filter(i => i.price);
    if (symbolsWithPrices.length === 0) return;

    setItems(prev => prev.map(i => ({ ...i, suggestionLoading: true })));

    let fullText = "";

    try {
      await streamChat({
        messages: [
          {
            role: "user",
            content: `For each stock, give a recommendation (Buy, Sell, or Hold) and a concise 1-sentence reason. Consider current price action, momentum, and risk.

Stocks: ${symbolsWithPrices.map(i => `${i.symbol} at $${i.price?.toFixed(2)} (${i.changePct && i.changePct >= 0 ? "+" : ""}${i.changePct?.toFixed(2)}% today)`).join(", ")}

Format each as: SYMBOL: Buy|Sell|Hold - Reason`
          }
        ],
        onDelta: (chunk) => {
          fullText += chunk;
        },
        onDone: () => {
          setItems(prev => prev.map(i => {
            const regex = new RegExp(`${i.symbol}:\\s*(Buy|Sell|Hold)\\s*[-–]\\s*(.+?)(?=\\n|$)`, "i");
            const match = fullText.match(regex);
            if (match) {
              const signal = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase() as "Buy" | "Sell" | "Hold";
              return { ...i, signal, reason: match[2].trim(), suggestionLoading: false };
            }
            return { ...i, suggestionLoading: false };
          }));
        },
        onError: () => {
          setItems(prev => prev.map(i => ({ ...i, suggestionLoading: false })));
          toast.error("Failed to get AI signals");
        },
      });
    } catch {
      setItems(prev => prev.map(i => ({ ...i, suggestionLoading: false })));
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    await removeSymbol(symbol);
    setItems(prev => prev.filter(i => i.symbol !== symbol));
    toast.success(`${symbol} removed from watchlist`);
  };

  const filtered = items.filter((i) =>
    i.symbol.toLowerCase().includes(filter.toLowerCase())
  );

  const buyAlerts = items.filter(i => i.signal === "Buy");

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 space-y-5">
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

      {/* Buy Alerts Banner */}
      <AnimatePresence>
        {buyAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-gain/20 bg-gain/8 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bell size={14} className="text-gain" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gain">Buy Alerts</span>
            </div>
            <div className="space-y-1.5">
              {buyAlerts.map(item => (
                <div
                  key={item.symbol}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/invest/${item.symbol}`)}
                >
                  <span className="text-sm font-bold text-gain">{item.symbol}</span>
                  <span className="text-[11px] text-gain/80">{item.reason}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            Star stocks from the Invest page to add them to your watchlist for quick access.
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
        {filtered.map((item, i) => {
          const isPositive = (item.changePct ?? 0) >= 0;
          const signalStyle = item.signal ? SIGNAL_STYLES[item.signal] : null;

          return (
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
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Star size={16} className="fill-foreground text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{item.symbol}</p>
                      {signalStyle && (
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${signalStyle.bg} ${signalStyle.text}`}>
                          {signalStyle.label}
                        </span>
                      )}
                    </div>
                    {item.loading ? (
                      <Loader2 size={12} className="animate-spin text-muted-foreground" />
                    ) : item.price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">${item.price.toFixed(2)}</span>
                        <span className={`flex items-center gap-0.5 text-xs ${isPositive ? "text-gain" : "text-loss"}`}>
                          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {isPositive ? "+" : ""}{item.changePct?.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Tap to view</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Micro sparkline */}
                  {item.sparkData && item.sparkData.length > 2 && (
                    <MicroSparkline data={item.sparkData} positive={isPositive} width={72} height={28} />
                  )}
                  
                  <StockAlertButton symbol={item.symbol} currentPrice={item.price} compact />
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

              {/* AI Reason */}
              {item.suggestionLoading && (
                <div className="border-t border-border/30 px-5 py-2 flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">Analyzing...</span>
                </div>
              )}
              {item.reason && !item.suggestionLoading && (
                <div className="border-t border-border/30 px-5 py-2.5 flex items-center gap-2">
                  <Sparkles size={12} className="shrink-0 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{item.reason}</span>
                </div>
              )}
            </motion.div>
          );
        })}
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
