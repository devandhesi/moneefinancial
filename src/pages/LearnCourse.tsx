import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, BookOpen, Clock, HelpCircle, Trophy } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// ── Quiz types ──
interface QuizOption {
  label: string;
  chartData?: number[]; // mini sparkline for visual options
}

interface Quiz {
  question: string;
  context?: string; // scenario description
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
}

interface Lesson {
  title: string;
  duration: string;
  completed: boolean;
  sections: { heading: string; body: string }[];
  quiz?: Quiz;
}

// ── Quiz Component ──
const QuizCard = ({ quiz, onPass }: { quiz: Quiz; onPass: () => void }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === quiz.correctIndex;
  const answered = selected !== null;

  return (
    <motion.div className="glass-card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <HelpCircle size={15} className="text-muted-foreground" />
        <span>Knowledge Check</span>
      </div>

      {quiz.context && (
        <div className="mt-3 rounded-xl bg-secondary/50 p-3">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{quiz.context}</p>
        </div>
      )}

      <p className="mt-3 text-[13px] font-medium leading-relaxed">{quiz.question}</p>

      <div className="mt-4 space-y-2">
        {quiz.options.map((opt, i) => {
          const isThis = selected === i;
          const showCorrect = answered && i === quiz.correctIndex;
          const showWrong = answered && isThis && !isCorrect;

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                showCorrect
                  ? "border-gain bg-gain/5"
                  : showWrong
                  ? "border-loss bg-loss/5"
                  : isThis
                  ? "border-foreground/30 bg-secondary/50"
                  : "border-border/50 hover:border-foreground/20 hover:bg-secondary/30"
              } ${answered ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                  showCorrect ? "bg-gain/15 text-gain" : showWrong ? "bg-loss/15 text-loss" : "bg-secondary text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-medium">{opt.label}</p>
                </div>
                {opt.chartData && (
                  <div className="h-8 w-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={opt.chartData.map((v, idx) => ({ v, i: idx }))}>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={
                            showCorrect ? "hsl(152,28%,40%)" : showWrong ? "hsl(0,32%,52%)" : "hsl(220,8%,60%)"
                          }
                          strokeWidth={1.5}
                          fill="none"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className={`mt-4 rounded-xl p-3 ${isCorrect ? "bg-gain/5 border border-gain/10" : "bg-loss/5 border border-loss/10"}`}>
              <p className={`text-xs font-semibold ${isCorrect ? "text-gain" : "text-loss"}`}>
                {isCorrect ? "✓ Correct!" : "✗ Not quite"}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{quiz.explanation}</p>
            </div>
            {isCorrect && (
              <button
                onClick={onPass}
                className="mt-3 w-full rounded-xl bg-foreground py-2.5 text-xs font-medium text-primary-foreground transition-transform active:scale-[0.98]"
              >
                Continue →
              </button>
            )}
            {!isCorrect && (
              <button
                onClick={() => setSelected(null)}
                className="mt-3 w-full rounded-xl glass-card py-2.5 text-xs font-medium transition-transform active:scale-[0.98]"
              >
                Try Again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Course Data ──
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
        quiz: {
          question: "You invest $10,000 at 8% annually. After 20 years, which chart shows the correct growth pattern?",
          context: "Compound interest causes growth to accelerate over time, not remain constant. The curve should steepen as accumulated gains generate their own returns.",
          options: [
            { label: "Steady linear growth", chartData: [10, 12, 14, 16, 18, 20, 22, 24] },
            { label: "Accelerating exponential curve", chartData: [10, 11, 13, 16, 20, 27, 36, 47] },
            { label: "Flat then sudden spike", chartData: [10, 10, 10, 10, 10, 10, 40, 47] },
            { label: "Declining over time", chartData: [10, 9, 8, 7, 6, 5, 4, 3] },
          ],
          correctIndex: 1,
          explanation: "Compound interest creates an exponential curve that accelerates over time. Each year's gains are larger because they're calculated on a growing base. This is why starting early matters so much.",
        },
      },
      {
        title: "The Rule of 72",
        duration: "3 min",
        completed: true,
        sections: [
          { heading: "The Formula", body: "The Rule of 72 is a simple way to estimate how long it takes for an investment to double. Divide 72 by your annual rate of return.\n\nAt 8% annually: 72 ÷ 8 = 9 years to double.\nAt 12% annually: 72 ÷ 12 = 6 years to double." },
          { heading: "Applied to Your Portfolio", body: "Based on your current paper trading return of 24.39%, your account would theoretically double in about 3 years — but remember, past performance doesn't predict future results." },
          { heading: "Why This Matters", body: "Understanding doubling time helps you set realistic expectations. If you expect 8% returns, your money doubles roughly every 9 years." },
        ],
        quiz: {
          question: "Using the Rule of 72, how long does it take to double your money at 6% annual returns?",
          options: [
            { label: "6 years" },
            { label: "12 years" },
            { label: "18 years" },
            { label: "24 years" },
          ],
          correctIndex: 1,
          explanation: "72 ÷ 6 = 12 years. The Rule of 72 gives you a quick mental estimate. At 6%, your money doubles roughly every 12 years.",
        },
      },
      {
        title: "Monthly contributions matter",
        duration: "5 min",
        completed: true,
        sections: [
          { heading: "The Power of Consistency", body: "Consistent monthly contributions are often more impactful than trying to time the market." },
          { heading: "The Numbers", body: "$500/month invested at 8% annually grows to:\n\n• 10 years: $91,473\n• 20 years: $294,510\n• 30 years: $745,180\n\nThe total contributed over 30 years is only $180,000. The remaining $565,180 is pure compounding." },
          { heading: "Try It Yourself", body: "Head to the Simulation Lab to see how different contribution amounts affect your specific portfolio trajectory." },
        ],
        quiz: {
          question: "You invest $500/month for 30 years at 8%. Your total contributions are $180,000. What's the approximate final value?",
          options: [
            { label: "~$250,000" },
            { label: "~$500,000" },
            { label: "~$745,000" },
            { label: "~$1,200,000" },
          ],
          correctIndex: 2,
          explanation: "$500/month for 30 years at 8% grows to approximately $745,180. You only contributed $180,000 — the remaining $565,000+ came from compounding. This demonstrates why consistent investing over time is so powerful.",
        },
      },
      {
        title: "Time in market vs timing the market",
        duration: "4 min",
        completed: true,
        sections: [
          { heading: "The Data Is Clear", body: "Studies consistently show that time in the market beats timing the market. Missing just the 10 best trading days over 20 years can cut your returns in half." },
          { heading: "Your Pattern", body: "Your average hold time of 3.2 weeks suggests a more active approach. While momentum trading can work, consider dedicating a portion of your portfolio to long-term holds." },
          { heading: "A Balanced Approach", body: "Consider a 'core and satellite' strategy:\n• Core (70-80%): Long-term index fund holdings\n• Satellite (20-30%): Active momentum trades" },
        ],
        quiz: {
          question: "A stock drops 15% over 2 weeks due to market panic. Fundamentals haven't changed. Based on what you've learned, what's the best approach?",
          context: "ACME Corp (fictional) reported strong earnings last quarter. Revenue up 12%. No debt concerns. But broad market selloff dragged it down 15%.",
          options: [
            { label: "Sell immediately to cut losses", chartData: [100, 95, 88, 85, 82, 78, 70, 65] },
            { label: "Hold — fundamentals unchanged", chartData: [100, 95, 85, 82, 88, 92, 98, 105] },
            { label: "Buy more — market overreaction", chartData: [100, 95, 85, 90, 100, 110, 118, 125] },
          ],
          correctIndex: 1,
          explanation: "When fundamentals haven't changed, short-term drops are usually noise. Selling in panic locks in losses. Holding through volatility has historically been the winning strategy. Buying more could work too, but requires conviction and risk tolerance.",
        },
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
          { heading: "Debt Compounds Too", body: "A $5,000 credit card balance at 22% APR, paying only minimums, takes 17 years to pay off and costs $7,723 in interest alone." },
          { heading: "The Math", body: "Paying off 22% debt gives a guaranteed 22% return. No investment can reliably match that." },
        ],
        quiz: {
          question: "You have $5,000 in credit card debt at 22% APR and $5,000 to invest. What should you prioritize?",
          options: [
            { label: "Invest — markets return more long-term" },
            { label: "Pay off debt — guaranteed 22% return" },
            { label: "Split 50/50 between both" },
          ],
          correctIndex: 1,
          explanation: "Paying off 22% APR debt is a guaranteed 22% return. No investment reliably beats that. Always eliminate high-interest debt before investing aggressively.",
        },
      },
      {
        title: "Asset-building mindset", duration: "4 min", completed: true,
        sections: [
          { heading: "What Are Assets?", body: "Wealth is built by accumulating things that appreciate or generate income: stocks, real estate, businesses." },
          { heading: "The Key Question", body: "Are you building assets strategically, or reacting to market noise?" },
        ],
        quiz: {
          question: "Which of these is an appreciating asset?",
          options: [
            { label: "A new car (loses 20% year 1)" },
            { label: "Index fund shares (avg 8-10% annual return)" },
            { label: "Designer clothing" },
            { label: "Latest smartphone" },
          ],
          correctIndex: 1,
          explanation: "Index fund shares historically appreciate 8-10% annually. Cars, clothing, and electronics are depreciating assets that lose value over time. Building wealth means accumulating appreciating assets.",
        },
      },
      {
        title: "Good debt vs bad debt", duration: "5 min", completed: false,
        sections: [
          { heading: "The Distinction", body: "Good debt: Low interest, used to acquire appreciating assets.\nBad debt: High interest, used for depreciating purchases." },
          { heading: "The Test", body: "Does this debt help me build or acquire something worth more over time?" },
        ],
        quiz: {
          question: "Is a mortgage 'good debt' or 'bad debt'?",
          options: [
            { label: "Bad debt — all debt is bad" },
            { label: "Good debt — it finances an appreciating asset" },
            { label: "Neutral — it depends on nothing" },
          ],
          correctIndex: 1,
          explanation: "A mortgage is typically 'good debt' because it finances an appreciating asset (real estate) at relatively low interest rates. The property generally increases in value over time while you build equity.",
        },
      },
      {
        title: "The debt-to-asset ratio", duration: "4 min", completed: false,
        sections: [
          { heading: "Measuring Financial Health", body: "Your debt-to-asset ratio measures financial health. Below 0.5 is generally healthy — you own more than you owe." },
        ],
        quiz: {
          question: "Someone has $80,000 in assets and $30,000 in debt. Is their debt-to-asset ratio healthy?",
          options: [
            { label: "Yes — ratio is 0.375, below 0.5" },
            { label: "No — any debt is unhealthy" },
            { label: "Can't determine from this info" },
          ],
          correctIndex: 0,
          explanation: "$30,000 ÷ $80,000 = 0.375. This is below 0.5, which is generally considered healthy territory. They own more than twice what they owe.",
        },
      },
      {
        title: "Building your first financial system", duration: "6 min", completed: false,
        sections: [
          { heading: "The System", body: "1. Income → Emergency fund (3-6 months expenses)\n2. Pay off high-interest debt\n3. Automate investments (DCA)\n4. Reinvest dividends" },
          { heading: "Your Next Step", body: "Consider setting up a parallel long-term strategy using the Simulation Lab." },
        ],
        quiz: {
          question: "What's the correct order for building financial security?",
          options: [
            { label: "Invest → Pay debt → Build emergency fund" },
            { label: "Emergency fund → Pay high-interest debt → Invest" },
            { label: "Pay all debt → Emergency fund → Invest" },
          ],
          correctIndex: 1,
          explanation: "The optimal order is: emergency fund first (3-6 months expenses), then pay off high-interest debt, then invest. The emergency fund prevents you from going into more debt during unexpected events.",
        },
      },
    ],
  },
  "risk-and-volatility": {
    title: "Risk & Volatility",
    description: "What risk actually means and how to measure it in your portfolio.",
    lessons: [
      {
        title: "What is risk, really?", duration: "4 min", completed: true,
        sections: [{ heading: "Beyond 'Losing Money'", body: "Risk is the probability and magnitude of outcomes deviating from expectations. Your 68% tech concentration creates sector-specific risk." }],
        quiz: {
          question: "Your portfolio is 68% technology stocks. If the tech sector drops 20%, approximately how much could your portfolio fall from tech alone?",
          options: [
            { label: "~7% decline" },
            { label: "~14% decline" },
            { label: "~20% decline" },
            { label: "~30% decline" },
          ],
          correctIndex: 1,
          explanation: "68% × 20% = ~13.6% (approximately 14%). Concentration risk means a sector downturn disproportionately affects your whole portfolio. This is why diversification matters.",
        },
      },
      {
        title: "Volatility ≠ Risk", duration: "3 min", completed: true,
        sections: [{ heading: "The Difference", body: "Volatility measures how much prices fluctuate. Risk measures permanent loss potential." }],
        quiz: {
          question: "Stock A swings ±30% yearly but trends up 12% annually over 20 years. Stock B is flat at 2% with no swings. Which has more volatility? Which has more long-term risk of poor returns?",
          context: "Consider the difference between short-term price fluctuations and long-term outcome risk.",
          options: [
            { label: "A is more volatile AND riskier", chartData: [50, 70, 45, 80, 55, 90, 60, 100] },
            { label: "A is more volatile, B is riskier long-term", chartData: [50, 52, 54, 56, 58, 60, 62, 64] },
            { label: "B is more volatile AND riskier" },
          ],
          correctIndex: 1,
          explanation: "Stock A has higher volatility (bigger swings) but lower long-term risk — it compounds at 12%. Stock B has zero volatility but barely beats inflation at 2%. Volatility ≠ risk. Smooth returns aren't always better.",
        },
      },
      {
        title: "Beta and what it means", duration: "5 min", completed: false,
        sections: [{ heading: "Understanding Beta", body: "Beta measures how much a stock moves relative to the market. Beta > 1 = more volatile than market." }],
        quiz: {
          question: "A stock has a beta of 1.5. The market drops 10%. What's the expected movement of this stock?",
          options: [
            { label: "Down 10%", chartData: [100, 95, 90] },
            { label: "Down 15%", chartData: [100, 92, 85] },
            { label: "Down 5%", chartData: [100, 97, 95] },
          ],
          correctIndex: 1,
          explanation: "Beta of 1.5 means the stock moves 1.5× the market. A 10% market drop → ~15% stock drop (10% × 1.5). Higher beta = amplified moves in both directions.",
        },
      },
      {
        title: "Standard deviation in practice", duration: "4 min", completed: false,
        sections: [{ heading: "Spread of Returns", body: "If a stock returns 10% avg with 15% std dev, ~68% of the time returns will be between -5% and +25%." }],
        quiz: {
          question: "A fund returns 8% average with 20% standard deviation. What range covers ~68% of likely annual returns?",
          options: [
            { label: "-12% to +28%" },
            { label: "0% to +16%" },
            { label: "-4% to +20%" },
          ],
          correctIndex: 0,
          explanation: "One standard deviation: 8% ± 20% = -12% to +28%. This wide range shows high uncertainty. A narrower std dev (e.g., 5%) would mean 3% to 13% — much more predictable.",
        },
      },
      {
        title: "Sharpe ratio explained", duration: "4 min", completed: false,
        sections: [{ heading: "Risk-Adjusted Returns", body: "Sharpe = (Return - Risk-Free Rate) / Std Dev. Above 1 is good. Above 2 is excellent." }],
        quiz: {
          question: "Fund A returns 15% with 20% std dev. Fund B returns 10% with 8% std dev. Risk-free rate is 3%. Which has the better Sharpe ratio?",
          options: [
            { label: "Fund A (Sharpe = 0.60)" },
            { label: "Fund B (Sharpe = 0.88)" },
          ],
          correctIndex: 1,
          explanation: "Fund A: (15-3)/20 = 0.60. Fund B: (10-3)/8 = 0.88. Fund B delivers more return per unit of risk. Higher returns don't always mean better investments when adjusted for risk.",
        },
      },
      {
        title: "Managing risk in your portfolio", duration: "6 min", completed: false,
        sections: [{ heading: "Practical Steps", body: "1. Diversify across sectors\n2. Mix asset classes\n3. Set position size limits\n4. Use stop-losses\n5. Rebalance quarterly" }],
        quiz: {
          question: "Your portfolio is 70% in one tech stock. What's the most effective first step to reduce risk?",
          options: [
            { label: "Add a stop-loss order" },
            { label: "Diversify into other sectors and asset classes" },
            { label: "Switch to a different tech stock" },
          ],
          correctIndex: 1,
          explanation: "With 70% concentration in one stock, the biggest risk is company-specific and sector-specific. Diversifying across sectors and asset classes directly addresses concentration risk — the largest risk factor here.",
        },
      },
    ],
  },
  "portfolio-construction": {
    title: "Portfolio Construction",
    description: "Build a balanced portfolio using diversification principles.",
    lessons: [
      {
        title: "Why diversification works", duration: "5 min", completed: false,
        sections: [{ heading: "The Free Lunch", body: "Diversification reduces risk without necessarily reducing returns. Your 4 tech-heavy stocks have high correlation." }],
        quiz: {
          question: "Two stocks: both average 10% returns. Stock A is tech, Stock B is healthcare. They're uncorrelated. What happens to your portfolio risk if you hold both vs just one?",
          options: [
            { label: "Risk stays the same" },
            { label: "Risk decreases" },
            { label: "Risk increases" },
          ],
          correctIndex: 1,
          explanation: "Holding uncorrelated assets reduces portfolio risk while maintaining the same expected return. When one zigs, the other may zag. This is diversification — the only 'free lunch' in investing.",
        },
      },
      {
        title: "Asset allocation strategies", duration: "6 min", completed: false,
        sections: [{ heading: "Frameworks", body: "• Age-based: 100 minus your age in stocks\n• Core-satellite: 70% index funds + 30% picks\n• All-weather: 30% stocks, 40% bonds, 15% commodities, 15% gold" }],
        quiz: {
          question: "You're 30 years old using the age-based rule. What percentage should be in stocks?",
          options: [
            { label: "30%" },
            { label: "50%" },
            { label: "70%" },
            { label: "100%" },
          ],
          correctIndex: 2,
          explanation: "100 - 30 (your age) = 70% in stocks. This rule suggests gradually shifting toward bonds as you age. It's a starting point — adjust based on your risk tolerance and goals.",
        },
      },
      {
        title: "Rebalancing mechanics", duration: "4 min", completed: false,
        sections: [{ heading: "Stay On Target", body: "Rebalancing = selling winners and buying losers to maintain target allocation." }],
        quiz: {
          question: "Your target is 60% stocks / 40% bonds. After a bull run, you're at 75% stocks / 25% bonds. What do you do?",
          options: [
            { label: "Buy more stocks — they're winning" },
            { label: "Sell stocks, buy bonds to return to 60/40" },
            { label: "Do nothing — let winners run" },
          ],
          correctIndex: 1,
          explanation: "Rebalancing means selling some of the winners (stocks) and buying the underweight asset (bonds) to return to your target. It's counterintuitive but systematically buys low and sells high.",
        },
      },
      {
        title: "Building a model portfolio", duration: "5 min", completed: false,
        sections: [{ heading: "Example Model", body: "40% US Large Cap, 15% International, 15% Small/Mid, 20% Bonds, 10% Alternatives." }],
        quiz: {
          question: "Your current portfolio is 100% US large-cap tech. Compared to the model portfolio, what's your biggest gap?",
          options: [
            { label: "No international exposure" },
            { label: "No bonds or alternatives" },
            { label: "Both — zero diversification across geography, asset class, and sector" },
          ],
          correctIndex: 2,
          explanation: "Your portfolio lacks geographic diversification (no international), asset class diversification (no bonds/alternatives), AND sector diversification (100% tech). All three gaps compound your concentration risk.",
        },
      },
      {
        title: "Tax-efficient placement", duration: "4 min", completed: false,
        sections: [{ heading: "Account Optimization", body: "TFSA: High-growth stocks (tax-free gains). RRSP: Bonds, dividends (tax-deferred). Taxable: Index funds, tax-loss harvesting." }],
        quiz: {
          question: "Where should you hold high-growth tech stocks for maximum tax efficiency?",
          options: [
            { label: "TFSA — gains are tax-free" },
            { label: "RRSP — gains are tax-deferred" },
            { label: "Taxable account" },
          ],
          correctIndex: 0,
          explanation: "TFSA is ideal for high-growth assets because all gains are completely tax-free. Since tech stocks have high growth potential, maximizing tax-free compounding here gives the biggest long-term advantage.",
        },
      },
    ],
  },
  "long-term-vs-short-term": {
    title: "Long Term vs Short Term",
    description: "Compare time horizons and their impact on returns and taxes.",
    lessons: [
      {
        title: "Time horizon basics", duration: "4 min", completed: false,
        sections: [{ heading: "Know Your Horizon", body: "Short-term (< 1 year): Trading. Medium-term (1-5 years): Balanced. Long-term (5+ years): Buy and hold." }],
        quiz: {
          question: "Your average hold time is 3.2 weeks. Which category does this fall into?",
          options: [
            { label: "Long-term investing" },
            { label: "Short-term trading" },
            { label: "Medium-term balanced" },
          ],
          correctIndex: 1,
          explanation: "3.2 weeks is firmly in short-term trading territory. This approach requires more active management, generates more taxable events, and historically underperforms buy-and-hold for most investors.",
        },
      },
      {
        title: "Capital gains tax impact", duration: "5 min", completed: false,
        sections: [{ heading: "Tax Drag", body: "Short-term gains taxed at income rate (30-50%). Long-term gains get preferential rates (15-20%)." }],
        quiz: {
          question: "You made $10,000 in gains from a stock held for 3 weeks. At a 40% tax rate, how much do you keep?",
          options: [
            { label: "$6,000" },
            { label: "$8,000" },
            { label: "$9,000" },
          ],
          correctIndex: 0,
          explanation: "Short-term gains are taxed at your income rate. $10,000 × 40% = $4,000 in taxes. You keep $6,000. Had you held over a year, you'd pay ~15-20%, keeping $8,000-$8,500.",
        },
      },
      {
        title: "The power of patience", duration: "4 min", completed: false,
        sections: [{ heading: "Historical Odds", body: "S&P 500 held for:\n• 1 year: Positive 73% of the time\n• 10 years: Positive 94%\n• 20 years: Positive 100%" }],
        quiz: {
          question: "Based on historical S&P 500 data, what are the odds of positive returns if you hold for 20 years?",
          context: "The S&P 500 has been tracked since 1926. Through world wars, recessions, pandemics, and financial crises.",
          options: [
            { label: "73%", chartData: [100, 105, 95, 110, 100, 115, 108, 120] },
            { label: "94%", chartData: [100, 102, 108, 115, 125, 140, 155, 175] },
            { label: "100%", chartData: [100, 110, 105, 130, 145, 180, 220, 300] },
          ],
          correctIndex: 2,
          explanation: "In every rolling 20-year period in S&P 500 history, returns have been positive — 100% of the time. Time is the most powerful risk reducer available to investors.",
        },
      },
      {
        title: "When to trade vs when to hold", duration: "5 min", completed: false,
        sections: [{ heading: "Decision Framework", body: "Trade when: Clear thesis, defined entry/exit, appropriate sizing.\nHold when: Fundamentals unchanged, reacting to noise." }],
        quiz: {
          question: "A stock you own drops 8% after a CEO tweet. Quarterly earnings were strong. Revenue growing 15% YoY. What do you do?",
          context: "The CEO posted a controversial personal opinion on social media. The company's products, revenue, and competitive position are unchanged.",
          options: [
            { label: "Sell — CEO is a liability", chartData: [100, 95, 92, 88, 82, 75, 70, 65] },
            { label: "Hold — fundamentals unchanged", chartData: [100, 92, 88, 94, 100, 106, 112, 118] },
            { label: "Panic buy more immediately" },
          ],
          correctIndex: 1,
          explanation: "The fundamentals (revenue, earnings, competitive position) haven't changed. A tweet-driven selloff is market noise. The decision framework says: hold when fundamentals are unchanged and you'd be reacting to noise.",
        },
      },
    ],
  },
};

const courseKeys = Object.keys(allCourses);

const LearnCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courseId ? allCourses[courseId] : null;
  const [activeLesson, setActiveLesson] = useState(0);
  const [quizPassed, setQuizPassed] = useState<Set<number>>(new Set());

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
  const hasQuiz = !!lesson.quiz;
  const quizDone = quizPassed.has(activeLesson) || lesson.completed;
  const canProceed = !hasQuiz || quizDone;

  const handleQuizPass = () => {
    setQuizPassed((prev) => new Set(prev).add(activeLesson));
  };

  const goNext = () => {
    if (activeLesson < course.lessons.length - 1) {
      setActiveLesson(activeLesson + 1);
    } else if (currentCourseIdx < courseKeys.length - 1) {
      navigate(`/learn/${courseKeys[currentCourseIdx + 1]}`);
    }
  };

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
                {l.completed || quizPassed.has(i) ? <CheckCircle2 size={14} className={i === activeLesson ? "text-primary-foreground" : "text-gain"} /> : <Circle size={14} />}
                <span className="flex-1 font-medium">{l.title}</span>
                {l.quiz && <HelpCircle size={10} className="opacity-40" />}
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
                {l.completed || quizPassed.has(i) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
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
              {hasQuiz && (
                <>
                  <span className="text-[11px]">·</span>
                  <HelpCircle size={12} />
                  <span className="text-[11px]">Quiz required</span>
                </>
              )}
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

          {/* Quiz */}
          {hasQuiz && (
            <div className="mt-4">
              {quizDone ? (
                <motion.div className="glass-card flex items-center gap-3 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Trophy size={18} className="text-gain" />
                  <div>
                    <p className="text-sm font-semibold text-gain">Quiz Passed!</p>
                    <p className="text-[11px] text-muted-foreground">You've demonstrated understanding of this concept.</p>
                  </div>
                </motion.div>
              ) : (
                <QuizCard quiz={lesson.quiz!} onPass={handleQuizPass} />
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
              disabled={activeLesson === 0}
              className="glass-card flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all disabled:opacity-30"
            >
              <ArrowLeft size={14} /> Previous
            </button>
            {!canProceed && (
              <p className="text-[11px] text-muted-foreground">Complete the quiz to continue</p>
            )}
            <button
              onClick={goNext}
              disabled={!canProceed || (activeLesson === course.lessons.length - 1 && currentCourseIdx === courseKeys.length - 1)}
              className={`glass-card flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all disabled:opacity-30 ${
                !canProceed ? "cursor-not-allowed" : ""
              }`}
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
