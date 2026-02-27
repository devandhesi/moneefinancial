import { useQuery } from "@tanstack/react-query";
import { getStockQuote } from "@/lib/market-api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { usePortfolioValue } from "@/hooks/use-portfolio-value";

const INDEX_SYMBOLS = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^DJI", label: "DOW" },
];

export interface LiveIndex {
  label: string;
  value: string;
  change: number;
}

export function useLiveIndices() {
  return useQuery({
    queryKey: ["dashboard-indices"],
    queryFn: async (): Promise<LiveIndex[]> => {
      const results = await Promise.all(
        INDEX_SYMBOLS.map(async ({ symbol, label }) => {
          const quote = await getStockQuote(symbol, "1D");
          return {
            label,
            value: quote.price.toLocaleString("en-US", { minimumFractionDigits: 2 }),
            change: quote.changePercent,
          };
        })
      );
      return results;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function usePortfolioChart(timeframe: string) {
  const { user } = useAuth();
  const portfolio = usePortfolioValue();

  return useQuery({
    queryKey: ["dashboard-portfolio-chart", timeframe, user?.id, portfolio.totalValue],
    queryFn: async () => {
      if (!user) return [];

      // Determine date cutoff based on timeframe
      const now = new Date();
      let cutoff: Date;
      switch (timeframe) {
        case "1D": cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        case "1W": cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case "1M": cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        case "3M": cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
        case "1Y": cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
        default: cutoff = new Date(0); // ALL
      }

      const { data } = await supabase
        .from("portfolio_value_snapshots")
        .select("total_value, recorded_at")
        .eq("user_id", user.id)
        .gte("recorded_at", cutoff.toISOString())
        .order("recorded_at", { ascending: true })
        .limit(500);

      const points = (data || []).map((row) => ({
        date: new Date(row.recorded_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric",
          ...(timeframe === "1D" ? { hour: "numeric", minute: "2-digit" } : {}),
        }),
        value: +Number(row.total_value).toFixed(2),
      }));

      // Always append the current live portfolio value so the chart is up-to-date
      if (portfolio.totalValue > 0) {
        const liveDate = new Date().toLocaleDateString("en-US", {
          month: "short", day: "numeric",
          ...(timeframe === "1D" ? { hour: "numeric", minute: "2-digit" } : {}),
        });
        // Avoid duplicate if last snapshot is very recent with the same label
        if (points.length === 0 || points[points.length - 1].date !== liveDate || Math.abs(points[points.length - 1].value - portfolio.totalValue) > 0.01) {
          points.push({ date: liveDate, value: +portfolio.totalValue.toFixed(2) });
        }
      }

      return points;
    },
    enabled: !!user?.id && !portfolio.isLoading,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
