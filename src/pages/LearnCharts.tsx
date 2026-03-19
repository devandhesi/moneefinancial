import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, Sparkles, Send, X, BookOpen,
  ArrowUpRight, ArrowDownRight, ChevronRight, MessageCircle,
  TrendingUp, BarChart3, Activity, Target, Lightbulb, GraduationCap,
} from "lucide-react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  ReferenceLine,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { searchStocks, getStockQuote, type StockQuote, type StockSearchResult } from "@/lib/market-api";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";

const timeRanges = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
type TimeRange = (typeof timeRanges)[number];

const chartModes = ["Line", "Candle"] as const;
type ChartMode = (typeof chartModes)[number];

const indicators = ["Volume", "SMA20", "EMA12", "BB", "RSI", "MACD"] as const;
type Indicator = (typeof indicators)[number];

const formatPrice = (p: number) =>
  p >= 1000
    ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : p >= 1
      ? p.toFixed(2)
      : p.toFixed(4);
const formatVolume = (v: number) =>
  v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? (v / 1e6).toFixed(2) + "M" : v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : v.toString();

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const teachingChips = [
  "What pattern do you see here?",
  "Is the volume telling us something?",
  "Explain support & resistance levels",
  "What do the Bollinger Bands show?",
  "Is this stock overbought (RSI)?",
  "Explain the MACD crossover",
  "What should I watch for next?",
  "Teach me candlestick patterns",
];

