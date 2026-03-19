import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Trophy, Flame, ChevronRight, CheckCircle2, Brain, Briefcase, Wallet,
  CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket, BarChart3, GraduationCap,
  type LucideIcon, Star, Zap, Target, Award, Clock, Lock, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { curriculum, loadProgress, loadProgressFromDb, type LearningProgress } from "@/data/curriculum";
import { useLearnStreak } from "@/hooks/use-learn";
import { useAuth } from "@/hooks/use-auth";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

const TOOLS = [
  { title: "Chart Lab", desc: "Interactive chart reading", icon: BarChart3, route: "/learn/charts", color: "hsl(215, 60%, 55%)" },
  { title: "Glossary", desc: "Key terms & definitions", icon: BookOpen, route: "/learn/glossary", color: "hsl(30, 70%, 50%)" },
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

  const nextModule = curriculum.find(m => !progress.passedUnitTests.has(m.id));
  const nextLesson = nextModule?.lessons.find(l => !progress.completedLessons.has(l.id));

  const currentXp = streak?.total_xp ?? 0;
  const currentLevel = streak?.level ?? 1;
  const xpProgress = Math.min((currentXp % 500) / 500 * 100, 100);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-4xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">

        {/* ── Hero with streak ────────────────────────────── */}
        <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">The Money Course</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {completedLessons === 0
                ? "8 modules to master personal finance — start anywhere"
                : `${totalProgress}% complete · ${completedLessons} of ${totalLessons} lessons done`}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start">
            {streak && streak.current_streak > 0 && (
              <div className="glass-card flex items-center gap-2 px-3 py-2">
                <Flame size={16} className="text-amber-500" />
                <span className="text-xs font-bold">{streak.current_streak}d</span>
              </div>
            )}
            <div className="glass-card flex items-center gap-2 px-3 py-2">
              <Star size={14} className="text-violet-500" />
              <span className="text-xs font-bold">Lv {currentLevel}</span>
              <span className="text-[10px] text-muted-foreground">{currentXp} XP</span>
            </div>
          </div>
        </motion.div>

        {/* ── XP Progress (compact) ───────────────────────── */}
        <motion.div variants={item} className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground text-right">{currentXp % 500} / 500 XP to Level {currentLevel + 1}</p>
        </motion.div>

        {/* ── Continue Learning (hero CTA) ─────────────────── */}
        {nextModule && nextLesson && (
          <motion.button
            variants={item}
            onClick={() => navigate(`/learn/${nextModule.id}/${nextModule.lessons.indexOf(nextLesson)}`)}
            className="glass-card mt-5 w-full p-5 text-left transition-all hover:shadow-lg group relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: `linear-gradient(135deg, ${nextModule.color}, transparent)` }} />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: `${nextModule.color}15` }}>
                <Zap size={24} style={{ color: nextModule.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {completedLessons === 0 ? "Start here" : "Continue where you left off"}
                </p>
                <p className="text-sm font-semibold mt-1">{nextLesson.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">Module {nextModule.number}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <Clock size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{nextLesson.duration}</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-primary-foreground shrink-0 group-hover:scale-105 transition-transform">
                <ArrowRight size={16} />
              </div>
            </div>
          </motion.button>
        )}

        {/* ── Quick Tools Row ─────────────────────────────── */}
        <motion.div variants={item} className="mt-4 grid grid-cols-2 gap-2">
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.title}
                onClick={() => navigate(t.route)}
                className="glass-card flex items-center gap-3 p-3.5 text-left transition-all hover:shadow-md group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${t.color}12` }}>
                  <Icon size={16} style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* ── Module Roadmap ──────────────────────────────── */}
        <motion.div variants={item} className="mt-8">
          <h2 className="mb-4 text-sm font-bold tracking-tight">Course Roadmap</h2>
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border/40" />

            <div className="space-y-1">
              {curriculum.map((mod, i) => {
                const Icon = iconMap[mod.icon] || BookOpen;
                const modLessonsDone = mod.lessons.filter(l => progress.completedLessons.has(l.id)).length;
                const modTotal = mod.lessons.length;
                const unitPassed = progress.passedUnitTests.has(mod.id);
                const quizPassed = progress.passedModuleQuizzes.has(mod.id);
                const progressPct = modTotal > 0 ? (modLessonsDone / modTotal) * 100 : 0;
                const isActive = nextModule?.id === mod.id;
                const isLocked = i > 0 && !progress.passedUnitTests.has(curriculum[i - 1].id) && modLessonsDone === 0;

                return (
                  <motion.button
                    key={mod.id}
                    onClick={() => navigate(`/learn/${mod.id}`)}
                    variants={item}
                    className={`relative w-full text-left transition-all group ${
                      isActive ? "z-10" : ""
                    }`}
                  >
                    <div className={`flex items-center gap-4 rounded-xl p-3.5 transition-all ${
                      isActive
                        ? "glass-card shadow-md"
                        : "hover:bg-secondary/30"
                    } ${isLocked ? "opacity-50" : ""}`}>
                      {/* Timeline node */}
                      <div className={`relative z-10 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl transition-all ${
                        unitPassed
                          ? "bg-gain/10"
                          : isActive
                            ? "ring-2 ring-foreground/10"
                            : ""
                      }`} style={{ background: unitPassed ? undefined : `${mod.color}12` }}>
                        {unitPassed ? (
                          <CheckCircle2 size={20} className="text-gain" />
                        ) : isLocked ? (
                          <Lock size={16} className="text-muted-foreground/50" />
                        ) : (
                          <Icon size={20} style={{ color: mod.color }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Module {mod.number}
                          </span>
                          {unitPassed && <span className="text-[9px] font-semibold text-gain bg-gain/10 px-1.5 py-0.5 rounded-md">Complete</span>}
                          {quizPassed && !unitPassed && <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">Quiz ✓</span>}
                          {isActive && !unitPassed && !quizPassed && modLessonsDone > 0 && (
                            <span className="text-[9px] font-semibold text-foreground bg-foreground/5 px-1.5 py-0.5 rounded-md">In Progress</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold mt-0.5 leading-tight">{mod.title}</p>
                        {!unitPassed && (
                          <div className="mt-2 flex items-center gap-3">
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%`, background: mod.color }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                              {modLessonsDone}/{modTotal} lessons
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight size={16} className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Stats footer ────────────────────────────────── */}
        <motion.div variants={item} className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: "Lessons", value: `${completedLessons}/${totalLessons}`, icon: BookOpen },
            { label: "Quizzes", value: `${progress.passedModuleQuizzes.size}`, icon: Award },
            { label: "Modules", value: `${modulesCompleted}/8`, icon: Trophy },
          ].map(s => (
            <div key={s.label} className="glass-card p-3 text-center">
              <s.icon size={14} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Learn;
