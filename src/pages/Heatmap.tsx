import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, Grid3X3, Thermometer } from "lucide-react";
import HeatmapGrid from "@/components/heatmap/HeatmapGrid";
import { getHeatmapData, type HeatmapSector } from "@/data/heatmap-data";

type Timeframe = "1d" | "1w" | "1m";
type Metric = "change" | "volume" | "heat";
type CapFilter = "all" | "micro" | "small" | "mid" | "large";

const Heatmap = () => {
  const [sectors] = useState(() => getHeatmapData());
  const [activeSector, setActiveSector] = useState<HeatmapSector | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1d");
  const [metric, setMetric] = useState<Metric>("change");
  const [capFilter, setCapFilter] = useState<CapFilter>("all");
  const [search, setSearch] = useState("");

  const handleSectorClick = useCallback((sector: HeatmapSector) => {
    setActiveSector(sector);
    setSearch("");
  }, []);

  const handleBack = useCallback(() => {
    setActiveSector(null);
    setSearch("");
  }, []);

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Grid3X3 size={20} className="text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Market Heatmap</h1>
            <p className="text-sm text-muted-foreground">Sector and ticker performance at a glance</p>
          </div>
        </div>
      </motion.div>

      {/* Breadcrumb */}
      <AnimatePresence mode="wait">
        {activeSector && (
          <motion.div
            className="mt-4 flex items-center gap-2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft size={14} />
              Heatmap
            </button>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium">{activeSector.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <motion.div
        className="mt-4 flex flex-wrap items-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {/* Timeframe */}
        <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
          {(["1d", "1w", "1m"] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${timeframe === tf ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Metric */}
        <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
          {([
            { key: "change" as const, label: "% Change" },
            { key: "volume" as const, label: "Volume" },
            { key: "heat" as const, label: "Heat" },
          ]).map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${metric === m.key ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Cap Filter */}
        <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
          {([
            { key: "all" as const, label: "All" },
            { key: "large" as const, label: "Large" },
            { key: "mid" as const, label: "Mid" },
            { key: "small" as const, label: "Small" },
          ]).map(c => (
            <button
              key={c.key}
              onClick={() => setCapFilter(c.key)}
              className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${capFilter === c.key ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-8 rounded-xl bg-secondary pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-ring"
          />
        </div>
      </motion.div>

      {/* Heatmap */}
      <motion.div
        className="mt-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <HeatmapGrid
          sectors={sectors}
          timeframe={timeframe}
          metric={metric}
          capFilter={capFilter}
          searchQuery={search}
          activeSector={activeSector}
          onSectorClick={handleSectorClick}
          onBack={handleBack}
        />
      </motion.div>

      {/* Legend */}
      <motion.div
        className="mt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded" style={{ background: "hsl(0, 38%, 36%)" }} />
          <span>Negative</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-muted" />
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded" style={{ background: "hsl(152, 36%, 32%)" }} />
          <span>Positive</span>
        </div>
        <span className="text-muted-foreground/40">|</span>
        <span>Tile size = market weight</span>
      </motion.div>
    </div>
  );
};

export default Heatmap;
