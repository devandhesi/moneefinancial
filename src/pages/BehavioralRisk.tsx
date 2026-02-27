import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Activity, RefreshCw, AlertTriangle, Shield,
  TrendingUp, BarChart3, Loader2, Info, ChevronRight,
  Minus, Clock, Scale,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useBehavioralAnalysis } from "@/hooks/use-behavioral-risk";

/* ── Score ring ─────────────────────────────────── */

function scoreColor(s: number) {
  if (s >= 80) return { label: "Stable", ring: "hsl(var(--gain))", text: "text-gain" };
  if (s >= 60) return { label: "Elevated Risk", ring: "hsl(var(--accent))", text: "text-accent-foreground" };
  return { label: "High Behavioral Risk", ring: "hsl(var(--loss))", text: "text-loss" };
}

const ScoreRing = ({ score }: { score: number }) => {
  const { label, ring, text } = scoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={ring} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">{score}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>
      <p className={`mt-2 text-xs font-medium ${text}`}>{label}</p>
    </div>
  );
};

/* ── Severity badge ──────────────────────────────── */

const SeverityDot = ({ severity }: { severity: string }) => {
  const cls = severity === "high" ? "bg-loss" : severity === "medium" ? "bg-accent" : "bg-muted-foreground/30";
  return <div className={`h-1.5 w-1.5 rounded-full ${cls}`} />;
};

/* ── Metric card ─────────────────────────────────── */

