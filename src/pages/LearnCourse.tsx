import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, BookOpen, Clock } from "lucide-react";

interface Lesson {
  title: string;
  duration: string;
  completed: boolean;
  sections: { heading: string; body: string }[];
}

const allCourses: Record<string, { title: string; description: string; lessons: Lesson[] }> = {
  "compounding-visualized": {
    title: "Compounding Visualized",
    description: "See how $100/month grows over 10, 20, and 30 years.",
    lessons: [
      {
        title: "What is compound interest?",
        duration: "4 min",
        completed: true,
        sections: [
          { heading: "The Core Concept", body: "Compound interest is the interest on a loan or deposit calculated based on both the initial principal and the accumulated interest from previous periods. Think of it as 'interest on interest' — your money earns returns, and those returns earn their own returns." },
          { heading: "How It Works In Your Portfolio", body: "In your portfolio, compounding means that the $12,438 you hold today doesn't just grow by the market return — the gains you've already made also generate returns. Over 20 years, this effect becomes dramatic." },
          { heading: "A Simple Example", body: "$10,000 at 8% annually:\n• Year 1: $10,800 (earned $800)\n• Year 5: $14,693 (earned $4,693)\n• Year 10: $21,589 (earned $11,589)\n• Year 20: $46,610 (earned $36,610)\n\nNotice how the gains accelerate. That's compounding." },
          { heading: "Key Takeaway", body: "The earlier you start, the more time compounding has to work. Even small amounts grow dramatically given enough time. This is the single most important concept in building wealth." },
        ],
      },
      {
        title: "The Rule of 72",
        duration: "3 min",
        completed: true,
        sections: [
          { heading: "The Formula", body: "The Rule of 72 is a simple way to estimate how long it takes for an investment to double. Divide 72 by your annual rate of return.\n\nAt 8% annually: 72 ÷ 8 = 9 years to double.\nAt 12% annually: 72 ÷ 12 = 6 years to double." },
          { heading: "Applied to Your Portfolio", body: "Based on your current paper trading return of 24.39%, your account would theoretically double in about 3 years — but remember, past performance doesn't predict future results. Realistic long-term market returns average 8-10% annually." },
          { heading: "Why This Matters", body: "Understanding doubling time helps you set realistic expectations. If you expect 8% returns, your money doubles roughly every 9 years. Starting with $10,000 at age 25, you'd have $160,000 by age 52 without adding another dollar." },
        ],
      },
      {
        title: "Monthly contributions matter",
        duration: "5 min",
        completed: true,
        sections: [
          { heading: "The Power of Consistency", body: "Consistent monthly contributions are often more impactful than trying to time the market. Regular investing (dollar-cost averaging) means you buy more shares when prices are low and fewer when prices are high." },
          { heading: "The Numbers", body: "$500/month invested at 8% annually grows to:\n\n• 10 years: $91,473\n• 20 years: $294,510\n• 30 years: $745,180\n\nThe total contributed over 30 years is only $180,000. The remaining $565,180 is pure compounding." },
          { heading: "Try It Yourself", body: "Head to the Simulation Lab to see how different contribution amounts affect your specific portfolio trajectory. You can compare $200/month vs $500/month vs $1,000/month scenarios." },
        ],
      },
      {
        title: "Time in market vs timing the market",
        duration: "4 min",
        completed: true,
        sections: [
          { heading: "The Data Is Clear", body: "Studies consistently show that time in the market beats timing the market. Missing just the 10 best trading days over 20 years can cut your returns in half." },
          { heading: "Your Pattern", body: "Your average hold time of 3.2 weeks suggests a more active approach. While momentum trading can work, consider dedicating a portion of your portfolio to long-term holds to capture the full compounding effect." },
          { heading: "A Balanced Approach", body: "Consider a 'core and satellite' strategy:\n• Core (70-80%): Long-term index fund holdings\n• Satellite (20-30%): Active momentum trades\n\nThis captures compounding benefits while still allowing active participation." },
        ],
      },
    ],
  },
  "credit-vs-asset-growth": {
    title: "Credit vs Asset Growth",
    description: "Understand the difference between debt systems and wealth systems.",
    lessons: [
      {
        title: "How debt works against you", duration: "5 min", completed: true,
        sections: [
          { heading: "Debt Compounds Too", body: "A $5,000 credit card balance at 22% APR, paying only minimums, takes 17 years to pay off and costs $7,723 in interest alone. Every dollar in high-interest debt is a dollar that can't compound in your favor." },
          { heading: "The Math", body: "Before investing aggressively, consider: paying off 22% debt gives a guaranteed 22% return. No investment can reliably match that. Eliminate high-interest debt first." },
        ],
      },
      {
        title: "Asset-building mindset", duration: "4 min", completed: true,
        sections: [
          { heading: "What Are Assets?", body: "Wealth is built by accumulating things that appreciate or generate income: stocks, real estate, businesses. Your portfolio of 4 positions worth $12,438 — these are assets working for you." },
          { heading: "The Key Question", body: "Are you building assets strategically, or reacting to market noise? Your behavioral data suggests momentum-driven entries. Consider whether each trade builds toward a larger asset strategy." },
        ],
      },
      {
        title: "Good debt vs bad debt", duration: "5 min", completed: false,
        sections: [
          { heading: "The Distinction", body: "Good debt: Low interest, used to acquire appreciating assets (mortgage, education with strong ROI).\nBad debt: High interest, used for depreciating purchases (credit cards for consumer goods)." },
          { heading: "The Test", body: "Does this debt help me build or acquire something worth more over time? If yes, it may be 'good debt.' If no, prioritize paying it off." },
        ],
      },
      {
        title: "The debt-to-asset ratio", duration: "4 min", completed: false,
        sections: [
          { heading: "Measuring Financial Health", body: "Your debt-to-asset ratio measures financial health. Below 0.5 is generally healthy — you own more than you owe. As you build your portfolio, track how this ratio improves." },
        ],
      },
      {
        title: "Building your first financial system", duration: "6 min", completed: false,
        sections: [
          { heading: "The System", body: "1. Income → Emergency fund (3-6 months expenses)\n2. Pay off high-interest debt\n3. Automate investments (DCA into diversified portfolio)\n4. Reinvest dividends and returns" },
          { heading: "Your Next Step", body: "Your current portfolio shows a momentum trading approach. Consider setting up a parallel long-term strategy using the Simulation Lab to model consistent contributions." },
        ],
      },
    ],
  },
  "risk-and-volatility": {
    title: "Risk & Volatility",
    description: "What risk actually means and how to measure it in your portfolio.",
    lessons: [
      { title: "What is risk, really?", duration: "4 min", completed: true, sections: [{ heading: "Beyond 'Losing Money'", body: "Risk is the probability and magnitude of outcomes deviating from expectations. Your 68% tech concentration creates sector-specific risk. If tech drops 20%, your portfolio could drop ~14% from tech alone." }] },
      { title: "Volatility ≠ Risk", duration: "3 min", completed: true, sections: [{ heading: "The Difference", body: "Volatility measures how much prices fluctuate. Risk measures permanent loss potential. A volatile stock that trends up over decades has high volatility but may have lower long-term risk." }] },
      { title: "Beta and what it means", duration: "5 min", completed: false, sections: [{ heading: "Understanding Beta", body: "Beta measures how much a stock moves relative to the market. Beta > 1 = more volatile. Your tech-heavy portfolio likely has a beta above 1." }] },
      { title: "Standard deviation in practice", duration: "4 min", completed: false, sections: [{ heading: "Spread of Returns", body: "If a stock returns 10% avg with 15% std dev, ~68% of the time returns will be between -5% and +25%. Higher std dev = more uncertainty." }] },
      { title: "Sharpe ratio explained", duration: "4 min", completed: false, sections: [{ heading: "Risk-Adjusted Returns", body: "Sharpe = (Return - Risk-Free Rate) / Std Dev. Above 1 is good. Above 2 is excellent. It answers: 'Am I being compensated for the risk?'" }] },
      { title: "Managing risk in your portfolio", duration: "6 min", completed: false, sections: [{ heading: "Practical Steps", body: "1. Diversify across sectors\n2. Mix asset classes\n3. Set position size limits\n4. Use stop-losses\n5. Rebalance quarterly" }] },
    ],
  },
  "portfolio-construction": {
    title: "Portfolio Construction",
    description: "Build a balanced portfolio using diversification principles.",
    lessons: [
      { title: "Why diversification works", duration: "5 min", completed: false, sections: [{ heading: "The Free Lunch", body: "Diversification reduces risk without necessarily reducing returns. Your 4 tech-heavy stocks have high correlation. In your TFSA, 78% is single-stock exposure." }] },
      { title: "Asset allocation strategies", duration: "6 min", completed: false, sections: [{ heading: "Frameworks", body: "• Age-based: 100 minus your age in stocks\n• Core-satellite: 70% index funds + 30% picks\n• All-weather: 30% stocks, 40% bonds, 15% commodities, 15% gold" }] },
      { title: "Rebalancing mechanics", duration: "4 min", completed: false, sections: [{ heading: "Stay On Target", body: "Rebalancing = selling winners and buying losers to maintain target allocation. Threshold or calendar-based. Both beat doing nothing." }] },
      { title: "Building a model portfolio", duration: "5 min", completed: false, sections: [{ heading: "Example Model", body: "40% US Large Cap, 15% International, 15% Small/Mid, 20% Bonds, 10% Alternatives. Compare to your 100% US large-cap tech concentration." }] },
      { title: "Tax-efficient placement", duration: "4 min", completed: false, sections: [{ heading: "Account Optimization", body: "TFSA: High-growth stocks (tax-free gains). RRSP: Bonds, dividends (tax-deferred). Taxable: Index funds, tax-loss harvesting." }] },
    ],
  },
  "long-term-vs-short-term": {
    title: "Long Term vs Short Term",
    description: "Compare time horizons and their impact on returns and taxes.",
    lessons: [
      { title: "Time horizon basics", duration: "4 min", completed: false, sections: [{ heading: "Know Your Horizon", body: "Short-term (< 1 year): Trading. Medium-term (1-5 years): Balanced. Long-term (5+ years): Buy and hold. Your 3.2-week average puts you firmly short-term." }] },
      { title: "Capital gains tax impact", duration: "5 min", completed: false, sections: [{ heading: "Tax Drag", body: "Short-term gains taxed at income rate (30-50%). Long-term gains get preferential rates (15-20%). With 3.2-week holds, you're likely paying the higher rate." }] },
      { title: "The power of patience", duration: "4 min", completed: false, sections: [{ heading: "Historical Odds", body: "S&P 500 held for:\n• 1 year: Positive 73% of the time\n• 10 years: Positive 94%\n• 20 years: Positive 100%\n\nTime dramatically reduces loss risk." }] },
      { title: "When to trade vs when to hold", duration: "5 min", completed: false, sections: [{ heading: "Decision Framework", body: "Trade when: Clear thesis, defined entry/exit, appropriate sizing.\nHold when: Fundamentals unchanged, reacting to noise, selling triggers unnecessary taxes." }] },
    ],
  },
};

