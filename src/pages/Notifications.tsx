import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Check, MessageCircle, AtSign, TrendingUp, UserPlus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "mention", title: "@jordan_k mentioned you", body: "in $NVDA room: \"@you what's your PT?\"", time: "2m ago", read: false, link: "/community/room/NVDA" },
  { id: "2", type: "reply", title: "Sarah M. replied to you", body: "\"Great analysis, I agree with the support level\"", time: "15m ago", read: false, link: "/community/room/gold" },
  { id: "3", type: "price_alert", title: "$TSLA hit $280", body: "Your price alert for Tesla triggered", time: "1h ago", read: false, link: "/community/room/TSLA" },
  { id: "4", type: "follow", title: "Marcus T. followed you", body: "You have a new follower", time: "3h ago", read: true, link: "/profile" },
  { id: "5", type: "system", title: "Welcome to monee Community!", body: "Start by joining rooms and following traders", time: "1d ago", read: true, link: "/community" },
];

const iconMap: Record<string, typeof Bell> = {
  mention: AtSign,
  reply: MessageCircle,
  price_alert: TrendingUp,
  follow: UserPlus,
  system: Bell,
};

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                if (notif.link) navigate(notif.link);
              }}
              className={`glass-card flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-secondary/50 ${
                !notif.read ? "border-l-2 border-l-foreground" : ""
              }`}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                !notif.read ? "bg-foreground/10" : "bg-secondary"
              }`}>
                <Icon size={14} className={!notif.read ? "text-foreground" : "text-muted-foreground"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                  {notif.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{notif.body}</p>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground">{notif.time}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
