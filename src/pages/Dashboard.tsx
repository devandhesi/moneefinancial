import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, ArrowUpRight, ArrowDownRight, Plus, Repeat, FlaskConical } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

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

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState("ALL");

  const totalValue = 12438.5;
  const totalGain = 2438.5;
  const totalGainPct = ((totalGain / (totalValue - totalGain)) * 100).toFixed(2);
  const isPositive = totalGain >= 0;

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm text-muted-foreground">Good morning</p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            {balanceVisible ? `$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
          </h1>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="mt-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-gain" : "text-loss"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="font-medium">
            ${Math.abs(totalGain).toLocaleString("en-US", { minimumFractionDigits: 2 })} ({totalGainPct}%)
          </span>
          <span className="text-muted-foreground">all time</span>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        className="glass-card mt-6 p-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152, 28%, 40%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(152, 28%, 40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(220, 8%, 50%)" }}
            />
            <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "12px",
                fontSize: "13px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(152, 28%, 40%)"
              strokeWidth={1.5}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                activeTimeframe === tf
                  ? "bg-foreground text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        className="glass-card mt-4 p-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={14} className="text-muted-foreground" />
          <span>AI Insight</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Your tech sector exposure is 68% of total portfolio. Consider diversifying into
          healthcare or consumer staples to reduce correlation risk during market downturns.
        </p>
      </motion.div>

      {/* Holdings */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Holdings</h2>
        <div className="space-y-2">
          {holdings.map((h) => (
            <div key={h.symbol} className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">{h.symbol}</p>
                <p className="text-xs text-muted-foreground">{h.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {balanceVisible
                    ? `$${h.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : "••••"}
                </p>
                <p className={`text-xs ${h.change >= 0 ? "text-gain" : "text-loss"}`}>
                  {h.change >= 0 ? "+" : ""}
                  {h.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Plus, label: "Deposit" },
            { icon: Repeat, label: "Trade" },
            { icon: FlaskConical, label: "Simulate" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="glass-card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md active:scale-[0.98]"
            >
              <Icon size={18} className="text-muted-foreground" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="mt-6 mb-4 rounded-lg bg-secondary px-4 py-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-[11px] text-muted-foreground">
          📄 Paper Trading Mode · Educational demo only · Not financial advice
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
