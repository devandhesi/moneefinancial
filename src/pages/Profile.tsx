import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, MessageSquare, Clock, Activity, PieChart, Zap, ChevronRight, ToggleLeft, ToggleRight, Settings } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import AchievementsWidget from "@/components/widgets/AchievementsWidget";

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

// Behavioral Pattern Timeline data: trades vs volatility
const timelineData = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  trades: Math.floor(Math.random() * 6 + 1),
  volatility: +(10 + Math.random() * 25).toFixed(1),
}));
// Simulate correlation: more trades during high volatility
timelineData.forEach((d) => {
  if (d.volatility > 25) d.trades = Math.min(d.trades + 3, 10);
});

// Portfolio snapshots
const snapshots = [
  { label: "Now", tech: 68, consumer: 12, finance: 10, health: 6, other: 4, value: "$12,438" },
  { label: "1 Month Ago", tech: 65, consumer: 14, finance: 11, health: 6, other: 4, value: "$11,600" },
  { label: "6 Months Ago", tech: 55, consumer: 18, finance: 15, health: 8, other: 4, value: "$10,180" },
  { label: "1 Year Ago", tech: 45, consumer: 22, finance: 18, health: 10, other: 5, value: "$8,200" },
];

const Profile = () => {
  const [isLive, setIsLive] = useState(false);
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const navigate = useNavigate();

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
          <p className="text-lg font-semibold">Alex Chen</p>
          <p className="text-xs text-muted-foreground">Paper Trading · Since Jan 2025</p>
        </div>
        <button onClick={() => setIsLive(!isLive)} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isLive ? <ToggleRight size={20} className="text-gain" /> : <ToggleLeft size={20} />}
          {isLive ? "Live" : "Demo"}
        </button>
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

      {/* Settings */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Settings</h2>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="glass-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{item.detail}</span>
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
          <button onClick={() => navigate("/settings")} className="glass-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">Broker & Account</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Connect</span>
              <ChevronRight size={14} />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Behavioral Report */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
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

      {/* Achievements */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <AchievementsWidget />
      </motion.div>

      {/* Disclaimer */}
      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <p className="text-[11px] text-muted-foreground">All data is from paper trading. Behavioral analysis is educational only.</p>
      </motion.div>
    </div>
  );
};

export default Profile;
