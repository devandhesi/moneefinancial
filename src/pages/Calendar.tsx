import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const events = [
  { date: "2026-02-27", label: "AAPL Q1 Earnings", type: "earnings" },
  { date: "2026-03-03", label: "NVDA Q4 Earnings", type: "earnings" },
  { date: "2026-03-05", label: "MSFT Limit Buy triggers", type: "order" },
  { date: "2026-03-10", label: "GOOGL Q1 Earnings", type: "earnings" },
  { date: "2026-03-12", label: "VTI Scheduled Buy", type: "order" },
  { date: "2026-03-18", label: "TSLA Earnings", type: "earnings" },
];

const typeStyles: Record<string, string> = {
  earnings: "bg-secondary text-foreground",
  order: "bg-gain-subtle text-gain",
};

const Calendar = () => {
  const [view, setView] = useState<"list" | "month">("list");

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Earnings & scheduled events</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView("list")} className={`rounded-lg px-3 py-1 text-xs font-medium ${view === "list" ? "bg-foreground text-primary-foreground" : "text-muted-foreground"}`}>List</button>
          <button onClick={() => setView("month")} className={`rounded-lg px-3 py-1 text-xs font-medium ${view === "month" ? "bg-foreground text-primary-foreground" : "text-muted-foreground"}`}>Month</button>
        </div>
      </motion.div>

      <div className="mt-5 space-y-2">
        {events.map((e, i) => (
          <motion.div key={i} className="glass-card flex items-center justify-between p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <CalendarDays size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{e.label}</p>
                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            <span className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${typeStyles[e.type]}`}>
              {e.type === "earnings" ? "Earnings" : "Order"}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;