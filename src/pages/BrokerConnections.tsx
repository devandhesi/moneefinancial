import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, Link2, RefreshCw, Unplug, CheckCircle2,
  XCircle, Clock, Upload, Key, CreditCard, AlertTriangle,
  ChevronDown, Loader2, FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  useBrokerConnections,
  useConnectAlpaca,
  useSyncBroker,
  useDisconnectBroker,
  useImportCsv,
  type BrokerConnection,
} from "@/hooks/use-broker";

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "Never";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return "Unknown"; }
}

// ============ PLAID CARD ============
const PlaidCard = ({ connection }: { connection?: BrokerConnection }) => {
  const isConnected = connection?.status === "connected";
  const sync = useSyncBroker();
  const disconnect = useDisconnectBroker();

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <CreditCard size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Connect with Plaid</h3>
            <p className="text-[11px] text-muted-foreground">Recommended · Supports most brokers</p>
          </div>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
          {isConnected ? (
            <><CheckCircle2 size={10} className="mr-1" /> Connected</>
          ) : (
            <><XCircle size={10} className="mr-1" /> Not Connected</>
          )}
        </Badge>
      </div>

      {isConnected && connection?.last_sync_at && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock size={11} />
          Last synced: {timeAgo(connection.last_sync_at)}
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isConnected ? (
          <Button
            size="sm"
            className="gap-1.5"
            disabled
          >
            <Link2 size={13} /> Connect
            <Badge variant="outline" className="ml-1 text-[9px]">Setup Required</Badge>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => sync.mutate("plaid")}
              disabled={sync.isPending}
            >
              <RefreshCw size={13} className={sync.isPending ? "animate-spin" : ""} />
              Sync Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => disconnect.mutate("plaid")}
              disabled={disconnect.isPending}
            >
              <Unplug size={13} /> Disconnect
            </Button>
          </>
        )}
      </div>

      {!isConnected && (
        <p className="text-[10px] text-muted-foreground/60">
          Plaid credentials not configured. Contact your admin to enable.
        </p>
      )}
    </Card>
  );
};

