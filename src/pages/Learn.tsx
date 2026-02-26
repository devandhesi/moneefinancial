import { motion } from "framer-motion";
import { BookOpen, Trophy, Flame, ChevronRight, CheckCircle2, Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket, BarChart3, GraduationCap, type LucideIcon, Play, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { curriculum, loadProgress } from "@/data/curriculum";
import { useState } from "react";

const iconMap: Record<string, LucideIcon> = { Brain, Briefcase, Wallet, CreditCard, TrendingUp, Landmark, ShieldCheck, Rocket };

const RESOURCES = [
  { title: "Interactive Charts Lab", desc: "Pick any stock and learn with AI", icon: BarChart3, route: "/learn/charts", color: "hsl(215, 60%, 55%)" },
  { title: "Investopedia", desc: "Comprehensive investing dictionary", icon: BookOpen, url: "https://www.investopedia.com", color: "hsl(30, 70%, 50%)" },
  { title: "Khan Academy Finance", desc: "Free video courses on finance", icon: Play, url: "https://www.khanacademy.org/economics-finance-domain", color: "hsl(152, 28%, 40%)" },
  { title: "SEC Investor Education", desc: "Official investor protection guides", icon: ShieldCheck, url: "https://www.investor.gov", color: "hsl(0, 50%, 50%)" },
];

const QUICK_CONCEPTS = [
  { term: "P/E Ratio", definition: "Price divided by earnings per share — measures how much investors pay per dollar of earnings." },
  { term: "Market Cap", definition: "Share price × total shares outstanding — indicates company size." },
  { term: "Dividend Yield", definition: "Annual dividend ÷ share price — shows income return on investment." },
  { term: "Beta", definition: "Measures stock volatility vs the market. β > 1 = more volatile, β < 1 = less volatile." },
  { term: "EPS", definition: "Earnings Per Share — net income divided by outstanding shares." },
  { term: "RSI", definition: "Relative Strength Index — momentum indicator showing overbought (>70) or oversold (<30) conditions." },
];

const Learn = () => {
  const navigate = useNavigate();
  const [progress] = useState(loadProgress);
  const [showGlossary, setShowGlossary] = useState(false);

  const totalLessons = curriculum.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = curriculum.reduce((s, m) => s + m.lessons.filter(l => progress.completedLessons.has(l.id)).length, 0);
  const totalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const modulesCompleted = curriculum.filter(m => progress.passedUnitTests.has(m.id)).length;

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Investing 101</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you need to start investing with confidence</p>
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

      {/* Resources & Tools */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Learning Resources</h2>
        <div className="grid grid-cols-2 gap-2">
          {RESOURCES.map((r) => {
            const Icon = r.icon;
            const isInternal = !!r.route;
            return (
              <button
                key={r.title}
                onClick={() => isInternal ? navigate(r.route!) : window.open(r.url, "_blank")}
                className="glass-card p-4 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: r.color }} />
                  {!isInternal && <ExternalLink size={10} className="text-muted-foreground" />}
                </div>
                <p className="text-xs font-semibold">{r.title}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">{r.desc}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Glossary */}
      <motion.div className="mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button onClick={() => setShowGlossary(!showGlossary)} className="flex w-full items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Quick Glossary</h2>
          <span className="text-[10px] text-muted-foreground">{showGlossary ? "Hide" : "Show"}</span>
        </button>
        {showGlossary && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-2">
            {QUICK_CONCEPTS.map((c) => (
              <div key={c.term} className="glass-card p-3">
                <p className="text-xs font-semibold">{c.term}</p>
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">{c.definition}</p>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Module Cards */}
      <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">The Money Course · 8 Modules</h2>
        <div className="space-y-3">
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i + 0.25 }}
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
      </motion.div>

      <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Each module includes full-page lessons, a 5-question knowledge check, and a 10-question unit test. Complete all modules to earn your Money Course certificate.
        </p>
      </motion.div>
    </div>
  );
};

export default Learn;
