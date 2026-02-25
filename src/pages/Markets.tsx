import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Activity, BarChart3, Clock, Flame, DollarSign, Percent,
  ChevronDown, ChevronUp, Search, Sun, Moon, Zap, Shield,
  Gauge, PieChart, ArrowRight,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { useTimezone } from "@/hooks/use-timezone";

/* ── Static data ─────────────────────────────────────────────── */

interface Exchange {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  timezone: string;
  openHour: number; openMin: number;
  closeHour: number; closeMin: number;
  indices: Index[];
  weekdays: number[]; // 1=Mon..5=Fri
}

interface Index {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

const mkSparkline = (base: number, vol: number): number[] =>
  Array.from({ length: 20 }, (_, i) => base + Math.sin(i * 0.5) * vol + (Math.random() - 0.4) * vol * 0.8);

const EXCHANGES: Exchange[] = [
  {
    id: "nyse", name: "New York Stock Exchange", shortName: "NYSE", country: "United States", flag: "🇺🇸",
    timezone: "America/New_York", openHour: 9, openMin: 30, closeHour: 16, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^DJI", name: "Dow Jones", value: 43128.90, change: -52.40, changePercent: -0.12, sparkline: mkSparkline(43100, 120) },
      { symbol: "^GSPC", name: "S&P 500", value: 5892.41, change: 20.12, changePercent: 0.34, sparkline: mkSparkline(5880, 30) },
      { symbol: "^VIX", name: "VIX", value: 14.32, change: -0.68, changePercent: -4.53, sparkline: mkSparkline(14.5, 1.2) },
    ],
  },
  {
    id: "nasdaq", name: "NASDAQ", shortName: "NASDAQ", country: "United States", flag: "🇺🇸",
    timezone: "America/New_York", openHour: 9, openMin: 30, closeHour: 16, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^IXIC", name: "NASDAQ Composite", value: 19234.11, change: 112.56, changePercent: 0.59, sparkline: mkSparkline(19200, 80) },
      { symbol: "^NDX", name: "NASDAQ-100", value: 21456.78, change: 145.23, changePercent: 0.68, sparkline: mkSparkline(21400, 100) },
    ],
  },
  {
    id: "tsx", name: "Toronto Stock Exchange", shortName: "TSX", country: "Canada", flag: "🇨🇦",
    timezone: "America/Toronto", openHour: 9, openMin: 30, closeHour: 16, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^GSPTSE", name: "S&P/TSX Composite", value: 24856.30, change: 87.45, changePercent: 0.35, sparkline: mkSparkline(24800, 60) },
      { symbol: "^TXCX", name: "S&P/TSX 60", value: 1485.20, change: 5.12, changePercent: 0.35, sparkline: mkSparkline(1480, 8) },
    ],
  },
  {
    id: "lse", name: "London Stock Exchange", shortName: "LSE", country: "United Kingdom", flag: "🇬🇧",
    timezone: "Europe/London", openHour: 8, openMin: 0, closeHour: 16, closeMin: 30, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^FTSE", name: "FTSE 100", value: 8245.60, change: 32.10, changePercent: 0.39, sparkline: mkSparkline(8230, 40) },
      { symbol: "^FTMC", name: "FTSE 250", value: 20876.40, change: -45.20, changePercent: -0.22, sparkline: mkSparkline(20900, 70) },
    ],
  },
  {
    id: "euronext", name: "Euronext Paris", shortName: "Euronext", country: "France", flag: "🇫🇷",
    timezone: "Europe/Paris", openHour: 9, openMin: 0, closeHour: 17, closeMin: 30, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^FCHI", name: "CAC 40", value: 7634.50, change: 18.90, changePercent: 0.25, sparkline: mkSparkline(7620, 30) },
    ],
  },
  {
    id: "xetra", name: "Frankfurt Stock Exchange", shortName: "XETRA", country: "Germany", flag: "🇩🇪",
    timezone: "Europe/Berlin", openHour: 9, openMin: 0, closeHour: 17, closeMin: 30, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^GDAXI", name: "DAX", value: 18456.80, change: -23.45, changePercent: -0.13, sparkline: mkSparkline(18470, 50) },
    ],
  },
  {
    id: "tse", name: "Tokyo Stock Exchange", shortName: "TSE", country: "Japan", flag: "🇯🇵",
    timezone: "Asia/Tokyo", openHour: 9, openMin: 0, closeHour: 15, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^N225", name: "Nikkei 225", value: 38542.60, change: 245.80, changePercent: 0.64, sparkline: mkSparkline(38400, 180) },
      { symbol: "^TOPX", name: "TOPIX", value: 2734.50, change: 12.30, changePercent: 0.45, sparkline: mkSparkline(2725, 15) },
    ],
  },
  {
    id: "hkex", name: "Hong Kong Stock Exchange", shortName: "HKEX", country: "Hong Kong", flag: "🇭🇰",
    timezone: "Asia/Hong_Kong", openHour: 9, openMin: 30, closeHour: 16, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^HSI", name: "Hang Seng", value: 17635.20, change: -112.40, changePercent: -0.63, sparkline: mkSparkline(17700, 100) },
    ],
  },
  {
    id: "sse", name: "Shanghai Stock Exchange", shortName: "SSE", country: "China", flag: "🇨🇳",
    timezone: "Asia/Shanghai", openHour: 9, openMin: 30, closeHour: 15, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^SSEC", name: "SSE Composite", value: 3089.45, change: 8.76, changePercent: 0.28, sparkline: mkSparkline(3080, 12) },
    ],
  },
  {
    id: "asx", name: "Australian Securities Exchange", shortName: "ASX", country: "Australia", flag: "🇦🇺",
    timezone: "Australia/Sydney", openHour: 10, openMin: 0, closeHour: 16, closeMin: 0, weekdays: [1,2,3,4,5],
    indices: [
      { symbol: "^AXJO", name: "ASX 200", value: 8234.70, change: 45.30, changePercent: 0.55, sparkline: mkSparkline(8200, 35) },
    ],
  },
];

