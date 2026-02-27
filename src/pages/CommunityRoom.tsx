import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Hash, TrendingUp, Users, Pin, Info,
  MoreHorizontal, Smile, Reply, Flag, Loader2, Bot,
  ChevronRight, X, Plus, BarChart3, Image, ListChecks,
  Bookmark, UserPlus, Copy, Check, Search, Pencil, Trash2,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import ChatAttachmentMenu from "@/components/chat/ChatAttachmentMenu";
import RichMessageContent from "@/components/chat/RichMessageContent";

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface Message {
  id: string;
  content: string;
  user_id: string | null;
  is_bot: boolean;
  is_pinned: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  reply_to: string | null;
  created_at: string;
  profile?: { username: string; display_name: string | null; avatar_url: string | null; is_verified: boolean };
  reactions?: Reaction[];
}

const QUICK_EMOJIS = ["🚀", "🔥", "💎", "🐻", "🐂", "📈", "📉", "💰"];
const ALL_EMOJIS = ["🚀", "🔥", "💎", "🐻", "🐂", "📈", "📉", "💰", "👍", "👎", "❤️", "😂", "😮", "😢", "🎉", "🤔", "👀", "💪", "🙏", "⚡", "🎯", "💯", "🤝", "🫡", "😤", "🥳", "😎", "🤑", "📊", "🏦"];

