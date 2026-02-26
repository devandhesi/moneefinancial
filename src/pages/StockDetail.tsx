import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Sparkles, Star, Zap, Loader2, Share2, ZoomIn, ZoomOut, RotateCcw, Ruler } from "lucide-react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Brush, ReferenceArea, ReferenceLine,
} from "recharts";
import { getStockQuote, type StockQuote } from "@/lib/market-api";
import { toast } from "sonner";

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
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [activeRange, setActiveRange] = useState<TimeRange>("3M");
  const [pendingOrders, setPendingOrders] = useState<Array<{type: string; shares: number; price: number; time: string}>>([]);
  // Zoom via scroll/pinch (percentage range 0-100)
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(100);
  // Measure via drag
  const [measureFrom, setMeasureFrom] = useState<string | null>(null);
  const [measureTo, setMeasureTo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [measureResult, setMeasureResult] = useState<{ fromPrice: number; toPrice: number; fromDate: string; toDate: string } | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef(0);

  // Load watchlist
  useEffect(() => {
    if (!symbol) return;
    try {
      const watchlist = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
      setIsWatchlisted(watchlist.includes(symbol));
    } catch {}
  }, [symbol]);

  // Fetch data reactively when symbol or range changes
  const fetchData = useCallback(async (sym: string, range: TimeRange, isInitial: boolean) => {
    const id = ++fetchRef.current;
    if (isInitial) setIsLoading(true);
    else setIsChartLoading(true);

    try {
      const data = await getStockQuote(sym, range);
      if (fetchRef.current !== id) return; // stale
      setQuote(data);
      if (isInitial) setLimitPrice(data.price.toFixed(2));
    } catch (e) {
      console.error(e);
      if (fetchRef.current === id) toast.error("Failed to load stock data.");
    } finally {
      if (fetchRef.current === id) {
        setIsLoading(false);
        setIsChartLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!symbol) return;
    fetchData(symbol, activeRange, true);
  }, [symbol]);

  // When range changes, re-fetch chart data
  const handleRangeChange = useCallback((range: TimeRange) => {
    if (range === activeRange) return;
    setActiveRange(range);
    resetZoom();
    if (symbol) fetchData(symbol, range, false);
  }, [activeRange, symbol, fetchData]);

  const toggleIndicator = (ind: AnyIndicator) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      next.has(ind) ? next.delete(ind) : next.add(ind);
      return next;
    });
  };

  const chartData = useMemo(() => {
    if (!quote?.chart) return [];
    const prices = quote.chart.map(p => p.price);

    const ema = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const result: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) {
        result.push(data[i] * k + result[i - 1] * (1 - k));
      }
      return result;
    };

    const ema12Series = ema(prices, 12);
    const ema26Series = ema(prices, 26);
    const macdLine = ema12Series.map((v, i) => v - ema26Series[i]);
    const signalLine = ema(macdLine, 9);

    // RSI (14-period)
    const rsiSeries: (number | null)[] = [];
    let avgGain = 0, avgLoss = 0;
    for (let i = 0; i < prices.length; i++) {
      if (i === 0) { rsiSeries.push(null); continue; }
      const delta = prices[i] - prices[i - 1];
      const gain = delta > 0 ? delta : 0;
      const loss = delta < 0 ? -delta : 0;
      if (i <= 14) {
        avgGain += gain; avgLoss += loss;
        if (i === 14) { avgGain /= 14; avgLoss /= 14; rsiSeries.push(100 - 100 / (1 + avgGain / (avgLoss || 0.001))); }
        else { rsiSeries.push(null); }
      } else {
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
        rsiSeries.push(100 - 100 / (1 + avgGain / (avgLoss || 0.001)));
      }
    }

    // VWAP (cumulative)
    let cumVolPrice = 0;
    let cumVol = 0;

    return quote.chart.map((point, i, arr) => {
      const sma20Window = arr.slice(Math.max(0, i - 19), i + 1);
      const sma20 = sma20Window.reduce((sum, p) => sum + p.price, 0) / sma20Window.length;
      const stdDev = Math.sqrt(sma20Window.reduce((sum, p) => sum + (p.price - sma20) ** 2, 0) / sma20Window.length);
      const bbUpper = sma20 + 2 * stdDev;
      const bbLower = sma20 - 2 * stdDev;

      // VWAP
      const vol = point.volume || 1;
      const typical = (point.high + point.low + point.close) / 3;
      cumVolPrice += typical * vol;
      cumVol += vol;
      const vwap = cumVolPrice / cumVol;

      return {
        ...point,
        sma20: +sma20.toFixed(4),
        ema12: +ema12Series[i].toFixed(4),
        bbUpper: +bbUpper.toFixed(4),
        bbLower: +bbLower.toFixed(4),
        bbBand: [+bbLower.toFixed(4), +bbUpper.toFixed(4)],
        rsi: rsiSeries[i] != null ? +rsiSeries[i]!.toFixed(2) : null,
        macd: +macdLine[i].toFixed(4),
        macdSignal: +signalLine[i].toFixed(4),
        macdHist: +(macdLine[i] - signalLine[i]).toFixed(4),
        vwap: +vwap.toFixed(4),
        bullish: point.close >= point.open,
        candleBody: [Math.min(point.open, point.close), Math.max(point.open, point.close)],
      };
    });
  }, [quote]);

  // Visible data based on zoom percentage
  const visibleData = useMemo(() => {
    if (chartData.length === 0) return [];
    const startIdx = Math.floor((zoomStart / 100) * chartData.length);
    const endIdx = Math.ceil((zoomEnd / 100) * chartData.length);
    return chartData.slice(Math.max(0, startIdx), Math.min(chartData.length, endIdx));
  }, [chartData, zoomStart, zoomEnd]);

  const isZoomed = zoomStart > 0 || zoomEnd < 100;

  // Compute Y domain for visible data
  const yDomain = useMemo(() => {
    if (!visibleData.length) return [0, 100];
    const allPrices = visibleData.flatMap(d => [d.high, d.low, d.price].filter(Boolean));
    if (activeIndicators.has("BB")) {
      visibleData.forEach(d => { allPrices.push(d.bbUpper, d.bbLower); });
    }
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.08 || 1;
    return [+(min - padding).toFixed(4), +(max + padding).toFixed(4)];
  }, [visibleData, activeIndicators]);

  // Scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 3;
    const delta = e.deltaY > 0 ? zoomSpeed : -zoomSpeed;
    const range = zoomEnd - zoomStart;
    const center = (zoomStart + zoomEnd) / 2;

    // Zoom in: shrink range around center; Zoom out: expand
    const newRange = Math.max(10, Math.min(100, range + delta));
    const newStart = Math.max(0, center - newRange / 2);
    const newEnd = Math.min(100, newStart + newRange);
    setZoomStart(Math.max(0, newEnd - newRange));
    setZoomEnd(newEnd);
  }, [zoomStart, zoomEnd]);

  // Drag to measure price change
  const handleChartMouseDown = useCallback((e: any) => {
    if (e?.activeLabel) {
      setMeasureFrom(e.activeLabel);
      setMeasureTo(null);
      setIsDragging(true);
      setMeasureResult(null);
    }
  }, []);

  const handleChartMouseMove = useCallback((e: any) => {
    if (isDragging && e?.activeLabel) {
      setMeasureTo(e.activeLabel);
    }
  }, [isDragging]);

  const handleChartMouseUp = useCallback(() => {
    if (isDragging && measureFrom && measureTo && measureFrom !== measureTo) {
      const fromPoint = chartData.find(d => d.date === measureFrom);
      const toPoint = chartData.find(d => d.date === measureTo);
      if (fromPoint && toPoint) {
        setMeasureResult({
          fromPrice: fromPoint.price,
          toPrice: toPoint.price,
          fromDate: measureFrom,
          toDate: measureTo,
        });
      }
    }
    setIsDragging(false);
  }, [isDragging, measureFrom, measureTo, chartData]);

  const clearMeasure = () => {
    setMeasureFrom(null);
    setMeasureTo(null);
    setMeasureResult(null);
  };

  const resetZoom = () => {
    setZoomStart(0);
    setZoomEnd(100);
    clearMeasure();
  };

  const zoomIn = () => {
    const range = zoomEnd - zoomStart;
    const center = (zoomStart + zoomEnd) / 2;
    const newRange = Math.max(10, range * 0.7);
    const ns = Math.max(0, center - newRange / 2);
    const ne = Math.min(100, ns + newRange);
    setZoomStart(Math.max(0, ne - newRange));
    setZoomEnd(ne);
  };

  const zoomOut = () => {
    const range = zoomEnd - zoomStart;
    const center = (zoomStart + zoomEnd) / 2;
    const newRange = Math.min(100, range * 1.4);
    const ns = Math.max(0, center - newRange / 2);
    const ne = Math.min(100, ns + newRange);
    setZoomStart(Math.max(0, ne - newRange));
    setZoomEnd(ne);
  };

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
    const text = `Check out ${symbol} - $${formatPrice(currentPrice)} (${isPositive ? "+" : ""}${changePercent.toFixed(2)}%)`;
    if (navigator.share) {
      try { await navigator.share({ title: `${symbol} Stock`, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Link copied to clipboard");
    }
  };

  const handleBuy = () => {
    if (shares <= 0) { toast.error("Enter a valid number of shares"); return; }
    if (coachMode && Number(newTechPct) > 70) { setShowCoachWarning(true); return; }
    executeBuy();
  };

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

  // Tooltip with proper formatting
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
          <div className="flex justify-between gap-4 mt-0.5 pt-0.5 border-t border-border/50">
            <span className="text-muted-foreground">Volume</span>
            <span className="font-medium">{formatVolume(d.volume)}</span>
          </div>
        )}
      </div>
    );
  };

  // Candle shape rendered via customized Bar content (no ref issue)
  const renderCandleBar = useCallback((props: any) => {
    const { x, width, payload } = props;
    if (!payload) return null;
    const { open, close, high, low, bullish } = payload;

    // Use the chart's actual Y axis to map values
    const allPrices = visibleData.flatMap(d => [d.high, d.low].filter(Boolean));
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const padding = (maxP - minP) * 0.08 || 1;
    const domainMin = minP - padding;
    const domainMax = maxP + padding;

    const chartHeight = 290;
    const chartTop = 8;
    const yScale = (val: number) => {
      return chartTop + chartHeight - ((val - domainMin) / (domainMax - domainMin)) * chartHeight;
    };

    const color = bullish ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)";
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
  }, [visibleData]);

  // Tick label format based on range
  const xTickInterval = useMemo(() => {
    const len = visibleData.length;
    if (len <= 10) return 0;
    if (len <= 30) return Math.floor(len / 6);
    return Math.floor(len / 8);
  }, [visibleData]);

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
        <p className="text-3xl font-semibold tabular-nums">${formatPrice(currentPrice)}</p>
        <p className={`mt-1 flex items-center gap-1 text-sm tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
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
        <div className="flex gap-0.5">
          {timeRanges.map((range) => (
            <button key={range} onClick={() => handleRangeChange(range)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${activeRange === range ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
          {allIndicators.map((ind) => (
            <button key={ind} onClick={() => toggleIndicator(ind as AnyIndicator)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${activeIndicators.has(ind as AnyIndicator) ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
              {ind}
            </button>
          ))}
        </div>

      {/* Chart */}
      <motion.div className="glass-card mt-4 p-4 relative select-none" ref={chartContainerRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        {isChartLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Chart toolbar */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Ruler size={12} />
            <span>Drag to measure</span>
            <span className="text-muted-foreground/40 mx-1">|</span>
            <span>Scroll to zoom</span>
            {isZoomed && <span className="text-muted-foreground/40 mx-1">|</span>}
            {isZoomed && <span>{visibleData.length} of {chartData.length} pts</span>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={zoomIn} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Zoom in">
              <ZoomIn size={13} />
            </button>
            <button onClick={zoomOut} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Zoom out">
              <ZoomOut size={13} />
            </button>
            {(isZoomed || measureResult) && (
              <button onClick={resetZoom} className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw size={10} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Measure result overlay */}
        {measureResult && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">{measureResult.fromDate}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">{measureResult.toDate}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-medium tabular-nums">${formatPrice(measureResult.fromPrice)} → ${formatPrice(measureResult.toPrice)}</span>
              <span className={`font-semibold tabular-nums ${measureResult.toPrice >= measureResult.fromPrice ? "text-gain" : "text-loss"}`}>
                {measureResult.toPrice >= measureResult.fromPrice ? "+" : ""}
                ${formatPrice(Math.abs(measureResult.toPrice - measureResult.fromPrice))}
                {" "}({((measureResult.toPrice - measureResult.fromPrice) / measureResult.fromPrice * 100).toFixed(2)}%)
              </span>
              <button onClick={clearMeasure} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
          </div>
        )}

        {visibleData.length > 0 ? (
          <div onWheel={handleWheel}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              data={visibleData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              onMouseDown={handleChartMouseDown}
              onMouseMove={handleChartMouseMove}
              onMouseUp={handleChartMouseUp}
            >
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(270, 50%, 55%)" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="hsl(270, 50%, 55%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              {chartMode !== "Simple" && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />}
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(220, 8%, 50%)" }}
                interval={xTickInterval}
                angle={activeRange === "1D" || activeRange === "1W" ? -30 : 0}
                dy={activeRange === "1D" || activeRange === "1W" ? 8 : 0}
                height={activeRange === "1D" || activeRange === "1W" ? 45 : 30}
              />
              <YAxis
                yAxisId="price"
                domain={yDomain}
                tickFormatter={(v) => `$${formatPrice(v)}`}
                tick={{ fontSize: 9, fill: "hsl(220, 8%, 50%)" }}
                axisLine={false}
                tickLine={false}
                width={65}
                tickCount={6}
              />
              <YAxis yAxisId="volume" hide orientation="right" domain={[0, "dataMax * 3"]} />
              <Tooltip content={<CustomTooltip />} />
              {activeIndicators.has("Volume") && (
                <Bar yAxisId="volume" dataKey="volume" fill="hsl(220, 8%, 85%)" opacity={0.3} />
              )}
              {activeIndicators.has("BB") && (
                <>
                  <Area yAxisId="price" type="monotone" dataKey="bbBand" stroke="none" fill="url(#bbGrad)" dot={false} animationDuration={300} />
                  <Line yAxisId="price" type="monotone" dataKey="bbUpper" stroke="hsl(270, 50%, 55%)" strokeWidth={0.8} dot={false} strokeDasharray="3 2" animationDuration={300} />
                  <Line yAxisId="price" type="monotone" dataKey="bbLower" stroke="hsl(270, 50%, 55%)" strokeWidth={0.8} dot={false} strokeDasharray="3 2" animationDuration={300} />
                </>
              )}
              {activeIndicators.has("VWAP") && (
                <Line yAxisId="price" type="monotone" dataKey="vwap" stroke="hsl(180, 50%, 45%)" strokeWidth={1} dot={false} strokeDasharray="6 3" animationDuration={300} />
              )}
              {chartMode !== "Candle" && (
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"}
                  strokeWidth={chartMode === "Simple" ? 2 : 1.5}
                  fill="url(#priceGrad)"
                  dot={false}
                  animationDuration={300}
                />
              )}
              {chartMode === "Candle" && (
                <Bar yAxisId="price" dataKey="candleBody" shape={renderCandleBar} animationDuration={300} />
              )}
              {activeIndicators.has("SMA20") && (
                <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="hsl(215, 60%, 55%)" strokeWidth={1} dot={false} animationDuration={300} />
              )}
              {activeIndicators.has("EMA12") && (
                <Line yAxisId="price" type="monotone" dataKey="ema12" stroke="hsl(35, 80%, 50%)" strokeWidth={1} dot={false} strokeDasharray="4 2" animationDuration={300} />
              )}
              {/* Measure drag highlight */}
              {isDragging && measureFrom && measureTo && (
                <ReferenceArea yAxisId="price" x1={measureFrom} x2={measureTo} strokeOpacity={0.3} fill="hsl(215, 60%, 55%)" fillOpacity={0.08} stroke="hsl(215, 60%, 55%)" strokeDasharray="3 3" />
              )}
              {/* Measure result lines */}
              {measureResult && (
                <>
                  <ReferenceLine yAxisId="price" x={measureResult.fromDate} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine yAxisId="price" x={measureResult.toDate} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
                </>
              )}
              <Brush
                dataKey="date"
                height={24}
                stroke="hsl(var(--border))"
                travellerWidth={8}
                fill="hsl(var(--secondary))"
                tickFormatter={() => ""}
                startIndex={Math.floor((zoomStart / 100) * chartData.length)}
                endIndex={Math.min(chartData.length - 1, Math.ceil((zoomEnd / 100) * chartData.length) - 1)}
                onChange={(range: any) => {
                  if (range && typeof range.startIndex === "number" && typeof range.endIndex === "number") {
                    setZoomStart((range.startIndex / chartData.length) * 100);
                    setZoomEnd(((range.endIndex + 1) / chartData.length) * 100);
                  }
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No chart data available</div>
        )}

        {/* Legend for active indicators */}
        {(activeIndicators.size > 0 || chartMode === "Candle") && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px]">
            {chartMode === "Candle" && (
              <>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(152, 28%, 40%)" }} /> Bullish</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(0, 32%, 52%)" }} /> Bearish</span>
              </>
            )}
            {activeIndicators.has("SMA20") && (
              <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded" style={{ background: "hsl(215, 60%, 55%)" }} /> SMA 20</span>
            )}
            {activeIndicators.has("EMA12") && (
              <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded border-t border-dashed" style={{ borderColor: "hsl(35, 80%, 50%)" }} /> EMA 12</span>
            )}
            {activeIndicators.has("BB") && (
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm border border-dashed" style={{ borderColor: "hsl(270, 50%, 55%)", background: "hsl(270, 50%, 55%, 0.1)" }} /> Bollinger</span>
            )}
            {activeIndicators.has("VWAP") && (
              <span className="flex items-center gap-1"><span className="inline-block h-0.5 w-3 rounded" style={{ background: "hsl(180, 50%, 45%)" }} /> VWAP</span>
            )}
          </div>
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
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 5, 10, 25, 50, 100].map((n) => (
                  <button key={n} onClick={() => setShares(n)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${shares === n ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Purchase Value</span><span className="font-medium tabular-nums">${formatPrice(purchaseValue)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">New Portfolio Value</span><span className="font-medium tabular-nums">${formatPrice(newPortfolioValue)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tech Allocation</span><span className={`font-medium ${Number(newTechPct) > 70 ? "text-loss" : ""}`}>{currentTechPct}% → {newTechPct}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Health Score Impact</span><span className={`font-medium ${healthChange < 0 ? "text-loss" : "text-gain"}`}>{healthChange > 0 ? "+" : ""}{healthChange} pts</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Projected Annual Cost</span><span className="font-medium tabular-nums">${(purchaseValue * 0.002).toFixed(2)} (MER)</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Stats */}
      <motion.div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {[
          { label: "Open", value: quote ? `$${formatPrice(quote.open)}` : "—" },
          { label: "Day High", value: quote ? `$${formatPrice(quote.dayHigh)}` : "—" },
          { label: "Day Low", value: quote ? `$${formatPrice(quote.dayLow)}` : "—" },
          { label: "Prev Close", value: quote ? `$${formatPrice(quote.previousClose)}` : "—" },
          { label: "Mkt Cap", value: quote?.marketCap || "—" },
          { label: "52W High", value: quote ? `$${formatPrice(quote.fiftyTwoWeekHigh)}` : "—" },
          { label: "52W Low", value: quote ? `$${formatPrice(quote.fiftyTwoWeekLow)}` : "—" },
          { label: "Avg Vol", value: quote?.avgVolume || "—" },
        ].map((s) => (
          <div key={s.label} className="glass-card px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-xs font-semibold tabular-nums">{s.value}</p>
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
              {quote.name} ({symbol}) is trading at ${formatPrice(quote.price)}, {isPositive ? "up" : "down"} {Math.abs(quote.changePercent).toFixed(2)}% today.
              {quote.peRatio !== "N/A" && ` P/E ratio of ${quote.peRatio}.`}
              {quote.beta && ` Beta of ${quote.beta.toFixed(2)} suggests ${quote.beta > 1 ? "higher" : "lower"} volatility than the market.`}
              {" "}Adding {shares} share{shares > 1 ? "s" : ""} would shift your tech allocation to {newTechPct}%.
            </>
          ) : "Loading analysis..."}
        </p>
        <button onClick={() => navigate("/chat")} className="mt-3 text-xs font-medium text-foreground underline-offset-2 hover:underline">
          Ask Maven for deeper analysis →
        </button>
      </motion.div>

      {/* Order Ticket */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Simulated Order</h3>
          <button onClick={() => {
            setCoachMode(!coachMode);
            toast.info(coachMode ? "Coach Mode disabled" : "Coach Mode enabled", { duration: 2000 });
          }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${coachMode ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
            <Sparkles size={10} /> Coach {coachMode ? "ON" : "OFF"}
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setOrderType("market")} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${orderType === "market" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>Market</button>
          <button onClick={() => setOrderType("limit")} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${orderType === "limit" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>Limit</button>
        </div>
        {orderType === "limit" && (
          <div className="glass-input mt-3 px-3 py-2">
            <label className="text-[10px] text-muted-foreground">Limit Price</label>
            <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} step="0.01" className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none tabular-nums" />
          </div>
        )}
        <div className="glass-input mt-2 px-3 py-2">
          <label className="text-[10px] text-muted-foreground">Shares</label>
          <input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value) || 1)} min={1} className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none tabular-nums" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Estimated Total</span>
          <span className="font-medium text-foreground tabular-nums">${formatPrice(shares * (orderType === "limit" ? Number(limitPrice) : currentPrice))}</span>
        </div>

        <AnimatePresence>
          {showCoachWarning && (
            <motion.div className="mt-3 rounded-xl bg-loss/5 border border-loss/10 p-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="flex items-center gap-2 text-xs font-medium text-loss"><Sparkles size={12} /> Maven Coach Warning</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                This trade increases your tech exposure to {newTechPct}%. Health score would drop by {Math.abs(healthChange)} points.
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
                  <div className="text-right tabular-nums">
                    <span className="font-medium">${formatPrice(order.shares * order.price)}</span>
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
