import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, TrendingDown, TrendingUp, DollarSign, PieChart, Briefcase,
  HelpCircle, Lightbulb, ChevronDown, ChevronUp, Loader2, Plus, X, Sparkles,
  Info, ArrowRight, Target, ShieldAlert, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart as RPieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

/* ─── hint tooltip ──────────────────────────────────────────── */
const Hint = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex ml-1">
      <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground transition-colors">
        <HelpCircle size={13} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 top-6 z-50 w-56 rounded-xl bg-popover border border-border p-3 text-[11px] text-popover-foreground shadow-lg"
          >
            {text}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-popover border-l border-t border-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ─── onboarding banner ─────────────────────────────────────── */
const OnboardingBanner = ({ onDismiss }: { onDismiss: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0 }}
    className="glass-card mb-5 flex items-start gap-3 p-4 border border-primary/20 bg-primary/5"
  >
    <Lightbulb size={18} className="mt-0.5 shrink-0 text-primary" />
    <div className="flex-1">
      <p className="text-sm font-medium">Welcome to the Sim Lab!</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        This is your risk-free sandbox. Run simulations to understand how different strategies perform — 
        DCA investing, crash recovery, portfolio allocation, and AI-powered trend projections. 
        <strong className="text-foreground"> Nothing here uses real money.</strong> Look for <HelpCircle size={10} className="inline mx-0.5" /> icons for explanations.
      </p>
    </div>
    <button onClick={onDismiss} className="shrink-0 rounded-lg p-1 hover:bg-secondary transition-colors">
      <X size={14} className="text-muted-foreground" />
    </button>
  </motion.div>
);

/* ─── section card ──────────────────────────────────────────── */
const SectionCard = ({
  icon: Icon, label, desc, hint, active, onClick, badge,
}: {
  icon: React.ElementType; label: string; desc: string; hint: string;
  active: boolean; onClick: () => void; badge?: string;
}) => (
  <button
    onClick={onClick}
    className={`glass-card relative flex flex-col items-start gap-1.5 p-3.5 text-left transition-all ${
      active ? "ring-1 ring-foreground/20 shadow-md" : "hover:shadow-sm"
    }`}
  >
    {badge && (
      <span className="absolute -top-1.5 -right-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
        {badge}
      </span>
    )}
    <Icon size={16} className={active ? "text-foreground" : "text-muted-foreground"} />
    <span className="text-xs font-medium">{label}</span>
    <span className="text-[10px] text-muted-foreground leading-tight">{desc}</span>
  </button>
);

