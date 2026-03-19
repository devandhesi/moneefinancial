import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Clock, HelpCircle, Sparkles, Send,
  Bookmark, BookmarkCheck, StickyNote, Loader2, X,
  Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket,
  type LucideIcon,
} from "lucide-react";
import { curriculum, loadProgress, saveProgress, loadProgressFromDb, type Quiz, type LearningProgress } from "@/data/curriculum";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateStreak, useToggleBookmark, useLearnBookmarks, useLearnNotes, useSaveNote } from "@/hooks/use-learn";
import { useSimPositions, useSimAccount } from "@/hooks/use-sim-portfolio";
import { streamChat } from "@/lib/chat-stream";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

/* ── Inline Quiz ───────────────────────────────────────────── */
const InlineQuiz = ({ quiz, onComplete }: { quiz: Quiz; onComplete: (correct: boolean) => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <HelpCircle size={15} className="text-muted-foreground" />
        <span>Knowledge Check</span>
      </div>
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
            <div className={`rounded-xl p-3 ${isCorrect ? "bg-gain/5 border border-gain/10" : "bg-loss/5 border border-loss/10"}`}>
              <p className={`text-xs font-semibold ${isCorrect ? "text-gain" : "text-loss"}`}>{isCorrect ? "✓ Correct! +25 XP" : "✗ Not quite"}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{quiz.explanation}</p>
            </div>
            <button onClick={() => onComplete(isCorrect)} className="mt-3 w-full rounded-xl bg-foreground py-2.5 text-xs font-medium text-primary-foreground">
              Continue →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── AI Sidebar ────────────────────────────────────────────── */
interface ChatMsg { role: "user" | "assistant"; content: string }

const AISidebar = ({ lessonTitle, sectionContent, moduleTitle }: { lessonTitle: string; sectionContent: string; moduleTitle: string }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: simAccount } = useSimAccount();
  const { data: positions } = useSimPositions(simAccount?.id);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const holdingsContext = (positions && positions.length > 0)
    ? `\n\nUser's current holdings: ${positions.map(p => `${p.ticker} (${p.quantity} shares @ $${p.avg_cost?.toFixed(2)})`).join(", ")}`
    : "\n\nUser has no current holdings.";

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg: ChatMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const systemMsg: ChatMsg = {
      role: "user",
      content: `[SYSTEM] You are Maven, an AI tutor inside Monee's learning platform. You're helping a student understand "${lessonTitle}" from the module "${moduleTitle}". Reference the lesson content and the student's real portfolio when relevant. Be encouraging, use **bold** for key terms, keep answers under 200 words. End with a follow-up question.\n\nLesson excerpt: ${sectionContent.slice(0, 1500)}${holdingsContext}`,
    };

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [systemMsg, ...messages, userMsg],
        onDelta: upsert,
        onDone: () => setLoading(false),
        onError: (err) => { toast.error(err); setLoading(false); },
      });
    } catch {
      toast.error("Failed to connect to Maven");
      setLoading(false);
    }
  };

  const chips = [
    "Explain this like I'm 5",
    "How does this relate to my portfolio?",
    "Give me a real-world example",
    "Quiz me on this section",
  ];

  return (
    <div className="glass-card flex flex-col h-[400px] lg:h-[600px]">
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        <Sparkles size={14} className="text-violet-500" />
        <span className="text-xs font-semibold">Maven AI Tutor</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles size={24} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">Ask Maven anything about this lesson</p>
            <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
              {chips.map(c => (
                <button key={c} onClick={() => send(c)} className="rounded-lg bg-secondary px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`${m.role === "user" ? "text-right" : ""}`}>
            <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
              m.role === "user" ? "bg-foreground text-primary-foreground" : "bg-secondary/50"
            }`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-xs"><ReactMarkdown>{m.content}</ReactMarkdown></div>
              ) : m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin" /> Thinking...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-border/30 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about this lesson..."
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="text-muted-foreground hover:text-foreground disabled:opacity-30">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const LearnLesson = () => {
  const { courseId, lessonIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateStreak = useUpdateStreak();
  const toggleBookmark = useToggleBookmark();
  const { data: bookmarks } = useLearnBookmarks();

  const mod = curriculum.find(m => m.id === courseId);
  const lessonIdx = parseInt(lessonIndex || "0", 10);
  const [progress, setProgress] = useState<LearningProgress>(loadProgress);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadProgressFromDb().then(p => { if (p) setProgress(p); });
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lessonIdx]);

  if (!mod || !mod.lessons[lessonIdx]) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lesson not found</p>
          <button onClick={() => navigate("/learn")} className="mt-3 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-primary-foreground">Back to Learn</button>
        </div>
      </div>
    );
  }

  const lesson = mod.lessons[lessonIdx];
  const Icon = iconMap[mod.icon] || BookOpen;
  const lessonComplete = progress.completedLessons.has(lesson.id);
  const isBookmarked = bookmarks?.some(b => b.item_id === lesson.id && b.item_type === "lesson");
  const sectionContent = lesson.sections.map(s => `${s.heading}: ${s.body}`).join("\n\n");

  const markComplete = useCallback(() => {
    const updated: LearningProgress = { ...progress, completedLessons: new Set([...progress.completedLessons, lesson.id]) };
    setProgress(updated);
    saveProgress(updated);
    updateStreak.mutate(25);
  }, [progress, lesson.id, updateStreak]);

  const goNext = () => {
    if (!lessonComplete) markComplete();
    if (lesson.quiz) {
      navigate(`/learn/${mod.id}/${lessonIdx}/quiz`);
    } else if (lessonIdx < mod.lessons.length - 1) {
      navigate(`/learn/${mod.id}/${lessonIdx + 1}`);
    } else {
      navigate(`/learn/${mod.id}/quiz`);
    }
  };

  const goPrev = () => {
    if (lessonIdx > 0) navigate(`/learn/${mod.id}/${lessonIdx - 1}`);
  };

  return (
    <div className="relative">
      {/* Reading progress bar (top of viewport) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left"
        style={{ background: mod.color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: readingProgress }}
        transition={{ duration: 0.1 }}
      />

      <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(`/learn/${mod.id}`)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon size={14} style={{ color: mod.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Module {mod.number} · Lesson {lessonIdx + 1} of {mod.lessons.length}</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark.mutate({ item_type: "lesson", item_id: lesson.id })}
              className="rounded-lg p-2 hover:bg-secondary transition-colors"
            >
              {isBookmarked ? <BookmarkCheck size={16} className="text-amber-500" /> : <Bookmark size={16} className="text-muted-foreground" />}
            </button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} />
              <span className="text-[10px]">{lesson.duration}</span>
            </div>
          </div>
        </motion.div>

        {/* Lesson progress dots */}
        <div className="flex gap-1 mt-4">
          {mod.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => navigate(`/learn/${mod.id}/${i}`)}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i === lessonIdx ? "bg-foreground" : progress.completedLessons.has(l.id) ? "bg-foreground/40" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Content grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main Content */}
          <div ref={contentRef}>
            {/* Section nav (desktop) */}
            {lesson.sections.length > 2 && (
              <div className="hidden lg:flex items-center gap-2 mb-6 flex-wrap">
                {lesson.sections.map((section, si) => (
                  <button
                    key={si}
                    onClick={() => {
                      const el = document.getElementById(`section-${si}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    {section.heading}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-10">
              {lesson.sections.map((section, si) => (
                <motion.div
                  key={si}
                  id={`section-${si}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.08 }}
                  className="scroll-mt-20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold bg-secondary text-muted-foreground">
                      {si + 1}
                    </div>
                    <h3 className="text-base font-bold">{section.heading}</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-sm leading-[1.8] text-muted-foreground pl-10">
                    <ReactMarkdown>{section.body}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Key Takeaway */}
            <motion.div
              className="mt-10 glass-card p-5 border-l-2"
              style={{ borderLeftColor: mod.color }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">💡 Key Takeaway</p>
              <p className="text-xs leading-relaxed text-foreground">
                {lesson.sections[lesson.sections.length - 1]?.body.split(".").slice(0, 2).join(".") + "."}
              </p>
            </motion.div>

            {/* Quiz CTA */}
            {lesson.quiz && (
              <motion.div
                className="mt-8 glass-card p-6 text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-3">
                  <HelpCircle size={22} className="text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold">Ready to test your knowledge?</h3>
                <p className="mt-1 text-xs text-muted-foreground">Complete a quick quiz on what you just learned</p>
                <button
                  onClick={() => navigate(`/learn/${mod.id}/${lessonIdx}/quiz`)}
                  className="mt-4 rounded-xl bg-foreground px-6 py-2.5 text-xs font-medium text-primary-foreground inline-flex items-center gap-1.5"
                >
                  Start Quiz <ArrowRight size={12} />
                </button>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button onClick={goPrev} disabled={lessonIdx === 0} className="rounded-xl glass-card px-4 py-2.5 text-xs font-medium disabled:opacity-30 flex items-center gap-1">
                <ArrowLeft size={12} /> Previous
              </button>
              <div className="flex items-center gap-2">
                {!lessonComplete && (
                  <button onClick={markComplete} className="rounded-xl glass-card px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 text-gain">
                    <CheckCircle2 size={12} /> Mark complete
                  </button>
                )}
                <button onClick={goNext} className="rounded-xl bg-foreground px-6 py-2.5 text-xs font-medium text-primary-foreground flex items-center gap-1">
                  {lesson.quiz ? "Take Quiz" : lessonIdx === mod.lessons.length - 1 ? "Module Quiz" : "Next Lesson"} <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* AI Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <AISidebar lessonTitle={lesson.title} sectionContent={sectionContent} moduleTitle={mod.title} />
            </div>
          </div>
        </div>

        {/* Mobile AI toggle */}
        <MobileAIPanel lessonTitle={lesson.title} sectionContent={sectionContent} moduleTitle={mod.title} />
      </div>
    </div>
  );
};

/* Mobile AI drawer */
const MobileAIPanel = ({ lessonTitle, sectionContent, moduleTitle }: { lessonTitle: string; sectionContent: string; moduleTitle: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-primary-foreground shadow-lg"
      >
        <Sparkles size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden flex flex-col bg-background"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                <span className="text-sm font-semibold">Maven AI Tutor</span>
              </div>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AISidebar lessonTitle={lessonTitle} sectionContent={sectionContent} moduleTitle={moduleTitle} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LearnLesson;
