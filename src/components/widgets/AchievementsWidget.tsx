import { motion } from "framer-motion";
import { Award, Shield, BookOpen, TrendingUp, Clock } from "lucide-react";

const achievements = [
  { icon: Shield, label: "First Diversified Portfolio", earned: true, date: "Jan 2025" },
  { icon: Clock, label: "30 Days Without Panic Selling", earned: true, date: "Feb 2025" },
  { icon: BookOpen, label: "Completed Compounding Lesson", earned: true, date: "Jan 2025" },
  { icon: TrendingUp, label: "Reduced Concentration Risk", earned: false, date: null },
  { icon: Award, label: "100 Paper Trades Completed", earned: false, date: null },
];

const AchievementsWidget = () => (
  <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <h3 className="mb-3 text-xs font-medium text-muted-foreground">Milestones</h3>
    <div className="space-y-2.5">
      {achievements.map((a) => {
        const Icon = a.icon;
        return (
          <div key={a.label} className={`flex items-center gap-3 ${a.earned ? "" : "opacity-40"}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${a.earned ? "bg-gain/10" : "bg-secondary"}`}>
              <Icon size={14} className={a.earned ? "text-gain" : "text-muted-foreground"} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">{a.label}</p>
              {a.earned && a.date && <p className="text-[10px] text-muted-foreground">{a.date}</p>}
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
);

export default AchievementsWidget;