const CommunityRoom = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showAddUsers, setShowAddUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ user_id: string; username: string; display_name: string | null; avatar_url: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedUsers, setAddedUsers] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, { username: string; ts: number }>>(new Map());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [roomData, setRoomData] = useState<{
    id: string;
    name: string;
    type: string;
    slug: string;
    join_code: string | null;
    member_count: number;
    description: string | null;
    created_by: string | null;
  } | null>(null);

  const roomInfo = {
    name: roomData?.name || (slug?.startsWith("#") ? slug : `$${slug?.toUpperCase()}`),
    type: roomData?.type || (slug && /^[A-Za-z]{1,5}$/.test(slug) ? "stock" : "hashtag"),
    members: roomData?.member_count || 0,
    description: roomData?.description || `Discussion room for ${slug}`,
  };

  const inviteLink = roomData?.join_code ? `${window.location.origin}/join/${roomData.join_code}` : null;
  const isOwner = user && roomData?.created_by === user.id;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages & subscribe to realtime
  const roomIdRef = useRef<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const { data: room } = await supabase
        .from("rooms")
        .select("id, name, type, slug, join_code, member_count, description, created_by")
        .eq("slug", slug)
        .single();

      if (room) {
        setRoomData(room as any);
        roomIdRef.current = room.id;
      }

      if (room) {
        const { data } = await supabase
          .from("messages")
          .select("*, profile:profiles!messages_user_id_fkey(username, display_name, avatar_url, is_verified)")
          .eq("room_id", room.id)
          .order("created_at", { ascending: true })
          .limit(100);

        if (data) {
          // Fetch reactions for all messages
          const msgIds = data.map((m: any) => m.id);
          const { data: allReactions } = await supabase
            .from("message_reactions")
            .select("message_id, emoji, user_id")
            .in("message_id", msgIds);

          const msgs = (data as Message[]).map((msg) => {
            const msgReactions = (allReactions || []).filter((r: any) => r.message_id === msg.id);
            const emojiMap = new Map<string, { count: number; reacted: boolean }>();
            msgReactions.forEach((r: any) => {
              const existing = emojiMap.get(r.emoji) || { count: 0, reacted: false };
              existing.count++;
              if (r.user_id === user?.id) existing.reacted = true;
              emojiMap.set(r.emoji, existing);
            });
            msg.reactions = Array.from(emojiMap.entries()).map(([emoji, data]) => ({ emoji, ...data }));
            return msg;
          });
          setMessages(msgs);
        }
      }
      setLoading(false);
      return room?.id || null;
    };

    loadMessages();

    // Realtime subscription — only subscribe after we have the room
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribeRealtime = (roomId: string) => {
      channel = supabase
        .channel(`room-${slug}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        }, async (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.user_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("username, display_name, avatar_url, is_verified")
              .eq("user_id", newMsg.user_id)
              .single();
            if (profileData) newMsg.profile = profileData;
          }
          setMessages((prev) => {
            const deduped = prev.filter(
              (m) => m.id === newMsg.id ? false : !(m.user_id === newMsg.user_id && m.content === newMsg.content && m.id !== newMsg.id && Date.now() - new Date(m.created_at).getTime() < 5000)
            );
            if (deduped.some((m) => m.id === newMsg.id)) return deduped;
            return [...deduped, newMsg];
          });
        })
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => m.id === updated.id ? { ...m, content: updated.content, is_edited: updated.is_edited, is_deleted: updated.is_deleted } : m)
          );
        })
        .subscribe();
    };

    loadMessages().then((rid) => {
      if (rid) subscribeRealtime(rid);
    });

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [slug]);

  // Typing indicator channel
  useEffect(() => {
    if (!slug || !user || !profile) return;
    const ch = supabase.channel(`typing-${slug}`);
    ch.on("broadcast", { event: "typing" }, (payload) => {
      const { userId, username } = payload.payload as { userId: string; username: string };
      if (userId === user.id) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(userId, { username, ts: Date.now() });
        return next;
      });
    }).subscribe();
    typingChannelRef.current = ch;

    const cleanup = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next = new Map(prev);
        for (const [k, v] of next) {
          if (now - v.ts > 3000) next.delete(k);
        }
        return next.size !== prev.size ? next : prev;
      });
    }, 2000);

    return () => {
      supabase.removeChannel(ch);
      clearInterval(cleanup);
      typingChannelRef.current = null;
    };
  }, [slug, user, profile]);

  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current || !user || !profile) return;
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id, username: profile.username },
    });
  }, [user, profile]);

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return;
    setSending(true);

    // Find or create room
    let roomId: string | null = null;
    const { data: existingRoom } = await supabase
      .from("rooms")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingRoom) {
      roomId = existingRoom.id;
    } else {
      const { data: newRoom } = await supabase
        .from("rooms")
        .insert({
          type: roomInfo.type === "stock" ? "stock" : "hashtag",
          name: roomInfo.name,
          slug: slug!,
          description: roomInfo.description,
          symbol: roomInfo.type === "stock" ? slug!.toUpperCase() : null,
          created_by: user.id,
        })
        .select("id")
        .single();
      if (newRoom) roomId = newRoom.id;
    }

    if (!roomId) {
      toast.error("Failed to send message");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      user_id: user.id,
      content: input.trim(),
      reply_to: replyTo?.id || null,
    });

    if (error) {
      toast.error("Failed to send");
    } else {
      // Optimistic add
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: input.trim(),
          user_id: user.id,
          is_bot: false,
          is_pinned: false,
          is_edited: false,
          is_deleted: false,
          reply_to: replyTo?.id || null,
          created_at: new Date().toISOString(),
          profile: profile ? {
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified,
          } : undefined,
        },
      ]);
      setInput("");
      setReplyTo(null);
    }
    setSending(false);
    // Re-focus the input after sending
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    // Check if already reacted with this emoji
    const msg = messages.find((m) => m.id === messageId);
    const existing = msg?.reactions?.find((r) => r.emoji === emoji && r.reacted);

    if (existing) {
      // Remove reaction
      await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            reactions: (m.reactions || [])
              .map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, reacted: false } : r)
              .filter((r) => r.count > 0),
          };
        })
      );
    } else {
      // Add reaction
      await supabase.from("message_reactions").insert({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = [...(m.reactions || [])];
          const idx = reactions.findIndex((r) => r.emoji === emoji);
          if (idx >= 0) {
            reactions[idx] = { ...reactions[idx], count: reactions[idx].count + 1, reacted: true };
          } else {
            reactions.push({ emoji, count: 1, reacted: true });
          }
          return { ...m, reactions };
        })
      );
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("messages")
      .update({ is_deleted: true, content: "[deleted]" })
      .eq("id", msgId)
      .eq("user_id", user.id);
    if (error) { toast.error("Failed to delete"); return; }
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, is_deleted: true, content: "[deleted]" } : m));
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMsg(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMsg || !editContent.trim() || !user) return;
    const { error } = await supabase
      .from("messages")
      .update({ content: editContent.trim(), is_edited: true, edited_at: new Date().toISOString() })
      .eq("id", editingMsg)
      .eq("user_id", user.id);
    if (error) { toast.error("Failed to edit"); return; }
    setMessages((prev) => prev.map((m) => m.id === editingMsg ? { ...m, content: editContent.trim(), is_edited: true } : m));
    setEditingMsg(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingMsg(null);
    setEditContent("");
  };

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);
    setSearchResults((data || []) as any);
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch, searchUsers]);

  const addUserToRoom = async (userId: string) => {
    if (!roomData) return;
    const { error } = await supabase.from("room_members").insert({
      room_id: roomData.id,
      user_id: userId,
      role: "member",
    });
    if (error) {
      if (error.code === "23505") toast.info("User is already a member");
      else toast.error("Failed to add user");
      return;
    }
    setAddedUsers((prev) => new Set(prev).add(userId));
    toast.success("User added!");
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Parse cashtags and hashtags in message content
  const renderContent = (content: string) => {
    const parts = content.split(/(\$[A-Z]{1,5}|#\w+|@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("$")) {
        return (
          <button
            key={i}
            onClick={() => navigate(`/community/room/${part.slice(1)}`)}
            className="font-semibold text-accent-foreground hover:underline"
          >
            {part}
          </button>
        );
      }
      if (part.startsWith("#")) {
        return (
          <button
            key={i}
            onClick={() => navigate(`/community/room/${part.slice(1)}`)}
            className="font-medium text-gain hover:underline"
          >
            {part}
          </button>
        );
      }
      if (part.startsWith("@")) {
        return <span key={i} className="font-semibold text-foreground">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col lg:flex-row px-0 pt-0 lg:pt-0">
      {/* Chat Column */}
      <div className="flex flex-1 flex-col">
        {/* Room Header */}
        <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/community")} className="rounded-lg p-1.5 hover:bg-secondary lg:hidden">
              <ArrowLeft size={18} />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
              {roomInfo.type === "stock" ? <TrendingUp size={16} /> : <Hash size={16} />}
            </div>
            <div>
              <p className="text-sm font-semibold">{roomInfo.name}</p>
              <p className="text-[11px] text-muted-foreground">
                <Users size={10} className="mr-1 inline" />
                {roomInfo.members.toLocaleString()} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowAddUsers(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title="Add Users">
              <UserPlus size={16} />
            </button>
            <button onClick={() => setShowInfo(!showInfo)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mb-3">
                {roomInfo.type === "stock" ? <TrendingUp size={24} /> : <Hash size={24} />}
              </div>
              <p className="text-sm font-medium">Welcome to {roomInfo.name}</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                Be the first to start a conversation. Use $TICKER tags and #hashtags.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`group flex gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-secondary/30 ${
                  msg.is_bot ? "bg-secondary/20" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${
                  msg.is_bot ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {msg.is_bot ? <Bot size={14} /> : (
                    msg.profile?.display_name?.[0]?.toUpperCase() ||
                    msg.profile?.username?.[0]?.toUpperCase() ||
                    "U"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${msg.is_bot ? "text-accent-foreground" : ""}`}>
                      {msg.is_bot ? "🤖 Bot" : (msg.profile?.display_name || msg.profile?.username || "User")}
                    </span>
                    {msg.profile?.is_verified && (
                      <span className="rounded bg-accent/20 px-1 text-[9px] font-medium text-accent-foreground">✓</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                    {msg.is_pinned && <Pin size={10} className="text-accent-foreground" />}
                    {msg.is_edited && !msg.is_deleted && <span className="text-[10px] text-muted-foreground italic">(edited)</span>}
                  </div>

                  {msg.is_deleted ? (
                    <p className="mt-0.5 text-xs italic text-muted-foreground">Message deleted</p>
                  ) : editingMsg === msg.id ? (
                    <div className="mt-1 space-y-1.5">
                      <input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                        className="w-full rounded-lg bg-secondary px-3 py-1.5 text-sm outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5">
                        <button onClick={handleSaveEdit} className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-primary-foreground">Save</button>
                        <button onClick={handleCancelEdit} className="rounded-md px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 text-[13px] leading-relaxed break-words">
                      <RichMessageContent content={msg.content} />
                    </div>
                  )}

                  {/* Persistent reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {msg.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          onClick={() => addReaction(msg.id, r.emoji)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                            r.reacted
                              ? "bg-accent/20 ring-1 ring-accent/40 text-accent-foreground"
                              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span className="font-medium">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick actions on hover */}
                  <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {QUICK_EMOJIS.slice(0, 4).map((e) => (
                      <button
                        key={e}
                        onClick={() => addReaction(msg.id, e)}
                        className="rounded px-1 py-0.5 text-xs hover:bg-secondary"
                      >
                        {e}
                      </button>
                    ))}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                          <Smile size={12} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-[240px] p-2">
                        <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Pick an emoji</p>
                        <div className="grid grid-cols-6 gap-1">
                          {ALL_EMOJIS.map((e) => (
                            <button
                              key={e}
                              onClick={() => addReaction(msg.id, e)}
                              className="rounded-lg p-1.5 text-sm hover:bg-secondary transition-colors"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Reply size={12} />
                    </button>
                    {msg.user_id === user?.id && !msg.is_deleted && (
                      <>
                        <button
                          onClick={() => handleStartEdit(msg)}
                          className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                    <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <Flag size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply bar */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/30 px-4 py-2 flex items-center gap-2"
            >
              <Reply size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate flex-1">
                Replying to {replyTo.profile?.username || "user"}: {replyTo.content.slice(0, 60)}...
              </span>
              <button onClick={() => setReplyTo(null)}>
                <X size={14} className="text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-1.5 flex items-center gap-2"
            >
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {Array.from(typingUsers.values()).map((t) => t.username).slice(0, 3).join(", ")}
                {typingUsers.size > 3 ? ` +${typingUsers.size - 3}` : ""} typing…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="border-t border-border/30 px-4 py-3">
          {user ? (
            <div className="glass-card flex items-center gap-2 px-3 py-2.5">
              <ChatAttachmentMenu
                disabled={sending}
                onSendContent={(content) => {
                  // Send attachment content as a message directly
                  if (!user) return;
                  const sendAttachment = async () => {
                    let roomId: string | null = roomData?.id || null;
                    if (!roomId) {
                      const { data: existingRoom } = await supabase.from("rooms").select("id").eq("slug", slug).single();
                      roomId = existingRoom?.id || null;
                    }
                    if (!roomId) return;
                    await supabase.from("messages").insert({ room_id: roomId, user_id: user.id, content });
                  };
                  sendAttachment();
                }}
              />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); broadcastTyping(); }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${roomInfo.name}...`}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="rounded-lg bg-foreground p-1.5 text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="w-full rounded-xl bg-foreground py-3 text-center text-sm font-medium text-primary-foreground"
            >
              Sign in to chat
            </button>
          )}
        </div>
      </div>

      {/* Stock Data Panel (desktop) */}
      {roomInfo.type === "stock" && (
        <AnimatePresence>
          {showInfo && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col border-l border-border/30 overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{slug?.toUpperCase()} Overview</h3>
                  <button onClick={() => setShowInfo(false)} className="text-muted-foreground"><X size={14} /></button>
                </div>
                <div className="glass-card p-3 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Price</span><span className="font-medium">$142.50</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Change</span><span className="text-gain font-medium">+4.2%</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Volume</span><span className="font-medium">52.3M</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Mkt Cap</span><span className="font-medium">$3.5T</span></div>
                </div>
                <div className="glass-card p-3">
                  <p className="text-xs font-medium mb-2">Latest News</p>
                  <div className="space-y-2">
                    {["Q4 earnings beat expectations", "New AI chip announced", "Analyst upgrades to Buy"].map((n, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground">• {n}</p>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-3">
                  <p className="text-xs font-medium mb-2">Room Rules</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Be respectful. No pump-and-dump schemes. Disclose your positions. No financial advice.
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      )}

      {/* Add Users Dialog */}
      <Dialog open={showAddUsers} onOpenChange={setShowAddUsers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Add Users to {roomInfo.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Invite Link */}
            {inviteLink && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Invite Link</p>
                <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
                  <Copy size={14} className="text-muted-foreground shrink-0" />
                  <p className="flex-1 text-xs text-muted-foreground truncate font-mono">{inviteLink}</p>
                  <button
                    onClick={copyInviteLink}
                    className="rounded-lg px-2.5 py-1 text-xs font-medium bg-foreground text-primary-foreground hover:opacity-90 flex items-center gap-1"
                  >
                    {copiedLink ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
                {roomData?.join_code && (
                  <p className="text-[10px] text-muted-foreground">
                    Join code: <span className="font-mono font-bold tracking-wider">{roomData.join_code}</span>
                  </p>
                )}
              </div>
            )}

            {/* Search Users */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Search by username</p>
              <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                />
                {searching && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {searchResults.length === 0 && userSearch.length >= 2 && !searching && (
                <p className="text-xs text-muted-foreground text-center py-4">No users found</p>
              )}
              {searchResults.map((u) => {
                const alreadyAdded = addedUsers.has(u.user_id);
                const isCurrentUser = u.user_id === user?.id;
                return (
                  <div
                    key={u.user_id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-[10px] font-bold text-muted-foreground">
                      {(u.display_name?.[0] || u.username[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.display_name || u.username}</p>
                      <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                    </div>
                    {isCurrentUser ? (
                      <span className="text-[10px] text-muted-foreground">You</span>
                    ) : alreadyAdded ? (
                      <span className="flex items-center gap-1 text-[10px] text-gain"><Check size={12} /> Added</span>
                    ) : (
                      <button
                        onClick={() => addUserToRoom(u.user_id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityRoom;
