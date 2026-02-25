import { useState } from "react";
import { motion } from "framer-motion";

const tabs = ["Pending", "Filled", "Cancelled", "Scheduled"] as const;
type Tab = typeof tabs[number];

const orders = [
  { id: 1, symbol: "AMZN", type: "Limit Buy", price: 185.0, shares: 10, status: "Pending" as Tab, impact: "Tech exposure +3%" },
  { id: 2, symbol: "MSFT", type: "Limit Sell", price: 460.0, shares: 3, status: "Pending" as Tab, impact: "Tech exposure -2%" },
  { id: 3, symbol: "AAPL", type: "Market Buy", price: 232.1, shares: 5, status: "Filled" as Tab, impact: "Tech exposure +2%" },
  { id: 4, symbol: "TSLA", type: "Market Sell", price: 280.5, shares: 3, status: "Filled" as Tab, impact: "Tech exposure -4%" },
  { id: 5, symbol: "GOOGL", type: "Limit Buy", price: 165.0, shares: 8, status: "Cancelled" as Tab, impact: "N/A" },
  { id: 6, symbol: "VTI", type: "Market Buy", price: 260.0, shares: 5, status: "Scheduled" as Tab, impact: "Diversification +5%" },
];

const statusColor: Record<Tab, string> = {
  Pending: "bg-secondary text-muted-foreground",
  Filled: "bg-gain-subtle text-gain",
  Cancelled: "bg-loss-subtle text-loss",
  Scheduled: "bg-secondary text-foreground",
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Pending");
  const filtered = orders.filter((o) => o.status === activeTab);

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
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No {activeTab.toLowerCase()} orders</p>}
        {filtered.map((o, i) => (
          <motion.div key={o.id} className="glass-card flex items-center justify-between p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <div>
              <p className="text-sm font-semibold">{o.type} · {o.symbol}</p>
              <p className="text-xs text-muted-foreground">{o.shares} shares @ ${o.price.toFixed(2)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Impact: {o.impact}</p>
            </div>
            <span className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${statusColor[o.status]}`}>{o.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orders;