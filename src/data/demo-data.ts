// Demo data for showcasing the app with realistic fake conversations

export interface DemoMessage {
  role: "user" | "assistant";
  content: string;
}

export const DEMO_CHAT_CONVERSATION: DemoMessage[] = [
  {
    role: "user",
    content: "I have $5,000 saved up from my summer job. What's the smartest thing I can do with it?",
  },
  {
    role: "assistant",
    content: `Great question — and honestly, you're already ahead of most people by even asking it. Here's what I'd recommend:\n\n### 1. Emergency Fund First\nKeep **$1,000–$1,500** in a high-yield savings account. This is your safety net — unexpected car repair, medical bill, etc.\n\n### 2. Start Investing the Rest\nWith the remaining **$3,500–$4,000**, consider:\n\n- **$VTI** (Total US Market) — instant diversification across 4,000+ stocks\n- **$VOO** (S&P 500) — tracks the 500 largest US companies\n- Start with one of these and add monthly (even $50/mo adds up)\n\n### 3. The Math That Matters\nIf you invest $3,500 now and add $100/month:\n- In 10 years → ~**$22,000** (at 10% avg return)\n- In 30 years → ~**$220,000**\n\n> Time in the market > timing the market.\n\n**Do Now:** Open a brokerage account, buy $VTI, set up auto-deposits.\n**Avoid:** Meme stocks, crypto with money you can't lose, and trying to day trade.`,
  },
  {
    role: "user",
    content: "What about crypto? My friend made 3x on Solana last year",
  },
  {
    role: "assistant",
    content: `Your friend's SOL gain is real — but here's what they probably didn't tell you:\n\n### Survivorship Bias\nFor every friend who 3x'd on SOL, there are dozens who lost 50-80% on other coins. You only hear the wins.\n\n### If You Want Crypto Exposure\nHere's a responsible approach:\n\n| Allocation | Asset | Why |\n|---|---|---|\n| 85-90% | Index funds ($VTI, $VOO) | Boring but reliable |\n| 5-10% | Bitcoin ($BTC) | Most established crypto |\n| 0-5% | Altcoins (SOL, ETH) | High risk, high reward |\n\n### Risk Check ⚠️\n- Only invest what you can afford to lose **completely**\n- Crypto has had 80%+ drawdowns multiple times\n- At your stage, **building the habit of investing** matters more than chasing returns\n\n**Bottom line:** A small crypto allocation (5-10%) is fine if you're comfortable watching it drop 50% without panicking. But your core wealth-builder should be boring index funds.`,
  },
];

export interface DemoCommunityMessage {
  id: string;
  content: string;
  username: string;
  display_name: string;
  avatar_initials: string;
  time_ago: string;
  is_bot: boolean;
  reactions?: { emoji: string; count: number }[];
}

export const DEMO_COMMUNITY_MESSAGES: DemoCommunityMessage[] = [
  {
    id: "demo-1",
    content: "Anyone watching NVDA's breakout today? Volume is insane 📈",
    username: "sarah_trades",
    display_name: "Sarah M.",
    avatar_initials: "SM",
    time_ago: "2m ago",
    is_bot: false,
    reactions: [{ emoji: "🚀", count: 4 }, { emoji: "📈", count: 2 }],
  },
  {
    id: "demo-2",
    content: "Just DCA'd into VTI again. 14th month straight. Boring but my portfolio is up 22% YTD 💪",
    username: "marcus_investor",
    display_name: "Marcus T.",
    avatar_initials: "MT",
    time_ago: "5m ago",
    is_bot: false,
    reactions: [{ emoji: "💎", count: 6 }, { emoji: "🔥", count: 3 }],
  },
  {
    id: "demo-3",
    content: "Fed meeting minutes just dropped. They're signaling a hold through Q2. Treasury yields stable at 4.2%",
    username: "jordan_macro",
    display_name: "Jordan K.",
    avatar_initials: "JK",
    time_ago: "8m ago",
    is_bot: false,
    reactions: [{ emoji: "👀", count: 5 }],
  },
  {
    id: "demo-4",
    content: "Took profits on my TSLA position after the 40% run. Rotating into healthcare ($XLV). Sector diversification matters!",
    username: "priya_s",
    display_name: "Priya S.",
    avatar_initials: "PS",
    time_ago: "12m ago",
    is_bot: false,
    reactions: [{ emoji: "🎯", count: 3 }, { emoji: "💰", count: 2 }],
  },
  {
    id: "demo-5",
    content: "Question for the group: what's everyone's cash allocation right now? I'm sitting at 15% which feels too high",
    username: "alex_c",
    display_name: "Alex C.",
    avatar_initials: "AC",
    time_ago: "18m ago",
    is_bot: false,
    reactions: [{ emoji: "🤔", count: 4 }],
  },
  {
    id: "demo-6",
    content: "10% cash here. With rates where they are, HYSA is paying 4.5% so it's not just sitting there doing nothing",
    username: "marcus_investor",
    display_name: "Marcus T.",
    avatar_initials: "MT",
    time_ago: "15m ago",
    is_bot: false,
  },
  {
    id: "demo-7",
    content: "Earnings season next week — AAPL, MSFT, GOOGL all reporting. Expecting some volatility. Tightened my stop losses just in case 🛡️",
    username: "sarah_trades",
    display_name: "Sarah M.",
    avatar_initials: "SM",
    time_ago: "22m ago",
    is_bot: false,
    reactions: [{ emoji: "⚡", count: 2 }],
  },
  {
    id: "demo-8",
    content: "Just learned about sector rotation in the Learn module — actually seeing it play out in real-time with tech → healthcare. This app is 🔥",
    username: "newbie_investor",
    display_name: "Riley P.",
    avatar_initials: "RP",
    time_ago: "30m ago",
    is_bot: false,
    reactions: [{ emoji: "🎉", count: 7 }, { emoji: "💪", count: 3 }],
  },
];

export const DEMO_SOCIAL_ONLINE_USERS = [
  { name: "Sarah M.", initials: "SM", status: "Trading $NVDA" },
  { name: "Marcus T.", initials: "MT", status: "Watching markets" },
  { name: "Jordan K.", initials: "JK", status: "Reading news" },
  { name: "Priya S.", initials: "PS", status: "In Learn module" },
  { name: "Alex C.", initials: "AC", status: "Chatting" },
  { name: "Riley P.", initials: "RP", status: "New to investing" },
];
