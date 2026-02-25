import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, TrendingUp, Shield, PieChart, Coins, Trophy, Flame, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";

interface Lesson {
  title: string;
  duration: string;
  completed: boolean;
  content: string;
}

interface Module {
  icon: any;
  title: string;
  description: string;
  progress: number;
  lessons: Lesson[];
}

const modules: Module[] = [
  {
    icon: Coins,
    title: "Compounding Visualized",
    description: "See how $100/month grows over 10, 20, and 30 years.",
    progress: 100,
    lessons: [
      { title: "What is compound interest?", duration: "4 min", completed: true, content: "Compound interest is the interest on a loan or deposit that is calculated based on both the initial principal and the accumulated interest from previous periods. Think of it as 'interest on interest' — your money earns returns, and those returns earn their own returns.\n\nIn your portfolio, compounding means that the $12,438 you hold today doesn't just grow by the market return — the gains you've already made also generate returns. Over 20 years, this effect becomes dramatic." },
      { title: "The Rule of 72", duration: "3 min", completed: true, content: "The Rule of 72 is a simple way to estimate how long it takes for an investment to double. Divide 72 by your annual rate of return.\n\nAt 8% annually: 72 ÷ 8 = 9 years to double.\nAt 12% annually: 72 ÷ 12 = 6 years to double.\n\nBased on your current portfolio return of 24.39%, your paper trading account would theoretically double in about 3 years — but remember, past performance doesn't predict future results." },
      { title: "Monthly contributions matter", duration: "5 min", completed: true, content: "Consistent monthly contributions are often more impactful than trying to time the market. $500/month invested at 8% annually grows to:\n\n• 10 years: $91,473\n• 20 years: $294,510\n• 30 years: $745,180\n\nTry the Simulation Lab to see how different contribution amounts affect your specific portfolio trajectory." },
      { title: "Time in market vs timing the market", duration: "4 min", completed: true, content: "Studies consistently show that time in the market beats timing the market. Missing just the 10 best trading days over 20 years can cut your returns in half.\n\nYour average hold time of 3.2 weeks suggests a more active approach. While momentum trading can work, consider dedicating a portion of your portfolio to long-term holds to capture the full compounding effect." },
    ],
  },
  {
    icon: TrendingUp,
    title: "Credit vs Asset Growth",
    description: "Understand the difference between debt systems and wealth systems.",
    progress: 60,
    lessons: [
      { title: "How debt works against you", duration: "5 min", completed: true, content: "Debt compounds too — but against you. A $5,000 credit card balance at 22% APR, paying only minimums, takes 17 years to pay off and costs $7,723 in interest alone.\n\nEvery dollar in high-interest debt is a dollar that can't compound in your favor. Before investing aggressively, consider the math: paying off 22% debt gives a guaranteed 22% return." },
      { title: "Asset-building mindset", duration: "4 min", completed: true, content: "Wealth is built by accumulating assets that appreciate or generate income over time. Stocks, real estate, and businesses are examples.\n\nYour portfolio currently holds 4 positions worth $12,438. These are assets working for you. The key question: are you building assets strategically, or reacting to market noise?" },
      { title: "Good debt vs bad debt", duration: "5 min", completed: true, content: "Not all debt is equal:\n\n• Good debt: Low interest, used to acquire appreciating assets (mortgage, education loans with strong ROI)\n• Bad debt: High interest, used for depreciating purchases (credit cards for consumer goods)\n\nThe test: Does this debt help me build or acquire something worth more over time?" },
      { title: "The debt-to-asset ratio", duration: "4 min", completed: false, content: "Your debt-to-asset ratio measures financial health. Below 0.5 is generally healthy — you own more than you owe.\n\nAs you build your paper trading portfolio, think about how real-world debt affects your ability to invest. Someone with $50,000 in assets and $20,000 in debt has a ratio of 0.4 — healthy territory." },
      { title: "Building your first financial system", duration: "6 min", completed: false, content: "A financial system automates wealth building:\n\n1. Income → Emergency fund (3-6 months expenses)\n2. Pay off high-interest debt\n3. Automate investments (DCA into diversified portfolio)\n4. Reinvest dividends and returns\n\nYour current portfolio shows a momentum trading approach. Consider setting up a parallel long-term strategy using the Simulation Lab." },
    ],
  },
  {
    icon: Shield,
    title: "Risk & Volatility",
    description: "What risk actually means and how to measure it in your portfolio.",
    progress: 30,
    lessons: [
      { title: "What is risk, really?", duration: "4 min", completed: true, content: "Risk isn't just 'losing money.' It's the probability and magnitude of outcomes deviating from expectations.\n\nYour portfolio's 68% tech concentration creates sector-specific risk. If tech drops 20%, your portfolio could drop ~14% from tech alone. The Risk Exposure Map shows your current risk distribution." },
      { title: "Volatility ≠ Risk", duration: "3 min", completed: true, content: "Volatility measures how much prices fluctuate. Risk measures permanent loss potential. A volatile stock that trends up over decades (like many tech stocks) has high volatility but may have lower long-term risk.\n\nYour behavioral report shows 'Moderate' volatility response — meaning you tend to stay calm during price swings. This is a positive trait for long-term investing." },
      { title: "Beta and what it means", duration: "5 min", completed: false, content: "Beta measures how much a stock moves relative to the overall market. Beta > 1 means more volatile than the market. Beta < 1 means less volatile.\n\nYour portfolio likely has a beta above 1 due to tech concentration. This means in a bull market you'll outperform, but in a bear market you'll underperform the index." },
      { title: "Standard deviation in practice", duration: "4 min", completed: false, content: "Standard deviation tells you how spread out returns are. If a stock has an average annual return of 10% with a standard deviation of 15%, about 68% of the time your return will be between -5% and +25%.\n\nHigher standard deviation = wider range of outcomes = more uncertainty about what you'll actually earn." },
      { title: "Sharpe ratio explained", duration: "4 min", completed: false, content: "The Sharpe ratio measures risk-adjusted returns: (Return - Risk-Free Rate) / Standard Deviation. A Sharpe ratio above 1 is good; above 2 is excellent.\n\nIt answers: 'Am I being compensated enough for the risk I'm taking?' Two portfolios with the same return but different risk levels will have different Sharpe ratios." },
      { title: "Managing risk in your portfolio", duration: "6 min", completed: false, content: "Practical risk management:\n\n1. Diversify across sectors (you're 68% tech — room to improve)\n2. Mix asset classes (stocks, bonds, alternatives)\n3. Set position size limits (no single stock > 10-15%)\n4. Use stop-losses for momentum trades\n5. Rebalance quarterly\n\nVisit the Risk Exposure Map to see your current breakdown and identify improvement areas." },
    ],
  },
  {
    icon: PieChart,
    title: "Portfolio Construction",
    description: "Build a balanced portfolio using diversification principles.",
    progress: 0,
    lessons: [
      { title: "Why diversification works", duration: "5 min", completed: false, content: "Diversification reduces risk without necessarily reducing returns. By holding uncorrelated assets, when one drops, another may rise.\n\nYour current portfolio holds 4 tech-heavy stocks. In your TFSA, 78% is single-stock exposure. Let's simulate diversification impact in the Simulation Lab." },
      { title: "Asset allocation strategies", duration: "6 min", completed: false, content: "Common allocation frameworks:\n\n• Age-based: 100 minus your age in stocks (aggressive: 110 minus age)\n• Core-satellite: 70% index funds + 30% individual picks\n• All-weather: 30% stocks, 40% bonds, 15% commodities, 15% gold\n\nYour current allocation is 100% equities with high concentration. Consider which framework aligns with your goals." },
      { title: "Rebalancing mechanics", duration: "4 min", completed: false, content: "Rebalancing means selling winners and buying losers to maintain your target allocation. It's counter-intuitive but powerful.\n\nThreshold rebalancing: Rebalance when any position drifts more than 5% from target. Calendar rebalancing: Rebalance quarterly regardless.\n\nBoth approaches beat doing nothing over the long term." },
      { title: "Building a model portfolio", duration: "5 min", completed: false, content: "A model portfolio is your ideal target allocation. Example for moderate growth:\n\n• 40% US Large Cap (VTI, SPY)\n• 15% International (VXUS)\n• 15% Small/Mid Cap (VB)\n• 20% Bonds (BND)\n• 10% Alternatives (GLD, REIT)\n\nCompare this to your current 100% US large-cap tech concentration. The Allocation Preview in Sim Lab can show the impact." },
      { title: "Tax-efficient placement", duration: "4 min", completed: false, content: "Where you hold investments matters for taxes:\n\n• TFSA/Roth IRA: High-growth stocks (tax-free gains)\n• RRSP/Traditional IRA: Bonds, dividends (tax-deferred)\n• Taxable: Index funds, tax-loss harvesting opportunities\n\nOptimizing placement across account types can add 0.5-1% annually to your after-tax returns." },
    ],
  },
  {
    icon: BookOpen,
    title: "Long Term vs Short Term",
    description: "Compare time horizons and their impact on returns and taxes.",
    progress: 0,
    lessons: [
      { title: "Time horizon basics", duration: "4 min", completed: false, content: "Your time horizon determines your strategy:\n\n• Short-term (< 1 year): Trading, momentum\n• Medium-term (1-5 years): Balanced approach\n• Long-term (5+ years): Buy and hold, compounding\n\nYour 3.2-week average hold time puts you firmly in short-term territory. This works for some, but consider the tax implications and transaction costs." },
      { title: "Capital gains tax impact", duration: "5 min", completed: false, content: "Short-term capital gains (held < 1 year) are taxed at your income tax rate — potentially 30-50%. Long-term gains (held > 1 year) get preferential rates — typically 15-20%.\n\nWith your 3.2-week average hold time, you're likely paying the higher rate on gains. This 'tax drag' significantly impacts compounding over time." },
      { title: "The power of patience", duration: "4 min", completed: false, content: "Historical data shows that holding the S&P 500 for:\n\n• 1 year: Positive 73% of the time\n• 5 years: Positive 87% of the time\n• 10 years: Positive 94% of the time\n• 20 years: Positive 100% of the time\n\nTime dramatically reduces the risk of loss. Your momentum trading strategy fights against this statistical advantage." },
      { title: "When to trade vs when to hold", duration: "5 min", completed: false, content: "Trade when:\n• You have a clear thesis with defined entry/exit\n• Position sizing is appropriate (< 10% of portfolio)\n• You're not trading emotionally\n\nHold when:\n• Fundamentals haven't changed\n• You're reacting to short-term noise\n• Selling would trigger unnecessary taxes\n\nYour behavioral report shows potential emotional exit patterns. Use the grading system in Transactions to identify these." },
    ],
  },
];

