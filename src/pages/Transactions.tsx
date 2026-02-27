import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Loader2, Wallet } from "lucide-react";
import { useSimAccount } from "@/hooks/use-sim-portfolio";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function useSimTransactions(accountId: string | undefined) {
  return useQuery({
    queryKey: ["sim-transactions", accountId],
    queryFn: async () => {
      const { data } = await supabase
        .from("sim_transactions")
        .select("*")
        .eq("sim_account_id", accountId!)
        .order("executed_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!accountId,
    staleTime: 10_000,
  });
}

const Transactions = () => {
  const { data: simAccount } = useSimAccount();
  const { data: transactions, isLoading } = useSimTransactions(simAccount?.id);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const sideLabel = (side: string | null) => {
    if (!side) return "—";
    const s = side.toLowerCase();
    if (s === "buy") return "Buy";
    if (s === "sell") return "Sell";
    if (s === "deposit") return "Deposit";
    return side;
  };

  const sideColor = (side: string | null) => {
    if (!side) return "";
    const s = side.toLowerCase();
    if (s === "buy") return "text-gain";
    if (s === "sell") return "text-loss";
    if (s === "deposit") return "text-blue-400";
    return "text-muted-foreground";
  };

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Complete trade & deposit history</p>
      </motion.div>

      <div className="mt-5 space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (!transactions || transactions.length === 0) && (
          <div className="py-12 text-center">
            <Wallet size={28} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        )}

        {!isLoading && transactions?.map((t, i) => {
          const isDeposit = t.side?.toLowerCase() === "deposit";
          const isBuy = t.side?.toLowerCase() === "buy";
          const total = t.amount ?? (t.price && t.quantity ? t.price * t.quantity : 0);

          return (
            <motion.div
              key={t.id}
              className="glass-card flex items-center justify-between p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * Math.min(i, 15) }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                  isDeposit ? "bg-blue-500/15 text-blue-400" : isBuy ? "bg-gain-subtle text-gain" : "bg-loss-subtle text-loss"
                }`}>
                  {isDeposit ? (
                    <Wallet size={14} />
                  ) : isBuy ? (
                    <ArrowDownRight size={14} />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${sideColor(t.side)}`}>
                    {sideLabel(t.side)}
                    {t.ticker ? ` · ${t.ticker}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDeposit
                      ? "Cash deposit"
                      : `${t.quantity ?? 0} share${(t.quantity ?? 0) !== 1 ? "s" : ""}${t.price ? ` @ $${t.price.toFixed(2)}` : ""}`
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {t.executed_at && (
                  <p className="text-[11px] text-muted-foreground">{formatDate(t.executed_at)}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Transactions;
