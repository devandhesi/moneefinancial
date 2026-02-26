import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BatchQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  sparkline: number[];
}

export function useBatchQuotes(symbols: string[], options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: ["batch-quotes", symbols.join(",")],
    queryFn: async (): Promise<BatchQuote[]> => {
      if (!symbols.length) return [];
      const { data, error } = await supabase.functions.invoke("batch-quotes", {
        body: { symbols },
      });
      if (error) throw error;
      return data?.quotes || [];
    },
    enabled: options?.enabled !== false && symbols.length > 0,
    refetchInterval: options?.refetchInterval ?? 60_000,
    staleTime: 30_000,
  });
}
