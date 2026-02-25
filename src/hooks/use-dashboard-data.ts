import { useQuery } from "@tanstack/react-query";
import { getStockQuote } from "@/lib/market-api";

const HOLDING_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA"];
const INDEX_SYMBOLS = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^DJI", label: "DOW" },
];

export interface LiveHolding {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  shares: number;
  value: number;
}

export interface LiveIndex {
  label: string;
  value: string;
  change: number;
}

const SHARES_MAP: Record<string, number> = {
  AAPL: 18,
  MSFT: 7,
  GOOGL: 16,
  TSLA: 8,
};

export function useLiveHoldings() {
  return useQuery({
    queryKey: ["dashboard-holdings"],
    queryFn: async (): Promise<LiveHolding[]> => {
      const results = await Promise.all(
        HOLDING_SYMBOLS.map(async (symbol) => {
          const quote = await getStockQuote(symbol, "1D");
          const shares = SHARES_MAP[symbol] || 1;
          return {
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            shares,
            value: +(quote.price * shares).toFixed(2),
          };
        })
      );
      return results;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
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
  return useQuery({
    queryKey: ["dashboard-portfolio-chart", timeframe],
    queryFn: async () => {
      // Fetch chart data for all holdings and aggregate
      const allCharts = await Promise.all(
        HOLDING_SYMBOLS.map(async (symbol) => {
          const quote = await getStockQuote(symbol, timeframe);
          return { symbol, chart: quote.chart, shares: SHARES_MAP[symbol] || 1 };
        })
      );

      // Build a date-indexed portfolio value map
      const dateMap = new Map<string, number>();

      for (const { chart, shares } of allCharts) {
        for (const point of chart) {
          const existing = dateMap.get(point.date) || 0;
          dateMap.set(point.date, existing + point.price * shares);
        }
      }

      // Use the first stock's chart order as the canonical date order
      const canonicalDates = allCharts[0]?.chart.map((p) => p.date) || [];
      const uniqueDates = [...new Set(canonicalDates)];

      return uniqueDates
        .filter((date) => dateMap.has(date))
        .map((date) => ({
          date,
          value: +(dateMap.get(date)! || 0).toFixed(2),
        }));
    },
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}
