import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { MoodData } from "@/hooks/use-daily-digest";

const moodColor = (idx: number) => {
  const colors = [
    "hsl(var(--loss))",
    "hsl(30, 70%, 50%)",
    "hsl(var(--muted-foreground))",
    "hsl(var(--gain))",
    "hsl(280, 40%, 55%)",
  ];
  return colors[idx] || colors[2];
};

interface Props {
  data?: MoodData;
  isLoading?: boolean;
}

const MarketMoodWidget = ({ data, isLoading }: Props) => {
  const score = data?.score ?? 50;
  const moodIdx = data?.moodIdx ?? 2;
  const mood = data?.mood ?? "Neutral";
  const insight = data?.insight ?? "";

  return (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">Market Mood</h3>
        {isLoading ? (
          <Loader2 size={12} className="animate-spin text-muted-foreground" />
        ) : (
          <span className="text-[10px] text-muted-foreground">{score}/100</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: moodColor(moodIdx) }}
        />
        <span className="text-lg font-semibold tracking-tight">{mood}</span>
      </div>

      <div className="relative mt-4 mb-1">
        <div className="h-1 w-full rounded-full bg-secondary" />
        <motion.div
          className="absolute top-0 left-0 h-1 rounded-full"
          style={{ backgroundColor: moodColor(moodIdx) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute -top-1 h-3 w-3 rounded-full border-2 border-background shadow-sm"
          style={{ backgroundColor: moodColor(moodIdx) }}
          initial={{ left: 0 }}
          animate={{ left: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[9px] text-muted-foreground/60">
        <span>Fearful</span>
        <span>Euphoric</span>
      </div>

      {insight && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {insight}
        </p>
      )}
    </motion.div>
  );
};

export default MarketMoodWidget;
