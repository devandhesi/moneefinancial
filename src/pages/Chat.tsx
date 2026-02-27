import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Plus, Trash2, MessageSquare } from "lucide-react";
import ChatAttachmentMenu from "@/components/chat/ChatAttachmentMenu";
import ReactMarkdown from "react-markdown";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import MavenIcon from "@/components/MavenIcon";

/* ── Word-by-word reveal hook ──────────────────────────── */
function useWordReveal() {
  const queueRef = useRef<string[]>([]);
  const revealedRef = useRef("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onUpdateRef = useRef<((text: string) => void) | null>(null);
  const doneRef = useRef(false);

  const start = useCallback((onUpdate: (text: string) => void) => {
    queueRef.current = [];
    revealedRef.current = "";
    doneRef.current = false;
    onUpdateRef.current = onUpdate;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (queueRef.current.length > 0) {
        // Reveal multiple tokens per tick for speed (2-3 at a time)
        const batch = queueRef.current.splice(0, 3).join("");
        revealedRef.current += batch;
        onUpdateRef.current?.(revealedRef.current);
      } else if (doneRef.current && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 25);
  }, []);

  const push = useCallback((chunk: string) => {
    // Split into small tokens (words + whitespace preserved)
    const tokens = chunk.match(/\S+|\s+/g) || [chunk];
    queueRef.current.push(...tokens);
  }, []);

  const finish = useCallback(() => {
    doneRef.current = true;
  }, []);

  const getFullText = useCallback(() => {
    // Flush everything remaining
    if (queueRef.current.length > 0) {
      revealedRef.current += queueRef.current.join("");
      queueRef.current = [];
    }
    return revealedRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { start, push, finish, getFullText };
}

const suggestions = [
  "How do I start budgeting?",
  "Analyze $NVDA for me",
  "Should I pay off debt or invest?",
  "What's a good emergency fund?",
  "Explain dollar-cost averaging",
  "How do credit scores work?",
  "Compare $MSFT vs $GOOGL",
  "Tips for saving more money",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

// Custom renderer that turns $TICKER into linked text
const TickerLink = ({ symbol }: { symbol: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={(e) => { e.preventDefault(); navigate(`/invest/${symbol}`); }}
      className="font-semibold underline underline-offset-2 decoration-primary/40 hover:decoration-primary text-foreground transition-colors cursor-pointer"
    >
      ${symbol}
    </button>
  );
};

const renderTextWithTickers = (text: string) => {
  const parts = text.split(/(\$[A-Z]{1,5}(?:\.[A-Z]{1,3})?)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\$([A-Z]{1,5}(?:\.[A-Z]{1,3})?)$/);
    if (match) return <TickerLink key={i} symbol={match[1]} />;
    return <span key={i}>{part}</span>;
  });
};

/* ── Typing dots animation ─────────────────────────────── */
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    className="flex items-start gap-3 max-w-[85%]"
  >
    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
      <MavenIcon size={13} />
    </div>
    <div className="rounded-2xl rounded-tl-md bg-secondary/60 px-4 py-3">
      <div className="flex items-center gap-1">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  </motion.div>
);

/* ── Message bubble ────────────────────────────────────── */
const AssistantMessage = ({ content, isStreaming }: { content: string; isStreaming?: boolean }) => {
  const hasAnimated = useRef(false);
  const shouldAnimate = !hasAnimated.current;
  
  useEffect(() => {
    hasAnimated.current = true;
  }, []);

  return (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 12, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="flex items-start gap-3 max-w-[88%]"
    >
      <motion.div
        initial={shouldAnimate ? { scale: 0.5, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.05 }}
        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary"
      >
        <MavenIcon size={13} />
      </motion.div>
      <div className="min-w-0 flex-1">
        <div className={`
          prose prose-sm dark:prose-invert max-w-none text-[13.5px] leading-[1.75]
          [&>p]:mb-3 [&>p:last-child]:mb-0
          [&>ul]:mb-3 [&>ul]:mt-1 [&>ol]:mb-3 [&>ol]:mt-1
          [&_li]:my-1 [&_li]:leading-relaxed
          [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-5 [&>h1]:mb-2 [&>h1]:tracking-tight
          [&>h2]:text-[14px] [&>h2]:font-semibold [&>h2]:mt-5 [&>h2]:mb-2 [&>h2]:tracking-tight
          [&>h3]:text-[13.5px] [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-1.5
          [&>hr]:my-4 [&>hr]:border-border/30
          [&>blockquote]:border-l-2 [&>blockquote]:border-primary/30 [&>blockquote]:pl-3 [&>blockquote]:my-3 [&>blockquote]:text-muted-foreground [&>blockquote]:italic [&>blockquote]:text-[13px]
          [&_em]:text-muted-foreground
          [&_strong]:text-foreground [&_strong]:font-semibold
          [&_code]:text-xs [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
          transition-all duration-150 ease-out
          ${isStreaming ? "streaming-cursor" : ""}
        `}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p>{typeof children === "string" ? renderTextWithTickers(children) : children}</p>,
              li: ({ children }) => <li>{typeof children === "string" ? renderTextWithTickers(children) : children}</li>,
              strong: ({ children }) => {
                const text = String(children);
                const tickerMatch = text.match(/^\$([A-Z]{1,5}(?:\.[A-Z]{1,3})?)$/);
                if (tickerMatch) return <TickerLink symbol={tickerMatch[1]} />;
                return <strong>{children}</strong>;
              },
            }}
          >{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

const UserMessage = ({ content }: { content: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 400, damping: 28 }}
    className="flex justify-end"
  >
    <div className="max-w-[75%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-[13.5px] leading-relaxed text-primary-foreground">
      {content}
    </div>
  </motion.div>
);

/* ── Main page ─────────────────────────────────────────── */
const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const wordReveal = useWordReveal();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations
  useEffect(() => {
    if (!user) { setLoadingConvos(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50);
      setConversations((data as Conversation[]) || []);
      setLoadingConvos(false);
    };
    load();
  }, [user]);

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConversationId(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.filter((m: any) => m.role !== "system") as Message[]);
    }
    setShowSidebar(false);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setShowSidebar(false);
  }, []);

  const deleteConversation = async (convId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) startNewChat();
    toast.success("Conversation deleted");
  };

  const autoTitle = async (convId: string, firstMsg: string) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "…" : "");
    await supabase.from("chat_conversations").update({ title }).eq("id", convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c));
  };

  const location = useLocation();

  useEffect(() => {
    const q = searchParams.get("q");
    const prefill = (location.state as any)?.prefill;
    if (q) {
      setSearchParams({}, { replace: true });
      setTimeout(() => handleSend(q), 100);
    } else if (prefill) {
      window.history.replaceState({}, document.title);
      setTimeout(() => handleSend(prefill), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (text?: string) => {
    const input = text || query;
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    let convId = activeConversationId;
    if (user) {
      if (!convId) {
        const { data: newConv } = await supabase
          .from("chat_conversations")
          .insert({ user_id: user.id, title: "New Chat" })
          .select("id, title, updated_at")
          .single();
        if (newConv) {
          convId = newConv.id;
          setActiveConversationId(convId);
          setConversations(prev => [newConv as Conversation, ...prev]);
          autoTitle(convId, input);
        }
      }
      if (convId) {
        await supabase.from("chat_messages").insert({ conversation_id: convId, role: "user", content: input });
      }
    }

    const allMessages = [...messages, userMsg];

    // Start word-by-word reveal
    wordReveal.start((revealedText) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.isStreaming) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: revealedText } : m));
        }
        return [...prev, { role: "assistant", content: revealedText, isStreaming: true }];
      });
    });

    try {
      await streamChat({
        messages: allMessages,
        onDelta: (chunk) => {
          wordReveal.push(chunk);
        },
        onDone: async () => {
          wordReveal.finish();
          // Wait a bit for the reveal queue to flush, then finalize
          const waitForFlush = () => new Promise<void>((resolve) => {
            const check = setInterval(() => {
              const full = wordReveal.getFullText();
              // Check if queue is drained
              resolve();
              clearInterval(check);
            }, 50);
          });
          await waitForFlush();
          const finalText = wordReveal.getFullText();
          setIsLoading(false);
          setMessages(prev => prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, content: finalText, isStreaming: false } : m));
          if (user && convId && finalText) {
            await supabase.from("chat_messages").insert({ conversation_id: convId, role: "assistant", content: finalText });
            await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
          }
        },
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

  const showTypingIndicator = isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === "user");

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col px-5 pt-14 lg:pt-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Maven · Your money mentor</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startNewChat} className="glass-card p-2 text-muted-foreground hover:text-foreground transition-colors" title="New chat">
            <Plus size={16} />
          </button>
          {user && (
            <button onClick={() => setShowSidebar(!showSidebar)} className="glass-card p-2 text-muted-foreground hover:text-foreground transition-colors" title="Chat history">
              <MessageSquare size={16} />
            </button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-1 mt-3 gap-3 overflow-hidden">
        {/* History sidebar */}
        <AnimatePresence>
          {showSidebar && user && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 overflow-y-auto overflow-x-hidden rounded-xl border border-border/30 bg-card/50"
            >
              <div className="p-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 mb-2">History</p>
                {loadingConvos ? (
                  <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
                ) : conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-4">No conversations yet</p>
                ) : (
                  conversations.map(c => (
                    <div
                      key={c.id}
                      className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors ${
                        activeConversationId === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                      onClick={() => loadConversation(c.id)}
                    >
                      <span className="truncate flex-1">{c.title}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Suggestions */}
          {messages.length === 0 && (
            <motion.div className="flex flex-wrap gap-2 mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleSend(s)} className="glass-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                  {s}
                </button>
              ))}
            </motion.div>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto pb-2">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Hey — I'm Maven.</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Ask me anything about money — stocks, budgeting, saving, investing, debt, or just how to be smarter with your cash.</p>
              </div>
            )}

            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <UserMessage key={i} content={msg.content} />
              ) : (
                <AssistantMessage key={i} content={msg.content} isStreaming={msg.isStreaming} />
              )
            )}

            <AnimatePresence>
              {showTypingIndicator && <TypingIndicator />}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="mb-4 mt-3">
            <div className="glass-card flex items-center gap-2 px-4 py-3">
              <ChatAttachmentMenu
                disabled={isLoading}
                onSendContent={(content) => handleSend(content)}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Maven anything about money..."
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
      </div>
    </div>
  );
};

export default ChatPage;
