import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Sparkles, ArrowUpRight, ArrowDownRight, Plus, Repeat, FlaskConical, SlidersHorizontal, X, Check } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import ContextSidebar from "@/components/layout/ContextSidebar";
import PortfolioHealthWidget from "@/components/widgets/PortfolioHealthWidget";
import MarketMoodWidget from "@/components/widgets/MarketMoodWidget";
import ProjectionWidget from "@/components/widgets/ProjectionWidget";
import AchievementsWidget from "@/components/widgets/AchievementsWidget";

const chartData = [
  { date: "Jan", value: 10000 },
  { date: "Feb", value: 10450 },
  { date: "Mar", value: 10180 },
  { date: "Apr", value: 11100 },
  { date: "May", value: 10850 },
  { date: "Jun", value: 11600 },
  { date: "Jul", value: 12438 },
];

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", value: 4280, change: 2.4, shares: 18 },
  { symbol: "MSFT", name: "Microsoft Corp.", value: 3120, change: -0.8, shares: 7 },
  { symbol: "GOOGL", name: "Alphabet Inc.", value: 2830, change: 1.2, shares: 16 },
  { symbol: "TSLA", name: "Tesla Inc.", value: 2208, change: -1.5, shares: 8 },
];

const marketCards = [
  { label: "S&P 500", value: "5,892.41", change: 0.34 },
  { label: "NASDAQ", value: "19,234.11", change: 0.58 },
  { label: "DOW", value: "43,128.90", change: -0.12 },
];

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

type WidgetKey = "marketCards" | "chart" | "healthMood" | "projection" | "insight" | "accounts" | "holdings" | "quickActions" | "achievements";

const widgetLabels: Record<WidgetKey, string> = {
  marketCards: "Market Overview",
  chart: "Performance Chart",
  healthMood: "Health Score & Market Mood",
  projection: "Long-Term Projection",
  insight: "Maven Insight",
  accounts: "Accounts Summary",
  holdings: "Holdings",
  quickActions: "Quick Actions",
  achievements: "Milestones",
};

const defaultVisibility: Record<WidgetKey, boolean> = {
  marketCards: true,
  chart: true,
  healthMood: true,
  projection: true,
  insight: true,
  accounts: true,
  holdings: true,
  quickActions: true,
  achievements: true,
};

