import { motion } from "framer-motion";

const moods = ["Fearful", "Volatile", "Neutral", "Calm", "Euphoric"] as const;
const currentMoodIdx = 2;
const moodValue = 52;

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

const MarketMoodWidget = () => {
  // Position as percentage along the bar
  const position = moodValue;

  return (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">Market Mood</h3>
        <span className="text-[10px] text-muted-foreground">{moodValue}/100</span>
      </div>

      {/* Current mood label */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: moodColor(currentMoodIdx) }}
        />
        <span className="text-lg font-semibold tracking-tight">{moods[currentMoodIdx]}</span>
      </div>

      {/* Minimal bar gauge */}
      <div className="relative mt-4 mb-1">
        {/* Track */}
        <div className="h-1 w-full rounded-full bg-secondary" />
        {/* Fill */}
        <motion.div
          className="absolute top-0 left-0 h-1 rounded-full"
          style={{ backgroundColor: moodColor(currentMoodIdx) }}
          initial={{ width: 0 }}
          animate={{ width: `${position}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Indicator dot */}
        <motion.div
          className="absolute -top-1 h-3 w-3 rounded-full border-2 border-background shadow-sm"
          style={{ backgroundColor: moodColor(currentMoodIdx) }}
          initial={{ left: 0 }}
          animate={{ left: `${position}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Labels */}
      <div className="mt-2 flex justify-between text-[9px] text-muted-foreground/60">
        <span>Fearful</span>
        <span>Euphoric</span>
      </div>

      {/* Insight */}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Markets are trading sideways with balanced sentiment. Low volatility suggests a consolidation phase — a good time to review positions.
      </p>
    </motion.div>
  );
};

export default MarketMoodWidget;
