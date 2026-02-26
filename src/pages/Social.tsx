import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, TrendingUp, ArrowUpRight, ArrowDownRight, Send, MoreHorizontal, Users } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  user: string;
  text: string;
  time: string;
}

interface Trade {
  id: string;
  user: string;
  avatar: string;
  time: string;
  symbol: string;
  action: "Buy" | "Sell";
  shares: number;
  price: number;
  change: number;
  grade: string;
  note: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

const initialTrades: Trade[] = [
  {
    id: "1",
    user: "Sarah M.",
    avatar: "SM",
    time: "2h ago",
    symbol: "NVDA",
    action: "Buy",
    shares: 15,
    price: 142.5,
    change: 5.1,
    grade: "A",
    note: "Adding to my AI exposure. Diversified across 3 sectors now — feels solid.",
    likes: 12,
    liked: false,
    comments: [
      { user: "Jordan K.", text: "Great entry point. RSI was looking oversold too.", time: "1h ago" },
      { user: "Alex C.", text: "I'm considering the same move. What's your position size?", time: "45m ago" },
    ],
  },
  {
    id: "2",
    user: "Marcus T.",
    avatar: "MT",
    time: "4h ago",
    symbol: "VTI",
    action: "Buy",
    shares: 50,
    price: 268.3,
    change: 0.4,
    grade: "A+",
    note: "Monthly DCA into total market. Boring but effective. 14th consecutive month.",
    likes: 24,
    liked: true,
    comments: [
      { user: "Lisa R.", text: "Consistency is key 🔑 Love the discipline.", time: "3h ago" },
    ],
  },
  {
    id: "3",
    user: "Jordan K.",
    avatar: "JK",
    time: "6h ago",
    symbol: "TSLA",
    action: "Sell",
    shares: 10,
    price: 276.0,
    change: -1.5,
    grade: "B",
    note: "Taking profits after 40% run. Rebalancing into healthcare to reduce concentration.",
    likes: 8,
    liked: false,
    comments: [],
  },
  {
    id: "4",
    user: "Priya S.",
    avatar: "PS",
    time: "8h ago",
    symbol: "XLV",
    action: "Buy",
    shares: 30,
    price: 142.8,
    change: 0.8,
    grade: "A",
    note: "Zero healthcare exposure was bugging me. This fills the gap nicely.",
    likes: 15,
    liked: false,
    comments: [
      { user: "Marcus T.", text: "Smart move. I need to do the same honestly.", time: "7h ago" },
      { user: "Sarah M.", text: "XLV is solid. Low vol, good diversifier.", time: "6h ago" },
    ],
  },
  {
    id: "5",
    user: "Alex C.",
    avatar: "AC",
    time: "1d ago",
    symbol: "AAPL",
    action: "Buy",
    shares: 5,
    price: 237.8,
    change: 2.4,
    grade: "C+",
    note: "Couldn't resist after the dip. Maven warned me about concentration but I'm comfortable.",
    likes: 6,
    liked: false,
    comments: [
      { user: "Jordan K.", text: "Coach mode catch you? 😄", time: "22h ago" },
      { user: "Alex C.", text: "Yep. Proceeded anyway lol. Tech is 72% now...", time: "21h ago" },
    ],
  },
];

const Social = () => {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "friends" | "trending">("all");

  const toggleLike = (id: string) => {
    setTrades((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, liked: !t.liked, likes: t.liked ? t.likes - 1 : t.likes + 1 } : t
      )
    );
  };

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addComment = (id: string) => {
    const text = commentInputs[id]?.trim();
    if (!text) return;
    setTrades((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, comments: [...t.comments, { user: "You", text, time: "Just now" }] }
          : t
      )
    );
    setCommentInputs((prev) => ({ ...prev, [id]: "" }));
  };

  const gradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-gain";
    if (grade.startsWith("B")) return "text-foreground";
    if (grade.startsWith("C")) return "text-muted-foreground";
    return "text-loss";
  };

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Social</h1>
        <p className="mt-1 text-sm text-muted-foreground">See what your friends are trading</p>
      </motion.div>

      {/* Filters */}
      <motion.div className="mt-4 flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        {(["all", "friends", "trending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-1.5 text-xs font-medium capitalize transition-all ${
              filter === f ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Share Prompt */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
            AC
          </div>
          <input
            type="text"
            placeholder="Share a trade or insight..."
            className="flex-1 rounded-xl bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors focus:bg-secondary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                const text = (e.target as HTMLInputElement).value.trim();
                const newTrade: Trade = {
                  id: Date.now().toString(),
                  user: "You",
                  avatar: "AC",
                  time: "Just now",
                  symbol: "—",
                  action: "Buy",
                  shares: 0,
                  price: 0,
                  change: 0,
                  grade: "—",
                  note: text,
                  likes: 0,
                  liked: false,
                  comments: [],
                };
                setTrades((prev) => [newTrade, ...prev]);
                (e.target as HTMLInputElement).value = "";
                toast("Post shared!");
              }
            }}
          />
        </div>
      </motion.div>

      {/* Feed */}
      <div className="mt-5 space-y-4">
        {trades.map((trade, i) => (
          <motion.div
            key={trade.id}
            className="glass-card overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i + 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 pb-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
                {trade.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{trade.user}</p>
                <p className="text-[11px] text-muted-foreground">{trade.time}</p>
              </div>
              <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Trade Card */}
            <div className="mx-4 mt-3 rounded-xl bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${
                    trade.action === "Buy" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                  }`}>
                    {trade.action}
                  </span>
                  <span className="text-sm font-semibold">{trade.symbol}</span>
                  <span className="text-xs text-muted-foreground">× {trade.shares}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${gradeColor(trade.grade)}`}>{trade.grade}</span>
                  <div className="text-right">
                    <p className="text-xs font-medium">${trade.price.toFixed(2)}</p>
                    <p className={`flex items-center gap-0.5 text-[10px] ${trade.change >= 0 ? "text-gain" : "text-loss"}`}>
                      {trade.change >= 0 ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                      {Math.abs(trade.change)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="px-4 pt-3 text-[13px] leading-relaxed text-muted-foreground">{trade.note}</p>

            {/* Actions */}
            <div className="flex items-center gap-1 px-4 py-3">
              <button
                onClick={() => toggleLike(trade.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                  trade.liked ? "text-loss" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart size={14} fill={trade.liked ? "currentColor" : "none"} />
                {trade.likes}
              </button>
              <button
                onClick={() => toggleComments(trade.id)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle size={14} />
                {trade.comments.length}
              </button>
              <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                <Share2 size={14} />
              </button>
            </div>

            {/* Comments */}
            <AnimatePresence>
              {expandedComments.has(trade.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-border/30"
                >
                  <div className="space-y-2.5 px-4 py-3">
                    {trade.comments.map((c, ci) => (
                      <div key={ci} className="flex gap-2.5">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-[9px] font-bold text-muted-foreground">
                          {c.user.split(" ").map((w) => w[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[12px]">
                            <span className="font-semibold">{c.user}</span>{" "}
                            <span className="text-muted-foreground">{c.text}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">{c.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 border-t border-border/30 px-4 py-2.5">
                    <input
                      type="text"
                      value={commentInputs[trade.id] || ""}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [trade.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && addComment(trade.id)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => addComment(trade.id)}
                      className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-[11px] text-muted-foreground">📄 All trades shown are paper trades. Shared for educational discussion only.</p>
      </motion.div>
    </div>
  );
};

export default Social;
