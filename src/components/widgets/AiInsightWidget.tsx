import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MavenIcon from "../MavenIcon";

interface Props {
  insight?: string;
  isLoading?: boolean;
}

const AiInsightWidget = ({ insight, isLoading }: Props) => {
  const navigate = useNavigate();
  const displayInsight = insight || "Review your portfolio allocation and consider whether your current holdings align with your investment goals.";

  const handleLearnMore = () => {
    navigate("/chat", {
      state: {
        prefill: `You just gave me this insight: "${displayInsight}"\n\nCan you explain this in more detail? What specific actions should I take, and why is this important for my portfolio right now?`,
      },
    });
  };

  return (
    <motion.div
      className="glass-card p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <MavenIcon size={14} className="text-muted-foreground" />
        <span>Maven Insight</span>
      </div>
      {isLoading ? (
        <div className="mt-3 flex items-center gap-2 text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">Analyzing your portfolio…</span>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {displayInsight}
          </p>
          <button
            onClick={handleLearnMore}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-foreground/70 hover:text-foreground transition-colors group"
          >
            Learn more from Maven
            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}
    </motion.div>
  );
};

export default AiInsightWidget;
