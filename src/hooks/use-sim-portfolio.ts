import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

export interface SimAccount {
  id: string;
  name: string | null;
  base_currency: string | null;
}

export interface SimCashBalance {
  id: string;
  sim_account_id: string;
  currency: string;
  total: number;
  available: number;
}

export interface SimPosition {
  id: string;
  sim_account_id: string;
  ticker: string;
  quantity: number;
  avg_cost: number | null;
  market_value: number | null;
  unrealized_pnl: number | null;
}

// Auto-create sim account if needed, return it
async function ensureSimAccount(userId: string): Promise<SimAccount> {
  const { data: existing } = await supabase
    .from("sim_accounts")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("sim_accounts")
    .insert({ user_id: userId, name: "Paper Trading", base_currency: "USD" })
    .select()
    .single();

  if (error) throw error;

  // Create initial cash balance of $0
  await supabase.from("sim_cash_balances").insert({
    sim_account_id: created.id,
    currency: "USD",
    total: 0,
    available: 0,
  });

  return created;
}

export function useSimAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sim-account", user?.id],
    queryFn: () => ensureSimAccount(user!.id),
    enabled: !!user?.id,
    staleTime: Infinity,
  });
}

export function useSimCash(accountId: string | undefined) {
  return useQuery({
    queryKey: ["sim-cash", accountId],
    queryFn: async (): Promise<SimCashBalance | null> => {
      const { data } = await supabase
        .from("sim_cash_balances")
        .select("*")
        .eq("sim_account_id", accountId!)
        .eq("currency", "USD")
        .limit(1)
        .single();
      return data;
    },
    enabled: !!accountId,
    staleTime: 10_000,
  });
}

export function useSimPositions(accountId: string | undefined) {
  return useQuery({
    queryKey: ["sim-positions", accountId],
    queryFn: async (): Promise<SimPosition[]> => {
      const { data } = await supabase
        .from("sim_positions")
        .select("*")
        .eq("sim_account_id", accountId!)
        .gt("quantity", 0);
      return data || [];
    },
    enabled: !!accountId,
    staleTime: 10_000,
  });
}

export function useSimOrders(accountId: string | undefined) {
  return useQuery({
    queryKey: ["sim-orders", accountId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sim_orders")
        .select("*")
        .eq("sim_account_id", accountId!)
        .order("placed_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!accountId,
    staleTime: 10_000,
  });
}

export function useDepositFunds() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount }: { amount: number }) => {
      if (!user) throw new Error("Not authenticated");
      const account = await ensureSimAccount(user.id);

      // Get current balance
      const { data: cash } = await supabase
        .from("sim_cash_balances")
        .select("*")
        .eq("sim_account_id", account.id)
        .eq("currency", "USD")
        .single();

      if (cash) {
        await supabase
          .from("sim_cash_balances")
          .update({
            total: cash.total + amount,
            available: cash.available + amount,
            as_of: new Date().toISOString(),
          })
          .eq("id", cash.id);
      } else {
        await supabase.from("sim_cash_balances").insert({
          sim_account_id: account.id,
          currency: "USD",
          total: amount,
          available: amount,
        });
      }

      // Log as transaction
      await supabase.from("sim_transactions").insert({
        sim_account_id: account.id,
        side: "deposit",
        amount,
        currency: "USD",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sim-cash"] });
      qc.invalidateQueries({ queryKey: ["sim-transactions"] });
    },
  });
}

export function useExecuteTrade() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      symbol,
      side,
      quantity,
      price,
      orderType = "market",
      limitPrice,
    }: {
      symbol: string;
      side: "buy" | "sell";
      quantity: number;
      price: number;
      orderType?: "market" | "limit";
      limitPrice?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const account = await ensureSimAccount(user.id);
      const execPrice = orderType === "limit" && limitPrice ? limitPrice : price;
      const totalCost = execPrice * quantity;

      // Get cash
      const { data: cash } = await supabase
        .from("sim_cash_balances")
        .select("*")
        .eq("sim_account_id", account.id)
        .eq("currency", "USD")
        .single();

      if (!cash) throw new Error("No cash account found");

      if (side === "buy") {
        if (cash.available < totalCost) {
          throw new Error(`Insufficient funds. Available: $${cash.available.toFixed(2)}, Required: $${totalCost.toFixed(2)}`);
        }

        // Deduct cash
        await supabase
          .from("sim_cash_balances")
          .update({
            total: cash.total - totalCost,
            available: cash.available - totalCost,
            as_of: new Date().toISOString(),
          })
          .eq("id", cash.id);

        // Upsert position
        const { data: existingPos } = await supabase
          .from("sim_positions")
          .select("*")
          .eq("sim_account_id", account.id)
          .eq("ticker", symbol)
          .single();

        if (existingPos) {
          const newQty = existingPos.quantity + quantity;
          const newAvgCost =
            ((existingPos.avg_cost || 0) * existingPos.quantity + execPrice * quantity) / newQty;
          await supabase
            .from("sim_positions")
            .update({
              quantity: newQty,
              avg_cost: +newAvgCost.toFixed(4),
              market_value: +(newQty * execPrice).toFixed(2),
              unrealized_pnl: +((execPrice - newAvgCost) * newQty).toFixed(2),
              as_of: new Date().toISOString(),
            })
            .eq("id", existingPos.id);
        } else {
          await supabase.from("sim_positions").insert({
            sim_account_id: account.id,
            ticker: symbol,
            quantity,
            avg_cost: execPrice,
            market_value: +(quantity * execPrice).toFixed(2),
            unrealized_pnl: 0,
          });
        }
      } else {
        // Sell
        const { data: existingPos } = await supabase
          .from("sim_positions")
          .select("*")
          .eq("sim_account_id", account.id)
          .eq("ticker", symbol)
          .single();

        if (!existingPos || existingPos.quantity < quantity) {
          throw new Error(`Insufficient shares. You own ${existingPos?.quantity || 0} shares of ${symbol}`);
        }

        const newQty = existingPos.quantity - quantity;
        const proceeds = execPrice * quantity;

        // Add cash
        await supabase
          .from("sim_cash_balances")
          .update({
            total: cash.total + proceeds,
            available: cash.available + proceeds,
            as_of: new Date().toISOString(),
          })
          .eq("id", cash.id);

        if (newQty === 0) {
          await supabase.from("sim_positions").delete().eq("id", existingPos.id);
        } else {
          await supabase
            .from("sim_positions")
            .update({
              quantity: newQty,
              market_value: +(newQty * execPrice).toFixed(2),
              unrealized_pnl: +((execPrice - (existingPos.avg_cost || 0)) * newQty).toFixed(2),
              as_of: new Date().toISOString(),
            })
            .eq("id", existingPos.id);
        }
      }

      // Record order
      await supabase.from("sim_orders").insert({
        sim_account_id: account.id,
        ticker: symbol,
        side,
        quantity,
        order_type: orderType,
        limit_price: orderType === "limit" ? limitPrice : null,
        status: "filled",
      });

      // Record transaction
      await supabase.from("sim_transactions").insert({
        sim_account_id: account.id,
        ticker: symbol,
        side,
        quantity,
        price: execPrice,
        amount: totalCost,
        currency: "USD",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sim-cash"] });
      qc.invalidateQueries({ queryKey: ["sim-positions"] });
      qc.invalidateQueries({ queryKey: ["sim-orders"] });
      qc.invalidateQueries({ queryKey: ["sim-transactions"] });
    },
  });
}
