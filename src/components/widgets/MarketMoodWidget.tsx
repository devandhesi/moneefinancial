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
        {/* Invisible track */}
        <div className="h-0.5 w-full rounded-full bg-border/20" />
        {/* Fill */}
        <motion.div
          className="absolute top-0 left-0 h-0.5 rounded-full"
          style={{ backgroundColor: moodColor(moodIdx) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Circular clear node */}
        <motion.div
          className="absolute -top-[7px] h-4 w-4 rounded-full border border-border/40 bg-background shadow-sm backdrop-blur-sm"
          initial={{ left: 0 }}
          animate={{ left: `calc(${score}% - 8px)` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div
            className="absolute inset-[3px] rounded-full"
            style={{ backgroundColor: moodColor(moodIdx), opacity: 0.5 }}
          />
        </motion.div>
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
