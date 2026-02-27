import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, MessageSquare, Clock, Activity, PieChart, Zap, ChevronRight, Settings, LogOut } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const behaviorStats = [
  { icon: Clock, label: "Avg Hold Time", value: "3.2 weeks" },
  { icon: Activity, label: "Trading Frequency", value: "4.1 trades/mo" },
  { icon: PieChart, label: "Sector Bias", value: "Technology (68%)" },
  { icon: Zap, label: "Volatility Response", value: "Moderate" },
];

const menuItems = [
  { icon: Shield, label: "Risk Profile", detail: "Moderate Growth" },
  { icon: MessageSquare, label: "Maven Tone", detail: "Conversational" },
];

const timelineData = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  trades: Math.floor(Math.random() * 6 + 1),
  volatility: +(10 + Math.random() * 25).toFixed(1),
}));
timelineData.forEach((d) => {
  if (d.volatility > 25) d.trades = Math.min(d.trades + 3, 10);
});

const snapshots = [
  { label: "Now", tech: 68, consumer: 12, finance: 10, health: 6, other: 4, value: "$12,438" },
  { label: "1 Month Ago", tech: 65, consumer: 14, finance: 11, health: 6, other: 4, value: "$11,600" },
  { label: "6 Months Ago", tech: 55, consumer: 18, finance: 15, health: 8, other: 4, value: "$10,180" },
  { label: "1 Year Ago", tech: 45, consumer: 22, finance: 18, health: 10, other: 5, value: "$8,200" },
];

const sectorData = [
  { label: "Technology", pct: 68, color: "hsl(215, 60%, 55%)" },
  { label: "Consumer", pct: 12, color: "hsl(30, 70%, 50%)" },
  { label: "Finance", pct: 10, color: "hsl(152, 28%, 40%)" },
  { label: "Healthcare", pct: 6, color: "hsl(280, 40%, 55%)" },
  { label: "Other", pct: 4, color: "hsl(220, 8%, 70%)" },
];

const assetTypes = [
  { label: "US Equities", pct: 85 },
  { label: "ETFs", pct: 10 },
  { label: "Cash", pct: 5 },
];

const marketCap = [
  { label: "Large Cap", pct: 78 },
  { label: "Mid Cap", pct: 15 },
  { label: "Small Cap", pct: 7 },
];

const volatility = [
  { label: "High β", pct: 42 },
  { label: "Medium β", pct: 38 },
  { label: "Low β", pct: 20 },
];

const flows = [
  { from: "Technology", to: "Healthcare", pct: 3, direction: "out" },
  { from: "Cash", to: "Technology", pct: 2, direction: "in" },
  { from: "Consumer", to: "Finance", pct: 1, direction: "neutral" },
];

