import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, MessageCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const MOCK_CONVERSATIONS = [
  { id: "1", username: "sarah_m", displayName: "Sarah M.", lastMessage: "What do you think about NVDA's earnings?", time: "2m ago", unread: 2 },
  { id: "2", username: "marcus_t", displayName: "Marcus T.", lastMessage: "Sent you the DD report", time: "1h ago", unread: 0 },
  { id: "3", username: "jordan_k", displayName: "Jordan K.", lastMessage: "Great call on TSLA! 🚀", time: "3h ago", unread: 1 },
  { id: "4", username: "priya_s", displayName: "Priya S.", lastMessage: "Meeting at 3pm to discuss the portfolio", time: "1d ago", unread: 0 },
];

const DirectMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = search
    ? MOCK_CONVERSATIONS.filter(c => c.displayName.toLowerCase().includes(search.toLowerCase()))
    : MOCK_CONVERSATIONS;

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <MessageCircle size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Sign in to access messages</p>
          <button onClick={() => navigate("/auth")} className="mt-3 rounded-xl bg-foreground px-6 py-2 text-sm text-primary-foreground">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/community")} className="rounded-lg p-1.5 hover:bg-secondary lg:hidden">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
            <p className="mt-1 text-sm text-muted-foreground">Direct conversations</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-primary-foreground">
            <Plus size={16} />
          </button>
        </div>
      </motion.div>

      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <div className="glass-card flex items-center gap-2 px-4 py-2.5">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </motion.div>

      <div className="mt-4 space-y-1">
        {filtered.map((conv, i) => (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
            className="glass-card flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
              {conv.displayName.split(" ").map(w => w[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{conv.displayName}</p>
                <span className="text-[10px] text-muted-foreground">{conv.time}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{conv.lastMessage}</p>
            </div>
            {conv.unread > 0 && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-primary-foreground">
                {conv.unread}
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DirectMessages;
