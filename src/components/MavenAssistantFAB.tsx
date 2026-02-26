import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { streamChat } from "@/lib/chat-stream";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const PAGE_CONTEXT: Record<string, { label: string; description: string }> = {
  "/": { label: "Dashboard", description: "the main dashboard with portfolio overview, health score, projections, market mood, and upcoming events" },
  "/invest": { label: "Invest", description: "the invest/browse stocks screen where users search and discover stocks to buy" },
  "/chat": { label: "Chat", description: "the Maven AI chat page for in-depth financial conversations" },
  "/learn": { label: "Learn", description: "the learning hub with educational courses about investing and finance" },
  "/profile": { label: "Profile", description: "the user profile page showing account details and stats" },
  "/settings": { label: "Settings", description: "the settings page for configuring app preferences" },
  "/social": { label: "Social", description: "the social feed where users share and discuss trades" },
  "/transactions": { label: "Transactions", description: "the transaction history showing past buys, sells, and transfers" },
  "/orders": { label: "Orders", description: "the pending and completed orders page" },
  "/calendar": { label: "Calendar", description: "the financial calendar showing earnings, dividends, and economic events" },
  "/simulation": { label: "Simulation Lab", description: "the simulation lab for testing hypothetical trades and scenarios" },
  "/risk": { label: "Risk Map", description: "the risk map showing portfolio risk distribution and exposure" },
  "/watchlist": { label: "Watchlist", description: "the watchlist of stocks the user is tracking" },
  "/markets": { label: "Markets", description: "the markets overview with indices, sectors, and trending stocks" },
  "/news": { label: "News", description: "the financial news feed with latest market headlines" },
};

function getPageContext(pathname: string) {
  // Handle dynamic routes like /invest/:symbol or /learn/:courseId
  if (pathname.startsWith("/invest/")) {
    const symbol = pathname.split("/")[2]?.toUpperCase();
    return { label: `Stock: ${symbol}`, description: `the detailed stock page for ${symbol} showing price, charts, and analysis` };
  }
  if (pathname.startsWith("/learn/")) {
    return { label: "Course", description: "a specific learning course with lessons about investing" };
  }
  return PAGE_CONTEXT[pathname] || { label: "Page", description: "a page in the Monee financial app" };
}

const QUICK_ACTIONS = [
  { label: "📚 Teach me about this screen", prompt: "Teach me something useful about this screen — what should I know as an investor?" },
  { label: "📊 Analyze what I see", prompt: "Analyze what I'm looking at and give me actionable insights or warnings." },
  { label: "🎯 What should I do next?", prompt: "Based on this screen, what should I do next? Give me a clear action plan." },
];

export default function MavenAssistantFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const ctx = getPageContext(location.pathname);

  // Reset conversation when page changes
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [location.pathname]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const systemMsg = {
      role: "system" as const,
      content: `You are Maven, a smart financial assistant embedded in the Monee app. The user is currently on ${ctx.description}. Provide contextual, actionable advice specific to this screen. Be concise (2-4 paragraphs max). Use markdown formatting. Reference specific features visible on this screen. If the user asks you to teach, explain concepts relevant to what they're viewing.`,
    };

    try {
      await streamChat({
        messages: [systemMsg as any, ...allMessages],
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => setLoading(false),
        onError: (err) => {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${err}` }]);
          setLoading(false);
        },
      });
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-28 right-5 lg:bottom-8 lg:right-8 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
            aria-label="Ask Maven"
          >
            <Sparkles className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed bottom-28 right-4 lg:bottom-8 lg:right-8 z-50 w-[340px] sm:w-[380px] max-h-[75vh] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">Maven</p>
                  <p className="text-[11px] text-muted-foreground">{ctx.label} assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px]">
              {messages.length === 0 && (
                <div className="space-y-4 pt-2">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">How can I help?</p>
                    <p className="text-xs text-muted-foreground">
                      Context-aware on <span className="font-medium">{ctx.label}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendMessage(action.prompt)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors text-[13px] text-foreground"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) sendMessage(input.trim());
              }}
              className="flex items-center gap-2 px-3 py-2.5 border-t border-border"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this screen…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
