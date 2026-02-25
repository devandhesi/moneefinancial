import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AiInsightWidget = () => (
  <motion.div
    className="glass-card p-4"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <div className="flex items-center gap-2 text-sm font-medium">
      <Sparkles size={14} className="text-muted-foreground" />
      <span>Maven Insight</span>
    </div>
    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
      Your tech exposure is 68% of total portfolio. Consider diversifying into
      healthcare or consumer staples to reduce correlation risk.
    </p>
  </motion.div>
);

export default AiInsightWidget;