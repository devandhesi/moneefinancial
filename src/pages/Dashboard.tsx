import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp, Users, GraduationCap, Settings2, Sparkles, BarChart3, Wallet, BookOpen } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import AiInsightWidget from "@/components/widgets/AiInsightWidget";
import { useTimezone } from "@/hooks/use-timezone";
import CompactHeatmapWidget from "@/components/widgets/CompactHeatmapWidget";
import { usePortfolioChart } from "@/hooks/use-dashboard-data";
import { useDailyDigest } from "@/hooks/use-daily-digest";
import { useAuth } from "@/hooks/use-auth";
import { usePortfolioValue } from "@/hooks/use-portfolio-value";
import MyHoldingsWidget from "@/components/widgets/MyHoldingsWidget";
import MavenIcon from "@/components/MavenIcon";

/* ── Clear demo data on first load ────────────────────────── */
if (typeof window !== "undefined") {
  const cleared = sessionStorage.getItem("demo-cleared");
  if (!cleared) {
    localStorage.removeItem("maven-chat-history");
    sessionStorage.removeItem("maven-open");
    sessionStorage.setItem("demo-cleared", "true");
  }
}

/* ── Market status hook ───────────────────────────────────── */
function useMarketStatus(userTimezone: string) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const mins = et.getHours() * 60 + et.getMinutes();
  const isOpen = day >= 1 && day <= 5 && mins >= 570 && mins < 960;

  const displayTime = now.toLocaleTimeString("en-US", {
    timeZone: userTimezone, hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
  });
  const tzLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimezone, timeZoneName: "short",
  }).formatToParts(now).find(p => p.type === "timeZoneName")?.value || "";

  return { isOpen, displayTime, tzLabel };
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const DEFAULT_WIDGETS = [
  { id: "chart", label: "Portfolio Chart", visible: true },
  { id: "holdings", label: "My Holdings", visible: true },
  { id: "accounts", label: "Accounts", visible: true },
  { id: "heatmap", label: "Market Heatmap", visible: true },
  { id: "insight", label: "Maven Insight", visible: true },
];

