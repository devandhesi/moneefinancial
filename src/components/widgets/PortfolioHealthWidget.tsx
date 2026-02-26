import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { HealthData } from "@/hooks/use-daily-digest";

const getColor = (score: number) => {
  if (score >= 75) return "text-gain";
  if (score >= 50) return "text-muted-foreground";
  return "text-loss";
};

const getBarColor = (score: number) => {
  if (score >= 75) return "bg-gain";
  if (score >= 50) return "bg-foreground/40";
  return "bg-loss";
};

interface Props {
  data?: HealthData;
  isLoading?: boolean;
}

const PortfolioHealthWidget = ({ data, isLoading }: Props) => {
  const score = data?.score ?? 50;
  const factors = data?.factors ?? [];
  const insight = data?.insight ?? "";

  return (
    <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">Portfolio Health</h3>
        {isLoading ? (
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
        ) : (
          <div className={`text-2xl font-bold ${getColor(score)}`}>{score}</div>
        )}
      </div>
      {insight && (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{insight}</p>
      )}
      <div className="mt-3 space-y-2">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">{f.label}</span>
              <span className={`font-medium ${getColor(f.score)}`}>{f.score}</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={`h-full rounded-full ${getBarColor(f.score)}`}
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
};

export default PortfolioHealthWidget;
