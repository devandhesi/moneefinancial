import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, Loader2, TrendingUp, Users, BookOpen, GripVertical, X, Settings2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import AiInsightWidget from "@/components/widgets/AiInsightWidget";
import { useTimezone } from "@/hooks/use-timezone";
import CompactHeatmapWidget from "@/components/widgets/CompactHeatmapWidget";
import { useLiveHoldings, usePortfolioChart } from "@/hooks/use-dashboard-data";
import { useDailyDigest } from "@/hooks/use-daily-digest";
import { useAuth } from "@/hooks/use-auth";

/* ── Market status hook ───────────────────────────────────────── */
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

// Default widget config
const DEFAULT_WIDGETS = [
  { id: "chart", label: "Portfolio Chart", visible: true },
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

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("ALL");
  const [customizing, setCustomizing] = useState(false);
  const [widgets, setWidgets] = useState(loadWidgetConfig);
  const { timezone } = useTimezone();
  const { isOpen: marketOpen, displayTime, tzLabel } = useMarketStatus(timezone);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: liveHoldings, isLoading: holdingsLoading } = useLiveHoldings();
  
  const { data: chartData, isLoading: chartLoading } = usePortfolioChart(activeTimeframe);
  const { data: digest, isLoading: digestLoading } = useDailyDigest();

  const totalValue = liveHoldings?.reduce((sum, h) => sum + h.value, 0) ?? 0;
  const totalDayChange = liveHoldings?.reduce((sum, h) => sum + (h.change * h.shares), 0) ?? 0;
  const totalDayChangePct = totalValue > 0 ? ((totalDayChange / (totalValue - totalDayChange)) * 100) : 0;
  const isPositive = totalDayChange >= 0;

  const cashBalance = 1078.50;
  const investmentBalance = totalValue;

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

  const displayName = profile?.display_name || profile?.username || "there";

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{greeting()}, {displayName}</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className={`h-1 w-1 rounded-full ${marketOpen ? "bg-gain" : "bg-muted-foreground/30"}`} />
              <span>{displayTime} {tzLabel}</span>
              <span className="text-muted-foreground/40">·</span>
              <span>{marketOpen ? "Open" : "Closed"}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-3">
            {holdingsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading portfolio…</span>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-semibold tracking-tight">
                  {balanceVisible ? `$${(cashBalance + investmentBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                </h1>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="mt-1 text-muted-foreground transition-colors hover:text-foreground">
                  {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </>
            )}
          </div>
          {!holdingsLoading && (
            <div className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-gain" : "text-loss"}`}>
              {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="font-medium">${Math.abs(totalDayChange).toLocaleString("en-US", { minimumFractionDigits: 2 })} ({Math.abs(totalDayChangePct).toFixed(2)}%)</span>
              <span className="text-muted-foreground">today</span>
            </div>
          )}
        </motion.div>

        {/* Chart */}
        {isWidgetVisible("chart") && (
          <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {chartLoading ? (
              <div className="flex h-[180px] items-center justify-center">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData || []} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Portfolio"]}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(152, 28%, 40%)" strokeWidth={1.5} fill="url(#chartGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <div className="mt-3 flex items-center gap-1">
              {timeframes.map((tf) => (
                <button key={tf} onClick={() => setActiveTimeframe(tf)} className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${activeTimeframe === tf ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {tf}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div className="mt-5 grid grid-cols-3 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {[
            { icon: TrendingUp, label: "Invest", route: "/invest", color: "text-gain" },
            { icon: Users, label: "Social", route: "/social", color: "text-blue-400" },
            { icon: BookOpen, label: "Learn", route: "/learn", color: "text-amber-400" },
          ].map(({ icon: Icon, label, route, color }) => (
            <button key={label} onClick={() => navigate(route)} className="glass-card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md active:scale-[0.98]">
              <Icon size={20} className={color} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </motion.div>

        {/* Maven AI Insight */}
        {isWidgetVisible("insight") && (
          <motion.div className="mt-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <AiInsightWidget insight={digest?.aiInsight} isLoading={digestLoading} />
          </motion.div>
        )}

        {/* Compact Heatmap */}
        {isWidgetVisible("heatmap") && (
          <motion.div className="mt-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}>
            <CompactHeatmapWidget />
          </motion.div>
        )}

        {/* Accounts Summary */}
        {isWidgetVisible("accounts") && (
          <motion.div className="mt-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Accounts</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground">Cash</p>
                <p className="mt-1 text-sm font-semibold">{balanceVisible ? `$${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••"}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-xs text-muted-foreground">Investment</p>
                <p className="mt-1 text-sm font-semibold">{balanceVisible ? `$${investmentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Customize Button */}
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button
            onClick={() => setCustomizing(!customizing)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            <Settings2 size={14} />
            {customizing ? "Done Customizing" : "Customize Dashboard"}
          </button>

          {customizing && (
            <motion.div className="mt-3 glass-card p-4 space-y-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <p className="text-xs font-medium text-muted-foreground mb-3">Toggle widgets on or off</p>
              {widgets.map((w: any) => (
                <label key={w.id} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm">{w.label}</span>
                  <input
                    type="checkbox"
                    checked={w.visible}
                    onChange={() => toggleWidget(w.id)}
                    className="h-4 w-4 rounded accent-foreground"
                  />
                </label>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Disclaimer */}
        <motion.div className="mt-4 mb-4 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <p className="text-[11px] text-muted-foreground">
            Paper Trading Mode · Educational demo only · Not financial advice
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
