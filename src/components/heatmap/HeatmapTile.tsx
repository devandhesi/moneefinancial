import { memo, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface Props {
  label: string;
  sublabel?: string;
  change: number;
  volumeMult: number;
  capLabel?: string;
  heatScore?: number;
  size?: "normal" | "compact";
  onClick?: () => void;
  onHoverData?: (data: { label: string; sublabel?: string; change: number; volumeMult: number; capLabel?: string; x: number; y: number } | null) => void;
  cursorX?: number;
  cursorY?: number;
  tileRect?: DOMRect;
}

function getHeatColor(change: number): string {
  const abs = Math.min(Math.abs(change), 8);
  const intensity = abs / 8;

  if (change > 0.15) {
    const l = 42 - intensity * 14;
    const s = 45 + intensity * 30;
    return `hsl(152, ${s}%, ${l}%)`;
  } else if (change < -0.15) {
    const l = 46 - intensity * 14;
    const s = 50 + intensity * 30;
    return `hsl(0, ${s}%, ${l}%)`;
  }
  return `hsl(var(--muted))`;
}

function getTextColor(change: number): string {
  const abs = Math.abs(change);
  if (abs < 0.15) return "hsl(var(--muted-foreground))";
  if (abs > 3) return "hsl(0, 0%, 95%)";
  return "hsl(0, 0%, 90%)";
}

const HeatmapTile = memo(({
  label, sublabel, change, volumeMult, capLabel, heatScore,
  size = "normal", onClick, onHoverData,
}: Props) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const offsetX = useSpring(0, { stiffness: 300, damping: 20 });
  const offsetY = useSpring(0, { stiffness: 300, damping: 20 });
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!tileRef.current) return;
    const rect = tileRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.06;
    const dy = (e.clientY - cy) * 0.06;
    offsetX.set(dx);
    offsetY.set(dy);

    onHoverData?.({
      label, sublabel, change, volumeMult, capLabel,
      x: e.clientX, y: e.clientY,
    });
  }, [label, sublabel, change, volumeMult, capLabel, offsetX, offsetY, onHoverData]);

  const handleMouseEnter = useCallback(() => {
    scale.set(1.04);
  }, [scale]);

  const handleMouseLeave = useCallback(() => {
    offsetX.set(0);
    offsetY.set(0);
    scale.set(1);
    onHoverData?.(null);
  }, [offsetX, offsetY, scale, onHoverData]);

  const bg = getHeatColor(change);
  const textCol = getTextColor(change);
  const isCompact = size === "compact";

  return (
    <motion.div
      ref={tileRef}
      className="relative cursor-pointer select-none overflow-hidden"
      style={{
        x: offsetX,
        y: offsetY,
        scale,
        background: bg,
        borderRadius: isCompact ? 8 : 12,
        border: "1px solid hsl(var(--foreground) / 0.06)",
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      layout
      transition={{ layout: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }}
    >
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay",
          opacity: 0.5,
        }}
      />

      <div className={`relative z-[2] flex h-full flex-col justify-between ${isCompact ? "p-2" : "p-3"}`}>
        <div>
          <p
            className={`font-semibold leading-tight ${isCompact ? "text-[10px]" : "text-xs"}`}
            style={{ color: textCol }}
          >
            {label}
          </p>
          {sublabel && !isCompact && (
            <p className="mt-0.5 truncate text-[9px] opacity-60" style={{ color: textCol }}>
              {sublabel}
            </p>
          )}
        </div>
        <div className="mt-auto">
          <p
            className={`font-bold tabular-nums ${isCompact ? "text-xs" : "text-sm"}`}
            style={{ color: textCol }}
          >
            {change > 0 ? "+" : ""}{change.toFixed(2)}%
          </p>
          {!isCompact && volumeMult > 1.3 && (
            <p className="text-[9px] font-medium opacity-60" style={{ color: textCol }}>
              {volumeMult.toFixed(1)}x vol
            </p>
          )}
          {!isCompact && capLabel && (
            <span
              className="mt-1 inline-block rounded px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider opacity-40"
              style={{ color: textCol, background: "hsl(var(--foreground) / 0.08)" }}
            >
              {capLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

HeatmapTile.displayName = "HeatmapTile";

export default HeatmapTile;
