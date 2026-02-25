import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Shield, PieChart, Coins, Trophy, Flame } from "lucide-react";

const modules = [
  {
    icon: Coins,
    title: "Compounding Visualized",
    description: "See how $100/month grows over 10, 20, and 30 years.",
    progress: 100,
    lessons: 4,
  },
  {
    icon: TrendingUp,
    title: "Credit vs Asset Growth",
    description: "Understand the difference between debt systems and wealth systems.",
    progress: 60,
    lessons: 5,
  },
  {
    icon: Shield,
    title: "Risk & Volatility",
    description: "What risk actually means and how to measure it in your portfolio.",
    progress: 30,
    lessons: 6,
  },
  {
    icon: PieChart,
    title: "Portfolio Construction",
    description: "Build a balanced portfolio using diversification principles.",
    progress: 0,
    lessons: 5,
  },
  {
    icon: BookOpen,
    title: "Long Term vs Short Term",
    description: "Compare time horizons and their impact on returns and taxes.",
    progress: 0,
    lessons: 4,
  },
];

const Learn = () => {
  const totalProgress = Math.round(
    modules.reduce((sum, m) => sum + m.progress, 0) / modules.length
  );

  return (
    <div className="px-5 pt-14 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Money Course · Build real understanding
        </p>
      </motion.div>

      {/* Streak & Progress */}
      <motion.div
        className="glass-card mt-5 flex items-center justify-between p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Flame size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">7 day streak</p>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Trophy size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium">3 badges</span>
          </div>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-medium">{totalProgress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Modules */}
      <div className="mt-6 space-y-3">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const isComplete = mod.progress === 100;
          return (
            <motion.button
              key={mod.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i + 0.2 }}
              className="glass-card w-full p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{mod.title}</p>
                    {isComplete && (
                      <span className="rounded-md bg-gain-subtle px-1.5 py-0.5 text-[10px] font-medium text-gain">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{mod.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-foreground transition-all"
                        style={{ width: `${mod.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {mod.lessons} lessons
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Portfolio Context Note */}
      <motion.div
        className="glass-card mt-5 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          💡 Lessons dynamically reference your portfolio. Example:{" "}
          <span className="italic">
            "In your TFSA, 78% is single-stock exposure. Let's simulate diversification impact."
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Learn;
