import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Global hook that listens for:
 * 1. Incoming DMs via realtime
 * 2. Triggered stock alert events
 * 3. General notifications (price_alert, system, etc.)
 * Shows in-app toasts + browser Notifications for all.
 */
export function useDmNotifications() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const permissionAsked = useRef(false);

  // Request browser notification permission once
  useEffect(() => {
    if (permissionAsked.current) return;
    if ("Notification" in window && Notification.permission === "default") {
      permissionAsked.current = true;
      const t = setTimeout(() => Notification.requestPermission(), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("global-notifications")
      // ── DM listener ──
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const msg = payload.new as {
            id: string;
            sender_id: string;
            content: string;
          };

          if (location.pathname === "/community/dms") return;

          const { data: sender } = await supabase
            .from("profiles")
            .select("username, display_name")
            .eq("user_id", msg.sender_id)
            .single();

          const senderName = sender?.display_name || sender?.username || "Someone";
          const preview = msg.content.length > 60 ? msg.content.slice(0, 60) + "…" : msg.content;

          toast(senderName, {
            description: preview,
            action: { label: "View", onClick: () => navigate("/community/dms") },
            duration: 6000,
          });

          showBrowserNotif(`Message from ${senderName}`, preview, `dm-${msg.id}`, () => {
            navigate("/community/dms");
          });
        }
      )
      // ── Notifications table listener (price alerts, system, etc.) ──
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notif = payload.new as {
            id: string;
            title: string;
            body: string | null;
            type: string;
            link: string | null;
          };

          const isAlert = notif.type === "price_alert";
          const icon = isAlert ? "🚨" : "🔔";

          toast(`${icon} ${notif.title}`, {
            description: notif.body || undefined,
            action: notif.link
              ? { label: "View", onClick: () => navigate(notif.link!) }
              : undefined,
            duration: isAlert ? 10000 : 6000,
          });

          showBrowserNotif(notif.title, notif.body || "", `notif-${notif.id}`, () => {
            if (notif.link) navigate(notif.link);
            else navigate("/notifications");
          });
        }
      )
      // ── Alert events listener (stock_alerts triggers) ──
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alert_events",
        },
        async (payload) => {
          const event = payload.new as {
            id: string;
            alert_id: string;
            payload: Record<string, any> | null;
          };

          // Fetch the parent alert to check ownership and details
          const { data: alert } = await supabase
            .from("stock_alerts")
            .select("user_id, symbol, alert_type, target_value")
            .eq("id", event.alert_id)
            .single();

          if (!alert || alert.user_id !== user.id) return;

          const symbol = alert.symbol;
          const type = alert.alert_type.replace(/_/g, " ");
          const value = alert.target_value;
          const title = `🚨 ${symbol} Alert`;
          const body = value
            ? `${symbol} hit your ${type} target of $${value}`
            : `${symbol} triggered your ${type} alert`;

          toast(title, {
            description: body,
            action: {
              label: "View",
              onClick: () => navigate(`/invest/${symbol}`),
            },
            duration: 10000,
          });

          showBrowserNotif(title, body, `alert-${event.id}`, () => {
            navigate(`/invest/${symbol}`);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location.pathname, navigate]);
}

/** Helper to fire a browser Notification */
function showBrowserNotif(title: string, body: string, tag: string, onClick: () => void) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, { body, icon: "/favicon.ico", tag });
    n.onclick = () => {
      window.focus();
      onClick();
      n.close();
    };
  } catch {
    // Notification constructor can fail in some contexts
  }
}
