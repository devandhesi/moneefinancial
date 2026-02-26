import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  insight?: string;
  isLoading?: boolean;
}

const AiInsightWidget = ({ insight, isLoading }: Props) => (
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
    {isLoading ? (
      <div className="mt-3 flex items-center gap-2 text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-xs">Analyzing your portfolio…</span>
      </div>
    ) : (
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {insight || "Review your portfolio allocation and consider whether your current holdings align with your investment goals."}
      </p>
    )}
  </motion.div>
);

export default AiInsightWidget;
