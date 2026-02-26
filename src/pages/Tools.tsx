import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, PiggyBank, TrendingUp, Percent, DollarSign, Target, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// ── Budget Planner ──────────────────────────────────────
const BudgetPlanner = () => {
  const [income, setIncome] = useState(5000);
  const [categories, setCategories] = useState([
    { name: "Housing", percent: 30, color: "bg-chart-1" },
    { name: "Food & Groceries", percent: 15, color: "bg-chart-2" },
    { name: "Transportation", percent: 10, color: "bg-chart-3" },
    { name: "Savings & Investing", percent: 20, color: "bg-chart-4" },
    { name: "Entertainment", percent: 10, color: "bg-chart-5" },
    { name: "Utilities & Bills", percent: 10, color: "bg-primary" },
    { name: "Other", percent: 5, color: "bg-muted-foreground" },
  ]);

  const totalPercent = categories.reduce((s, c) => s + c.percent, 0);

  const updateCategory = (idx: number, percent: number) => {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, percent } : c)));
  };

  return (
    <div className="space-y-5">
      <div className="glass-card p-4">
        <Label className="text-xs text-muted-foreground">Monthly Income</Label>
        <div className="mt-1 flex items-center gap-2">
          <DollarSign size={16} className="text-muted-foreground" />
          <Input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="text-lg font-semibold"
          />
        </div>
      </div>

      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Budget Allocation</h3>
          <span className={`text-xs font-medium ${totalPercent === 100 ? "text-gain" : totalPercent > 100 ? "text-loss" : "text-muted-foreground"}`}>
            {totalPercent}% allocated
          </span>
        </div>

        {/* Visual bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
          {categories.map((cat, i) => (
            <div key={i} className={`${cat.color} transition-all`} style={{ width: `${Math.min(cat.percent, 100)}%` }} />
          ))}
        </div>

        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${cat.color}`} />
                  <span className="text-xs font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{cat.percent}%</span>
                  <span className="text-xs font-semibold">${((income * cat.percent) / 100).toFixed(0)}</span>
                </div>
              </div>
              <Slider
                value={[cat.percent]}
                onValueChange={([v]) => updateCategory(i, v)}
                max={60}
                step={1}
                className="h-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-2">50/30/20 Guideline</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-lg font-bold">${(income * 0.5).toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Needs (50%)</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-lg font-bold">${(income * 0.3).toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Wants (30%)</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-lg font-bold">${(income * 0.2).toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Save (20%)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Compound Interest Calculator ────────────────────────
const CompoundCalculator = () => {
  const [principal, setPrincipal] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);

  const periods = years * 12;
  const monthlyRate = rate / 100 / 12;
  const futureValue =
    principal * Math.pow(1 + monthlyRate, periods) +
    monthly * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
  const totalContributed = principal + monthly * periods;
  const totalInterest = futureValue - totalContributed;

  const milestones = [5, 10, 15, 20, 25, 30].filter((y) => y <= years);

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-muted-foreground">Starting Amount</Label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Monthly Contribution</Label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Annual Return</Label>
            <span className="text-xs font-semibold">{rate}%</span>
          </div>
          <Slider value={[rate]} onValueChange={([v]) => setRate(v)} min={1} max={15} step={0.5} className="mt-1" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Time Horizon</Label>
            <span className="text-xs font-semibold">{years} years</span>
          </div>
          <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={1} max={40} step={1} className="mt-1" />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-center mb-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Future Value</p>
          <p className="text-3xl font-bold tracking-tight">${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-sm font-bold">${totalContributed.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">Total Contributed</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-sm font-bold text-gain">${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            <p className="text-[10px] text-muted-foreground">Interest Earned</p>
          </div>
        </div>
      </div>

      {milestones.length > 1 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-3">Growth Timeline</h3>
          <div className="space-y-2">
            {milestones.map((y) => {
              const p = y * 12;
              const mr = rate / 100 / 12;
              const fv = principal * Math.pow(1 + mr, p) + monthly * ((Math.pow(1 + mr, p) - 1) / mr);
              return (
                <div key={y} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Year {y}</span>
                  <span className="font-semibold">${fv.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Savings Goal Tracker ────────────────────────────────
const SavingsGoal = () => {
  const [goal, setGoal] = useState(25000);
  const [current, setCurrent] = useState(8000);
  const [monthlySave, setMonthlySave] = useState(1000);

  const remaining = Math.max(goal - current, 0);
  const monthsToGoal = monthlySave > 0 ? Math.ceil(remaining / monthlySave) : Infinity;
  const progress = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 space-y-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Savings Goal</Label>
          <Input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Currently Saved</Label>
          <Input type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))} />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Monthly Savings</Label>
          <Input type="number" value={monthlySave} onChange={(e) => setMonthlySave(Number(e.target.value))} />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-semibold">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-sm font-bold">${remaining.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Remaining</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <p className="text-sm font-bold">
              {monthsToGoal === Infinity ? "—" : monthsToGoal <= 12 ? `${monthsToGoal} mo` : `${(monthsToGoal / 12).toFixed(1)} yr`}
            </p>
            <p className="text-[10px] text-muted-foreground">Time to Goal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Position Size Calculator ────────────────────────────
const PositionSizer = () => {
  const [portfolio, setPortfolio] = useState(50000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(150);
  const [stopLoss, setStopLoss] = useState(140);

  const riskAmount = (portfolio * riskPercent) / 100;
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const shares = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  const positionValue = shares * entryPrice;
  const positionPercent = portfolio > 0 ? (positionValue / portfolio) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 space-y-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Portfolio Value</Label>
          <Input type="number" value={portfolio} onChange={(e) => setPortfolio(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">Risk per Trade</Label>
            <span className="text-xs font-semibold">{riskPercent}%</span>
          </div>
          <Slider value={[riskPercent]} onValueChange={([v]) => setRiskPercent(v)} min={0.5} max={5} step={0.5} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] text-muted-foreground">Entry Price</Label>
            <Input type="number" value={entryPrice} onChange={(e) => setEntryPrice(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Stop Loss</Label>
            <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="text-center mb-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Recommended Shares</p>
          <p className="text-3xl font-bold">{shares}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-xs font-bold">${riskAmount.toFixed(0)}</p>
            <p className="text-[9px] text-muted-foreground">Risk $</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-xs font-bold">${positionValue.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Position</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-xs font-bold">{positionPercent.toFixed(1)}%</p>
            <p className="text-[9px] text-muted-foreground">of Portfolio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Tools Page ─────────────────────────────────────
const ToolsPage = () => {
  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Tools</h1>
        <p className="mt-1 text-sm text-muted-foreground">Financial calculators & planning tools</p>
      </motion.div>

      <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="budget" className="flex flex-col gap-0.5 py-2 text-[11px]">
              <PiggyBank size={16} />
              Budget
            </TabsTrigger>
            <TabsTrigger value="compound" className="flex flex-col gap-0.5 py-2 text-[11px]">
              <TrendingUp size={16} />
              Compound
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex flex-col gap-0.5 py-2 text-[11px]">
              <Target size={16} />
              Goals
            </TabsTrigger>
            <TabsTrigger value="position" className="flex flex-col gap-0.5 py-2 text-[11px]">
              <Calculator size={16} />
              Position
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="budget"><BudgetPlanner /></TabsContent>
            <TabsContent value="compound"><CompoundCalculator /></TabsContent>
            <TabsContent value="savings"><SavingsGoal /></TabsContent>
            <TabsContent value="position"><PositionSizer /></TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ToolsPage;
