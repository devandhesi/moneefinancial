import { motion } from "framer-motion";
import {
  User,
  Shield,
  MessageSquare,
  Clock,
  Activity,
  PieChart,
  Zap,
  ChevronRight,
} from "lucide-react";

const behaviorStats = [
  { icon: Clock, label: "Avg Hold Time", value: "3.2 weeks" },
  { icon: Activity, label: "Trading Frequency", value: "4.1 trades/mo" },
  { icon: PieChart, label: "Sector Bias", value: "Technology (68%)" },
  { icon: Zap, label: "Volatility Response", value: "Moderate" },
];

const menuItems = [
  { icon: Shield, label: "Risk Profile", detail: "Moderate Growth" },
  { icon: MessageSquare, label: "Assistant Tone", detail: "Conversational" },
];

const Profile = () => {
  return (
    <div className="px-5 pt-14 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your behavioral intelligence
        </p>
      </motion.div>

      {/* User Card */}
      <motion.div
        className="glass-card mt-5 flex items-center gap-4 p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <User size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold">Alex Chen</p>
          <p className="text-xs text-muted-foreground">Paper Trading · Since Jan 2025</p>
        </div>
      </motion.div>

      {/* Pattern Summary */}
      <motion.div
        className="glass-card mt-4 p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <p className="text-xs font-medium text-muted-foreground">Pattern Detected</p>
        <p className="mt-1 text-sm font-semibold">Momentum Bias</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          You tend to enter positions after 5+ day uptrends and exit within 2–4 weeks.
          This pattern is consistent with short-term momentum trading. Consider whether
          this aligns with your long-term goals.
        </p>
      </motion.div>

      {/* Settings */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Settings</h2>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="glass-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md"
              >
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
        </div>
      </motion.div>

      {/* Behavioral Report */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Behavioral Report
        </h2>
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

      {/* Disclaimer */}
      <motion.div
        className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-[11px] text-muted-foreground">
          All data is from paper trading. Behavioral analysis is educational only.
        </p>
      </motion.div>
    </div>
  );
};

export default Profile;
