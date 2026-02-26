import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Plus, Trash2, MessageSquare, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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

  // Load messages for a conversation
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

  // Create new conversation
  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setShowSidebar(false);
  }, []);

  // Delete conversation
  const deleteConversation = async (convId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", convId);
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConversationId === convId) startNewChat();
    toast.success("Conversation deleted");
  };

  // Auto-title conversation using first user message
  const autoTitle = async (convId: string, firstMsg: string) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "…" : "");
    await supabase.from("chat_conversations").update({ title }).eq("id", convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c));
  };

  const location = useLocation();

  // Handle ?q= query param or state.prefill
  useEffect(() => {
    const q = searchParams.get("q");
    const prefill = (location.state as any)?.prefill;
    if (q) {
      setSearchParams({}, { replace: true });
      setTimeout(() => handleSend(q), 100);
    } else if (prefill) {
      // Clear state so it doesn't re-trigger
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

    // Persist to DB if logged in
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
        onDone: async () => {
          setIsLoading(false);
          // Save assistant response
          if (user && convId && assistantSoFar) {
            await supabase.from("chat_messages").insert({ conversation_id: convId, role: "assistant", content: assistantSoFar });
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
          {/* Suggestions - show when no messages */}
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
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Hey — I'm Maven.</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">Ask me anything about money — stocks, budgeting, saving, investing, debt, or just how to be smarter with your cash.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${msg.role === "user" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>
                  {msg.role === "assistant" && <Sparkles size={12} className="mb-1 text-muted-foreground" />}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-2.5 [&>ul]:mt-1.5 [&>ol]:mt-1.5 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-1.5 [&>h2]:tracking-tight [&>hr]:my-3 [&>hr]:border-border/20 [&>blockquote]:border-l-primary/30 [&>blockquote]:text-muted-foreground [&_em]:text-muted-foreground [&_li]:my-0.5">
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
                      >{msg.content}</ReactMarkdown>
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
