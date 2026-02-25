import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Sparkles, Send } from "lucide-react";

const suggestions = [
  "How diversified is my portfolio?",
  "Should I rebalance my tech exposure?",
  "Explain my risk profile",
  "What's the impact of adding bonds?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const mockResponses: Record<string, string> = {
  default:
    "Based on your current holdings, your portfolio is heavily concentrated in US large-cap technology stocks (68%). Your average holding period is 3.2 weeks, suggesting a short-term momentum approach. Consider whether this aligns with your stated risk tolerance.",
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your portfolio intelligence assistant. Ask me about your holdings, risk exposure, market conditions, or simulations. Everything here is educational analysis only.",
    },
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg: Message = { role: "user", content: query };
    const assistantMsg: Message = {
      role: "assistant",
      content: mockResponses.default,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setQuery("");
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col px-5 pt-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Search & Ask</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered portfolio intelligence
        </p>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        className="mt-4 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setQuery(s)}
            className="glass-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* Chat Messages */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-foreground text-primary-foreground"
                  : "glass-card"
              }`}
            >
              {msg.role === "assistant" && (
                <Sparkles size={12} className="mb-1 text-muted-foreground" />
              )}
              {msg.content}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="mb-4 mt-3">
        <div className="glass-card flex items-center gap-2 px-4 py-3">
          <SearchIcon size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Educational analysis only · Not financial advice
        </p>
      </div>
    </div>
  );
};

export default SearchPage;
