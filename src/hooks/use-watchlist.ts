import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useWatchlist() {
  const { user } = useAuth();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      // Fallback to localStorage for unauthenticated users
      try {
        const stored = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
        setSymbols(stored);
      } catch { setSymbols([]); }
      setLoading(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("watchlist")
        .select("symbol")
        .eq("user_id", user.id)
        .order("added_at", { ascending: true });
      const dbSymbols = (data || []).map(r => r.symbol);
      
      // Migrate localStorage watchlist to DB if needed
      try {
        const local: string[] = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
        const toMigrate = local.filter(s => !dbSymbols.includes(s));
        if (toMigrate.length > 0) {
          await supabase.from("watchlist").insert(
            toMigrate.map(symbol => ({ user_id: user.id, symbol }))
          );
          dbSymbols.push(...toMigrate);
          localStorage.removeItem("monee-watchlist");
        }
      } catch {}
      
      setSymbols(dbSymbols);
    } catch {
      setSymbols([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const addSymbol = useCallback(async (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (symbols.includes(upper)) return;
    setSymbols(prev => [...prev, upper]);
    if (user) {
      await supabase.from("watchlist").insert({ user_id: user.id, symbol: upper });
    } else {
      const updated = [...symbols, upper];
      localStorage.setItem("monee-watchlist", JSON.stringify(updated));
    }
  }, [user, symbols]);

  const removeSymbol = useCallback(async (symbol: string) => {
    const upper = symbol.toUpperCase();
    setSymbols(prev => prev.filter(s => s !== upper));
    if (user) {
      await supabase.from("watchlist").delete().eq("user_id", user.id).eq("symbol", upper);
    } else {
      const updated = symbols.filter(s => s !== upper);
      localStorage.setItem("monee-watchlist", JSON.stringify(updated));
    }
  }, [user, symbols]);

  const hasSymbol = useCallback((symbol: string) => {
    return symbols.includes(symbol.toUpperCase());
  }, [symbols]);

  return { symbols, loading, addSymbol, removeSymbol, hasSymbol, refresh: load };
}
