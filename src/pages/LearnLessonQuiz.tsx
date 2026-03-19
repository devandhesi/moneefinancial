import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, XCircle, ArrowRight, Trophy, RotateCcw, HelpCircle,
  Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket,
  type LucideIcon, Sparkles,
} from "lucide-react";
import { curriculum, loadProgress, saveProgress, loadProgressFromDb, type Quiz, type LearningProgress } from "@/data/curriculum";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateStreak } from "@/hooks/use-learn";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

const LearnLessonQuiz = () => {
  const { courseId, lessonIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateStreak = useUpdateStreak();
  const lessonIdx = parseInt(lessonIndex || "0", 10);

  const mod = curriculum.find(m => m.id === courseId);
  const lesson = mod?.lessons[lessonIdx];
  const quiz = lesson?.quiz;

  const [selected, setSelected] = useState<number | null>(null);
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);

  useEffect(() => {
    if (user) {
      loadProgressFromDb().then(p => { if (p) setProgress(p); });
    }
  }, [user]);

  if (!mod || !lesson || !quiz) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Quiz not found</p>
          <button onClick={() => navigate("/learn")} className="mt-3 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-primary-foreground">Back to Learn</button>
        </div>
      </div>
    );
  }

  const Icon = iconMap[mod.icon] || HelpCircle;
  const answered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;
  const lessonComplete = progress.completedLessons.has(lesson.id);

  const markComplete = () => {
    const updated: LearningProgress = { ...progress, completedLessons: new Set([...progress.completedLessons, lesson.id]) };
    setProgress(updated);
    saveProgress(updated);
    updateStreak.mutate(25);
  };

  const handleContinue = () => {
    if (isCorrect && !lessonComplete) markComplete();
    if (lessonIdx < mod.lessons.length - 1) {
      navigate(`/learn/${mod.id}/${lessonIdx + 1}`);
    } else {
      navigate(`/learn/${mod.id}/quiz`);
    }
  };

  const handleRetry = () => {
    setSelected(null);
  };

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(`/learn/${mod.id}/${lessonIdx}`)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={14} style={{ color: mod.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Module {mod.number} · Lesson {lessonIdx + 1} Quiz
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">Knowledge Check</h1>
        </div>
      </motion.div>

      {/* Quiz Card */}
      <motion.div
        className="mt-8 space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Context */}
        {quiz.context && (
          <div className="rounded-xl bg-secondary/50 p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">{quiz.context}</p>
          </div>
        )}

        {/* Question */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary">
              <HelpCircle size={16} className="text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Based on: {lesson.title}</span>
          </div>
          <p className="text-sm font-semibold leading-relaxed">{quiz.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {quiz.options.map((opt, i) => {
            const isThis = selected === i;
            const showCorrect = answered && i === quiz.correctIndex;
            const showWrong = answered && isThis && !isCorrect;
            return (
              <motion.button
                key={i}
                onClick={() => { if (!answered) setSelected(i); }}
                disabled={answered}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  showCorrect ? "border-gain bg-gain/5 shadow-sm shadow-gain/10" : showWrong ? "border-loss bg-loss/5 shadow-sm shadow-loss/10" : isThis ? "border-foreground/30 bg-secondary/50" : "border-border/50 hover:border-foreground/20 hover:bg-secondary/30"
                } ${answered ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                    showCorrect ? "bg-gain/15 text-gain" : showWrong ? "bg-loss/15 text-loss" : "bg-secondary text-muted-foreground"
                  }`}>
                    {answered && showCorrect ? <CheckCircle2 size={14} /> : answered && showWrong ? <XCircle size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-sm font-medium">{opt.label}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Result */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`rounded-xl p-5 ${isCorrect ? "bg-gain/5 border border-gain/10" : "bg-loss/5 border border-loss/10"}`}>
                <div className="flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 size={16} className="text-gain" /> : <XCircle size={16} className="text-loss" />}
                  <p className={`text-sm font-semibold ${isCorrect ? "text-gain" : "text-loss"}`}>
                    {isCorrect ? "Correct! +25 XP" : "Not quite right"}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{quiz.explanation}</p>
              </div>

              <div className="flex gap-3">
                {!isCorrect && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 rounded-xl glass-card py-3 text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={12} /> Try Again
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  className="flex-1 rounded-xl bg-foreground py-3 text-xs font-medium text-primary-foreground flex items-center justify-center gap-1.5"
                >
                  {lessonIdx < mod.lessons.length - 1 ? "Next Lesson" : "Take Module Quiz"} <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LearnLessonQuiz;
