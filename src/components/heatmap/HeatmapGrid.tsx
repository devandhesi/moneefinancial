import { useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import HeatmapTile from "./HeatmapTile";
import HeatmapTooltip from "./HeatmapTooltip";
import CursorSpotlightLayer from "./CursorSpotlightLayer";
import type { HeatmapSector, HeatmapTicker } from "@/data/heatmap-data";

type Timeframe = "1d" | "1w" | "1m";
type Metric = "change" | "volume" | "heat";
type CapFilter = "all" | "micro" | "small" | "mid" | "large";

interface Props {
  sectors: HeatmapSector[];
  compact?: boolean;
  searchQuery?: string;
  timeframe?: Timeframe;
  metric?: Metric;
  capFilter?: CapFilter;
  onSectorClick?: (sector: HeatmapSector) => void;
  activeSector?: HeatmapSector | null;
  onBack?: () => void;
}

function getChangeForTimeframe(item: { change_1d: number; change_1w: number; change_1m: number }, tf: Timeframe) {
  if (tf === "1w") return item.change_1w;
  if (tf === "1m") return item.change_1m;
  return item.change_1d;
}

function getMetricValue(item: { change_1d: number; change_1w: number; change_1m: number; volume_mult: number; heat_score?: number }, tf: Timeframe, metric: Metric) {
  if (metric === "volume") return item.volume_mult;
  if (metric === "heat") return item.heat_score || 0;
  return getChangeForTimeframe(item, tf);
}

const HeatmapGrid = ({
  sectors, compact = false, searchQuery = "", timeframe = "1d",
  metric = "change", capFilter = "all",
  onSectorClick, activeSector, onBack,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipTimeframe, setTooltipTimeframe] = useState<Timeframe>(timeframe);
  const [tooltipChanges, setTooltipChanges] = useState<{ change_1d: number; change_1w: number; change_1m: number } | null>(null);

  const handleHover = useCallback((data: any, changes?: any) => {
    setTooltipData(data);
    if (changes) setTooltipChanges(changes);
    else setTooltipChanges(null);
  }, []);

  // If viewing tickers inside a sector
  const tickerItems = useMemo(() => {
    if (!activeSector) return null;
    let items = activeSector.tickers;
    if (capFilter !== "all") items = items.filter(t => t.market_cap_label === capFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(t => t.symbol.toLowerCase().includes(q) || t.label.toLowerCase().includes(q));
    }
    return items.sort((a, b) => Math.abs(getMetricValue(b, timeframe, metric)) - Math.abs(getMetricValue(a, timeframe, metric)));
  }, [activeSector, capFilter, searchQuery, timeframe, metric]);

  // Sector items
  const sectorItems = useMemo(() => {
    if (activeSector) return null;
    let items = [...sectors];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(s => s.label.toLowerCase().includes(q));
    }
    return items.sort((a, b) => b.weight - a.weight);
  }, [sectors, searchQuery, activeSector]);

  // Calculate grid layout with treemap-like sizing
  const gridStyle = useMemo(() => {
    if (compact) return { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 };
    if (tickerItems) {
      const count = tickerItems.length;
      const cols = count <= 6 ? 3 : count <= 12 ? 4 : count <= 20 ? 5 : 6;
      return { display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 };
    }
    // Sectors: treemap-like weighted grid
    return { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gridAutoRows: "minmax(100px, auto)", gap: 6 };
  }, [compact, tickerItems]);

  const getSectorSpan = (weight: number): React.CSSProperties => {
    if (compact) return {};
    if (weight >= 20) return { gridColumn: "span 3", gridRow: "span 2" };
    if (weight >= 12) return { gridColumn: "span 2", gridRow: "span 2" };
    if (weight >= 8) return { gridColumn: "span 2" };
    return {};
  };

  return (
    <>
      <div ref={containerRef} className="relative" style={gridStyle}>
        {!compact && <CursorSpotlightLayer containerRef={containerRef} />}

        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {sectorItems && sectorItems.map((sector) => (
              <motion.div
                key={sector.id}
                style={getSectorSpan(sector.weight)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="h-full" style={{ minHeight: compact ? 50 : 80 }}>
                  <HeatmapTile
                    label={sector.label}
                    change={getChangeForTimeframe(sector, timeframe)}
                    volumeMult={sector.volume_mult}
                    size={compact ? "compact" : "normal"}
                    onClick={() => onSectorClick?.(sector)}
                    onHoverData={(d) => handleHover(d, { change_1d: sector.change_1d, change_1w: sector.change_1w, change_1m: sector.change_1m })}
                  />
                </div>
              </motion.div>
            ))}

            {tickerItems && tickerItems.map((ticker) => (
              <motion.div
                key={ticker.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                layout
              >
                <div style={{ minHeight: compact ? 50 : 90 }}>
                  <HeatmapTile
                    label={ticker.symbol}
                    sublabel={ticker.label}
                    change={getChangeForTimeframe(ticker, timeframe)}
                    volumeMult={ticker.volume_mult}
                    capLabel={ticker.market_cap_label}
                    heatScore={ticker.heat_score}
                    size={compact ? "compact" : "normal"}
                    onHoverData={(d) => handleHover(d, { change_1d: ticker.change_1d, change_1w: ticker.change_1w, change_1m: ticker.change_1m })}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </div>

      {!compact && (
        <HeatmapTooltip
          data={tooltipData}
          timeframe={tooltipTimeframe}
          onTimeframeChange={setTooltipTimeframe}
          changes={tooltipChanges || undefined}
        />
      )}
    </>
  );
};

export default HeatmapGrid;
