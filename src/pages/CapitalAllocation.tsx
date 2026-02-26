import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Brain, RefreshCw, AlertTriangle, Shield,
  TrendingUp, PieChart, BarChart3, Target, Loader2,
  ChevronRight, Info,
} from "lucide-react";
import { PieChart as RPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useAllocationAnalysis, useAllocationHistory } from "@/hooks/use-capital-allocation";

const SECTOR_COLORS: Record<string, string> = {
  Technology: "hsl(215, 60%, 50%)",
  Financials: "hsl(35, 65%, 50%)",
  Healthcare: "hsl(152, 40%, 45%)",
  "Consumer Cyclical": "hsl(280, 45%, 55%)",
  "Consumer Defensive": "hsl(180, 35%, 45%)",
  Energy: "hsl(25, 70%, 50%)",
  Industrials: "hsl(200, 30%, 50%)",
  Communication: "hsl(340, 50%, 55%)",
  Utilities: "hsl(90, 35%, 45%)",
  "Real Estate": "hsl(0, 40%, 55%)",
  Materials: "hsl(50, 50%, 50%)",
  Cash: "hsl(220, 8%, 65%)",
  "ETF-Broad": "hsl(210, 25%, 55%)",
  "ETF-Tech": "hsl(230, 50%, 55%)",
  "ETF-Small Cap": "hsl(160, 30%, 50%)",
  "ETF-Innovation": "hsl(310, 40%, 55%)",
  Crypto: "hsl(40, 75%, 55%)",
  Other: "hsl(220, 10%, 60%)",
};

function getColor(sector: string, i: number): string {
  return SECTOR_COLORS[sector] || `hsl(${(i * 37) % 360}, 40%, 50%)`;
}

