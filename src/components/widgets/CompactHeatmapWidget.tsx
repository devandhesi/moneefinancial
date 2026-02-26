import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3X3, ChevronRight } from "lucide-react";
import HeatmapGrid from "@/components/heatmap/HeatmapGrid";
import { getHeatmapData } from "@/data/heatmap-data";

const CompactHeatmapWidget = () => {
  const [sectors] = useState(() => getHeatmapData());
  const navigate = useNavigate();

  // Show top 8 sectors only in compact mode
  const topSectors = useMemo(() => sectors.slice(0, 8), [sectors]);

  return (
    <div className="glass-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 size={14} className="text-muted-foreground" />
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Market Heatmap</h3>
        </div>
        <button
          onClick={() => navigate("/heatmap")}
          className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Expand <ChevronRight size={12} />
        </button>
      </div>
      <HeatmapGrid sectors={topSectors} compact />
    </div>
  );
};

export default CompactHeatmapWidget;