// ============ ALPACA CARD ============
const AlpacaCard = ({ connection }: { connection?: BrokerConnection }) => {
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const isConnected = connection?.status === "connected";
  const connect = useConnectAlpaca();
  const sync = useSyncBroker();
  const disconnect = useDisconnectBroker();

  const handleConnect = () => {
    if (!apiKey.trim() || !apiSecret.trim()) return;
    connect.mutate({ api_key: apiKey.trim(), api_secret: apiSecret.trim() }, {
      onSuccess: () => { setShowForm(false); setApiKey(""); setApiSecret(""); },
    });
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <Key size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Connect Alpaca</h3>
            <p className="text-[11px] text-muted-foreground">Direct API · Paper or Live (read-only)</p>
          </div>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
          {isConnected ? (
            <><CheckCircle2 size={10} className="mr-1" /> Connected</>
          ) : (
            <><XCircle size={10} className="mr-1" /> Not Connected</>
          )}
        </Badge>
      </div>

      {isConnected && connection?.last_sync_at && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock size={11} />
          Last synced: {timeAgo(connection.last_sync_at)}
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isConnected ? (
          <Button size="sm" className="gap-1.5" onClick={() => setShowForm(!showForm)}>
            <Link2 size={13} /> Connect
            <ChevronDown size={12} className={`transition-transform ${showForm ? "rotate-180" : ""}`} />
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => sync.mutate("alpaca")}
              disabled={sync.isPending}
            >
              <RefreshCw size={13} className={sync.isPending ? "animate-spin" : ""} />
              Sync Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => disconnect.mutate("alpaca")}
              disabled={disconnect.isPending}
            >
              <Unplug size={13} /> Disconnect
            </Button>
          </>
        )}
      </div>

      <AnimatePresence>
        {showForm && !isConnected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className="space-y-2 pt-2">
              <div>
                <Label className="text-xs">API Key ID</Label>
                <Input
                  placeholder="PK..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Secret Key</Label>
                <Input
                  type="password"
                  placeholder="Your secret key"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="mt-1 text-sm"
                />
              </div>
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={handleConnect}
                disabled={connect.isPending || !apiKey || !apiSecret}
              >
                {connect.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                Validate & Connect
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Get your keys from{" "}
                <a href="https://app.alpaca.markets/paper/dashboard/overview" target="_blank" rel="noopener noreferrer" className="underline">
                  Alpaca Dashboard
                </a>
                . We only use read-only endpoints.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// ============ CSV CARD ============
const CsvCard = ({ connection }: { connection?: BrokerConnection }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const isConnected = connection?.status === "connected";
  const importCsv = useImportCsv();
  const disconnect = useDisconnectBroker();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        if (lines.length < 2) throw new Error("CSV must have headers and at least one row");
        
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z_]/g, "_"));
        const data = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim());
          const row: any = {};
          headers.forEach((h, i) => { row[h] = values[i] || ""; });
          return row;
        }).filter(row => row.symbol || row.ticker);

        if (data.length === 0) throw new Error("No valid rows found. CSV needs a 'symbol' or 'ticker' column.");
        importCsv.mutate(data);
      } catch (err: any) {
        importCsv.reset();
        alert(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
            <FileSpreadsheet size={20} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Import CSV</h3>
            <p className="text-[11px] text-muted-foreground">Manual fallback · Upload positions</p>
          </div>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="text-[10px]">
          {isConnected ? (
            <><CheckCircle2 size={10} className="mr-1" /> Imported</>
          ) : (
            <><Upload size={10} className="mr-1" /> Not Imported</>
          )}
        </Badge>
      </div>

      {isConnected && connection?.last_sync_at && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock size={11} />
          Last imported: {timeAgo(connection.last_sync_at)}
          {connection.metadata?.imported_count && (
            <span>· {connection.metadata.imported_count} positions</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          className="gap-1.5"
          onClick={() => fileRef.current?.click()}
          disabled={importCsv.isPending}
        >
          {importCsv.isPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {isConnected ? "Re-import" : "Upload CSV"}
        </Button>
        {isConnected && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => disconnect.mutate("csv")}
            disabled={disconnect.isPending}
          >
            <Unplug size={13} /> Remove
          </Button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">
        CSV should have columns: symbol, quantity, average_price (optional: market_value)
      </p>
    </Card>
  );
};

// ============ MAIN PAGE ============
const BrokerConnections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: connections, isLoading } = useBrokerConnections();

  const getConnection = (provider: string) =>
    connections?.find((c: BrokerConnection) => c.provider === provider);

  if (!user) {
    return (
      <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield size={32} className="text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold">Sign in Required</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You need to be signed in to connect broker accounts.
          </p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-24 lg:pb-8 lg:pt-8 max-w-3xl mx-auto">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Broker Connections</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connect your brokerage accounts</p>
        </div>
      </motion.div>

      {/* Read-only warning */}
      <motion.div
        className="mt-5 rounded-xl border border-border/40 bg-card p-3.5 flex items-start gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium">Read-only connection</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Trading is not supported. We can only view your balances, positions, orders, and fills.
            We will never place, modify, or cancel orders.
          </p>
        </div>
      </motion.div>

      {/* Connection Cards */}
      <div className="mt-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-12 bg-secondary rounded-xl" />
            </Card>
          ))
        ) : (
          <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <PlaidCard connection={getConnection("plaid")} />
            <AlpacaCard connection={getConnection("alpaca")} />
            <CsvCard connection={getConnection("csv")} />
          </motion.div>
        )}
      </div>

      {/* Security Note */}
      <motion.div
        className="mt-6 rounded-xl border border-border/40 bg-card p-4 flex items-start gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Shield size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium">Bank-Level Security</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
            All API keys are encrypted at rest. We only request read-only permissions.
            Tokens are never logged or exposed. Connections can be revoked at any time.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BrokerConnections;
