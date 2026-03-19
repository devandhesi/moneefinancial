import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, CheckCircle2, Circle, BookOpen, Clock, Trophy, Award,
  Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket,
  type LucideIcon, Play, FileText,
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

  const nextLesson = mod.lessons.findIndex(l => !progress.completedLessons.has(l.id));
  const continueIdx = nextLesson >= 0 ? nextLesson : 0;

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-3xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Back */}
        <motion.div variants={item} className="flex items-center gap-3">
          <button onClick={() => navigate("/learn")} className="rounded-xl p-2 transition-colors hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon size={16} style={{ color: mod.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number}</span>
              {unitPassed && <CheckCircle2 size={12} className="text-gain" />}
            </div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">{mod.title}</h1>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={item} className="glass-card mt-4 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">{mod.description}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full rounded-full"
                style={{ background: mod.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{modLessonsDone}/{mod.lessons.length} lessons</span>
          </div>
        </motion.div>

        {/* Continue CTA */}
        <motion.button
          variants={item}
          onClick={() => navigate(`/learn/${mod.id}/${continueIdx}`)}
          className="mt-3 w-full glass-card p-4 text-left transition-shadow hover:shadow-lg group flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10">
            <Play size={20} className="text-foreground ml-0.5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {modLessonsDone === 0 ? "Start learning" : "Continue learning"}
            </p>
            <p className="text-sm font-semibold mt-0.5">{mod.lessons[continueIdx].title}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Lessons List */}
        <motion.div variants={item} className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <FileText size={14} className="text-muted-foreground" /> Lessons
          </h2>
          <div className="space-y-2">
            {mod.lessons.map((lesson, i) => {
              const done = progress.completedLessons.has(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/learn/${mod.id}/${i}`)}
                  className="glass-card w-full p-4 text-left transition-shadow hover:shadow-md group flex items-center gap-4"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${done ? "bg-gain/10" : "bg-secondary"}`}>
                    {done ? <CheckCircle2 size={16} className="text-gain" /> : <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={10} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                      {lesson.quiz && <span className="text-[10px] text-muted-foreground">· Quiz included</span>}
                    </div>
                  </div>
                  <ChevronRight size={14} className="shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Assessments */}
        <motion.div variants={item} className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Trophy size={14} className="text-muted-foreground" /> Assessments
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => navigate(`/learn/${mod.id}/quiz`)}
              className="glass-card p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                  <Award size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Module Quiz</p>
                  <p className="text-[10px] text-muted-foreground">{mod.moduleQuiz.questions.length} questions · 60% to pass</p>
                  {quizPassed && <p className="text-[9px] font-medium text-gain mt-0.5">Passed ✓</p>}
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate(`/learn/${mod.id}/test`)}
              className="glass-card p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Trophy size={18} className="text-violet-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Unit Test</p>
                  <p className="text-[10px] text-muted-foreground">{mod.unitTest.questions.length} questions · 70% to pass</p>
                  {unitPassed && <p className="text-[9px] font-medium text-gain mt-0.5">Passed ✓</p>}
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Next Module */}
        {modIdx < curriculum.length - 1 && (
          <motion.button
            variants={item}
            onClick={() => navigate(`/learn/${curriculum[modIdx + 1].id}`)}
            className="mt-4 w-full glass-card p-3 text-left text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between"
          >
            <span>Next: Module {curriculum[modIdx + 1].number} — {curriculum[modIdx + 1].title}</span>
            <ChevronRight size={14} />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default LearnModule;
