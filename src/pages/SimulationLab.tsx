import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const sims = [
  { id: "dca", icon: DollarSign, label: "DCA Simulator", desc: "Dollar cost averaging over time" },
  { id: "lump", icon: TrendingDown, label: "Lump Sum", desc: "Compare one-time vs periodic investment" },
  { id: "crash", icon: TrendingDown, label: "Crash Simulation", desc: "How would your portfolio handle a 30% drop?" },
  { id: "alloc", icon: PieChart, label: "Allocation Preview", desc: "See the impact of rebalancing" },
];

const generateDCAData = () => {
  const data = [];
  let invested = 0;
  let value = 0;
  for (let i = 0; i <= 24; i++) {
    invested += 500;
    value = invested * (1 + Math.random() * 0.03 - 0.005) + (value - invested + 500) * (1 + Math.random() * 0.02);
    data.push({ month: `M${i}`, invested, value: +value.toFixed(0) });
  }
  return data;
};

const SimulationLab = () => {
  const [activeSim, setActiveSim] = useState("dca");
  const [dcaData] = useState(generateDCAData);

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Simulation Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">Run what-if scenarios with your portfolio</p>
      </motion.div>

      <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
        {sims.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSim(s.id)} className={`glass-card flex flex-col items-center gap-2 p-4 text-center transition-all ${activeSim === s.id ? "ring-1 ring-foreground/20" : ""}`}>
              <Icon size={18} className="text-muted-foreground" />
              <span className="text-xs font-medium">{s.label}</span>
            </button>
          );
        })}
      </div>

      {activeSim === "dca" && (
        <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-medium">DCA: $500/month for 24 months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dcaData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,89%)" strokeOpacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(220,8%,50%)" }} interval={3} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "12px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="invested" stroke="hsl(220,8%,60%)" strokeWidth={1} fill="none" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="value" stroke="hsl(152,28%,40%)" strokeWidth={1.5} fill="hsl(152,28%,40%)" fillOpacity={0.08} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-muted-foreground" /> Invested</span>
            <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-gain" /> Portfolio Value</span>
          </div>
        </motion.div>
      )}

      {activeSim === "crash" && (
        <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-sm font-medium">Crash Simulation: -30% Market Drop</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Current Value</span><span className="text-sm font-semibold">$12,438.50</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">After -30%</span><span className="text-sm font-semibold text-loss">$8,706.95</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Loss</span><span className="text-sm font-semibold text-loss">-$3,731.55</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Recovery time (est.)</span><span className="text-sm font-semibold">14–18 months</span></div>
          </div>
        </motion.div>
      )}

      {(activeSim === "lump" || activeSim === "alloc") && (
        <motion.div className="glass-card mt-5 p-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <FlaskConical size={24} className="mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Coming soon — Connect backend for full simulation engine</p>
        </motion.div>
      )}
    </div>
  );
};

export default SimulationLab;