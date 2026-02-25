import { motion } from "framer-motion";
import { Clock, ArrowUpRight } from "lucide-react";

const pendingTrades = [
  { symbol: "AMZN", type: "Limit Buy", price: 185.0, status: "Pending" },
  { symbol: "MSFT", type: "Limit Sell", price: 460.0, status: "Pending" },
];

const PendingTradesWidget = () => (
  <motion.div
    className="glass-card p-4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    <div className="flex items-center gap-2 text-sm font-medium">
      <Clock size={14} className="text-muted-foreground" />
      <span>Pending Trades</span>
    </div>
    <div className="mt-3 space-y-2">
      {pendingTrades.map((t) => (
        <div key={t.symbol} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{t.symbol}</span>
            <span className="text-muted-foreground">{t.type}</span>
          </div>
          <span className="font-medium">${t.price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default PendingTradesWidget;