const popularStocks = [
  { symbol: "AAPL", name: "Apple", sector: "Tech" },
  { symbol: "NVDA", name: "NVIDIA", sector: "Semis" },
  { symbol: "TSLA", name: "Tesla", sector: "Auto" },
  { symbol: "MSFT", name: "Microsoft", sector: "Tech" },
  { symbol: "AMZN", name: "Amazon", sector: "Retail" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Tech" },
  { symbol: "META", name: "Meta", sector: "Social" },
  { symbol: "AMD", name: "AMD", sector: "Semis" },
];

const guidedLessons = [
  {
    icon: TrendingUp,
    title: "Reading Trends",
    desc: "Learn to identify uptrends, downtrends, and consolidation patterns",
    prompt: "Teach me how to identify trends on this chart. What makes an uptrend vs a downtrend?",
  },
  {
    icon: BarChart3,
    title: "Volume Analysis",
    desc: "Understand what trading volume reveals about price movements",
    prompt: "Explain how to read volume on this chart. What does high volume vs low volume mean?",
  },
  {
    icon: Activity,
    title: "Moving Averages",
    desc: "Master SMA and EMA crossovers for timing decisions",
    prompt: "Turn on SMA20 and EMA12 indicators and explain what the crossovers mean on this chart.",
  },
  {
    icon: Target,
    title: "Support & Resistance",
    desc: "Find key price levels where stocks tend to bounce or break",
    prompt: "Identify the key support and resistance levels on this chart and explain why they matter.",
  },
];

const indicatorInfo: Record<string, { label: string; color: string; desc: string }> = {
  Volume: { label: "VOL", color: "hsl(var(--muted-foreground))", desc: "Trading volume" },
  SMA20: { label: "SMA 20", color: "hsl(45, 80%, 55%)", desc: "Simple Moving Average (20)" },
  EMA12: { label: "EMA 12", color: "hsl(200, 70%, 55%)", desc: "Exponential Moving Average (12)" },
  BB: { label: "BB", color: "hsl(270, 50%, 55%)", desc: "Bollinger Bands (20, 2σ)" },
  RSI: { label: "RSI 14", color: "hsl(45, 80%, 55%)", desc: "Relative Strength Index" },
  MACD: { label: "MACD", color: "hsl(200, 70%, 55%)", desc: "Moving Avg Convergence/Divergence" },
};

const LearnCharts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRange, setActiveRange] = useState<TimeRange>("3M");
  const [chartMode, setChartMode] = useState<ChartMode>("Line");
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set());
  const fetchRef = useRef(0);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Search stocks
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
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

  const selectStock = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol);
    setSearchQuery("");
    setSearchResults([]);
    setActiveRange("3M");
    setActiveIndicators(new Set(["Volume"]));

    const id = ++fetchRef.current;
    setIsLoading(true);
    try {
      const data = await getStockQuote(symbol, "3M");
      if (fetchRef.current !== id) return;
      setQuote(data);

      const introMsg: ChatMessage = {
        role: "assistant",
        content: `📊 **${data.name} (${symbol})** loaded!\n\nTrading at **$${formatPrice(data.price)}** · ${data.changePercent >= 0 ? "📈" : "📉"} **${data.changePercent >= 0 ? "+" : ""}${data.changePercent.toFixed(2)}%** today\n\nI've loaded a 3-month chart with volume enabled. Here's what I suggest:\n\n1. **Start with the basics** — look at the overall trend direction\n2. **Toggle indicators** — try SMA20 and EMA12 to see moving averages\n3. **Switch to Candle mode** — see open/high/low/close for each period\n\n💡 *Use the lesson cards below, or ask me anything about what you see!*`,
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
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      next.has(ind) ? next.delete(ind) : next.add(ind);
      return next;
    });
  };

  // Compute chart data with RSI & MACD
  const chartData = useMemo(() => {
    if (!quote?.chart) return [];
    const prices = quote.chart.map((p) => p.price);

    const ema = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      const result: number[] = [data[0]];
      for (let i = 1; i < data.length; i++) result.push(data[i] * k + result[i - 1] * (1 - k));
      return result;
    };

    const ema12Series = ema(prices, 12);
    const ema26Series = ema(prices, 26);

    // MACD = EMA12 - EMA26
    const macdLine = ema12Series.map((v, i) => v - ema26Series[i]);
    const macdSignal = ema(macdLine, 9);

    // RSI calculation
    const rsiSeries: number[] = [];
    let avgGain = 0, avgLoss = 0;
    for (let i = 0; i < prices.length; i++) {
      if (i === 0) { rsiSeries.push(50); continue; }
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;

      if (i <= 14) {
        avgGain = (avgGain * (i - 1) + gain) / i;
        avgLoss = (avgLoss * (i - 1) + loss) / i;
      } else {
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
      }

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiSeries.push(+(100 - 100 / (1 + rs)).toFixed(2));
    }

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
        rsi: rsiSeries[i],
        macd: +macdLine[i].toFixed(4),
        macdSignal: +macdSignal[i].toFixed(4),
        macdHist: +(macdLine[i] - macdSignal[i]).toFixed(4),
      };
    });
  }, [quote]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const allPrices = chartData.flatMap((d) => [d.high, d.low, d.price]);
    if (activeIndicators.has("BB")) chartData.forEach((d) => { allPrices.push(d.bbUpper, d.bbLower); });
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const pad = (max - min) * 0.08 || 1;
    return [+(min - pad).toFixed(4), +(max + pad).toFixed(4)];
  }, [chartData, activeIndicators]);

  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const showRSI = activeIndicators.has("RSI");
  const showMACD = activeIndicators.has("MACD");
  const hasSubChart = showRSI || showMACD;

  const xTickInterval = useMemo(() => {
    const len = chartData.length;
    if (len <= 10) return 0;
    if (len <= 30) return Math.floor(len / 6);
    return Math.floor(len / 8);
  }, [chartData]);

  // Candle renderer
  const renderCandleBar = useCallback(
    (props: any) => {
      const { x, width, payload } = props;
      if (!payload) return null;
      const { open, close, high, low, bullish } = payload;
      const allPrices = chartData.flatMap((d) => [d.high, d.low]);
      const minP = Math.min(...allPrices);
      const maxP = Math.max(...allPrices);
      const pad = (maxP - minP) * 0.08 || 1;
      const dMin = minP - pad;
      const dMax = maxP + pad;
      const cH = hasSubChart ? 220 : 310;
      const cT = 8;
      const yS = (v: number) => cT + cH - ((v - dMin) / (dMax - dMin)) * cH;
      const color = bullish ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)";
      const bTop = yS(Math.max(open, close));
      const bBot = yS(Math.min(open, close));
      const wT = yS(high);
      const wB = yS(low);
      const bW = Math.max(width * 0.6, 2);
      const cx = x + width / 2;
      return (
        <g>
          <line x1={cx} x2={cx} y1={wT} y2={wB} stroke={color} strokeWidth={1} />
          <rect x={cx - bW / 2} y={bTop} width={bW} height={Math.max(bBot - bTop, 1)} fill={color} rx={1} />
        </g>
      );
    },
    [chartData, hasSubChart]
  );

  // AI Chat
  const buildChartContext = () => {
    if (!quote || !chartData.length) return "";
    const last5 = chartData.slice(-5);
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const periodChange = (((last.price - first.price) / first.price) * 100).toFixed(2);
    const avgVol = chartData.reduce((s, d) => s + d.volume, 0) / chartData.length;
    const recentVol = last5.reduce((s, d) => s + d.volume, 0) / last5.length;
    const volMult = (recentVol / avgVol).toFixed(2);
    const lastRSI = last.rsi;
    const lastMACD = last.macd;
    const lastMACDSignal = last.macdSignal;

    return (
      `\n\nCHART CONTEXT for ${quote.symbol} (${quote.name}):\n` +
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
      `Recent 5 closes: ${last5.map((d) => "$" + formatPrice(d.price)).join(", ")}\n` +
      `SMA20 (last): $${formatPrice(chartData[chartData.length - 1]?.sma20 || 0)}\n` +
      `EMA12 (last): $${formatPrice(chartData[chartData.length - 1]?.ema12 || 0)}\n` +
      `RSI (14): ${lastRSI} ${lastRSI > 70 ? "(OVERBOUGHT)" : lastRSI < 30 ? "(OVERSOLD)" : "(NEUTRAL)"}\n` +
      `MACD: ${lastMACD} | Signal: ${lastMACDSignal} | ${lastMACD > lastMACDSignal ? "BULLISH crossover" : "BEARISH crossover"}\n`
    );
  };

  const handleChatSend = async (text?: string) => {
    const input = text || chatQuery;
    if (!input.trim() || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatQuery("");
    setChatLoading(true);

    let assistantSoFar = "";
    const allMessages = [...chatMessages, userMsg];

    const systemMsg: ChatMessage = {
      role: "user",
      content: `[SYSTEM CONTEXT - Chart Teaching Mode]\nYou are Maven, an AI chart teacher inside Monee. The user is learning to read stock charts. Teach them clearly and practically. Reference the actual chart data below. Use the chart's indicators, price action, and volume to explain concepts. Be encouraging but honest. Use **bold** for key terms and emojis for visual clarity. Keep responses under 250 words. Always end with a follow-up question or suggestion to deepen learning.${buildChartContext()}`,
    };

    const messagesForAI = [systemMsg, ...allMessages];

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setChatMessages((prev) => {
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

  const startLesson = (lesson: (typeof guidedLessons)[number], idx: number) => {
    setActiveLesson(idx);
    // Auto-enable relevant indicators
    if (lesson.title === "Volume Analysis") {
      setActiveIndicators((prev) => new Set([...prev, "Volume"]));
    } else if (lesson.title === "Moving Averages") {
      setActiveIndicators((prev) => new Set([...prev, "SMA20", "EMA12"]));
    }
    handleChatSend(lesson.prompt);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-xs shadow-xl backdrop-blur-sm">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {chartMode === "Candle" ? (
          <div className="space-y-0.5">
            <div className="flex justify-between gap-6"><span className="text-muted-foreground">Open</span><span className="font-medium tabular-nums">${formatPrice(d.open)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-muted-foreground">High</span><span className="font-medium tabular-nums">${formatPrice(d.high)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-muted-foreground">Low</span><span className="font-medium tabular-nums">${formatPrice(d.low)}</span></div>
            <div className="flex justify-between gap-6"><span className="text-muted-foreground">Close</span><span className="font-medium tabular-nums">${formatPrice(d.close)}</span></div>
          </div>
        ) : (
          <div className="flex justify-between gap-6"><span className="text-muted-foreground">Price</span><span className="font-medium tabular-nums">${formatPrice(d.price)}</span></div>
        )}
        {d.volume != null && (
          <div className="flex justify-between gap-6 mt-1 pt-1 border-t border-border/50">
            <span className="text-muted-foreground">Vol</span>
            <span className="font-medium tabular-nums">{formatVolume(d.volume)}</span>
          </div>
        )}
        {activeIndicators.has("RSI") && d.rsi != null && (
          <div className="flex justify-between gap-6 mt-0.5">
            <span className="text-muted-foreground">RSI</span>
            <span className={`font-medium tabular-nums ${d.rsi > 70 ? "text-loss" : d.rsi < 30 ? "text-gain" : ""}`}>{d.rsi}</span>
          </div>
        )}
      </div>
    );
  };

  // Current RSI value badge
  const currentRSI = chartData.length > 0 ? chartData[chartData.length - 1].rsi : null;
  const rsiLabel = currentRSI !== null ? (currentRSI > 70 ? "Overbought" : currentRSI < 30 ? "Oversold" : "Neutral") : null;

  return (
    <div className="px-4 pt-14 pb-8 lg:pt-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <GraduationCap size={20} className="text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Learn Charts</h1>
            <p className="text-xs text-muted-foreground">Interactive chart education with AI guidance</p>
          </div>
        </div>
        {selectedSymbol && (
          <button
            onClick={() => { setSelectedSymbol(null); setQuote(null); setChatMessages([]); setChatOpen(false); setActiveLesson(null); }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={12} /> Change Stock
          </button>
        )}
      </motion.div>

      {/* Search */}
      <motion.div className="relative mt-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 focus-within:border-foreground/20 transition-colors">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any stock to start learning..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          {isSearching && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            >
              {searchResults.map((r) => (
                <button key={r.symbol} onClick={() => selectStock(r.symbol)} className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary">
                  <div>
                    <span className="text-sm font-bold">{r.symbol}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{r.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{r.exchange}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* No stock selected: show popular stocks + guided lessons */}
      {!selectedSymbol && (
        <motion.div className="mt-6 space-y-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Popular stocks */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Popular Stocks</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {popularStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => selectStock(s.symbol)}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-foreground/20 hover:shadow-sm"
                >
                  <div>
                    <p className="text-sm font-bold">{s.symbol}</p>
                    <p className="text-[11px] text-muted-foreground">{s.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">{s.sector}</span>
                    <ChevronRight size={12} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Guided Lessons */}
          <div>
            <h2 className="mb-3 text-sm font-semibold flex items-center gap-2">
              <Lightbulb size={14} className="text-muted-foreground" />
              Guided Lessons
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">Select a stock above, then start a guided lesson with Maven AI</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {guidedLessons.map((lesson, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 opacity-60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <lesson.icon size={16} className="text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{lesson.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && !quote && (
        <div className="flex h-[40vh] items-center justify-center gap-3">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading chart data...</span>
        </div>
      )}

      {/* Chart + AI Panel */}
      {selectedSymbol && quote && (
        <motion.div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Chart Column */}
          <div className="space-y-3">
            {/* Stock header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{quote.symbol}</h2>
                  <span className="text-xs text-muted-foreground">{quote.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tabular-nums">${formatPrice(quote.price)}</span>
                  <span className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${isPositive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Chart mode */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                {chartModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setChartMode(mode)}
                    className={`px-3.5 py-1.5 text-xs font-medium transition-all ${chartMode === mode ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {/* Time range */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`px-2.5 py-1.5 text-[11px] font-medium transition-all ${activeRange === range ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div className="flex flex-wrap gap-1.5">
              {indicators.map((ind) => {
                const info = indicatorInfo[ind];
                const active = activeIndicators.has(ind);
                return (
                  <button
                    key={ind}
                    onClick={() => toggleIndicator(ind)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all border ${
                      active
                        ? "border-foreground/20 bg-foreground/5 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/10"
                    }`}
                    title={info.desc}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ind === "Volume" ? undefined : info.color }} />}
                    {info.label}
                  </button>
                );
              })}
              {/* RSI badge */}
              {showRSI && currentRSI !== null && (
                <span className={`ml-1 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                  currentRSI > 70 ? "bg-loss/10 text-loss" : currentRSI < 30 ? "bg-gain/10 text-gain" : "bg-secondary text-muted-foreground"
                }`}>
                  RSI {currentRSI} · {rsiLabel}
                </span>
              )}
            </div>

            {/* Main Chart */}
            <div className="rounded-xl border border-border bg-card p-3 relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                </div>
              )}
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={hasSubChart ? 280 : 380}>
                  <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="lcPriceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="lcBbGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(270, 50%, 55%)" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="hsl(270, 50%, 55%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={xTickInterval} />
                    <YAxis yAxisId="price" domain={yDomain} tickFormatter={(v) => `$${formatPrice(v)}`} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={65} tickCount={6} />
                    <YAxis yAxisId="volume" hide orientation="right" domain={[0, "dataMax * 3"]} />
                    <Tooltip content={<CustomTooltip />} />

                    {activeIndicators.has("Volume") && (
                      <Bar yAxisId="volume" dataKey="volume" fill="hsl(var(--muted-foreground))" opacity={0.15} radius={[1, 1, 0, 0]} />
                    )}
                    {activeIndicators.has("BB") && (
                      <>
                        <Area yAxisId="price" type="monotone" dataKey="bbBand" stroke="none" fill="url(#lcBbGrad)" dot={false} animationDuration={300} />
                        <Line yAxisId="price" type="monotone" dataKey="bbUpper" stroke="hsl(270, 50%, 55%)" strokeWidth={0.8} dot={false} strokeDasharray="3 2" animationDuration={300} />
                        <Line yAxisId="price" type="monotone" dataKey="bbLower" stroke="hsl(270, 50%, 55%)" strokeWidth={0.8} dot={false} strokeDasharray="3 2" animationDuration={300} />
                      </>
                    )}

                    {chartMode === "Line" ? (
                      <Area yAxisId="price" type="monotone" dataKey="price" stroke={isPositive ? "hsl(152, 28%, 40%)" : "hsl(0, 32%, 52%)"} strokeWidth={2} fill="url(#lcPriceGrad)" dot={false} animationDuration={500} />
                    ) : (
                      <Bar yAxisId="price" dataKey="candleBody" shape={renderCandleBar} animationDuration={300} />
                    )}

                    {activeIndicators.has("SMA20") && <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="hsl(45, 80%, 55%)" strokeWidth={1.3} dot={false} animationDuration={300} />}
                    {activeIndicators.has("EMA12") && <Line yAxisId="price" type="monotone" dataKey="ema12" stroke="hsl(200, 70%, 55%)" strokeWidth={1.3} dot={false} animationDuration={300} />}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[380px] items-center justify-center text-muted-foreground text-sm">No chart data</div>
              )}
            </div>

            {/* RSI Sub-chart */}
            {showRSI && chartData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">RSI (14)</span>
                  <span className="text-[10px] text-muted-foreground">Overbought: 70 · Oversold: 30</span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}`} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} ticks={[30, 50, 70]} />
                    <ReferenceLine y={70} stroke="hsl(0, 32%, 52%)" strokeDasharray="4 2" strokeOpacity={0.5} />
                    <ReferenceLine y={30} stroke="hsl(152, 28%, 40%)" strokeDasharray="4 2" strokeOpacity={0.5} />
                    <Area type="monotone" dataKey="rsi" stroke="hsl(45, 80%, 55%)" strokeWidth={1.5} fill="hsl(45, 80%, 55%)" fillOpacity={0.05} dot={false} animationDuration={300} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* MACD Sub-chart */}
            {showMACD && chartData.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">MACD (12, 26, 9)</span>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" hide />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} tickCount={3} />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" />
                    <Bar dataKey="macdHist" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[1, 1, 0, 0]} />
                    <Line type="monotone" dataKey="macd" stroke="hsl(200, 70%, 55%)" strokeWidth={1.3} dot={false} animationDuration={300} />
                    <Line type="monotone" dataKey="macdSignal" stroke="hsl(0, 50%, 60%)" strokeWidth={1.3} dot={false} strokeDasharray="3 2" animationDuration={300} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Market Cap", value: quote.marketCap },
                { label: "P/E Ratio", value: quote.peRatio },
                { label: "52W High", value: `$${formatPrice(quote.fiftyTwoWeekHigh)}` },
                { label: "52W Low", value: `$${formatPrice(quote.fiftyTwoWeekLow)}` },
                { label: "Volume", value: formatVolume(quote.volume) },
                { label: "Avg Volume", value: quote.avgVolume },
                { label: "Beta", value: quote.beta?.toFixed(2) || "N/A" },
                { label: "Div Yield", value: quote.dividendYield },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-border bg-card px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-bold tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Guided Lessons (when stock selected) */}
            <div>
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb size={12} /> Guided Lessons
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {guidedLessons.map((lesson, i) => (
                  <button
                    key={i}
                    onClick={() => startLesson(lesson, i)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                      activeLesson === i
                        ? "border-foreground/20 bg-foreground/5"
                        : "border-border bg-card hover:border-foreground/10"
                    }`}
                  >
                    <lesson.icon size={14} className={activeLesson === i ? "text-foreground" : "text-muted-foreground"} />
                    <p className="text-[11px] font-semibold">{lesson.title}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{lesson.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile chat toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground lg:hidden"
            >
              <MessageCircle size={16} />
              {chatOpen ? "Hide Maven" : "Ask Maven about this chart"}
            </button>
          </div>

          {/* AI Teaching Panel */}
          <div className={`flex flex-col rounded-xl border border-border bg-card overflow-hidden ${chatOpen ? "block" : "hidden lg:flex"}`}
            style={{ maxHeight: "calc(100vh - 100px)", position: "sticky", top: 72 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                  <Sparkles size={12} className="text-primary-foreground" />
                </div>
                <div>
                  <span className="text-sm font-bold">Maven</span>
                  <span className="ml-1.5 text-[9px] text-muted-foreground">Chart Teacher</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gain animate-pulse" />
                <span className="text-[9px] text-muted-foreground">Active</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GraduationCap size={32} className="text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Select a stock to begin</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Maven will guide you through chart analysis</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${msg.role === "user" ? "bg-foreground text-primary-foreground" : "bg-secondary/50"}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:mt-1 [&>h2]:text-[12.5px] [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:mb-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}
              {chatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-secondary/50 px-3.5 py-2.5 flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">Analyzing chart...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Teaching chips */}
            <div className="border-t border-border px-3 py-2">
              <div className="flex flex-wrap gap-1.5">
                {teachingChips.slice(0, 4).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChatSend(chip)}
                    disabled={chatLoading || !selectedSymbol}
                    className="rounded-lg bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border px-3 py-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-foreground/20 transition-colors">
                <input
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Ask about this chart..."
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/50"
                  disabled={chatLoading}
                />
                <button
                  onClick={() => handleChatSend()}
                  disabled={chatLoading || !chatQuery.trim()}
                  className="rounded-md bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
                >
                  <Send size={12} />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[9px] text-muted-foreground/50">Educational only · Not financial advice</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearnCharts;
