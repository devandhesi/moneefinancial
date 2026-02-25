import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, BookOpen, Clock, HelpCircle, Trophy, Award, RotateCcw, Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket, type LucideIcon } from "lucide-react";
import { curriculum, loadProgress, saveProgress, type Quiz, type Module, type LearningProgress } from "@/data/curriculum";
import ReactMarkdown from "react-markdown";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

/* ─── Quiz Component ────────────────────────────────────────── */
const QuizQuestion = ({ quiz, index, total, onAnswer }: { quiz: Quiz; index: number; total: number; onAnswer: (correct: boolean) => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">Question {index + 1} of {total}</span>
      </div>
      {quiz.context && (
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{quiz.context}</p>
        </div>
      )}
      <p className="text-sm font-medium leading-relaxed">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isThis = selected === i;
          const showCorrect = answered && i === quiz.correctIndex;
          const showWrong = answered && isThis && !isCorrect;
          return (
            <button
              key={i}
              onClick={() => { if (!answered) setSelected(i); }}
              disabled={answered}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                showCorrect ? "border-gain bg-gain/5" : showWrong ? "border-loss bg-loss/5" : isThis ? "border-foreground/30 bg-secondary/50" : "border-border/50 hover:border-foreground/20 hover:bg-secondary/30"
              } ${answered ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                  showCorrect ? "bg-gain/15 text-gain" : showWrong ? "bg-loss/15 text-loss" : "bg-secondary text-muted-foreground"
                }`}>{String.fromCharCode(65 + i)}</span>
                <p className="text-xs font-medium">{opt.label}</p>
              </div>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
            <div className={`rounded-xl p-3 ${isCorrect ? "bg-gain/5 border border-gain/10" : "bg-loss/5 border border-loss/10"}`}>
              <p className={`text-xs font-semibold ${isCorrect ? "text-gain" : "text-loss"}`}>{isCorrect ? "✓ Correct!" : "✗ Not quite"}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{quiz.explanation}</p>
            </div>
            <button onClick={() => onAnswer(isCorrect)} className="mt-3 w-full rounded-xl bg-foreground py-2.5 text-xs font-medium text-primary-foreground">
              Continue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Multi-Question Quiz/Test Component ────────────────────── */
const QuizPanel = ({ title, questions, onComplete, passingScore = 60 }: {
  title: string; questions: Quiz[]; onComplete: (score: number, passed: boolean) => void; passingScore?: number;
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (correct: boolean) => {
    const newCorrect = correctCount + (correct ? 1 : 0);
    if (correct) setCorrectCount(newCorrect);
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      const score = Math.round((newCorrect / questions.length) * 100);
      onComplete(score, score >= passingScore);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= passingScore;

  if (finished) {
    return (
      <motion.div className="text-center py-8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${passed ? "bg-gain/10" : "bg-loss/10"}`}>
          {passed ? <Trophy size={28} className="text-gain" /> : <RotateCcw size={28} className="text-loss" />}
        </div>
        <h3 className="mt-4 text-lg font-semibold">{passed ? "Passed!" : "Not quite"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You scored {correctCount}/{questions.length} ({score}%)
          {!passed && ` — need ${passingScore}% to pass`}
        </p>
        {!passed && (
          <button onClick={() => { setCurrentQ(0); setCorrectCount(0); setFinished(false); }} className="mt-4 rounded-xl bg-foreground px-6 py-2.5 text-xs font-medium text-primary-foreground">
            Retry
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <div className="flex gap-1 mb-4">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < currentQ ? "bg-foreground" : i === currentQ ? "bg-foreground/50" : "bg-secondary"}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <QuizQuestion quiz={questions[currentQ]} index={currentQ} total={questions.length} onAnswer={handleAnswer} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─── View modes ────────────────────────────────────────────── */
type ViewMode = "lessons" | "module-quiz" | "unit-test";

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const LearnCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const mod = curriculum.find(m => m.id === courseId);
  const [activeLesson, setActiveLesson] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("lessons");
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);

  const updateProgress = useCallback((updater: (p: LearningProgress) => LearningProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

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
  const lesson = mod.lessons[activeLesson];
  const lessonComplete = progress.completedLessons.has(lesson?.id);
  const modIdx = curriculum.findIndex(m => m.id === mod.id);

  const markLessonComplete = () => {
    updateProgress(p => ({ ...p, completedLessons: new Set([...p.completedLessons, lesson.id]) }));
  };

  const goNextLesson = () => {
    markLessonComplete();
    if (activeLesson < mod.lessons.length - 1) {
      setActiveLesson(activeLesson + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setViewMode("module-quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleModuleQuizComplete = (score: number, passed: boolean) => {
    updateProgress(p => {
      const next = { ...p, quizScores: { ...p.quizScores, [`${mod.id}-quiz`]: score } };
      if (passed) next.passedModuleQuizzes = new Set([...p.passedModuleQuizzes, mod.id]);
      return next;
    });
  };

  const handleUnitTestComplete = (score: number, passed: boolean) => {
    updateProgress(p => {
      const next = { ...p, quizScores: { ...p.quizScores, [`${mod.id}-unit`]: score } };
      if (passed) next.passedUnitTests = new Set([...p.passedUnitTests, mod.id]);
      return next;
    });
  };

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => viewMode !== "lessons" ? setViewMode("lessons") : navigate("/learn")} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={16} style={{ color: mod.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number}</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight leading-tight">{mod.title}</h1>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${(mod.lessons.filter(l => progress.completedLessons.has(l.id)).length / mod.lessons.length) * 100}%` }} transition={{ duration: 0.8 }} />
      </div>

      {/* Navigation tabs */}
      <div className="mt-4 flex gap-2">
        {(["lessons", "module-quiz", "unit-test"] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`rounded-xl px-3 py-2 text-[11px] font-medium transition-all ${
              viewMode === mode ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {mode === "lessons" ? `Lessons (${mod.lessons.length})` :
             mode === "module-quiz" ? `Quiz (5Q)${progress.passedModuleQuizzes.has(mod.id) ? " ✓" : ""}` :
             `Unit Test (10Q)${progress.passedUnitTests.has(mod.id) ? " ✓" : ""}`}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── LESSONS VIEW ──────────────────────────────── */}
        {viewMode === "lessons" && (
          <motion.div key="lessons" className="mt-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Lesson selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {mod.lessons.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => { setActiveLesson(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-all ${
                    i === activeLesson ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"
                  }`}
                >
                  {progress.completedLessons.has(l.id) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  {l.title.length > 25 ? l.title.slice(0, 25) + "…" : l.title}
                </button>
              ))}
            </div>

            {/* Lesson Header */}
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BookOpen size={14} />
              <span className="text-[11px] font-medium">Lesson {activeLesson + 1} of {mod.lessons.length}</span>
              <span className="text-[11px]">·</span>
              <Clock size={12} />
              <span className="text-[11px]">{lesson.duration}</span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight mb-6">{lesson.title}</h2>

            {/* Full-page lesson content */}
            <div className="space-y-8">
              {lesson.sections.map((section, si) => (
                <motion.div
                  key={si}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.1 }}
                >
                  <h3 className="text-base font-semibold mb-3">{section.heading}</h3>
                  <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
                    <ReactMarkdown>{section.body}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Inline lesson quiz */}
            {lesson.quiz && (
              <div className="mt-8 glass-card p-5">
                <div className="flex items-center gap-2 text-sm font-medium mb-4">
                  <HelpCircle size={15} className="text-muted-foreground" />
                  <span>Knowledge Check</span>
                </div>
                <QuizQuestion
                  quiz={lesson.quiz}
                  index={0}
                  total={1}
                  onAnswer={(correct) => { if (correct) markLessonComplete(); }}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => { if (activeLesson > 0) { setActiveLesson(activeLesson - 1); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
                disabled={activeLesson === 0}
                className="rounded-xl glass-card px-4 py-2.5 text-xs font-medium disabled:opacity-30"
              >
                ← Previous
              </button>
              <button
                onClick={goNextLesson}
                className="rounded-xl bg-foreground px-6 py-2.5 text-xs font-medium text-primary-foreground transition-transform active:scale-[0.98]"
              >
                {activeLesson === mod.lessons.length - 1 ? "Take Module Quiz →" : "Next Lesson →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── MODULE QUIZ VIEW ──────────────────────────── */}
        {viewMode === "module-quiz" && (
          <motion.div key="quiz" className="mt-6 glass-card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} style={{ color: mod.color }} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number} Quiz</span>
            </div>
            <QuizPanel
              title={mod.moduleQuiz.title}
              questions={mod.moduleQuiz.questions}
              onComplete={handleModuleQuizComplete}
              passingScore={60}
            />
            {progress.passedModuleQuizzes.has(mod.id) && (
              <div className="mt-4 text-center">
                <button onClick={() => setViewMode("unit-test")} className="rounded-xl bg-foreground px-6 py-2.5 text-xs font-medium text-primary-foreground">
                  Take Unit Test →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── UNIT TEST VIEW ────────────────────────────── */}
        {viewMode === "unit-test" && (
          <motion.div key="unit" className="mt-6 glass-card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} style={{ color: mod.color }} />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number} Unit Test</span>
            </div>
            <QuizPanel
              title={mod.unitTest.title}
              questions={mod.unitTest.questions}
              onComplete={handleUnitTestComplete}
              passingScore={70}
            />
            {progress.passedUnitTests.has(mod.id) && modIdx < curriculum.length - 1 && (
              <div className="mt-4 text-center">
                <button onClick={() => navigate(`/learn/${curriculum[modIdx + 1].id}`)} className="rounded-xl bg-foreground px-6 py-2.5 text-xs font-medium text-primary-foreground">
                  Next Module →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearnCourse;