function loadWidgetConfig() {
  try {
    const stored = localStorage.getItem("monee-dashboard-widgets");
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_WIDGETS;
}

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } } },
};

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("ALL");
  const [customizing, setCustomizing] = useState(false);
  const [widgets, setWidgets] = useState(loadWidgetConfig);
  const { timezone } = useTimezone();
  const { isOpen: marketOpen, displayTime, tzLabel } = useMarketStatus(timezone);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const {
    cashBalance, investmentBalance, totalValue, totalDayChange,
    totalDayChangePct, isPositive, isLoading: holdingsLoading,
  } = usePortfolioValue();

  const { data: chartData, isLoading: chartLoading } = usePortfolioChart(activeTimeframe);
  const { data: digest, isLoading: digestLoading } = useDailyDigest();

  const isWidgetVisible = (id: string) => widgets.find((w: any) => w.id === id)?.visible ?? true;

  const toggleWidget = (id: string) => {
    const updated = widgets.map((w: any) => w.id === id ? { ...w, visible: !w.visible } : w);
    setWidgets(updated);
    localStorage.setItem("monee-dashboard-widgets", JSON.stringify(updated));
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = profile?.display_name?.split(" ")[0] || profile?.username || "there";
  const hasPortfolio = cashBalance + investmentBalance > 0;

  return (
    <motion.div
      className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8"
      variants={stagger.container}
      initial="initial"
      animate="animate"
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div variants={stagger.item}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-muted-foreground">{greeting()}, {displayName} 👋</h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${marketOpen ? "bg-gain animate-pulse" : "bg-muted-foreground/30"}`} />
              <span>{displayTime} {tzLabel}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{marketOpen ? "Open" : "Closed"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3" data-tour-id="tour-portfolio-value">
            {holdingsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading portfolio…</span>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-semibold tracking-tight tabular-nums">
                  {balanceVisible ? `$${(cashBalance + investmentBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                </h2>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="mt-1 text-muted-foreground transition-colors hover:text-foreground">
                  {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </>
            )}
          </div>
          {!holdingsLoading && (
            <div className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-gain" : "text-loss"}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="font-medium tabular-nums">{balanceVisible ? `$${Math.abs(totalDayChange).toLocaleString("en-US", { minimumFractionDigits: 2 })} (${Math.abs(totalDayChangePct).toFixed(2)}%)` : `${Math.abs(totalDayChangePct).toFixed(2)}%`}</span>
              <span className="text-muted-foreground">today</span>
            </div>
          )}
        </motion.div>

        {/* Chart */}
        {isWidgetVisible("chart") && (
          <motion.div className="glass-card mt-5 p-4" variants={stagger.item}>
            {chartLoading ? (
              <div className="flex h-[180px] items-center justify-center">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData || []} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--gain))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--gain))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
                  <Tooltip
                    contentStyle={{ background: "var(--glass-bg-strong)", backdropFilter: "blur(16px)", border: "1px solid var(--glass-border)", borderRadius: "12px", fontSize: "13px", boxShadow: "var(--glass-shadow)" }}
                    formatter={(value: number) => [balanceVisible ? `$${value.toLocaleString()}` : "••••", "Portfolio"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--gain))" strokeWidth={1.5} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="mt-3 flex items-center gap-1">
              {timeframes.map((tf) => (
                <button key={tf} onClick={() => setActiveTimeframe(tf)} className={`relative rounded-lg px-3 py-1 text-xs font-medium transition-all ${activeTimeframe === tf ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {activeTimeframe === tf && (
                    <motion.div layoutId="tf-pill" className="absolute inset-0 rounded-lg bg-foreground" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className={`relative z-10 ${activeTimeframe === tf ? "text-primary-foreground" : ""}`}>{tf}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div className="mt-5 grid grid-cols-4 gap-2" variants={stagger.item}>
          {[
            { icon: TrendingUp, label: "Invest", route: "/invest", color: "text-gain" },
            { icon: GraduationCap, label: "Learn", route: "/learn", color: "text-amber-500" },
            { icon: Users, label: "Social", route: "/social", color: "text-blue-500" },
            { icon: BarChart3, label: "Markets", route: "/heatmap", color: "text-violet-500" },
          ].map(({ icon: Icon, label, route, color }) => (
            <button key={label} onClick={() => navigate(route)} className="glass-card flex flex-col items-center gap-1.5 p-3.5 transition-all hover:shadow-md active:scale-[0.97]">
              <Icon size={18} className={color} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </motion.div>

        {/* My Holdings */}
        {isWidgetVisible("holdings") && (
          <motion.div className="mt-4" variants={stagger.item}>
            <MyHoldingsWidget />
          </motion.div>
        )}

        {/* Maven AI Insight */}
        {isWidgetVisible("insight") && (
          <motion.div className="mt-4" variants={stagger.item}>
            <AiInsightWidget insight={digest?.aiInsight} isLoading={digestLoading} />
          </motion.div>
        )}

        {/* Compact Heatmap */}
        {isWidgetVisible("heatmap") && (
          <motion.div className="mt-4" variants={stagger.item}>
            <CompactHeatmapWidget />
          </motion.div>
        )}

        {/* Accounts Summary */}
        {isWidgetVisible("accounts") && (
          <motion.div className="mt-5" variants={stagger.item} data-tour-id="tour-accounts-summary">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Accounts</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Cash</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{balanceVisible ? `$${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••"}</p>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Invested</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{balanceVisible ? `$${investmentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Customize Button */}
        <motion.div className="mt-6" variants={stagger.item}>
          <button
            onClick={() => setCustomizing(!customizing)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <Settings2 size={14} />
            {customizing ? "Done" : "Customize"}
          </button>

          {customizing && (
            <motion.div className="mt-3 glass-card p-4 space-y-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <p className="text-xs font-medium text-muted-foreground mb-3">Toggle widgets</p>
              {widgets.map((w: any) => (
                <label key={w.id} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm">{w.label}</span>
                  <input type="checkbox" checked={w.visible} onChange={() => toggleWidget(w.id)} className="h-4 w-4 rounded accent-foreground" />
                </label>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div className="mt-4 mb-4 rounded-xl bg-secondary/60 px-4 py-3 text-center" variants={stagger.item}>
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <Sparkles size={10} />
            Paper Trading · Built for students · Not financial advice
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
