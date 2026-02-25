import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Settings2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";

const suggestions = [
  "How diversified is my portfolio?",
  "Should I rebalance my tech exposure?",
  "Explain my risk profile",
  "What's the impact of adding bonds?",
  "Analyze NVDA for me",
  "What are the best ETFs for beginners?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatPage = () => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm **Maven**, your portfolio intelligence assistant. Ask me about any stock, market trend, trading strategy, risk analysis, or portfolio optimization. I can analyze any ticker, explain financial concepts, and help you think through trades.\n\n*Everything here is educational analysis only.*",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const input = text || query;
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.content === userMsg.content) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
        },
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to Maven");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col px-5 pt-14 lg:pt-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Maven · AI-powered portfolio intelligence</p>
        </div>
      </motion.div>

      {/* Suggestions - show when few messages */}
      {messages.length <= 2 && (
        <motion.div className="mt-3 flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => handleSend(s)} className="glass-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === "user" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>
              {msg.role === "assistant" && <Sparkles size={12} className="mb-1 text-muted-foreground" />}
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2 [&>ul]:mt-1 [&>ol]:mt-1">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass-card rounded-2xl px-4 py-3">
              <Loader2 size={14} className="animate-spin text-muted-foreground" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mb-4 mt-3">
        <div className="glass-card flex items-center gap-2 px-4 py-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask Maven anything about markets..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button onClick={() => handleSend()} disabled={isLoading} className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95 disabled:opacity-50">
            <Send size={14} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">Educational analysis only · Not financial advice</p>
      </div>
    </div>
  );
};

export default ChatPage;
