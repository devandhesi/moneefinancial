// ═══════════════════════════════════════════════════════════════
// MONEE MONEY COURSE — Full Curriculum Data
// ═══════════════════════════════════════════════════════════════

export interface QuizOption {
  label: string;
  chartData?: number[];
}

export interface Quiz {
  question: string;
  context?: string;
  options: QuizOption[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  heading: string;
  body: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  sections: LessonSection[];
  quiz?: Quiz;
}

export interface ModuleQuiz {
  title: string;
  questions: Quiz[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  moduleQuiz: ModuleQuiz;
  unitTest: ModuleQuiz;
}

export const curriculum: Module[] = [
  // ─── MODULE 1 ────────────────────────────────────────────────
  {
    id: "money-value-behaviour",
    number: 1,
    title: "Money, Value, and Human Behaviour",
    subtitle: "Understanding what money really is and why we make irrational decisions with it",
    description: "Explore the psychology of money, the history of value exchange, and the cognitive biases that shape every financial decision you make.",
    icon: "Brain",
    color: "hsl(270, 50%, 55%)",
    lessons: [
      {
        id: "m1-l1", title: "What Is Money, Really?", duration: "8 min",
        sections: [
          { heading: "Beyond Notes and Coins", body: "Money is not wealth itself — it's a **claim on future value**. When you hold $100, you're holding a socially agreed-upon token that says: 'I contributed value to society, and I'm storing that contribution for later use.'\n\nThis distinction matters because it changes how you think about earning, saving, and spending. You're not collecting paper — you're accumulating stored labour, creativity, and problem-solving." },
          { heading: "The Three Functions of Money", body: "Every economics textbook defines money by three functions:\n\n**1. Medium of Exchange** — You can trade it for goods and services without needing a 'double coincidence of wants' (both parties wanting what the other has).\n\n**2. Unit of Account** — It provides a common measure to compare the value of different things. Is a haircut worth more than a book? Money lets us answer that.\n\n**3. Store of Value** — It holds purchasing power over time. But this is the most fragile function — inflation erodes it, recessions shake confidence in it, and currency collapses can destroy it entirely." },
          { heading: "A Brief History", body: "Money evolved through stages:\n\n• **Barter** (10,000+ years ago): Direct exchange of goods. Inefficient — what if the baker doesn't need shoes?\n• **Commodity money** (3,000 BC): Gold, silver, shells — scarce items with intrinsic value.\n• **Representative money** (1600s): Paper backed by gold reserves.\n• **Fiat money** (1971–present): Government-issued currency backed by trust and legal decree, not physical assets.\n• **Digital money** (2009–present): Cryptocurrencies, CBDCs, and digital payment systems.\n\nEach transition expanded what was possible but also introduced new risks. Understanding this progression helps you appreciate why money works — and when it doesn't." },
          { heading: "Why This Matters For You", body: "If money is a 'claim on future value,' then every financial decision is really about **time and trust**:\n\n• Saving = trusting that money will hold value over time\n• Investing = trading present money for potentially greater future value\n• Spending = consuming your stored value now instead of later\n• Debt = borrowing against your future stored value\n\nThis framing makes personal finance less abstract and more strategic." },
        ],
        quiz: {
          question: "Which of the following best describes what money fundamentally is?",
          options: [
            { label: "Physical currency printed by governments" },
            { label: "A socially agreed-upon claim on future value" },
            { label: "Digital numbers in a bank account" },
            { label: "Gold and precious metals" },
          ],
          correctIndex: 1,
          explanation: "Money is fundamentally a social agreement — a claim on future value backed by trust. Physical currency, digital balances, and gold are all just different forms this agreement takes.",
        },
      },
      {
        id: "m1-l2", title: "The Psychology of Spending", duration: "10 min",
        sections: [
          { heading: "Your Brain vs Your Wallet", body: "Neuroscience reveals that spending activates the same reward centres as eating chocolate or receiving a compliment. The dopamine hit from purchasing is **immediate and powerful**, while the satisfaction from saving is **delayed and abstract**.\n\nThis isn't a personal failing — it's how human brains evolved. Our ancestors needed to consume resources immediately because storage was unreliable. The problem is that this ancient wiring now operates in a world of Amazon one-click ordering." },
          { heading: "The Pain of Paying", body: "Research by Dan Ariely shows that **the method of payment changes spending behaviour**:\n\n• **Cash**: Highest 'pain of paying' — you physically see money leave\n• **Debit card**: Moderate pain — some awareness of account balance\n• **Credit card**: Lowest pain — the cost is abstract and deferred\n• **Tap/mobile pay**: Almost zero pain — spending becomes frictionless\n\nThis is why people spend 12-18% more with credit cards than cash. The easier spending becomes, the less your brain registers it as a sacrifice." },
          { heading: "Hedonic Adaptation", body: "The **hedonic treadmill** explains why material purchases rarely bring lasting happiness. You buy a new phone and feel excited for 2 weeks. Then it's just your phone.\n\nResearch consistently shows:\n• **Experiences** provide more lasting satisfaction than things\n• **Anticipation** of a purchase often brings more joy than the purchase itself\n• **Social spending** (gifts, meals with friends) correlates more strongly with well-being than solo consumption\n\nKnowing this doesn't mean you should never buy things. It means you should be **intentional** — allocate spending where it creates the most lasting value for you." },
          { heading: "Practical Strategies", body: "**The 24-Hour Rule**: For any non-essential purchase over $50, wait 24 hours. If you still want it, buy it. This eliminates ~40% of impulse purchases.\n\n**The Per-Use Cost**: A $200 jacket worn 100 times = $2/use. A $50 trendy jacket worn 5 times = $10/use. Reframe cost in terms of value-per-use.\n\n**Automate First**: Set up automatic transfers to savings/investments on payday. You can't spend what you never see in your checking account.\n\n**Values-Based Budget**: Instead of restricting spending, align it with your values. Love fitness? Allocate generously there. Don't care about cars? Buy used." },
        ],
        quiz: {
          question: "Why do people typically spend 12-18% more with credit cards than cash?",
          options: [
            { label: "Credit cards offer rewards and cashback" },
            { label: "Credit cards reduce the psychological 'pain of paying'" },
            { label: "Cash is harder to carry around" },
            { label: "Credit cards have higher spending limits" },
          ],
          correctIndex: 1,
          explanation: "Credit cards abstract the cost — you don't physically see money leave. This reduces the brain's 'pain of paying' signal, making spending feel less consequential. The rewards are a bonus, but the psychology is the main driver.",
        },
      },
      {
        id: "m1-l3", title: "Cognitive Biases in Financial Decisions", duration: "12 min",
        sections: [
          { heading: "Your Brain's Shortcuts", body: "Cognitive biases are mental shortcuts that helped our ancestors survive but often lead to poor financial decisions. Understanding them is like debugging your brain's operating system.\n\nYou can't eliminate biases, but you can **recognise them in real-time** and create systems that work around them." },
          { heading: "Loss Aversion", body: "**Definition**: Losses feel roughly 2x as painful as equivalent gains feel good.\n\n**In investing**: You hold losing stocks too long (hoping to break even) and sell winners too early (locking in gains before they evaporate). This is called the **disposition effect**.\n\n**Example**: You bought Stock A at $100. It drops to $70. Rationally, you should ask: 'If I had $70 cash, would I buy this stock today?' Instead, your brain anchors to the $100 purchase price and refuses to 'realise' the loss.\n\n**Counter-strategy**: Set stop-losses before you buy. Remove emotion from exit decisions by automating them." },
          { heading: "Anchoring Bias", body: "**Definition**: Over-relying on the first piece of information you receive.\n\n**In finance**: If a stock was $200 last year and is now $120, it 'feels' cheap — even if the business fundamentals deteriorated and $120 is actually overvalued.\n\n**In negotiation**: The first salary number mentioned dominates the entire negotiation, even if it's arbitrary.\n\n**Counter-strategy**: Always do independent valuation. Ask: 'What is this worth based on fundamentals?' not 'What was the price before?'" },
          { heading: "Confirmation Bias", body: "**Definition**: Seeking information that confirms what you already believe and ignoring contradicting evidence.\n\n**In investing**: You buy Tesla, then only read bullish Tesla articles. You dismiss bearish analysis as 'haters.' Your information diet becomes an echo chamber.\n\n**Counter-strategy**: Actively seek the **best opposing argument** to every investment thesis. If you're bullish, read the strongest bear case. If you can't refute it, your thesis may be weak." },
          { heading: "Herd Mentality & FOMO", body: "**Definition**: Following the crowd because 'everyone else is doing it.'\n\n**In markets**: Crypto mania (2021), meme stocks (GameStop), dot-com bubble (1999). When your Uber driver gives you stock tips, the market is probably overheated.\n\n**The Data**: By the time an investment trend makes mainstream news, 80% of the easy gains are typically gone. Buying at the peak of public excitement is historically one of the worst entries.\n\n**Counter-strategy**: Have a written investment plan. When FOMO strikes, re-read your plan. If the opportunity doesn't fit your strategy, pass — there will always be another one." },
          { heading: "Recency Bias", body: "**Definition**: Overweighting recent events and assuming they'll continue.\n\n**In markets**: After 3 years of bull market, people assume stocks only go up. After a crash, people assume they'll never recover. Both are wrong.\n\n**Historical context**: The S&P 500 has recovered from every crash in history. But in the moment, it never feels that way. The 2008 crash felt like the end of capitalism. The market reached new highs within 5 years." },
        ],
        quiz: {
          question: "You bought a stock at $100 and it's now at $70. You refuse to sell because you 'haven't lost money until you sell.' Which bias is this?",
          options: [
            { label: "Confirmation bias" },
            { label: "Anchoring and loss aversion combined" },
            { label: "Herd mentality" },
            { label: "Recency bias" },
          ],
          correctIndex: 1,
          explanation: "You're anchored to the $100 purchase price (anchoring) and the pain of realising a loss is preventing rational evaluation (loss aversion). The rational question is: 'Would I buy this stock at $70 today?' If not, holding is the same as buying at $70.",
        },
      },
      {
        id: "m1-l4", title: "Inflation and the Time Value of Money", duration: "9 min",
        sections: [
          { heading: "The Silent Wealth Destroyer", body: "Inflation means your money buys less over time. At 3% annual inflation:\n\n• $100 today = $97 purchasing power next year\n• $100 today = $74 purchasing power in 10 years\n• $100 today = $55 purchasing power in 20 years\n\n**Keeping cash 'safe' in a savings account earning 1% while inflation runs at 3% means you're losing 2% of your purchasing power every year.** This is the hidden tax on savers." },
          { heading: "The Time Value of Money", body: "A dollar today is worth more than a dollar tomorrow — not just because of inflation, but because of **opportunity cost**. That dollar could be invested and growing.\n\n**Present Value concept**: If you can earn 8% annually, $108 next year is worth $100 today. They're the same value, just measured at different points in time.\n\nThis is why lottery winners who take the lump sum (and invest wisely) usually end up with more than those who take annual payments." },
          { heading: "Real vs Nominal Returns", body: "**Nominal return**: The raw percentage your investment grew (e.g., 10%)\n**Real return**: Nominal return minus inflation (e.g., 10% - 3% = 7%)\n\nAlways think in real returns. A 10% return sounds great, but if inflation is 8%, your real return is only 2%. In the 1970s, the stock market returned ~6% nominally but **lost purchasing power** because inflation was 7-14%.\n\nAssets that historically beat inflation: stocks, real estate, commodities. Assets that typically lose to inflation: cash, savings accounts, most bonds (without inflation protection)." },
        ],
        quiz: {
          question: "You earn 5% on savings while inflation is 3%. What is your real return?",
          options: [
            { label: "5%" },
            { label: "3%" },
            { label: "2%" },
            { label: "8%" },
          ],
          correctIndex: 2,
          explanation: "Real return = nominal return - inflation = 5% - 3% = 2%. While your account balance grew 5%, prices also rose 3%, so your actual increase in purchasing power is only 2%.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 1 Knowledge Check",
      questions: [
        { question: "What are the three functions of money?", options: [{ label: "Earning, spending, saving" }, { label: "Medium of exchange, unit of account, store of value" }, { label: "Investing, budgeting, borrowing" }, { label: "Trading, lending, storing" }], correctIndex: 1, explanation: "The three classical functions of money are: medium of exchange (facilitates trade), unit of account (measures value), and store of value (preserves purchasing power over time)." },
        { question: "The hedonic treadmill suggests that:", options: [{ label: "Exercise improves financial decisions" }, { label: "Material purchases provide diminishing satisfaction over time" }, { label: "Spending more always increases happiness" }, { label: "Saving is always better than spending" }], correctIndex: 1, explanation: "Hedonic adaptation means we quickly return to a baseline level of happiness after material purchases. The initial excitement fades, and we adapt to the new normal." },
        { question: "Which cognitive bias causes investors to hold losing stocks too long?", options: [{ label: "Confirmation bias" }, { label: "Recency bias" }, { label: "Loss aversion / disposition effect" }, { label: "Anchoring alone" }], correctIndex: 2, explanation: "Loss aversion makes losses feel 2x as painful as gains. The disposition effect — holding losers and selling winners — is a direct consequence of this bias." },
        { question: "At 3% inflation, what is $100 worth in 10 years in today's purchasing power?", options: [{ label: "About $100" }, { label: "About $90" }, { label: "About $74" }, { label: "About $50" }], correctIndex: 2, explanation: "$100 × (0.97)^10 ≈ $74. At 3% annual inflation, you lose about 26% of purchasing power over a decade." },
        { question: "Why is a dollar today worth more than a dollar tomorrow?", options: [{ label: "Inflation only" }, { label: "Opportunity cost — it could be invested and growing" }, { label: "Government policy" }, { label: "Banks charge fees" }], correctIndex: 1, explanation: "The time value of money is primarily about opportunity cost. A dollar today can be invested to earn returns, making it inherently more valuable than a future dollar." },
      ],
    },
    unitTest: {
      title: "Module 1 Unit Test",
      questions: [
        { question: "Fiat money is backed by:", options: [{ label: "Gold reserves" }, { label: "Government trust and legal decree" }, { label: "Physical commodities" }, { label: "International treaties" }], correctIndex: 1, explanation: "Since 1971 (when the gold standard ended), fiat money is backed by government authority and public trust, not physical assets." },
        { question: "The 'pain of paying' is lowest with which payment method?", options: [{ label: "Cash" }, { label: "Debit card" }, { label: "Credit card / tap pay" }, { label: "Bank transfer" }], correctIndex: 2, explanation: "Credit cards and tap-to-pay create the least psychological friction because the cost is abstract and deferred." },
        { question: "What is the disposition effect?", options: [{ label: "Buying high and selling low" }, { label: "Holding losers too long and selling winners too early" }, { label: "Only investing in familiar companies" }, { label: "Following the crowd's investment choices" }], correctIndex: 1, explanation: "The disposition effect is the tendency to sell winning investments prematurely (to 'lock in' gains) while holding losing investments (to avoid 'realising' losses)." },
        { question: "If inflation is 4% and your investment returns 6%, your real return is:", options: [{ label: "6%" }, { label: "4%" }, { label: "2%" }, { label: "10%" }], correctIndex: 2, explanation: "Real return = nominal return - inflation = 6% - 4% = 2%." },
        { question: "Which spending strategy is most effective for reducing impulse purchases?", options: [{ label: "Never carry a credit card" }, { label: "The 24-hour rule for non-essential purchases over $50" }, { label: "Only shop on weekdays" }, { label: "Delete all shopping apps" }], correctIndex: 1, explanation: "The 24-hour rule creates a cooling-off period that eliminates ~40% of impulse purchases by letting the dopamine-driven urge pass." },
        { question: "Confirmation bias in investing means:", options: [{ label: "Confirming trades with your broker" }, { label: "Seeking information that supports your existing beliefs while ignoring contradictions" }, { label: "Getting a second opinion before investing" }, { label: "Verifying stock prices on multiple platforms" }], correctIndex: 1, explanation: "Confirmation bias creates echo chambers where you only consume information that validates your position, leading to blind spots and overconfidence." },
        { question: "Money evolved from barter to fiat currency primarily because:", options: [{ label: "Governments wanted control" }, { label: "Each stage solved efficiency problems of the previous system" }, { label: "Gold became too heavy" }, { label: "Digital technology required it" }], correctIndex: 1, explanation: "Each transition (barter → commodity → representative → fiat → digital) solved specific problems: the double coincidence of wants, portability, scalability, and speed of transactions." },
        { question: "The Rule of 72 helps estimate:", options: [{ label: "Your tax rate" }, { label: "How long it takes money to double at a given return rate" }, { label: "Monthly budget allocation" }, { label: "Credit card interest" }], correctIndex: 1, explanation: "Divide 72 by your annual return rate to estimate doubling time. At 8%: 72÷8 = 9 years to double." },
        { question: "Per-use cost reframing helps you:", options: [{ label: "Get discounts on purchases" }, { label: "Evaluate spending by dividing cost by expected usage" }, { label: "Track daily expenses" }, { label: "Calculate taxes owed" }], correctIndex: 1, explanation: "Per-use cost changes perspective: a $200 jacket worn 100 times ($2/use) is better value than a $50 jacket worn 5 times ($10/use)." },
        { question: "FOMO in investing typically leads to:", options: [{ label: "Well-timed market entries" }, { label: "Buying near peaks after 80% of gains are gone" }, { label: "Portfolio diversification" }, { label: "Lower transaction costs" }], correctIndex: 1, explanation: "By the time an investment trend hits mainstream awareness, most of the easy gains are gone. FOMO-driven entries are historically among the worst timing for investors." },
      ],
    },
  },

  // ─── MODULE 2 ────────────────────────────────────────────────
  {
    id: "income-work-value",
    number: 2,
    title: "Income, Work, and the Production of Value",
    subtitle: "How income is generated, structured, and grown over a career",
    description: "Understand the economics of earning — from salary negotiation to passive income streams and the difference between trading time for money vs building scalable value.",
    icon: "Briefcase",
    color: "hsl(200, 50%, 50%)",
    lessons: [
      {
        id: "m2-l1", title: "Active vs Passive Income", duration: "8 min",
        sections: [
          { heading: "Trading Time vs Building Systems", body: "**Active income** requires your direct, ongoing effort — salary, hourly wages, freelance work. Stop working, and the income stops.\n\n**Passive income** comes from assets or systems that generate revenue with minimal ongoing effort — dividends, rental income, royalties, business systems.\n\nThe critical insight: **wealthy people don't just earn more — they earn differently.** They build or acquire assets that generate income without proportional time investment." },
          { heading: "The Income Spectrum", body: "Income sources exist on a spectrum from fully active to fully passive:\n\n1. **Hourly work** (fully active): Income = hours × rate\n2. **Salaried employment** (mostly active): Fixed income regardless of hours, but still requires presence\n3. **Commission/sales** (semi-active): Income proportional to deals closed\n4. **Freelance/consulting** (semi-active): Higher rates but still time-bound\n5. **Business ownership** (varies): Can become passive if systems are built\n6. **Investment dividends** (mostly passive): Companies pay you for owning shares\n7. **Rental income** (mostly passive): Tenants pay you for property use\n8. **Royalties/licensing** (fully passive): Create once, earn repeatedly" },
          { heading: "Building Your Income Stack", body: "The goal isn't to abandon active income — it's to **build income diversity**.\n\nA robust income stack might look like:\n• Primary salary: $60,000/year (active)\n• Dividend portfolio: $2,400/year (passive)\n• Side project: $6,000/year (semi-passive)\n\nEven small passive income streams compound over time. $200/month in dividends reinvested at 8% becomes $36,589 in 10 years." },
        ],
        quiz: {
          question: "Which of these is the best example of passive income?",
          options: [{ label: "Overtime pay from your employer" }, { label: "Dividend payments from stocks you own" }, { label: "Freelance design work on weekends" }, { label: "A year-end performance bonus" }],
          correctIndex: 1,
          explanation: "Dividends are paid simply for owning shares — no additional time or effort required. Overtime, freelance work, and bonuses all require active effort to earn.",
        },
      },
      {
        id: "m2-l2", title: "Human Capital and Career Economics", duration: "10 min",
        sections: [
          { heading: "You Are an Asset", body: "Your **human capital** — your skills, knowledge, experience, and earning potential — is your largest financial asset, especially early in your career.\n\nA 25-year-old earning $50,000/year with 40 years of work ahead has roughly $2 million in human capital (present value at a discount rate). Investing in yourself — education, skills, health — increases this asset's value." },
          { heading: "Salary Negotiation Economics", body: "The difference between negotiating and not negotiating your starting salary can be **$500,000+ over a career**.\n\nIf you accept $50,000 instead of negotiating to $55,000:\n• Year 1 difference: $5,000\n• After 10 years (with 3% annual raises): $67,196 cumulative difference\n• After 30 years: $237,313 cumulative difference\n• If invested at 8%: $500,000+ difference\n\n**Key tactics**:\n1. Research market rates (Glassdoor, Levels.fyi)\n2. Let the employer state the first number\n3. Negotiate total compensation, not just base salary\n4. Practice saying the number out loud before the conversation" },
          { heading: "The Skill Premium", body: "Earnings follow a power law: **a small increase in rare, valuable skills creates a disproportionate increase in income.**\n\nGeneric skills (data entry, basic admin) are abundant → low wages.\nSpecialised skills (machine learning, corporate law, surgery) are scarce → high wages.\n\nThe most valuable career move is often not working harder but **strategically acquiring skills at the intersection of scarcity and demand**." },
        ],
        quiz: {
          question: "Not negotiating a $5,000 salary difference can cost you over a 30-year career approximately:",
          options: [{ label: "$5,000" }, { label: "$50,000" }, { label: "$150,000" }, { label: "$500,000+ (including investment returns)" }],
          correctIndex: 3,
          explanation: "The $5,000 annual gap compounds through raises (3%/year) and if invested (8% returns), the total opportunity cost exceeds $500,000 over a 30-year career.",
        },
      },
      {
        id: "m2-l3", title: "The Economics of Side Income", duration: "8 min",
        sections: [
          { heading: "Why Side Income Accelerates Wealth", body: "Side income is powerful not because of the amount, but because **100% of it can go toward wealth-building** (your primary income covers living expenses).\n\nEven $500/month extra, fully invested at 8%, becomes:\n• 5 years: $36,738\n• 10 years: $91,473\n• 20 years: $294,510\n\nThis is pure acceleration money — it doesn't need to cover rent, food, or bills." },
          { heading: "Scalable vs Non-Scalable Side Work", body: "**Non-scalable**: Income capped by time (tutoring, dog walking, food delivery). Useful for quick cash but limited.\n\n**Scalable**: Income grows without proportional time increase:\n• Digital products (courses, templates, apps)\n• Content creation (YouTube, podcasts, blogs)\n• Affiliate marketing and referral programs\n• Small e-commerce businesses\n\nThe transition from non-scalable to scalable side income is where real financial acceleration begins." },
        ],
        quiz: {
          question: "$500/month of side income fully invested at 8% for 20 years becomes approximately:",
          options: [{ label: "$120,000" }, { label: "$200,000" }, { label: "$295,000" }, { label: "$500,000" }],
          correctIndex: 2,
          explanation: "$500/month × 240 months = $120,000 contributed. With 8% compound returns, the total grows to approximately $294,510. More than half the final value came from compounding — that's the power of investing side income.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 2 Knowledge Check",
      questions: [
        { question: "What makes passive income different from active income?", options: [{ label: "It pays more" }, { label: "It requires less ongoing time and effort to maintain" }, { label: "It's tax-free" }, { label: "It comes from investments only" }], correctIndex: 1, explanation: "Passive income generates revenue with minimal ongoing effort. It can come from investments, rental properties, royalties, or automated businesses." },
        { question: "Human capital is best described as:", options: [{ label: "Your savings account balance" }, { label: "Your skills, knowledge, and future earning potential" }, { label: "Your social media following" }, { label: "Your physical possessions" }], correctIndex: 1, explanation: "Human capital encompasses all your productive capabilities — education, skills, experience, health — that determine your earning potential." },
        { question: "Why is side income especially powerful for wealth building?", options: [{ label: "It's taxed at a lower rate" }, { label: "100% of it can go toward investing since primary income covers expenses" }, { label: "Side jobs always pay more per hour" }, { label: "Employers value it in promotions" }], correctIndex: 1, explanation: "Since your primary income covers living costs, side income is pure surplus that can be fully allocated to savings and investments." },
        { question: "Which income type is most scalable?", options: [{ label: "Hourly tutoring" }, { label: "Salaried employment" }, { label: "Digital product sales" }, { label: "Overtime work" }], correctIndex: 2, explanation: "Digital products can be created once and sold unlimited times without proportional time investment, making them highly scalable." },
        { question: "The 'skill premium' means:", options: [{ label: "Skilled workers get bonuses" }, { label: "Rare, valuable skills command disproportionately higher income" }, { label: "All skills are equally valued" }, { label: "Education guarantees high income" }], correctIndex: 1, explanation: "Income follows a power law — a small increase in rare, high-demand skills creates a much larger increase in earning potential." },
      ],
    },
    unitTest: {
      title: "Module 2 Unit Test",
      questions: [
        { question: "On the income spectrum, which is most passive?", options: [{ label: "Freelance consulting" }, { label: "Dividend income" }, { label: "Hourly work" }, { label: "Commission sales" }], correctIndex: 1, explanation: "Dividends require no ongoing effort — you earn them simply by owning shares in dividend-paying companies." },
        { question: "A 25-year-old's human capital is roughly equivalent to:", options: [{ label: "$100,000" }, { label: "$500,000" }, { label: "$2,000,000+" }, { label: "Cannot be estimated" }], correctIndex: 2, explanation: "Present value of 40 years of earning at $50,000/year (with growth and discounting) is approximately $2 million — your largest early-career asset." },
        { question: "Which negotiation tactic is most effective?", options: [{ label: "Accept the first offer quickly" }, { label: "Name your salary expectation first" }, { label: "Let the employer state the first number and negotiate total compensation" }, { label: "Focus only on base salary" }], correctIndex: 2, explanation: "Letting them anchor first gives you information. Negotiating total compensation (salary + bonus + equity + benefits) maximizes your package." },
        { question: "Scalable side income differs from non-scalable because:", options: [{ label: "It pays more per hour" }, { label: "Revenue grows without proportional time increase" }, { label: "It requires less initial effort" }, { label: "It's always online" }], correctIndex: 1, explanation: "Scalable income (digital products, content, SaaS) can serve more customers without requiring proportionally more of your time." },
        { question: "$500/month invested for 10 years at 8% grows to ~$91,000. How much was contributed vs earned through compounding?", options: [{ label: "$60,000 contributed, $31,000 from growth" }, { label: "$91,000 all contributed" }, { label: "$45,000 each" }, { label: "$30,000 contributed, $61,000 from growth" }], correctIndex: 0, explanation: "$500 × 120 months = $60,000 contributed. The remaining ~$31,000 came from compound growth — free money from being patient." },
        { question: "What's the most valuable career investment for income growth?", options: [{ label: "Working longer hours" }, { label: "Acquiring rare, in-demand skills" }, { label: "Staying at one company forever" }, { label: "Having more job titles" }], correctIndex: 1, explanation: "Skills at the intersection of scarcity and demand create the largest income jumps, often more than seniority or loyalty alone." },
        { question: "An 'income stack' refers to:", options: [{ label: "Multiple credit cards" }, { label: "Diversified income streams across the active-passive spectrum" }, { label: "Stacking overtime shifts" }, { label: "A savings hierarchy" }], correctIndex: 1, explanation: "An income stack combines multiple sources (salary, dividends, side projects) to create resilience and accelerate wealth building." },
        { question: "Why should human capital investment be prioritised early in a career?", options: [{ label: "Education is cheaper when you're young" }, { label: "You have more years to earn returns on skill investments" }, { label: "Employers prefer young graduates" }, { label: "Student loans have lower rates" }], correctIndex: 1, explanation: "Like compound interest, skill investments have more time to generate returns when made early. A skill acquired at 25 pays off for 40 years; at 55, only for 10." },
        { question: "Which is NOT a form of passive income?", options: [{ label: "Rental income from property" }, { label: "Freelance graphic design work" }, { label: "Book royalties" }, { label: "Stock dividends" }], correctIndex: 1, explanation: "Freelance work is active income — you trade time and effort for each payment. Rental income, royalties, and dividends continue regardless of your daily effort." },
        { question: "The primary reason to negotiate salary is:", options: [{ label: "To impress your employer" }, { label: "The compounding effect of a higher base over decades" }, { label: "To test the employer's flexibility" }, { label: "To get a signing bonus" }], correctIndex: 1, explanation: "A higher starting salary compounds through annual raises, bonus percentages, and investment of the difference — creating $500,000+ in long-term value." },
      ],
    },
  },

  // ─── MODULE 3 ────────────────────────────────────────────────
  {
    id: "budgeting-saving-cashflow",
    number: 3,
    title: "Budgeting, Saving, and Personal Cash Flow Systems",
    subtitle: "Building the operational infrastructure of personal finance",
    description: "Design cash flow systems that work on autopilot — budgeting frameworks, savings strategies, emergency funds, and the psychology of financial discipline.",
    icon: "Wallet",
    color: "hsl(150, 45%, 45%)",
    lessons: [
      {
        id: "m3-l1", title: "Cash Flow: The Foundation of Everything", duration: "9 min",
        sections: [
          { heading: "Income - Expenses = Your Financial Trajectory", body: "Personal finance is fundamentally simple: **money in minus money out determines your trajectory.** Positive cash flow builds wealth. Negative cash flow builds debt.\n\nBut most people don't actually know their numbers. A 2023 survey found that 65% of Americans don't know how much they spent last month. You can't manage what you don't measure." },
          { heading: "Tracking Without Obsessing", body: "You don't need to track every penny forever. Instead, do a **30-day audit**:\n\n1. Download 3 months of bank/credit card statements\n2. Categorise spending into: Housing, Transport, Food, Subscriptions, Entertainment, Savings, Other\n3. Calculate percentages of net income for each\n4. Identify the 2-3 biggest surprise categories\n\nMost people find 10-20% of their spending goes to things they barely value — subscriptions they forgot, convenience purchases they could eliminate, lifestyle inflation they didn't notice." },
          { heading: "The 50/30/20 Framework", body: "A simple starting framework:\n\n• **50% Needs**: Housing, utilities, groceries, insurance, minimum debt payments\n• **30% Wants**: Dining, entertainment, shopping, hobbies, travel\n• **20% Savings/Investing**: Emergency fund, retirement, investments, extra debt payments\n\nThis isn't rigid — adjust based on your situation. High-income earners might do 40/20/40. Those with debt might do 50/20/30 (extra to debt). The point is having a **conscious allocation** rather than spending randomly." },
        ],
        quiz: {
          question: "According to the 50/30/20 framework, what percentage should go to savings and investing?",
          options: [{ label: "10%" }, { label: "20%" }, { label: "30%" }, { label: "50%" }],
          correctIndex: 1,
          explanation: "The 50/30/20 rule allocates 20% to savings and investing. This covers emergency funds, retirement contributions, and investment accounts.",
        },
      },
      {
        id: "m3-l2", title: "The Emergency Fund: Your Financial Shock Absorber", duration: "7 min",
        sections: [
          { heading: "Why 3-6 Months", body: "An emergency fund prevents a **financial setback from becoming a financial crisis**.\n\nWithout one, a $1,000 car repair goes on a credit card at 22% APR. With one, it's an inconvenience, not a catastrophe.\n\n**Target**: 3-6 months of essential expenses (not income).\n• 3 months: Dual income, stable job, no dependents\n• 6 months: Single income, variable income, dependents\n• 9-12 months: Self-employed, commission-based, high-risk industry" },
          { heading: "Where to Keep It", body: "Your emergency fund should be:\n• **Liquid**: Accessible within 1-2 business days\n• **Safe**: Not subject to market fluctuations\n• **Earning something**: High-yield savings account (4-5% in current rates)\n\n**NOT** in the stock market (too volatile), under your mattress (loses to inflation), or in a CD (too illiquid)." },
          { heading: "Building It Systematically", body: "Start with a micro-goal: **$1,000 starter emergency fund.** This covers most common emergencies.\n\nThen automate: Set up a recurring transfer on payday. Even $100/month reaches $1,200 in a year.\n\nOnce you hit 3 months of expenses, **redirect that automatic transfer to investments.** The emergency fund is a stepping stone, not the destination." },
        ],
        quiz: {
          question: "Where is the best place to keep your emergency fund?",
          options: [{ label: "Stock market index fund" }, { label: "High-yield savings account" }, { label: "Under your mattress" }, { label: "Certificate of deposit (CD)" }],
          correctIndex: 1,
          explanation: "A high-yield savings account provides liquidity (quick access), safety (FDIC insured), and a reasonable return (4-5%). Stocks are too volatile, cash loses to inflation, and CDs are too illiquid for emergencies.",
        },
      },
      {
        id: "m3-l3", title: "Automating Your Financial Life", duration: "8 min",
        sections: [
          { heading: "The Automation Principle", body: "**The best financial system is one that works without willpower.** Willpower is a depletable resource — relying on it for financial discipline is like relying on motivation for exercise. It works sometimes, but not consistently.\n\nInstead, build systems where the default action is the right action." },
          { heading: "The Payday Waterfall", body: "Set up this cascade of automatic transfers on payday:\n\n1. **Paycheck arrives** in checking account\n2. **Auto-transfer 20%** to savings/investment accounts\n3. **Auto-pay bills** (rent, utilities, insurance, subscriptions)\n4. **Remaining balance** = guilt-free spending money\n\nYou never have to decide whether to save because it happens before you can spend. You never miss a bill because it's automated. And everything left over is truly available for wants." },
          { heading: "Account Architecture", body: "Optimal account structure:\n\n• **Checking Account**: Daily spending + bill pay hub\n• **High-Yield Savings #1**: Emergency fund (3-6 months)\n• **High-Yield Savings #2**: Short-term goals (vacation, car, etc.)\n• **Investment Account**: Long-term wealth building (auto-contribute)\n• **Retirement Account**: Tax-advantaged growth (employer match first)\n\nSeparating accounts provides **mental accounting** — you can see exactly what's available for spending vs saving vs investing." },
        ],
        quiz: {
          question: "What's the key advantage of automating finances on payday?",
          options: [{ label: "It saves time on paperwork" }, { label: "It removes the need for willpower — saving happens before spending" }, { label: "Banks offer better interest rates for automated transfers" }, { label: "It helps you earn more income" }],
          correctIndex: 1,
          explanation: "Automation makes the right financial behaviour the default. You save before you can spend, eliminating the daily decision (and temptation) of whether to save or spend.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 3 Knowledge Check",
      questions: [
        { question: "What percentage of Americans don't know how much they spent last month?", options: [{ label: "25%" }, { label: "45%" }, { label: "65%" }, { label: "85%" }], correctIndex: 2, explanation: "65% — most people don't track spending, which makes it impossible to optimise finances. A 30-day audit is the essential first step." },
        { question: "The emergency fund should cover:", options: [{ label: "1 month of income" }, { label: "3-6 months of essential expenses" }, { label: "12 months of total spending" }, { label: "Your annual salary" }], correctIndex: 1, explanation: "3-6 months of essential expenses (not income) provides adequate protection. Adjust higher for variable income or dependents." },
        { question: "In the Payday Waterfall system, what happens first?", options: [{ label: "Pay bills" }, { label: "Spend on wants" }, { label: "Auto-transfer to savings/investments" }, { label: "Review last month's spending" }], correctIndex: 2, explanation: "Pay yourself first — auto-transfer savings before anything else. This ensures saving happens regardless of spending impulses." },
        { question: "The 50/30/20 rule is:", options: [{ label: "A rigid requirement" }, { label: "A flexible starting framework for budget allocation" }, { label: "Only for high earners" }, { label: "A debt repayment strategy" }], correctIndex: 1, explanation: "50/30/20 is a starting framework — adjust percentages based on your income, debts, and goals. The key is conscious allocation." },
        { question: "Why should the emergency fund NOT be in stocks?", options: [{ label: "Stocks never grow" }, { label: "Market volatility could reduce it right when you need it" }, { label: "It's illegal" }, { label: "Banks won't allow it" }], correctIndex: 1, explanation: "Stocks can drop 30%+ in a crash — exactly when job loss (and emergency fund needs) are most likely. The fund needs stability above all." },
      ],
    },
    unitTest: {
      title: "Module 3 Unit Test",
      questions: [
        { question: "Personal cash flow is defined as:", options: [{ label: "Your total salary" }, { label: "Income minus expenses" }, { label: "Your net worth" }, { label: "Investment returns" }], correctIndex: 1, explanation: "Cash flow = money in - money out. Positive cash flow enables saving and investing; negative cash flow creates debt." },
        { question: "A 30-day spending audit typically reveals:", options: [{ label: "You're spending exactly right" }, { label: "10-20% of spending goes to barely-valued items" }, { label: "You need to earn more" }, { label: "All spending is necessary" }], correctIndex: 1, explanation: "Most people discover forgotten subscriptions, convenience purchases, and lifestyle inflation totaling 10-20% of spending." },
        { question: "For a single-income household with dependents, the recommended emergency fund is:", options: [{ label: "1 month" }, { label: "3 months" }, { label: "6 months" }, { label: "12 months" }], correctIndex: 2, explanation: "Single income + dependents = higher risk. 6 months of essential expenses provides adequate buffer for job loss scenarios." },
        { question: "The first micro-goal for an emergency fund should be:", options: [{ label: "$100" }, { label: "$500" }, { label: "$1,000" }, { label: "$5,000" }], correctIndex: 2, explanation: "$1,000 covers most common emergencies (car repair, medical copay) and provides an immediate safety net while building toward the full fund." },
        { question: "Mental accounting through separate accounts helps because:", options: [{ label: "Banks require multiple accounts" }, { label: "It provides clear visibility of what's available for each purpose" }, { label: "It earns more interest" }, { label: "It reduces taxes" }], correctIndex: 1, explanation: "Separate accounts create psychological guardrails — you can see spending money vs savings vs investments clearly, reducing temptation." },
        { question: "Lifestyle inflation is:", options: [{ label: "Price increases due to economy" }, { label: "Increasing spending as income grows, preventing wealth building" }, { label: "Inflation-adjusted returns" }, { label: "Cost of living adjustments" }], correctIndex: 1, explanation: "Lifestyle inflation means spending more as you earn more — bigger car, nicer apartment. It's the #1 reason high earners can still have low wealth." },
        { question: "After building a full emergency fund, the automatic transfer should:", options: [{ label: "Stop entirely" }, { label: "Redirect to investments" }, { label: "Increase spending" }, { label: "Go to a second emergency fund" }], correctIndex: 1, explanation: "Once the emergency fund is full, redirect that automated savings to investment accounts — you already have the habit; now apply it to wealth building." },
        { question: "Which is the WORST option for an emergency fund?", options: [{ label: "High-yield savings at 4.5%" }, { label: "Money market account" }, { label: "Cryptocurrency" }, { label: "No-penalty CD" }], correctIndex: 2, explanation: "Cryptocurrency is volatile, illiquid during crashes, and can lose 50%+ in weeks — the opposite of what an emergency fund needs." },
        { question: "The Payday Waterfall works because:", options: [{ label: "It maximizes income" }, { label: "It makes the right financial action the default, removing willpower" }, { label: "It's required by employers" }, { label: "It reduces taxes" }], correctIndex: 1, explanation: "Automation ensures saving/investing happens first, making good financial behaviour the default rather than requiring daily discipline." },
        { question: "If you earn $5,000/month, the 50/30/20 rule suggests investing:", options: [{ label: "$500" }, { label: "$1,000" }, { label: "$1,500" }, { label: "$2,500" }], correctIndex: 1, explanation: "20% of $5,000 = $1,000/month allocated to savings and investments under the 50/30/20 framework." },
      ],
    },
  },

  // ─── MODULE 4 ────────────────────────────────────────────────
  {
    id: "debt-credit-borrowing",
    number: 4,
    title: "Debt, Credit, and the Economics of Borrowing",
    subtitle: "Understanding leverage, interest, and the strategic use of debt",
    description: "Master the mechanics of debt — from credit scores and interest calculations to strategic borrowing and the difference between debt that builds wealth and debt that destroys it.",
    icon: "CreditCard",
    color: "hsl(0, 55%, 50%)",
    lessons: [
      {
        id: "m4-l1", title: "How Interest Really Works", duration: "10 min",
        sections: [
          { heading: "Simple vs Compound Interest on Debt", body: "When you're the borrower, compound interest works **against** you:\n\n**Simple interest**: Interest calculated only on the original principal.\nA $10,000 loan at 5% simple interest for 3 years = $10,000 + ($500 × 3) = $11,500\n\n**Compound interest**: Interest calculated on principal + accumulated interest.\nThe same $10,000 at 5% compounded annually for 3 years = $11,576\n\nThe difference grows dramatically with higher rates and longer terms. Credit cards at 22% compound **daily** — this is why minimum payments barely touch the principal." },
          { heading: "APR vs APY", body: "**APR (Annual Percentage Rate)**: The stated rate without compounding. Used for loans and credit cards.\n\n**APY (Annual Percentage Yield)**: The effective rate including compounding. Used for savings accounts.\n\nA credit card with 22% APR compounded daily has an effective APY of ~24.6%. Banks advertise APR on loans (looks lower) and APY on savings (looks higher). Know the difference." },
          { heading: "The Minimum Payment Trap", body: "A $5,000 credit card balance at 22% APR:\n\n• **Minimum payments only (~$100/month)**: 9 years to pay off, $6,432 in interest. You pay $11,432 for a $5,000 balance.\n• **$200/month**: 2.5 years, $1,573 in interest.\n• **$500/month**: 11 months, $497 in interest.\n\nThe difference between $100 and $200/month saves you **$4,859 and 6.5 years**. Minimums are designed to maximise interest revenue for banks." },
        ],
        quiz: {
          question: "A $5,000 credit card at 22% APR with minimum payments costs approximately how much in total?",
          options: [{ label: "$5,500" }, { label: "$7,500" }, { label: "$11,432" }, { label: "$15,000" }],
          correctIndex: 2,
          explanation: "Minimum payments stretch the debt over 9 years, accumulating $6,432 in interest. Total paid: $11,432 — more than double the original balance.",
        },
      },
      {
        id: "m4-l2", title: "Credit Scores Decoded", duration: "8 min",
        sections: [
          { heading: "What Your Score Actually Measures", body: "Credit scores (300-850) measure **how reliable you are at repaying borrowed money**:\n\n• **Payment history (35%)**: Do you pay on time? Even one 30-day late payment can drop your score 60-100 points.\n• **Credit utilisation (30%)**: What % of available credit are you using? Below 30% is good; below 10% is excellent.\n• **Length of history (15%)**: How long have your accounts been open? Longer = better.\n• **Credit mix (10%)**: Variety of credit types (cards, loans, mortgage).\n• **New credit (10%)**: Recent applications. Each hard inquiry dings 5-10 points temporarily." },
          { heading: "Strategic Score Building", body: "**Starting from scratch**:\n1. Get a secured credit card (deposit = credit limit)\n2. Use it for one small recurring payment (e.g., Netflix)\n3. Set up autopay for full balance monthly\n4. After 6-12 months, apply for an unsecured card\n\n**Optimising an existing score**:\n1. Never miss a payment (automate everything)\n2. Keep utilisation below 30% (request limit increases)\n3. Don't close old accounts (preserves history length)\n4. Limit new applications to 1-2 per year" },
        ],
        quiz: {
          question: "Which factor has the LARGEST impact on your credit score?",
          options: [{ label: "Length of credit history (15%)" }, { label: "Payment history (35%)" }, { label: "Credit mix (10%)" }, { label: "New credit inquiries (10%)" }],
          correctIndex: 1,
          explanation: "Payment history accounts for 35% of your credit score — the single largest factor. Even one missed payment can significantly damage your score.",
        },
      },
      {
        id: "m4-l3", title: "Good Debt vs Bad Debt", duration: "9 min",
        sections: [
          { heading: "The Framework", body: "Not all debt is equal. The key question: **Does this debt help acquire something that will be worth more than the interest cost?**\n\n**Good debt** (strategic leverage):\n• Mortgage (3-7% interest on an appreciating asset)\n• Student loans for high-ROI degrees (engineering, CS, medicine)\n• Business loans that generate income exceeding interest costs\n\n**Bad debt** (value destruction):\n• Credit card debt for consumption (22% APR on depreciating purchases)\n• Auto loans for luxury cars (5-8% interest on a depreciating asset)\n• Payday loans (400%+ APR — financial predation)" },
          { heading: "The Debt Payoff Strategies", body: "**Avalanche Method** (mathematically optimal):\nPay minimums on all debts, put extra money toward the **highest interest rate** first.\nSaves the most money overall.\n\n**Snowball Method** (psychologically powerful):\nPay minimums on all debts, put extra money toward the **smallest balance** first.\nCreates quick wins and motivation.\n\n**Which to use?** Research shows the snowball method has higher completion rates because humans need wins. But if you're disciplined, avalanche saves more money. Pick the one you'll actually stick with." },
          { heading: "When to Use Leverage", body: "Strategic debt usage (for advanced readers):\n\n• **Mortgage**: Leveraging $50K down payment to control $300K of appreciating real estate. If the property rises 5%, you gain $15,000 on a $50K investment = 30% return.\n\n• **Margin investing**: Borrowing against portfolio to invest more. Amplifies gains AND losses. Only for experienced investors with high risk tolerance.\n\n**Golden rule**: Never leverage consumer purchases. Only leverage assets with expected returns exceeding the interest cost." },
        ],
        quiz: {
          question: "Which debt payoff strategy has the highest completion rate according to research?",
          options: [{ label: "Avalanche (highest interest first)" }, { label: "Snowball (smallest balance first)" }, { label: "Paying all debts equally" }, { label: "Consolidation loans only" }],
          correctIndex: 1,
          explanation: "The snowball method has higher completion rates because paying off small debts quickly creates psychological momentum and motivation to continue.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 4 Knowledge Check",
      questions: [
        { question: "APR vs APY: Which does a bank use to make loans look cheaper?", options: [{ label: "APY" }, { label: "APR" }, { label: "Both are the same" }, { label: "Neither" }], correctIndex: 1, explanation: "APR doesn't include compounding, so it looks lower. Banks advertise APR on loans and APY on savings to make both products look more attractive." },
        { question: "Doubling minimum payments on a $5,000 credit card saves approximately:", options: [{ label: "$500" }, { label: "$2,000" }, { label: "$4,859" }, { label: "$6,000" }], correctIndex: 2, explanation: "Going from ~$100 to ~$200/month cuts interest from $6,432 to $1,573 — saving $4,859 and 6.5 years." },
        { question: "Which is the most important credit score factor?", options: [{ label: "Credit utilisation" }, { label: "Payment history" }, { label: "Account age" }, { label: "Credit mix" }], correctIndex: 1, explanation: "Payment history (35%) is the single largest factor. Never missing a payment is the most impactful thing you can do for your score." },
        { question: "A payday loan's typical APR is:", options: [{ label: "22%" }, { label: "50%" }, { label: "100%" }, { label: "400%+" }], correctIndex: 3, explanation: "Payday loans charge fees equivalent to 400%+ APR — financial predation that traps borrowers in cycles of debt." },
        { question: "The key test for whether debt is 'good' is:", options: [{ label: "Whether the interest rate is below 10%" }, { label: "Whether it finances something that will be worth more than the interest cost" }, { label: "Whether a bank approved it" }, { label: "Whether you can make minimum payments" }], correctIndex: 1, explanation: "Good debt acquires assets or opportunities that generate value exceeding the interest cost. Bad debt finances consumption of depreciating items." },
      ],
    },
    unitTest: {
      title: "Module 4 Unit Test",
      questions: [
        { question: "Compound interest on debt works against you because:", options: [{ label: "Banks charge higher rates" }, { label: "You pay interest on accumulated interest, not just the original amount" }, { label: "It's calculated monthly" }, { label: "It reduces your credit score" }], correctIndex: 1, explanation: "Compound interest means interest accumulates on the principal PLUS previously accrued interest, accelerating the total owed." },
        { question: "Credit utilisation below what percentage is considered excellent?", options: [{ label: "50%" }, { label: "30%" }, { label: "10%" }, { label: "0%" }], correctIndex: 2, explanation: "Below 10% utilisation is excellent. Below 30% is good. Above 30% starts negatively impacting your score." },
        { question: "The avalanche method prioritises:", options: [{ label: "Smallest balance first" }, { label: "Highest interest rate first" }, { label: "Oldest debt first" }, { label: "Largest balance first" }], correctIndex: 1, explanation: "Avalanche attacks the highest interest rate debt first, minimising total interest paid over the payoff period." },
        { question: "A mortgage is typically 'good debt' because:", options: [{ label: "Interest rates are low" }, { label: "It finances an appreciating asset with leverage" }, { label: "Everyone has one" }, { label: "Banks prefer mortgage customers" }], correctIndex: 1, explanation: "Mortgages use relatively cheap debt to control appreciating real estate, creating leverage that amplifies returns." },
        { question: "Closing old credit card accounts:", options: [{ label: "Improves your score" }, { label: "Hurts your score by reducing history length and increasing utilisation" }, { label: "Has no effect" }, { label: "Is required after paying off debt" }], correctIndex: 1, explanation: "Closing old accounts shortens your credit history (15% of score) and reduces total available credit (increasing utilisation ratio)." },
        { question: "A secured credit card requires:", options: [{ label: "A co-signer" }, { label: "A cash deposit equal to the credit limit" }, { label: "Good credit history" }, { label: "Full-time employment" }], correctIndex: 1, explanation: "Secured cards use a cash deposit as collateral, making them accessible for credit building without existing credit history." },
        { question: "Why do credit cards compound daily instead of monthly?", options: [{ label: "It's required by law" }, { label: "It generates more interest revenue for the issuer" }, { label: "It benefits cardholders" }, { label: "It simplifies calculations" }], correctIndex: 1, explanation: "Daily compounding generates more total interest than monthly, increasing the effective APY above the stated APR — more revenue for the card issuer." },
        { question: "Leverage in real estate means:", options: [{ label: "Paying all cash for property" }, { label: "Using a small down payment to control a larger asset" }, { label: "Renting instead of buying" }, { label: "Investing in REITs" }], correctIndex: 1, explanation: "Leverage uses borrowed money (mortgage) to control an asset worth more than your cash investment, amplifying returns (and risks)." },
        { question: "The snowball method works psychologically because:", options: [{ label: "It saves the most money" }, { label: "Quick wins from paying off small debts build motivation" }, { label: "Banks recommend it" }, { label: "It improves your credit score faster" }], correctIndex: 1, explanation: "Paying off small balances quickly creates a sense of progress and momentum, increasing the likelihood of completing the full debt payoff." },
        { question: "If you can only afford minimum payments, you should:", options: [{ label: "Accept the timeline" }, { label: "Seek lower interest options (balance transfer, consolidation) and increase income" }, { label: "Stop paying and negotiate" }, { label: "Take out more credit to pay it off" }], correctIndex: 1, explanation: "Minimums maximize interest paid. Actively seek lower rates (balance transfers at 0% intro APR) and increase payments through additional income." },
      ],
    },
  },

  // ─── MODULES 5-8 (structure with rich content) ──────────────
  {
    id: "investment-portfolio",
    number: 5,
    title: "Investment Theory and Portfolio Construction",
    subtitle: "Building and managing a diversified investment portfolio",
    description: "From efficient markets to modern portfolio theory — understand the principles behind professional investing and how to construct a portfolio aligned with your goals.",
    icon: "TrendingUp",
    color: "hsl(152, 45%, 42%)",
    lessons: [
      {
        id: "m5-l1", title: "Risk, Return, and the Efficient Frontier", duration: "11 min",
        sections: [
          { heading: "The Fundamental Tradeoff", body: "Every investment decision involves a tradeoff between risk and expected return. **Higher potential returns require accepting higher risk.** There is no free lunch.\n\nBut here's the insight that earned Harry Markowitz a Nobel Prize: by combining assets that don't move in lockstep (low correlation), you can achieve **better returns for a given level of risk** than any single asset alone." },
          { heading: "The Efficient Frontier", body: "The **efficient frontier** is a curve showing the maximum expected return for each level of risk. Portfolios ON the frontier are optimally diversified — you can't improve returns without adding risk.\n\nPortfolios BELOW the frontier are inefficient — you're taking risk without being compensated for it. This usually means:\n• Too concentrated in a single sector\n• Holding correlated assets that don't diversify\n• Paying high fees that drag returns" },
          { heading: "Systematic vs Unsystematic Risk", body: "**Systematic risk** (market risk): Affects all investments — recessions, interest rates, geopolitical events. Cannot be diversified away.\n\n**Unsystematic risk** (company-specific risk): Affects individual companies — bad management, product failures, lawsuits. CAN be diversified away by holding many stocks.\n\nWith 25-30 uncorrelated stocks, you eliminate ~95% of unsystematic risk. This is why index funds are so powerful — instant diversification across hundreds of companies." },
        ],
        quiz: {
          question: "How many uncorrelated stocks are needed to eliminate ~95% of company-specific risk?",
          options: [{ label: "5-10" }, { label: "25-30" }, { label: "100-200" }, { label: "500+" }],
          correctIndex: 1,
          explanation: "Research shows 25-30 uncorrelated stocks eliminates approximately 95% of unsystematic (company-specific) risk, leaving only market-wide systematic risk.",
        },
      },
      {
        id: "m5-l2", title: "Asset Classes and Correlation", duration: "9 min",
        sections: [
          { heading: "Major Asset Classes", body: "**Equities (Stocks)**: Ownership in companies. Highest long-term returns (~10% historically), highest volatility.\n\n**Fixed Income (Bonds)**: Loans to governments/corporations. Lower returns (~4-6%), lower volatility, often move opposite to stocks.\n\n**Real Estate**: Physical property or REITs. Moderate returns, inflation hedge, income-producing.\n\n**Commodities**: Gold, oil, agricultural products. Inflation hedge, low correlation to stocks/bonds.\n\n**Cash/Money Market**: Lowest return, highest liquidity, risk-free." },
          { heading: "Correlation Matters More Than Returns", body: "The magic of diversification comes from **correlation** — how assets move relative to each other.\n\n• Correlation of +1: Move in perfect lockstep (no diversification benefit)\n• Correlation of 0: Move independently (good diversification)\n• Correlation of -1: Move in opposite directions (maximum diversification)\n\nStocks and bonds historically have low/negative correlation, which is why a 60/40 portfolio (60% stocks, 40% bonds) has been a cornerstone allocation for decades." },
        ],
        quiz: {
          question: "Why is correlation between assets more important than individual asset returns for portfolio construction?",
          options: [{ label: "Low correlation assets have higher returns" }, { label: "Low correlation provides diversification that reduces portfolio risk without sacrificing expected return" }, { label: "High correlation is always better" }, { label: "Correlation doesn't matter" }],
          correctIndex: 1,
          explanation: "Assets with low correlation don't move in lockstep — when one zigs, the other zags. This smooths portfolio returns and reduces overall risk.",
        },
      },
      {
        id: "m5-l3", title: "Index Investing and Market Efficiency", duration: "10 min",
        sections: [
          { heading: "The Case for Index Funds", body: "Over any 15-year period, **85-90% of actively managed funds underperform their benchmark index** after fees. This isn't because fund managers are incompetent — it's because:\n\n1. **Markets are mostly efficient**: Prices reflect available information quickly\n2. **Fees compound**: 1% annual fee on a $100,000 portfolio costs $28,000+ over 20 years\n3. **Consistent outperformance is nearly impossible**: Last year's top fund rarely repeats\n\nWarren Buffett famously bet (and won) that an S&P 500 index fund would beat a collection of hedge funds over 10 years." },
          { heading: "Building a Simple Portfolio", body: "The 'three-fund portfolio' covers most investors' needs:\n\n1. **Total US Stock Market Index** (40-60%): Broad US equity exposure\n2. **Total International Stock Index** (20-30%): Global diversification\n3. **Total Bond Market Index** (10-30%): Stability and income\n\nAdjust percentages based on age, risk tolerance, and goals. This costs ~0.03-0.10% in annual fees compared to 1-2% for active management." },
          { heading: "Dollar Cost Averaging into Index Funds", body: "Combined with the DCA strategy from Module 3, index investing becomes a powerful wealth-building machine:\n\n$500/month into a total market index fund at historical ~10% returns:\n• 10 years: $102,422\n• 20 years: $382,846\n• 30 years: $1,130,244\n\nNo stock picking. No market timing. No expensive advisors. Just consistent, automated investing into broadly diversified, low-cost index funds." },
        ],
        quiz: {
          question: "Over 15 years, what percentage of actively managed funds underperform their benchmark index?",
          options: [{ label: "25-30%" }, { label: "50-60%" }, { label: "70-80%" }, { label: "85-90%" }],
          correctIndex: 3,
          explanation: "85-90% of active funds underperform after fees over 15 years. The combination of market efficiency, fee drag, and mean reversion makes consistent outperformance extremely rare.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 5 Knowledge Check",
      questions: [
        { question: "The efficient frontier shows:", options: [{ label: "The fastest-growing stocks" }, { label: "Maximum expected return for each level of risk" }, { label: "Risk-free investment options" }, { label: "Historical market performance" }], correctIndex: 1, explanation: "The efficient frontier maps optimal risk-return combinations — portfolios on this curve are maximally diversified." },
        { question: "Unsystematic risk can be:", options: [{ label: "Never reduced" }, { label: "Eliminated through diversification" }, { label: "Only reduced by timing the market" }, { label: "Increased through diversification" }], correctIndex: 1, explanation: "Company-specific (unsystematic) risk is eliminated by holding a diversified portfolio of 25-30+ uncorrelated stocks." },
        { question: "A three-fund portfolio typically includes:", options: [{ label: "Three individual stocks" }, { label: "US stocks, international stocks, and bonds index funds" }, { label: "Crypto, gold, and stocks" }, { label: "Small-cap, mid-cap, and large-cap stocks" }], correctIndex: 1, explanation: "The three-fund portfolio (US total market, international, bonds) provides broad diversification at minimal cost." },
        { question: "Index funds outperform most active managers because:", options: [{ label: "Index managers are smarter" }, { label: "Markets are mostly efficient, and fees compound against active managers" }, { label: "Index funds take more risk" }, { label: "Governments regulate in their favour" }], correctIndex: 1, explanation: "Market efficiency means most information is already priced in. Active managers' 1-2% annual fees create a hurdle most can't overcome consistently." },
        { question: "Correlation of -1 between two assets means:", options: [{ label: "They always move together" }, { label: "They move in exactly opposite directions" }, { label: "They're unrelated" }, { label: "Both will lose money" }], correctIndex: 1, explanation: "Correlation of -1 means perfect inverse movement — when one goes up, the other goes down by the same proportion. This provides maximum diversification benefit." },
      ],
    },
    unitTest: {
      title: "Module 5 Unit Test",
      questions: [
        { question: "Harry Markowitz won the Nobel Prize for:", options: [{ label: "Discovering compound interest" }, { label: "Modern Portfolio Theory and the efficient frontier" }, { label: "Creating index funds" }, { label: "The Capital Asset Pricing Model" }], correctIndex: 1, explanation: "Markowitz's Modern Portfolio Theory showed that diversification across uncorrelated assets optimises the risk-return tradeoff." },
        { question: "A 1% annual fee on $100,000 costs approximately how much over 20 years?", options: [{ label: "$2,000" }, { label: "$10,000" }, { label: "$28,000+" }, { label: "$50,000" }], correctIndex: 2, explanation: "1% annually compounds — it's not just $1,000/year but reduces the base that compounds, costing $28,000+ in total fees and lost growth." },
        { question: "$500/month at 10% for 30 years grows to approximately:", options: [{ label: "$500,000" }, { label: "$750,000" }, { label: "$1,130,000" }, { label: "$2,000,000" }], correctIndex: 2, explanation: "Total contributions: $180,000. With 10% compound returns: ~$1,130,244. Over 80% of the final value came from compounding." },
        { question: "Which asset class has the highest historical long-term returns?", options: [{ label: "Bonds" }, { label: "Gold" }, { label: "Equities (stocks)" }, { label: "Cash" }], correctIndex: 2, explanation: "Equities have returned ~10% annually long-term, outpacing all other major asset classes despite higher short-term volatility." },
        { question: "The 60/40 portfolio works because:", options: [{ label: "60 and 40 are lucky numbers" }, { label: "Stocks and bonds historically have low/negative correlation" }, { label: "It's the legal requirement" }, { label: "Bonds always go up" }], correctIndex: 1, explanation: "Stocks and bonds often move in opposite directions, so combining them reduces overall portfolio volatility while maintaining reasonable returns." },
        { question: "Systematic risk is:", options: [{ label: "Risk that can be diversified away" }, { label: "Market-wide risk that affects all investments" }, { label: "Risk from poor stock picking" }, { label: "Risk from high fees" }], correctIndex: 1, explanation: "Systematic (market) risk — recessions, interest rates, geopolitical events — affects all investments and cannot be eliminated through diversification." },
        { question: "Warren Buffett's famous bet proved that:", options: [{ label: "Hedge funds always win" }, { label: "An S&P 500 index fund beat a collection of hedge funds over 10 years" }, { label: "Active management is always better" }, { label: "Timing the market works" }], correctIndex: 1, explanation: "Buffett bet $1 million that a simple S&P 500 index fund would beat five hand-picked hedge funds over a decade. He won decisively." },
        { question: "Rebalancing your portfolio means:", options: [{ label: "Selling everything and starting over" }, { label: "Adjusting positions back to target allocations by selling winners and buying underweight assets" }, { label: "Adding more money" }, { label: "Changing your investment strategy" }], correctIndex: 1, explanation: "Rebalancing systematically sells high (overweight positions) and buys low (underweight positions) to maintain your target allocation." },
        { question: "The best time to start investing is:", options: [{ label: "When markets are low" }, { label: "When you have $10,000 saved" }, { label: "As early as possible, because time in market beats timing the market" }, { label: "After retirement" }], correctIndex: 2, explanation: "Time is the most powerful factor in compounding. Starting early — even with small amounts — dramatically outperforms waiting for 'perfect' conditions." },
        { question: "Which factor matters MOST in long-term portfolio performance?", options: [{ label: "Stock picking" }, { label: "Market timing" }, { label: "Asset allocation" }, { label: "Trading frequency" }], correctIndex: 2, explanation: "Research shows asset allocation explains ~90% of portfolio return variation. How you divide money between stocks, bonds, and other classes matters more than which specific investments you pick." },
      ],
    },
  },

  // ─── MODULE 6 ────────────────────────────────────────────────
  {
    id: "taxation-public-finance",
    number: 6,
    title: "Taxation, Public Finance, and the Fiscal State",
    subtitle: "How taxes work, why they exist, and how to optimise legally",
    description: "Understand the tax system from first principles — marginal rates, deductions, tax-advantaged accounts, and the role of government spending in the economy.",
    icon: "Landmark",
    color: "hsl(40, 55%, 50%)",
    lessons: [
      { id: "m6-l1", title: "How Marginal Tax Rates Actually Work", duration: "9 min", sections: [{ heading: "The Most Misunderstood Concept in Finance", body: "Most people think 'If I earn more, I'll pay more tax on ALL my income.' This is wrong.\n\n**Marginal tax rates** mean you only pay the higher rate on income **above each threshold**.\n\nExample (simplified Canadian brackets):\n• $0-$55,867: 15%\n• $55,867-$111,733: 20.5%\n• $111,733-$154,906: 26%\n\nIf you earn $70,000:\n• First $55,867 taxed at 15% = $8,380\n• Next $14,133 ($70K - $55,867) taxed at 20.5% = $2,897\n• **Total tax: $11,277** (effective rate: 16.1%)\n\nYou'd never pay 20.5% on your entire $70,000. Earning more ALWAYS puts more money in your pocket after tax." }, { heading: "Effective vs Marginal Rate", body: "Your **marginal rate** is the tax on your last dollar earned. Your **effective rate** is total tax ÷ total income.\n\nPeople in the 26% bracket often have an effective rate of only 18-20%. Understanding this eliminates the fear of 'moving into a higher bracket.'" }], quiz: { question: "If you move into a higher tax bracket, does your entire income get taxed at the higher rate?", options: [{ label: "Yes — all income is taxed at the new rate" }, { label: "No — only income above the new threshold is taxed at the higher rate" }, { label: "It depends on your province/state" }], correctIndex: 1, explanation: "Marginal taxation means only income above each bracket threshold is taxed at the higher rate. Moving to a higher bracket ALWAYS means more take-home pay." } },
      { id: "m6-l2", title: "Tax-Advantaged Accounts", duration: "10 min", sections: [{ heading: "TFSA (Tax-Free Savings Account)", body: "• Contributions from after-tax dollars\n• All growth, dividends, and withdrawals are **completely tax-free**\n• Best for: High-growth investments (maximize tax-free compounding)\n• Annual contribution limit: ~$7,000 (accumulates if unused)\n• Unused room carries forward indefinitely" }, { heading: "RRSP (Registered Retirement Savings Plan)", body: "• Contributions are tax-deductible (reduce current year's tax)\n• Growth is tax-deferred\n• Withdrawals are taxed as income\n• Best strategy: Contribute in high-income years, withdraw in low-income retirement years\n• Employer matching RRSP = free money (always max this first)" }, { heading: "The Optimal Order", body: "1. **RRSP employer match** (100% return — free money)\n2. **High-interest debt** (guaranteed return equal to interest rate)\n3. **TFSA** (tax-free growth for long-term investing)\n4. **RRSP** (tax deferral, especially if in a high bracket now)\n5. **Non-registered accounts** (taxable, but still better than not investing)" }], quiz: { question: "Why should TFSA hold high-growth investments?", options: [{ label: "TFSAs have higher contribution limits" }, { label: "All growth is completely tax-free, so you want to maximise the tax-free amount" }, { label: "Growth investments are safer in TFSAs" }, { label: "TFSAs offer better interest rates" }], correctIndex: 1, explanation: "Since TFSA growth is entirely tax-free, you want to maximize the amount that escapes taxation. A stock that grows from $5,000 to $50,000 in a TFSA means $45,000 of tax-free gains." } },
      { id: "m6-l3", title: "Tax-Loss Harvesting and Capital Gains", duration: "8 min", sections: [{ heading: "Capital Gains Tax", body: "When you sell an investment for profit, you owe tax on the gain.\n\nIn Canada, only **50% of capital gains are taxable** (the 'inclusion rate'). So if you're in the 30% marginal bracket and make $10,000 in gains:\n• Taxable amount: $10,000 × 50% = $5,000\n• Tax owed: $5,000 × 30% = $1,500\n• Effective tax on the gain: 15%\n\nThis preferential rate is why long-term investing is tax-advantaged." }, { heading: "Tax-Loss Harvesting", body: "**Selling losing positions to offset gains** is a legal tax strategy.\n\nExample:\n• You sold Stock A for $8,000 gain\n• Stock B is down $5,000 (unrealised loss)\n• Sell Stock B: $5,000 loss offsets $5,000 of gains\n• Net taxable gain: $3,000 (instead of $8,000)\n• You can immediately buy a similar (not identical) investment\n\n**Important**: The 'superficial loss rule' prevents buying back the identical security within 30 days." }], quiz: { question: "Tax-loss harvesting means:", options: [{ label: "Avoiding taxes by not selling" }, { label: "Selling losing investments to offset taxable gains" }, { label: "Only harvesting crops for tax deductions" }, { label: "Selling winners before year-end" }], correctIndex: 1, explanation: "Tax-loss harvesting strategically realises losses to offset capital gains, reducing your tax bill while maintaining market exposure through similar investments." } },
    ],
    moduleQuiz: {
      title: "Module 6 Knowledge Check",
      questions: [
        { question: "Marginal tax brackets mean:", options: [{ label: "All income is taxed at your highest rate" }, { label: "Only income above each threshold is taxed at the higher rate" }, { label: "Tax rates are the same for everyone" }, { label: "You choose your own rate" }], correctIndex: 1, explanation: "Income is taxed in layers — each bracket only applies to income within that range." },
        { question: "The first priority for investing should be:", options: [{ label: "TFSA" }, { label: "Non-registered account" }, { label: "RRSP employer match" }, { label: "Cryptocurrency" }], correctIndex: 2, explanation: "Employer RRSP matching is an immediate 100% return on your contribution — no investment can reliably beat that." },
        { question: "In Canada, what portion of capital gains is taxable?", options: [{ label: "100%" }, { label: "75%" }, { label: "50%" }, { label: "25%" }], correctIndex: 2, explanation: "Only 50% of capital gains are included in taxable income (the inclusion rate), making long-term investing tax-advantaged." },
        { question: "The superficial loss rule prevents:", options: [{ label: "Selling stocks at a loss" }, { label: "Buying back the identical security within 30 days after selling for a loss" }, { label: "Holding losing positions" }, { label: "Tax-loss harvesting entirely" }], correctIndex: 1, explanation: "You can't claim a capital loss if you buy back the same security within 30 days. You CAN buy a similar (but not identical) investment." },
        { question: "Moving to a higher tax bracket:", options: [{ label: "Means you take home less money" }, { label: "Always means more take-home pay (only the incremental income is taxed higher)" }, { label: "Should be avoided" }, { label: "Triggers an audit" }], correctIndex: 1, explanation: "Higher bracket = more gross income = more net income. The higher rate only applies to dollars above the threshold." },
      ],
    },
    unitTest: {
      title: "Module 6 Unit Test",
      questions: [
        { question: "If you earn $70,000 with a marginal rate of 20.5% and effective rate of 16.1%, you pay:", options: [{ label: "$14,350 (20.5% of all)" }, { label: "~$11,270 (16.1% effective)" }, { label: "$7,000" }, { label: "$20,500" }], correctIndex: 1, explanation: "Effective rate (16.1%) × $70,000 ≈ $11,270. The marginal rate only applies to income above the bracket threshold." },
        { question: "TFSA withdrawals are:", options: [{ label: "Taxed as income" }, { label: "Completely tax-free" }, { label: "Taxed at capital gains rate" }, { label: "Taxed at a flat rate" }], correctIndex: 1, explanation: "TFSA withdrawals are 100% tax-free — contributions, growth, dividends, and capital gains all come out untaxed." },
        { question: "RRSP is best used when:", options: [{ label: "Your income is low" }, { label: "Contributing in high-income years and withdrawing in low-income years" }, { label: "You want tax-free growth" }, { label: "You need emergency money" }], correctIndex: 1, explanation: "RRSP deductions are most valuable in high-income years (higher marginal rate), and withdrawals in retirement are taxed at lower rates." },
        { question: "A $10,000 capital gain at 30% marginal rate costs how much in tax (Canadian)?", options: [{ label: "$3,000" }, { label: "$1,500" }, { label: "$5,000" }, { label: "$500" }], correctIndex: 1, explanation: "Only 50% of gains are taxable: $10,000 × 50% = $5,000 taxable. $5,000 × 30% = $1,500 tax (effective 15% on the gain)." },
        { question: "Why does employer RRSP matching come first?", options: [{ label: "It's mandatory" }, { label: "It's an immediate 100% return — free money" }, { label: "RRSPs grow faster" }, { label: "Employers require it" }], correctIndex: 1, explanation: "If your employer matches $1 for $1, your contribution instantly doubles. No investment can reliably match a guaranteed 100% return." },
        { question: "Tax-loss harvesting is most useful when:", options: [{ label: "All your investments are profitable" }, { label: "You have capital gains to offset with realised losses" }, { label: "You're in the lowest tax bracket" }, { label: "You want to exit the market permanently" }], correctIndex: 1, explanation: "Harvesting losses is valuable when you have gains — the losses offset gains, reducing your tax bill while you reinvest in similar assets." },
        { question: "The optimal account for high-dividend stocks is:", options: [{ label: "Non-registered taxable account" }, { label: "TFSA (dividends received tax-free)" }, { label: "RRSP only" }, { label: "Chequing account" }], correctIndex: 1, explanation: "Eligible Canadian dividends in a TFSA are completely tax-free, eliminating the annual tax drag on dividend income." },
        { question: "Effective tax rate is calculated as:", options: [{ label: "Marginal rate × income" }, { label: "Total tax paid ÷ total income" }, { label: "Highest bracket rate" }, { label: "Provincial rate + federal rate" }], correctIndex: 1, explanation: "Effective rate = total tax ÷ total income. It's always lower than your marginal rate because lower brackets apply to earlier income." },
        { question: "Non-registered investment accounts are used when:", options: [{ label: "You haven't opened a TFSA" }, { label: "You've maximised TFSA and RRSP room and still want to invest" }, { label: "You want to avoid taxes" }, { label: "Banks require them" }], correctIndex: 1, explanation: "After maximising tax-advantaged room (TFSA + RRSP), non-registered accounts are the next step for continued investing." },
        { question: "The biggest tax mistake investors make is:", options: [{ label: "Filing taxes late" }, { label: "Not using available tax-advantaged accounts before investing in taxable ones" }, { label: "Earning too much" }, { label: "Having too many bank accounts" }], correctIndex: 1, explanation: "Investing in taxable accounts while having unused TFSA or RRSP room leaves free tax benefits on the table." },
      ],
    },
  },

  // ─── MODULE 7 ────────────────────────────────────────────────
  {
    id: "insurance-risk-protection",
    number: 7,
    title: "Insurance, Risk Management, and Asset Protection",
    subtitle: "Protecting what you've built from catastrophic loss",
    description: "Learn the economics of insurance — what to protect, what to self-insure, and how risk management prevents years of wealth building from being wiped out in a single event.",
    icon: "ShieldCheck",
    color: "hsl(210, 55%, 50%)",
    lessons: [
      { id: "m7-l1", title: "The Economics of Insurance", duration: "8 min", sections: [{ heading: "Why Insurance Exists", body: "Insurance is a **risk transfer mechanism**. You pay a predictable premium to transfer the financial impact of an unpredictable catastrophic event to an insurer.\n\n**The math**: Insurance companies pool risk across millions of policyholders. Your premium = your expected loss + operating costs + profit margin. On average, you'll pay MORE in premiums than you receive in claims. So why buy it?\n\n**Because insurance protects against RUIN**, not inconvenience. A $200/month health insurance premium protects against a $500,000 medical bill. The expected value is negative, but the protection against catastrophe is priceless." }, { heading: "Insure Against Catastrophe, Self-Insure Against Inconvenience", body: "**Must-have insurance** (catastrophic risk):\n• Health/medical insurance\n• Auto liability insurance\n• Home/renter's insurance\n• Disability insurance (your income is your biggest asset)\n• Term life insurance (if dependents)\n\n**Often unnecessary** (inconvenience-level risk):\n• Extended warranties on electronics\n• Phone screen insurance\n• Travel interruption for short trips\n• Rental car insurance (if covered by credit card)\n\n**Rule of thumb**: If you can absorb the loss from your emergency fund, you probably don't need insurance for it." }], quiz: { question: "Why should you insure against catastrophes but self-insure against inconveniences?", options: [{ label: "Small losses don't happen often" }, { label: "Insurance premiums for small losses exceed their expected value, and you can absorb them from savings" }, { label: "Insurance companies won't cover small items" }, { label: "Self-insurance is always cheaper" }], correctIndex: 1, explanation: "For small losses (broken phone), you pay more in premiums than the expected claim. Your emergency fund handles these. Insurance is for events that would devastate your finances — medical emergencies, liability, disability." } },
      { id: "m7-l2", title: "Disability and Life Insurance", duration: "9 min", sections: [{ heading: "Your Income Is Your Biggest Asset", body: "At age 30, your future earning potential is worth ~$2 million. **Disability insurance protects this asset.**\n\nA 30-year-old has a 1 in 4 chance of becoming disabled for 90+ days before age 65. Without disability insurance, that means:\n• No income for months or years\n• Emergency fund depleted in 3-6 months\n• Debt accumulation\n• Potential loss of home, investments, retirement savings\n\nDisability insurance replaces 60-70% of your income if you can't work." }, { heading: "Term Life Insurance", body: "**Who needs it**: Anyone with financial dependents (children, non-working spouse, co-signed debts).\n\n**How much**: 10-15× annual income. If you earn $60,000, carry $600,000-$900,000.\n\n**Term vs Whole Life**:\n• **Term** (recommended): Pure protection for a specific period (20-30 years). Affordable. Clear purpose.\n• **Whole life**: Combines insurance with investment. Expensive. Complex. The investment component typically underperforms index funds.\n\n**Buy term and invest the difference** — this is the standard financial planning advice from virtually all fee-only advisors." }], quiz: { question: "What type of life insurance do most financial advisors recommend?", options: [{ label: "Whole life insurance" }, { label: "Term life insurance — buy term and invest the difference" }, { label: "Universal life insurance" }, { label: "Variable life insurance" }], correctIndex: 1, explanation: "Term life is pure, affordable protection. Whole life's investment component is expensive and underperforms. Buy cheap term coverage and invest the premium savings in index funds." } },
    ],
    moduleQuiz: {
      title: "Module 7 Knowledge Check",
      questions: [
        { question: "Insurance is fundamentally a:", options: [{ label: "Savings plan" }, { label: "Risk transfer mechanism" }, { label: "Investment vehicle" }, { label: "Tax strategy" }], correctIndex: 1, explanation: "Insurance transfers the financial risk of catastrophic events from you to the insurer in exchange for predictable premiums." },
        { question: "The 'self-insure' rule means:", options: [{ label: "Never buy insurance" }, { label: "Don't insure losses your emergency fund can cover" }, { label: "Create your own insurance company" }, { label: "Only buy insurance from yourself" }], correctIndex: 1, explanation: "If you can absorb a loss from savings (broken phone, minor fender bender), insurance premiums for those events are overpriced." },
        { question: "A 30-year-old has approximately what chance of becoming disabled before 65?", options: [{ label: "1 in 100" }, { label: "1 in 10" }, { label: "1 in 4" }, { label: "1 in 2" }], correctIndex: 2, explanation: "1 in 4 people will experience a disability lasting 90+ days before age 65 — much more common than most people think." },
        { question: "How much life insurance coverage is recommended?", options: [{ label: "1-2× annual income" }, { label: "5× annual income" }, { label: "10-15× annual income" }, { label: "Equal to your debts" }], correctIndex: 2, explanation: "10-15× annual income ensures dependents can maintain their standard of living and cover major obligations (mortgage, education, living expenses)." },
        { question: "'Buy term and invest the difference' means:", options: [{ label: "Buy term life insurance and invest the money saved vs expensive whole life premiums" }, { label: "Buy insurance only in certain terms" }, { label: "Switch insurance providers regularly" }, { label: "Invest in insurance companies" }], correctIndex: 0, explanation: "Term life is much cheaper than whole life. Investing the premium difference in index funds typically produces better long-term results than whole life's built-in investment component." },
      ],
    },
    unitTest: {
      title: "Module 7 Unit Test",
      questions: [
        { question: "Insurance companies profit because:", options: [{ label: "They deny all claims" }, { label: "Premiums collected exceed claims paid across the pool of policyholders" }, { label: "Interest rates are high" }, { label: "Government subsidies" }], correctIndex: 1, explanation: "Insurance works through risk pooling — premiums from many cover claims from few. The insurer profits from the spread plus investment income on premiums." },
        { question: "Which insurance is most commonly under-purchased?", options: [{ label: "Auto insurance" }, { label: "Disability insurance" }, { label: "Phone insurance" }, { label: "Pet insurance" }], correctIndex: 1, explanation: "Disability insurance is critically under-purchased despite the 1-in-4 probability of long-term disability. Most people protect their car but not their income." },
        { question: "Extended warranties on electronics are generally:", options: [{ label: "A great investment" }, { label: "Overpriced relative to the risk — self-insure instead" }, { label: "Required by manufacturers" }, { label: "The same as manufacturer warranty" }], correctIndex: 1, explanation: "Electronics failures during the extended warranty period are relatively rare, and the cost can be absorbed from savings — making these warranties poor value." },
        { question: "Term life insurance covers:", options: [{ label: "Your entire lifetime" }, { label: "A specific period (e.g., 20-30 years)" }, { label: "Only accidental death" }, { label: "Only workplace injuries" }], correctIndex: 1, explanation: "Term life provides coverage for a defined period — typically aligned with your working years when dependents rely on your income." },
        { question: "Renter's insurance protects:", options: [{ label: "Your landlord's building" }, { label: "Your personal belongings and provides liability coverage" }, { label: "Your rent payments" }, { label: "Your credit score" }], correctIndex: 1, explanation: "Renter's insurance covers your personal property (theft, fire) and provides personal liability protection — extremely affordable at ~$15-25/month." },
        { question: "Disability insurance typically replaces:", options: [{ label: "100% of income" }, { label: "60-70% of income" }, { label: "30% of income" }, { label: "Only medical costs" }], correctIndex: 1, explanation: "Most disability policies replace 60-70% of pre-disability income. The gap incentivizes return to work while preventing financial ruin." },
        { question: "The biggest risk to your financial plan in your 30s is:", options: [{ label: "Stock market crash" }, { label: "Loss of earning ability (disability or death)" }, { label: "High inflation" }, { label: "Identity theft" }], correctIndex: 1, explanation: "Your human capital ($2M+ future earnings) dwarfs your investment portfolio at this age. Protecting your income is the highest-priority risk management." },
        { question: "Whole life insurance is criticised because:", options: [{ label: "It doesn't provide death benefit" }, { label: "It's expensive and the investment component typically underperforms index funds" }, { label: "It's only for young people" }, { label: "It doesn't last your whole life" }], correctIndex: 1, explanation: "Whole life premiums can be 5-15× more than term. The cash value grows slowly with high fees, typically underperforming a simple index fund." },
        { question: "When can you drop life insurance?", options: [{ label: "Never" }, { label: "When dependents are financially independent and debts are paid" }, { label: "After age 40" }, { label: "When premiums increase" }], correctIndex: 1, explanation: "Life insurance protects dependents. Once children are independent, mortgage is paid, and retirement is funded, the need diminishes." },
        { question: "An umbrella insurance policy:", options: [{ label: "Covers rain damage" }, { label: "Provides additional liability coverage above other policies" }, { label: "Replaces all other insurance" }, { label: "Is only for businesses" }], correctIndex: 1, explanation: "Umbrella policies add liability coverage (typically $1-5M) above your auto and home insurance limits — essential as your net worth grows." },
      ],
    },
  },

  // ─── MODULE 8 ────────────────────────────────────────────────
  {
    id: "financial-independence",
    number: 8,
    title: "Financial Independence, Life Strategy, and Economic Mobility",
    subtitle: "Designing a life where work is optional and wealth serves your values",
    description: "The endgame of financial literacy — calculate your FIRE number, design your ideal life strategy, and understand the systemic factors that enable or constrain economic mobility.",
    icon: "Rocket",
    color: "hsl(330, 50%, 50%)",
    lessons: [
      { id: "m8-l1", title: "The FIRE Movement and Financial Independence", duration: "10 min", sections: [{ heading: "What Is Financial Independence?", body: "**Financial Independence (FI)** = having enough invested assets that the returns cover your living expenses indefinitely. Work becomes optional.\n\n**The 4% Rule**: If you can live on 4% of your portfolio annually, your money should last 30+ years (based on the Trinity Study).\n\nExample:\n• Annual expenses: $40,000\n• FI number: $40,000 ÷ 0.04 = **$1,000,000**\n• At $60,000 expenses: $1,500,000\n• At $80,000 expenses: $2,000,000\n\nFI doesn't mean you stop working. It means you have the **freedom to choose** work that's meaningful rather than mandatory." }, { heading: "The FIRE Variants", body: "**Lean FIRE**: FI on minimal expenses ($25-35K/year). Requires frugality.\n**Regular FIRE**: FI on moderate expenses ($40-70K/year). Balanced approach.\n**Fat FIRE**: FI on comfortable expenses ($100K+/year). Requires high income/returns.\n**Barista FIRE**: Semi-FI with part-time work covering some expenses.\n**Coast FIRE**: Enough saved that compound growth will fund retirement by traditional age — you just need to cover current expenses.\n\nEach variant represents a different balance of sacrifice, timeline, and lifestyle." }, { heading: "Calculating Your Timeline", body: "Your FIRE timeline depends primarily on your **savings rate** (% of income saved), not your income:\n\n• 10% savings rate → ~40 years to FI\n• 25% savings rate → ~32 years\n• 50% savings rate → ~17 years\n• 75% savings rate → ~7 years\n\nSomeone earning $50K saving 50% ($25K/year) reaches FI faster than someone earning $200K saving 10% ($20K/year). **Savings rate is the most powerful variable you control.**" }], quiz: { question: "If your annual expenses are $50,000, what is your FIRE number using the 4% rule?", options: [{ label: "$500,000" }, { label: "$1,000,000" }, { label: "$1,250,000" }, { label: "$2,000,000" }], correctIndex: 2, explanation: "$50,000 ÷ 0.04 = $1,250,000. When your invested assets reach $1.25M, a 4% annual withdrawal covers your $50K expenses." } },
      { id: "m8-l2", title: "Economic Mobility and Systemic Factors", duration: "11 min", sections: [{ heading: "The Wealth Gap Is Real", body: "Financial literacy alone doesn't level the playing field. Understanding systemic factors is essential for realistic planning:\n\n• **Intergenerational wealth**: The #1 predictor of wealth is parental wealth. Those with inheritance can take more risk and start investing earlier.\n• **Income inequality**: CEO-to-worker pay ratios have grown from 20:1 (1965) to 350:1 (2023).\n• **Education costs**: University costs have increased 1,200% since 1980, creating debt barriers.\n• **Housing appreciation**: Those who bought homes 20+ years ago captured massive wealth appreciation that's harder to access now.\n\nThis isn't defeatism — it's context. Your strategy should account for where you're starting, not where others started." }, { heading: "Building Mobility Through Systems", body: "Despite systemic barriers, individual systems still work:\n\n1. **Skill acquisition** > credential accumulation (learn high-value skills)\n2. **Network building** > solo grinding (relationships create opportunities)\n3. **Geographic arbitrage** (high-income city, relocate to low-cost area)\n4. **Entrepreneurship** (the highest-variance path to wealth)\n5. **Financial literacy itself** (knowing the rules of the game)\n\nThe data shows that **first-generation wealth builders** who use these strategies can reach financial independence within 15-25 years, regardless of starting point." }], quiz: { question: "The most powerful variable in reaching financial independence is:", options: [{ label: "Your salary" }, { label: "Your savings rate (percentage of income saved and invested)" }, { label: "Your investment returns" }, { label: "Your education level" }], correctIndex: 1, explanation: "Savings rate determines FIRE timeline more than income. A 50% savings rate → FI in ~17 years. A 10% rate → ~40 years, regardless of income level." } },
      { id: "m8-l3", title: "Designing Your Life Strategy", duration: "9 min", sections: [{ heading: "Money Is a Tool, Not the Goal", body: "The ultimate purpose of financial literacy is **freedom** — the ability to design your life intentionally rather than reactively.\n\nKey questions to answer:\n• What would you do if money were no object?\n• What does 'enough' look like for you?\n• What experiences and relationships matter most?\n• How much of your time do you want to control?\n\nResearch on happiness and wealth shows that **income increases happiness up to ~$75,000-$100,000/year** (basic needs + comfort). Beyond that, the correlation weakens dramatically. The happiest people aren't the richest — they're the ones with the most **autonomy** over their time." }, { heading: "The Life Strategy Framework", body: "1. **Define your values** (what matters most)\n2. **Calculate your FI number** (what 'enough' costs)\n3. **Build the systems** (automate, invest, protect)\n4. **Track progress** (annual net worth review)\n5. **Adjust and enjoy** (flexibility > rigidity)\n\nThe best financial plan is one that **serves your life**, not one that demands you sacrifice your life for a spreadsheet." }], quiz: { question: "Research shows income increases happiness up to approximately:", options: [{ label: "$30,000/year" }, { label: "$75,000-$100,000/year" }, { label: "$250,000/year" }, { label: "There is no limit" }], correctIndex: 1, explanation: "Beyond $75K-$100K, additional income has diminishing returns on happiness. The correlation weakens because basic needs and comfort are met — after that, autonomy, relationships, and purpose matter more." } },
    ],
    moduleQuiz: {
      title: "Module 8 Knowledge Check",
      questions: [
        { question: "The 4% rule says:", options: [{ label: "Save 4% of your income" }, { label: "Withdraw 4% of your portfolio annually for sustainable retirement income" }, { label: "Invest 4% in bonds" }, { label: "Pay 4% in fees" }], correctIndex: 1, explanation: "The 4% rule (Trinity Study) found that withdrawing 4% of your portfolio annually has historically sustained portfolios for 30+ years." },
        { question: "Coast FIRE means:", options: [{ label: "Living by the coast" }, { label: "Enough saved that compound growth handles retirement — you just cover current expenses" }, { label: "The fastest path to FI" }, { label: "Living on minimal expenses" }], correctIndex: 1, explanation: "Coast FIRE = your investments will grow to your FI number by retirement age through compounding alone. You just need to earn enough for current expenses." },
        { question: "The #1 predictor of individual wealth is:", options: [{ label: "Education level" }, { label: "Parental wealth / intergenerational transfers" }, { label: "Career choice" }, { label: "Geographic location" }], correctIndex: 1, explanation: "Research consistently shows parental wealth is the strongest predictor — through inheritance, education funding, risk capacity, and early investment opportunities." },
        { question: "A 50% savings rate leads to FI in approximately:", options: [{ label: "5 years" }, { label: "17 years" }, { label: "30 years" }, { label: "40 years" }], correctIndex: 1, explanation: "At a 50% savings rate with reasonable returns, you can accumulate 25× annual expenses in about 17 years." },
        { question: "The ultimate purpose of financial literacy is:", options: [{ label: "Accumulating maximum wealth" }, { label: "Freedom and autonomy to design your life intentionally" }, { label: "Retiring as early as possible" }, { label: "Beating the market" }], correctIndex: 1, explanation: "Money is a tool for freedom. The goal isn't the biggest number — it's having enough autonomy to live according to your values." },
      ],
    },
    unitTest: {
      title: "Module 8 Unit Test",
      questions: [
        { question: "FI number for $40K annual expenses using 4% rule:", options: [{ label: "$500,000" }, { label: "$1,000,000" }, { label: "$1,500,000" }, { label: "$2,000,000" }], correctIndex: 1, explanation: "$40,000 ÷ 0.04 = $1,000,000." },
        { question: "Lean FIRE involves:", options: [{ label: "High spending lifestyle" }, { label: "FI on minimal expenses ($25-35K/year)" }, { label: "Part-time work" }, { label: "Only investing in lean stocks" }], correctIndex: 1, explanation: "Lean FIRE achieves financial independence on minimal annual expenses through frugality and optimization." },
        { question: "CEO-to-worker pay ratio has grown from 20:1 (1965) to:", options: [{ label: "50:1" }, { label: "100:1" }, { label: "350:1" }, { label: "1000:1" }], correctIndex: 2, explanation: "The ratio has expanded dramatically from 20:1 to 350:1, reflecting increasing income inequality at the top." },
        { question: "Geographic arbitrage means:", options: [{ label: "Moving to a more expensive city" }, { label: "Earning in a high-income area and living/spending in a low-cost area" }, { label: "Investing in foreign markets" }, { label: "Working remotely" }], correctIndex: 1, explanation: "Earning a high-income-area salary while living in a low-cost area dramatically increases savings rate and accelerates FI." },
        { question: "Barista FIRE is:", options: [{ label: "Working at Starbucks" }, { label: "Semi-FI with part-time work covering some expenses" }, { label: "Full financial independence" }, { label: "Coffee-related investing" }], correctIndex: 1, explanation: "Barista FIRE means your investments cover most expenses, but you work part-time (often for benefits) to fill the gap." },
        { question: "University costs have increased since 1980 by:", options: [{ label: "100%" }, { label: "400%" }, { label: "1,200%" }, { label: "2,000%" }], correctIndex: 2, explanation: "A 1,200% increase in university costs has made education a significant financial burden and debt barrier for economic mobility." },
        { question: "First-generation wealth builders can reach FI in:", options: [{ label: "5-10 years" }, { label: "15-25 years" }, { label: "40-50 years" }, { label: "It's not possible" }], correctIndex: 1, explanation: "With strategic skill acquisition, high savings rates, and systematic investing, first-generation wealth builders can achieve FI in 15-25 years." },
        { question: "The happiness-income correlation weakens beyond:", options: [{ label: "$30,000" }, { label: "$75,000-$100,000" }, { label: "$200,000" }, { label: "It never weakens" }], correctIndex: 1, explanation: "Beyond $75K-$100K, basic needs and comfort are met. Additional income has diminishing returns on reported happiness." },
        { question: "The best financial plan is one that:", options: [{ label: "Maximises returns above all" }, { label: "Serves your life and values" }, { label: "Follows a rigid formula" }, { label: "Copies successful investors" }], correctIndex: 1, explanation: "Financial plans should serve your life design — your values, goals, and definition of 'enough' — not demand you sacrifice everything for a spreadsheet." },
        { question: "Net worth reviews should happen:", options: [{ label: "Daily" }, { label: "Weekly" }, { label: "Annually" }, { label: "Never — just keep investing" }], correctIndex: 2, explanation: "Annual net worth reviews track progress without causing anxiety from short-term fluctuations. It's the right cadence for long-term planning." },
      ],
    },
  },
];

// Helper to get progress from localStorage
const PROGRESS_KEY = "monee-learn-progress";

export interface LearningProgress {
  completedLessons: Set<string>; // lesson IDs
  passedModuleQuizzes: Set<string>; // module IDs
  passedUnitTests: Set<string>; // module IDs
  quizScores: Record<string, number>; // "moduleId-quiz" or "moduleId-unit" → score percentage
}

export function loadProgress(): LearningProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        completedLessons: new Set(parsed.completedLessons || []),
        passedModuleQuizzes: new Set(parsed.passedModuleQuizzes || []),
        passedUnitTests: new Set(parsed.passedUnitTests || []),
        quizScores: parsed.quizScores || {},
      };
    }
  } catch {}
  return { completedLessons: new Set(), passedModuleQuizzes: new Set(), passedUnitTests: new Set(), quizScores: {} };
}

export function saveProgress(progress: LearningProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({
    completedLessons: Array.from(progress.completedLessons),
    passedModuleQuizzes: Array.from(progress.passedModuleQuizzes),
    passedUnitTests: Array.from(progress.passedUnitTests),
    quizScores: progress.quizScores,
  }));
}