const MetricCard = ({ icon: Icon, label, value, sub }: {
  icon: typeof Activity; label: string; value: string; sub?: string;
}) => (
  <Card className="p-3.5">
    <div className="flex items-center gap-2 mb-1.5">
      <Icon size={12} className="text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-lg font-semibold tabular-nums">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

/* ── Trend chart ─────────────────────────────────── */

const TrendChart = ({ data, dataKey, label, color }: {
  data: any[]; dataKey: string; label: string; color: string;
}) => {
  if (!data || data.length < 2) {
    return (
      <Card className="p-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="flex h-[120px] items-center justify-center text-xs text-muted-foreground">
          Insufficient data for trend
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v: string) => v.substring(5)}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

/* ── Analysis steps ──────────────────────────────── */

const ANALYSIS_STEPS = [
  { label: "Fetching trade history", icon: BarChart3, duration: 1800 },
  { label: "Mapping position timelines", icon: Clock, duration: 1400 },
  { label: "Scanning for revenge patterns", icon: AlertTriangle, duration: 2000 },
  { label: "Detecting size escalation", icon: Scale, duration: 1600 },
  { label: "Evaluating overtrading signals", icon: Activity, duration: 1200 },
  { label: "Computing discipline score", icon: Shield, duration: 1000 },
];

const AnalyzingState = ({ step }: { step: number }) => {
  const progress = Math.min(((step + 1) / ANALYSIS_STEPS.length) * 100, 100);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative h-20 w-20 mb-6">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 54}
            strokeDashoffset={2 * Math.PI * 54 - (progress / 100) * 2 * Math.PI * 54}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-primary" />
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-1">Analyzing Patterns</h2>
      <p className="text-xs text-muted-foreground mb-6">This may take a moment</p>

      <div className="w-full max-w-xs space-y-2">
        {ANALYSIS_STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isDone = i < step;
          const isActive = i === step;
          return (
            <motion.div
              key={s.label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                isDone ? "text-foreground" : isActive ? "text-foreground bg-secondary" : "text-muted-foreground/40"
              }`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              {isDone ? (
                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
              ) : isActive ? (
                <Loader2 size={14} className="animate-spin text-primary shrink-0" />
              ) : (
                <StepIcon size={14} className="shrink-0" />
              )}
              <span className={isDone ? "line-through opacity-60" : ""}>{s.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* ── Empty state ─────────────────────────────────── */

const EmptyState = ({ onAnalyze, isPending }: { onAnalyze: () => void; isPending: boolean }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-20 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
      <Activity size={28} className="text-muted-foreground" />
    </div>
    <h2 className="text-lg font-semibold">Behavioral Risk Engine</h2>
    <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
      Analyze your trading behavior patterns to detect psychological risk signals.
      Requires connected broker data with trade history.
    </p>
    <Button className="mt-6 gap-2" onClick={onAnalyze} disabled={isPending}>
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
      Run Analysis
    </Button>
  </motion.div>
);

/* ── Main page ───────────────────────────────────── */

const BehavioralRisk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const analysis = useBehavioralAnalysis();
  const [result, setResult] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Step through analysis phases with realistic timing
    let currentStep = 0;
    const advanceStep = () => {
      currentStep++;
      if (currentStep < ANALYSIS_STEPS.length) {
        setAnalysisStep(currentStep);
        setTimeout(advanceStep, ANALYSIS_STEPS[currentStep].duration);
      }
    };
    setTimeout(advanceStep, ANALYSIS_STEPS[0].duration);

    // Fire the actual API call in parallel
    analysis.mutate(undefined, {
      onSuccess: (data) => {
        // Wait for steps to finish, then show results
        const totalDuration = ANALYSIS_STEPS.reduce((s, step) => s + step.duration, 0);
        const elapsed = ANALYSIS_STEPS.slice(0, currentStep + 1).reduce((s, step) => s + step.duration, 0);
        const remaining = Math.max(totalDuration - elapsed, 500);
        setTimeout(() => {
          setResult(data);
          setIsAnalyzing(false);
          setAnalysisStep(-1);
        }, remaining);
      },
      onError: () => {
        setIsAnalyzing(false);
        setAnalysisStep(-1);
      },
    });
  };

  if (!user) {
    return (
      <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">Sign in Required</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access behavioral analysis.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const d = result;

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Behavioral Risk</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Trading discipline analysis</p>
          </div>
        </div>
        {d && !isAnalyzing && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Refresh
          </Button>
        )}
      </motion.div>

      {isAnalyzing ? (
        <AnalyzingState step={analysisStep} />
      ) : !d ? (
        <EmptyState onAnalyze={handleAnalyze} isPending={isAnalyzing} />
      ) : (
        <div className="mt-6 space-y-6">
          {/* Section 1: Discipline Score */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="p-6">
              <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
                <ScoreRing score={d.disciplineScore} />
                <div className="mt-4 md:mt-0 flex-1">
                  <h3 className="text-sm font-medium mb-3">Baseline Metrics</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <MetricCard
                      icon={BarChart3}
                      label="Avg Frequency"
                      value={`${d.avgTradeFrequency}`}
                      sub="trades / day"
                    />
                    <MetricCard
                      icon={Scale}
                      label="Avg Position"
                      value={`$${d.avgPositionSize.toLocaleString()}`}
                      sub="per trade"
                    />
                    <MetricCard
                      icon={Clock}
                      label="Avg Hold Time"
                      value={`${d.avgHoldingDuration}h`}
                      sub="per position"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Section 2: Behavioral Flags */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium">Active Signals</h2>
            </div>
            {d.flagsDetail && d.flagsDetail.length > 0 ? (
              <div className="space-y-2">
                {d.flagsDetail.map((flag: any, i: number) => (
                  <Card key={i} className="flex items-start gap-3 p-4">
                    <SeverityDot severity={flag.severity} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{flag.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                    </div>
                    <span className={`text-[9px] font-medium uppercase tracking-wider ${
                      flag.severity === "high" ? "text-loss" : "text-muted-foreground"
                    }`}>
                      {flag.severity}
                    </span>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="flex items-center gap-3 p-4">
                <Minus size={14} className="text-gain" />
                <p className="text-sm text-muted-foreground">No behavioral signals triggered. Trading patterns within baseline parameters.</p>
              </Card>
            )}
          </motion.div>

          {/* Section 3: Behavioral Trends */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium">Behavioral Trends</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <TrendChart
                data={d.trendData?.frequencyByWeek}
                dataKey="count"
                label="Trade Frequency"
                color="hsl(var(--foreground))"
              />
              <TrendChart
                data={d.trendData?.sizeByWeek}
                dataKey="avgSize"
                label="Avg Position Size"
                color="hsl(var(--accent))"
              />
              <TrendChart
                data={d.trendData?.scoreHistory}
                dataKey="score"
                label="Discipline Score"
                color="hsl(var(--gain))"
              />
            </div>
          </motion.div>

          {/* Section 4: Self Correction Guidance */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-medium">Corrective Guidance</h2>
            </div>
            <div className="space-y-2">
              {(d.guidance || []).map((g: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-2.5">
                    <ChevronRight size={12} className="mt-1 shrink-0 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm font-medium">{g.action}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.detail}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            className="rounded-xl border border-border/40 bg-card p-4 flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This is behavioral pattern analysis, not financial advice. Signals are derived from
              statistical deviations against your own trading baseline. No trade execution capability exists.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BehavioralRisk;