/* ─── step indicator ────────────────────────────────────────── */
const StepIndicator = ({ step, total, labels }: { step: number; total: number; labels: string[] }) => (
  <div className="flex items-center gap-2 mb-4">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
          i <= step ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}>{i + 1}</div>
        <span className={`text-[10px] ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{labels[i]}</span>
        {i < total - 1 && <div className="h-px w-4 bg-border" />}
      </div>
    ))}
  </div>
);

/* ─── data generators ───────────────────────────────────────── */
const generateDCAData = (monthly: number, months: number) => {
  const data = [];
  let invested = 0, value = 0;
  for (let i = 0; i <= months; i++) {
    invested += monthly;
    value = invested * (1 + Math.random() * 0.03 - 0.005) + (value - invested + monthly) * (1 + Math.random() * 0.02);
    data.push({ month: `M${i}`, invested, value: +value.toFixed(0) });
  }
  return data;
};

const generateLumpVsDCA = (total: number, months: number) => {
  const data = [];
  const lumpStart = total;
  let lumpValue = lumpStart, dcaInvested = 0, dcaValue = 0;
  for (let i = 0; i <= months; i++) {
    const monthReturn = 1 + (Math.random() * 0.06 - 0.02);
    lumpValue *= monthReturn;
    dcaInvested += total / months;
    dcaValue = (dcaValue + total / months) * monthReturn;
    data.push({ month: `M${i}`, lumpSum: +lumpValue.toFixed(0), dca: +dcaValue.toFixed(0) });
  }
  return data;
};

const allocationPresets = [
  { name: "Conservative", stocks: 30, bonds: 50, cash: 20, color: "hsl(210, 60%, 55%)" },
  { name: "Balanced", stocks: 60, bonds: 30, cash: 10, color: "hsl(152, 40%, 45%)" },
  { name: "Aggressive", stocks: 85, bonds: 10, cash: 5, color: "hsl(0, 60%, 50%)" },
];

/* ─── sim holdings types ────────────────────────────────────── */
interface SimHolding {
  id: string;
  symbol: string;
  amount: number;
  analysis?: {
    analysis: string;
    projectedReturn: number;
    confidence: string;
    riskLevel: string;
    keyFactors: string[];
    monthlyProjections: { month: number; value: number }[];
  };
  loading?: boolean;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const SimulationLab = () => {
  const [activeSim, setActiveSim] = useState("dca");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("monee-simlab-onboarded") !== "true";
  });

  // DCA state
  const [dcaMonthly, setDcaMonthly] = useState(500);
  const [dcaMonths, setDcaMonths] = useState(24);
  const dcaData = useMemo(() => generateDCAData(dcaMonthly, dcaMonths), [dcaMonthly, dcaMonths]);

  // Crash state
  const [crashPercent, setCrashPercent] = useState(30);
  const [portfolioValue] = useState(12438.5);

  // Lump sum state
  const [lumpTotal, setLumpTotal] = useState(12000);
  const [lumpMonths, setLumpMonths] = useState(24);
  const lumpData = useMemo(() => generateLumpVsDCA(lumpTotal, lumpMonths), [lumpTotal, lumpMonths]);

  // Allocation state
  const [selectedAlloc, setSelectedAlloc] = useState(1);

  // Sim holdings state
  const [simHoldings, setSimHoldings] = useState<SimHolding[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("monee-simlab-onboarded", "true");
  };

  const addSimHolding = useCallback(async () => {
    if (!newSymbol.trim() || !newAmount.trim()) return;
    const id = Date.now().toString();
    const symbol = newSymbol.toUpperCase().trim();
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;

    const holding: SimHolding = { id, symbol, amount, loading: true };
    setSimHoldings(prev => [...prev, holding]);
    setNewSymbol("");
    setNewAmount("");

    try {
      const { data, error } = await supabase.functions.invoke("sim-analysis", {
        body: { symbol, amount, months: 12 },
      });
      if (error) throw error;
      setSimHoldings(prev =>
        prev.map(h => h.id === id ? { ...h, analysis: data, loading: false } : h)
      );
    } catch (err) {
      console.error("Sim analysis error:", err);
      setSimHoldings(prev =>
        prev.map(h => h.id === id ? { ...h, loading: false, analysis: { analysis: "Unable to generate analysis. Try again.", projectedReturn: 0, confidence: "N/A", riskLevel: "N/A", keyFactors: [], monthlyProjections: [] } } : h)
      );
    }
  }, [newSymbol, newAmount]);

  const removeHolding = (id: string) => {
    setSimHoldings(prev => prev.filter(h => h.id !== id));
  };

  const sims = [
    { id: "dca", icon: DollarSign, label: "DCA Simulator", desc: "See how regular investing compounds", hint: "Dollar Cost Averaging means investing a fixed amount regularly, reducing the impact of market timing." },
    { id: "lump", icon: BarChart3, label: "Lump Sum vs DCA", desc: "Compare investment strategies", hint: "See whether investing all at once or gradually over time historically performs better." },
    { id: "crash", icon: TrendingDown, label: "Crash Stress Test", desc: "Test portfolio resilience", hint: "Simulate market downturns to understand your potential losses and recovery timeline." },
    { id: "alloc", icon: PieChart, label: "Allocation Lab", desc: "Balance risk vs return", hint: "Explore how different stock/bond/cash ratios affect your portfolio's risk profile." },
    { id: "holdings", icon: Briefcase, label: "Sim Holdings", desc: "AI-powered trend projections", hint: "Add fake holdings and get AI-generated trend analysis — completely separate from real trades.", badge: "AI" },
  ];

  const crashAfter = portfolioValue * (1 - crashPercent / 100);
  const crashLoss = portfolioValue - crashAfter;
  const recoveryMonths = Math.round(crashPercent * 0.55);

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <FlaskConical size={22} className="text-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">Simulation Lab</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Risk-free scenarios to sharpen your strategy</p>
      </motion.div>

      <AnimatePresence>{showOnboarding && <OnboardingBanner onDismiss={dismissOnboarding} />}</AnimatePresence>

      {/* Sim selector */}
      <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-5">
        {sims.map((s) => (
          <SectionCard
            key={s.id}
            icon={s.icon}
            label={s.label}
            desc={s.desc}
            hint={s.hint}
            active={activeSim === s.id}
            onClick={() => setActiveSim(s.id)}
            badge={s.badge}
          />
        ))}
      </div>

      {/* ─── DCA Simulator ──────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeSim === "dca" && (
          <motion.div key="dca" className="mt-5 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium">DCA Simulator</h3>
                <Hint text="Adjust the monthly amount and duration to see how consistent investing grows your wealth over time through compound returns." />
              </div>
              <StepIndicator step={2} total={3} labels={["Set amount", "Choose duration", "View results"]} />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    Monthly Investment
                    <Hint text="How much you invest each month. Even small amounts compound significantly over time." />
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">$</span>
                    <input
                      type="range" min={100} max={5000} step={100} value={dcaMonthly}
                      onChange={(e) => setDcaMonthly(+e.target.value)}
                      className="flex-1 accent-foreground"
                    />
                    <span className="text-sm font-semibold tabular-nums w-14 text-right">${dcaMonthly}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                    Duration
                    <Hint text="Longer time = more compounding. Even 12 extra months can make a big difference." />
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range" min={6} max={60} step={6} value={dcaMonths}
                      onChange={(e) => setDcaMonths(+e.target.value)}
                      className="flex-1 accent-foreground"
                    />
                    <span className="text-sm font-semibold tabular-nums w-14 text-right">{dcaMonths}mo</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dcaData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={Math.floor(dcaMonths / 6)} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px", color: "hsl(var(--popover-foreground))" }} />
                  <Area type="monotone" dataKey="invested" stroke="hsl(var(--muted-foreground))" strokeWidth={1} fill="none" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="value" stroke="hsl(152, 28%, 40%)" strokeWidth={1.5} fill="hsl(152, 28%, 40%)" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-muted-foreground" /> Invested</span>
                  <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-gain" /> Portfolio Value</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Total invested</p>
                  <p className="text-sm font-semibold tabular-nums">${(dcaMonthly * dcaMonths).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="glass-card flex items-start gap-2.5 p-3 border border-primary/10 bg-primary/5">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Insight:</strong> DCA reduces the risk of investing a large amount at a market peak. Over {dcaMonths} months at ${dcaMonthly}/mo, you'd invest ${(dcaMonthly * dcaMonths).toLocaleString()} total while smoothing out price volatility.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Lump Sum vs DCA ──────────────────────────── */}
        {activeSim === "lump" && (
          <motion.div key="lump" className="mt-5 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium">Lump Sum vs DCA Comparison</h3>
                <Hint text="Historically, lump sum investing outperforms DCA ~67% of the time because markets trend upward. But DCA reduces regret risk." />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] text-muted-foreground">Total to Invest</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="range" min={1000} max={50000} step={1000} value={lumpTotal}
                      onChange={(e) => setLumpTotal(+e.target.value)} className="flex-1 accent-foreground" />
                    <span className="text-sm font-semibold tabular-nums w-16 text-right">${lumpTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Timeframe</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="range" min={6} max={48} step={6} value={lumpMonths}
                      onChange={(e) => setLumpMonths(+e.target.value)} className="flex-1 accent-foreground" />
                    <span className="text-sm font-semibold tabular-nums w-14 text-right">{lumpMonths}mo</span>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={lumpData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={Math.floor(lumpMonths / 6)} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px", color: "hsl(var(--popover-foreground))" }} />
                  <Area type="monotone" dataKey="lumpSum" stroke="hsl(40, 80%, 55%)" strokeWidth={1.5} fill="hsl(40, 80%, 55%)" fillOpacity={0.08} />
                  <Area type="monotone" dataKey="dca" stroke="hsl(152, 28%, 40%)" strokeWidth={1.5} fill="hsl(152, 28%, 40%)" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded" style={{ background: "hsl(40, 80%, 55%)" }} /> Lump Sum</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 rounded bg-gain" /> DCA</span>
              </div>
            </div>

            <div className="glass-card flex items-start gap-2.5 p-3 border border-primary/10 bg-primary/5">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Tip:</strong> Lump sum gives your money more time in the market, while DCA protects you from buying at peaks. The best strategy depends on your risk tolerance and market conditions.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Crash Stress Test ────────────────────────── */}
        {activeSim === "crash" && (
          <motion.div key="crash" className="mt-5 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Crash Stress Test</h3>
                <Hint text="Historical crashes: 2008 was ~55%, COVID was ~34%, dot-com was ~49%. Use the slider to test different severities." />
              </div>

              <div className="mb-4">
                <label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  Crash Severity
                  <Hint text="Drag to simulate different market drop scenarios. The S&P 500 has had ~10% drops about once a year on average." />
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input type="range" min={5} max={70} step={5} value={crashPercent}
                    onChange={(e) => setCrashPercent(+e.target.value)} className="flex-1 accent-destructive" />
                  <span className="text-sm font-bold text-loss tabular-nums w-12 text-right">-{crashPercent}%</span>
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                  <span>Mild correction</span>
                  <span>Moderate bear</span>
                  <span>Severe crash</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-[10px] text-muted-foreground">Current Value</p>
                  <p className="text-lg font-semibold tabular-nums">${portfolioValue.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-3">
                  <p className="text-[10px] text-muted-foreground">After Drop</p>
                  <p className="text-lg font-semibold text-loss tabular-nums">${crashAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-[10px] text-muted-foreground">Paper Loss</p>
                  <p className="text-sm font-semibold text-loss tabular-nums">-${crashLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">Recovery Est. <Hint text="Based on historical S&P 500 recovery times. Actual recovery depends on crash type and economic conditions." /></p>
                  <p className="text-sm font-semibold tabular-nums">{recoveryMonths}–{recoveryMonths + 4} months</p>
                </div>
              </div>
            </div>

            <div className="glass-card flex items-start gap-2.5 p-3 border border-primary/10 bg-primary/5">
              <ShieldAlert size={14} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Key lesson:</strong> A {crashPercent}% drop requires a {((1 / (1 - crashPercent / 100) - 1) * 100).toFixed(0)}% gain to recover. This is why diversification matters — spreading across asset classes limits downside exposure.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Allocation Lab ──────────────────────────── */}
        {activeSim === "alloc" && (
          <motion.div key="alloc" className="mt-5 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium">Allocation Lab</h3>
                <Hint text="Asset allocation determines ~90% of portfolio returns. Choose a preset to see the risk/return tradeoff." />
              </div>

              <div className="flex gap-2 mb-4">
                {allocationPresets.map((preset, i) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedAlloc(i)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-center transition-all ${
                      selectedAlloc === i ? "bg-foreground text-primary-foreground" : "glass-card hover:shadow-sm"
                    }`}
                  >
                    <p className="text-xs font-medium">{preset.name}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{preset.stocks}% stocks</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RPieChart>
                      <Pie
                        data={[
                          { name: "Stocks", value: allocationPresets[selectedAlloc].stocks },
                          { name: "Bonds", value: allocationPresets[selectedAlloc].bonds },
                          { name: "Cash", value: allocationPresets[selectedAlloc].cash },
                        ]}
                        cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value"
                      >
                        <Cell fill="hsl(210, 60%, 55%)" />
                        <Cell fill="hsl(152, 40%, 45%)" />
                        <Cell fill="hsl(40, 60%, 55%)" />
                      </Pie>
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {[
                    { label: "Stocks", value: allocationPresets[selectedAlloc].stocks, color: "bg-[hsl(210,60%,55%)]", desc: "Higher growth, higher volatility" },
                    { label: "Bonds", value: allocationPresets[selectedAlloc].bonds, color: "bg-[hsl(152,40%,45%)]", desc: "Stability, income-producing" },
                    { label: "Cash", value: allocationPresets[selectedAlloc].cash, color: "bg-[hsl(40,60%,55%)]", desc: "Safety net, low return" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium">{item.label}</span>
                          <span className="text-xs font-semibold tabular-nums">{item.value}%</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card flex items-start gap-2.5 p-3 border border-primary/10 bg-primary/5">
              <Target size={14} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Rule of thumb:</strong> Subtract your age from 110 to get your target stock allocation. A 25-year-old might target ~85% stocks. Rebalance quarterly to maintain your target.
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Sim Holdings (AI) ───────────────────────── */}
        {activeSim === "holdings" && (
          <motion.div key="holdings" className="mt-5 space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-primary" />
                <h3 className="text-sm font-medium">Sim Holdings</h3>
                <Hint text="Add fake stock positions and our AI will generate educational trend projections. These are NOT real trades and NOT financial advice — they're purely for learning." />
              </div>
              <p className="text-[11px] text-muted-foreground mb-4">Add stocks to get AI-powered educational trend analysis. Completely separate from any real or paper trades.</p>

              {/* Add new holding */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="Symbol (e.g. AAPL)"
                  className="flex-1 rounded-xl bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => e.key === "Enter" && addSimHolding()}
                />
                <input
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="$Amount"
                  type="number"
                  className="w-24 rounded-xl bg-secondary px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
                  onKeyDown={(e) => e.key === "Enter" && addSimHolding()}
                />
                <button
                  onClick={addSimHolding}
                  disabled={!newSymbol.trim() || !newAmount.trim()}
                  className="rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              {simHoldings.length === 0 && (
                <div className="rounded-xl bg-secondary/50 p-6 text-center">
                  <Briefcase size={24} className="mx-auto text-muted-foreground/40" />
                  <p className="mt-2 text-xs text-muted-foreground">Add a stock symbol and amount to see AI trend projections</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">Try: AAPL $5,000 or TSLA $2,000</p>
                </div>
              )}

              {/* Holdings list */}
              <div className="space-y-3">
                {simHoldings.map((holding) => (
                  <motion.div
                    key={holding.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{holding.symbol}</span>
                        <span className="text-xs text-muted-foreground">${holding.amount.toLocaleString()}</span>
                        {holding.analysis?.confidence && (
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                            holding.analysis.confidence === "High" ? "bg-gain/10 text-gain" :
                            holding.analysis.confidence === "Medium" ? "bg-primary/10 text-primary" :
                            "bg-loss/10 text-loss"
                          }`}>
                            {holding.analysis.confidence} confidence
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeHolding(holding.id)} className="rounded-lg p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <X size={14} />
                      </button>
                    </div>

                    {holding.loading ? (
                      <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs">Analyzing {holding.symbol}...</span>
                      </div>
                    ) : holding.analysis ? (
                      <div className="space-y-3">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{holding.analysis.analysis}</p>

                        {holding.analysis.monthlyProjections?.length > 0 && (
                          <ResponsiveContainer width="100%" height={120}>
                            <AreaChart data={holding.analysis.monthlyProjections} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `M${v}`} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px", color: "hsl(var(--popover-foreground))" }} />
                              <Area
                                type="monotone" dataKey="value"
                                stroke={holding.analysis.projectedReturn >= 0 ? "hsl(152, 28%, 40%)" : "hsl(0, 60%, 50%)"}
                                strokeWidth={1.5}
                                fill={holding.analysis.projectedReturn >= 0 ? "hsl(152, 28%, 40%)" : "hsl(0, 60%, 50%)"}
                                fillOpacity={0.08}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}

                        <div className="flex flex-wrap gap-3 text-[10px]">
                          <div>
                            <span className="text-muted-foreground">Projected Return</span>
                            <p className={`font-semibold ${holding.analysis.projectedReturn >= 0 ? "text-gain" : "text-loss"}`}>
                              {holding.analysis.projectedReturn >= 0 ? "+" : ""}{holding.analysis.projectedReturn}%
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risk Level</span>
                            <p className="font-semibold">{holding.analysis.riskLevel}</p>
                          </div>
                        </div>

                        {holding.analysis.keyFactors?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-1">Key Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {holding.analysis.keyFactors.map((f, i) => (
                                <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[9px] text-muted-foreground">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card flex items-start gap-2.5 p-3 border border-destructive/10 bg-destructive/5">
              <Info size={14} className="mt-0.5 shrink-0 text-destructive" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Disclaimer:</strong> Sim Holdings are AI-generated educational projections, NOT real predictions. They use general market knowledge to create plausible scenarios for learning purposes only.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-[11px] text-muted-foreground">🧪 All simulations are educational · No real money involved</p>
      </motion.div>
    </div>
  );
};

export default SimulationLab;
