import { useState } from "react";
import { Bell, BellPlus, X, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const ALERT_TYPES = [
  { value: "price_above", label: "Price goes above", icon: "📈" },
  { value: "price_below", label: "Price drops below", icon: "📉" },
  { value: "percent_change", label: "% change exceeds", icon: "📊" },
  { value: "sudden_move", label: "Sudden movement", icon: "⚡" },
];

interface Props {
  symbol: string;
  currentPrice?: number;
  compact?: boolean;
}

const StockAlertButton = ({ symbol, currentPrice, compact = false }: Props) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [alertType, setAlertType] = useState("price_above");
  const [alertValue, setAlertValue] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("stock_alerts")
      .select("*")
      .eq("user_id", user.id)
      .eq("symbol", symbol.toUpperCase())
      .eq("is_active", true);
    setAlerts(data || []);
    setLoaded(true);
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to set price alerts");
      return;
    }
    if (!loaded) loadAlerts();
    setOpen(true);
  };

  const createAlert = async () => {
    if (!user) return;
    const val = alertType === "sudden_move" ? null : parseFloat(alertValue);
    if (alertType !== "sudden_move" && (!val || isNaN(val))) {
      toast.error("Enter a valid target value");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("stock_alerts")
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        alert_type: alertType,
        target_value: val,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("Failed to create alert");
      return;
    }
    setAlerts((prev) => [...prev, data]);
    setAlertValue("");
    toast.success(`Alert set for ${symbol.toUpperCase()}`);
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("stock_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert removed");
  };

  const hasAlerts = loaded && alerts.length > 0;

  return (
    <>
      <button
        onClick={handleOpen}
        className={`inline-flex items-center gap-1 transition-all ${
          compact
            ? "rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
            : "rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
        }`}
        title={`Set alert for ${symbol}`}
      >
        {hasAlerts ? <Bell size={compact ? 10 : 12} className="text-primary" /> : <BellPlus size={compact ? 10 : 12} />}
        {!compact && <span>{hasAlerts ? `${alerts.length} Alert${alerts.length > 1 ? "s" : ""}` : "Alert"}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setOpen(false)}>
            <motion.div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative z-10 w-[340px] rounded-2xl border border-border bg-card p-5 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Alerts for {symbol.toUpperCase()}</h3>
                  {currentPrice && (
                    <p className="text-[11px] text-muted-foreground">Current: ${currentPrice.toFixed(2)}</p>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-muted transition-colors">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>

              {/* Create new alert */}
              <div className="space-y-2 mb-4">
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full rounded-xl bg-secondary px-3 py-2 text-xs outline-none"
                >
                  {ALERT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
                {alertType !== "sudden_move" && (
                  <input
                    type="number"
                    value={alertValue}
                    onChange={(e) => setAlertValue(e.target.value)}
                    placeholder={
                      alertType === "percent_change"
                        ? "e.g. 5 (%)"
                        : `e.g. ${currentPrice?.toFixed(2) || "100.00"}`
                    }
                    className="w-full rounded-xl bg-secondary px-3 py-2 text-xs outline-none"
                  />
                )}
                <button
                  onClick={createAlert}
                  disabled={saving}
                  className="w-full rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <BellPlus size={12} />}
                  Add Alert
                </button>
              </div>

              {/* Existing alerts */}
              {alerts.length > 0 && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Active Alerts</p>
                  {alerts.map((a) => {
                    const type = ALERT_TYPES.find((t) => t.value === a.alert_type);
                    return (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                        <div className="text-xs">
                          <span>{type?.icon} {type?.label || a.alert_type}</span>
                          {a.target_value != null && (
                            <span className="ml-1 font-semibold">
                              {a.alert_type === "percent_change" ? `${a.target_value}%` : `$${a.target_value}`}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteAlert(a.id)}
                          className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {loaded && alerts.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground pt-1">No active alerts</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StockAlertButton;
