import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, MessageCircle, Plus, Send, Loader2, X, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  created_at: string;
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

const DirectMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  // Active chat state
  const [activePartner, setActivePartner] = useState<Profile | null>(null);
  const [chatMessages, setChatMessages] = useState<DM[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New DM modal
  const [showNewDM, setShowNewDM] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  // Load conversation list
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

    // Group by partner
    const partnerMap = new Map<string, { msgs: DM[] }>();
    for (const dm of allDMs) {
      const partnerId = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id;
      if (!partnerMap.has(partnerId)) partnerMap.set(partnerId, { msgs: [] });
      partnerMap.get(partnerId)!.msgs.push(dm);
    }

    // Fetch partner profiles
    const partnerIds = Array.from(partnerMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", partnerIds);

    const profileMap = new Map<string, Profile>();
    for (const p of (profiles || [])) {
      profileMap.set(p.user_id, p as Profile);
    }

    const convos: ConversationPreview[] = [];
    for (const [partnerId, { msgs }] of partnerMap) {
      const partner = profileMap.get(partnerId);
      if (!partner) continue;
      const latest = msgs[0];
      const unread = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
      convos.push({
        partner,
        lastMessage: latest.content,
        lastTime: latest.created_at,
        unread,
      });
    }

    convos.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
    setConversations(convos);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Search users by username
  const searchUsers = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .neq("user_id", user!.id)
      .ilike("username", `%${q}%`)
      .limit(10);
    setSearchResults((data || []) as Profile[]);
    setSearching(false);
  };

  useEffect(() => {
    const t = setTimeout(() => { if (userSearch) searchUsers(userSearch); }, 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  // Open chat with a partner
  const openChat = useCallback(async (partner: Profile) => {
    if (!user) return;
    setActivePartner(partner);
    setChatMessages([]);

    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${partner.user_id}),and(sender_id.eq.${partner.user_id},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true })
      .limit(200);

    setChatMessages((data || []) as DM[]);
    setShowNewDM(false);

    // Mark unread as read
    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("sender_id", partner.user_id)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Realtime subscription for active chat
  useEffect(() => {
    if (!user || !activePartner) return;
    const channel = supabase
      .channel(`dm-${activePartner.user_id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
      }, (payload) => {
        const msg = payload.new as DM;
        const isRelevant =
          (msg.sender_id === user.id && msg.receiver_id === activePartner.user_id) ||
          (msg.sender_id === activePartner.user_id && msg.receiver_id === user.id);
        if (isRelevant) {
          setChatMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark as read if we're the receiver
          if (msg.receiver_id === user.id) {
            supabase.from("direct_messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activePartner]);

  // Send message
  const sendMessage = async () => {
    if (!chatInput.trim() || !user || !activePartner || sending) return;
    const content = chatInput.trim();
    setChatInput("");
    setSending(true);

    const { error } = await supabase.from("direct_messages").insert({
      sender_id: user.id,
      receiver_id: activePartner.user_id,
      content,
    });

    setSending(false);
    if (error) {
      toast.error("Failed to send message");
      setChatInput(content);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <MessageCircle size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Sign in to access messages</p>
          <button onClick={() => navigate("/auth")} className="mt-3 rounded-xl bg-foreground px-6 py-2 text-sm text-primary-foreground">Sign In</button>
        </div>
      </div>
    );
  }

  // Active chat view
  if (activePartner) {
    return (
      <div className="flex h-[calc(100vh-5rem)] flex-col px-5 pt-14 pb-4 lg:pt-8">
        {/* Chat header */}
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle size={28} className="mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Start a conversation with @{activePartner.username}</p>
            </div>
          )}
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                msg.sender_id === user.id
                  ? "bg-foreground text-primary-foreground"
                  : "glass-card"
              }`}>
                {msg.content}
                <span className={`block text-[9px] mt-0.5 ${
                  msg.sender_id === user.id ? "text-primary-foreground/50" : "text-muted-foreground"
                }`}>
                  {timeAgo(msg.created_at)}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass-card flex items-center gap-2 px-4 py-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={sending}
          />
          <button onClick={sendMessage} disabled={sending || !chatInput.trim()} className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95 disabled:opacity-50">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    );
  }

  // Conversation list view
  const filtered = search
    ? conversations.filter(c =>
        c.partner.username.toLowerCase().includes(search.toLowerCase()) ||
        (c.partner.display_name || "").toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

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
          <button onClick={() => { setShowNewDM(true); setUserSearch(""); setSearchResults([]); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-primary-foreground">
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

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageCircle size={28} className="mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{search ? "No matching conversations" : "No messages yet"}</p>
          <button onClick={() => { setShowNewDM(true); setUserSearch(""); setSearchResults([]); }} className="mt-3 flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-primary-foreground">
            <UserPlus size={12} /> Start a conversation
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          {filtered.map((conv, i) => (
            <motion.button
              key={conv.partner.user_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              onClick={() => openChat(conv.partner)}
              className="glass-card flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
                {(conv.partner.display_name || conv.partner.username).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{conv.partner.display_name || conv.partner.username}</p>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(conv.lastTime)}</span>
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
      )}

      {/* New DM Modal */}
      <AnimatePresence>
        {showNewDM && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowNewDM(false)}>
            <motion.div className="absolute inset-0 bg-background/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className="relative z-10 w-[360px] rounded-2xl border border-border bg-card p-5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">New Message</h3>
                <button onClick={() => setShowNewDM(false)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 mb-3">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by username..."
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>

              <div className="max-h-[240px] overflow-y-auto space-y-1">
                {searching && (
                  <div className="flex justify-center py-4"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
                )}
                {!searching && userSearch.length >= 2 && searchResults.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">No users found</p>
                )}
                {!searching && userSearch.length > 0 && userSearch.length < 2 && (
                  <p className="text-center text-xs text-muted-foreground py-4">Type at least 2 characters</p>
                )}
                {searchResults.map((p) => (
                  <button
                    key={p.user_id}
                    onClick={() => openChat(p)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-[10px] font-bold text-muted-foreground">
                      {(p.display_name || p.username).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.display_name || p.username}</p>
                      <p className="text-[11px] text-muted-foreground">@{p.username}</p>
                    </div>
                    <MessageCircle size={14} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectMessages;
