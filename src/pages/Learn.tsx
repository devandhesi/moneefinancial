import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Trophy, Flame, ChevronRight, CheckCircle2, Brain, Briefcase, Wallet,
  CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket, BarChart3, GraduationCap,
  type LucideIcon, Star, Zap, Target, BookmarkCheck, Clock, Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { curriculum, loadProgress, loadProgressFromDb, type LearningProgress } from "@/data/curriculum";
import { useLearnStreak } from "@/hooks/use-learn";
import { useAuth } from "@/hooks/use-auth";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

const LEARNING_PATHS = [
  { id: "beginner", label: "Beginner", desc: "Start from zero — money basics", icon: GraduationCap, modules: [0, 1, 2], color: "hsl(152, 28%, 40%)" },
  { id: "investor", label: "Investor", desc: "Stocks, bonds, and portfolio building", icon: TrendingUp, modules: [3, 4, 5], color: "hsl(215, 60%, 55%)" },
  { id: "advanced", label: "Advanced", desc: "Risk, derivatives, and macro", icon: Rocket, modules: [5, 6, 7], color: "hsl(270, 50%, 55%)" },
];

const TOOLS = [
  { title: "Chart Lab", desc: "Learn to read charts with AI", icon: BarChart3, route: "/learn/charts", color: "hsl(215, 60%, 55%)" },
  { title: "Glossary", desc: "Financial terms dictionary", icon: BookOpen, route: "/learn/glossary", color: "hsl(30, 70%, 50%)" },
];

function xpForLevel(level: number) { return level * 500; }

const Learn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: streak } = useLearnStreak();
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);

  useEffect(() => {
    if (user) {
      loadProgressFromDb().then(p => { if (p) setProgress(p); });
    }
  }, [user]);

  const totalLessons = curriculum.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = curriculum.reduce((s, m) => s + m.lessons.filter(l => progress.completedLessons.has(l.id)).length, 0);
  const totalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const modulesCompleted = curriculum.filter(m => progress.passedUnitTests.has(m.id)).length;

  // Find the next uncompleted module
  const nextModule = curriculum.find(m => !progress.passedUnitTests.has(m.id));
  const nextLesson = nextModule?.lessons.find(l => !progress.completedLessons.has(l.id));

  const currentXp = streak?.total_xp ?? 0;
  const currentLevel = streak?.level ?? 1;
  const xpToNext = xpForLevel(currentLevel);
  const xpProgress = Math.min((currentXp % 500) / 500 * 100, 100);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-4xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Hero */}
        <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Learn 🎓</h1>
            <p className="mt-1 text-sm text-muted-foreground">Master investing — built for students, powered by AI</p>
          </div>
          {streak && (
            <div className="glass-card flex items-center gap-3 px-4 py-3 self-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Flame size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold">{streak.current_streak} day streak 🔥</p>
                <p className="text-[10px] text-muted-foreground">Longest: {streak.longest_streak} days</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* XP & Level Bar */}
        <motion.div variants={item} className="glass-card mt-5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <Star size={16} className="text-violet-500" />
              </div>
              <div>
                <p className="text-xs font-bold">Level {currentLevel}</p>
                <p className="text-[10px] text-muted-foreground">{currentXp} XP total</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 size={11} /> {completedLessons}/{totalLessons} lessons</span>
              <span className="flex items-center gap-1"><Trophy size={11} /> {modulesCompleted}/8 modules</span>
              <span className="flex items-center gap-1"><Award size={11} /> {progress.passedModuleQuizzes.size} quizzes</span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">{currentXp % 500} / {500} XP to next level</span>
            <span className="text-[9px] text-muted-foreground">Overall: {totalProgress}%</span>
          </div>
        </motion.div>

        {/* Continue Learning CTA */}
        {nextModule && nextLesson && (
          <motion.button
            variants={item}
            onClick={() => navigate(`/learn/${nextModule.id}/${nextModule.lessons.indexOf(nextLesson)}`)}
            className="glass-card mt-4 w-full p-5 text-left transition-shadow hover:shadow-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10">
                <Zap size={24} className="text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Continue learning</p>
                <p className="text-sm font-semibold mt-0.5">{nextLesson.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Module {nextModule.number}: {nextModule.title} · {nextLesson.duration}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        )}

        {/* Quick Actions */}
        <motion.div variants={item} className="mt-5 grid grid-cols-2 gap-2">
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                onClick={() => navigate(t.route)}
                className="glass-card flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${t.color}15` }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Learning Paths */}
        <motion.div variants={item} className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Target size={14} className="text-muted-foreground" /> Learning Paths
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LEARNING_PATHS.map(path => {
              const Icon = path.icon;
              const pathModules = path.modules.map(i => curriculum[i]).filter(Boolean);
              const pathDone = pathModules.filter(m => progress.passedUnitTests.has(m.id)).length;
              const pathTotal = pathModules.length;
              return (
                <button
                  key={path.id}
                  onClick={() => navigate(`/learn/${pathModules[0]?.id}`)}
                  className="glass-card p-4 text-left transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${path.color}15` }}>
                      <Icon size={16} style={{ color: path.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{path.label}</p>
                      <p className="text-[10px] text-muted-foreground">{pathDone}/{pathTotal} complete</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{path.desc}</p>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${pathTotal > 0 ? (pathDone / pathTotal) * 100 : 0}%`, background: path.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* All Modules */}
        <motion.div variants={item} className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BookOpen size={14} className="text-muted-foreground" /> The Money Course · 8 Modules
          </h2>
          <div className="space-y-2">
            {curriculum.map((mod, i) => {
              const Icon = iconMap[mod.icon] || BookOpen;
              const modLessonsDone = mod.lessons.filter(l => progress.completedLessons.has(l.id)).length;
              const modTotal = mod.lessons.length;
              const unitPassed = progress.passedUnitTests.has(mod.id);
              const quizPassed = progress.passedModuleQuizzes.has(mod.id);
              const progressPct = modTotal > 0 ? (modLessonsDone / modTotal) * 100 : 0;

              return (
                <motion.button
                  key={mod.id}
                  onClick={() => navigate(`/learn/${mod.id}`)}
                  variants={item}
                  className="glass-card w-full p-4 text-left transition-shadow hover:shadow-md group"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: `${mod.color}15` }}>
                      <Icon size={20} style={{ color: mod.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number}</span>
                        {unitPassed && <CheckCircle2 size={12} className="text-gain" />}
                        {quizPassed && <span className="text-[9px] font-medium text-gain">Quiz ✓</span>}
                      </div>
                      <p className="text-sm font-semibold mt-0.5 leading-tight">{mod.title}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: mod.color }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{modLessonsDone}/{modTotal}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={item} className="glass-card mt-5 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            🎓 Each module includes full-page lessons with AI explanations, interactive quizzes, and a comprehensive unit test. 
            Complete all modules to earn your Money Course certificate. Your progress syncs across devices.
          </p>
        </motion.div>
      </motion.variants>
    </div>
  );
};

export default Learn;
