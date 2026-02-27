import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, ArrowUpRight, ArrowDownRight, Send, MoreHorizontal, ArrowLeft, Search, Plus, Loader2, X, UserPlus, Pin, Pencil, Trash2, Check, Reply, Smile, Flag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePinnedItems } from "@/hooks/use-pinned-items";
import ChatAttachmentMenu from "@/components/chat/ChatAttachmentMenu";
import RichMessageContent from "@/components/chat/RichMessageContent";

// ─── Feed Tab ────────────────────────────────────────────────────────────────

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
  note: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
}

const initialTrades: Trade[] = [
  {
    id: "1", user: "Sarah M.", avatar: "SM", time: "2h ago", symbol: "NVDA", action: "Buy",
    shares: 15, price: 142.5, change: 5.1,
    note: "Adding to my AI exposure. Diversified across 3 sectors now.",
    likes: 12, liked: false,
    comments: [
      { user: "Jordan K.", text: "Great entry point. RSI was looking oversold too.", time: "1h ago" },
      { user: "Alex C.", text: "I'm considering the same move. What's your position size?", time: "45m ago" },
    ],
  },
  {
    id: "2", user: "Marcus T.", avatar: "MT", time: "4h ago", symbol: "VTI", action: "Buy",
    shares: 50, price: 268.3, change: 0.4,
    note: "Monthly DCA into total market. Boring but effective. 14th consecutive month.",
    likes: 24, liked: true,
    comments: [
      { user: "Lisa R.", text: "Consistency is key. Love the discipline.", time: "3h ago" },
    ],
  },
  {
    id: "3", user: "Jordan K.", avatar: "JK", time: "6h ago", symbol: "TSLA", action: "Sell",
    shares: 10, price: 276.0, change: -1.5,
    note: "Taking profits after 40% run. Rebalancing into healthcare to reduce concentration.",
    likes: 8, liked: false,
    comments: [],
  },
  {
    id: "4", user: "Priya S.", avatar: "PS", time: "8h ago", symbol: "XLV", action: "Buy",
    shares: 30, price: 142.8, change: 0.8,
    note: "Zero healthcare exposure was bugging me. This fills the gap nicely.",
    likes: 15, liked: false,
    comments: [
      { user: "Marcus T.", text: "Smart move. I need to do the same honestly.", time: "7h ago" },
      { user: "Sarah M.", text: "XLV is solid. Low vol, good diversifier.", time: "6h ago" },
    ],
  },
  {
    id: "5", user: "Alex C.", avatar: "AC", time: "1d ago", symbol: "AAPL", action: "Buy",
    shares: 5, price: 237.8, change: 2.4,
    note: "Couldn't resist after the dip. Maven warned me about concentration but I'm comfortable.",
    likes: 6, liked: false,
    comments: [
      { user: "Jordan K.", text: "Coach mode catch you?", time: "22h ago" },
      { user: "Alex C.", text: "Yep. Proceeded anyway. Tech is 72% now...", time: "21h ago" },
    ],
  },
];

