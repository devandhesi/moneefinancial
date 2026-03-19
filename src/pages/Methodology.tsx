import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Brain, Thermometer, Activity, Scale, BarChart3, Target, Layers, TrendingUp, ShieldCheck, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Methodology = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14 pb-10 lg:pt-8 max-w-3xl mx-auto">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>
          <p className="mt-1 text-sm text-muted-foreground">How our proprietary scoring systems work</p>
        </div>
      </motion.div>

      {/* Beta Banner */}
      <motion.div
        className="mt-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      >
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-foreground" />
        <div>
          <p className="text-xs font-semibold">Beta Methodologies</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            All scoring models described below are in <span className="font-semibold text-foreground">active development</span>. Weights, thresholds, and sub-score definitions are being refined based on backtesting and user feedback during the beta period. These scores are <span className="font-medium text-foreground">educational tools, not trading signals</span>.
          </p>
        </div>
      </motion.div>

      {/* Heat Engine */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-3">
          <Thermometer size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Heat Engine™ Scoring</h2>
          <span className="rounded-md bg-accent/50 px-2 py-0.5 text-[9px] font-bold uppercase text-accent-foreground">Beta</span>
        </div>
        <div className="glass-card p-4 space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            The Heat Engine produces a composite score from 0–100 that represents how "hot" — or actively traded and potentially volatile — a stock is at any given moment. It is <strong className="text-foreground">not a buy/sell signal</strong>; it measures market attention and activity intensity.
          </p>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Sub-Score Components</p>
            <div className="space-y-2">
              {[
                { name: "Momentum", weight: "20%", icon: TrendingUp, desc: "Price momentum over 5, 10, and 20-day windows. Measures rate-of-change and acceleration relative to the stock's own historical volatility." },
                { name: "Volume", weight: "20%", icon: BarChart3, desc: "Current volume vs. 20-day average volume ratio. Spikes above 2x trigger elevated scoring. Considers time-of-day normalization for intraday accuracy." },
                { name: "Volatility", weight: "15%", icon: Activity, desc: "Realized volatility (standard deviation of log returns) over rolling 10-day and 30-day windows. Higher volatility increases the heat score." },
                { name: "Options Flow", weight: "15%", icon: Layers, desc: "Put/call ratio shifts, unusual options volume, and near-term expiry open interest changes. Captures institutional hedging and speculative positioning." },
                { name: "Liquidity", weight: "15%", icon: Gauge, desc: "Bid-ask spread tightness, order book depth, and average trade size. Illiquid names with sudden activity get amplified scores." },
                { name: "Social Attention", weight: "15%", icon: Brain, desc: "Mention velocity across financial social platforms, news headline frequency, and search trend acceleration. Proxies for retail attention." },
              ].map((sub) => (
                <div key={sub.name} className="flex items-start gap-3 rounded-xl bg-secondary p-3">
                  <sub.icon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{sub.name}</span>
                      <span className="text-[9px] text-muted-foreground/60">{sub.weight}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{sub.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Stage Classification</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { stage: "Cold", range: "0–25", color: "bg-blue-500/15 text-blue-400" },
                { stage: "Warm", range: "26–50", color: "bg-yellow-500/15 text-yellow-400" },
                { stage: "Hot", range: "51–75", color: "bg-orange-500/15 text-orange-400" },
                { stage: "On Fire", range: "76–100", color: "bg-red-500/15 text-red-400" },
              ].map((s) => (
                <div key={s.stage} className={`rounded-lg px-2.5 py-2 text-center ${s.color}`}>
                  <p className="text-[10px] font-bold">{s.stage}</p>
                  <p className="text-[9px] opacity-80">{s.range}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] font-medium">Confidence Level</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Each heat score includes a confidence metric (low/medium/high) based on data completeness. If options data or social attention data is unavailable for a given ticker, the confidence drops and affected sub-scores are interpolated from available signals.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Behavioral Risk */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Behavioral Risk Scoring</h2>
          <span className="rounded-md bg-accent/50 px-2 py-0.5 text-[9px] font-bold uppercase text-accent-foreground">Beta</span>
        </div>
        <div className="glass-card p-4 space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            The Behavioral Risk engine analyzes your <strong className="text-foreground">personal trading patterns</strong> — not market conditions — to identify cognitive biases and emotional trading behaviors. It produces a Discipline Score (0–100) and flags specific risk patterns.
          </p>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Detected Behaviors</p>
            <div className="space-y-2">
              {[
                { flag: "Overtrading", desc: "Excessive trade frequency relative to your historical average. Triggers when trades-per-week exceeds 2 standard deviations above your 30-day rolling mean.", threshold: "> 2σ above mean frequency" },
                { flag: "Revenge Trading", desc: "Placing larger-than-normal trades within 2 hours of a significant loss. Detects emotionally driven attempts to 'win back' losses quickly.", threshold: "Loss > 3% → trade within 2h" },
                { flag: "Size Escalation", desc: "Gradual increase in average position size over consecutive trades without corresponding portfolio growth. Often precedes catastrophic drawdowns.", threshold: "3+ consecutive size increases" },
                { flag: "Momentum Chasing", desc: "Buying stocks after sustained 5+ day uptrends at elevated valuations. Measures your tendency to buy high relative to recent price ranges.", threshold: "Buy after 5-day streak > +8%" },
                { flag: "Drawdown Behavior", desc: "How you respond to portfolio drawdowns — do you panic sell, average down, or hold? This flag activates when your actions during drawdowns deviate from your stated risk profile.", threshold: "Portfolio drawdown > 5%" },
              ].map((item) => (
                <div key={item.flag} className="rounded-xl bg-secondary p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{item.flag}</span>
                    <span className="text-[9px] text-muted-foreground/60 font-mono">{item.threshold}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Discipline Score Formula</p>
            <div className="rounded-lg bg-secondary/50 p-3 font-mono text-[11px] text-muted-foreground space-y-1">
              <p>base_score = 100</p>
              <p>penalty = Σ(active_flags × flag_severity_weight)</p>
              <p>trend_adj = improvement_over_30d × 0.1</p>
              <p className="text-foreground font-semibold">discipline = clamp(base_score - penalty + trend_adj, 0, 100)</p>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Each flag carries a severity weight (5–20 points). The trend adjustment rewards consistent improvement over time, encouraging better habits rather than perfection.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Capital Allocation */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Capital Allocation Grading</h2>
          <span className="rounded-md bg-accent/50 px-2 py-0.5 text-[9px] font-bold uppercase text-accent-foreground">Beta</span>
        </div>
        <div className="glass-card p-4 space-y-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Evaluates how well-diversified and risk-managed your portfolio is. Produces a volatility classification and actionable deployment guidance.
          </p>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Evaluation Dimensions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { metric: "Cash %", desc: "Proportion held in cash vs invested. Targets vary by volatility regime." },
                { metric: "Max Position %", desc: "Largest single holding as % of portfolio. Flags concentration risk above 15%." },
                { metric: "Max Sector %", desc: "Largest sector exposure. Flags above 35% as over-concentrated." },
                { metric: "Volatility Score", desc: "Portfolio-level realized vol classified as Low / Medium / High / Extreme." },
              ].map((m) => (
                <div key={m.metric} className="rounded-xl bg-secondary p-3">
                  <p className="text-[10px] font-semibold">{m.metric}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-[10px] font-medium mb-1">Deployment Guidance</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Based on your current allocation and market conditions, the system suggests cash deployment targets (e.g., "Deploy 20% of cash into underweight sectors") and maximum position sizes. These are <strong className="text-foreground">guidelines, not orders</strong> — the system never auto-executes trades.
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Methodology */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold">Maven AI — Coaching Methodology</h2>
        </div>
        <div className="glass-card p-4 space-y-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Maven is an AI financial coach, not an advisor. It uses large language models (Gemini and GPT families) with carefully crafted system prompts that enforce:
          </p>
          <ul className="space-y-2">
            {[
              "Educational framing — explains concepts rather than giving directives",
              "Mandatory disclaimers on any market-related response",
              "Context-awareness — receives your portfolio state, recent trades, and behavioral flags to give personalized coaching",
              "Chart literacy — when in Learn Charts mode, Maven can see current indicator values (RSI, MACD, Bollinger Bands) and teach you how to read them",
              "No hallucinated data — Maven is instructed to say 'I don't know' rather than fabricate prices, dates, or statistics",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck size={12} className="mt-0.5 shrink-0 text-gain" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p className="text-[11px] text-muted-foreground">
          🧪 Monee Beta · Methodologies subject to revision · Not financial advice
        </p>
      </motion.div>
    </div>
  );
};

export default Methodology;
