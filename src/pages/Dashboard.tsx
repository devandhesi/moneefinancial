import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, Repeat, FlaskConical, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import ContextSidebar from "@/components/layout/ContextSidebar";
import AiInsightWidget from "@/components/widgets/AiInsightWidget";
import { useTimezone } from "@/hooks/use-timezone";
import TrendingHeatStrip from "@/components/widgets/TrendingHeatStrip";
import { useLiveHoldings, useLiveIndices, usePortfolioChart } from "@/hooks/use-dashboard-data";
import { useDailyDigest } from "@/hooks/use-daily-digest";
import { useTradingMode } from "@/hooks/use-trading-mode";

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

  let statusText: string;
  if (isOpen) {
    const closeMin = 960 - mins;
    const h = Math.floor(closeMin / 60);
    const m = closeMin % 60;
    statusText = `Closes in ${h}h ${m}m`;
  } else {
    statusText = "Opens Mon–Fri 9:30 AM ET";
  }

  return { isOpen, displayTime, tzLabel, statusText };
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("ALL");
  const { timezone } = useTimezone();
  const { isOpen: marketOpen, displayTime, tzLabel } = useMarketStatus(timezone);

  const navigate = useNavigate();
  const { mode } = useTradingMode();

  const { data: liveHoldings, isLoading: holdingsLoading } = useLiveHoldings();
  const { data: liveIndices, isLoading: indicesLoading } = useLiveIndices();
  const { data: chartData, isLoading: chartLoading } = usePortfolioChart(activeTimeframe);
  const { data: digest, isLoading: digestLoading } = useDailyDigest();

  const totalValue = liveHoldings?.reduce((sum, h) => sum + h.value, 0) ?? 0;
  const totalDayChange = liveHoldings?.reduce((sum, h) => sum + (h.change * h.shares), 0) ?? 0;
  const totalDayChangePct = totalValue > 0 ? ((totalDayChange / (totalValue - totalDayChange)) * 100) : 0;
  const isPositive = totalDayChange >= 0;

  const cashBalance = 1078.50;
  const investmentBalance = totalValue;

  return (
    <div className="flex gap-8 px-5 pt-14 lg:pt-8">
      <div className="min-w-0 flex-1">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Good morning</p>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${mode === "real" ? "bg-gain/15 text-gain" : "bg-secondary text-muted-foreground"}`}>
                {mode === "real" ? "Real" : "Paper"}
              </span>
            </div>
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

        {/* Market Mini Cards */}
        <motion.div className="mt-5 grid grid-cols-3 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          {indicesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card flex items-center justify-center px-3 py-4">
                <Loader2 size={14} className="animate-spin text-muted-foreground" />
              </div>
            ))
          ) : (
            (liveIndices || []).map((m) => (
              <div key={m.label} className="glass-card px-3 py-2.5 text-center">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="mt-0.5 text-xs font-semibold">{m.value}</p>
                <p className={`text-[10px] font-medium ${m.change >= 0 ? "text-gain" : "text-loss"}`}>
                  {m.change >= 0 ? "+" : ""}{m.change.toFixed(2)}%
                </p>
              </div>
            ))
          )}
        </motion.div>

        {/* Chart */}
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

        {/* Maven AI Insight (mobile) */}
        <motion.div className="mt-4 xl:hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <AiInsightWidget insight={digest?.aiInsight} isLoading={digestLoading} />
        </motion.div>

        {/* Trending Heat Strip */}
        <motion.div className="mt-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.22 }}>
          <TrendingHeatStrip />
        </motion.div>

        {/* Accounts Summary — Cash & Investment only */}
        <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
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

        {/* Holdings */}
        <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Holdings</h2>
          <div className="space-y-2">
            {holdingsLoading ? (
              <div className="glass-card flex items-center justify-center p-6">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              (liveHoldings || []).map((h) => (
                <div key={h.symbol} onClick={() => navigate(`/invest/${h.symbol}`)} className="glass-card flex cursor-pointer items-center justify-between p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${marketOpen ? "bg-gain animate-pulse" : "bg-muted-foreground/30"}`} />
                    <div>
                      <p className="text-sm font-semibold">{h.symbol}</p>
                      <p className="text-xs text-muted-foreground">{h.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{balanceVisible ? `$${h.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••"}</p>
                    <p className={`text-xs ${h.changePercent >= 0 ? "text-gain" : "text-loss"}`}>{h.changePercent >= 0 ? "+" : ""}{h.changePercent.toFixed(2)}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions — Trade & Simulate only */}
        <motion.div className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
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

        {/* Disclaimer */}
        <motion.div className="mt-6 mb-4 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <p className="text-[11px] text-muted-foreground">
            {mode === "real" ? "📊 Real Portfolio · Read-only broker sync" : "Paper Trading Mode · Educational demo only · Not financial advice"}
          </p>
        </motion.div>
      </div>

      <ContextSidebar />
    </div>
  );
};

export default Dashboard;
