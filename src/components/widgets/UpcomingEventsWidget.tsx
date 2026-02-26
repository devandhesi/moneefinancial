import { motion } from "framer-motion";
import { CalendarDays, Loader2 } from "lucide-react";
import type { UpcomingEvent } from "@/hooks/use-daily-digest";

interface Props {
  events?: UpcomingEvent[];
  isLoading?: boolean;
}

const UpcomingEventsWidget = ({ events, isLoading }: Props) => (
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
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={12} className="animate-spin" />
          <span className="text-xs">Loading events…</span>
        </div>
      ) : (
        (events || []).map((e, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{e.date}</span>
            <span className="font-medium">{e.label}</span>
          </div>
        ))
      )}
    </div>
  </motion.div>
);

export default UpcomingEventsWidget;
