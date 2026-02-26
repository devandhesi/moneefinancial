import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

function formatDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const Calendar = () => {
  const [view, setView] = useState<"list" | "month">("list");
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const { firstDay, daysInMonth } = getMonthData(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const eventsByDate = new Map<string, typeof events>();
  events.forEach((e) => {
    const arr = eventsByDate.get(e.date) || [];
    arr.push(e);
    eventsByDate.set(e.date, arr);
  });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

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

      {view === "list" && (
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
      )}

      {view === "month" && (
        <motion.div className="mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-secondary transition-colors">
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <h3 className="text-sm font-semibold">{monthLabel}</h3>
            <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-secondary transition-colors">
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(viewYear, viewMonth, day);
              const dayEvents = eventsByDate.get(dateKey) || [];
              const isToday = day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();

              return (
                <div
                  key={day}
                  className={`glass-card h-16 rounded-lg p-1 flex flex-col ${isToday ? "ring-1 ring-foreground/20" : ""}`}
                >
                  <span className={`text-[10px] font-medium ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    {dayEvents.map((ev, ei) => (
                      <div
                        key={ei}
                        className={`mt-0.5 truncate rounded px-1 py-0.5 text-[8px] font-medium leading-tight ${
                          ev.type === "earnings" ? "bg-secondary text-foreground" : "bg-gain-subtle text-gain"
                        }`}
                        title={ev.label}
                      >
                        {ev.label.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-secondary" /> Earnings</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-gain-subtle" /> Order</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Calendar;
