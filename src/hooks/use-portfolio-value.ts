import { useMemo, useEffect, useRef } from "react";
import { useSimAccount, useSimCash, useSimPositions } from "@/hooks/use-sim-portfolio";
import { useBatchQuotes } from "@/hooks/use-batch-quotes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface PortfolioSummary {
  cashBalance: number;
  investmentBalance: number;
  totalValue: number;
  totalDayChange: number;
  totalDayChangePct: number;
  isPositive: boolean;
  positions: {
    ticker: string;
    quantity: number;
    avgCost: number;
    livePrice: number;
    value: number;
    dayChange: number;
    dayChangePct: number;
    unrealizedPnl: number;
  }[];
  isLoading: boolean;
}

export function usePortfolioValue(): PortfolioSummary {
  const { user } = useAuth();
  const { data: simAccount } = useSimAccount();
  const { data: simCash, isLoading: cashLoading } = useSimCash(simAccount?.id);
  const { data: simPositions, isLoading: positionsLoading } = useSimPositions(simAccount?.id);

  const positionSymbols = (simPositions || []).map((p) => p.ticker);
  const { data: positionQuotes } = useBatchQuotes(positionSymbols, {
    enabled: positionSymbols.length > 0,
  });
  const quoteMap = new Map((positionQuotes || []).map((q) => [q.symbol, q]));

  const result = useMemo(() => {
    const cashBalance = simCash?.available ?? 0;
    const isLoading = cashLoading || positionsLoading;

    const positions = (simPositions || []).map((pos) => {
      const quote = quoteMap.get(pos.ticker);
      const livePrice = quote?.price ?? pos.avg_cost ?? 0;
      const value = livePrice * pos.quantity;
      const avgCost = pos.avg_cost ?? 0;
      return {
        ticker: pos.ticker,
        quantity: pos.quantity,
        avgCost,
        livePrice,
        value,
        dayChange: quote?.change ?? 0,
        dayChangePct: quote?.changePercent ?? 0,
        unrealizedPnl: (livePrice - avgCost) * pos.quantity,
      };
    });

    const investmentBalance = positions.reduce((sum, p) => sum + p.value, 0);
    const totalValue = cashBalance + investmentBalance;
    const totalDayChange = positions.reduce((sum, p) => sum + p.dayChange * p.quantity, 0);
    const totalDayChangePct =
      totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

    return {
      cashBalance,
      investmentBalance,
      totalValue,
      totalDayChange,
      totalDayChangePct,
      isPositive: totalDayChange >= 0,
      positions,
      isLoading,
    };
  }, [simCash, simPositions, quoteMap, cashLoading, positionsLoading]);

  // Record a live snapshot every 5 minutes so the chart reflects real market prices
  const lastSnapshotRef = useRef(0);
  useEffect(() => {
    if (!user || result.totalValue <= 0) return;
    const now = Date.now();
    if (now - lastSnapshotRef.current < 5 * 60 * 1000) return;
    lastSnapshotRef.current = now;

    supabase.from("portfolio_value_snapshots").insert({
      user_id: user.id,
      total_value: result.totalValue,
      cash_balance: result.cashBalance,
      investment_balance: result.investmentBalance,
    }).then(() => {});
  }, [user, result.totalValue]);

  return result;
}
