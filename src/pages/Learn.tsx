import { motion } from "framer-motion";
import { BookOpen, TrendingUp, Shield, PieChart, Coins, Trophy, Flame, ChevronRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModuleSummary {
  id: string;
  icon: any;
  title: string;
  description: string;
  lessonsTotal: number;
  lessonsCompleted: number;
}

const modules: ModuleSummary[] = [
  { id: "compounding-visualized", icon: Coins, title: "Compounding Visualized", description: "See how $100/month grows over 10, 20, and 30 years.", lessonsTotal: 4, lessonsCompleted: 4 },
  { id: "credit-vs-asset-growth", icon: TrendingUp, title: "Credit vs Asset Growth", description: "Understand the difference between debt systems and wealth systems.", lessonsTotal: 5, lessonsCompleted: 2 },
  { id: "risk-and-volatility", icon: Shield, title: "Risk & Volatility", description: "What risk actually means and how to measure it in your portfolio.", lessonsTotal: 6, lessonsCompleted: 2 },
  { id: "portfolio-construction", icon: PieChart, title: "Portfolio Construction", description: "Build a balanced portfolio using diversification principles.", lessonsTotal: 5, lessonsCompleted: 0 },
  { id: "long-term-vs-short-term", icon: BookOpen, title: "Long Term vs Short Term", description: "Compare time horizons and their impact on returns and taxes.", lessonsTotal: 4, lessonsCompleted: 0 },
];

const Learn = () => {
  const navigate = useNavigate();
  const totalLessons = modules.reduce((sum, m) => sum + m.lessonsTotal, 0);
  const completedLessons = modules.reduce((sum, m) => sum + m.lessonsCompleted, 0);
  const totalProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-1 text-sm text-muted-foreground">Money Course · Build real understanding</p>
      </motion.div>

      {/* Streak & Progress */}
      <motion.div className="glass-card mt-5 flex items-center justify-between p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
          <span className="text-xs text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-medium">{totalProgress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${totalProgress}%` }} transition={{ duration: 1, delay: 0.3 }} />
        </div>
      </motion.div>

      {/* Course Cards */}
      <div className="mt-6 space-y-3">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const isComplete = mod.lessonsCompleted === mod.lessonsTotal;
          const progressPct = (mod.lessonsCompleted / mod.lessonsTotal) * 100;

          return (
            <motion.button
              key={mod.id}
              onClick={() => navigate(`/learn/${mod.id}`)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i + 0.2 }}
              className="glass-card w-full p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{mod.title}</p>
                    {isComplete && (
                      <CheckCircle2 size={14} className="text-gain" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{mod.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{mod.lessonsCompleted}/{mod.lessonsTotal}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="mt-1 text-muted-foreground" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Portfolio Context */}
      <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          💡 Lessons dynamically reference your portfolio. Your data is used for personalized examples throughout each course.
        </p>
      </motion.div>
    </div>
  );
};

export default Learn;
