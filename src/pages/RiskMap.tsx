import { motion } from "framer-motion";

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

// Sector flow data: capital movement
const flows = [
  { from: "Technology", to: "Healthcare", pct: 3, direction: "out" },
  { from: "Cash", to: "Technology", pct: 2, direction: "in" },
  { from: "Consumer", to: "Finance", pct: 1, direction: "neutral" },
];

const BarSection = ({ title, items }: { title: string; items: { label: string; pct: number }[] }) => (
  <div className="mt-5">
    <h3 className="mb-2 text-xs font-medium text-muted-foreground">{title}</h3>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs">
            <span>{item.label}</span>
            <span className="font-medium">{item.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RiskMap = () => (
  <div className="px-5 pt-14 pb-6 lg:pt-8">
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-semibold tracking-tight">Risk Exposure Map</h1>
      <p className="mt-1 text-sm text-muted-foreground">Understand where your portfolio is concentrated</p>
    </motion.div>

    {/* Sector Heatmap */}
    <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <h3 className="mb-3 text-xs font-medium text-muted-foreground">Sector Breakdown</h3>
      <div className="flex h-8 overflow-hidden rounded-lg">
        {sectorData.map((s) => (
          <motion.div
            key={s.label}
            style={{ background: s.color }}
            className="flex items-center justify-center text-[9px] font-medium text-primary-foreground transition-all hover:opacity-80"
            title={`${s.label}: ${s.pct}%`}
            initial={{ width: 0 }}
            animate={{ width: `${s.pct}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
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
    </motion.div>

    {/* Sector Flow */}
    <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h3 className="mb-3 text-xs font-medium text-muted-foreground">Capital Flow</h3>
      <div className="space-y-2">
        {flows.map((f, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 text-xs"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <span className="font-medium">{f.from}</span>
            <div className="flex-1 flex items-center gap-1">
              <div className="h-px flex-1 bg-border" />
              <motion.div
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  f.direction === "out" ? "bg-loss/10 text-loss" : f.direction === "in" ? "bg-gain/10 text-gain" : "bg-secondary text-muted-foreground"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                {f.pct}%
              </motion.div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <span className="font-medium">{f.to}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">Shows estimated capital movement between sectors over the last 30 days.</p>
    </motion.div>

    <div className="grid gap-4 md:grid-cols-3">
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <BarSection title="Asset Type" items={assetTypes} />
      </motion.div>
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <BarSection title="Market Cap" items={marketCap} />
      </motion.div>
      <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <BarSection title="Volatility Class" items={volatility} />
      </motion.div>
    </div>
  </div>
);

export default RiskMap;
