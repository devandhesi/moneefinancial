import { motion } from "framer-motion";

const healthScore = 74;
const factors = [
  { label: "Diversification", score: 45, max: 100 },
  { label: "Volatility Exposure", score: 62, max: 100 },
  { label: "Concentration Risk", score: 38, max: 100 },
  { label: "Holding Consistency", score: 85, max: 100 },
  { label: "Behavior Discipline", score: 78, max: 100 },
];

const getColor = (score: number) => {
  if (score >= 75) return "text-gain";
  if (score >= 50) return "text-muted-foreground";
  return "text-loss";
};

const PortfolioHealthWidget = () => (
  <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-medium text-muted-foreground">Portfolio Health</h3>
      <div className={`text-2xl font-bold ${getColor(healthScore)}`}>{healthScore}</div>
    </div>
    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
      Moderate concentration risk. Diversifying into non-tech assets could improve resilience.
    </p>
    <div className="mt-3 space-y-2">
      {factors.map((f) => (
        <div key={f.label}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">{f.label}</span>
            <span className={`font-medium ${getColor(f.score)}`}>{f.score}</span>
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={`h-full rounded-full ${f.score >= 75 ? "bg-gain" : f.score >= 50 ? "bg-foreground/40" : "bg-loss"}`}
              initial={{ width: 0 }}
              animate={{ width: `${f.score}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default PortfolioHealthWidget;
