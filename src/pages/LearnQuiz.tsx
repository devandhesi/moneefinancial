import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Trophy, Award, RotateCcw, CheckCircle2, XCircle, ChevronRight, Clock,
  Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket,
  type LucideIcon, BarChart3,
} from "lucide-react";
import { curriculum, loadProgress, saveProgress, loadProgressFromDb, type Quiz, type LearningProgress } from "@/data/curriculum";
import { useAuth } from "@/hooks/use-auth";
import { useSaveQuizAttempt, useQuizAttempts, useUpdateStreak } from "@/hooks/use-learn";
import { format } from "date-fns";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

/* ── Quiz Question ─────────────────────────────────────────── */
const QuizQuestion = ({ quiz, index, total, onAnswer }: { quiz: Quiz; index: number; total: number; onAnswer: (correct: boolean, selectedIdx: number) => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">Question {index + 1} of {total}</span>
        <span className="tabular-nums">{Math.round(((index + 1) / total) * 100)}%</span>
      </div>
      {quiz.context && (
        <div className="rounded-xl bg-secondary/50 p-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{quiz.context}</p>
        </div>
      )}
      <p className="text-sm font-semibold leading-relaxed">{quiz.question}</p>
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
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                showCorrect ? "border-gain bg-gain/5" : showWrong ? "border-loss bg-loss/5" : isThis ? "border-foreground/30 bg-secondary/50" : "border-border/50 hover:border-foreground/20 hover:bg-secondary/30"
              } ${answered ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
            <div className={`rounded-xl p-4 ${isCorrect ? "bg-gain/5 border border-gain/10" : "bg-loss/5 border border-loss/10"}`}>
              <p className={`text-xs font-semibold ${isCorrect ? "text-gain" : "text-loss"}`}>{isCorrect ? "✓ Correct!" : "✗ Incorrect"}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{quiz.explanation}</p>
            </div>
            <button onClick={() => onAnswer(isCorrect, selected!)} className="mt-3 w-full rounded-xl bg-foreground py-3 text-xs font-medium text-primary-foreground">
              Continue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const LearnQuiz = () => {
  const { courseId, quizType } = useParams(); // quizType: 'quiz' or 'test'
  const navigate = useNavigate();
  const { user } = useAuth();
  const saveAttempt = useSaveQuizAttempt();
  const updateStreak = useUpdateStreak();

  const mod = curriculum.find(m => m.id === courseId);
  const isUnitTest = quizType === "test";
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);
  const [currentQ, setCurrentQ] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; selected: number; correct: number; isCorrect: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());

  const quizId = `${courseId}-${quizType}`;
  const { data: pastAttempts } = useQuizAttempts(quizId);

  useEffect(() => {
    if (user) {
      loadProgressFromDb().then(p => { if (p) setProgress(p); });
    }
  }, [user]);

  if (!mod) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Module not found</p>
      </div>
    );
  }

  const Icon = iconMap[mod.icon] || Trophy;
  const quizData = isUnitTest ? mod.unitTest : mod.moduleQuiz;
  const passingScore = isUnitTest ? 70 : 60;
  const questions = quizData.questions;

  const handleAnswer = (correct: boolean, selectedIdx: number) => {
    const newCorrect = correctCount + (correct ? 1 : 0);
    if (correct) setCorrectCount(newCorrect);

    setAnswers(prev => [...prev, {
      question: questions[currentQ].question,
      selected: selectedIdx,
      correct: questions[currentQ].correctIndex,
      isCorrect: correct,
    }]);

    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      const score = Math.round((newCorrect / questions.length) * 100);
      const passed = score >= passingScore;
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      // Update local progress
      const updatedProgress = { ...progress };
      if (passed) {
        if (isUnitTest) {
          updatedProgress.passedUnitTests = new Set([...progress.passedUnitTests, mod.id]);
        } else {
          updatedProgress.passedModuleQuizzes = new Set([...progress.passedModuleQuizzes, mod.id]);
        }
        setProgress(updatedProgress);
        saveProgress(updatedProgress);
      }

      // Save to DB
      if (user) {
        saveAttempt.mutate({
          quiz_type: isUnitTest ? "unit-test" : "module",
          quiz_id: quizId,
          score: newCorrect,
          total_questions: questions.length,
          passed,
          answers: answers.concat([{
            question: questions[currentQ].question,
            selected: selectedIdx,
            correct: questions[currentQ].correctIndex,
            isCorrect: correct,
          }]),
          time_spent_seconds: elapsed,
        });
      }
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setCorrectCount(0);
    setAnswers([]);
    setFinished(false);
  };

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= passingScore;
  const modIdx = curriculum.findIndex(m => m.id === mod.id);

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(`/learn/${mod.id}`)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon size={14} style={{ color: mod.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Module {mod.number} · {isUnitTest ? "Unit Test" : "Quiz"}
            </span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">{quizData.title}</h1>
        </div>
      </motion.div>

      {/* Progress bar */}
      {!finished && (
        <div className="flex gap-1 mt-4 mb-6">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
              i < currentQ ? (answers[i]?.isCorrect ? "bg-gain" : "bg-loss") : i === currentQ ? "bg-foreground/50" : "bg-secondary"
            }`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div key={currentQ} className="mt-6">
            <QuizQuestion
              quiz={questions[currentQ]}
              index={currentQ}
              total={questions.length}
              onAnswer={handleAnswer}
            />
          </motion.div>
        ) : (
          <motion.div key="results" className="mt-6 space-y-4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {/* Score Card */}
            <div className="glass-card p-8 text-center">
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-gain/10" : "bg-loss/10"}`}>
                {passed ? <Trophy size={36} className="text-gain" /> : <RotateCcw size={36} className="text-loss" />}
              </div>
              <h2 className="mt-4 text-2xl font-bold">{passed ? "Passed! 🎉" : "Not quite"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You scored <span className="font-bold text-foreground">{correctCount}/{questions.length}</span> ({score}%)
                {!passed && ` — need ${passingScore}% to pass`}
              </p>
              {passed && <p className="mt-1 text-xs text-gain font-medium">+50 XP earned!</p>}

              <div className="mt-6 flex justify-center gap-3">
                {!passed && (
                  <button onClick={reset} className="rounded-xl bg-foreground px-6 py-3 text-xs font-medium text-primary-foreground flex items-center gap-1.5">
                    <RotateCcw size={12} /> Retry
                  </button>
                )}
                {passed && isUnitTest && modIdx < curriculum.length - 1 && (
                  <button onClick={() => navigate(`/learn/${curriculum[modIdx + 1].id}`)} className="rounded-xl bg-foreground px-6 py-3 text-xs font-medium text-primary-foreground flex items-center gap-1.5">
                    Next Module <ChevronRight size={12} />
                  </button>
                )}
                {passed && !isUnitTest && (
                  <button onClick={() => navigate(`/learn/${mod.id}/test`)} className="rounded-xl bg-foreground px-6 py-3 text-xs font-medium text-primary-foreground flex items-center gap-1.5">
                    Take Unit Test <ChevronRight size={12} />
                  </button>
                )}
                <button onClick={() => navigate(`/learn/${mod.id}`)} className="rounded-xl glass-card px-6 py-3 text-xs font-medium">
                  Back to Module
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BarChart3 size={14} className="text-muted-foreground" /> Answer Review
              </h3>
              <div className="space-y-2">
                {answers.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg mt-0.5 ${a.isCorrect ? "bg-gain/10" : "bg-loss/10"}`}>
                      {a.isCorrect ? <CheckCircle2 size={12} className="text-gain" /> : <XCircle size={12} className="text-loss" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{a.question}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Your answer: {String.fromCharCode(65 + a.selected)} · Correct: {String.fromCharCode(65 + a.correct)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Attempts */}
            {pastAttempts && pastAttempts.length > 1 && (
              <div className="glass-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" /> Previous Attempts
                </h3>
                <div className="space-y-2">
                  {pastAttempts.slice(0, 5).map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between py-1.5 text-xs">
                      <span className="text-muted-foreground">{format(new Date(a.attempted_at), "MMM d, h:mm a")}</span>
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-medium">{a.score}/{a.total_questions}</span>
                        <span className={`text-[10px] font-medium ${a.passed ? "text-gain" : "text-loss"}`}>{a.passed ? "Pass" : "Fail"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearnQuiz;
