import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Global hook that listens for incoming DMs via realtime
 * and shows in-app toasts + browser Notifications.
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
      // Delay slightly so it doesn't fire on first page load
      const t = setTimeout(() => Notification.requestPermission(), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("global-dm-listener")
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
            created_at: string;
          };

          // Skip if user is already viewing this DM conversation
          if (location.pathname === "/community/dms") return;

          // Fetch sender profile for display name
          const { data: sender } = await supabase
            .from("profiles")
            .select("username, display_name")
            .eq("user_id", msg.sender_id)
            .single();

          const senderName = sender?.display_name || sender?.username || "Someone";
          const preview = msg.content.length > 60 ? msg.content.slice(0, 60) + "…" : msg.content;

          // In-app toast
          toast(senderName, {
            description: preview,
            action: {
              label: "View",
              onClick: () => navigate("/community/dms"),
            },
            duration: 6000,
          });

          // Browser notification (works when tab is in background)
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              const notif = new Notification(`Message from ${senderName}`, {
                body: preview,
                icon: "/favicon.ico",
                tag: `dm-${msg.id}`,
              });
              notif.onclick = () => {
                window.focus();
                navigate("/community/dms");
                notif.close();
              };
            } catch {
              // Notification constructor can fail in some contexts
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, location.pathname, navigate]);
}
