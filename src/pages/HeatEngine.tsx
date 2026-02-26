import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Flame, Thermometer, AlertTriangle, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { useHeatEngine, useHeatHistory, STAGE_CONFIG, type HeatSnapshot } from "@/hooks/use-heat-engine";

const stageOrder = ["building_pressure", "breakout_watch", "overheated"];

function HeatBadge({ score, stage }: { score: number; stage: string }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.cold;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function TickerDetailPanel({ snapshot }: { snapshot: HeatSnapshot }) {
  const { data: history } = useHeatHistory(snapshot.symbol);

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    return history.map(h => ({
      time: new Date(h.computed_at || "").toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" }),
      score: h.heat_score,
      volume: h.volume_subscore,
      momentum: h.momentum_subscore,
    }));
  }, [history]);

  const d = snapshot.detail;

  return (
    <motion.div className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{snapshot.symbol}</h3>
          <p className="text-xs text-muted-foreground">{d?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">{snapshot.heat_score}</p>
          <HeatBadge score={snapshot.heat_score} stage={snapshot.stage} />
        </div>
      </div>

      {/* Subscores */}
      <div className="glass-card space-y-3 p-4">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Score Breakdown</h4>
        <ScoreBar label="Volume" value={snapshot.volume_subscore} max={30} color="hsl(215, 60%, 55%)" />
        <ScoreBar label="Momentum" value={snapshot.momentum_subscore} max={20} color="hsl(152, 40%, 50%)" />
        <ScoreBar label="Volatility" value={snapshot.volatility_subscore} max={15} color="hsl(35, 80%, 50%)" />
        <ScoreBar label="Options Flow" value={snapshot.options_subscore} max={15} color="hsl(270, 50%, 55%)" />
        <ScoreBar label="Attention" value={snapshot.attention_subscore} max={10} color="hsl(180, 50%, 45%)" />
        <ScoreBar label="Liquidity" value={snapshot.liquidity_subscore} max={10} color="hsl(220, 8%, 60%)" />
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Vol Multiple", value: `${d?.volMultiple?.toFixed(1)}x` },
          { label: "5D Return", value: `${d?.fiveDayReturn > 0 ? "+" : ""}${d?.fiveDayReturn?.toFixed(1)}%` },
          { label: "RSI", value: d?.rsi?.toFixed(0) },
          { label: "Mkt Cap", value: d?.marketCap },
          { label: "Vol %ile", value: `${d?.volPercentile}th` },
          { label: "Confidence", value: `${snapshot.confidence_level}%` },
        ].map(m => (
          <div key={m.label} className="glass-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Drivers */}
      {snapshot.drivers && snapshot.drivers.length > 0 && (
        <div className="glass-card p-4">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Drivers</h4>
          <div className="space-y-1.5">
            {snapshot.drivers.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heat History Chart */}
      {chartData.length > 1 && (
        <div className="glass-card p-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Heat Score History</h4>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="heatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(25, 80%, 50%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(25, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(220, 8%, 50%)" }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Area type="monotone" dataKey="score" stroke="hsl(25, 80%, 50%)" strokeWidth={1.5} fill="url(#heatGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

const HeatEngine = () => {
  const { data: snapshots, isLoading } = useHeatEngine();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const navigate = useNavigate();

  const selected = useMemo(() => snapshots?.find(s => s.symbol === selectedSymbol) || null, [snapshots, selectedSymbol]);

  const stageBuckets = useMemo(() => {
    if (!snapshots) return {};
    const buckets: Record<string, HeatSnapshot[]> = {};
    for (const stage of stageOrder) {
      const items = snapshots.filter(s => s.stage === stage);
      if (items.length > 0) buckets[stage] = items;
    }
    return buckets;
  }, [snapshots]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Thermometer size={20} className="text-orange-400" />
          <div>
            <h1 className="text-2xl font-semibold">Retail Heat Engine</h1>
            <p className="text-sm text-muted-foreground">Early momentum and retail attention signals</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 flex gap-8">
        {/* Main list */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Top Heat List */}
          <motion.div className="glass-card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Heat Rankings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 text-left font-medium">Symbol</th>
                    <th className="px-4 py-2.5 text-right font-medium">Heat</th>
                    <th className="px-4 py-2.5 text-left font-medium">Stage</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Vol Multiple</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">5D Return</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium lg:table-cell">Mkt Cap</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium xl:table-cell">Liquidity</th>
                  </tr>
                </thead>
                <tbody>
                  {(snapshots || []).map((s) => {
                    const d = s.detail;
                    const isLowLiquidity = s.liquidity_subscore < 5;
                    return (
                      <tr
                        key={s.symbol}
                        onClick={() => setSelectedSymbol(s.symbol === selectedSymbol ? null : s.symbol)}
                        className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/50 ${selectedSymbol === s.symbol ? "bg-secondary/80" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold">{s.symbol}</p>
                            <p className="text-[11px] text-muted-foreground">{d?.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-base font-bold tabular-nums ${s.heat_score >= 70 ? "text-orange-400" : s.heat_score >= 50 ? "text-amber-400" : s.heat_score >= 30 ? "text-sky-400" : "text-blue-400"}`}>
                            {s.heat_score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <HeatBadge score={s.heat_score} stage={s.stage} />
                        </td>
                        <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                          <span className={d?.volMultiple >= 2 ? "font-medium text-orange-400" : "text-muted-foreground"}>{d?.volMultiple?.toFixed(1)}x</span>
                        </td>
                        <td className="hidden px-4 py-3 text-right tabular-nums md:table-cell">
                          <span className={d?.fiveDayReturn >= 0 ? "text-gain" : "text-loss"}>
                            {d?.fiveDayReturn > 0 ? "+" : ""}{d?.fiveDayReturn?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">{d?.marketCap}</td>
                        <td className="hidden px-4 py-3 xl:table-cell">
                          {isLowLiquidity && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                              <AlertTriangle size={10} /> Low
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Stage Buckets */}
          {Object.keys(stageBuckets).length > 0 && (
            <motion.div className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-sm font-medium text-muted-foreground">Active Stages</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stageOrder.map(stage => {
                  const items = stageBuckets[stage];
                  if (!items) return null;
                  const config = STAGE_CONFIG[stage];
                  return (
                    <div key={stage} className="glass-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${stage === "overheated" ? "bg-red-400" : stage === "breakout_watch" ? "bg-orange-400" : "bg-amber-400"}`} />
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>{config.label}</h3>
                        <span className="ml-auto text-[11px] text-muted-foreground">{items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {items.slice(0, 5).map(s => (
                          <button
                            key={s.symbol}
                            onClick={() => navigate(`/invest/${s.symbol}`)}
                            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-secondary"
                          >
                            <div>
                              <span className="text-xs font-semibold">{s.symbol}</span>
                              <span className="ml-2 text-[11px] text-muted-foreground">{s.detail?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold tabular-nums">{s.heat_score}</span>
                              <ChevronRight size={12} className="text-muted-foreground" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Detail Panel (desktop) */}
        {selected && (
          <aside className="hidden w-80 shrink-0 xl:block">
            <TickerDetailPanel snapshot={selected} />
          </aside>
        )}
      </div>

      {/* Mobile detail */}
      {selected && (
        <div className="mt-6 xl:hidden">
          <TickerDetailPanel snapshot={selected} />
        </div>
      )}

      <div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center">
        <p className="text-[11px] text-muted-foreground">
          Analytical signal engine only. No trade recommendations. Data refreshed every 15 minutes during market hours.
        </p>
      </div>
    </div>
  );
};

export default HeatEngine;
