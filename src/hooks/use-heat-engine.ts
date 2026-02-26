import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HeatSnapshot {
  id?: string;
  symbol: string;
  heat_score: number;
  stage: string;
  volume_subscore: number;
  momentum_subscore: number;
  volatility_subscore: number;
  options_subscore: number;
  attention_subscore: number;
  liquidity_subscore: number;
  confidence_level: number;
  drivers: string[];
  detail: {
    price: number;
    change: number;
    changePercent: number;
    volMultiple: number;
    fiveDayReturn: number;
    rsi: number;
    sma20: number;
    rangeExpansion: number;
    volPercentile: number;
    marketCap: string;
    avgDollarVol: string;
    name: string;
  };
  computed_at?: string;
}

export function useHeatEngine() {
  return useQuery<HeatSnapshot[]>({
    queryKey: ["heat-engine"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("heat-engine", {
        body: {},
      });
      if (error) throw error;
      return data?.snapshots || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });
}

export function useTickerHeat(symbol: string | undefined) {
  return useQuery<HeatSnapshot | null>({
    queryKey: ["heat-engine", symbol],
    queryFn: async () => {
      if (!symbol) return null;
      const { data, error } = await supabase.functions.invoke("heat-engine", {
        body: { symbol },
      });
      if (error) throw error;
      const snaps = data?.snapshots || [];
      return snaps.length > 0 ? snaps[0] : null;
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatHistory(symbol: string | undefined) {
  return useQuery<HeatSnapshot[]>({
    queryKey: ["heat-history", symbol],
    queryFn: async () => {
      if (!symbol) return [];
      const { data, error } = await supabase
        .from("heat_engine_snapshots")
        .select("*")
        .eq("symbol", symbol)
        .order("computed_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as HeatSnapshot[];
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
  });
}

export const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  cold: { label: "Cold", color: "text-blue-400", bg: "bg-blue-500/10" },
  warming: { label: "Warming", color: "text-sky-400", bg: "bg-sky-500/10" },
  building_pressure: { label: "Building Pressure", color: "text-amber-400", bg: "bg-amber-500/10" },
  breakout_watch: { label: "Breakout Watch", color: "text-orange-400", bg: "bg-orange-500/10" },
  overheated: { label: "Overheated", color: "text-red-400", bg: "bg-red-500/10" },
};
