import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ExternalLink, Shield, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Broker {
  id: string;
  name: string;
  logo: string;
  color: string;
  connected: boolean;
}

const brokers: Broker[] = [
  { id: "ws", name: "Wealthsimple", logo: "https://logo.clearbit.com/wealthsimple.com", color: "hsl(0, 0%, 10%)", connected: false },
  { id: "rbc", name: "RBC Direct Investing", logo: "https://logo.clearbit.com/rbcdirectinvesting.com", color: "hsl(215, 80%, 45%)", connected: false },
  { id: "td", name: "TD Direct Investing", logo: "https://logo.clearbit.com/td.com", color: "hsl(130, 60%, 35%)", connected: false },
  { id: "cibc", name: "CIBC Investor's Edge", logo: "https://logo.clearbit.com/cibc.com", color: "hsl(0, 70%, 45%)", connected: false },
  { id: "scotia", name: "Scotia iTRADE", logo: "https://logo.clearbit.com/scotiabank.com", color: "hsl(0, 75%, 48%)", connected: false },
  { id: "questrade", name: "Questrade", logo: "https://logo.clearbit.com/questrade.com", color: "hsl(130, 50%, 40%)", connected: false },
  { id: "bmo", name: "BMO InvestorLine", logo: "https://logo.clearbit.com/bmo.com", color: "hsl(210, 70%, 40%)", connected: false },
  { id: "nbdb", name: "National Bank Direct", logo: "https://logo.clearbit.com/nbc.ca", color: "hsl(0, 70%, 40%)", connected: false },
  { id: "ibkr", name: "Interactive Brokers", logo: "https://logo.clearbit.com/interactivebrokers.com", color: "hsl(0, 65%, 45%)", connected: false },
  { id: "fidelity", name: "Fidelity Canada", logo: "https://logo.clearbit.com/fidelity.ca", color: "hsl(130, 60%, 30%)", connected: false },
];

const Settings = () => {
  const navigate = useNavigate();
  const [connectedBrokers, setConnectedBrokers] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = (id: string) => {
    setConnecting(id);
    setTimeout(() => {
      setConnectedBrokers((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setConnecting(null);
    }, 1200);
  };

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your connected accounts</p>
        </div>
      </motion.div>

      {/* Broker Connections */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-medium">Connect Your Broker</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Link your brokerage account to sync your real portfolio data. All connections use bank-level encryption.</p>

        <div className="space-y-2">
          {brokers.map((broker, i) => {
            const isConnected = connectedBrokers.has(broker.id);
            const isConnecting = connecting === broker.id;
            return (
              <motion.div
                key={broker.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.15 }}
                className="glass-card flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary overflow-hidden">
                    <img
                      src={broker.logo}
                      alt={broker.name}
                      className="h-6 w-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${broker.name.slice(0, 2).toUpperCase()}</span>`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{broker.name}</p>
                    {isConnected && (
                      <p className="text-[11px] text-gain flex items-center gap-1">
                        <Check size={10} /> Connected
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(broker.id)}
                  disabled={isConnecting}
                  className={`rounded-xl px-4 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                    isConnected
                      ? "glass-card text-muted-foreground"
                      : "bg-foreground text-primary-foreground"
                  } ${isConnecting ? "opacity-50" : ""}`}
                >
                  {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Security Note */}
      <motion.div className="glass-card mt-6 flex items-start gap-3 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <Shield size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium">Bank-Level Security</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Broker connections use read-only access with 256-bit encryption. We never store your login credentials. Data is synced securely via authorized APIs.
          </p>
        </div>
      </motion.div>

      {/* Data Sources */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Institutional</h2>
        <div className="space-y-2">
          {[
            { label: "Data Sources", desc: "Where our market data comes from" },
            { label: "Methodology", desc: "How behavioral grading works" },
            { label: "Transparency", desc: "Our commitment to clarity" },
          ].map((item) => (
            <button key={item.label} className="glass-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ExternalLink size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
        <p className="text-[11px] text-muted-foreground">📄 Paper Trading Mode · Broker sync coming soon</p>
      </motion.div>
    </div>
  );
};

export default Settings;
