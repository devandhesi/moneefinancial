import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSimAccount, useSimOrders } from "@/hooks/use-sim-portfolio";

const tabs = ["All", "Filled", "Pending", "Cancelled"] as const;
type Tab = typeof tabs[number];

const statusColor: Record<string, string> = {
  filled: "bg-gain-subtle text-gain",
  pending: "bg-secondary text-muted-foreground",
  cancelled: "bg-loss-subtle text-loss",
  rejected: "bg-loss-subtle text-loss",
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const { data: simAccount } = useSimAccount();
  const { data: orders, isLoading } = useSimOrders(simAccount?.id);

  const filtered = (orders || []).filter((o) => {
    if (activeTab === "All") return true;
    return o.status.toLowerCase() === activeTab.toLowerCase();
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track all order activity</p>
      </motion.div>

      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${activeTab === t ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {activeTab === "All" ? "" : activeTab.toLowerCase() + " "}orders
          </p>
        )}
        {!isLoading && filtered.map((o, i) => {
          const sideLabel = o.side === "buy" ? "Buy" : "Sell";
          const typeLabel = o.order_type === "limit" ? "Limit" : "Market";
          const total = o.limit_price ? o.limit_price * o.quantity : null;

          return (
            <motion.div
              key={o.id}
              className="glass-card flex items-center justify-between p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
            >
              <div>
                <p className="text-sm font-semibold">
                  {typeLabel} {sideLabel} · {o.ticker}
                </p>
                <p className="text-xs text-muted-foreground">
                  {o.quantity} share{o.quantity !== 1 ? "s" : ""}
                  {o.limit_price ? ` @ $${o.limit_price.toFixed(2)}` : ""}
                  {total ? ` · $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""}
                </p>
                {o.placed_at && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDate(o.placed_at)}
                  </p>
                )}
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize ${statusColor[o.status] || "bg-secondary text-muted-foreground"}`}>
                {o.status}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
