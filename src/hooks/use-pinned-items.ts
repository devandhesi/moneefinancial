import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface PinnedItem {
  id: string;
  item_type: string;
  item_id: string;
  pinned_at: string;
}

export function usePinnedItems(itemType: "room" | "dm") {
  const { user } = useAuth();
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPins = useCallback(async () => {
    if (!user) { setPinnedIds(new Set()); setLoading(false); return; }
    const { data } = await supabase
      .from("pinned_items")
      .select("item_id")
      .eq("user_id", user.id)
      .eq("item_type", itemType);
    setPinnedIds(new Set((data || []).map((d: any) => d.item_id)));
    setLoading(false);
  }, [user, itemType]);

  useEffect(() => { fetchPins(); }, [fetchPins]);

  const togglePin = useCallback(async (itemId: string) => {
    if (!user) return;
    const isPinned = pinnedIds.has(itemId);
    if (isPinned) {
      await supabase
        .from("pinned_items")
        .delete()
        .eq("user_id", user.id)
        .eq("item_type", itemType)
        .eq("item_id", itemId);
      setPinnedIds((prev) => { const next = new Set(prev); next.delete(itemId); return next; });
    } else {
      await supabase.from("pinned_items").insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
      });
      setPinnedIds((prev) => new Set(prev).add(itemId));
    }
  }, [user, itemType, pinnedIds]);

  const isPinned = useCallback((itemId: string) => pinnedIds.has(itemId), [pinnedIds]);

  return { isPinned, togglePin, pinnedIds, loading };
}
