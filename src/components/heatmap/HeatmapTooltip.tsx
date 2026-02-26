import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipData {
  label: string;
  sublabel?: string;
  change: number;
  volumeMult: number;
  capLabel?: string;
  x: number;
  y: number;
}

interface Props {
  data: TooltipData | null;
  timeframe: "1d" | "1w" | "1m";
  onTimeframeChange: (tf: "1d" | "1w" | "1m") => void;
  changes?: { change_1d: number; change_1w: number; change_1m: number };
}

function getMomentumLabel(change: number, volumeMult: number): string {
  if (change > 3 && volumeMult > 1.8) return "Surging";
  if (change > 1.5) return "Heating up";
  if (change > 0.3) return "Warming";
  if (change < -3 && volumeMult > 1.8) return "Selling pressure";
  if (change < -1.5) return "Cooling";
  if (change < -0.3) return "Fading";
  return "Neutral";
}

const HeatmapTooltip = memo(({ data, timeframe, onTimeframeChange, changes }: Props) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!data || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const w = el.offsetWidth || 220;
    const h = el.offsetHeight || 140;
    const pad = 16;

    let tx = data.x + 20;
    let ty = data.y - h / 2;

    if (tx + w > window.innerWidth - pad) tx = data.x - w - 20;
    if (ty < pad) ty = pad;
    if (ty + h > window.innerHeight - pad) ty = window.innerHeight - pad - h;

    setPos({ x: tx, y: ty });
  }, [data]);

  const momentum = data ? getMomentumLabel(data.change, data.volumeMult) : "";
  const momentumColor = data
    ? data.change > 1 ? "text-gain" : data.change < -1 ? "text-loss" : "text-muted-foreground"
    : "";

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          ref={tooltipRef}
          className="pointer-events-none fixed z-50"
          style={{ left: pos.x, top: pos.y }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="rounded-xl border border-border/60 p-3 shadow-xl"
            style={{
              background: "hsl(var(--card) / 0.92)",
              backdropFilter: "blur(20px)",
              minWidth: 200,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{data.label}</p>
                {data.sublabel && (
                  <p className="text-[11px] text-muted-foreground">{data.sublabel}</p>
                )}
              </div>
              {data.capLabel && (
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {data.capLabel}
                </span>
              )}
            </div>

            {/* Timeframe toggles */}
            {changes && (
              <div className="mt-2 flex gap-1">
                {(["1d", "1w", "1m"] as const).map(tf => {
                  const val = tf === "1d" ? changes.change_1d : tf === "1w" ? changes.change_1w : changes.change_1m;
                  const isActive = tf === timeframe;
                  return (
                    <button
                      key={tf}
                      className={`pointer-events-auto rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${isActive ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                      onClick={(e) => { e.stopPropagation(); onTimeframeChange(tf); }}
                    >
                      {tf.toUpperCase()} {val > 0 ? "+" : ""}{val.toFixed(1)}%
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${momentumColor}`}>{momentum}</span>
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {data.volumeMult.toFixed(1)}x vol
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

HeatmapTooltip.displayName = "HeatmapTooltip";

export default HeatmapTooltip;
