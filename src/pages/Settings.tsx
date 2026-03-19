import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Moon, Sun, LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User, Receipt, ClipboardList, CalendarDays, FlaskConical, Users, Eye, EyeOff, RotateCcw, PanelLeft, Globe, Star, ExternalLink, GripVertical, Wallet, Plus, Loader2, Trash2, AlertTriangle, Compass, Newspaper, Hash, Bell, Wrench, FileBarChart, type LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useSidebarConfig, SECTION_LABELS } from "@/hooks/use-sidebar-config";
import { useTimezone, TIMEZONE_OPTIONS } from "@/hooks/use-timezone";
import { useSimAccount, useSimCash, useDepositFunds, useResetPaperTrading } from "@/hooks/use-sim-portfolio";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useWalkthrough, ALL_TOURS } from "@/hooks/use-walkthrough";
const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { links, toggleVisibility, reorder, resetToDefaults } = useSidebarConfig();
  const { timezone, setTimezone } = useTimezone();
  const { data: simAccount } = useSimAccount();
  const { data: simCash } = useSimCash(simAccount?.id);
  const depositMutation = useDepositFunds();
  const resetMutation = useResetPaperTrading();
  const { startTour } = useWalkthrough();
  const [depositAmount, setDepositAmount] = useState("");
  const [dragState, setDragState] = useState<{ section: string; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [resetStep, setResetStep] = useState(0); // 0=closed, 1=first confirm, 2=final confirm
  const CONFIRM_PHRASE = "RESET";

  const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User, Receipt,
    ClipboardList, CalendarDays, FlaskConical, Shield, Settings: SettingsIcon, Users, Star, Globe,
    Newspaper, Hash, Bell, Wrench, FileBarChart,
  };

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your preferences</p>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Appearance</h2>
        <div className="glass-card flex w-full items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-[11px] text-muted-foreground">{theme === "dark" ? "On" : "Off"}</p>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
        </div>
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

      {/* Paper Trading Funds */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.087 }} data-tour-id="tour-deposit-section">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Paper Trading</h2>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm font-medium">Paper Money Balance</p>
              <p className="text-lg font-semibold tabular-nums">
                ${(simCash?.available ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                min={0}
                step={1000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount to add..."
                className="w-full rounded-xl border border-border/50 bg-secondary px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-foreground/20"
              />
            </div>
            <button
              onClick={async () => {
                const amt = parseFloat(depositAmount);
                if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
                try {
                  await depositMutation.mutateAsync({ amount: amt });
                  toast.success(`$${amt.toLocaleString()} added to your paper account`);
                  setDepositAmount("");
                } catch (e: any) {
                  toast.error(e.message || "Failed to deposit");
                }
              }}
              disabled={depositMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {depositMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            {[1000, 5000, 10000, 25000].map((amt) => (
              <button
                key={amt}
                onClick={() => setDepositAmount(String(amt))}
                className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                ${(amt / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            This is simulated money for paper trading. Not real currency.
          </p>
          <div className="mt-4 border-t border-border/30 pt-4">
            <button
              onClick={() => setResetStep(1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 size={14} />
              Reset Paper Trading Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetStep > 0} onOpenChange={(open) => { if (!open) setResetStep(0); }}>
        <AlertDialogContent className="max-w-md">
          {resetStep === 1 && (
            <>
              <AlertDialogHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle size={24} className="text-destructive" />
                </div>
                <AlertDialogTitle className="text-center">Reset Paper Trading?</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  This will permanently delete all your paper trading data including:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <ul className="space-y-2 text-sm text-muted-foreground px-2">
                <li className="flex items-center gap-2">• All open positions</li>
                <li className="flex items-center gap-2">• Order history</li>
                <li className="flex items-center gap-2">• Transaction history</li>
                <li className="flex items-center gap-2">• Cash balance (reset to $0)</li>
              </ul>
              <AlertDialogFooter className="mt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={() => setResetStep(2)}>
                  Continue
                </Button>
              </AlertDialogFooter>
            </>
          )}
          {resetStep === 2 && (
            <>
              <AlertDialogHeader>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle size={24} className="text-destructive" />
                </div>
                <AlertDialogTitle className="text-center">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  This action cannot be undone. Type <span className="font-bold text-foreground">RESET</span> below to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <input
                id="reset-confirm-input"
                type="text"
                placeholder='Type "RESET" to confirm'
                className="w-full rounded-xl border border-border/50 bg-secondary px-3 py-2.5 text-sm font-medium outline-none transition-colors focus:border-destructive/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value === CONFIRM_PHRASE) {
                    resetMutation.mutate(undefined, {
                      onSuccess: () => {
                        toast.success("Paper trading account has been reset");
                        setResetStep(0);
                      },
                      onError: (err: any) => toast.error(err.message || "Reset failed"),
                    });
                  }
                }}
              />
              <AlertDialogFooter className="mt-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={resetMutation.isPending}
                  onClick={() => {
                    const input = document.getElementById("reset-confirm-input") as HTMLInputElement;
                    if (input?.value !== CONFIRM_PHRASE) {
                      toast.error('Please type "RESET" to confirm');
                      return;
                    }
                    resetMutation.mutate(undefined, {
                      onSuccess: () => {
                        toast.success("Paper trading account has been reset");
                        setResetStep(0);
                      },
                      onError: (err: any) => toast.error(err.message || "Reset failed"),
                    });
                  }}
                >
                  {resetMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                  Permanently Reset
                </Button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar Layout */}
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

        {(["main", "secondary"] as const).map((section) => {
          const sectionLinks = links.filter(l => l.section === section);
          return (
            <div key={section} className="mb-4">
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {section === "main" ? "Primary" : "Secondary"}
              </p>
              <div className="space-y-1.5">
                {sectionLinks.map((link, idx) => {
                  const Icon = iconMap[link.icon] || SettingsIcon;
                  const isProtected = link.id === "dashboard" || link.id === "settings";
                  const isDragging = dragState?.section === section && dragState?.index === idx;
                  const isDragOver = dragState?.section === section && dragOverIndex === idx;
                  return (
                    <div
                      key={link.id}
                      draggable
                      onDragStart={() => setDragState({ section, index: idx })}
                      onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
                      onDrop={() => {
                        if (dragState && dragState.section === section) {
                          reorder(section, dragState.index, idx);
                        }
                        setDragState(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => { setDragState(null); setDragOverIndex(null); }}
                      className={`glass-card flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing transition-all ${
                        isDragging ? "opacity-40 scale-95" : ""
                      } ${isDragOver && !isDragging ? "ring-2 ring-primary/40 scale-[1.02]" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical size={14} className="text-muted-foreground/50 shrink-0" />
                        <Icon size={16} className={link.visible ? "text-foreground" : "text-muted-foreground/40"} />
                        <span className={`text-sm font-medium ${link.visible ? "" : "text-muted-foreground/50 line-through"}`}>
                          {link.label}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleVisibility(link.id)}
                        disabled={isProtected}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isProtected ? "text-muted-foreground/30 cursor-not-allowed"
                            : link.visible ? "text-foreground hover:bg-secondary"
                            : "text-muted-foreground/40 hover:bg-secondary hover:text-foreground"
                        }`}
                        title={isProtected ? "Always visible" : link.visible ? "Hide" : "Show"}
                      >
                        {link.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Security Note */}
      <motion.div className="glass-card mt-6 flex items-start gap-3 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <Shield size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium">Security</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Your data is encrypted and stored securely. All market data is for educational purposes only.
          </p>
        </div>
      </motion.div>

      {/* Institutional */}
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

      {/* Tutorials */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Tutorials</h2>
        <div className="space-y-2">
          {ALL_TOURS.map((tour) => (
            <button
              key={tour.id}
              onClick={() => {
                startTour(tour.id);
                navigate(tour.steps[0]?.route || "/");
              }}
              className="glass-card flex w-full items-center gap-3 p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                {tour.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{tour.label}</p>
                <p className="text-[11px] text-muted-foreground">{tour.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground/50 shrink-0">{tour.steps.length} steps</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
        <p className="text-[11px] text-muted-foreground">
          📄 Paper Trading Mode · All trades are simulated
        </p>
      </motion.div>
    </div>
  );
};

export default Settings;