const VolBadge = ({ score }: { score: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    low: { label: "Low", cls: "bg-gain/15 text-gain" },
    medium: { label: "Medium", cls: "bg-accent/15 text-accent-foreground" },
    high: { label: "High", cls: "bg-loss/15 text-loss" },
  };
  const v = map[score] || map.medium;
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${v.cls}`}>{v.label}</span>;
};

interface PlanData {
  label: string;
  targetCash: number;
  maxPosition: number;
  guidance: string[];
  buckets: Record<string, number>;
}

const PlanCard = ({ plan, accent }: { plan: PlanData; accent: string }) => (
  <Card className="p-4 space-y-3">
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${accent}`} />
      <h4 className="text-sm font-semibold">{plan.label}</h4>
    </div>
    <div className="grid grid-cols-2 gap-2 text-[11px]">
      <div className="rounded-lg bg-secondary p-2.5">
        <p className="text-muted-foreground">Target Cash</p>
        <p className="mt-0.5 text-sm font-semibold">{plan.targetCash}%</p>
      </div>
      <div className="rounded-lg bg-secondary p-2.5">
        <p className="text-muted-foreground">Max Position</p>
        <p className="mt-0.5 text-sm font-semibold">{plan.maxPosition}%</p>
      </div>
    </div>
    <ul className="space-y-1.5">
      {plan.guidance.map((g, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
          <ChevronRight size={12} className="mt-0.5 shrink-0 text-muted-foreground/50" />
          <span>{g}</span>
        </li>
      ))}
    </ul>
    <div className="space-y-1 pt-1">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Capital Buckets</p>
      {Object.entries(plan.buckets).map(([bucket, pct]) => (
        <div key={bucket} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{bucket}</span>
          <div className="flex items-center gap-2">
            <div className="h-1 w-16 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-foreground/30" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right font-medium">{pct}%</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const EmptyState = ({ onAnalyze, isPending }: { onAnalyze: () => void; isPending: boolean }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-20 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
      <Brain size={28} className="text-muted-foreground" />
    </div>
    <h2 className="text-lg font-semibold">Capital Allocation Brain</h2>
    <p className="mt-2 text-sm text-muted-foreground max-w-md">
      Analyze your portfolio structure, risk exposure, and get structured deployment guidance.
      Connect a broker first or run analysis on your current holdings.
    </p>
    <Button className="mt-6 gap-2" onClick={onAnalyze} disabled={isPending}>
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
      Run Analysis
    </Button>
  </motion.div>
);

const CapitalAllocation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const analysis = useAllocationAnalysis();
  const { data: history } = useAllocationHistory();
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = () => {
    analysis.mutate(undefined, { onSuccess: (data) => setResult(data) });
  };

  if (!user) {
    return (
      <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">Sign in Required</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access allocation analysis.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const data = result;
  const pieData = data?.sectorBreakdown
    ? Object.entries(data.sectorBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Capital Allocation</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Structured deployment guidance</p>
          </div>
        </div>
        {data && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAnalyze} disabled={analysis.isPending}>
            {analysis.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Refresh
          </Button>
        )}
      </motion.div>

      {!data ? (
        <EmptyState onAnalyze={handleAnalyze} isPending={analysis.isPending} />
      ) : (
        <div className="mt-6 space-y-6">
          {/* Section 1: Portfolio Structure */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center gap-2 mb-3">
              <PieChart size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium">Portfolio Structure</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {/* Pie chart */}
              <Card className="p-4">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <RPieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        strokeWidth={1}
                        stroke="hsl(var(--background))"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={entry.name} fill={getColor(entry.name, i)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                      />
                    </RPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                    No positions found
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[10px]">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getColor(entry.name, i) }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Cash vs Invested */}
              <Card className="p-4 space-y-4">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
                  <p className="mt-1 text-2xl font-semibold">
                    ${(data.portfolioValue + data.cashBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Invested</span>
                    <span className="font-medium">${data.portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground/25"
                      style={{ width: `${100 - data.cashPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cash</span>
                    <span className="font-medium">${data.cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({data.cashPercent.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="rounded-lg bg-secondary p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target Cash Range</span>
                    <span className="font-medium">{data.suggestedCashTarget}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Max Position Size</span>
                    <span className="font-medium">{data.suggestedMaxPosition}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Section 2: Risk Structure */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium">Risk Structure</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3.5 text-center">
                <p className="text-[10px] text-muted-foreground">Largest Position</p>
                <p className="mt-1 text-lg font-semibold">{data.largestPositionPercent.toFixed(1)}%</p>
              </Card>
              <Card className="p-3.5 text-center">
                <p className="text-[10px] text-muted-foreground">Sector Dominance</p>
                <p className="mt-1 text-xs font-semibold">{data.largestSector || "—"}</p>
                <p className="text-[10px] text-muted-foreground">{data.largestSectorPercent.toFixed(1)}%</p>
              </Card>
              <Card className="p-3.5 text-center">
                <p className="text-[10px] text-muted-foreground">Volatility</p>
                <div className="mt-1.5"><VolBadge score={data.volatility.score} /></div>
              </Card>
            </div>

            {/* Warnings */}
            {(data.concentrationWarnings?.length > 0 || data.thematicWarnings?.length > 0) && (
              <div className="mt-3 space-y-2">
                {[...data.concentrationWarnings, ...data.thematicWarnings].map((w: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-card p-3">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-loss" />
                    <p className="text-xs text-muted-foreground">{w}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Section 3: Deployment Plans */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium">Capital Deployment Guidance</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {data.plans && (
                <>
                  <PlanCard plan={data.plans.conservative} accent="bg-gain" />
                  <PlanCard plan={data.plans.balanced} accent="bg-accent-foreground" />
                  <PlanCard plan={data.plans.aggressive} accent="bg-loss" />
                </>
              )}
            </div>
          </motion.div>

          {/* Top Holdings */}
          {data.positionBreakdown?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-muted-foreground" />
                <h2 className="text-sm font-medium">Position Breakdown</h2>
              </div>
              <Card className="divide-y divide-border/40">
                {data.positionBreakdown.map((pos: any) => (
                  <div key={pos.symbol} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getColor(pos.sector, 0) }}
                      />
                      <div>
                        <p className="text-sm font-medium">{pos.symbol}</p>
                        <p className="text-[10px] text-muted-foreground">{pos.sector}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${pos.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      <p className={`text-[10px] ${pos.percent > data.suggestedMaxPosition ? "text-loss font-medium" : "text-muted-foreground"}`}>
                        {pos.percent.toFixed(1)}%
                        {pos.percent > data.suggestedMaxPosition && " ⚠"}
                      </p>
                    </div>
                  </div>
                ))}
              </Card>
            </motion.div>
          )}

          {/* Disclaimer */}
          <motion.div
            className="rounded-xl border border-border/40 bg-card p-4 flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This is allocation guidance, not financial advice. Capital deployment suggestions are based on
              portfolio structure analysis and general risk management principles. Always consult a qualified
              financial advisor before making investment decisions.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CapitalAllocation;