const MARKET_INDICATORS = [
  { label: "Fear & Greed", value: 52, unit: "/ 100", icon: Gauge, desc: "Neutral", color: "text-muted-foreground" },
  { label: "Put/Call Ratio", value: 0.87, unit: "", icon: Activity, desc: "Slightly bearish", color: "text-muted-foreground" },
  { label: "10Y Treasury", value: 4.32, unit: "%", icon: Percent, desc: "+2bp today", color: "text-muted-foreground" },
  { label: "USD Index (DXY)", value: 104.56, unit: "", icon: DollarSign, desc: "-0.12%", color: "text-muted-foreground" },
  { label: "Gold (XAU)", value: 2342.80, unit: "", icon: Shield, desc: "+0.45%", color: "text-muted-foreground" },
  { label: "Bitcoin", value: 67845, unit: "", icon: Zap, desc: "+1.2%", color: "text-muted-foreground" },
];

const SECTOR_PERFORMANCE = [
  { name: "Technology", change: 1.24, volume: 4.2 },
  { name: "Healthcare", change: 0.56, volume: 2.1 },
  { name: "Financials", change: -0.34, volume: 3.5 },
  { name: "Energy", change: -0.89, volume: 2.8 },
  { name: "Consumer Disc.", change: 0.78, volume: 1.9 },
  { name: "Industrials", change: 0.12, volume: 2.3 },
  { name: "Materials", change: -0.45, volume: 1.2 },
  { name: "Real Estate", change: -1.12, volume: 0.9 },
  { name: "Utilities", change: 0.23, volume: 0.7 },
  { name: "Comm. Services", change: 0.91, volume: 1.8 },
  { name: "Consumer Staples", change: 0.05, volume: 1.1 },
];

const ECONOMIC_CALENDAR = [
  { date: "Feb 26", event: "Consumer Confidence", impact: "high", actual: null, forecast: "104.2", previous: "104.1" },
  { date: "Feb 27", event: "GDP (Q4 Final)", impact: "high", actual: null, forecast: "3.3%", previous: "4.9%" },
  { date: "Feb 28", event: "PCE Price Index", impact: "high", actual: null, forecast: "0.3%", previous: "0.2%" },
  { date: "Mar 3", event: "ISM Manufacturing", impact: "medium", actual: null, forecast: "49.5", previous: "49.1" },
  { date: "Mar 5", event: "ADP Employment", impact: "medium", actual: null, forecast: "150K", previous: "164K" },
  { date: "Mar 7", event: "Nonfarm Payrolls", impact: "high", actual: null, forecast: "198K", previous: "216K" },
];

/* ── Helpers ──────────────────────────────────────────────────── */

