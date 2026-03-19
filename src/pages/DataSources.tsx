import { motion } from "framer-motion";
import { ArrowLeft, Database, Globe, Zap, Clock, Shield, AlertTriangle, Server, Wifi, RefreshCw, CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOURCES = [
  {
    name: "SEC EDGAR",
    type: "Regulatory Filings",
    description: "Official SEC filings including Form 4 insider transactions, 10-K annual reports, 10-Q quarterly reports, and 8-K current events. All data is sourced directly from the SEC's EDGAR full-text search system and ATOM feeds.",
    endpoint: "efts.sec.gov",
    refresh: "~30 seconds polling",
    coverage: "All U.S. publicly traded companies",
    status: "live",
  },
  {
    name: "SEDI (Canadian Insider Reports)",
    type: "Regulatory Filings",
    description: "System for Electronic Disclosure by Insiders — the Canadian equivalent of SEC Form 4. Tracks insider buying and selling activity for TSX and TSXV listed issuers.",
    endpoint: "sedi.ca",
    refresh: "Daily batch",
    coverage: "TSX / TSXV listed companies",
    status: "beta",
  },
  {
    name: "Market Quote Engine",
    type: "Price Data",
    description: "Real-time and delayed stock quotes, intraday and historical OHLCV data, bid/ask spreads, and volume metrics. Prices may be delayed up to 15 minutes for non-premium tiers. Used across the Invest, Watchlist, Heatmap, and Stock Detail pages.",
    endpoint: "Internal aggregation layer",
    refresh: "Real-time (streaming) / 15-min delayed",
    coverage: "NYSE, NASDAQ, TSX, TSXV, major global indices",
    status: "live",
  },
  {
    name: "News Aggregation Pipeline",
    type: "Market News",
    description: "Multi-source news ingestion covering earnings announcements, analyst upgrades/downgrades, macroeconomic events, and sector-specific developments. Articles are tagged by ticker, sentiment, and relevance score.",
    endpoint: "Internal NLP pipeline",
    refresh: "Continuous ingestion",
    coverage: "Global English-language financial news",
    status: "live",
  },
  {
    name: "Heat Engine™ Composite",
    type: "Proprietary Scoring",
    description: "A multi-factor scoring system that blends momentum, volume, volatility, options flow, liquidity, and social attention into a single 0–100 'heat score.' Each sub-score is independently computed and weighted based on market regime.",
    endpoint: "Edge function: heat-engine",
    refresh: "On-demand + 5-min cache",
    coverage: "Top 500 U.S. equities by market cap",
    status: "beta",
  },
  {
    name: "Behavioral Risk Model",
    type: "Proprietary Analytics",
    description: "Analyzes your personal trading patterns — trade frequency, average hold time, position sizing, drawdown behavior — to detect biases like overtrading, revenge trading, momentum chasing, and size escalation. Outputs a discipline score with actionable guidance.",
    endpoint: "Edge function: behavioral-risk",
    refresh: "On profile update / trade execution",
    coverage: "Per-user behavioral analysis",
    status: "beta",
  },
  {
    name: "Capital Allocation Advisor",
    type: "Proprietary Analytics",
    description: "Evaluates your portfolio's sector concentration, largest position weight, cash allocation, and overall volatility profile. Provides deployment guidance and suggested rebalancing targets based on your risk tolerance.",
    endpoint: "Edge function: capital-allocation",
    refresh: "On-demand",
    coverage: "Per-user portfolio analysis",
    status: "beta",
  },
  {
    name: "Maven AI (LLM Layer)",
    type: "AI / Machine Learning",
    description: "Powered by Gemini and GPT model families via Lovable AI. Used for conversational financial coaching, chart pattern explanation, filing summarization, and contextual market insights. All AI outputs include disclaimers and are not financial advice.",
    endpoint: "Lovable AI proxy",
    refresh: "Real-time streaming",
    coverage: "General financial knowledge + user context",
    status: "live",
  },
];

const statusColors: Record<string, string> = {
  live: "bg-gain/15 text-gain",
  beta: "bg-accent/50 text-accent-foreground",
  planned: "bg-muted text-muted-foreground",
};

const DataSources = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14 pb-10 lg:pt-8 max-w-3xl mx-auto">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Sources</h1>
          <p className="mt-1 text-sm text-muted-foreground">Where our market data comes from</p>
        </div>
      </motion.div>

      {/* Beta Banner */}
      <motion.div
        className="mt-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      >
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-foreground" />
        <div>
          <p className="text-xs font-semibold">Beta Platform</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Monee is currently in <span className="font-semibold text-foreground">public beta</span>. Data sources, refresh rates, and coverage are actively evolving.
            Some feeds may experience intermittent delays or gaps. All data is provided for <span className="font-medium text-foreground">educational and informational purposes only</span> — not as financial advice.
          </p>
        </div>
      </motion.div>

      {/* Architecture overview */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Server size={14} className="text-muted-foreground" /> Architecture Overview
        </h2>
        <div className="glass-card p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Wifi size={18} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">Ingestion</p>
              <p className="text-[9px] text-muted-foreground">APIs, feeds, scraping</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Database size={18} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">Processing</p>
              <p className="text-[9px] text-muted-foreground">Normalize, enrich, score</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Zap size={18} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">Delivery</p>
              <p className="text-[9px] text-muted-foreground">Edge functions, realtime</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Data flows through a three-stage pipeline: external sources are ingested via REST APIs and structured feeds, then normalized and enriched with proprietary scoring (Heat Engine, Behavioral Risk), and finally delivered to the client via edge functions with intelligent caching.
          </p>
        </div>
      </motion.div>

      {/* Individual Sources */}
      <motion.div className="mt-6 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Globe size={14} className="text-muted-foreground" /> All Sources ({SOURCES.length})
        </h2>
        {SOURCES.map((src, i) => (
          <motion.div
            key={src.name}
            className="glass-card p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{src.name}</h3>
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${statusColors[src.status]}`}>
                    {src.status}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{src.type}</span>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{src.description}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-secondary px-2.5 py-1.5">
                <p className="text-[9px] text-muted-foreground/70">Endpoint</p>
                <p className="text-[10px] font-medium truncate">{src.endpoint}</p>
              </div>
              <div className="rounded-lg bg-secondary px-2.5 py-1.5">
                <p className="text-[9px] text-muted-foreground/70">Refresh</p>
                <p className="text-[10px] font-medium">{src.refresh}</p>
              </div>
              <div className="rounded-lg bg-secondary px-2.5 py-1.5">
                <p className="text-[9px] text-muted-foreground/70">Coverage</p>
                <p className="text-[10px] font-medium truncate">{src.coverage}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Data Quality */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={14} className="text-muted-foreground" /> Data Quality Commitments
        </h2>
        <div className="glass-card p-4 space-y-3">
          {[
            { title: "Source Attribution", desc: "Every data point displayed in the app is traceable to its original source. Insider filings link back to SEC EDGAR or SEDI. News articles cite the original publisher." },
            { title: "Staleness Detection", desc: "If a data source hasn't refreshed within its expected window, we display a staleness indicator rather than showing potentially outdated information as current." },
            { title: "Error Transparency", desc: "When an upstream API fails, we show a clear error state rather than falling back to stale cached data without indication. Beta users may see these more frequently." },
            { title: "No Fabricated Data", desc: "We never generate synthetic market data and present it as real. Demo/paper trading accounts use clearly labeled simulated balances. AI outputs are marked as AI-generated." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2.5">
              <CheckCircle2 size={12} className="mt-1 shrink-0 text-gain" />
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <p className="text-[11px] text-muted-foreground">
          🧪 Monee Beta · Data sources subject to change · Not financial advice
        </p>
      </motion.div>
    </div>
  );
};

export default DataSources;
