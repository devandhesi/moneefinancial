import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Check, MessageCircle, AtSign, TrendingUp, UserPlus, AlertTriangle, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Notification = Tables<"notifications">;

const iconMap: Record<string, typeof Bell> = {
  mention: AtSign,
  reply: MessageCircle,
  price_alert: TrendingUp,
  follow: UserPlus,
  room_invite: Mail,
  system: Bell,
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markOneRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <Bell size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Sign in to see notifications</p>
          <button onClick={() => navigate("/auth")} className="mt-3 rounded-xl bg-foreground px-6 py-2 text-sm text-primary-foreground">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <Check size={12} /> Mark all read
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={28} className="mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          {notifications.map((notif, i) => {
            const Icon = iconMap[notif.type] || Bell;
            return (
              <motion.button
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                onClick={() => {
                  if (!notif.is_read) markOneRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                className={`glass-card flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-secondary/50 ${
                  !notif.is_read ? "border-l-2 border-l-foreground" : ""
                }`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  !notif.is_read ? "bg-foreground/10" : "bg-secondary"
                }`}>
                  <Icon size={14} className={!notif.is_read ? "text-foreground" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.is_read ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                    {notif.title}
                  </p>
                  {notif.body && <p className="mt-0.5 text-xs text-muted-foreground truncate">{notif.body}</p>}
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(notif.created_at)}</span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