function FeedTab() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

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

  return (
    <div className="space-y-4">
      {trades.map((trade, i) => (
        <motion.div
          key={trade.id}
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * i }}
        >
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

          <div className="mx-4 mt-3 rounded-xl bg-secondary/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${
                  trade.action === "Buy" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                }`}>
                  {trade.action}
                </span>
                <button onClick={() => navigate(`/invest/${trade.symbol}`)} className="text-sm font-semibold hover:underline">{trade.symbol}</button>
                <span className="text-xs text-muted-foreground">x {trade.shares}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">${trade.price.toFixed(2)}</p>
                <p className={`flex items-center gap-0.5 text-[10px] ${trade.change >= 0 ? "text-gain" : "text-loss"}`}>
                  {trade.change >= 0 ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                  {Math.abs(trade.change)}%
                </p>
              </div>
            </div>
          </div>

          <p className="px-4 pt-3 text-[13px] leading-relaxed text-muted-foreground">{trade.note}</p>

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
  );
}

// ─── Friends Tab ─────────────────────────────────────────────────────────────

interface Profile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface DM {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  edited_at: string | null;
  created_at: string;
  reply_to?: string | null;
}

interface ConversationPreview {
  partner: Profile;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

function FriendsTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePartner, setActivePartner] = useState<Profile | null>(null);
  const [chatMessages, setChatMessages] = useState<DM[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyTo, setReplyTo] = useState<DM | null>(null);
  const [showNewDM, setShowNewDM] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const { isPinned, togglePin } = usePinnedItems("dm");

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: allDMs } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!allDMs || allDMs.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const partnerMap = new Map<string, { msgs: DM[] }>();
    for (const dm of allDMs) {
      const partnerId = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id;
      if (!partnerMap.has(partnerId)) partnerMap.set(partnerId, { msgs: [] });
      partnerMap.get(partnerId)!.msgs.push(dm);
    }

    const partnerIds = Array.from(partnerMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", partnerIds);

    const profileMap = new Map<string, Profile>();
    for (const p of (profiles || [])) profileMap.set(p.user_id, p as Profile);

    const convos: ConversationPreview[] = [];
    for (const [partnerId, { msgs }] of partnerMap) {
      const partner = profileMap.get(partnerId);
      if (!partner) continue;
      const latest = msgs[0];
      const unread = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
      convos.push({ partner, lastMessage: latest.content, lastTime: latest.created_at, unread });
    }

    convos.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
    setConversations(convos);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const searchUsers = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .neq("user_id", user!.id)
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .limit(10);
    setSearchResults((data || []) as Profile[]);
    setSearching(false);
  };

  useEffect(() => {
    const t = setTimeout(() => { if (userSearch) searchUsers(userSearch); }, 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const openChat = useCallback(async (partner: Profile) => {
    if (!user) return;
    setActivePartner(partner);
    setChatMessages([]);
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partner.user_id}),and(sender_id.eq.${partner.user_id},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })
      .limit(200);
    setChatMessages((data || []) as DM[]);
    setShowNewDM(false);
    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("sender_id", partner.user_id)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (!user || !activePartner) return;
    const channel = supabase
      .channel(`dm-${activePartner.user_id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const msg = payload.new as DM;
        const isRelevant =
          (msg.sender_id === user.id && msg.receiver_id === activePartner.user_id) ||
          (msg.sender_id === activePartner.user_id && msg.receiver_id === user.id);
        if (isRelevant) {
          setChatMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.receiver_id === user.id) {
            supabase.from("direct_messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "direct_messages" }, (payload) => {
        const updated = payload.new as DM;
        setChatMessages(prev => prev.map(m => m.id === updated.id ? { ...m, content: updated.content, is_edited: updated.is_edited, is_deleted: updated.is_deleted } : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, activePartner]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !user || !activePartner || sending) return;
    const content = chatInput.trim();
    setChatInput("");
    setSending(true);
    const insertData: any = { sender_id: user.id, receiver_id: activePartner.user_id, content };
    if (replyTo) insertData.reply_to = replyTo.id;
    const { error } = await supabase.from("direct_messages").insert(insertData);
    setSending(false);
    if (error) { toast.error("Failed to send message"); setChatInput(content); } else { setReplyTo(null); }
  };

  const handleDeleteDM = async (msgId: string) => {
    if (!user) return;
    const { error } = await supabase.from("direct_messages").update({ is_deleted: true, content: "[deleted]" }).eq("id", msgId).eq("sender_id", user.id);
    if (error) { toast.error("Failed to delete"); return; }
    setChatMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true, content: "[deleted]" } : m));
  };

  const handleStartEditDM = (msg: DM) => { setEditingMsgId(msg.id); setEditContent(msg.content); };

  const handleSaveEditDM = async () => {
    if (!editingMsgId || !editContent.trim() || !user) return;
    const { error } = await supabase.from("direct_messages").update({ content: editContent.trim(), is_edited: true, edited_at: new Date().toISOString() }).eq("id", editingMsgId).eq("sender_id", user.id);
    if (error) { toast.error("Failed to edit"); return; }
    setChatMessages(prev => prev.map(m => m.id === editingMsgId ? { ...m, content: editContent.trim(), is_edited: true } : m));
    setEditingMsgId(null);
    setEditContent("");
  };

  const handleCancelEditDM = () => { setEditingMsgId(null); setEditContent(""); };

  if (!user) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="text-center">
          <MessageCircle size={28} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Sign in to message friends</p>
          <button onClick={() => navigate("/auth")} className="mt-3 rounded-xl bg-foreground px-6 py-2 text-sm text-primary-foreground">Sign In</button>
        </div>
      </div>
    );
  }

  // Active chat view
  if (activePartner) {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 12rem)" }}>
        <div className="flex items-center gap-3 pb-3 border-b border-border/30">
          <button onClick={() => { setActivePartner(null); loadConversations(); }} className="rounded-lg p-1.5 hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
            {(activePartner.display_name || activePartner.username).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{activePartner.display_name || activePartner.username}</p>
            <p className="text-[11px] text-muted-foreground">@{activePartner.username}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1 py-3 space-y-1">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle size={28} className="mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Start a conversation with @{activePartner.username}</p>
            </div>
          )}
          {chatMessages.map((msg) => {
            const isOwn = msg.sender_id === user.id;
            const isEditing = editingMsgId === msg.id;
            const repliedMsg = msg.reply_to ? chatMessages.find(m => m.id === msg.reply_to) : null;
            return (
              <div key={msg.id} className={`group flex gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-secondary/30 ${isOwn ? "flex-row-reverse" : ""}`}>
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold bg-secondary text-muted-foreground">
                  {isOwn
                    ? (user.user_metadata?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U")
                    : (activePartner.display_name?.[0]?.toUpperCase() || activePartner.username[0]?.toUpperCase() || "U")
                  }
                </div>
                <div className={`flex-1 min-w-0 ${isOwn ? "text-right" : ""}`}>
                  <div className={`flex items-center gap-2 ${isOwn ? "justify-end" : ""}`}>
                    <span className="text-xs font-semibold">{isOwn ? "You" : (activePartner.display_name || activePartner.username)}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(msg.created_at)}</span>
                    {msg.is_edited && !msg.is_deleted && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
                  </div>
                  {repliedMsg && (
                    <div className={`mt-0.5 mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground ${isOwn ? "justify-end" : ""}`}>
                      <Reply size={10} />
                      <span className="truncate max-w-[200px]">{repliedMsg.content.slice(0, 60)}</span>
                    </div>
                  )}
                  {msg.is_deleted ? (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">Message deleted</p>
                  ) : isEditing ? (
                    <div className="mt-1 space-y-1.5">
                      <input value={editContent} onChange={(e) => setEditContent(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSaveEditDM(); if (e.key === "Escape") handleCancelEditDM(); }} className="w-full rounded-lg bg-secondary px-3 py-1.5 text-sm outline-none" autoFocus />
                      <div className="flex items-center gap-1.5">
                        <button onClick={handleSaveEditDM} className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-primary-foreground">Save</button>
                        <button onClick={handleCancelEditDM} className="rounded-md px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[13px] leading-relaxed break-words">
                      <RichMessageContent content={msg.content} />
                    </div>
                  )}
                  {!msg.is_deleted && !isEditing && (
                    <div className="mt-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"><MoreHorizontal size={14} /></button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align={isOwn ? "end" : "start"} className="w-44 p-1">
                          <button onClick={() => setReplyTo(msg)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"><Reply size={13} /> Reply</button>
                          {isOwn && (
                            <>
                              <button onClick={() => handleStartEditDM(msg)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"><Pencil size={13} /> Edit</button>
                              <button onClick={() => handleDeleteDM(msg.id)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={13} /> Delete</button>
                            </>
                          )}
                          <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-secondary transition-colors"><Flag size={13} /> Report</button>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border/30 px-4 py-2 flex items-center gap-2">
              <Reply size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate flex-1">{replyTo.content.slice(0, 60)}</span>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-border/30 pt-3">
          <div className="glass-card flex items-center gap-2 px-3 py-2.5">
            <ChatAttachmentMenu
              disabled={sending}
              onSendContent={async (content) => {
                if (!user || !activePartner) return;
                const tempId = crypto.randomUUID();
                setChatMessages(prev => [...prev, { id: tempId, sender_id: user.id, receiver_id: activePartner.user_id, content, is_read: false, is_edited: false, is_deleted: false, edited_at: null, created_at: new Date().toISOString(), reply_to: null }]);
                const { error } = await supabase.from("direct_messages").insert({ sender_id: user.id, receiver_id: activePartner.user_id, content });
                if (error) { toast.error("Failed to send attachment"); setChatMessages(prev => prev.filter(m => m.id !== tempId)); }
              }}
            />
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={`Message @${activePartner.username}...`} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" disabled={sending} />
            <button onClick={sendMessage} disabled={sending || !chatInput.trim()} className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95 disabled:opacity-50">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  const filtered = search
    ? conversations.filter(c => c.partner.username.toLowerCase().includes(search.toLowerCase()) || (c.partner.display_name || "").toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const sortedFiltered = [...filtered].sort((a, b) => {
    const aPinned = isPinned(a.partner.user_id);
    const bPinned = isPinned(b.partner.user_id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {/* Search & New */}
      <div className="flex items-center gap-2">
        <div className="glass-card flex flex-1 items-center gap-2 px-3 py-2.5">
          <Search size={14} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search friends..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <button onClick={() => { setShowNewDM(true); setUserSearch(""); setSearchResults([]); }} className="rounded-xl bg-foreground p-2.5 text-primary-foreground transition-transform active:scale-95">
          <Plus size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
      ) : sortedFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageCircle size={28} className="mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">Tap + to start a new message</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedFiltered.map((conv) => {
            const pinned = isPinned(conv.partner.user_id);
            return (
              <div key={conv.partner.user_id} className={`glass-card flex w-full items-center gap-3 p-3 transition-colors hover:bg-secondary/50 ${pinned ? "ring-1 ring-accent/20" : ""}`}>
                <button onClick={() => openChat(conv.partner)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
                    {(conv.partner.display_name || conv.partner.username).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{conv.partner.display_name || conv.partner.username}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(conv.lastTime)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  {conv.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-primary-foreground">{conv.unread}</span>
                  )}
                  <button onClick={() => togglePin(conv.partner.user_id)} className={`rounded-lg p-1.5 transition-colors ${pinned ? "text-accent-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"} hover:bg-secondary`}>
                    <Pin size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New DM Dialog */}
      <Dialog open={showNewDM} onOpenChange={setShowNewDM}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
          <div className="glass-card flex items-center gap-2 px-3 py-2.5">
            <Search size={14} className="text-muted-foreground" />
            <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" autoFocus />
            {searching && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {searchResults.length === 0 && userSearch.length >= 2 && !searching && (
              <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
            )}
            {searchResults.map((u) => (
              <button
                key={u.user_id}
                onClick={() => openChat(u)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-[10px] font-bold text-muted-foreground">
                  {(u.display_name?.[0] || u.username[0]).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.display_name || u.username}</p>
                  <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const FinanceForYou = () => {
  const [tab, setTab] = useState<"feed" | "friends">("feed");

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Finance For You</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your social trading hub</p>
      </motion.div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-xl bg-secondary/50 p-1">
        {(["feed", "friends"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-foreground text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-5">
        {tab === "feed" ? <FeedTab /> : <FriendsTab />}
      </div>
    </div>
  );
};

export default FinanceForYou;
