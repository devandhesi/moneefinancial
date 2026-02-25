import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Sparkles, Star, Zap, Loader2, Share2 } from "lucide-react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import { getStockQuote, type StockQuote } from "@/lib/market-api";
import { toast } from "sonner";

const chartModes = ["Simple", "Advanced", "Candle"] as const;
type ChartMode = typeof chartModes[number];

const simpleIndicators = ["Volume"] as const;
const advancedIndicators = ["SMA20", "Volume"] as const;
const candleIndicators = ["SMA20", "Volume"] as const;

type AnyIndicator = typeof advancedIndicators[number] | typeof simpleIndicators[number] | typeof candleIndicators[number];

const timeRanges = ["1W", "1M", "3M", "6M", "1Y"] as const;

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [chartMode, setChartMode] = useState<ChartMode>("Simple");
  const [activeIndicators, setActiveIndicators] = useState<Set<AnyIndicator>>(new Set());
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [shares, setShares] = useState(1);
  const [limitPrice, setLimitPrice] = useState("");
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [coachMode, setCoachMode] = useState(true);
  const [showCoachWarning, setShowCoachWarning] = useState(false);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeRange, setActiveRange] = useState<typeof timeRanges[number]>("3M");
  const [pendingOrders, setPendingOrders] = useState<Array<{type: string; shares: number; price: number; time: string}>>([]);

  // Load watchlist state from localStorage
  useEffect(() => {
    if (!symbol) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
      setIsWatchlisted(watchlist.includes(symbol));
    } catch {}
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    setIsLoading(true);
    getStockQuote(symbol)
      .then((data) => {
        setQuote(data);
        setLimitPrice(data.price.toFixed(2));
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load stock data. Try refreshing.");
      })
      .finally(() => setIsLoading(false));
  }, [symbol]);

  const availableIndicators = useMemo(() => {
    if (chartMode === "Simple") return simpleIndicators;
    if (chartMode === "Advanced") return advancedIndicators;
    return candleIndicators;
  }, [chartMode]);

  const toggleIndicator = (ind: AnyIndicator) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      next.has(ind) ? next.delete(ind) : next.add(ind);
      return next;
    });
  };

  const chartData = useMemo(() => {
    if (!quote?.chart) return [];
    return quote.chart.map((point, i, arr) => {
      const sma20Window = arr.slice(Math.max(0, i - 19), i + 1);
      const sma20 = sma20Window.reduce((sum, p) => sum + p.price, 0) / sma20Window.length;
      return {
        ...point,
        sma20: +sma20.toFixed(2),
        bullish: point.close >= point.open,
        candleBody: [Math.min(point.open, point.close), Math.max(point.open, point.close)],
      };
    });
  }, [quote]);

  const currentPrice = quote?.price ?? 0;
  const changePercent = quote?.changePercent ?? 0;
  const isPositive = changePercent >= 0;

  const purchaseValue = shares * currentPrice;
  const portfolioValue = 12438.5;
  const currentTechPct = 68;
  const newPortfolioValue = portfolioValue + purchaseValue;
  const newTechPct = ((currentTechPct / 100 * portfolioValue + purchaseValue) / newPortfolioValue * 100).toFixed(1);
  const healthChange = Number(newTechPct) > 72 ? -3 : Number(newTechPct) > 70 ? -1 : 1;

  const toggleWatchlist = () => {
    if (!symbol) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem("monee-watchlist") || "[]") as string[];
      let updated: string[];
      if (watchlist.includes(symbol)) {
        updated = watchlist.filter((s) => s !== symbol);
        toast.success(`${symbol} removed from watchlist`);
      } else {
        updated = [...watchlist, symbol];
        toast.success(`${symbol} added to watchlist`);
      }
      localStorage.setItem("monee-watchlist", JSON.stringify(updated));
      setIsWatchlisted(!isWatchlisted);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${symbol} - $${currentPrice.toFixed(2)} (${isPositive ? "+" : ""}${changePercent.toFixed(2)}%)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${symbol} Stock`, text, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Link copied to clipboard");
    }
  };

  const handleBuy = () => {
    if (shares <= 0) {
      toast.error("Enter a valid number of shares");
      return;
    }
    if (coachMode && Number(newTechPct) > 70) {
      setShowCoachWarning(true);
      return;
    }
    executeBuy();
  };

  const executeBuy = () => {
    const price = orderType === "limit" ? Number(limitPrice) : currentPrice;
    const order = {
      type: orderType === "limit" ? "Limit Buy" : "Market Buy",
      shares,
      price,
      time: new Date().toLocaleTimeString(),
    };
    setPendingOrders((prev) => [order, ...prev]);
    setShowCoachWarning(false);
    toast.success(
      `📄 Paper ${order.type}: ${shares} share${shares > 1 ? "s" : ""} of ${symbol} at $${price.toFixed(2)}`,
      { description: `Total: $${(shares * price).toFixed(2)}` }
    );
  };

  const handleSell = () => {
    if (shares <= 0) {
      toast.error("Enter a valid number of shares");
      return;
    }
    const price = orderType === "limit" ? Number(limitPrice) : currentPrice;
    const order = {
      type: orderType === "limit" ? "Limit Sell" : "Market Sell",
      shares,
      price,
      time: new Date().toLocaleTimeString(),
    };
    setPendingOrders((prev) => [order, ...prev]);
    toast.success(
      `📄 Paper ${order.type}: ${shares} share${shares > 1 ? "s" : ""} of ${symbol} at $${price.toFixed(2)}`,
      { description: `Total: $${(shares * price).toFixed(2)}` }
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass-card-strong px-3 py-2 text-xs">
        <p className="font-semibold">{label}</p>
        {chartMode === "Candle" ? (
          <>
            <p>O: ${d?.open} H: ${d?.high}</p>
            <p>L: ${d?.low} C: ${d?.close}</p>
          </>
        ) : (
          <p>Price: <span className="font-medium">${d?.price}</span></p>
        )}
        <p>Volume: <span className="font-medium">{d?.volume}M</span></p>
      </div>
    );
  };

  const CandleShape = (props: any) => {
    const { x, width, payload } = props;
    if (!payload) return null;
    const { open, close, high, low, bullish } = payload;
    const allLows = chartData.map(d => d.low).filter(Boolean);
    const allHighs = chartData.map(d => d.high).filter(Boolean);
    const yScale = (val: number) => {
      const domain = [Math.min(...allLows) - 5, Math.max(...allHighs) + 5];
      const range = [280, 8];
      return range[0] + ((val - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
    };
    const color = bullish ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)";
    const bodyTop = yScale(Math.max(open, close));
    const bodyBottom = yScale(Math.min(open, close));
    const wickTop = yScale(high);
    const wickBottom = yScale(low);
    const barW = Math.max(width * 0.6, 2);
    const cx = x + width / 2;

    return (
      <g>
        <line x1={cx} x2={cx} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={1} />
        <rect x={cx - barW / 2} y={bodyTop} width={barW} height={Math.max(bodyBottom - bodyTop, 1)} fill={color} rx={1} />
      </g>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{symbol}</h1>
          <p className="text-sm text-muted-foreground">{quote?.name || "Stock Detail"}</p>
        </div>
        <button onClick={handleShare} className="rounded-xl p-2 hover:bg-secondary" title="Share">
          <Share2 size={18} className="text-muted-foreground" />
        </button>
        <button onClick={toggleWatchlist} className="rounded-xl p-2 hover:bg-secondary" title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}>
          <Star size={18} className={isWatchlisted ? "fill-foreground text-foreground" : "text-muted-foreground"} />
        </button>
      </motion.div>

      {/* Price Hero */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <p className="text-3xl font-semibold">${currentPrice.toFixed(2)}</p>
        <p className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-gain" : "text-loss"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {isPositive ? "+" : ""}{quote?.change?.toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%) today
        </p>
      </motion.div>

      <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-center text-[11px] text-muted-foreground">
        📄 Simulated Trading · Real market data, paper trades
      </div>

      {/* Chart Mode + Time Range */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {chartModes.map((mode) => (
            <button key={mode} onClick={() => { setChartMode(mode); setActiveIndicators(new Set()); }}
              className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${chartMode === mode ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
              {mode}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <button key={range} onClick={() => {
              setActiveRange(range);
              toast.info(`Chart range: ${range}`, { duration: 1500 });
            }}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-all ${activeRange === range ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {availableIndicators.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {availableIndicators.map((ind) => (
            <button key={ind} onClick={() => toggleIndicator(ind)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${activeIndicators.has(ind) ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
              {ind}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)"} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={isPositive ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              {chartMode !== "Simple" && <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,89%)" strokeOpacity={0.5} />}
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(220,8%,50%)" }} interval={Math.floor(chartData.length / 6)} />
              <YAxis yAxisId="price" hide domain={["dataMin - 5", "dataMax + 5"]} />
              <YAxis yAxisId="volume" hide orientation="right" domain={[0, "dataMax + 50"]} />
              <Tooltip content={<CustomTooltip />} />
              {activeIndicators.has("Volume") && <Bar yAxisId="volume" dataKey="volume" fill="hsl(220,8%,85%)" opacity={0.4} />}
              {chartMode !== "Candle" && <Area yAxisId="price" type="monotone" dataKey="price" stroke={isPositive ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)"} strokeWidth={chartMode === "Simple" ? 2 : 1.5} fill="url(#priceGrad)" />}
              {chartMode === "Candle" && <Bar yAxisId="price" dataKey="candleBody" shape={<CandleShape />} />}
              {activeIndicators.has("SMA20") && <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="hsl(215,60%,55%)" strokeWidth={1} dot={false} />}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No chart data available</div>
        )}
      </motion.div>

      {/* What If */}
      <motion.button onClick={() => setShowWhatIf(!showWhatIf)}
        className="glass-card mt-4 flex w-full items-center justify-center gap-2 p-3 text-sm font-medium transition-all hover:shadow-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
        <Zap size={14} className="text-muted-foreground" />
        {showWhatIf ? "Hide What If" : "What If I…"}
      </motion.button>

      <AnimatePresence>
        {showWhatIf && (
          <motion.div className="glass-card mt-2 p-4" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-muted-foreground">Shares:</span>
              <div className="flex items-center gap-2">
                {[1, 5, 10, 25, 50, 100].map((n) => (
                  <button key={n} onClick={() => setShares(n)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${shares === n ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Purchase Value</span><span className="font-medium">${purchaseValue.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">New Portfolio Value</span><span className="font-medium">${newPortfolioValue.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tech Allocation</span><span className={`font-medium ${Number(newTechPct) > 70 ? "text-loss" : ""}`}>{currentTechPct}% → {newTechPct}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Health Score Impact</span><span className={`font-medium ${healthChange < 0 ? "text-loss" : "text-gain"}`}>{healthChange > 0 ? "+" : ""}{healthChange} pts</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Projected Annual Cost</span><span className="font-medium">${(purchaseValue * 0.002).toFixed(2)} (MER)</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Stats */}
      <motion.div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {[
          { label: "Open", value: quote ? `$${quote.open.toFixed(2)}` : "—" },
          { label: "High", value: quote ? `$${quote.dayHigh.toFixed(2)}` : "—" },
          { label: "Low", value: quote ? `$${quote.dayLow.toFixed(2)}` : "—" },
          { label: "Mkt Cap", value: quote?.marketCap || "—" },
          { label: "P/E", value: quote?.peRatio || "—" },
          { label: "52W High", value: quote ? `$${quote.fiftyTwoWeekHigh.toFixed(2)}` : "—" },
          { label: "52W Low", value: quote ? `$${quote.fiftyTwoWeekLow.toFixed(2)}` : "—" },
          { label: "Avg Vol", value: quote?.avgVolume || "—" },
        ].map((s) => (
          <div key={s.label} className="glass-card px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-xs font-semibold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* AI Analysis */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={14} className="text-muted-foreground" />
          <span>Maven Analysis</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {quote ? (
            <>
              {quote.name} ({symbol}) is trading at ${quote.price.toFixed(2)}, {isPositive ? "up" : "down"} {Math.abs(quote.changePercent).toFixed(2)}% today.
              {quote.peRatio !== "N/A" && ` P/E ratio of ${quote.peRatio}.`}
              {quote.beta && ` Beta of ${quote.beta.toFixed(2)} suggests ${quote.beta > 1 ? "higher" : "lower"} volatility than the market.`}
              {" "}Adding {shares} share{shares > 1 ? "s" : ""} would shift your tech allocation to {newTechPct}%.
            </>
          ) : "Loading analysis..."}
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="mt-3 text-xs font-medium text-foreground underline-offset-2 hover:underline"
        >
          Ask Maven for deeper analysis →
        </button>
      </motion.div>

      {/* Order Ticket */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Simulated Order</h3>
          <button onClick={() => {
            setCoachMode(!coachMode);
            toast.info(coachMode ? "Coach Mode disabled" : "Coach Mode enabled — Maven will warn you about risky trades", { duration: 2000 });
          }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${coachMode ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
            <Sparkles size={10} />
            Coach {coachMode ? "ON" : "OFF"}
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setOrderType("market")} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${orderType === "market" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>Market</button>
          <button onClick={() => setOrderType("limit")} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${orderType === "limit" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>Limit</button>
        </div>
        {orderType === "limit" && (
          <div className="glass-input mt-3 px-3 py-2">
            <label className="text-[10px] text-muted-foreground">Limit Price</label>
            <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} step="0.01" className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none" />
          </div>
        )}
        <div className="glass-input mt-2 px-3 py-2">
          <label className="text-[10px] text-muted-foreground">Shares</label>
          <input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value) || 1)} min={1} className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Estimated Total</span>
          <span className="font-medium text-foreground">${(shares * (orderType === "limit" ? Number(limitPrice) : currentPrice)).toFixed(2)}</span>
        </div>

        <AnimatePresence>
          {showCoachWarning && (
            <motion.div className="mt-3 rounded-xl bg-loss/5 border border-loss/10 p-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="flex items-center gap-2 text-xs font-medium text-loss">
                <Sparkles size={12} />
                Maven Coach Warning
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                This trade increases your tech exposure to {newTechPct}%. Your portfolio health score would drop by {Math.abs(healthChange)} points. Proceed with caution.
              </p>
              <div className="mt-2 flex gap-2">
                <button onClick={executeBuy} className="rounded-lg bg-foreground px-3 py-1.5 text-[11px] font-medium text-primary-foreground">Proceed Anyway</button>
                <button onClick={() => setShowCoachWarning(false)} className="rounded-lg glass-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={handleBuy} className="rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]">Buy (Paper)</button>
          <button onClick={handleSell} className="glass-card py-3 text-sm font-medium transition-transform active:scale-[0.98]">Sell (Paper)</button>
        </div>
      </motion.div>

      {/* Recent Paper Orders */}
      <AnimatePresence>
        {pendingOrders.length > 0 && (
          <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-sm font-medium mb-3">Session Orders</h3>
            <div className="space-y-2">
              {pendingOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div>
                    <span className={`font-medium ${order.type.includes("Buy") ? "text-gain" : "text-loss"}`}>{order.type}</span>
                    <span className="text-muted-foreground"> · {order.shares} shares</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">${(order.shares * order.price).toFixed(2)}</span>
                    <span className="text-muted-foreground ml-2">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StockDetail;
