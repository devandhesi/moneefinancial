import { useRef, useEffect, useState } from "react";
import { ChevronDown, X, Send, Loader2, Plus, Clock, Trash2, Volume2, Square } from "lucide-react";
import MavenIcon from "./MavenIcon";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { streamChat } from "@/lib/chat-stream";
import ReactMarkdown from "react-markdown";
import { useMavenChat } from "@/hooks/use-maven-chat";
import { useMavenTTS } from "@/hooks/use-maven-tts";

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

function SuggestedQuestions({ actions, onSelect }: { actions: typeof QUICK_ACTIONS; onSelect: (prompt: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="pt-2">
      <p className="text-center text-sm font-medium text-foreground mb-3">How can I help?</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors text-xs text-muted-foreground"
      >
        <span className="font-medium">Suggested questions</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1.5 pt-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => onSelect(action.prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-[13px] text-foreground"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MavenAssistantFAB() {
  const {
    open, setOpen,
    messages, setMessages,
    loading, setLoading,
    history, showHistory, setShowHistory,
    startNewChat, loadThread, saveCurrentThread,
  } = useMavenChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const ctx = getPageContext(location.pathname);
  const tts = useMavenTTS();

  // Auto-save thread when messages change
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      saveCurrentThread();
    }
  }, [messages, loading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (loading) return;
    const userMsg = { role: "user" as const, content: text };
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-28 right-5 lg:bottom-8 lg:right-8 z-50 h-10 w-10 rounded-xl glass-card-float text-foreground flex items-center justify-center hover:scale-105 transition-transform"
            data-tour-id="tour-maven-fab"
          >
            <MavenIcon size={18} />
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
            className="fixed bottom-28 right-4 lg:bottom-8 lg:right-8 z-50 w-[340px] sm:w-[380px] max-h-[75vh] glass-card-float flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--glass-border-subtle)]">
              <div className="flex items-center gap-2">
                <MavenIcon size={16} className="text-foreground" />
                <p className="text-sm font-semibold text-foreground tracking-tight leading-none">maven</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="rounded-lg p-1 hover:bg-muted/60 transition-colors"
                  title="Chat history"
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={startNewChat}
                  className="rounded-lg p-1 hover:bg-muted/60 transition-colors"
                  title="New chat"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-muted/60 transition-colors">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* History panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-b border-[var(--glass-border-subtle)]"
                >
                  <div className="max-h-[200px] overflow-y-auto p-2 space-y-0.5">
                    {history.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">No chat history yet</p>
                    ) : (
                      history.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => loadThread(thread.id)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <p className="text-xs font-medium truncate">{thread.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(thread.createdAt).toLocaleDateString()} · {thread.messages.length} messages
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px]">
              {messages.length === 0 && (
                <SuggestedQuestions actions={QUICK_ACTIONS} onSelect={sendMessage} />
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
                      <>
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {!loading && msg.content.length > 0 && (
                          <button
                            onClick={() =>
                              tts.playingIdx === i ? tts.stop() : tts.play(msg.content, i)
                            }
                            className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {tts.loadingIdx === i ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : tts.playingIdx === i ? (
                              <>
                                <Square className="h-3 w-3" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
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
              className="flex items-center gap-2 px-3 py-2.5 border-t border-[var(--glass-border-subtle)]"
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
