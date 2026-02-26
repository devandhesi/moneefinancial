import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, Sparkles, Send, X, BookOpen,
  ArrowUpRight, ArrowDownRight, ChevronRight, MessageCircle,
} from "lucide-react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { searchStocks, getStockQuote, type StockQuote, type StockSearchResult } from "@/lib/market-api";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";

const timeRanges = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
type TimeRange = typeof timeRanges[number];

const chartModes = ["Simple", "Candle"] as const;
type ChartMode = typeof chartModes[number];

const indicators = ["Volume", "SMA20", "EMA12", "BB"] as const;
type Indicator = typeof indicators[number];

const formatPrice = (p: number) => p >= 1000 ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p >= 1 ? p.toFixed(2) : p.toFixed(4);
const formatVolume = (v: number) => v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? (v / 1e6).toFixed(2) + "M" : v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : v.toString();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const teachingChips = [
  "What does this chart pattern mean?",
  "Is the volume significant here?",
  "Explain the trend I'm seeing",
  "What are key support and resistance levels?",
  "How do I read candlestick patterns?",
  "What should I watch for next?",
  "Explain momentum indicators",
  "Is this stock overbought or oversold?",
];

const popularStocks = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "META", name: "Meta" },
  { symbol: "AMD", name: "AMD" },
];

