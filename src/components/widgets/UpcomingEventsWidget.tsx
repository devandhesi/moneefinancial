import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const events = [
  { date: "Feb 27", label: "AAPL Earnings", type: "earnings" },
  { date: "Mar 3", label: "NVDA Earnings", type: "earnings" },
  { date: "Mar 5", label: "MSFT Limit Buy triggers", type: "order" },
];

const UpcomingEventsWidget = () => (
  <motion.div
    className="glass-card p-4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <div className="flex items-center gap-2 text-sm font-medium">
      <CalendarDays size={14} className="text-muted-foreground" />
      <span>Upcoming</span>
    </div>
    <div className="mt-3 space-y-2">
      {events.map((e, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{e.date}</span>
          <span className="font-medium">{e.label}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default UpcomingEventsWidget;