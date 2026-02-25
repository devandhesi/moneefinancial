import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ExternalLink, Shield, Link2, Moon, Sun, LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User, Receipt, ClipboardList, CalendarDays, FlaskConical, Users, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, PanelLeft, Globe, Star, type LucideIcon } from "lucide-react";
import { Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { useTimezone, TIMEZONE_OPTIONS } from "@/hooks/use-timezone";

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
  const { theme, toggleTheme } = useTheme();
  const { links, toggleVisibility, moveUp, moveDown, resetToDefaults } = useSidebarConfig();
  const { timezone, setTimezone } = useTimezone();
  const [connectedBrokers, setConnectedBrokers] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);
  const [brokersOpen, setBrokersOpen] = useState(false);

  const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User, Receipt,
    ClipboardList, CalendarDays, FlaskConical, Shield, Settings: SettingsIcon, Users, Star, Globe,
  };

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

      {/* Appearance */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Appearance</h2>
        <button
          onClick={toggleTheme}
          className="glass-card flex w-full items-center justify-between p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Theme</p>
              <p className="text-[11px] text-muted-foreground">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
            </div>
          </div>
          <div className={`relative h-6 w-11 rounded-full transition-colors ${theme === "dark" ? "bg-foreground" : "bg-border"}`}>
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${theme === "dark" ? "translate-x-[22px]" : "translate-x-0.5"}`} />
          </div>
        </button>
      </motion.div>

      {/* Timezone */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.085 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Timezone</h2>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">Display Timezone</p>
              <p className="text-[11px] text-muted-foreground">Used for market hours and timestamps</p>
            </div>
          </div>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-xl border border-border/50 bg-secondary px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-foreground/20"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PanelLeft size={16} className="text-muted-foreground" />
            <h2 className="text-sm font-medium">Sidebar Layout</h2>
          </div>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <RotateCcw size={10} /> Reset
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Choose which pages appear in the sidebar and reorder them.</p>

        {(["main", "secondary"] as const).map((section) => (
          <div key={section} className="mb-4">
            <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {section === "main" ? "Primary" : "Secondary"}
            </p>
            <div className="space-y-1.5">
              {links.filter(l => l.section === section).map((link) => {
                const Icon = iconMap[link.icon] || SettingsIcon;
                const isProtected = link.id === "dashboard" || link.id === "settings";
                return (
                  <div key={link.id} className="glass-card flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={link.visible ? "text-foreground" : "text-muted-foreground/40"} />
                      <span className={`text-sm font-medium ${link.visible ? "" : "text-muted-foreground/50 line-through"}`}>
                        {link.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(link.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(link.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => toggleVisibility(link.id)}
                        disabled={isProtected}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isProtected
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : link.visible
                            ? "text-foreground hover:bg-secondary"
                            : "text-muted-foreground/40 hover:bg-secondary hover:text-foreground"
                        }`}
                        title={isProtected ? "Always visible" : link.visible ? "Hide" : "Show"}
                      >
                        {link.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <button
          onClick={() => setBrokersOpen(!brokersOpen)}
          className="glass-card flex w-full items-center justify-between p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Link2 size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Connect Your Broker</p>
              <p className="text-[11px] text-muted-foreground">
                {connectedBrokers.size > 0
                  ? `${connectedBrokers.size} connected`
                  : "Link your brokerage account"}
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${brokersOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {brokersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-muted-foreground mt-3 mb-3">All connections use bank-level encryption.</p>
              <div className="space-y-1.5">
                {brokers.map((broker) => {
                  const isConnected = connectedBrokers.has(broker.id);
                  const isConnecting = connecting === broker.id;
                  return (
                    <div
                      key={broker.id}
                      className="glass-card flex items-center justify-between px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary overflow-hidden">
                          <img
                            src={broker.logo}
                            alt={broker.name}
                            className="h-5 w-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[10px] font-bold text-muted-foreground">${broker.name.slice(0, 2).toUpperCase()}</span>`;
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{broker.name}</p>
                          {isConnected && (
                            <span className="text-[10px] text-gain flex items-center gap-0.5">
                              <Check size={10} /> Connected
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnect(broker.id)}
                        disabled={isConnecting}
                        className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all active:scale-[0.97] ${
                          isConnected
                            ? "glass-card text-muted-foreground"
                            : "bg-foreground text-primary-foreground"
                        } ${isConnecting ? "opacity-50" : ""}`}
                      >
                        {isConnecting ? "..." : isConnected ? "Disconnect" : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
