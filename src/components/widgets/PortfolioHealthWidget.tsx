import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, Minus, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
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

const getGrade = (score: number) => {
  if (score >= 90) return { label: "Excellent", icon: ShieldCheck, color: "text-gain" };
  if (score >= 75) return { label: "Good", icon: ShieldCheck, color: "text-gain" };
  if (score >= 60) return { label: "Fair", icon: Shield, color: "text-muted-foreground" };
  if (score >= 40) return { label: "Needs Work", icon: ShieldAlert, color: "text-amber-500" };
  return { label: "At Risk", icon: ShieldAlert, color: "text-loss" };
};

const getFactorStatus = (score: number) => {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Weak";
  return "Critical";
};

const getFactorIcon = (score: number) => {
  if (score >= 60) return TrendingUp;
  if (score >= 40) return Minus;
  return TrendingDown;
};

// SVG radial progress ring
const ScoreRing = ({ score, size = 72, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const grade = getGrade(score);

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-secondary"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={score >= 75 ? "stroke-gain" : score >= 50 ? "stroke-foreground/40" : "stroke-loss"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold leading-none ${getColor(score)}`}>{score}</span>
        <span className="text-[8px] text-muted-foreground/70 mt-0.5">/ 100</span>
      </div>
      <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-medium ${grade.color}`}>
        <grade.icon size={10} />
        {grade.label}
      </div>
    </div>
  );
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
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h3 className="text-xs font-medium text-muted-foreground">Portfolio Health</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Score ring + insight */}
          <div className="mt-3 flex items-start gap-4">
            <ScoreRing score={score} />
            {insight && (
              <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground pt-1">{insight}</p>
            )}
          </div>

          {/* Factor breakdown */}
          <div className="mt-4 space-y-2.5">
            {factors.map((f) => {
              const FactorIcon = getFactorIcon(f.score);
              const status = getFactorStatus(f.score);
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <FactorIcon size={10} className={getColor(f.score)} />
                      <span className="text-muted-foreground">{f.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/60 ${getColor(f.score)}`}>
                        {status}
                      </span>
                      <span className={`font-semibold tabular-nums ${getColor(f.score)}`}>{f.score}</span>
                    </div>
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
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PortfolioHealthWidget;
