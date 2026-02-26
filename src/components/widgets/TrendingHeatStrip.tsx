import { useNavigate } from "react-router-dom";
import { Flame, ChevronRight } from "lucide-react";
import { useHeatEngine, STAGE_CONFIG } from "@/hooks/use-heat-engine";

const TrendingHeatStrip = () => {
  const { data: snapshots, isLoading } = useHeatEngine();
  const navigate = useNavigate();

  if (isLoading || !snapshots || snapshots.length === 0) return null;

  // Show top 6 by heat score, only those with score >= 30
  const hot = snapshots.filter(s => s.heat_score >= 30).slice(0, 6);
  if (hot.length === 0) return null;

  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-orange-400" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Trending Heat</h3>
        </div>
        <button
          onClick={() => navigate("/heat-engine")}
          className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ChevronRight size={12} />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {hot.map(s => {
          const config = STAGE_CONFIG[s.stage] || STAGE_CONFIG.cold;
          return (
            <button
              key={s.symbol}
              onClick={() => navigate(`/invest/${s.symbol}`)}
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors hover:bg-secondary"
            >
              <span className={`text-base font-bold tabular-nums ${s.heat_score >= 70 ? "text-orange-400" : s.heat_score >= 50 ? "text-amber-400" : "text-sky-400"}`}>
                {s.heat_score}
              </span>
              <span className="text-xs font-semibold">{s.symbol}</span>
              <span className={`text-[9px] font-medium ${config.color}`}>{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingHeatStrip;