function getExchangeStatus(exchange: Exchange, userTz: string) {
  const now = new Date();
  const exLocal = new Date(now.toLocaleString("en-US", { timeZone: exchange.timezone }));
  const day = exLocal.getDay();
  const mins = exLocal.getHours() * 60 + exLocal.getMinutes();
  const openMins = exchange.openHour * 60 + exchange.openMin;
  const closeMins = exchange.closeHour * 60 + exchange.closeMin;
  const isWeekday = exchange.weekdays.includes(day === 0 ? 7 : day);
  const isOpen = isWeekday && mins >= openMins && mins < closeMins;

  const localTime = now.toLocaleTimeString("en-US", {
    timeZone: userTz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  let statusText: string;
  if (isOpen) {
    const remaining = closeMins - mins;
    const h = Math.floor(remaining / 60);
    const m = remaining % 60;
    statusText = h > 0 ? `Closes in ${h}h ${m}m` : `Closes in ${m}m`;
  } else {
    statusText = `Opens ${exchange.openHour}:${String(exchange.openMin).padStart(2, "0")} local`;
  }

  return { isOpen, localTime, statusText };
}

function formatNumber(n: number): string {
  if (n >= 10000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Component ────────────────────────────────────────────────── */

const Markets = () => {
  const navigate = useNavigate();
  const { timezone } = useTimezone();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedExchange, setExpandedExchange] = useState<string | null>("nyse");
  const [activeTab, setActiveTab] = useState<"exchanges" | "indicators" | "sectors" | "calendar">("exchanges");

  const filteredExchanges = useMemo(() => {
    if (!searchQuery) return EXCHANGES;
    const q = searchQuery.toLowerCase();
    return EXCHANGES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.indices.some((i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const topMovers = useMemo(() => {
    const all = EXCHANGES.flatMap((e) => e.indices);
    const gainers = [...all].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
    const losers = [...all].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
    return { gainers, losers };
  }, []);

  const tabs = [
    { id: "exchanges" as const, label: "Exchanges", icon: Globe },
    { id: "indicators" as const, label: "Indicators", icon: Activity },
    { id: "sectors" as const, label: "Sectors", icon: PieChart },
    { id: "calendar" as const, label: "Calendar", icon: Clock },
  ];

  return (
    <div className="space-y-5 px-5 pb-24 pt-14 lg:pb-8 lg:pt-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Markets</h1>
        <p className="mt-1 text-sm text-muted-foreground">Global exchanges, indicators, and economic data</p>
      </motion.div>

      {/* Top Movers Strip */}
      <motion.div
        className="flex gap-3 overflow-x-auto pb-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        {[...topMovers.gainers, ...topMovers.losers].map((idx) => (
          <div
            key={idx.symbol}
            className="glass-card flex shrink-0 items-center gap-3 px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{idx.name}</p>
              <p className="text-[10px] text-muted-foreground">{idx.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tabular-nums">{formatNumber(idx.value)}</p>
              <p className={`flex items-center gap-0.5 text-[10px] font-medium tabular-nums ${idx.changePercent >= 0 ? "text-gain" : "text-loss"}`}>
                {idx.changePercent >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-1 rounded-2xl bg-secondary p-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="markets-tab"
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "exchanges" && (
          <motion.div
            key="exchanges"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            {/* Search */}
            <div className="glass-card flex items-center gap-2 px-4 py-3">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exchanges, indices, or countries..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Exchange Cards */}
            {filteredExchanges.map((exchange, i) => {
              const status = getExchangeStatus(exchange, timezone);
              const isExpanded = expandedExchange === exchange.id;
              return (
                <motion.div
                  key={exchange.id}
                  className="glass-card overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Exchange Header */}
                  <button
                    onClick={() => setExpandedExchange(isExpanded ? null : exchange.id)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{exchange.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{exchange.shortName}</p>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            status.isOpen
                              ? "bg-gain/10 text-gain"
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {status.isOpen ? <Sun size={10} /> : <Moon size={10} />}
                            {status.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{exchange.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">{status.localTime}</p>
                        <p className="text-[10px] text-muted-foreground">{status.statusText}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={14} className="text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Indices */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/30 px-4 py-3 space-y-2.5">
                          {exchange.indices.map((idx) => (
                            <div
                              key={idx.symbol}
                              className="flex items-center justify-between rounded-xl bg-secondary/40 px-3.5 py-3 transition-colors hover:bg-secondary/70"
                            >
                              <div className="flex items-center gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold">{idx.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{idx.symbol}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {/* Mini sparkline */}
                                <div className="hidden h-8 w-20 sm:block">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={idx.sparkline.map((v, j) => ({ v, i: j }))}>
                                      <defs>
                                        <linearGradient id={`grad-${idx.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor={idx.changePercent >= 0 ? "hsl(var(--gain))" : "hsl(var(--loss))"} stopOpacity={0.3} />
                                          <stop offset="100%" stopColor={idx.changePercent >= 0 ? "hsl(var(--gain))" : "hsl(var(--loss))"} stopOpacity={0} />
                                        </linearGradient>
                                      </defs>
                                      <Area
                                        type="monotone"
                                        dataKey="v"
                                        stroke={idx.changePercent >= 0 ? "hsl(var(--gain))" : "hsl(var(--loss))"}
                                        strokeWidth={1.5}
                                        fill={`url(#grad-${idx.symbol})`}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold tabular-nums">{formatNumber(idx.value)}</p>
                                  <p className={`flex items-center justify-end gap-0.5 text-[11px] font-medium tabular-nums ${
                                    idx.changePercent >= 0 ? "text-gain" : "text-loss"
                                  }`}>
                                    {idx.changePercent >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%)
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeTab === "indicators" && (
          <motion.div
            key="indicators"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">Key market health indicators and benchmarks</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MARKET_INDICATORS.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <motion.div
                    key={ind.label}
                    className="glass-card flex items-center gap-4 px-4 py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Icon size={18} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{ind.label}</p>
                      <p className="text-lg font-semibold tabular-nums">
                        {typeof ind.value === "number" && ind.value >= 1000
                          ? ind.value.toLocaleString("en-US", { maximumFractionDigits: 2 })
                          : ind.value}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">{ind.unit}</span>
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{ind.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Yield Curve */}
            <motion.div
              className="glass-card p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-medium">US Treasury Yield Curve</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { term: "1M", yield: 5.38 },
                      { term: "3M", yield: 5.35 },
                      { term: "6M", yield: 5.28 },
                      { term: "1Y", yield: 5.02 },
                      { term: "2Y", yield: 4.58 },
                      { term: "5Y", yield: 4.21 },
                      { term: "10Y", yield: 4.32 },
                      { term: "30Y", yield: 4.51 },
                    ]}
                    margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="term" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3.5, 5.5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v.toFixed(2)}%`, "Yield"]}
                    />
                    <Bar dataKey="yield" fill="hsl(var(--foreground))" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Commodities & Crypto quick strip */}
            <motion.div
              className="glass-card p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Flame size={14} className="text-muted-foreground" />
                Commodities & Crypto
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { name: "Gold", value: "$2,342.80", change: 0.45 },
                  { name: "Oil (WTI)", value: "$78.34", change: -1.12 },
                  { name: "Silver", value: "$27.45", change: 0.92 },
                  { name: "Bitcoin", value: "$67,845", change: 1.2 },
                ].map((c) => (
                  <div key={c.name} className="rounded-xl bg-secondary/50 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground">{c.name}</p>
                    <p className="text-sm font-semibold tabular-nums">{c.value}</p>
                    <p className={`text-[10px] font-medium tabular-nums ${c.change >= 0 ? "text-gain" : "text-loss"}`}>
                      {c.change >= 0 ? "+" : ""}{c.change.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "sectors" && (
          <motion.div
            key="sectors"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">S&P 500 sector performance today</p>
            <div className="space-y-1.5">
              {SECTOR_PERFORMANCE
                .sort((a, b) => b.change - a.change)
                .map((sector, i) => (
                <motion.div
                  key={sector.name}
                  className="glass-card flex items-center justify-between px-4 py-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${sector.change >= 0 ? "bg-gain" : "bg-loss"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.abs(sector.change) * 40, 100)}%` }}
                        transition={{ delay: i * 0.03 + 0.2, duration: 0.5 }}
                      />
                    </div>
                    <p className="text-sm font-medium">{sector.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] text-muted-foreground tabular-nums">{sector.volume}B vol</p>
                    <p className={`flex items-center gap-0.5 text-sm font-semibold tabular-nums ${
                      sector.change >= 0 ? "text-gain" : "text-loss"
                    }`}>
                      {sector.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {sector.change >= 0 ? "+" : ""}{sector.change.toFixed(2)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sector heatmap legend */}
            <div className="glass-card p-4">
              <h3 className="mb-2 text-sm font-medium">Quick Insights</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• <span className="font-medium text-foreground">Tech leads</span> — AI/semiconductor momentum continues to drive the sector</p>
                <p>• <span className="font-medium text-foreground">Energy lags</span> — Oil prices under pressure from weaker demand data</p>
                <p>• <span className="font-medium text-foreground">Real Estate weakest</span> — Higher-for-longer rates weighing on REITs</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <p className="text-xs text-muted-foreground">Upcoming economic events that may move markets</p>
            {ECONOMIC_CALENDAR.map((event, i) => (
              <motion.div
                key={event.event}
                className="glass-card flex items-center justify-between px-4 py-3.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted-foreground">{event.date.split(" ")[0]}</p>
                    <p className="text-sm font-semibold">{event.date.split(" ")[1]}</p>
                  </div>
                  <div className="h-8 w-px bg-border/50" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{event.event}</p>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        event.impact === "high" ? "bg-loss" : "bg-muted-foreground/40"
                      }`} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Forecast: {event.forecast} · Previous: {event.previous}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  event.impact === "high" ? "bg-loss/10 text-loss" : "bg-secondary text-muted-foreground"
                }`}>
                  {event.impact}
                </span>
              </motion.div>
            ))}

            <div className="glass-card p-4">
              <h3 className="mb-2 text-sm font-medium">How to Use This</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>• <span className="font-medium text-loss">High impact</span> events often cause significant market volatility</p>
                <p>• Compare <span className="font-medium text-foreground">forecast vs previous</span> — surprises drive moves</p>
                <p>• Consider reducing position sizes before high-impact releases</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Markets;
