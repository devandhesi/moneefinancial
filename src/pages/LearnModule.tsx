import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, CheckCircle2, BookOpen, Clock, Trophy, Award,
  Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket,
  type LucideIcon, Play, Lock, ArrowRight, CircleDot,
} from "lucide-react";
import { curriculum, loadProgress, loadProgressFromDb, type LearningProgress } from "@/data/curriculum";
import { useAuth } from "@/hooks/use-auth";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

const LearnModule = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mod = curriculum.find(m => m.id === courseId);
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);

  useEffect(() => {
    if (user) {
      loadProgressFromDb().then(p => { if (p) setProgress(p); });
    }
  }, [user]);

  if (!mod) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Module not found</p>
          <button onClick={() => navigate("/learn")} className="mt-3 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-primary-foreground">Back to Learn</button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[mod.icon] || BookOpen;
  const modIdx = curriculum.findIndex(m => m.id === mod.id);
  const modLessonsDone = mod.lessons.filter(l => progress.completedLessons.has(l.id)).length;
  const progressPct = mod.lessons.length > 0 ? (modLessonsDone / mod.lessons.length) * 100 : 0;
  const unitPassed = progress.passedUnitTests.has(mod.id);
  const quizPassed = progress.passedModuleQuizzes.has(mod.id);
  const allLessonsDone = modLessonsDone === mod.lessons.length;

  const nextLesson = mod.lessons.findIndex(l => !progress.completedLessons.has(l.id));
  const continueIdx = nextLesson >= 0 ? nextLesson : 0;

  const totalDuration = mod.lessons.reduce((sum, l) => {
    const mins = parseInt(l.duration) || 0;
    return sum + mins;
  }, 0);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-3xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Back + header */}
        <motion.div variants={item} className="flex items-center gap-3">
          <button onClick={() => navigate("/learn")} className="rounded-xl p-2 transition-colors hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon size={16} style={{ color: mod.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number}</span>
              {unitPassed && <span className="text-[9px] font-semibold text-gain bg-gain/10 px-1.5 py-0.5 rounded-md">Complete</span>}
            </div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">{mod.title}</h1>
          </div>
        </motion.div>

        {/* Module info card */}
        <motion.div variants={item} className="glass-card mt-4 p-5">
          <p className="text-xs leading-relaxed text-muted-foreground">{mod.description}</p>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen size={11} /> {mod.lessons.length} lessons</span>
            <span className="flex items-center gap-1"><Clock size={11} /> ~{totalDuration} min</span>
            <span className="flex items-center gap-1"><Award size={11} /> 2 assessments</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{ background: mod.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: mod.color }}>{Math.round(progressPct)}%</span>
          </div>
        </motion.div>

        {/* Continue CTA */}
        {!unitPassed && (
          <motion.button
            variants={item}
            onClick={() => navigate(`/learn/${mod.id}/${continueIdx}`)}
            className="mt-3 w-full rounded-xl bg-foreground p-4 text-left text-primary-foreground transition-all hover:opacity-90 group flex items-center gap-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Play size={18} className="ml-0.5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                {modLessonsDone === 0 ? "Start module" : "Continue"}
              </p>
              <p className="text-sm font-semibold mt-0.5">{mod.lessons[continueIdx].title}</p>
            </div>
            <ArrowRight size={16} className="opacity-60 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}

        {/* ── Lesson roadmap ────────────────────────────── */}
        <motion.div variants={item} className="mt-8">
          <h2 className="mb-4 text-sm font-bold">Lessons</h2>
          <div className="relative">
            {/* Timeline connector */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border/30" />

            <div className="space-y-0.5">
              {mod.lessons.map((lesson, i) => {
                const done = progress.completedLessons.has(lesson.id);
                const isCurrent = i === continueIdx && !unitPassed;
                const isLocked = false; // all lessons accessible

                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigate(`/learn/${mod.id}/${i}`)}
                    className={`relative w-full text-left group transition-all ${
                      isCurrent ? "" : ""
                    }`}
                  >
                    <div className={`flex items-center gap-4 rounded-xl p-3 transition-all ${
                      isCurrent ? "glass-card shadow-sm" : "hover:bg-secondary/30"
                    }`}>
                      {/* Node */}
                      <div className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl transition-all ${
                        done
                          ? "bg-gain/10"
                          : isCurrent
                            ? "bg-foreground text-primary-foreground"
                            : "bg-secondary"
                      }`}>
                        {done ? (
                          <CheckCircle2 size={16} className="text-gain" />
                        ) : isCurrent ? (
                          <CircleDot size={16} />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight ${done ? "text-muted-foreground" : ""}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={10} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                          {lesson.quiz && (
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">+ quiz</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight size={14} className="shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Assessments ─────────────────────────────── */}
        <motion.div variants={item} className="mt-8">
          <h2 className="mb-4 text-sm font-bold">Assessments</h2>
          <div className="space-y-2">
            {/* Module Quiz */}
            <button
              onClick={() => navigate(`/learn/${mod.id}/quiz`)}
              className={`glass-card w-full p-4 text-left transition-all hover:shadow-md flex items-center gap-4 ${
                !allLessonsDone && !quizPassed ? "opacity-60" : ""
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                quizPassed ? "bg-gain/10" : "bg-amber-500/10"
              }`}>
                {quizPassed ? <CheckCircle2 size={18} className="text-gain" /> : <Award size={18} className="text-amber-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Module Quiz</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {mod.moduleQuiz.questions.length} questions · 60% to pass · +50 XP
                </p>
              </div>
              {quizPassed ? (
                <span className="text-[10px] font-semibold text-gain">Passed ✓</span>
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </button>

            {/* Unit Test */}
            <button
              onClick={() => navigate(`/learn/${mod.id}/test`)}
              className={`glass-card w-full p-4 text-left transition-all hover:shadow-md flex items-center gap-4 ${
                !quizPassed && !unitPassed ? "opacity-60" : ""
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                unitPassed ? "bg-gain/10" : "bg-violet-500/10"
              }`}>
                {unitPassed ? <CheckCircle2 size={18} className="text-gain" /> : <Trophy size={18} className="text-violet-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Unit Test</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {mod.unitTest.questions.length} questions · 70% to pass · +50 XP
                </p>
              </div>
              {unitPassed ? (
                <span className="text-[10px] font-semibold text-gain">Passed ✓</span>
              ) : !quizPassed ? (
                <Lock size={14} className="text-muted-foreground/40" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Next Module ─────────────────────────────── */}
        {modIdx < curriculum.length - 1 && (
          <motion.button
            variants={item}
            onClick={() => navigate(`/learn/${curriculum[modIdx + 1].id}`)}
            className="mt-6 w-full glass-card p-4 text-left transition-all hover:shadow-md group flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              {(() => { const NextIcon = iconMap[curriculum[modIdx + 1].icon] || BookOpen; return <NextIcon size={16} className="text-muted-foreground" />; })()}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Up next</p>
              <p className="text-sm font-semibold mt-0.5">Module {curriculum[modIdx + 1].number}: {curriculum[modIdx + 1].title}</p>
            </div>
            <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default LearnModule;