const courseKeys = Object.keys(allCourses);

const LearnCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courseId ? allCourses[courseId] : null;
  const [activeLesson, setActiveLesson] = useState(0);

  if (!course) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Course not found</p>
          <button onClick={() => navigate("/learn")} className="mt-3 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-primary-foreground">Back to Learn</button>
        </div>
      </div>
    );
  }

  const lesson = course.lessons[activeLesson];
  const completedCount = course.lessons.filter((l) => l.completed).length;
  const currentCourseIdx = courseKeys.indexOf(courseId!);

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate("/learn")} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold tracking-tight">{course.title}</h1>
          <p className="text-xs text-muted-foreground">{completedCount}/{course.lessons.length} lessons complete</p>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${(completedCount / course.lessons.length) * 100}%` }} transition={{ duration: 0.8 }} />
      </div>

      <div className="mt-6 flex gap-6">
        {/* Lesson Sidebar (desktop) */}
        <div className="hidden lg:block lg:w-64 lg:shrink-0">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Lessons</p>
          <div className="space-y-1">
            {course.lessons.map((l, i) => (
              <button
                key={i}
                onClick={() => setActiveLesson(i)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                  i === activeLesson ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {l.completed ? <CheckCircle2 size={14} className={i === activeLesson ? "text-primary-foreground" : "text-gain"} /> : <Circle size={14} />}
                <span className="flex-1 font-medium">{l.title}</span>
                <span className="text-[10px] opacity-60">{l.duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <motion.div className="min-w-0 flex-1" key={activeLesson} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Mobile lesson selector */}
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {course.lessons.map((l, i) => (
              <button
                key={i}
                onClick={() => setActiveLesson(i)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-all ${
                  i === activeLesson ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"
                }`}
              >
                {l.completed ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                {l.title.length > 20 ? l.title.slice(0, 20) + "…" : l.title}
              </button>
            ))}
          </div>

          {/* Lesson Header */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen size={14} />
              <span className="text-[11px] font-medium">Lesson {activeLesson + 1} of {course.lessons.length}</span>
              <span className="text-[11px]">·</span>
              <Clock size={12} />
              <span className="text-[11px]">{lesson.duration}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold">{lesson.title}</h2>
          </div>

          {/* Lesson Sections */}
          <div className="mt-4 space-y-4">
            {lesson.sections.map((section, si) => (
              <motion.div
                key={si}
                className="glass-card p-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * si }}
              >
                <h3 className="text-sm font-semibold">{section.heading}</h3>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">{section.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
              disabled={activeLesson === 0}
              className="glass-card flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all disabled:opacity-30"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            {!lesson.completed && (
              <button className="rounded-xl bg-foreground px-5 py-2.5 text-xs font-medium text-primary-foreground transition-transform active:scale-[0.98]">
                Mark Complete
              </button>
            )}
            <button
              onClick={() => {
                if (activeLesson < course.lessons.length - 1) {
                  setActiveLesson(activeLesson + 1);
                } else if (currentCourseIdx < courseKeys.length - 1) {
                  navigate(`/learn/${courseKeys[currentCourseIdx + 1]}`);
                }
              }}
              disabled={activeLesson === course.lessons.length - 1 && currentCourseIdx === courseKeys.length - 1}
              className="glass-card flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all disabled:opacity-30"
            >
              {activeLesson === course.lessons.length - 1 ? "Next Course" : "Next"} <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearnCourse;