const RiskBar = ({ title, items }: { title: string; items: { label: string; pct: number }[] }) => (
  <div>
    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</h4>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs">
            <span>{item.label}</span>
            <span className="font-medium">{item.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div className="h-full rounded-full bg-foreground/60" initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Profile = () => {
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const [riskExpanded, setRiskExpanded] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.display_name || profile?.username || "User";

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your behavioral intelligence</p>
      </motion.div>

      {/* User Card */}
      <motion.div className="glass-card mt-5 flex items-center gap-4 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <User size={24} className="text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">Paper Trading · Since Jan 2025</p>
        </div>
      </motion.div>

      {/* Pattern Summary */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <p className="text-xs font-medium text-muted-foreground">Pattern Detected</p>
        <p className="mt-1 text-sm font-semibold">Momentum Bias</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          You tend to enter positions after 5+ day uptrends and exit within 2–4 weeks. This pattern is consistent with short-term momentum trading.
        </p>
      </motion.div>

      {/* Behavioral Pattern Timeline */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <h3 className="mb-1 text-xs font-medium text-muted-foreground">Behavioral Pattern Timeline</h3>
        <p className="mb-3 text-[11px] text-muted-foreground">Your trading intensity increases during high volatility periods.</p>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={timelineData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,89%)" strokeOpacity={0.5} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(220,8%,50%)" }} interval={3} />
            <YAxis yAxisId="trades" hide />
            <YAxis yAxisId="vol" hide orientation="right" />
            <Tooltip
              contentStyle={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "12px", fontSize: "11px" }}
            />
            <Bar yAxisId="trades" dataKey="trades" fill="hsl(228,12%,22%)" opacity={0.15} name="Trades" />
            <Line yAxisId="vol" type="monotone" dataKey="volatility" stroke="hsl(0,32%,52%)" strokeWidth={1.5} dot={false} name="VIX" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-foreground/15" /> Trades</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-loss" /> Market Volatility</span>
        </div>
      </motion.div>

      {/* Portfolio Timeline Snapshots */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">Portfolio Timeline</h3>
        <div className="flex gap-1.5 mb-3">
          {snapshots.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSnapshotIdx(i)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                snapshotIdx === i ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex h-6 overflow-hidden rounded-lg mb-2">
          {[
            { key: "tech", color: "hsl(215, 60%, 55%)", pct: snapshots[snapshotIdx].tech },
            { key: "consumer", color: "hsl(30, 70%, 50%)", pct: snapshots[snapshotIdx].consumer },
            { key: "finance", color: "hsl(152, 28%, 40%)", pct: snapshots[snapshotIdx].finance },
            { key: "health", color: "hsl(280, 40%, 55%)", pct: snapshots[snapshotIdx].health },
            { key: "other", color: "hsl(220, 8%, 70%)", pct: snapshots[snapshotIdx].other },
          ].map((s) => (
            <motion.div key={s.key} style={{ background: s.color }} className="flex items-center justify-center text-[9px] font-medium text-primary-foreground" initial={false} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.5 }}>
              {s.pct > 8 && `${s.pct}%`}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{snapshots[snapshotIdx].label}</span>
          <span className="font-semibold">{snapshots[snapshotIdx].value}</span>
        </div>
      </motion.div>

      {/* Risk Exposure */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <button onClick={() => setRiskExpanded(!riskExpanded)} className="flex w-full items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Risk Exposure</h2>
          <span className="text-[10px] text-muted-foreground">{riskExpanded ? "Collapse" : "Expand"}</span>
        </button>

        <div className="glass-card p-4">
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">Sector Breakdown</h3>
          <div className="flex h-7 overflow-hidden rounded-lg">
            {sectorData.map((s) => (
              <motion.div
                key={s.label}
                style={{ background: s.color }}
                className="flex items-center justify-center text-[9px] font-medium text-primary-foreground transition-all hover:opacity-80"
                title={`${s.label}: ${s.pct}%`}
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ duration: 0.8 }}
              >
                {s.pct > 8 && `${s.pct}%`}
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
            {sectorData.map((s) => (
              <span key={s.label} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {riskExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3">
            <div className="glass-card p-4">
              <h3 className="mb-3 text-xs font-medium text-muted-foreground">Capital Flow</h3>
              <div className="space-y-2">
                {flows.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="font-medium">{f.from}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        f.direction === "out" ? "bg-loss/10 text-loss" : f.direction === "in" ? "bg-gain/10 text-gain" : "bg-secondary text-muted-foreground"
                      }`}>
                        {f.pct}%
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <span className="font-medium">{f.to}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted-foreground">Capital movement between sectors over the last 30 days.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="glass-card p-4"><RiskBar title="Asset Type" items={assetTypes} /></div>
              <div className="glass-card p-4"><RiskBar title="Market Cap" items={marketCap} /></div>
              <div className="glass-card p-4"><RiskBar title="Volatility Class" items={volatility} /></div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Settings</h2>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-card flex w-full items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium outline-none text-muted-foreground"
                    defaultValue={item.detail}
                    onChange={() => toast.success(`${item.label} updated`)}
                  >
                    {item.label === "Risk Profile" ? (
                      <>
                        <option>Conservative</option>
                        <option>Moderate Growth</option>
                        <option>Aggressive</option>
                      </>
                    ) : (
                      <>
                        <option>Professional</option>
                        <option>Conversational</option>
                        <option>Detailed</option>
                        <option>Brief</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Behavioral Report */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Behavioral Report</h2>
        <div className="grid grid-cols-2 gap-2">
          {behaviorStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-4">
                <Icon size={14} className="text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 text-sm font-semibold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Sign Out */}
      {user && (
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
          <button
            onClick={() => signOut()}
            className="glass-card flex w-full items-center justify-center gap-2 p-4 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div className="mt-4 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <p className="text-[11px] text-muted-foreground">All data is from paper trading. Behavioral analysis is educational only.</p>
      </motion.div>
    </div>
  );
};

export default Profile;
