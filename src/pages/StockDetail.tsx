import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Sparkles, Star, Zap, Loader2, Share2, ZoomIn, ZoomOut, RotateCcw, Ruler, Bell, BellOff } from "lucide-react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Brush, ReferenceArea, ReferenceLine,
} from "recharts";
import { getStockQuote, type StockQuote } from "@/lib/market-api";
import HeatBadgeInline from "@/components/widgets/HeatBadgeInline";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const chartModes = ["Simple", "Candle"] as const;
type ChartMode = typeof chartModes[number];

const allIndicators = ["Volume", "SMA20", "EMA12", "BB", "VWAP"] as const;
type AnyIndicator = "SMA20" | "EMA12" | "Volume" | "BB" | "RSI" | "MACD" | "VWAP";

const timeRanges = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
type TimeRange = typeof timeRanges[number];

const formatVolume = (v: number): string => {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toString();
};

const formatPrice = (p: number): string => {
  if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(2);
  return p.toFixed(4);
};

// Alert types
const ALERT_TYPES = [
  { value: "price_above", label: "Price goes above", icon: "📈" },
  { value: "price_below", label: "Price drops below", icon: "📉" },
  { value: "percent_change", label: "% change exceeds", icon: "📊" },
  { value: "sudden_move", label: "Sudden movement", icon: "⚡" },
];

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeRange, setActiveRange] = useState<TimeRange>("3M");
  const [pendingOrders, setPendingOrders] = useState<Array<{type: string; shares: number; price: number; time: string}>>([]);
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(100);
  const [measureFrom, setMeasureFrom] = useState<string | null>(null);
  const [measureTo, setMeasureTo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [measureResult, setMeasureResult] = useState<{ fromPrice: number; toPrice: number; fromDate: string; toDate: string } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef(0);

  // Alerts state
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newAlertType, setNewAlertType] = useState("price_above");
  const [newAlertValue, setNewAlertValue] = useState("");

  // Load alerts
  useEffect(() => {
    if (!user || !symbol) return;
    supabase.from("stock_alerts").select("*").eq("user_id", user.id).eq("symbol", symbol.toUpperCase()).then(({ data }) => {
      if (data) setAlerts(data);
    });
  }, [user, symbol]);

  const createAlert = async () => {
    if (!user || !symbol) return;
    const val = newAlertType === "sudden_move" ? null : parseFloat(newAlertValue);
    if (newAlertType !== "sudden_move" && (!val || isNaN(val))) {
      toast.error("Enter a valid target value");
      return;
    }
    const { data, error } = await supabase.from("stock_alerts").insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      alert_type: newAlertType,
      target_value: val,
    }).select().single();
    if (error) { toast.error("Failed to create alert"); return; }
    setAlerts(prev => [...prev, data]);
    setNewAlertValue("");
    toast.success(`Alert created for ${symbol.toUpperCase()}`);
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("stock_alerts").delete().eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success("Alert removed");
  };

  // Load watchlist
  useEffect(() => {
    if (!symbol) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
      setIsWatchlisted(watchlist.includes(symbol));
    } catch {}
  }, [symbol]);

  const fetchData = useCallback(async (sym: string, range: TimeRange, isInitial: boolean) => {
    const id = ++fetchRef.current;
    if (isInitial) setIsLoading(true);
    else setIsChartLoading(true);
    try {
      const data = await getStockQuote(sym, range);
      if (fetchRef.current !== id) return;
      setQuote(data);
      if (isInitial) setLimitPrice(data.price.toFixed(2));
    } catch (e) {
      console.error(e);
      if (fetchRef.current === id) toast.error("Failed to load stock data.");
    } finally {
      if (fetchRef.current === id) { setIsLoading(false); setIsChartLoading(false); }
    }
  }, []);

  useEffect(() => { if (symbol) fetchData(symbol, activeRange, true); }, [symbol]);

  const handleRangeChange = useCallback((range: TimeRange) => {
    if (range === activeRange) return;
    setActiveRange(range);
    resetZoom();
    if (symbol) fetchData(symbol, range, false);
  }, [activeRange, symbol, fetchData]);

  const toggleIndicator = (ind: AnyIndicator) => {
    setActiveIndicators((prev) => { const next = new Set(prev); next.has(ind) ? next.delete(ind) : next.add(ind); return next; });
  };

  const chartData = useMemo(() => {
    if (!quote?.chart) return [];
    const prices = quote.chart.map(p => p.price);
    const ema = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const result: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) result.push(data[i] * k + result[i - 1] * (1 - k));
      return result;
    };
    const ema12Series = ema(prices, 12);
    const ema26Series = ema(prices, 26);
    const macdLine = ema12Series.map((v, i) => v - ema26Series[i]);
    const signalLine = ema(macdLine, 9);
    const rsiSeries: (number | null)[] = [];
    let avgGain = 0, avgLoss = 0;
    for (let i = 0; i < prices.length; i++) {
      if (i === 0) { rsiSeries.push(null); continue; }
      const delta = prices[i] - prices[i - 1];
      const gain = delta > 0 ? delta : 0;
      const loss = delta < 0 ? -delta : 0;
      if (i <= 14) { avgGain += gain; avgLoss += loss; if (i === 14) { avgGain /= 14; avgLoss /= 14; rsiSeries.push(100 - 100 / (1 + avgGain / (avgLoss || 0.001))); } else rsiSeries.push(null); }
      else { avgGain = (avgGain * 13 + gain) / 14; avgLoss = (avgLoss * 13 + loss) / 14; rsiSeries.push(100 - 100 / (1 + avgGain / (avgLoss || 0.001))); }
    }
    let cumVolPrice = 0, cumVol = 0;
    return quote.chart.map((point, i, arr) => {
      const sma20Window = arr.slice(Math.max(0, i - 19), i + 1);
      const sma20 = sma20Window.reduce((sum, p) => sum + p.price, 0) / sma20Window.length;
      const stdDev = Math.sqrt(sma20Window.reduce((sum, p) => sum + (p.price - sma20) ** 2, 0) / sma20Window.length);
      const vol = point.volume || 1;
      const typical = (point.high + point.low + point.close) / 3;
      cumVolPrice += typical * vol;
      cumVol += vol;
      return {
        ...point, sma20: +sma20.toFixed(4), ema12: +ema12Series[i].toFixed(4),
        bbUpper: +(sma20 + 2 * stdDev).toFixed(4), bbLower: +(sma20 - 2 * stdDev).toFixed(4),
        bbBand: [+(sma20 - 2 * stdDev).toFixed(4), +(sma20 + 2 * stdDev).toFixed(4)],
        rsi: rsiSeries[i] != null ? +rsiSeries[i]!.toFixed(2) : null,
        macd: +macdLine[i].toFixed(4), macdSignal: +signalLine[i].toFixed(4), macdHist: +(macdLine[i] - signalLine[i]).toFixed(4),
        vwap: +(cumVolPrice / cumVol).toFixed(4),
        bullish: point.close >= point.open,
        candleBody: [Math.min(point.open, point.close), Math.max(point.open, point.close)],
      };
    });
  }, [quote]);

  const visibleData = useMemo(() => {
    if (chartData.length === 0) return [];
    const startIdx = Math.floor((zoomStart / 100) * chartData.length);
    const endIdx = Math.ceil((zoomEnd / 100) * chartData.length);
    return chartData.slice(Math.max(0, startIdx), Math.min(chartData.length, endIdx));
  }, [chartData, zoomStart, zoomEnd]);

  const isZoomed = zoomStart > 0 || zoomEnd < 100;

  const yDomain = useMemo(() => {
    if (!visibleData.length) return [0, 100];
    const allPrices = visibleData.flatMap(d => [d.high, d.low, d.price].filter(Boolean));
    if (activeIndicators.has("BB")) visibleData.forEach(d => { allPrices.push(d.bbUpper, d.bbLower); });
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.08 || 1;
    return [+(min - padding).toFixed(4), +(max + padding).toFixed(4)];
  }, [visibleData, activeIndicators]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 3 : -3;
    const range = zoomEnd - zoomStart;
    const center = (zoomStart + zoomEnd) / 2;
    const newRange = Math.max(10, Math.min(100, range + delta));
    const newStart = Math.max(0, center - newRange / 2);
    const newEnd = Math.min(100, newStart + newRange);
    setZoomStart(Math.max(0, newEnd - newRange));
    setZoomEnd(newEnd);
  }, [zoomStart, zoomEnd]);

  const handleChartMouseDown = useCallback((e: any) => { if (e?.activeLabel) { setMeasureFrom(e.activeLabel); setMeasureTo(null); setIsDragging(true); setMeasureResult(null); } }, []);
  const handleChartMouseMove = useCallback((e: any) => { if (isDragging && e?.activeLabel) setMeasureTo(e.activeLabel); }, [isDragging]);
  const handleChartMouseUp = useCallback(() => {
    if (isDragging && measureFrom && measureTo && measureFrom !== measureTo) {
      const fromPoint = chartData.find(d => d.date === measureFrom);
      const toPoint = chartData.find(d => d.date === measureTo);
      if (fromPoint && toPoint) setMeasureResult({ fromPrice: fromPoint.price, toPrice: toPoint.price, fromDate: measureFrom, toDate: measureTo });
    }
    setIsDragging(false);
  }, [isDragging, measureFrom, measureTo, chartData]);
  const clearMeasure = () => { setMeasureFrom(null); setMeasureTo(null); setMeasureResult(null); };
  const resetZoom = () => { setZoomStart(0); setZoomEnd(100); clearMeasure(); };
  const zoomIn = () => { const range = zoomEnd - zoomStart; const center = (zoomStart + zoomEnd) / 2; const nr = Math.max(10, range * 0.7); const ns = Math.max(0, center - nr / 2); const ne = Math.min(100, ns + nr); setZoomStart(Math.max(0, ne - nr)); setZoomEnd(ne); };
  const zoomOut = () => { const range = zoomEnd - zoomStart; const center = (zoomStart + zoomEnd) / 2; const nr = Math.min(100, range * 1.4); const ns = Math.max(0, center - nr / 2); const ne = Math.min(100, ns + nr); setZoomStart(Math.max(0, ne - nr)); setZoomEnd(ne); };

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
      if (watchlist.includes(symbol)) { updated = watchlist.filter((s) => s !== symbol); toast.success(`${symbol} removed from watchlist`); }
      else { updated = [...watchlist, symbol]; toast.success(`${symbol} added to watchlist`); }
      localStorage.setItem("monee-watchlist", JSON.stringify(updated));
      setIsWatchlisted(!isWatchlisted);
    } catch {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out ${symbol} - $${formatPrice(currentPrice)} (${isPositive ? "+" : ""}${changePercent.toFixed(2)}%)`;
    if (navigator.share) { try { await navigator.share({ title: `${symbol} Stock`, text, url }); } catch {} }
    else { await navigator.clipboard.writeText(`${text}\n${url}`); toast.success("Link copied to clipboard"); }
  };

  const handleBuy = () => { if (shares <= 0) { toast.error("Enter a valid number of shares"); return; } if (coachMode && Number(newTechPct) > 70) { setShowCoachWarning(true); return; } executeBuy(); };
  const executeBuy = () => {
    const price = orderType === "limit" ? Number(limitPrice) : currentPrice;
    const order = { type: orderType === "limit" ? "Limit Buy" : "Market Buy", shares, price, time: new Date().toLocaleTimeString() };
    setPendingOrders((prev) => [order, ...prev]);
    setShowCoachWarning(false);
    toast.success(`📄 Paper ${order.type}: ${shares} share${shares > 1 ? "s" : ""} of ${symbol} at $${formatPrice(price)}`, { description: `Total: $${formatPrice(shares * price)}` });
  };
  const handleSell = () => {
    if (shares <= 0) { toast.error("Enter a valid number of shares"); return; }
    const price = orderType === "limit" ? Number(limitPrice) : currentPrice;
    const order = { type: orderType === "limit" ? "Limit Sell" : "Market Sell", shares, price, time: new Date().toLocaleTimeString() };
    setPendingOrders((prev) => [order, ...prev]);
    toast.success(`📄 Paper ${order.type}: ${shares} share${shares > 1 ? "s" : ""} of ${symbol} at $${formatPrice(price)}`, { description: `Total: $${formatPrice(shares * price)}` });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-xs shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {chartMode === "Candle" ? (
          <div className="space-y-0.5">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Open</span><span className="font-medium">${formatPrice(d.open)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">High</span><span className="font-medium">${formatPrice(d.high)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Low</span><span className="font-medium">${formatPrice(d.low)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Close</span><span className="font-medium">${formatPrice(d.close)}</span></div>
          </div>
        ) : (
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Price</span><span className="font-medium">${formatPrice(d.price)}</span></div>
        )}
        {d.volume != null && (
          <div className="flex justify-between gap-4 mt-0.5 pt-0.5 border-t border-border/50"><span className="text-muted-foreground">Volume</span><span className="font-medium">{formatVolume(d.volume)}</span></div>
        )}
      </div>
    );
  };

  const renderCandleBar = useCallback((props: any) => {
    const { x, width, payload } = props;
    if (!payload) return null;
    const { open, close, high, low, bullish } = payload;
    const allPrices = visibleData.flatMap(d => [d.high, d.low].filter(Boolean));
    const minP = Math.min(...allPrices); const maxP = Math.max(...allPrices);
    const padding = (maxP - minP) * 0.08 || 1;
    const domainMin = minP - padding; const domainMax = maxP + padding;
    const chartHeight = 290; const chartTop = 8;
    const yScale = (val: number) => chartTop + chartHeight - ((val - domainMin) / (domainMax - domainMin)) * chartHeight;
    const color = bullish ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)";
    const bodyTop = yScale(Math.max(open, close)); const bodyBottom = yScale(Math.min(open, close));
    const wickTop = yScale(high); const wickBottom = yScale(low);
    const barW = Math.max(width * 0.6, 2); const cx = x + width / 2;
    return (<g><line x1={cx} x2={cx} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={1} /><rect x={cx - barW / 2} y={bodyTop} width={barW} height={Math.max(bodyBottom - bodyTop, 1)} fill={color} rx={1} /></g>);
  }, [visibleData]);

  const xTickInterval = useMemo(() => { const len = visibleData.length; if (len <= 10) return 0; if (len <= 30) return Math.floor(len / 6); return Math.floor(len / 8); }, [visibleData]);

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{symbol}</h1>
            {symbol && <HeatBadgeInline symbol={symbol} />}
          </div>
          <p className="text-xs text-muted-foreground">{quote?.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowAlertPanel(!showAlertPanel)} className={`rounded-xl p-2.5 transition-colors ${alerts.length > 0 ? "text-foreground" : "text-muted-foreground"} hover:bg-secondary`} title="Price alerts">
            {alerts.length > 0 ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button onClick={toggleWatchlist} className={`rounded-xl p-2.5 transition-colors ${isWatchlisted ? "text-foreground" : "text-muted-foreground"} hover:bg-secondary`}>
            <Star size={18} className={isWatchlisted ? "fill-current" : ""} />
          </button>
          <button onClick={handleShare} className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary"><Share2 size={18} /></button>
          <button onClick={() => navigate(`/chat?q=Analyze ${symbol} for me`)} className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary" title="Ask Maven"><Sparkles size={18} /></button>
        </div>
      </motion.div>

      {/* Alert Panel */}
      <AnimatePresence>
        {showAlertPanel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-card mt-3 p-4 space-y-3">
            <h3 className="text-sm font-medium">Price Alerts for {symbol?.toUpperCase()}</h3>
            {!user ? (
              <p className="text-xs text-muted-foreground">Sign in to create alerts.</p>
            ) : (
              <>
                <div className="flex gap-2">
                  <select value={newAlertType} onChange={(e) => setNewAlertType(e.target.value)} className="rounded-lg bg-secondary px-2 py-1.5 text-xs outline-none flex-1">
                    {ALERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                  {newAlertType !== "sudden_move" && (
                    <input type="number" value={newAlertValue} onChange={(e) => setNewAlertValue(e.target.value)} placeholder={newAlertType === "percent_change" ? "e.g. 5%" : `e.g. ${currentPrice.toFixed(2)}`} className="rounded-lg bg-secondary px-2 py-1.5 text-xs outline-none w-28" />
                  )}
                  <button onClick={createAlert} className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-primary-foreground">Add</button>
                </div>
                {alerts.length > 0 && (
                  <div className="space-y-1.5">
                    {alerts.map(a => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                        <span className="text-xs">
                          {ALERT_TYPES.find(t => t.value === a.alert_type)?.icon} {ALERT_TYPES.find(t => t.value === a.alert_type)?.label}
                          {a.target_value != null && <span className="font-medium ml-1">{a.alert_type === "percent_change" ? `${a.target_value}%` : `$${a.target_value}`}</span>}
                        </span>
                        <button onClick={() => deleteAlert(a.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price */}
      <motion.div className="mt-4 flex items-baseline gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <span className="text-3xl font-semibold">${formatPrice(currentPrice)}</span>
        <span className={`flex items-center gap-0.5 text-sm font-medium ${isPositive ? "text-gain" : "text-loss"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
        </span>
        {isChartLoading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
      </motion.div>

      {/* Time range tabs */}
      <div className="mt-3 flex items-center gap-1">
        {timeRanges.map((r) => (
          <button key={r} onClick={() => handleRangeChange(r)} className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${activeRange === r ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{r}</button>
        ))}
      </div>

      {/* Chart */}
      <motion.div className="glass-card mt-3 p-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} ref={chartContainerRef} onWheel={handleWheel}>
        {/* Zoom + Measure toolbar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {chartModes.map(m => (
              <button key={m} onClick={() => setChartMode(m)} className={`rounded-md px-2 py-1 text-[10px] font-medium ${chartMode === m ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{m}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={zoomIn} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary" title="Zoom in"><ZoomIn size={13} /></button>
            <button onClick={zoomOut} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary" title="Zoom out"><ZoomOut size={13} /></button>
            {isZoomed && <button onClick={resetZoom} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary" title="Reset"><RotateCcw size={13} /></button>}
            {measureResult && (
              <div className="flex items-center gap-1 ml-2 rounded-md bg-secondary px-2 py-0.5">
                <Ruler size={10} className="text-muted-foreground" />
                <span className={`text-[10px] font-medium ${measureResult.toPrice >= measureResult.fromPrice ? "text-gain" : "text-loss"}`}>
                  {measureResult.toPrice >= measureResult.fromPrice ? "+" : ""}{((measureResult.toPrice - measureResult.fromPrice) / measureResult.fromPrice * 100).toFixed(2)}%
                </span>
                <button onClick={clearMeasure} className="ml-1 text-muted-foreground hover:text-foreground"><span className="text-[10px]">×</span></button>
              </div>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={visibleData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} onMouseDown={handleChartMouseDown} onMouseMove={handleChartMouseMove} onMouseUp={handleChartMouseUp}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={xTickInterval} />
            <YAxis domain={yDomain as any} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `$${formatPrice(v)}`} width={60} />
            <Tooltip content={<CustomTooltip />} />
            {isDragging && measureFrom && measureTo && <ReferenceArea x1={measureFrom} x2={measureTo} fill="hsl(var(--foreground))" fillOpacity={0.05} stroke="hsl(var(--foreground))" strokeOpacity={0.2} strokeDasharray="3 3" />}
            {activeIndicators.has("BB") && <Area type="monotone" dataKey="bbUpper" stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} fill="hsl(var(--muted-foreground))" fillOpacity={0.03} strokeDasharray="2 2" dot={false} />}
            {activeIndicators.has("BB") && <Area type="monotone" dataKey="bbLower" stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} fill="none" strokeDasharray="2 2" dot={false} />}
            {chartMode === "Simple" && <Area type="monotone" dataKey="price" stroke={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} strokeWidth={1.5} fill={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} fillOpacity={0.06} dot={false} />}
            {chartMode === "Candle" && <Bar dataKey="candleBody" shape={renderCandleBar} />}
            {activeIndicators.has("SMA20") && <Line type="monotone" dataKey="sma20" stroke="hsl(45, 90%, 55%)" strokeWidth={1} dot={false} />}
            {activeIndicators.has("EMA12") && <Line type="monotone" dataKey="ema12" stroke="hsl(280, 60%, 55%)" strokeWidth={1} dot={false} />}
            {activeIndicators.has("VWAP") && <Line type="monotone" dataKey="vwap" stroke="hsl(200, 60%, 55%)" strokeWidth={1} dot={false} strokeDasharray="4 2" />}
            {activeIndicators.has("Volume") && <Bar dataKey="volume" yAxisId="volume" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} />}
          </ComposedChart>
        </ResponsiveContainer>
        {activeIndicators.has("Volume") && <YAxis yAxisId="volume" hide />}

        {/* Indicators */}
        <div className="mt-2 flex flex-wrap gap-1">
          {(allIndicators as readonly string[]).map((ind) => (
            <button key={ind} onClick={() => toggleIndicator(ind as AnyIndicator)} className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${activeIndicators.has(ind as AnyIndicator) ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{ind}</button>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="mt-4 grid grid-cols-3 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {[
          { label: "Open", value: `$${formatPrice(quote?.open ?? 0)}` },
          { label: "Day High", value: `$${formatPrice(quote?.dayHigh ?? 0)}` },
          { label: "Day Low", value: `$${formatPrice(quote?.dayLow ?? 0)}` },
          { label: "52W High", value: `$${formatPrice(quote?.fiftyTwoWeekHigh ?? 0)}` },
          { label: "52W Low", value: `$${formatPrice(quote?.fiftyTwoWeekLow ?? 0)}` },
          { label: "Volume", value: formatVolume(quote?.volume ?? 0) },
          { label: "Mkt Cap", value: quote?.marketCap || "N/A" },
          { label: "P/E", value: quote?.peRatio || "N/A" },
          { label: "Avg Vol", value: quote?.avgVolume || "N/A" },
        ].map((s) => (
          <div key={s.label} className="glass-card px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-xs font-semibold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Trade Panel */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Paper Trade</h2>
          <div className="flex gap-1">
            {(["market", "limit"] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)} className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${orderType === t ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-muted-foreground">Shares</label>
            <input type="number" min={1} value={shares} onChange={(e) => setShares(Math.max(1, +e.target.value))} className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm font-medium outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">{orderType === "limit" ? "Limit Price" : "Market Price"}</label>
            {orderType === "limit" ? (
              <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-sm font-medium outline-none" />
            ) : (
              <p className="mt-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium">${formatPrice(currentPrice)}</p>
            )}
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">Est. cost: <span className="font-medium text-foreground">${formatPrice(purchaseValue)}</span></p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleBuy} className="rounded-xl bg-gain py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">Buy</button>
          <button onClick={handleSell} className="rounded-xl bg-loss py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">Sell</button>
        </div>
      </motion.div>

      {/* What-If Analysis */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <button onClick={() => setShowWhatIf(!showWhatIf)} className="flex w-full items-center justify-between glass-card px-4 py-3">
          <div className="flex items-center gap-2"><Zap size={14} /><span className="text-sm font-medium">What-If Analysis</span></div>
          <span className="text-xs text-muted-foreground">{showWhatIf ? "Hide" : "Show"}</span>
        </button>
        <AnimatePresence>
          {showWhatIf && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-card mt-2 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary p-3 text-center"><p className="text-[10px] text-muted-foreground">New Portfolio Value</p><p className="text-sm font-semibold">${formatPrice(newPortfolioValue)}</p></div>
                <div className="rounded-lg bg-secondary p-3 text-center"><p className="text-[10px] text-muted-foreground">New Tech Allocation</p><p className="text-sm font-semibold">{newTechPct}%</p></div>
              </div>
              <div className={`rounded-lg p-3 text-xs ${healthChange > 0 ? "bg-gain/10 text-gain" : healthChange < 0 ? "bg-loss/10 text-loss" : "bg-secondary text-muted-foreground"}`}>
                {healthChange > 0 ? "This trade improves portfolio diversification" : healthChange < 0 ? "Warning: This increases tech concentration above 70%" : "Neutral impact on portfolio balance"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Coach Warning Modal */}
      <AnimatePresence>
        {showCoachWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm px-4" onClick={() => setShowCoachWarning(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass-card-strong max-w-sm w-full p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2"><Sparkles size={16} /><h3 className="text-sm font-semibold">Maven Coach Warning</h3></div>
              <p className="text-xs text-muted-foreground leading-relaxed">Adding {shares} share{shares > 1 ? "s" : ""} of {symbol} would push your tech allocation to <strong className="text-foreground">{newTechPct}%</strong> which is above the recommended 70% threshold.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowCoachWarning(false)} className="flex-1 rounded-xl bg-secondary py-2 text-xs font-medium text-foreground">Cancel</button>
                <button onClick={executeBuy} className="flex-1 rounded-xl bg-foreground py-2 text-xs font-medium text-primary-foreground">Buy Anyway</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <motion.div className="mt-4 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-xs font-medium text-muted-foreground">Recent Paper Orders</h3>
          {pendingOrders.slice(0, 5).map((order, i) => (
            <div key={i} className="glass-card flex items-center justify-between px-4 py-2.5">
              <div>
                <span className={`text-xs font-medium ${order.type.includes("Buy") ? "text-gain" : "text-loss"}`}>{order.type}</span>
                <span className="text-xs text-muted-foreground ml-2">{order.shares} × ${formatPrice(order.price)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{order.time}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div className="mt-6 mb-4 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <p className="text-[11px] text-muted-foreground">Paper Trading · Educational demo only · Not financial advice</p>
      </motion.div>
    </div>
  );
};

export default StockDetail;