const Learn = () => {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
  const totalProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-1 text-sm text-muted-foreground">Money Course · Build real understanding</p>
      </motion.div>

      {/* Streak & Progress */}
      <motion.div className="glass-card mt-5 flex items-center justify-between p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Flame size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">7 day streak</p>
            <p className="text-xs text-muted-foreground">Keep going!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Trophy size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium">3 badges</span>
          </div>
          <span className="text-xs text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-medium">{totalProgress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${totalProgress}%` }} transition={{ duration: 1, delay: 0.3 }} />
        </div>
      </motion.div>

      {/* Modules */}
      <div className="mt-6 space-y-3">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const isOpen = openModule === mod.title;
          const completedCount = mod.lessons.filter(l => l.completed).length;
          const isComplete = completedCount === mod.lessons.length;

          return (
            <motion.div key={mod.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 * i + 0.2 }}>
              {/* Module Header */}
              <button
                onClick={() => setOpenModule(isOpen ? null : mod.title)}
                className="glass-card w-full p-4 text-left transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Icon size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{mod.title}</p>
                      {isComplete && <span className="rounded-md bg-gain-subtle px-1.5 py-0.5 text-[10px] font-medium text-gain">Complete</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{mod.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${(completedCount / mod.lessons.length) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{completedCount}/{mod.lessons.length}</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    {isOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                  </div>
                </div>
              </button>

              {/* Lesson List */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-4 space-y-1 border-l border-border/50 pl-4">
                      {mod.lessons.map((lesson, li) => {
                        const isLessonOpen = openLesson === `${mod.title}-${li}`;
                        return (
                          <div key={li}>
                            <button
                              onClick={() => setOpenLesson(isLessonOpen ? null : `${mod.title}-${li}`)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
                            >
                              {lesson.completed ? (
                                <CheckCircle2 size={14} className="shrink-0 text-gain" />
                              ) : (
                                <Circle size={14} className="shrink-0 text-muted-foreground" />
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-medium">{lesson.title}</p>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                            </button>

                            {/* Lesson Content */}
                            <AnimatePresence>
                              {isLessonOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="glass-card mx-3 mb-2 p-4">
                                    <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
                                      {lesson.content}
                                    </p>
                                    {!lesson.completed && (
                                      <button className="mt-4 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-primary-foreground transition-transform active:scale-[0.98]">
                                        Mark as Complete
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Portfolio Context Note */}
      <motion.div className="glass-card mt-5 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          💡 Lessons dynamically reference your portfolio. Your data is used for personalized examples throughout the course.
        </p>
      </motion.div>
    </div>
  );
};

export default Learn;