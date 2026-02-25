import { motion } from "framer-motion";

const moods = ["Fearful", "Volatile", "Neutral", "Calm", "Euphoric"] as const;
const currentMoodIdx = 2; // Neutral
const moodValue = 52; // 0-100

const MarketMoodWidget = () => {
  const needleRotation = (moodValue / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <h3 className="text-xs font-medium text-muted-foreground">Market Mood</h3>

      {/* Gauge */}
      <div className="relative mx-auto mt-3 h-16 w-32">
        <svg viewBox="0 0 120 70" className="h-full w-full">
          {/* Arc background */}
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="hsl(40, 15%, 89%)" strokeWidth="6" strokeLinecap="round" />
          {/* Colored sections */}
          <path d="M 10 60 A 50 50 0 0 1 30 20" fill="none" stroke="hsl(0, 32%, 52%)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.4" />
          <path d="M 30 20 A 50 50 0 0 1 50 12" fill="none" stroke="hsl(30, 70%, 50%)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.4" />
          <path d="M 50 12 A 50 50 0 0 1 70 12" fill="none" stroke="hsl(220, 8%, 50%)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.4" />
          <path d="M 70 12 A 50 50 0 0 1 90 20" fill="none" stroke="hsl(152, 28%, 40%)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.4" />
          <path d="M 90 20 A 50 50 0 0 1 110 60" fill="none" stroke="hsl(280, 40%, 55%)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.4" />
          {/* Needle */}
          <motion.line
            x1="60" y1="60" x2="60" y2="18"
            stroke="hsl(228, 15%, 15%)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: "60px 60px" }}
            initial={{ rotate: -90 }}
            animate={{ rotate: needleRotation }}
            transition={{ duration: 1.2, type: "spring", damping: 15 }}
          />
          <circle cx="60" cy="60" r="3" fill="hsl(228, 15%, 15%)" />
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2">
        <span className="text-sm font-semibold">{moods[currentMoodIdx]}</span>
        <span className="text-xs text-muted-foreground">{moodValue}/100</span>
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
        {moods.map((m) => (
          <span key={m} className={m === moods[currentMoodIdx] ? "font-semibold text-foreground" : ""}>{m}</span>
        ))}
      </div>
    </motion.div>
  );
};

export default MarketMoodWidget;