const loadVisibility = (): Record<WidgetKey, boolean> => {
  try {
    const saved = localStorage.getItem("monee-dashboard-widgets");
    if (saved) return { ...defaultVisibility, ...JSON.parse(saved) };
  } catch {}
  return { ...defaultVisibility };
};

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("ALL");
  const [showCustomize, setShowCustomize] = useState(false);
  const [visibility, setVisibility] = useState<Record<WidgetKey, boolean>>(loadVisibility);

  const navigate = useNavigate();

  const totalValue = 12438.5;
  const totalGain = 2438.5;
  const totalGainPct = ((totalGain / (totalValue - totalGain)) * 100).toFixed(2);
  const isPositive = totalGain >= 0;

  const toggleWidget = (key: WidgetKey) => {
    setVisibility((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("monee-dashboard-widgets", JSON.stringify(next));
      return next;
    });
  };

  const resetAll = () => {
    setVisibility({ ...defaultVisibility });
    localStorage.removeItem("monee-dashboard-widgets");
  };

  const v = visibility;

  return (
    <div className="flex gap-8 px-5 pt-14 lg:pt-8">
      {/* Main Column */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Good morning</p>
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                showCustomize ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal size={13} />
              Customize
            </button>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">
              {balanceVisible ? `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
            </h1>
            <button onClick={() => setBalanceVisible(!balanceVisible)} className="mt-1 text-muted-foreground transition-colors hover:text-foreground">
              {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-gain" : "text-loss"}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="font-medium">${Math.abs(totalGain).toLocaleString("en-US", { minimumFractionDigits: 2 })} ({totalGainPct}%)</span>
            <span className="text-muted-foreground">all time</span>
          </div>
        </motion.div>

        {/* Customize Panel */}
        <AnimatePresence>
          {showCustomize && (
            <motion.div
              className="glass-card mt-4 p-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Dashboard Widgets</h3>
                <div className="flex items-center gap-2">
                  <button onClick={resetAll} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    Reset
                  </button>
                  <button onClick={() => setShowCustomize(false)} className="rounded-lg p-1 hover:bg-secondary">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {(Object.keys(widgetLabels) as WidgetKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleWidget(key)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                      v[key]
                        ? "bg-foreground text-primary-foreground"
                        : "glass-card text-muted-foreground"
                    }`}
                  >
                    {v[key] && <Check size={12} />}
                    {widgetLabels[key]}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Market Mini Cards */}
        {v.marketCards && (
          <motion.div className="mt-5 grid grid-cols-3 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            {marketCards.map((m) => (
              <div key={m.label} className="glass-card px-3 py-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-xs font-semibold">{m.value}</p>
                <p className={`text-[10px] font-medium ${m.change >= 0 ? "text-gain" : "text-loss"}`}>
                  {m.change >= 0 ? "+" : ""}{m.change}%
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Chart */}
        {v.chart && (
          <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(152, 28%, 40%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(152, 28%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }} />
                <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
                <Tooltip
                  contentStyle={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "12px", fontSize: "13px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(152, 28%, 40%)" strokeWidth={1.5} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-1">
              {timeframes.map((tf) => (
                <button key={tf} onClick={() => setActiveTimeframe(tf)} className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${activeTimeframe === tf ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {tf}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Health + Mood row */}
        {v.healthMood && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <PortfolioHealthWidget />
            <MarketMoodWidget />
          </div>
        )}

        {/* Projection */}
        {v.projection && <ProjectionWidget />}

        {/* AI Insight (mobile) */}
        {v.insight && (
          <motion.div className="glass-card mt-4 p-4 xl:hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size={14} className="text-muted-foreground" />
              <span>Maven Insight</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Your tech sector exposure is 68% of total portfolio. Consider diversifying into healthcare or consumer staples to reduce correlation risk.
            </p>
          </motion.div>
        )}

        {/* Accounts Summary */}
        {v.accounts && (
          <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Accounts</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {[
                { label: "TFSA", value: "$8,240.00" },
                { label: "RRSP", value: "$3,120.00" },
                { label: "Cash", value: "$1,078.50" },
              ].map((a) => (
                <div key={a.label} className="glass-card p-4">
                  <p className="text-xs text-muted-foreground">{a.label}</p>
                  <p className="mt-1 text-sm font-semibold">{balanceVisible ? a.value : "••••"}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Holdings */}
        {v.holdings && (
          <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Holdings</h2>
            <div className="space-y-2">
              {holdings.map((h) => (
                <div key={h.symbol} onClick={() => navigate(`/invest/${h.symbol}`)} className="glass-card flex cursor-pointer items-center justify-between p-4 transition-shadow hover:shadow-md">
                  <div>
                    <p className="text-sm font-semibold">{h.symbol}</p>
                    <p className="text-xs text-muted-foreground">{h.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{balanceVisible ? `$${h.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••"}</p>
                    <p className={`text-xs ${h.change >= 0 ? "text-gain" : "text-loss"}`}>{h.change >= 0 ? "+" : ""}{h.change}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {v.quickActions && (
          <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Plus, label: "Deposit", route: "/transactions" },
                { icon: Repeat, label: "Trade", route: "/invest" },
                { icon: FlaskConical, label: "Simulate", route: "/simulation" },
              ].map(({ icon: Icon, label, route }) => (
                <button key={label} onClick={() => navigate(route)} className="glass-card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md active:scale-[0.98]">
                  <Icon size={18} className="text-muted-foreground" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        {v.achievements && (
          <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
            <AchievementsWidget />
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div className="mt-6 mb-4 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <p className="text-[11px] text-muted-foreground">📄 Paper Trading Mode · Educational demo only · Not financial advice</p>
        </motion.div>
      </div>

      {/* Desktop Contextual Sidebar */}
      <ContextSidebar />
    </div>
  );
};

export default Dashboard;