const LearnCharts = () => {
  // Stock selection
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Chart data
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRange, setActiveRange] = useState<TimeRange>("3M");
  const [chartMode, setChartMode] = useState<ChartMode>("Simple");
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set());
  const fetchRef = useRef(0);

  // AI Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Search stocks
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchStocks(searchQuery);
        setSearchResults(results.slice(0, 8));
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 300);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

  // Select stock
  const selectStock = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchQuery("");
    setSearchResults([]);
    setActiveRange("3M");
    setActiveIndicators(new Set());

    const id = ++fetchRef.current;
    setIsLoading(true);
    try {
      const data = await getStockQuote(symbol, "3M");
      if (fetchRef.current !== id) return;
      setQuote(data);

      // Auto-trigger AI intro
      const introMsg: ChatMessage = {
        role: "assistant",
        content: `Let's learn about **${data.name} (${symbol})**!\n\nThe stock is currently trading at **$${formatPrice(data.price)}**, ${data.changePercent >= 0 ? "up" : "down"} **${Math.abs(data.changePercent).toFixed(2)}%** today.\n\nI can see a 3-month chart loaded for you. Try clicking the teaching prompts below, or ask me anything about what you see on the chart.\n\n*What would you like to learn?*`,
      };
      setChatMessages([introMsg]);
      setChatOpen(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load stock data");
    } finally {
      if (fetchRef.current === id) setIsLoading(false);
    }
  }, []);

  // Change range
  const handleRangeChange = useCallback(async (range: TimeRange) => {
    if (!selectedSymbol || range === activeRange) return;
    setActiveRange(range);
    const id = ++fetchRef.current;
    setIsLoading(true);
    try {
      const data = await getStockQuote(selectedSymbol, range);
      if (fetchRef.current !== id) return;
      setQuote(data);
    } catch { toast.error("Failed to load chart data"); }
    finally { if (fetchRef.current === id) setIsLoading(false); }
  }, [selectedSymbol, activeRange]);

  const toggleIndicator = (ind: Indicator) => {
    setActiveIndicators(prev => {
      const next = new Set(prev);
      next.has(ind) ? next.delete(ind) : next.add(ind);
      return next;
    });
  };

  // Chart data computation
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

    return quote.chart.map((point, i, arr) => {
      const sma20Window = arr.slice(Math.max(0, i - 19), i + 1);
      const sma20 = sma20Window.reduce((s, p) => s + p.price, 0) / sma20Window.length;
      const stdDev = Math.sqrt(sma20Window.reduce((s, p) => s + (p.price - sma20) ** 2, 0) / sma20Window.length);

      return {
        ...point,
        sma20: +sma20.toFixed(4),
        ema12: +ema12Series[i].toFixed(4),
        bbUpper: +(sma20 + 2 * stdDev).toFixed(4),
        bbLower: +(sma20 - 2 * stdDev).toFixed(4),
        bbBand: [+(sma20 - 2 * stdDev).toFixed(4), +(sma20 + 2 * stdDev).toFixed(4)],
        bullish: point.close >= point.open,
        candleBody: [Math.min(point.open, point.close), Math.max(point.open, point.close)],
      };
    });
  }, [quote]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const allPrices = chartData.flatMap(d => [d.high, d.low, d.price]);
    if (activeIndicators.has("BB")) chartData.forEach(d => { allPrices.push(d.bbUpper, d.bbLower); });
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const pad = (max - min) * 0.08 || 1;
    return [+(min - pad).toFixed(4), +(max + pad).toFixed(4)];
  }, [chartData, activeIndicators]);

  const isPositive = (quote?.changePercent ?? 0) >= 0;

  const xTickInterval = useMemo(() => {
    const len = chartData.length;
    if (len <= 10) return 0;
    if (len <= 30) return Math.floor(len / 6);
    return Math.floor(len / 8);
  }, [chartData]);

  // Candle renderer
  const renderCandleBar = useCallback((props: any) => {
    const { x, width, payload } = props;
    if (!payload) return null;
    const { open, close, high, low, bullish } = payload;
    const allPrices = chartData.flatMap(d => [d.high, d.low]);
    const minP = Math.min(...allPrices); const maxP = Math.max(...allPrices);
    const pad = (maxP - minP) * 0.08 || 1;
    const dMin = minP - pad; const dMax = maxP + pad;
    const cH = 290; const cT = 8;
    const yS = (v: number) => cT + cH - ((v - dMin) / (dMax - dMin)) * cH;
    const color = bullish ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)";
    const bTop = yS(Math.max(open, close)); const bBot = yS(Math.min(open, close));
    const wT = yS(high); const wB = yS(low);
    const bW = Math.max(width * 0.6, 2); const cx = x + width / 2;
    return (
      <g>
        <line x1={cx} x2={cx} y1={wT} y2={wB} stroke={color} strokeWidth={1} />
        <rect x={cx - bW / 2} y={bTop} width={bW} height={Math.max(bBot - bTop, 1)} fill={color} rx={1} />
      </g>
    );
  }, [chartData]);

  // AI Chat
  const buildChartContext = () => {
    if (!quote || !chartData.length) return "";
    const last5 = chartData.slice(-5);
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const periodChange = ((last.price - first.price) / first.price * 100).toFixed(2);
    const avgVol = chartData.reduce((s, d) => s + d.volume, 0) / chartData.length;
    const recentVol = last5.reduce((s, d) => s + d.volume, 0) / last5.length;
    const volMult = (recentVol / avgVol).toFixed(2);

    return `\n\nCHART CONTEXT for ${quote.symbol} (${quote.name}):\n` +
      `Current price: $${formatPrice(quote.price)}\n` +
      `Today's change: ${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%\n` +
      `Chart timeframe: ${activeRange}\n` +
      `Period change: ${periodChange}%\n` +
      `Chart mode: ${chartMode}\n` +
      `Active indicators: ${activeIndicators.size ? [...activeIndicators].join(", ") : "None"}\n` +
      `Recent volume vs average: ${volMult}x\n` +
      `52W High: $${formatPrice(quote.fiftyTwoWeekHigh)} | 52W Low: $${formatPrice(quote.fiftyTwoWeekLow)}\n` +
      `Day range: $${formatPrice(quote.dayLow)} - $${formatPrice(quote.dayHigh)}\n` +
      `Market cap: ${quote.marketCap} | P/E: ${quote.peRatio}\n` +
      `Beta: ${quote.beta ?? "N/A"}\n` +
      `Recent 5 closes: ${last5.map(d => "$" + formatPrice(d.price)).join(", ")}\n` +
      `SMA20 (last): $${formatPrice(chartData[chartData.length - 1]?.sma20 || 0)}\n` +
      `EMA12 (last): $${formatPrice(chartData[chartData.length - 1]?.ema12 || 0)}\n`;
  };

  const handleChatSend = async (text?: string) => {
    const input = text || chatQuery;
    if (!input.trim() || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setChatMessages(prev => [...prev, userMsg]);
    setChatQuery("");
    setChatLoading(true);

    let assistantSoFar = "";
    const allMessages = [...chatMessages, userMsg];

    // Build system context
    const systemMsg: ChatMessage = {
      role: "user",
      content: `[SYSTEM CONTEXT - Chart Teaching Mode]\nYou are Maven, an AI chart teacher inside Monee. The user is learning to read stock charts. Teach them clearly and practically. Reference the actual chart data below. Use the chart's indicators, price action, and volume to explain concepts. Be encouraging but honest. Use **bold** for key terms. Keep responses under 250 words. Always end with a follow-up question or suggestion to deepen learning.${buildChartContext()}`,
    };

    const messagesForAI = [systemMsg, ...allMessages];

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setChatMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.content === userMsg.content) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: messagesForAI,
        onDelta: upsert,
        onDone: () => setChatLoading(false),
        onError: (err) => { toast.error(err); setChatLoading(false); },
      });
    } catch {
      toast.error("Failed to connect to Maven");
      setChatLoading(false);
    }
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
          <div className="flex justify-between gap-4 mt-0.5 pt-0.5 border-t border-border/50">
            <span className="text-muted-foreground">Volume</span>
            <span className="font-medium">{formatVolume(d.volume)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Learn Charts</h1>
            <p className="text-sm text-muted-foreground">Pick any stock. Explore the chart. Ask Maven to teach you.</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="relative mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="glass-card flex items-center gap-2 px-4 py-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for any stock to start learning..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {isSearching && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
        </div>

        {/* Search results */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            >
              {searchResults.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => selectStock(r.symbol)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary"
                >
                  <div>
                    <span className="text-sm font-semibold">{r.symbol}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{r.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{r.exchange}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Popular stocks - show when no stock selected */}
      {!selectedSymbol && (
        <motion.div className="mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Popular stocks to learn with</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {popularStocks.map((s) => (
              <button
                key={s.symbol}
                onClick={() => selectStock(s.symbol)}
                className="glass-card flex items-center justify-between px-4 py-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm font-semibold">{s.symbol}</p>
                  <p className="text-[11px] text-muted-foreground">{s.name}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && !quote && (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Chart + AI Panel */}
      {selectedSymbol && quote && (
        <motion.div
          className="mt-5 grid gap-5 lg:grid-cols-[1fr_380px]"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          {/* Chart Column */}
          <div>
            {/* Stock header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{quote.symbol}</h2>
                  <span className="text-sm text-muted-foreground">{quote.name}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-semibold tabular-nums">${formatPrice(quote.price)}</span>
                  <span className={`flex items-center gap-0.5 text-sm tabular-nums ${isPositive ? "text-gain" : "text-loss"}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedSymbol(null); setQuote(null); setChatMessages([]); setChatOpen(false); }}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chart controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {chartModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${chartMode === mode ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${activeRange === range ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {indicators.map((ind) => (
                <button
                  key={ind}
                  onClick={() => toggleIndicator(ind)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${activeIndicators.has(ind) ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}
                >
                  {ind}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="glass-card relative mt-4 p-4">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                </div>
              )}
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={360}>
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="lcPriceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="lcBbGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(270, 50%, 55%)" stopOpacity={0.06} />
                        <stop offset="100%" stopColor="hsl(270, 50%, 55%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    {chartMode !== "Simple" && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />}
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(220, 8%, 50%)" }} interval={xTickInterval} />
                    <YAxis yAxisId="price" domain={yDomain} tickFormatter={(v) => `$${formatPrice(v)}`} tick={{ fontSize: 9, fill: "hsl(220, 8%, 50%)" }} axisLine={false} tickLine={false} width={65} tickCount={6} />
                    <YAxis yAxisId="volume" hide orientation="right" domain={[0, "dataMax * 3"]} />
                    <Tooltip content={<CustomTooltip />} />

                    {activeIndicators.has("Volume") && (
                      <Bar yAxisId="volume" dataKey="volume" fill="hsl(220, 8%, 85%)" opacity={0.3} />
                    )}
                    {activeIndicators.has("BB") && (
                      <>
                        <Area yAxisId="price" type="monotone" dataKey="bbBand" stroke="none" fill="url(#lcBbGrad)" dot={false} animationDuration={300} />
                        <Line yAxisId="price" type="monotone" dataKey="bbUpper" stroke="hsl(270, 50%, 55%)" strokeWidth={0.8} dot={false} strokeDasharray="3 2" animationDuration={300} />
                        <Line yAxisId="price" type="monotone" dataKey="bbLower" stroke="hsl(270, 50%, 55%)" strokeWidth={0.8} dot={false} strokeDasharray="3 2" animationDuration={300} />
                      </>
                    )}

                    {chartMode === "Simple" ? (
                      <Area yAxisId="price" type="monotone" dataKey="price" stroke={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} strokeWidth={1.8} fill="url(#lcPriceGrad)" dot={false} animationDuration={500} />
                    ) : (
                      <Bar yAxisId="price" dataKey="candleBody" shape={renderCandleBar} animationDuration={300} />
                    )}

                    {activeIndicators.has("SMA20") && <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="hsl(45, 80%, 55%)" strokeWidth={1.2} dot={false} animationDuration={300} />}
                    {activeIndicators.has("EMA12") && <Line yAxisId="price" type="monotone" dataKey="ema12" stroke="hsl(200, 70%, 55%)" strokeWidth={1.2} dot={false} animationDuration={300} />}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[360px] items-center justify-center text-muted-foreground text-sm">No chart data</div>
              )}

              {/* Educational annotation */}
              <div className="mt-3 rounded-lg bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
                <BookOpen size={11} className="mr-1 inline" />
                Try toggling indicators above to see how SMA20, EMA12, and Bollinger Bands overlay on the chart. Switch to Candle mode to see open/high/low/close patterns.
              </div>
            </div>

            {/* Key stats */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Market Cap", value: quote.marketCap },
                { label: "P/E Ratio", value: quote.peRatio },
                { label: "52W High", value: `$${formatPrice(quote.fiftyTwoWeekHigh)}` },
                { label: "52W Low", value: `$${formatPrice(quote.fiftyTwoWeekLow)}` },
                { label: "Volume", value: formatVolume(quote.volume) },
                { label: "Avg Volume", value: quote.avgVolume },
                { label: "Beta", value: quote.beta?.toFixed(2) || "N/A" },
                { label: "Div Yield", value: quote.dividendYield },
              ].map(s => (
                <div key={s.label} className="glass-card px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-semibold tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Mobile chat toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground lg:hidden"
            >
              <MessageCircle size={16} />
              {chatOpen ? "Hide Maven" : "Ask Maven about this chart"}
            </button>
          </div>

          {/* AI Teaching Panel */}
          <AnimatePresence>
            {(chatOpen || typeof window !== "undefined") && (
              <motion.div
                className={`flex flex-col rounded-2xl border border-border bg-card overflow-hidden ${chatOpen ? "block" : "hidden lg:flex"}`}
                style={{ maxHeight: "calc(100vh - 140px)", position: "sticky", top: 80 }}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-muted-foreground" />
                    <span className="text-sm font-semibold">Maven Chart Teacher</span>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">AI</span>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${msg.role === "user" ? "bg-foreground text-primary-foreground" : "bg-secondary"}`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:mt-1 [&>h2]:text-[12.5px] [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:mb-0.5">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {chatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl bg-secondary px-3.5 py-2.5">
                        <Loader2 size={14} className="animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Teaching chips */}
                <div className="border-t border-border px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {teachingChips.slice(0, 4).map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleChatSend(chip)}
                        disabled={chatLoading}
                        className="rounded-lg bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-border px-3 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                      placeholder="Ask about this chart..."
                      className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={() => handleChatSend()}
                      disabled={chatLoading || !chatQuery.trim()}
                      className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                  <p className="mt-1.5 text-center text-[9px] text-muted-foreground">Educational only · Not financial advice</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default LearnCharts;
