import { motion } from "framer-motion";
import { BookOpen, Trophy, Flame, ChevronRight, CheckCircle2, Lock, Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket, type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { curriculum, loadProgress } from "@/data/curriculum";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

const Learn = () => {
  const navigate = useNavigate();
  const [progress] = useState(loadProgress);

  const totalLessons = curriculum.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = curriculum.reduce((s, m) => s + m.lessons.filter(l => progress.completedLessons.has(l.id)).length, 0);
  const totalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const modulesCompleted = curriculum.filter(m => progress.passedUnitTests.has(m.id)).length;

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">The Money Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">8 modules · {totalLessons} lessons · Build real financial understanding</p>
      </motion.div>

      {/* Stats bar */}
      <motion.div className="glass-card mt-5 flex items-center justify-between p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Flame size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">{completedLessons} lessons done</p>
            <p className="text-xs text-muted-foreground">{modulesCompleted}/8 modules complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Trophy size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium">{progress.passedModuleQuizzes.size} quizzes</span>
          </div>
          <span className="text-xs text-muted-foreground">{totalProgress}%</span>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-medium">{totalProgress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${totalProgress}%` }} transition={{ duration: 1, delay: 0.3 }} />
        </div>
      </motion.div>

      {/* Module Cards */}
      <div className="mt-6 space-y-3">
        {curriculum.map((mod, i) => {
          const Icon = iconMap[mod.icon] || BookOpen;
          const modLessonsDone = mod.lessons.filter(l => progress.completedLessons.has(l.id)).length;
          const modTotal = mod.lessons.length;
          const quizPassed = progress.passedModuleQuizzes.has(mod.id);
          const unitPassed = progress.passedUnitTests.has(mod.id);
          const progressPct = modTotal > 0 ? (modLessonsDone / modTotal) * 100 : 0;

          return (
            <motion.button
              key={mod.id}
              onClick={() => navigate(`/learn/${mod.id}`)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i + 0.2 }}
              className="glass-card w-full p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${mod.color}15` }}>
                  <Icon size={20} style={{ color: mod.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number}</span>
                    {unitPassed && <CheckCircle2 size={12} className="text-gain" />}
                  </div>
                  <p className="text-sm font-semibold mt-0.5 leading-tight">{mod.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{mod.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{modLessonsDone}/{modTotal}</span>
                    {quizPassed && <span className="text-[9px] font-medium text-gain">Quiz ✓</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="mt-2 shrink-0 text-muted-foreground" />
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          💡 Each module includes full-page lessons, a 5-question knowledge check, and a 10-question unit test. Complete all modules to earn your Money Course certificate.
        </p>
      </motion.div>
    </div>
  );
};

export default Learn;
