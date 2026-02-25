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
    subtitle: "Understanding what money really is — as social technology, value construct, and psychological force",
    description: "Explore the evolution of money from Sumerian clay tablets to digital currencies, the social construction of value, the cognitive biases that govern financial decisions, and the cultural forces that shape consumption.",
    icon: "Brain",
    color: "hsl(270, 50%, 55%)",
    lessons: [
      {
        id: "m1-l1", title: "The Nature of Money", duration: "12 min",
        sections: [
          { heading: "Money as a Social Technology", body: "The prevailing definition in economics positions money as having three core functions: **medium of exchange**, **unit of account**, and **store of value**. However, this definition is incomplete.\n\nAnthropologists argue that money is also a **social technology** for facilitating cooperation, a **symbolic system** for tracking obligations, and a **temporal device** linking present labour to future consumption.\n\nEarly societies used debt-based accounting systems long before coins, as evidenced by Sumerian clay tablets (ca. 3000 BCE). Historian David Graeber argues that money originated not from barter but from **credit systems and reciprocal obligations**." },
          { heading: "The Barter Myth and the Emergence of Currency", body: "The classical narrative suggests barter preceded money. In reality, barter rarely functioned at scale because it relies on a **'double coincidence of wants'** — A must want what B has and B must want what A has.\n\nMoney solved this coordination problem. The earliest standardised currencies included:\n\n• **Grain credits** in Mesopotamia\n• **Cowrie shells** in China and Africa\n• **Rai stones** in Micronesia\n• **Metal coinage** in Lydia (ca. 600 BCE)\n\nThese instruments did not merely store value — they **encoded social trust**." },
          { heading: "Fiat Money and Monetary Sovereignty", body: "Modern states issue **fiat currencies**, whose value derives from state authority, legal tender laws, tax obligations, and network effects.\n\nA currency is valuable because enough people accept it in exchange, the state demands taxes payable only in that currency, inflation remains manageable, and the financial system denominates assets and liabilities in it.\n\nWithout these pillars, currencies enter **crises of confidence**, leading to inflationary collapse (e.g., Weimar Germany, Zimbabwe, Venezuela, Argentina)." },
          { heading: "Digital Money and the Network Age", body: "In contemporary economies, **over 90 percent of money is digital ledger entries**, not physical cash. Financial institutions operate through fractional reserve banking, credit creation, payment rails, and clearing and settlement systems.\n\nThe rise of **cryptocurrencies**, **stablecoins**, and **CBDCs** (Central Bank Digital Currencies) introduces new debates on sovereignty, privacy, and monetary decentralisation." },
        ],
        quiz: {
          question: "According to anthropological research, how did money actually originate?",
          options: [
            { label: "From barter systems that became inefficient" },
            { label: "From credit systems and reciprocal obligations" },
            { label: "From government decree in ancient Rome" },
            { label: "From the discovery of gold and precious metals" },
          ],
          correctIndex: 1,
          explanation: "David Graeber's research shows money originated from credit systems and reciprocal obligations, not from barter. Sumerian clay tablets (ca. 3000 BCE) recorded debts long before coins existed.",
        },
      },
      {
        id: "m1-l2", title: "The Construction of Value", duration: "10 min",
        sections: [
          { heading: "Value as a Social Construct", body: "Value is not intrinsic. It emerges from **social consensus, context, and utility**. Economists distinguish between:\n\n• **Use value** — functional utility\n• **Exchange value** — market tradability\n\nAnthropologists add a third layer:\n\n• **Symbolic value** — status, meaning, narrative\n\nValue depends on at least four variables: **scarcity** (the diamonds vs. water paradox), **utility** (practical function), **desirability** (subjective preference), and **context** (situational valuation).\n\nA bottle of water in a grocery store costs $2. The same bottle in a desert could command a life-or-death premium." },
          { heading: "Network Effects and Value Escalation", body: "Certain goods become valuable purely by participation: currency, social media platforms, payment networks, and cryptocurrencies. Their value increases as adoption increases — a phenomenon described by **Metcalfe's Law**.\n\nThis explains why dominant currencies, payment systems, and platforms tend toward monopoly: each additional user increases value for all existing users." },
          { heading: "Identity-Based Consumption", body: "In consumer capitalism, individuals consume not only goods but **identities**. Thorstein Veblen (1899) described **conspicuous consumption** as consumption that signals status more than utility.\n\nModern consumer markets extend this to technology (Apple), fashion (designer labels), experiences (travel, wellness), and housing (neighbourhood signalling).\n\nValue is thus **semiotic as much as economic** — what something means matters as much as what it does." },
        ],
        quiz: {
          question: "What does Metcalfe's Law describe in the context of money and value?",
          options: [
            { label: "That scarcity determines all value" },
            { label: "That value increases as adoption and participation increase" },
            { label: "That inflation always erodes value over time" },
            { label: "That government regulation determines currency value" },
          ],
          correctIndex: 1,
          explanation: "Metcalfe's Law describes network effects — the value of a network (currency, platform, payment system) increases as more people use it. This is why dominant currencies and platforms tend toward monopoly.",
        },
      },
      {
        id: "m1-l3", title: "Behavioural Finance and Cognitive Bias", duration: "12 min",
        sections: [
          { heading: "Homo Economicus vs Behavioural Reality", body: "Neoclassical economics assumed individuals are **rational utility maximisers**. Behavioural economists (Kahneman, Tversky, Thaler, Ariely) demonstrate this is false.\n\nHumans exhibit cognitive biases, emotional decision-making, time inconsistency, and poor risk perception. These findings have profound implications for understanding why financial literacy alone does not solve poor financial behaviour." },
          { heading: "Core Financial Biases", body: "**Present Bias** — Preference for immediate consumption over delayed benefit. Manifested in under-saving and underinvesting.\n\n**Loss Aversion** — Losses are psychologically weighted roughly **twice as heavily** as equivalent gains.\n\n**Anchoring** — Overreliance on initial reference points (e.g., sale prices, previous stock prices).\n\n**Mental Accounting** — Separating money based on arbitrary categories (e.g., treating bonuses as 'fun money' rather than income).\n\n**Social Proof** — Copying financial behaviour of peers, seen in speculative manias.\n\n**Endowment Effect** — Overvaluing possessions simply because one owns them." },
          { heading: "Why Biases Matter for Financial Decisions", body: "These biases explain why:\n\n• People hold losing investments too long (loss aversion + anchoring)\n• Investors pile into bubbles (social proof + recency bias)\n• Consumers overspend on sales (anchoring)\n• Individuals fail to save despite knowing they should (present bias)\n• Tax refunds are spent differently than regular income (mental accounting)\n\nUnderstanding biases is like **debugging your brain's operating system**. You cannot eliminate them, but you can build systems and habits that work around them." },
        ],
        quiz: {
          question: "Why does financial literacy alone fail to solve poor financial behaviour?",
          options: [
            { label: "Because financial concepts are too complex for most people" },
            { label: "Because cognitive biases and emotional decision-making override rational knowledge" },
            { label: "Because financial markets are unpredictable" },
            { label: "Because governments set policies that prevent good decisions" },
          ],
          correctIndex: 1,
          explanation: "Behavioural economics demonstrates that humans are not rational utility maximisers. Cognitive biases like present bias, loss aversion, and social proof systematically override rational financial knowledge.",
        },
      },
      {
        id: "m1-l4", title: "Time, Culture, and the Attention Economy", duration: "10 min",
        sections: [
          { heading: "Time as a Financial Variable", body: "Time magnifies outcomes through **compounding**. Intertemporal choice refers to how individuals evaluate trade-offs across time.\n\n**Hyperbolic discounting** causes individuals to undervalue distant rewards — preferring $100 today over $120 in a month, but being indifferent between $100 in 12 months and $120 in 13 months. This inconsistency drives under-saving and overconsumption." },
          { heading: "Culture as a Determinant of Spending", body: "Consumption is culturally mediated. Sociologists emphasise how **religion, ethnicity, family systems, class status, and migration patterns** shape economic norms.\n\nDifferent cultures produce radically different savings rates, attitudes toward debt, and consumption patterns — demonstrating that financial behaviour is embedded in sociocultural context, not purely individual choice." },
          { heading: "The Attention Economy and Consumer Manipulation", body: "Modern firms employ behavioural psychologists, UX designers, and data scientists to maximise consumption via **dopamine loops**. Advertising no longer sells products — it sells identities and aspirations.\n\nThe twentieth century saw the extension of financial logic into daily practices: credit cards, buy now pay later, variable-rate debt, and subscription models. Households today manage **mini financial portfolios** rather than simple paycheques and bills.\n\nThis is the **financialisation of everyday life** — and understanding it is the first step to resisting manufactured desire." },
        ],
        quiz: {
          question: "Hyperbolic discounting causes individuals to:",
          options: [
            { label: "Overvalue future rewards consistently" },
            { label: "Undervalue distant rewards relative to immediate ones, inconsistently across time" },
            { label: "Make perfectly rational intertemporal choices" },
            { label: "Save too much for retirement" },
          ],
          correctIndex: 1,
          explanation: "Hyperbolic discounting creates time inconsistency — people disproportionately prefer immediate rewards over future ones, but this preference shifts depending on when the choice is framed. This drives under-saving and overconsumption.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 1 Knowledge Check",
      questions: [
        { question: "What are the three classical functions of money in economics?", options: [{ label: "Earning, spending, saving" }, { label: "Medium of exchange, unit of account, store of value" }, { label: "Credit, debt, investment" }, { label: "Trading, lending, storing" }], correctIndex: 1, explanation: "The three classical functions are: medium of exchange (facilitates trade), unit of account (measures value), and store of value (preserves purchasing power over time)." },
        { question: "Fiat currency derives its value primarily from:", options: [{ label: "Gold reserves backing each unit" }, { label: "State authority, legal tender laws, and collective acceptance" }, { label: "The intrinsic value of paper and ink" }, { label: "International trade agreements" }], correctIndex: 1, explanation: "Fiat currencies are backed by state authority, tax obligations payable in that currency, and the network effect of collective acceptance — not physical commodities." },
        { question: "Thorstein Veblen's concept of 'conspicuous consumption' describes:", options: [{ label: "Buying only necessities" }, { label: "Consumption that signals social status more than utility" }, { label: "Government spending on public goods" }, { label: "Investment in productive assets" }], correctIndex: 1, explanation: "Veblen (1899) described conspicuous consumption as purchasing goods primarily to signal status and class membership, rather than for their functional utility." },
        { question: "Loss aversion means that losses are psychologically weighted:", options: [{ label: "Equally to gains" }, { label: "Roughly twice as heavily as equivalent gains" }, { label: "Less than gains" }, { label: "Only in large amounts" }], correctIndex: 1, explanation: "Kahneman and Tversky's research shows losses feel roughly twice as painful as equivalent gains feel good, leading to irrational holding of losing investments and risk avoidance." },
        { question: "The 'financialisation of everyday life' refers to:", options: [{ label: "Everyone becoming a financial advisor" }, { label: "The extension of financial logic into daily practices like credit, subscriptions, and variable debt" }, { label: "Government regulation of household spending" }, { label: "Banks opening more branches" }], correctIndex: 1, explanation: "Financialisation describes how credit cards, buy-now-pay-later, subscriptions, and variable-rate debt have transformed households into managers of mini financial portfolios." },
      ],
    },
    unitTest: {
      title: "Module 1 Unit Test",
      questions: [
        { question: "David Graeber argued that money originated from:", options: [{ label: "Barter systems" }, { label: "Credit systems and reciprocal obligations" }, { label: "Government mints" }, { label: "Precious metals" }], correctIndex: 1, explanation: "Graeber's 'Debt: The First 5000 Years' demonstrates that money arose from credit and debt systems, not from barter as commonly taught." },
        { question: "The 'double coincidence of wants' problem refers to:", options: [{ label: "Both parties wanting the same thing" }, { label: "Both parties needing to want what the other has for barter to work" }, { label: "Governments wanting different currencies" }, { label: "Banks charging double interest" }], correctIndex: 1, explanation: "Barter requires A wanting what B has AND B wanting what A has simultaneously — a coordination problem that money solves." },
        { question: "What percentage of modern money exists as digital ledger entries?", options: [{ label: "About 50%" }, { label: "About 70%" }, { label: "Over 90%" }, { label: "About 30%" }], correctIndex: 2, explanation: "In contemporary economies, over 90% of money exists as digital entries in banking systems, not as physical cash." },
        { question: "The diamonds vs. water paradox illustrates which driver of value?", options: [{ label: "Utility only" }, { label: "Scarcity vs utility in determining exchange value" }, { label: "Government pricing" }, { label: "Manufacturing cost" }], correctIndex: 1, explanation: "Water has high use value but low exchange value (abundant), while diamonds have low use value but high exchange value (scarce) — illustrating how scarcity shapes market price." },
        { question: "Present bias manifests in personal finance as:", options: [{ label: "Saving too much for the future" }, { label: "Under-saving and underinvesting due to preference for immediate consumption" }, { label: "Investing only in present-day companies" }, { label: "Paying bills on time" }], correctIndex: 1, explanation: "Present bias causes preference for immediate rewards over delayed benefits, leading to under-saving, underinvesting, and overconsumption." },
        { question: "Mental accounting leads to financial errors because:", options: [{ label: "People use calculators incorrectly" }, { label: "People treat money differently based on arbitrary categories rather than fungibly" }, { label: "Banks make accounting mistakes" }, { label: "Tax calculations are complex" }], correctIndex: 1, explanation: "Mental accounting means treating money differently based on source or category (e.g., 'fun money' from bonuses) rather than recognising all dollars are economically identical." },
        { question: "Which of the following is NOT a pillar supporting fiat currency value?", options: [{ label: "State authority" }, { label: "Tax obligations" }, { label: "Gold backing" }, { label: "Network effects" }], correctIndex: 2, explanation: "Fiat currencies are supported by state authority, legal tender laws, tax obligations, and network effects — but NOT by gold or commodity backing (that ended in 1971)." },
        { question: "Metcalfe's Law is relevant to money because:", options: [{ label: "It predicts inflation rates" }, { label: "It explains why currencies gain value as more people adopt them" }, { label: "It calculates interest rates" }, { label: "It determines tax brackets" }], correctIndex: 1, explanation: "Metcalfe's Law describes how network value grows with participation — explaining why dominant currencies, payment systems, and platforms tend toward monopoly." },
        { question: "The endowment effect causes people to:", options: [{ label: "Give away possessions easily" }, { label: "Overvalue things simply because they own them" }, { label: "Buy only endowed products" }, { label: "Invest in endowment funds" }], correctIndex: 1, explanation: "The endowment effect means people assign higher value to items they own compared to identical items they don't own, leading to irrational holding behaviour." },
        { question: "Modern advertising primarily sells:", options: [{ label: "Product features and specifications" }, { label: "Identities and aspirations through dopamine-driven engagement" }, { label: "Factual price comparisons" }, { label: "Government-approved information" }], correctIndex: 1, explanation: "Modern firms employ behavioural psychologists and data scientists to sell identities and aspirations via dopamine loops, not merely products." },
      ],
    },
  },

  // ─── MODULE 2 ────────────────────────────────────────────────
  {
    id: "income-human-capital",
    number: 2,
    title: "Income, Human Capital, and the Production of Value",
    subtitle: "How income is generated, structured, and influenced by labour markets, bargaining, and ownership",
    description: "Examine income as a socio-economic construct — from labour markets and credentialism to entrepreneurship, taxation, and the dynamics that influence earning power across a lifetime.",
    icon: "Briefcase",
    color: "hsl(200, 50%, 50%)",
    lessons: [
      {
        id: "m2-l1", title: "Forms of Income and Economic Structures", duration: "10 min",
        sections: [
          { heading: "Categories of Income", body: "Economists divide income into categories with fundamentally different properties:\n\n• **Labour income** — earned by trading time and skills for wages or salaries\n• **Business income** — produced by entrepreneurial activity\n• **Capital income** — from ownership of productive assets yielding dividends, rents, or interest\n• **Transfer income** — government redistribution or social benefits\n• **Informal income** — unregulated or non-taxed markets\n\nThe structure of income matters because **taxation, scalability, and risk profiles differ radically** across these categories." },
          { heading: "Active vs Leveraged vs Passive Income", body: "Popular finance often oversimplifies 'passive income,' but academically we distinguish:\n\n• **Active income** — requires direct labour (e.g., employment)\n• **Leveraged income** — scales through systems (e.g., royalties, licensing, franchising)\n• **Passive income** — derives from ownership of capital assets (e.g., index funds, rents)\n\n**The wealthy do not work more hours; they shift from labour-dependent income to capital-dependent income over time.** This transition is the fundamental mechanism of wealth accumulation in capitalist economies." },
        ],
        quiz: {
          question: "What fundamentally distinguishes how the wealthy earn income from how most people earn?",
          options: [
            { label: "They work longer hours at higher-paying jobs" },
            { label: "They shift from labour-dependent to capital-dependent income over time" },
            { label: "They receive more government transfers" },
            { label: "They earn primarily through informal markets" },
          ],
          correctIndex: 1,
          explanation: "The wealthy transition from trading time for money (labour income) to owning assets that generate returns (capital income). This shift — not harder work — is the primary engine of wealth accumulation.",
        },
      },
      {
        id: "m2-l2", title: "Labour Markets, Skills, and Human Capital", duration: "11 min",
        sections: [
          { heading: "Human Capital Theory", body: "**Human capital** refers to skills, education, health, and experience that increase productivity. In neoclassical models, wages equal marginal productivity. In practice, wages are influenced by:\n\n• Bargaining power\n• Credential barriers\n• Discrimination\n• Cyclic economic conditions\n• Industry concentration\n• Network access\n\nThis contradicts the simplistic belief that individuals earn strictly 'what they are worth.'" },
          { heading: "Credentialism and Signalling", body: "Sociologists argue education often functions as a **signal** rather than simply a skill acquisition tool. Degrees signal conformity, perseverance, cultural capital, and social class membership.\n\n**Credential inflation** raises educational requirements for jobs that do not necessarily require the knowledge. Computer science majors outperform general humanities majors, but graduates from **elite humanities programmes often outperform technical graduates from non-elite institutions** due to network effects.\n\nThis demonstrates that education's economic value comes partly from what you learn, but substantially from the **social sorting and network access** it provides." },
          { heading: "The Earnings Premium", body: "Statistical data shows education correlates with income, but the correlation is filtered by **field of study, geographic mobility, industry selection, and access to elite institutions**.\n\nThe most valuable career positioning often comes from acquiring **rare skills at the intersection of scarcity and demand**, not from accumulating credentials alone." },
        ],
        quiz: {
          question: "Why do graduates from elite humanities programmes sometimes outperform technical graduates from non-elite institutions?",
          options: [
            { label: "Humanities skills are more valuable than technical skills" },
            { label: "Network effects and social capital from elite institutions override field of study" },
            { label: "Technical fields pay less than humanities" },
            { label: "Elite institutions teach better humanities content" },
          ],
          correctIndex: 1,
          explanation: "Education functions partly as social sorting — elite institutions provide network access, cultural capital, and signalling power that can override the earnings premium of technical fields.",
        },
      },
      {
        id: "m2-l3", title: "Bargaining Power and Compensation", duration: "9 min",
        sections: [
          { heading: "Wage Determination", body: "Compensation is shaped by more than employer generosity. Core determinants include **market scarcity of skills, unionisation, economic cycles, monopsony power** (one-sided labour markets), and **information asymmetry**.\n\nLabour markets often feature **pay opacity**, which benefits employers. Salary transparency increases bargaining power for workers — this is why companies historically discouraged salary discussions." },
          { heading: "Negotiation as Economic Agency", body: "Most individuals never negotiate salaries. This produces lifetime losses measured in **six or seven figures**.\n\nNegotiation involves anchoring salary expectations, identifying value contributions, managing employer psychology, and understanding your **reservation wage** (the minimum you'd accept).\n\n**Negotiation advantages compound.** People who negotiate early in careers benefit from a higher baseline that compounds through annual raises over decades. A $5,000 difference at age 25 can become $500,000+ by age 55 through compounding raises and invested savings." },
        ],
        quiz: {
          question: "Why does pay opacity in labour markets primarily benefit employers?",
          options: [
            { label: "It simplifies payroll administration" },
            { label: "It reduces workers' bargaining power by creating information asymmetry" },
            { label: "It protects employee privacy" },
            { label: "It ensures equal pay for all workers" },
          ],
          correctIndex: 1,
          explanation: "When workers don't know what others earn, they lack the information needed to negotiate effectively. Pay opacity creates information asymmetry that systematically benefits the employer side.",
        },
      },
      {
        id: "m2-l4", title: "Entrepreneurship, Ownership, and Taxes", duration: "10 min",
        sections: [
          { heading: "The Power of Ownership", body: "Ownership is the primary engine of wealth in capitalist economies. Business income introduces **nonlinear payoff structures** — unlike wage labour, entrepreneurial returns can be scalable, asymmetric, and uncapped. But they are also volatile with high failure rates.\n\nHistorically, the upper classes derive most wealth not from work but from **equity stakes, real estate, finance, intellectual property, royalties, and licensing**.\n\nThomas Piketty's famous insight: **Capital > Labour > Consumption** — returns to capital consistently outpace returns to labour over time." },
          { heading: "Gross vs Net Income", body: "Understanding income requires understanding what portion is retained after federal tax, provincial/state tax, payroll contributions, healthcare premiums, pensions, and benefits deductions.\n\nTwo individuals earning the same gross income can have **radically different net incomes** depending on dependent claims, residency, filing status, and usage of tax-advantaged accounts." },
          { heading: "Marginal vs Effective Tax Rates", body: "Public misunderstanding of taxation leads many to avoid higher earnings out of fear that they will 'lose money.' In reality, **marginal rates apply only to the final bracket** and effective rates remain lower.\n\nEarning more **always** means more take-home pay. This is crucial for financial decision-making and career planning." },
        ],
        quiz: {
          question: "Piketty's central insight about wealth inequality is that:",
          options: [
            { label: "Hard work always leads to wealth" },
            { label: "Returns to capital consistently outpace returns to labour over time" },
            { label: "Government redistribution eliminates inequality" },
            { label: "Education is the primary driver of wealth" },
          ],
          correctIndex: 1,
          explanation: "Piketty demonstrated that capital returns (r) tend to exceed economic growth (g), meaning those who own capital accumulate wealth faster than those who depend on labour income — a fundamental driver of inequality.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 2 Knowledge Check",
      questions: [
        { question: "The wealthy primarily build wealth by:", options: [{ label: "Working more hours than others" }, { label: "Shifting from labour-dependent to capital-dependent income" }, { label: "Receiving larger government transfers" }, { label: "Having higher IQs" }], correctIndex: 1, explanation: "Wealth accumulation comes from transitioning income sources from active labour to capital ownership — assets that generate returns regardless of hours worked." },
        { question: "Human capital includes:", options: [{ label: "Only formal education" }, { label: "Skills, education, health, experience, and earning potential" }, { label: "Physical possessions" }, { label: "Bank account balances" }], correctIndex: 1, explanation: "Human capital encompasses all productive capabilities — education, skills, health, experience — that determine earning potential over a lifetime." },
        { question: "Credential inflation means:", options: [{ label: "Degrees becoming more expensive" }, { label: "Rising educational requirements for jobs that don't necessarily need the knowledge" }, { label: "Inflation in the education sector" }, { label: "Credentials losing accreditation" }], correctIndex: 1, explanation: "Credential inflation raises the educational bar for job entry without a corresponding increase in the actual knowledge required for the role." },
        { question: "Negotiation advantages compound because:", options: [{ label: "Employers reward negotiators with bonuses" }, { label: "A higher starting salary creates a baseline that grows through annual raises over decades" }, { label: "Negotiation skills improve with practice" }, { label: "Tax brackets favour negotiators" }], correctIndex: 1, explanation: "A higher starting salary compounds through percentage-based raises, creating a $500,000+ lifetime difference from an initial $5,000 negotiation win." },
        { question: "Marginal tax rates mean:", options: [{ label: "All income is taxed at the highest bracket rate" }, { label: "Only income above each threshold is taxed at the higher rate" }, { label: "Tax rates are the same for everyone" }, { label: "You can choose your tax rate" }], correctIndex: 1, explanation: "Income is taxed in layers — each bracket only applies to income within that range. Earning more always increases take-home pay." },
      ],
    },
    unitTest: {
      title: "Module 2 Unit Test",
      questions: [
        { question: "Which income type is most scalable?", options: [{ label: "Hourly wages" }, { label: "Capital income from ownership" }, { label: "Government transfers" }, { label: "Overtime pay" }], correctIndex: 1, explanation: "Capital income scales through ownership — dividends, rents, and appreciation grow without proportional time investment." },
        { question: "Monopsony power in labour markets means:", options: [{ label: "Workers have all the bargaining power" }, { label: "One dominant employer suppresses wages in a market" }, { label: "Multiple employers compete for workers" }, { label: "Government sets all wages" }], correctIndex: 1, explanation: "Monopsony occurs when one or few employers dominate a labour market, giving them disproportionate power to set wages below competitive levels." },
        { question: "Education primarily functions as economic signalling when:", options: [{ label: "Students learn job-specific skills" }, { label: "Degrees demonstrate conformity, perseverance, and class membership more than technical knowledge" }, { label: "Universities teach only practical skills" }, { label: "Employers ignore educational background" }], correctIndex: 1, explanation: "Signalling theory argues that much of education's economic value comes from what it signals about the graduate (persistence, social class) rather than specific knowledge acquired." },
        { question: "Reservation wage refers to:", options: [{ label: "The highest salary you could earn" }, { label: "The minimum compensation you would accept for a job" }, { label: "The wage governments mandate" }, { label: "What your employer reserves for bonuses" }], correctIndex: 1, explanation: "Your reservation wage is the lowest compensation you'd accept — understanding it gives you clarity during negotiations and prevents accepting below your worth." },
        { question: "Why do two people with identical gross incomes often have different net incomes?", options: [{ label: "Banks charge different fees" }, { label: "Differences in dependents, residency, filing status, and tax-advantaged account usage" }, { label: "Employers pay differently" }, { label: "Currency exchange rates" }], correctIndex: 1, explanation: "Tax deductions, dependents, residency, filing status, and strategic use of tax-advantaged accounts create significant variation in take-home pay at the same gross income." },
        { question: "Business income differs from labour income because:", options: [{ label: "It's always higher" }, { label: "It has nonlinear, scalable, and uncapped payoff structures but higher volatility" }, { label: "It's tax-free" }, { label: "It requires no effort" }], correctIndex: 1, explanation: "Entrepreneurial income can scale exponentially but comes with higher risk and volatility — unlike the linear, predictable nature of wage income." },
        { question: "Social capital in the context of income refers to:", options: [{ label: "Government social programmes" }, { label: "Networks and connections that create economic opportunities" }, { label: "Social media followers" }, { label: "Public speaking skills" }], correctIndex: 1, explanation: "Social capital — networks, relationships, and connections — creates access to opportunities, information, and resources that influence earning potential." },
        { question: "Why does earning more ALWAYS increase take-home pay under progressive taxation?", options: [{ label: "Tax rates decrease as income rises" }, { label: "Higher marginal rates only apply to income above each bracket threshold, not to all income" }, { label: "Governments cap tax collection" }, { label: "Employers compensate for higher taxes" }], correctIndex: 1, explanation: "In progressive systems, only the incremental income above each threshold faces the higher rate — so total tax is always less than marginal rate × total income." },
        { question: "Income as a 'life course variable' means:", options: [{ label: "Income is fixed throughout life" }, { label: "Income trajectories are influenced by education, mobility, health, and macroeconomic forces over time" }, { label: "Everyone earns the same over a lifetime" }, { label: "Income only matters at retirement" }], correctIndex: 1, explanation: "Income is dynamic — shaped by career decisions, industry shifts, health events, technological displacement, and macroeconomic conditions across a lifetime." },
        { question: "The three forms of capital that interact with income are:", options: [{ label: "Savings, investments, property" }, { label: "Economic capital, cultural capital, social capital" }, { label: "Human capital, physical capital, digital capital" }, { label: "Debt, equity, cash" }], correctIndex: 1, explanation: "Bourdieu identified economic capital (money/assets), cultural capital (habits, credentials, tastes), and social capital (networks) as interacting forces that determine class position." },
      ],
    },
  },

  // ─── MODULE 3 ────────────────────────────────────────────────
  {
    id: "budgeting-saving-cashflow",
    number: 3,
    title: "Budgeting, Saving, and Personal Cash Flow Systems",
    subtitle: "Building the operational infrastructure of personal finance through systems, psychology, and surplus creation",
    description: "Understand how money moves across a household, design systems that create surplus capital consistently, and make saving behaviour compatible with human psychology.",
    icon: "Wallet",
    color: "hsl(150, 45%, 45%)",
    lessons: [
      {
        id: "m3-l1", title: "Budgeting as Resource Allocation", duration: "10 min",
        sections: [
          { heading: "Budgeting in Economic Terms", body: "In introductory personal finance, budgeting is often defined as tracking income and expenses. This definition is insufficient.\n\nAt a higher analytical level, budgeting is better understood as the process of **allocating scarce financial resources among competing uses under conditions of uncertainty and temporal delay**. It resembles microeconomic decision-making, where households act as consumption units facing trade-offs between current and future utility." },
          { heading: "The Household as a Financial Firm", body: "From a corporate finance perspective, households imitate small firms. They possess:\n\n• Revenue inflows\n• Operating expenses\n• Capital expenditures\n• Depreciation of durable goods\n• Balance sheet liabilities\n• Contingent risks\n• Liquidity needs\n\nYet unlike firms, households rarely operate with **formal accounting systems, reserves, or risk management protocols**. This lack of structure produces fragile financial conditions even in high-income households." },
          { heading: "Budgeting Models", body: "Several budgeting architectures exist:\n\n• **Zero-based budgeting** — assigns every unit of currency a purpose, eliminating unallocated surplus which tends to be consumed by default\n• **Envelope/category-based budgeting** — imposes spending discipline through constraint\n• **Percentage allocation systems** (e.g., 50/30/20) — useful for initial structure but oversimplified\n• **Pay-yourself-first systems** — use automatic savings to remove decision fatigue\n\nEach model has different **behavioural properties**. Advanced structures require individual customisation based on geography, family structure, cost of living, income volatility, and long-term goals." },
        ],
        quiz: {
          question: "Why is the common definition of budgeting as 'tracking income and expenses' insufficient?",
          options: [
            { label: "Because tracking is too time-consuming" },
            { label: "Because budgeting is actually resource allocation under uncertainty and temporal delay" },
            { label: "Because income and expenses are unpredictable" },
            { label: "Because most people use apps instead of spreadsheets" },
          ],
          correctIndex: 1,
          explanation: "Budgeting at a higher level is the allocation of scarce resources among competing uses under uncertainty — it's a decision-making framework, not merely an accounting exercise.",
        },
      },
      {
        id: "m3-l2", title: "The Psychology of Saving", duration: "9 min",
        sections: [
          { heading: "Temporal Discounting and Present Bias", body: "Saving produces no immediate experiential reward. This creates a **psychological disadvantage** compared to consumption, which provides immediate utility or status reinforcement.\n\nBehavioural economists study this through the lens of **hyperbolic discounting** — individuals disproportionately discount future benefits relative to present rewards. This is why people consistently fail to save despite knowing they should." },
          { heading: "Automaticity and Environmental Design", body: "Research shows saving adherence increases when savings are **automatic, invisible, and default-based** rather than choice-based.\n\nThis is the mechanism that makes employer-sponsored retirement plans effective. **Choice friction** reduces participation, while **opt-out structures** increase saving rates dramatically.\n\nAutomation is a form of **personal financial engineering** — designing systems where the right action happens without requiring willpower." },
          { heading: "Social Norms and Saving Behaviour", body: "Cultural expectations about spending and lifestyle shape savings rates across societies. East Asian households typically maintain higher savings rates than North American households due to higher precautionary motives, weaker social safety nets, and cultural norms around intergenerational support.\n\nThis demonstrates that saving is **not solely a matter of financial literacy but embedded in sociocultural context**." },
        ],
        quiz: {
          question: "Why do opt-out retirement savings structures produce higher saving rates than opt-in structures?",
          options: [
            { label: "They offer better investment returns" },
            { label: "They exploit default bias — people tend to accept the default option rather than actively choosing" },
            { label: "They have lower fees" },
            { label: "Employers contribute more in opt-out plans" },
          ],
          correctIndex: 1,
          explanation: "Default bias means most people accept whatever is pre-selected. Opt-out plans make saving the default, so inertia works FOR saving instead of against it.",
        },
      },
      {
        id: "m3-l3", title: "Emergency Funds and Liquidity Reserves", duration: "8 min",
        sections: [
          { heading: "Purpose of Emergency Reserves", body: "Unexpected events are not rare — they are **statistically inevitable**. Emergency reserves protect against income loss, medical costs, vehicle breakdowns, relocation needs, and legal contingencies.\n\n**Without emergency reserves, negative events convert into debt**, which compounds fragility. The emergency fund breaks this cycle by providing a buffer between unexpected costs and credit dependence." },
          { heading: "Liquidity Requirements and Time Horizons", body: "Liquidity needs can be categorised into time horizons:\n\n• **Very short-term** (days to weeks)\n• **Short-term** (months) — where emergency funds sit\n• **Long-term** (years)\n\nEmergency funds must be **liquid, stable, and accessible**. Investment instruments designed for growth are inappropriate due to volatility risk and withdrawal delays." },
          { heading: "Determining Size", body: "Classical personal finance recommends three to six months of expenses. More nuanced analysis considers:\n\n• Employment stability\n• Industry risk\n• Self-employment status\n• Number of dependents\n• Medical vulnerability\n• Geographic mobility\n\n**High-volatility earners may require nine to twelve months of reserves.** The appropriate size is a function of individual risk profile, not a universal rule." },
        ],
        quiz: {
          question: "Why are growth-oriented investment instruments inappropriate for emergency funds?",
          options: [
            { label: "They don't earn enough returns" },
            { label: "They introduce volatility risk and withdrawal delays when funds are needed most" },
            { label: "Banks don't allow them" },
            { label: "They have higher tax implications" },
          ],
          correctIndex: 1,
          explanation: "Emergency funds need to be liquid, stable, and immediately accessible. Market volatility could reduce the fund exactly when you need it most, and withdrawal delays prevent immediate access.",
        },
      },
      {
        id: "m3-l4", title: "Cash Flow Management and Surplus Creation", duration: "9 min",
        sections: [
          { heading: "The Surplus Gap as Core Metric", body: "The most important number in personal finance is not income, but the **surplus gap**:\n\n**Surplus = Income − Expenses**\n\nWealth accumulation requires sustained positive surplus. Without surplus, investing and debt reduction are impossible. This simple equation governs all financial trajectories." },
          { heading: "Expense Compression vs Income Expansion", body: "Individuals can create surplus through **expense compression**, **income expansion**, or both simultaneously.\n\nExpense compression has immediate impact but **finite limits**. Income expansion has slower impact but **no upper bound**. Wealthy households rely more on income expansion than austerity.\n\n**Lifestyle inflation** (or hedonic drift) — increasing consumption proportionally as income rises — prevents surplus accumulation and explains why many high earners feel financially constrained despite objectively high income." },
          { heading: "Personal Accounting Systems", body: "Advanced budgeting incorporates elements of accounting: cash flow statements, personal balance sheets, net worth tracking, and liability schedules.\n\n**Net worth** is a superior measure of financial health compared to income. Two people earning the same salary can have radically different net worths based on their surplus management.\n\nAutomation reduces behavioural error by removing reliance on willpower — automated savings transfers, bill payments, and debt payments constitute a form of **personal financial engineering**." },
        ],
        quiz: {
          question: "Why is net worth a superior measure of financial health compared to income?",
          options: [
            { label: "Net worth is always higher than income" },
            { label: "Income measures flow while net worth measures accumulated wealth — the actual result of financial management" },
            { label: "Banks use net worth for credit decisions" },
            { label: "Net worth includes future earnings" },
          ],
          correctIndex: 1,
          explanation: "Income is a flow (money coming in) while net worth is a stock (accumulated assets minus liabilities). Two identical incomes can produce vastly different net worths based on surplus management.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 3 Knowledge Check",
      questions: [
        { question: "Households resemble financial firms because they have:", options: [{ label: "Stock listings" }, { label: "Revenue inflows, expenses, liabilities, and liquidity needs" }, { label: "Boards of directors" }, { label: "Government regulation" }], correctIndex: 1, explanation: "Households have income (revenue), spending (expenses), debts (liabilities), and cash needs (liquidity) — but unlike firms, they rarely manage these with formal systems." },
        { question: "Zero-based budgeting eliminates:", options: [{ label: "All spending" }, { label: "Unallocated surplus that tends to be consumed by default" }, { label: "The need for income" }, { label: "Tax obligations" }], correctIndex: 1, explanation: "By assigning every dollar a purpose, zero-based budgeting eliminates the 'leftover' money that typically gets spent unconsciously." },
        { question: "Hyperbolic discounting causes people to:", options: [{ label: "Save too much" }, { label: "Disproportionately prefer present rewards over future benefits" }, { label: "Invest too aggressively" }, { label: "Avoid all spending" }], correctIndex: 1, explanation: "Hyperbolic discounting makes immediate consumption feel disproportionately rewarding compared to future savings, undermining saving behaviour." },
        { question: "High-volatility earners should maintain emergency reserves of:", options: [{ label: "1-2 months" }, { label: "3-6 months" }, { label: "9-12 months" }, { label: "No emergency fund needed" }], correctIndex: 2, explanation: "Self-employed, commission-based, or high-risk-industry workers face greater income uncertainty and should maintain 9-12 months of reserves." },
        { question: "The most important number in personal finance is:", options: [{ label: "Gross income" }, { label: "The surplus gap (income minus expenses)" }, { label: "Credit score" }, { label: "Tax rate" }], correctIndex: 1, explanation: "Surplus = Income − Expenses. Without positive surplus, wealth accumulation through investing and debt reduction is impossible." },
      ],
    },
    unitTest: {
      title: "Module 3 Unit Test",
      questions: [
        { question: "Pay-yourself-first systems work by:", options: [{ label: "Paying bills first" }, { label: "Automatically saving before spending decisions can be made" }, { label: "Increasing income" }, { label: "Reducing taxes" }], correctIndex: 1, explanation: "Pay-yourself-first uses automation to save before spending, removing decision fatigue and ensuring savings happen regardless of spending impulses." },
        { question: "East Asian households typically save more than North American households due to:", options: [{ label: "Higher incomes" }, { label: "Higher precautionary motives, weaker safety nets, and cultural norms" }, { label: "Lower tax rates" }, { label: "Government mandates" }], correctIndex: 1, explanation: "Cultural context — including precautionary saving motives and intergenerational support norms — drives higher savings rates in East Asian societies." },
        { question: "Lifestyle inflation explains why:", options: [{ label: "Prices rise over time" }, { label: "High earners often feel financially constrained despite objectively high income" }, { label: "Inflation erodes savings" }, { label: "Lifestyles improve naturally" }], correctIndex: 1, explanation: "When consumption rises proportionally with income (hedonic drift), no surplus is created despite earning more — leaving high earners feeling constrained." },
        { question: "Expense compression differs from income expansion in that:", options: [{ label: "It's always more effective" }, { label: "It has immediate impact but finite limits, while income expansion has no upper bound" }, { label: "It's only for low-income households" }, { label: "It increases taxes" }], correctIndex: 1, explanation: "You can only cut expenses so far (finite limits), but income can grow without bound — wealthy households rely more on income expansion." },
        { question: "Emergency funds break the debt cycle by:", options: [{ label: "Earning high returns" }, { label: "Providing a buffer so unexpected costs don't convert into debt" }, { label: "Replacing income permanently" }, { label: "Reducing insurance premiums" }], correctIndex: 1, explanation: "Without reserves, unexpected expenses go on credit cards at high interest. Emergency funds absorb shocks without creating debt spirals." },
        { question: "A personal balance sheet tracks:", options: [{ label: "Monthly income only" }, { label: "Assets minus liabilities to determine net worth" }, { label: "Daily expenses" }, { label: "Tax deductions" }], correctIndex: 1, explanation: "A personal balance sheet lists what you own (assets) minus what you owe (liabilities), revealing net worth — the true measure of financial health." },
        { question: "Dynamic budgets differ from static budgets because:", options: [{ label: "They're more expensive to maintain" }, { label: "They evolve in response to income variability, life events, and changing priorities" }, { label: "They only work for businesses" }, { label: "They don't track expenses" }], correctIndex: 1, explanation: "Most households need dynamic budgets because income, expenses, and priorities change — static budgets break down under variable conditions." },
        { question: "Choice friction in savings means:", options: [{ label: "Saving becomes easier with more choices" }, { label: "The effort required to make a saving decision reduces participation rates" }, { label: "Friction from credit card transactions" }, { label: "Banks making saving harder" }], correctIndex: 1, explanation: "When saving requires active choice and effort, participation drops. Reducing friction through automation and defaults increases saving rates." },
        { question: "Automation is described as 'personal financial engineering' because:", options: [{ label: "It requires an engineering degree" }, { label: "It designs systems where correct financial behaviour happens without relying on willpower" }, { label: "It's complex and technical" }, { label: "Only engineers can use it" }], correctIndex: 1, explanation: "Like engineering a system, financial automation designs processes where the right outcome (saving, bill payment) occurs by default — removing the human error of willpower depletion." },
        { question: "The household's lack of formal financial systems produces:", options: [{ label: "Higher returns" }, { label: "Fragile financial conditions even in high-income households" }, { label: "Better spending decisions" }, { label: "Lower tax obligations" }], correctIndex: 1, explanation: "Unlike firms with accounting departments and risk protocols, households rarely have formal systems — leading to financial fragility regardless of income level." },
      ],
    },
  },

  // ─── MODULE 4 ────────────────────────────────────────────────
  {
    id: "debt-credit-leverage",
    number: 4,
    title: "Debt, Credit, and the Economics of Borrowing",
    subtitle: "Understanding leverage, interest, credit systems, and the structural forces behind borrowing",
    description: "Examine debt from household finance, behavioural psychology, macroeconomic forces, and risk theory — from interest mechanics and credit scoring to Minsky's financial instability hypothesis.",
    icon: "CreditCard",
    color: "hsl(0, 55%, 50%)",
    lessons: [
      {
        id: "m4-l1", title: "Understanding Debt and Interest", duration: "11 min",
        sections: [
          { heading: "Definition and Function of Debt", body: "Debt is a contractual agreement that allows borrowing resources in the present in exchange for repayment in the future plus interest. In financial terms, debt **reallocates resources across time domains**.\n\nFor households, debt converts future earnings into present purchasing power. For businesses, debt converts expected future profits into present investment capital." },
          { heading: "Types of Debt", body: "Debt can be categorised by purpose, collateral, interest structure, and repayment terms:\n\n• **Consumer credit** (credit cards, personal loans)\n• **Student loans**\n• **Auto loans**\n• **Mortgages**\n• **Medical debt**\n• **Business loans**\n• **Government debt**\n\n**Secured debt** is backed by collateral and offers lower interest rates. **Unsecured debt** relies solely on borrower creditworthiness and carries higher risk premiums." },
          { heading: "Interest as Price of Time and Risk", body: "Interest rates compensate lenders for the **time value of money**, credit risk, inflation risk, and opportunity cost.\n\nLong-term consumer debt is nearly always compound — interest calculated on principal plus accumulated interest. **Variable interest loans** shift with benchmark rates set by central banks, linking household borrowing costs directly to macroeconomic policy.\n\nLoans can be fully amortising (gradually reducing principal), partially amortising, or interest-only (introducing refinancing risk at maturity)." },
        ],
        quiz: {
          question: "What does debt fundamentally do in economic terms?",
          options: [
            { label: "Creates free money for borrowers" },
            { label: "Reallocates resources across time domains — converting future income to present purchasing power" },
            { label: "Eliminates risk for lenders" },
            { label: "Reduces the money supply in an economy" },
          ],
          correctIndex: 1,
          explanation: "Debt is a temporal reallocation mechanism — it allows present consumption of resources that will be paid for with future earnings, plus interest as compensation for time and risk.",
        },
      },
      {
        id: "m4-l2", title: "Leverage Theory and Capital Formation", duration: "10 min",
        sections: [
          { heading: "Leverage in Microeconomics", body: "**Leverage** refers to the use of borrowed capital to increase exposure to an asset. The goal is to magnify returns. However, leverage increases potential losses symmetrically.\n\nWealth accumulation often involves **intelligent leverage**, while financial ruin often involves **uncontrolled leverage**.\n\nExample: A $50,000 down payment controlling $300,000 of real estate. If the property rises 5%, you gain $15,000 on a $50,000 investment — a 30% return through leverage." },
          { heading: "Leverage and Wealth Inequality", body: "Ownership classes use leverage to **acquire capital assets**. Labour-income classes use leverage for **consumption**. The former increases net worth over time; the latter often decreases it.\n\nThis divergence contributes to wealth inequality. **Mortgage debt for real estate acquisition** builds equity. **Credit card debt for lifestyle consumption** destroys it. The same mechanism — borrowing — produces opposite outcomes depending on what it finances." },
        ],
        quiz: {
          question: "Why does leverage produce opposite wealth outcomes for ownership classes vs labour classes?",
          options: [
            { label: "Ownership classes have better credit scores" },
            { label: "Ownership classes leverage to acquire appreciating assets while labour classes leverage for depreciating consumption" },
            { label: "Labour classes pay higher interest rates" },
            { label: "Government policies favour the wealthy" },
          ],
          correctIndex: 1,
          explanation: "The critical distinction is what leverage finances: appreciating assets (real estate, business equity) build wealth, while consumption leverage (credit cards for lifestyle) destroys it.",
        },
      },
      {
        id: "m4-l3", title: "Credit Systems and Social Sorting", duration: "9 min",
        sections: [
          { heading: "Credit Scoring Systems", body: "Credit scoring reduces borrower evaluation to numerical models incorporating:\n\n• Repayment history\n• Utilisation ratios\n• Credit age\n• Account diversity\n• Recent inquiries\n\nThese systems influence eligibility for loans, insurance rates, rental markets, and even employment in some industries." },
          { heading: "Social Implications of Credit", body: "Creditworthiness functions as a form of **economic citizenship**. Poor credit restricts mobility, increases cost of borrowing, and imposes penalties on lower-income populations.\n\nThis contributes to **financial stratification** — those with existing access to credit can build more credit, while those without face higher costs and fewer opportunities. The system has self-reinforcing dynamics that often widen inequality." },
        ],
        quiz: {
          question: "In what way does creditworthiness function as 'economic citizenship'?",
          options: [
            { label: "It determines your right to vote on economic policy" },
            { label: "It determines access to loans, housing, insurance, and employment — basic economic participation" },
            { label: "It replaces the need for actual currency" },
            { label: "It's a government-issued identity document" },
          ],
          correctIndex: 1,
          explanation: "Credit scores gatekeep access to housing, borrowing, insurance rates, and even jobs — making creditworthiness a de facto requirement for full economic participation.",
        },
      },
      {
        id: "m4-l4", title: "Debt Psychology, Cycles, and Predation", duration: "11 min",
        sections: [
          { heading: "Behavioural Dimensions of Borrowing", body: "Individuals often underestimate future repayment burden due to **optimism bias** and **hyperbolic discounting**. Borrowers overvalue present consumption relative to future obligations.\n\nCredit card companies exploit these biases through **minimum payment framing** and billing cycle manipulation. Status consumption drives debt as individuals borrow to access goods that signal social identity or class membership." },
          { heading: "Minsky's Financial Instability Hypothesis", body: "Hyman Minsky argued that prolonged economic stability encourages increasing use of leverage, eventually creating instability. Debt cycles move through three stages:\n\n1. **Hedge finance** — able to pay principal and interest\n2. **Speculative finance** — able to pay interest only\n3. **Ponzi finance** — unable to pay either without refinancing\n\nHouseholds mirror these patterns when credit dependence escalates. The 2008 financial crisis was a textbook Minsky moment." },
          { heading: "Predatory Lending and Exploitation", body: "Predatory lending arises when lenders exploit **information asymmetry** and **psychological vulnerability**:\n\n• Payday loans (400%+ APR)\n• Subprime mortgage marketing\n• Rent-to-own schemes\n• Medical debt financing\n\nThese mechanisms **extract surplus from vulnerable populations**, turning debt from a tool of capital formation into a mechanism of exploitation." },
        ],
        quiz: {
          question: "Minsky's financial instability hypothesis argues that:",
          options: [
            { label: "Markets are always stable when properly regulated" },
            { label: "Prolonged stability encourages increasing leverage, eventually creating instability" },
            { label: "Debt always leads to economic growth" },
            { label: "Government spending causes all financial crises" },
          ],
          correctIndex: 1,
          explanation: "Minsky demonstrated that stability itself breeds instability — as confidence grows, actors take on progressively more leverage, moving from hedge to speculative to Ponzi finance until the system collapses.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 4 Knowledge Check",
      questions: [
        { question: "Debt fundamentally reallocates:", options: [{ label: "Risk between countries" }, { label: "Resources across time domains" }, { label: "Wealth between banks" }, { label: "Labour between industries" }], correctIndex: 1, explanation: "Debt converts future income into present purchasing power — it's a temporal reallocation of resources." },
        { question: "Leverage magnifies:", options: [{ label: "Only returns" }, { label: "Both returns and losses symmetrically" }, { label: "Only losses" }, { label: "Neither returns nor losses" }], correctIndex: 1, explanation: "Leverage amplifies both gains and losses — a 10% move on 5x leverage produces a 50% gain or loss." },
        { question: "Credit scoring influences access to:", options: [{ label: "Only bank loans" }, { label: "Loans, housing, insurance, and even employment" }, { label: "Only credit cards" }, { label: "Only mortgages" }], correctIndex: 1, explanation: "Credit scores affect loan eligibility, rental applications, insurance premiums, and employment decisions in some industries." },
        { question: "Payday loans typically charge:", options: [{ label: "5-10% APR" }, { label: "20-30% APR" }, { label: "100% APR" }, { label: "400%+ APR" }], correctIndex: 3, explanation: "Payday loans charge fees equivalent to 400%+ APR — a form of financial predation targeting vulnerable populations." },
        { question: "The three stages of Minsky's debt cycle are:", options: [{ label: "Growth, peak, decline" }, { label: "Hedge finance, speculative finance, Ponzi finance" }, { label: "Saving, spending, investing" }, { label: "Borrowing, repaying, defaulting" }], correctIndex: 1, explanation: "Minsky described the progression from hedge (can pay principal + interest) to speculative (interest only) to Ponzi (can't pay either without refinancing)." },
      ],
    },
    unitTest: {
      title: "Module 4 Unit Test",
      questions: [
        { question: "Secured debt offers lower interest rates because:", options: [{ label: "Banks prefer secured loans" }, { label: "Collateral reduces lender risk by providing asset recovery upon default" }, { label: "Government regulation requires it" }, { label: "Secured borrowers are always wealthier" }], correctIndex: 1, explanation: "Collateral allows lenders to recover assets if the borrower defaults, reducing their risk and therefore the interest premium charged." },
        { question: "Variable interest rates link household borrowing to:", options: [{ label: "Stock market performance" }, { label: "Central bank monetary policy decisions" }, { label: "Local real estate prices" }, { label: "Individual credit scores only" }], correctIndex: 1, explanation: "Variable rates shift with benchmark rates set by central banks, making household borrowing costs a direct function of macroeconomic policy." },
        { question: "Interest-only loans introduce:", options: [{ label: "Lower total costs" }, { label: "Refinancing risk at maturity since principal is never reduced" }, { label: "Faster equity building" }, { label: "Government guarantees" }], correctIndex: 1, explanation: "Interest-only loans don't reduce principal, so the borrower must refinance or pay the full principal at maturity — introducing significant risk." },
        { question: "Optimism bias in borrowing causes:", options: [{ label: "Accurate financial planning" }, { label: "Underestimation of future repayment burden" }, { label: "Excessive saving" }, { label: "Better credit scores" }], correctIndex: 1, explanation: "Optimism bias leads borrowers to overestimate future income and underestimate repayment difficulty, resulting in excessive borrowing." },
        { question: "Credit card minimum payment framing exploits:", options: [{ label: "Consumer financial literacy" }, { label: "Anchoring bias — the minimum becomes the default payment, maximising interest revenue" }, { label: "Government regulations" }, { label: "Bank competition" }], correctIndex: 1, explanation: "The minimum payment anchors consumers to a low payment amount, extending repayment timelines and maximising interest collected by the card issuer." },
        { question: "The distinction between 'good' and 'bad' debt depends on:", options: [{ label: "The interest rate alone" }, { label: "Whether the borrowed funds acquire appreciating assets or finance depreciating consumption" }, { label: "The lending institution" }, { label: "The borrower's income" }], correctIndex: 1, explanation: "Good debt finances assets that appreciate or generate income exceeding interest costs. Bad debt finances consumption of depreciating items." },
        { question: "Government debt differs from household debt because sovereigns can:", options: [{ label: "Ignore debt obligations" }, { label: "Tax citizens, borrow indefinitely, and sometimes create currency" }, { label: "Default without consequences" }, { label: "Only borrow from domestic banks" }], correctIndex: 1, explanation: "Sovereigns have unique powers — taxation, indefinite borrowing, and (for some) currency issuance — that make government debt fundamentally different from household debt." },
        { question: "Financial stratification through credit means:", options: [{ label: "Everyone has equal access to credit" }, { label: "Those with existing credit access build more credit while those without face higher costs" }, { label: "Credit systems reduce inequality" }, { label: "Banks distribute credit equally" }], correctIndex: 1, explanation: "Credit systems are self-reinforcing: good credit enables more and cheaper credit, while poor credit creates higher costs and fewer opportunities — widening inequality." },
        { question: "Status consumption drives debt when:", options: [{ label: "People buy only necessities" }, { label: "Individuals borrow to acquire goods that signal social identity or class membership" }, { label: "Goods decrease in price" }, { label: "Credit is unavailable" }], correctIndex: 1, explanation: "Sociologists identify consumption as a means of performing status — transforming debt from a financial decision into a cultural practice driven by social signalling." },
        { question: "The 2008 financial crisis exemplified:", options: [{ label: "Successful market regulation" }, { label: "Minsky's hypothesis — stability bred excessive leverage leading to systemic collapse" }, { label: "Benefits of deregulation" }, { label: "The superiority of subprime lending" }], correctIndex: 1, explanation: "The 2008 crisis was a textbook Minsky moment: years of stability encouraged increasingly risky lending (subprime mortgages) until the system collapsed." },
      ],
    },
  },

  // ─── MODULE 5 ────────────────────────────────────────────────
  {
    id: "investment-portfolio",
    number: 5,
    title: "Investment Theory and Portfolio Construction",
    subtitle: "From asset classes and risk theory to behavioural finance and portfolio optimisation",
    description: "Examine the foundations of investment — financial instruments, risk-return tradeoffs, Modern Portfolio Theory, market efficiency, valuation, and the behavioural psychology that creates bubbles and panics.",
    icon: "TrendingUp",
    color: "hsl(152, 45%, 42%)",
    lessons: [
      {
        id: "m5-l1", title: "Investing and Asset Classes", duration: "11 min",
        sections: [
          { heading: "Saving versus Investing", body: "**Saving** preserves purchasing power. **Investing** increases it by deploying capital into productive or appreciating assets. Due to inflation, saving alone leads to erosion of purchasing power over time.\n\nInvestment is the mechanism for individuals to transition from **labour-dependent income to capital-dependent income**. This shift historically separates the working class from the asset-owning class." },
          { heading: "Financial Asset Classes", body: "Major asset classes include:\n\n• **Equities (stocks)** — highest long-term returns (~10% historically), highest volatility\n• **Fixed income (bonds)** — lower returns (~4-6%), lower volatility, often move opposite to stocks\n• **Real estate** — moderate returns, inflation hedge, income-producing\n• **Commodities** — inflation hedge, low correlation to stocks/bonds\n• **Cash equivalents** — lowest return, highest liquidity, risk-free\n• **Alternatives** (private equity, hedge funds, venture capital) — high barriers, long lockups\n\nEach has unique return profiles, volatility levels, liquidity characteristics, and tax treatments." },
          { heading: "Public vs Private Markets", body: "**Public markets** provide liquidity and price transparency. **Private markets** provide access to early-stage capital formation but have high barriers to entry, long lockup periods, and require substantial due diligence.\n\nHistorically, access to private markets has been restricted to institutional and high-net-worth investors, contributing to wealth concentration." },
        ],
        quiz: {
          question: "Why does saving alone lead to erosion of purchasing power over time?",
          options: [
            { label: "Banks charge storage fees on savings" },
            { label: "Inflation causes prices to rise faster than savings account returns" },
            { label: "Governments tax savings accounts heavily" },
            { label: "Savings accounts have contribution limits" },
          ],
          correctIndex: 1,
          explanation: "Inflation erodes purchasing power over time. If prices rise 3% annually but savings earn 1%, you lose 2% of real purchasing power each year — making investing essential for wealth preservation.",
        },
      },
      {
        id: "m5-l2", title: "Risk, Return, and Diversification", duration: "12 min",
        sections: [
          { heading: "Risk-Return Tradeoff", body: "Investment returns correlate with risk — the variance of returns relative to expected outcomes. **Higher expected returns generally accompany higher volatility and greater uncertainty.**\n\nOver long horizons, equities historically outperform bonds and cash due to **risk premiums**. Volatility decreases with time, demonstrating that long-term investment reduces the probability of loss." },
          { heading: "Diversification and Modern Portfolio Theory", body: "**Diversification** reduces non-systematic risk by allocating capital across assets that don't move synchronously. **Correlation** measures the degree to which asset prices move together — low-correlation assets stabilise portfolio performance.\n\nHarry Markowitz introduced **Modern Portfolio Theory**, using statistical optimisation to construct portfolios that maximise expected return for a given level of risk. Portfolios along the **efficient frontier** represent optimal allocations — you cannot improve returns without adding risk." },
          { heading: "Systematic vs Unsystematic Risk", body: "**Systematic risk** (market risk) affects all investments — recessions, interest rates, geopolitical events. Cannot be diversified away.\n\n**Unsystematic risk** (company-specific risk) affects individual companies — management, products, lawsuits. CAN be diversified away.\n\nWith 25-30 uncorrelated stocks, approximately **95% of unsystematic risk is eliminated**. This is why index funds are so powerful — they provide instant diversification across hundreds of companies." },
        ],
        quiz: {
          question: "What did Harry Markowitz's Modern Portfolio Theory demonstrate?",
          options: [
            { label: "That individual stock picking always beats index funds" },
            { label: "That combining assets with low correlation optimises the risk-return tradeoff" },
            { label: "That bonds always outperform stocks" },
            { label: "That market timing is the key to investment success" },
          ],
          correctIndex: 1,
          explanation: "Markowitz showed that by combining assets that don't move in lockstep (low correlation), you can achieve better returns for a given risk level than any single asset — earning him a Nobel Prize.",
        },
      },
      {
        id: "m5-l3", title: "Behavioural Finance and Market Efficiency", duration: "10 min",
        sections: [
          { heading: "Cognitive Biases in Investing", body: "Investors are prone to:\n\n• **Herd behaviour** — following the crowd into and out of investments\n• **Overconfidence** — overestimating one's ability to pick winners\n• **Loss aversion** — holding losers too long, selling winners too early\n• **Disposition effect** — unwillingness to realise losses\n• **Short-termism** — overweighting recent performance\n• **Narrative bias** — making decisions based on stories rather than data" },
          { heading: "Market Bubbles and Speculative Mania", body: "Historical bubbles reveal **collective irrationality**: Tulip mania, the dot-com bubble, the housing bubble, and crypto booms.\n\nSpeculative manias reflect **social contagion** rather than fundamental valuation. By the time an investment trend reaches mainstream awareness, the majority of gains have typically already occurred." },
          { heading: "Active vs Passive Investing", body: "**Passive investing** tracks market indices through ETFs or mutual funds. Research demonstrates that passive indexing **outperforms most active strategies** after accounting for fees — over 15 years, 85-90% of active managers underperform their benchmark.\n\n**Market efficiency theory** argues that prices incorporate available information, making consistent outperformance difficult. Markets are broadly efficient at large scale but exhibit inefficiencies in small caps, emerging markets, and during behavioural events." },
        ],
        quiz: {
          question: "Over 15-year periods, what percentage of actively managed funds underperform their benchmark index?",
          options: [
            { label: "30-40%" },
            { label: "50-60%" },
            { label: "70-75%" },
            { label: "85-90%" },
          ],
          correctIndex: 3,
          explanation: "Research consistently shows 85-90% of active managers underperform after fees over 15 years. Market efficiency and fee drag make consistent outperformance extremely rare.",
        },
      },
      {
        id: "m5-l4", title: "Valuation, Macro, and Portfolio Construction", duration: "11 min",
        sections: [
          { heading: "Valuation Metrics", body: "Equity valuation uses metrics such as **price-to-earnings ratio, price-to-book ratio, discounted cash flow analysis, dividend discount models**, and comparable company analysis.\n\nValuation involves predicting future cash flows and discounting them to present value using cost of capital. Corporate finance examines how firms use **weighted average cost of capital (WACC)** to determine hurdle rates for investment." },
          { heading: "Macroeconomics and Asset Prices", body: "Central banks influence asset prices through **interest rates, liquidity injections, and forward guidance**. Lower rates reduce discount rates, inflating asset valuations. Quantitative easing increases liquidity in financial markets.\n\n**Real return = nominal return − inflation.** High inflation reduces real returns and distorts risk preferences. Economic cycles influence sector performance — defensive sectors outperform during recessions while cyclical sectors outperform during expansions." },
          { heading: "Portfolio Construction for Individuals", body: "Risk capacity is determined by **time horizon, income stability, liquidity needs, dependents, and psychological tolerance**.\n\nConservative portfolios lean toward bonds and cash equivalents. Aggressive portfolios lean toward equities and real estate.\n\n**Tax efficiency** matters: tax-advantaged accounts accelerate compounding by sheltering gains from taxation. Asset allocation explains approximately **90% of portfolio return variation** — how you divide money between asset classes matters more than which specific investments you pick." },
        ],
        quiz: {
          question: "What factor explains approximately 90% of portfolio return variation?",
          options: [
            { label: "Individual stock selection" },
            { label: "Market timing" },
            { label: "Asset allocation — the division between stocks, bonds, and other classes" },
            { label: "Trading frequency" },
          ],
          correctIndex: 2,
          explanation: "Research shows asset allocation explains ~90% of return variation. How you divide capital between stocks, bonds, real estate, and other classes matters far more than picking specific securities.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 5 Knowledge Check",
      questions: [
        { question: "Investing differs from saving primarily because:", options: [{ label: "Investing is riskier" }, { label: "Investing deploys capital into productive assets to increase purchasing power, not just preserve it" }, { label: "Saving earns no interest" }, { label: "Investing is only for wealthy individuals" }], correctIndex: 1, explanation: "Saving preserves purchasing power while investing increases it by deploying capital into assets that generate returns above inflation." },
        { question: "The efficient frontier represents:", options: [{ label: "The fastest-growing stocks" }, { label: "Portfolios that maximise expected return for each level of risk" }, { label: "Risk-free investment options" }, { label: "The most expensive assets" }], correctIndex: 1, explanation: "The efficient frontier maps optimal risk-return combinations — portfolios on this curve cannot improve returns without accepting additional risk." },
        { question: "Speculative manias are driven primarily by:", options: [{ label: "Fundamental valuation analysis" }, { label: "Social contagion and collective irrationality" }, { label: "Government investment programmes" }, { label: "Changes in interest rates" }], correctIndex: 1, explanation: "Bubbles reflect herd behaviour and social contagion — investors follow each other rather than analysing fundamentals, inflating prices beyond rational value." },
        { question: "Real return is calculated as:", options: [{ label: "Gross return minus fees" }, { label: "Nominal return minus inflation" }, { label: "Total return minus taxes" }, { label: "Average return minus risk" }], correctIndex: 1, explanation: "Real return = nominal return − inflation. A 10% nominal return with 3% inflation yields only 7% in actual purchasing power increase." },
        { question: "The disposition effect causes investors to:", options: [{ label: "Diversify too aggressively" }, { label: "Hold losing investments too long and sell winners too early" }, { label: "Buy only index funds" }, { label: "Ignore market news" }], correctIndex: 1, explanation: "The disposition effect — driven by loss aversion — makes investors reluctant to realise losses while eagerly locking in gains, undermining portfolio performance." },
      ],
    },
    unitTest: {
      title: "Module 5 Unit Test",
      questions: [
        { question: "With 25-30 uncorrelated stocks, approximately what percentage of unsystematic risk is eliminated?", options: [{ label: "50%" }, { label: "75%" }, { label: "95%" }, { label: "100%" }], correctIndex: 2, explanation: "Diversification across 25-30 uncorrelated stocks eliminates approximately 95% of company-specific risk, leaving only market-wide systematic risk." },
        { question: "Why do equities historically outperform bonds over long periods?", options: [{ label: "Bonds have higher fees" }, { label: "Equities carry higher risk and investors are compensated with a risk premium" }, { label: "Government regulation favours equities" }, { label: "Bond markets are less liquid" }], correctIndex: 1, explanation: "Higher returns compensate equity investors for bearing greater volatility and uncertainty — this risk premium is the fundamental reason equities outperform." },
        { question: "Discounted cash flow analysis values a company by:", options: [{ label: "Comparing its stock price to competitors" }, { label: "Predicting future cash flows and discounting them to present value" }, { label: "Measuring current revenue only" }, { label: "Analysing management quality" }], correctIndex: 1, explanation: "DCF estimates intrinsic value by projecting future cash flows and discounting them back to today using a cost of capital — the theoretical foundation of valuation." },
        { question: "Quantitative easing affects asset prices by:", options: [{ label: "Reducing government spending" }, { label: "Increasing liquidity in financial markets and reducing discount rates" }, { label: "Raising interest rates" }, { label: "Restricting bank lending" }], correctIndex: 1, explanation: "QE injects liquidity into markets, pushing down interest rates. Lower discount rates inflate present values of future cash flows, driving up asset prices." },
        { question: "The correlation between two assets of -1 means:", options: [{ label: "They always move together" }, { label: "They move in exactly opposite directions — maximum diversification benefit" }, { label: "They are unrelated" }, { label: "Both will decline" }], correctIndex: 1, explanation: "Correlation of -1 means perfect inverse movement — when one rises, the other falls proportionally, providing the maximum possible diversification benefit." },
        { question: "Narrative bias in investing means:", options: [{ label: "Reading financial news regularly" }, { label: "Making investment decisions based on compelling stories rather than data and fundamentals" }, { label: "Writing about investments" }, { label: "Following analyst reports" }], correctIndex: 1, explanation: "Narrative bias leads investors to be swayed by compelling stories about companies or trends rather than rigorous analysis of data and fundamentals." },
        { question: "WACC is used by firms to:", options: [{ label: "Calculate employee wages" }, { label: "Determine hurdle rates for investment projects based on cost of financing" }, { label: "Set product prices" }, { label: "Measure customer satisfaction" }], correctIndex: 1, explanation: "Weighted Average Cost of Capital determines the minimum return a firm needs from investments to justify the cost of financing through equity and debt." },
        { question: "Defensive sectors outperform during recessions because:", options: [{ label: "They receive government subsidies" }, { label: "They provide essential goods/services with stable demand regardless of economic conditions" }, { label: "They have lower stock prices" }, { label: "They invest more in R&D" }], correctIndex: 1, explanation: "Defensive sectors (utilities, healthcare, consumer staples) provide essential goods whose demand remains stable even during economic downturns." },
        { question: "Tax-advantaged accounts accelerate wealth building by:", options: [{ label: "Providing higher returns" }, { label: "Sheltering gains from taxation, allowing more capital to compound" }, { label: "Eliminating investment risk" }, { label: "Guaranteeing minimum returns" }], correctIndex: 1, explanation: "By deferring or eliminating tax on gains, more capital remains invested to compound — producing substantially larger long-term wealth compared to taxable accounts." },
        { question: "Market efficiency theory argues that:", options: [{ label: "Markets always crash" }, { label: "Prices generally incorporate available information, making consistent outperformance difficult" }, { label: "Only insiders can profit" }, { label: "Technical analysis always works" }], correctIndex: 1, explanation: "Efficient market theory holds that prices reflect available information quickly, making it extremely difficult for any investor to consistently beat the market." },
      ],
    },
  },

  // ─── MODULE 6 ────────────────────────────────────────────────
  {
    id: "taxation-public-finance",
    number: 6,
    title: "Taxation, Public Finance, and the Fiscal State",
    subtitle: "How taxes work, why they exist, and how they shape economic incentives and inequality",
    description: "Examine tax systems from first principles — revenue generation, redistribution, behavioural incentives, capital vs labour taxation, fiscal policy, and the strategic use of tax-advantaged accounts.",
    icon: "Landmark",
    color: "hsl(40, 55%, 50%)",
    lessons: [
      {
        id: "m6-l1", title: "The Economic Purpose of Taxation", duration: "10 min",
        sections: [
          { heading: "Taxation as Revenue Generation", body: "The primary function of taxation is to fund **public goods** that markets fail to provide efficiently: infrastructure, national defence, public health, legal systems, education, and regulatory agencies.\n\nThese goods exhibit characteristics of **non-excludability** (can't prevent people from benefiting) and **non-rivalry** (one person's use doesn't diminish another's), which markets underprovide." },
          { heading: "Taxation as Redistribution", body: "Tax systems redistribute wealth to mitigate inequality through:\n\n• **Direct transfers** (pensions, social assistance)\n• **Subsidies** (healthcare, childcare, housing)\n• **Tax credits** (earned income credits, child tax benefits)\n\nRedistribution stabilises aggregate demand and reduces socio-economic stratification." },
          { heading: "Taxation as Behavioural Incentive", body: "Through tax credits, deductions, and penalties, states influence household behaviour:\n\n• Credits for renewable energy adoption\n• Tax deductions for charitable giving\n• Tax penalties for early withdrawal from retirement accounts\n\nThese incentives **align private behaviour with public goals** — demonstrating that taxation is not merely extraction but a tool for shaping economic activity." },
        ],
        quiz: {
          question: "Why do markets underprovide public goods like infrastructure and national defence?",
          options: [
            { label: "They are too expensive to produce" },
            { label: "Their non-excludable and non-rival nature means private firms can't capture adequate payment" },
            { label: "Governments prohibit private provision" },
            { label: "There is no demand for these goods" },
          ],
          correctIndex: 1,
          explanation: "Public goods are non-excludable (can't prevent free riders) and non-rival (unlimited use), making it impossible for private firms to charge enough to justify provision — requiring taxation to fund them.",
        },
      },
      {
        id: "m6-l2", title: "Tax Structures, Capital, and Class", duration: "11 min",
        sections: [
          { heading: "Progressive, Proportional, and Regressive Systems", body: "**Progressive systems** increase tax rates as income rises — placing higher burdens on higher earners.\n\n**Proportional systems** impose uniform rates across all income levels.\n\n**Regressive systems** impose higher effective burdens on lower-income households — consumption taxes (sales tax, VAT) are generally regressive because lower-income households spend a larger proportion of income on taxable consumption." },
          { heading: "Labour versus Capital Taxation", body: "Most advanced economies **tax labour income more heavily than capital income**. This creates structural incentives for individuals to convert labour into capital ownership.\n\n**Financial independence often emerges from this conversion** — understanding the differential taxation of labour and capital is essential for long-term wealth strategy." },
          { heading: "Inheritance and Tax Avoidance", body: "Wealth inequality is perpetuated through **inheritance mechanisms**. Estate and inheritance taxation attempt to regulate intergenerational concentration. Low estate taxes correlate with high wealth persistence across generations.\n\nHigh-net-worth individuals exploit tax shelters through offshore accounts, transfer pricing, real estate depreciation, foundation structures, and step-up-in-basis rules — highlighting **disparities in financial literacy and access to legal mechanisms**." },
        ],
        quiz: {
          question: "Why are consumption taxes generally considered regressive?",
          options: [
            { label: "They charge higher rates to lower-income people" },
            { label: "Lower-income households spend a larger proportion of income on taxable consumption" },
            { label: "They only apply to luxury goods" },
            { label: "Wealthy people don't pay them" },
          ],
          correctIndex: 1,
          explanation: "While the nominal rate is the same for everyone, lower-income households spend a higher percentage of their income on consumption — making the effective burden proportionally heavier.",
        },
      },
      {
        id: "m6-l3", title: "Fiscal Policy and Macroeconomic Stabilisation", duration: "9 min",
        sections: [
          { heading: "Countercyclical Fiscal Policy", body: "Governments use fiscal policy to stabilise business cycles. During recessions, they may increase spending, reduce taxes, and expand transfers. During expansions, they may reduce spending and increase taxes — although **political pressures often hinder contractionary measures**.\n\nThis asymmetry contributes to the accumulation of government debt over time." },
          { heading: "Deficits, Debt, and Sovereignty", body: "Government deficits accumulate into national debt. **Sovereign debt differs from household debt** because sovereigns can tax, borrow indefinitely, and in some cases issue currency.\n\nHowever, excessive debt can induce inflation, currency devaluation, and crowding out of private investment. The sustainability of government debt depends on whether economic growth exceeds borrowing costs." },
        ],
        quiz: {
          question: "Why does government debt differ fundamentally from household debt?",
          options: [
            { label: "Governments never need to repay debts" },
            { label: "Sovereigns can tax, borrow indefinitely, and sometimes create currency" },
            { label: "Government debt has no interest" },
            { label: "International law prohibits government default" },
          ],
          correctIndex: 1,
          explanation: "Unlike households, governments have unique powers: taxation to generate revenue, the ability to roll over debt indefinitely, and (for currency issuers) the option to create money — making sovereign debt fundamentally different.",
        },
      },
      {
        id: "m6-l4", title: "Tax-Advantaged Accounts and Strategy", duration: "9 min",
        sections: [
          { heading: "The Importance of Tax Sheltering", body: "Investors must consider **after-tax returns**, not nominal returns. Tax-advantaged accounts provide benefits through tax deferral, tax exemption, tax credits, and preferential rates.\n\nThe compounding effect of tax sheltering is substantial over decades — money that would have been paid in taxes remains invested, generating additional returns that also remain sheltered." },
          { heading: "Retirement Accounts and Long-Horizon Savings", body: "Many jurisdictions incentivise long-horizon savings through pensions and retirement accounts. **Withdrawal restrictions and penalties enforce time horizons** aligned with policy goals.\n\nThe key strategic insight: tax-advantaged accounts should be maximised before investing in taxable accounts. The order of priority typically follows:\n\n1. Employer-matched retirement contributions (guaranteed return)\n2. High-interest debt repayment\n3. Tax-free accounts\n4. Tax-deferred accounts\n5. Taxable investment accounts" },
          { heading: "Taxation and Inequality", body: "Economists use metrics such as the **Gini coefficient** to evaluate inequality. Taxation interacts with these measures by altering post-tax distributions.\n\nTax policy reflects ideological and political priorities — fiscal choices reveal societal values as much as economic calculus. Understanding the tax system is essential both for personal strategy and for evaluating the society you participate in." },
        ],
        quiz: {
          question: "Why should employer-matched retirement contributions be the highest investment priority?",
          options: [
            { label: "They have the lowest fees" },
            { label: "Employer matching is an immediate guaranteed return — effectively free money" },
            { label: "They provide the best investment options" },
            { label: "Government regulations require maximum contributions" },
          ],
          correctIndex: 1,
          explanation: "If an employer matches $1 for $1, your contribution instantly doubles — a guaranteed 100% return that no investment can reliably match.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 6 Knowledge Check",
      questions: [
        { question: "Taxation serves three primary purposes:", options: [{ label: "Punishment, control, extraction" }, { label: "Revenue generation, redistribution, and behavioural incentivisation" }, { label: "Growth, stability, employment" }, { label: "Savings, investment, consumption" }], correctIndex: 1, explanation: "Taxation funds public goods (revenue), mitigates inequality (redistribution), and shapes behaviour through credits, deductions, and penalties (incentives)." },
        { question: "Labour income is typically taxed:", options: [{ label: "Less heavily than capital income" }, { label: "More heavily than capital income in most advanced economies" }, { label: "At the same rate as capital income" }, { label: "Not at all in most countries" }], correctIndex: 1, explanation: "Most advanced economies tax labour more heavily than capital — creating structural incentives for wealth holders and driving the labour-to-capital transition." },
        { question: "The Gini coefficient measures:", options: [{ label: "Economic growth" }, { label: "Income or wealth inequality within a population" }, { label: "Tax rates" }, { label: "Government spending" }], correctIndex: 1, explanation: "The Gini coefficient ranges from 0 (perfect equality) to 1 (perfect inequality), measuring how evenly income or wealth is distributed across a population." },
        { question: "Tax-advantaged accounts accelerate wealth because:", options: [{ label: "They offer higher returns" }, { label: "Money not paid in taxes remains invested and compounds over decades" }, { label: "They have no fees" }, { label: "Government guarantees minimum returns" }], correctIndex: 1, explanation: "Tax sheltering keeps more capital invested, generating compound returns that also remain sheltered — producing substantially more wealth over long horizons." },
        { question: "Countercyclical fiscal policy means:", options: [{ label: "Always cutting taxes" }, { label: "Increasing spending during recessions and reducing it during expansions" }, { label: "Maintaining constant spending" }, { label: "Only spending during economic booms" }], correctIndex: 1, explanation: "Countercyclical policy stimulates during downturns (spending, tax cuts) and restrains during booms — stabilising business cycles through fiscal intervention." },
      ],
    },
    unitTest: {
      title: "Module 6 Unit Test",
      questions: [
        { question: "Public goods are characterised by:", options: [{ label: "High price and exclusivity" }, { label: "Non-excludability and non-rivalry" }, { label: "Private ownership" }, { label: "Limited supply" }], correctIndex: 1, explanation: "Public goods can't exclude non-payers (non-excludable) and one person's use doesn't reduce availability for others (non-rival)." },
        { question: "Progressive taxation means:", options: [{ label: "All income taxed at the same rate" }, { label: "Tax rates increase as income rises, with higher rates on higher brackets" }, { label: "Tax rates decrease as income rises" }, { label: "Only the wealthy pay taxes" }], correctIndex: 1, explanation: "Progressive systems apply increasing marginal rates to higher income brackets, placing proportionally larger burdens on higher earners." },
        { question: "Low estate taxes correlate with:", options: [{ label: "Greater economic mobility" }, { label: "Higher wealth persistence across generations" }, { label: "Lower inequality" }, { label: "Faster economic growth" }], correctIndex: 1, explanation: "Without substantial estate taxes, wealth transfers across generations largely intact — perpetuating inequality and reducing intergenerational mobility." },
        { question: "Step-up-in-basis rules allow:", options: [{ label: "Paying higher taxes on inherited assets" }, { label: "Inherited assets to reset their cost basis to current value, eliminating capital gains tax on appreciation during the decedent's lifetime" }, { label: "Faster depreciation of assets" }, { label: "Lower property taxes" }], correctIndex: 1, explanation: "Step-up in basis resets an inherited asset's tax basis to its value at death, effectively erasing all capital gains accumulated during the decedent's lifetime — a major wealth preservation mechanism." },
        { question: "Crowding out occurs when:", options: [{ label: "Too many people invest in the same stock" }, { label: "Government borrowing competes with private investment for available capital" }, { label: "Banks refuse to lend" }, { label: "Foreign investors withdraw" }], correctIndex: 1, explanation: "When governments borrow heavily, they compete with private borrowers for capital, potentially raising interest rates and reducing private investment — this is crowding out." },
        { question: "Transfer pricing is a tax avoidance strategy that involves:", options: [{ label: "Transferring money between personal accounts" }, { label: "Setting internal prices between subsidiaries to shift profits to lower-tax jurisdictions" }, { label: "Paying employees through transfers" }, { label: "Government transfer payments" }], correctIndex: 1, explanation: "Multinational corporations use transfer pricing to move profits between subsidiaries in different countries, shifting taxable income to jurisdictions with lower rates." },
        { question: "The asymmetry in countercyclical policy refers to:", options: [{ label: "Different tax rates for rich and poor" }, { label: "Political willingness to spend during recessions but reluctance to cut during booms" }, { label: "Differences between federal and state taxation" }, { label: "Unequal treatment of labour and capital" }], correctIndex: 1, explanation: "Politicians readily spend during downturns (popular) but resist cutting spending during booms (unpopular) — this asymmetry drives persistent deficits." },
        { question: "After-tax returns matter more than nominal returns because:", options: [{ label: "Taxes are always unpredictable" }, { label: "The portion retained after taxes is what actually builds wealth" }, { label: "Nominal returns are always misleading" }, { label: "Tax rates never change" }], correctIndex: 1, explanation: "What you keep after taxes — not what you earn before — determines wealth accumulation. Tax-efficient strategies can dramatically improve long-term outcomes." },
        { question: "Different jurisdictions balance tax bases differently — for example:", options: [{ label: "All countries use the same tax system" }, { label: "European welfare states rely more on consumption taxes while Anglo-Saxon systems emphasise income taxes" }, { label: "Only income is ever taxed" }, { label: "Consumption taxes don't exist in developed nations" }], correctIndex: 1, explanation: "Tax system design reflects cultural and political priorities — European nations fund generous welfare states partly through higher consumption taxes, while Anglo-Saxon countries lean on income taxation." },
        { question: "Tax penalties for early retirement account withdrawal serve to:", options: [{ label: "Punish savers" }, { label: "Enforce long time horizons aligned with policy goals for retirement preparation" }, { label: "Generate government revenue" }, { label: "Discourage retirement saving" }], correctIndex: 1, explanation: "Early withdrawal penalties enforce the intended long-term savings horizon, preventing use of retirement funds for short-term consumption and keeping them growing for their intended purpose." },
      ],
    },
  },

  // ─── MODULE 7 ────────────────────────────────────────────────
  {
    id: "insurance-risk-protection",
    number: 7,
    title: "Insurance, Risk Management, and Asset Protection",
    subtitle: "Protecting accumulated wealth from catastrophic loss through risk transfer, pooling, and legal structures",
    description: "Analyse the theoretical foundations of risk, the structure of insurance markets, public and private insurance systems, estate planning, and the strategic use of insurance in personal finance.",
    icon: "ShieldCheck",
    color: "hsl(210, 55%, 50%)",
    lessons: [
      {
        id: "m7-l1", title: "Risk, Uncertainty, and Insurance Fundamentals", duration: "10 min",
        sections: [
          { heading: "Risk vs Uncertainty", body: "Economists distinguish between:\n\n• **Risk** — situations where probability distributions are known or estimable\n• **Uncertainty** — situations where probabilities are unknown or inherently unknowable\n\nFrank Knight's seminal work described profit as a reward for bearing uncertainty. For households, risk and uncertainty affect employment, health, property, and longevity." },
          { heading: "Categories of Household Risk", body: "Households face several primary risk categories:\n\n• **Mortality risk** (death of income providers)\n• **Morbidity risk** (illness or disability)\n• **Property risk** (damage or loss of assets)\n• **Liability risk** (legal exposure and damages)\n• **Longevity risk** (outliving financial resources)\n• **Income risk** (job loss or business failure)\n\nFinancial fragility often results from **concentrated exposure to one or more of these risks** without protective mechanisms." },
          { heading: "Insurance as Risk Transfer", body: "Insurance functions through **risk pooling** — many participants contribute premiums to a common pool from which covered losses are reimbursed.\n\nInsurance shifts financial burden from individuals to collective pools, **smoothing consumption across time and uncertainty**.\n\n**Actuarial science** uses statistical models to estimate expected loss frequencies and severities. Premiums reflect expected value of losses plus administrative costs and profit margins." },
        ],
        quiz: {
          question: "What is the key difference between risk and uncertainty according to Frank Knight?",
          options: [
            { label: "Risk involves higher potential losses" },
            { label: "Risk has estimable probabilities while uncertainty has unknown or unknowable probabilities" },
            { label: "Uncertainty only applies to natural disasters" },
            { label: "Risk applies only to financial markets" },
          ],
          correctIndex: 1,
          explanation: "Knight distinguished risk (quantifiable probability distributions) from uncertainty (unknowable probabilities). Insurance works for risks but struggles with true uncertainty.",
        },
      },
      {
        id: "m7-l2", title: "Private Insurance Markets", duration: "11 min",
        sections: [
          { heading: "Life Insurance", body: "Life insurance protects against mortality risk and income loss for dependents. Two major structures:\n\n• **Term life insurance** — fixed time horizon, affordable, pure protection\n• **Permanent/whole life insurance** — combines insurance with savings components, introducing cash value accumulation, surrender charges, and policy loans\n\nWealthy households sometimes use permanent insurance for **estate planning and tax optimisation**, but for most individuals, the standard advice remains: **buy term and invest the difference**." },
          { heading: "Health and Disability Insurance", body: "Health risk is one of the most **financially destructive exposures**. Health insurance structures vary dramatically across jurisdictions.\n\n**Disability insurance** protects against the inability to earn income due to injury or illness. Disability risk is economically significant because income loss compounds rapidly when combined with ongoing expenses.\n\nA 30-year-old has approximately a **1-in-4 chance** of becoming disabled for 90+ days before age 65." },
          { heading: "Property, Casualty, and Liability", body: "**Property insurance** protects physical assets such as homes and vehicles. **Liability coverage** protects against legal claims.\n\nLiability risk can produce **catastrophic financial damages**, particularly in jurisdictions with strong tort systems. As net worth grows, liability exposure increases — making umbrella policies increasingly important." },
        ],
        quiz: {
          question: "Why do most financial advisors recommend 'buy term and invest the difference'?",
          options: [
            { label: "Term insurance provides better investment returns" },
            { label: "Term is far cheaper and investing the premium savings in index funds typically outperforms whole life's built-in investment component" },
            { label: "Whole life insurance is illegal in most jurisdictions" },
            { label: "Term insurance never expires" },
          ],
          correctIndex: 1,
          explanation: "Whole life premiums can be 5-15x more than term. The built-in savings component grows slowly with high fees. Buying cheap term coverage and investing the difference in index funds typically produces better long-term results.",
        },
      },
      {
        id: "m7-l3", title: "Public Insurance and Legal Structures", duration: "9 min",
        sections: [
          { heading: "Social Insurance Programmes", body: "Governments provide insurance mechanisms to cover systemic or universal risks:\n\n• **Unemployment insurance**\n• **Healthcare** (in some countries)\n• **Pensions**\n• **Disability benefits**\n\nThese programmes provide **consumption smoothing** over life cycles and reduce poverty among elderly and vulnerable populations.\n\nWith aging populations, sustainability of pension systems becomes a fiscal challenge, requiring adjustments to contributions, retirement ages, or benefit structures." },
          { heading: "Legal Structures for Asset Protection", body: "Individuals can protect assets through legal structures:\n\n• **Incorporation** — separating personal from business assets\n• **Trusts** — controlling asset distribution across generations\n• **Limited liability entities** — shielding personal wealth from business risks\n\n**Estate planning** manages intergenerational wealth transfer through wills, trusts, beneficiary designations, and tax-optimised charitable giving. Proper planning prevents wealth dissipation through probate, taxation, or intra-family conflict." },
        ],
        quiz: {
          question: "Why is pension sustainability becoming a fiscal challenge?",
          options: [
            { label: "People are saving too much for retirement" },
            { label: "Aging populations mean fewer workers supporting more retirees, straining contribution systems" },
            { label: "Pension investments always lose money" },
            { label: "Governments are abolishing pension systems" },
          ],
          correctIndex: 1,
          explanation: "As populations age, the ratio of working contributors to pension recipients shrinks, requiring either higher contributions, later retirement ages, or reduced benefits to maintain solvency.",
        },
      },
      {
        id: "m7-l4", title: "Market Failures and Strategic Insurance", duration: "9 min",
        sections: [
          { heading: "Moral Hazard and Adverse Selection", body: "**Moral hazard** — when individuals insulated from risk behave differently, increasing the probability of loss. Insurance contracts mitigate this through deductibles, co-payments, and exclusions.\n\n**Adverse selection** — high-risk individuals are more likely to purchase insurance, creating imbalanced risk pools. Insurers counteract this through underwriting and medical screening.\n\nBoth phenomena reflect **information asymmetry** — one party having more information than the other — which can produce market inefficiency or failure." },
          { heading: "Insurance as Defensive Strategy", body: "Insurance does not generate wealth — it **prevents catastrophic losses**. Financial success requires:\n\n• **Offensive strategies** for wealth creation (investment)\n• **Defensive strategies** for wealth preservation (insurance)\n\nHouseholds must prioritise coverage based on **probability and severity**. High-severity risks with low probability demand insurance. Low-severity risks with high probability are better **self-insured** — absorbed by emergency funds rather than covered by premium-heavy policies." },
        ],
        quiz: {
          question: "What principle should guide insurance prioritisation?",
          options: [
            { label: "Insure everything possible regardless of cost" },
            { label: "Insure against high-severity/low-probability events; self-insure low-severity/high-probability ones" },
            { label: "Only insure what's legally required" },
            { label: "Never buy insurance — save the premiums instead" },
          ],
          correctIndex: 1,
          explanation: "High-severity events (medical catastrophe, liability suit) warrant insurance premiums. Low-severity events (broken phone, minor repairs) are better absorbed from savings — the expected premium exceeds expected claims.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 7 Knowledge Check",
      questions: [
        { question: "Insurance functions primarily as a:", options: [{ label: "Wealth-building tool" }, { label: "Risk transfer mechanism through pooling" }, { label: "Tax avoidance strategy" }, { label: "Government requirement" }], correctIndex: 1, explanation: "Insurance transfers financial risk from individuals to a collective pool, smoothing consumption across time and uncertainty." },
        { question: "A 30-year-old has approximately what probability of long-term disability before 65?", options: [{ label: "1 in 100" }, { label: "1 in 10" }, { label: "1 in 4" }, { label: "1 in 2" }], correctIndex: 2, explanation: "Approximately 1 in 4 people will experience a disability lasting 90+ days before age 65 — far more common than most expect." },
        { question: "Moral hazard in insurance refers to:", options: [{ label: "Insurance companies acting unethically" }, { label: "Insured individuals behaving more riskily because they're protected from consequences" }, { label: "Agents selling unnecessary coverage" }, { label: "Customers filing fraudulent claims" }], correctIndex: 1, explanation: "When insulated from financial consequences, people may take greater risks — deductibles and co-payments are designed to counteract this tendency." },
        { question: "Estate planning prevents wealth dissipation through:", options: [{ label: "Hiding assets from government" }, { label: "Wills, trusts, and beneficiary designations that manage intergenerational transfer" }, { label: "Spending all assets before death" }, { label: "Converting all wealth to cash" }], correctIndex: 1, explanation: "Proper estate planning uses legal instruments (trusts, wills, beneficiary designations) to ensure wealth transfers according to the owner's wishes, minimising probate costs, taxes, and family conflict." },
        { question: "The 'self-insure' principle means:", options: [{ label: "Creating your own insurance company" }, { label: "Absorbing losses from emergency funds when the cost is manageable, rather than paying premiums" }, { label: "Going without any insurance" }, { label: "Insuring yourself through government programmes" }], correctIndex: 1, explanation: "For low-severity risks (broken electronics, minor repairs), paying premiums exceeds expected claims — these losses are better absorbed from savings." },
      ],
    },
    unitTest: {
      title: "Module 7 Unit Test",
      questions: [
        { question: "Frank Knight distinguished risk from uncertainty by:", options: [{ label: "Risk involves money, uncertainty doesn't" }, { label: "Risk has estimable probabilities; uncertainty has unknowable probabilities" }, { label: "Uncertainty is always worse than risk" }, { label: "Risk only applies to investments" }], correctIndex: 1, explanation: "Knight's seminal contribution was defining risk as quantifiable and uncertainty as fundamentally unknowable — with profit being the reward for bearing uncertainty." },
        { question: "Longevity risk refers to:", options: [{ label: "The risk of dying young" }, { label: "The risk of outliving your financial resources" }, { label: "The risk of long-term disability" }, { label: "The risk of inflation" }], correctIndex: 1, explanation: "Longevity risk is the possibility of living longer than your savings can support — making pension planning and sustainable withdrawal strategies critical." },
        { question: "Adverse selection in insurance means:", options: [{ label: "Insurers selecting the worst investments" }, { label: "High-risk individuals disproportionately purchasing insurance, unbalancing risk pools" }, { label: "Customers selecting the cheapest policies" }, { label: "Agents selecting the wrong clients" }], correctIndex: 1, explanation: "Those most likely to need insurance are most likely to buy it, creating pools with higher-than-expected claims — insurers use underwriting to counteract this." },
        { question: "Limited liability entities protect individuals by:", options: [{ label: "Eliminating all business risk" }, { label: "Separating personal assets from business or professional liabilities" }, { label: "Providing government guarantees" }, { label: "Reducing tax obligations" }], correctIndex: 1, explanation: "LLCs and corporations create a legal separation between personal wealth and business liabilities — if the business fails, personal assets are generally protected." },
        { question: "Umbrella insurance policies provide:", options: [{ label: "Coverage for weather damage" }, { label: "Additional liability coverage above the limits of other policies" }, { label: "Replacement of all other insurance" }, { label: "Coverage for business operations" }], correctIndex: 1, explanation: "Umbrella policies add $1-5M of extra liability coverage above auto and home policy limits — increasingly important as net worth grows." },
        { question: "Actuarial science uses:", options: [{ label: "Subjective judgment to set premiums" }, { label: "Statistical models to estimate loss frequencies and severities for pricing" }, { label: "Historical stock market data" }, { label: "Government-mandated pricing formulas" }], correctIndex: 1, explanation: "Actuaries use probability and statistics to model expected losses, allowing insurers to set premiums that cover expected claims plus operating costs and profit." },
        { question: "Deductibles in insurance contracts serve to:", options: [{ label: "Increase profits for insurers" }, { label: "Mitigate moral hazard by keeping insured parties financially invested in preventing losses" }, { label: "Reduce paperwork" }, { label: "Comply with government regulations" }], correctIndex: 1, explanation: "Deductibles ensure policyholders bear some financial consequence of claims, reducing the tendency to take more risks or file trivial claims." },
        { question: "Consumption smoothing through social insurance means:", options: [{ label: "Everyone consumes the same amount" }, { label: "Benefits help maintain living standards during periods of income loss or vulnerability" }, { label: "Government controls all spending" }, { label: "Insurance companies set spending limits" }], correctIndex: 1, explanation: "Social insurance (unemployment, pensions, disability) helps individuals maintain relatively stable consumption even when income is disrupted — preventing poverty spirals." },
        { question: "Financial success requires both offensive and defensive strategies — meaning:", options: [{ label: "Attacking competitors and defending market share" }, { label: "Wealth creation through investment (offense) paired with wealth preservation through insurance (defense)" }, { label: "Aggressive and conservative investment simultaneously" }, { label: "Earning and spending in equal measure" }], correctIndex: 1, explanation: "Building wealth through investing is insufficient if a single catastrophic event (medical crisis, lawsuit, disability) can wipe it out. Insurance provides the defensive layer." },
        { question: "Information asymmetry in insurance markets can lead to:", options: [{ label: "Better pricing for everyone" }, { label: "Market inefficiency or failure when one party has significantly more information" }, { label: "More competition" }, { label: "Lower premiums" }], correctIndex: 1, explanation: "When insurers can't assess risk accurately (adverse selection) or policyholders change behaviour after purchase (moral hazard), markets can malfunction — requiring regulation and careful contract design." },
      ],
    },
  },

  // ─── MODULE 8 ────────────────────────────────────────────────
  {
    id: "financial-independence",
    number: 8,
    title: "Financial Independence, Life Strategy, and Economic Mobility",
    subtitle: "Designing a life where work is optional and wealth serves your values",
    description: "Integrate prior insights into a framework for long-term financial strategy — the labour-to-capital transition, life-cycle finance, economic mobility, intergenerational wealth, and the pursuit of time autonomy.",
    icon: "Rocket",
    color: "hsl(330, 50%, 50%)",
    lessons: [
      {
        id: "m8-l1", title: "Defining Financial Independence", duration: "10 min",
        sections: [
          { heading: "Financial Independence as Labour-Capital Transition", body: "Financial independence is achieved when **capital income exceeds consumption requirements**:\n\n**Capital Income ≥ Consumption**\n\nThe individual becomes economically autonomous from labour markets — a transition from reliance on wages to reliance on returns to capital.\n\nThe **4% Rule** (Trinity Study): if you can withdraw 4% of your portfolio annually, your money should last 30+ years. Your **FIRE number** = annual expenses ÷ 0.04." },
          { heading: "FIRE Movements and Cultural Context", body: "Financial independence gained cultural visibility through the **FIRE (Financial Independence, Retire Early)** movement. Communities emphasise low consumption, high savings rates, passive index investing, and long-term compounding.\n\nVariants include:\n• **Lean FIRE** — minimal expenses\n• **Regular FIRE** — moderate lifestyle\n• **Fat FIRE** — comfortable spending ($100K+/year)\n• **Barista FIRE** — semi-FI with part-time work\n• **Coast FIRE** — enough saved that compounding handles retirement\n\nBut these practices are culturally specific to advanced economies with access to liquid capital markets." },
          { heading: "Life-Cycle Finance", body: "Modigliani's **life-cycle hypothesis** posits that individuals smooth consumption across their lifetime — borrowing when young, saving during peak earning years, and dissaving during retirement.\n\nFinancial independence alters this pattern by enabling earlier transitions. **Retirement is not a natural life stage** — it emerged in the industrial era. FI challenges the temporal structure of retirement by making withdrawal from labour **optional rather than age-dependent**." },
        ],
        quiz: {
          question: "If your annual expenses are $60,000, what is your FIRE number using the 4% rule?",
          options: [
            { label: "$600,000" },
            { label: "$1,000,000" },
            { label: "$1,500,000" },
            { label: "$2,400,000" },
          ],
          correctIndex: 2,
          explanation: "$60,000 ÷ 0.04 = $1,500,000. When invested assets reach $1.5M, a 4% annual withdrawal sustainably covers $60K in expenses.",
        },
      },
      {
        id: "m8-l2", title: "Wealth Building and Capital Accumulation", duration: "10 min",
        sections: [
          { heading: "Savings Rate as the Critical Variable", body: "The most important variable for achieving financial independence is **not investment returns but savings rate**. High savings rates compress independence timelines by increasing capital accumulation and reducing required future consumption.\n\n• 10% savings rate → ~40 years to FI\n• 25% savings rate → ~32 years\n• 50% savings rate → ~17 years\n• 75% savings rate → ~7 years\n\nSomeone earning $50K saving 50% reaches FI faster than someone earning $200K saving 10%." },
          { heading: "Capital Multipliers and Real Asset Ownership", body: "**Tax-advantaged accounts** accelerate capital formation through tax deferral or exemption. Capital gains are taxed differently than labour, producing structural advantages for wealth holders.\n\nOwnership of **real estate and business equity** plays a critical role through rental income, business profits, and valuation appreciation. Wealthy households combine financial assets with operating assets to **diversify cash flow sources**." },
        ],
        quiz: {
          question: "Which variable most determines the timeline to financial independence?",
          options: [
            { label: "Investment returns" },
            { label: "Savings rate — the percentage of income saved and invested" },
            { label: "Starting salary" },
            { label: "Education level" },
          ],
          correctIndex: 1,
          explanation: "Savings rate determines FI timeline more than income or returns. A 50% savings rate achieves FI in ~17 years regardless of income level, because it simultaneously builds capital and reduces the target consumption number.",
        },
      },
      {
        id: "m8-l3", title: "Economic Mobility and Structural Barriers", duration: "11 min",
        sections: [
          { heading: "Types of Economic Mobility", body: "Economic mobility can be:\n\n• **Absolute** — gains across cohorts\n• **Relative** — movement within a distribution\n• **Intergenerational** — inheritance and transmission effects\n• **Intragenerational** — mobility within an individual's lifetime\n\nFinancial independence is primarily an **intragenerational phenomenon** — individual wealth building within one's own lifetime." },
          { heading: "Barriers to Mobility", body: "Structural barriers include:\n\n• Cost of education\n• Stagnant wages\n• Healthcare shocks\n• Geographic immobility\n• Debt burdens\n• Class-based cultural capital deficits\n\n**Structural mobility is constrained by systems, not solely individual behaviour.** The #1 predictor of individual wealth is parental wealth — through inheritance, education funding, risk capacity, and early investment opportunities.\n\nThis context is not defeatism — it's essential for **realistic financial planning** that accounts for starting position." },
        ],
        quiz: {
          question: "The strongest predictor of individual wealth is:",
          options: [
            { label: "Personal savings discipline" },
            { label: "Education level achieved" },
            { label: "Parental wealth and intergenerational transfers" },
            { label: "Career industry selection" },
          ],
          correctIndex: 2,
          explanation: "Research consistently shows parental wealth is the strongest predictor of individual wealth — through direct inheritance, education funding, risk capacity, and access to early investment opportunities.",
        },
      },
      {
        id: "m8-l4", title: "Time, Identity, and Legacy Planning", duration: "10 min",
        sections: [
          { heading: "Post-Labour Identity and Time Autonomy", body: "When individuals disconnect from labour markets, **identity must be reconstructed**. Modern societies strongly associate productivity with identity — retirement or independence creates existential questions not addressed in basic financial planning.\n\nThe final output of wealth planning is not wealth itself but **control over time**. Economic independence allows individuals to allocate time to intrinsically motivated activities free from market coercion." },
          { heading: "Behavioural Challenges in Long-Term Planning", body: "**Hyperbolic discounting** undermines long-term savings. **Bear markets** test investor discipline — selling during downturns crystallises losses and destroys compounding.\n\nSuccessful independence strategies require **psychological tolerance for volatility** and systems that prevent emotional decision-making during market stress." },
          { heading: "Intergenerational Wealth and Philanthropy", body: "Wealth transmission includes direct inheritance, trusts, family businesses, real estate holdings, and **human capital investment into children**.\n\nHigh-net-worth households focus on human capital transmission as much as financial capital — investing in education, skills, and values alongside monetary assets.\n\nMany post-independence households engage in **philanthropy or impact investing**, raising philosophical questions about the role of capital in social systems." },
        ],
        quiz: {
          question: "What is described as the 'final output' of wealth planning?",
          options: [
            { label: "Maximum net worth" },
            { label: "Early retirement" },
            { label: "Control over time — freedom to allocate time to intrinsically motivated activities" },
            { label: "Legacy for future generations" },
          ],
          correctIndex: 2,
          explanation: "The ultimate purpose of financial planning is not wealth accumulation itself but time autonomy — the freedom to spend time on what matters to you, free from economic coercion.",
        },
      },
    ],
    moduleQuiz: {
      title: "Module 8 Knowledge Check",
      questions: [
        { question: "Financial independence is achieved when:", options: [{ label: "You earn a high salary" }, { label: "Capital income exceeds consumption requirements" }, { label: "You retire at age 65" }, { label: "You pay off all debts" }], correctIndex: 1, explanation: "FI occurs when returns from invested capital can sustain your living expenses indefinitely — making labour income optional." },
        { question: "The 4% rule suggests:", options: [{ label: "Save 4% of income" }, { label: "Withdraw 4% of portfolio annually for sustainable long-term income" }, { label: "Invest 4% in bonds" }, { label: "Keep 4% in cash" }], correctIndex: 1, explanation: "The Trinity Study found that withdrawing 4% annually has historically sustained portfolios for 30+ years across various market conditions." },
        { question: "Coast FIRE means:", options: [{ label: "Living on a coast" }, { label: "Enough saved that compound growth will fund retirement — you only need to cover current expenses" }, { label: "The easiest path to FI" }, { label: "Retiring from coastal industries" }], correctIndex: 1, explanation: "Coast FIRE = your current investments will grow to your FI number through compounding alone by traditional retirement age — you just need to cover current expenses." },
        { question: "A 50% savings rate leads to FI in approximately:", options: [{ label: "5 years" }, { label: "17 years" }, { label: "30 years" }, { label: "40 years" }], correctIndex: 1, explanation: "At a 50% savings rate with reasonable returns, you accumulate enough capital to sustain your consumption in approximately 17 years." },
        { question: "The ultimate purpose of financial literacy is:", options: [{ label: "Accumulating maximum wealth" }, { label: "Freedom and autonomy — control over time and life design" }, { label: "Retiring as early as possible" }, { label: "Beating market returns" }], correctIndex: 1, explanation: "Money is a tool for freedom. The goal isn't the biggest number — it's having enough autonomy to live according to your values and allocate time to what matters." },
      ],
    },
    unitTest: {
      title: "Module 8 Unit Test",
      questions: [
        { question: "FI number for $40K annual expenses using the 4% rule:", options: [{ label: "$500,000" }, { label: "$1,000,000" }, { label: "$1,500,000" }, { label: "$2,000,000" }], correctIndex: 1, explanation: "$40,000 ÷ 0.04 = $1,000,000." },
        { question: "Modigliani's life-cycle hypothesis describes:", options: [{ label: "How economies grow" }, { label: "How individuals smooth consumption by borrowing young, saving mid-career, and dissaving in retirement" }, { label: "How companies manage lifecycles" }, { label: "The life cycle of currencies" }], correctIndex: 1, explanation: "The life-cycle hypothesis explains how rational individuals plan consumption across their lifetime — accumulating assets during earning years and drawing down in retirement." },
        { question: "Intragenerational mobility refers to:", options: [{ label: "Wealth transfer between generations" }, { label: "Economic mobility within an individual's own lifetime" }, { label: "Movement between countries" }, { label: "Career changes within an industry" }], correctIndex: 1, explanation: "Intragenerational mobility measures how much an individual's economic position changes during their own lifetime — distinct from inherited wealth effects." },
        { question: "Post-labour identity challenges arise because:", options: [{ label: "People forget their careers" }, { label: "Modern societies strongly associate productivity with identity, creating existential questions outside work" }, { label: "Retirement is boring" }, { label: "There are no activities outside work" }], correctIndex: 1, explanation: "When work is no longer required, individuals must reconstruct identity and purpose — a psychological challenge that financial planning rarely addresses." },
        { question: "Selling investments during bear markets is destructive because:", options: [{ label: "Transaction fees are higher" }, { label: "It crystallises losses and destroys compounding by converting temporary decline into permanent loss" }, { label: "Taxes are higher during downturns" }, { label: "Brokers charge penalties" }], correctIndex: 1, explanation: "Market declines are temporary if you hold. Selling during downturns locks in losses permanently and removes capital from future recovery and compounding." },
        { question: "Human capital transmission means:", options: [{ label: "Transferring money between bank accounts" }, { label: "Investing in children's education, skills, and values alongside monetary inheritance" }, { label: "Moving employees between departments" }, { label: "Government education spending" }], correctIndex: 1, explanation: "High-net-worth families focus on transmitting human capital (education, skills, values, networks) as much as financial capital to the next generation." },
        { question: "Geographic arbitrage in FI strategy means:", options: [{ label: "Investing in foreign markets" }, { label: "Earning in high-income areas and living in low-cost areas to increase savings rate" }, { label: "Moving frequently" }, { label: "Remote work for foreign companies" }], correctIndex: 1, explanation: "Geographic arbitrage exploits the difference between high-income-area salaries and low-cost-area expenses, dramatically increasing the savings rate." },
        { question: "Barriers to economic mobility include all EXCEPT:", options: [{ label: "Stagnant wages" }, { label: "Perfect information and equal access to capital" }, { label: "Healthcare shocks" }, { label: "Debt burdens" }], correctIndex: 1, explanation: "Perfect information and equal capital access would promote mobility. In reality, information asymmetry and unequal access are barriers alongside stagnant wages, healthcare costs, and debt." },
        { question: "The FIRE movement is culturally specific because:", options: [{ label: "It was invented in one country" }, { label: "It requires access to liquid capital markets and stable institutions that many economies lack" }, { label: "It only works in cold climates" }, { label: "It requires government support" }], correctIndex: 1, explanation: "FIRE strategies (passive indexing, compound growth, long-term capital markets) depend on institutional infrastructure available primarily in advanced economies." },
        { question: "Impact investing after achieving FI involves:", options: [{ label: "High-risk speculation" }, { label: "Allocating capital to generate both financial returns and measurable social/environmental impact" }, { label: "Donating all wealth" }, { label: "Investing only in government bonds" }], correctIndex: 1, explanation: "Impact investing seeks dual returns — financial and social/environmental — reflecting how post-independence households deploy capital for purposes beyond personal consumption." },
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
