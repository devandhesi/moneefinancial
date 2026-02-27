import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Loader2, Eye, EyeOff,
  ShoppingCart, BadgeDollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePortfolioValue } from "@/hooks/use-portfolio-value";

type ColumnKey = "price" | "priceChange" | "dailyReturn" | "allTimeReturn";

const COLUMN_OPTIONS: { key: ColumnKey; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "priceChange", label: "Change" },
  { key: "dailyReturn", label: "Day P&L" },
  { key: "allTimeReturn", label: "Total P&L" },
];

const MyHoldingsWidget = () => {
  const { positions, isLoading } = usePortfolioValue();
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnKey>("price");
  const navigate = useNavigate();

  const fmt = (n: number, decimals = 2) =>
    `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

  const pctFmt = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

  const getColumnValue = (pos: (typeof positions)[0]) => {
    switch (activeColumn) {
      case "price":
        return { text: fmt(pos.livePrice), color: "" };
      case "priceChange":
        return {
          text: `${pos.dayChange >= 0 ? "+" : ""}${fmt(pos.dayChange)}`,
          color: pos.dayChange >= 0 ? "text-gain" : "text-loss",
        };
      case "dailyReturn":
        return {
          text: `${pos.dayChange * pos.quantity >= 0 ? "+" : ""}${fmt(pos.dayChange * pos.quantity)}`,
          color: pos.dayChange >= 0 ? "text-gain" : "text-loss",
        };
      case "allTimeReturn":
        return {
          text: `${pos.unrealizedPnl >= 0 ? "+" : ""}${fmt(pos.unrealizedPnl)}`,
          color: pos.unrealizedPnl >= 0 ? "text-gain" : "text-loss",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card glass-shimmer p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">My Holdings</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div className="glass-card glass-shimmer p-4">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">My Holdings</h2>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No positions yet</p>
          <button
            onClick={() => navigate("/invest")}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            Start investing →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card glass-shimmer p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          My Holdings ({positions.length})
        </h2>
      </div>

      {/* Column toggles */}
      <div className="flex items-center gap-1 mb-3">
        {COLUMN_OPTIONS.map((col) => (
          <button
            key={col.key}
            onClick={() => setActiveColumn(col.key)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeColumn === col.key
                ? "bg-foreground text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {col.label}
          </button>
        ))}
      </div>

      {/* Positions list */}
      <div className="space-y-1">
        {positions.map((pos) => {
          const isExpanded = expandedTicker === pos.ticker;
          const colVal = getColumnValue(pos);
          const totalCost = pos.avgCost * pos.quantity;
          const totalReturn = pos.unrealizedPnl;
          const totalReturnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
          const dailyPnl = pos.dayChange * pos.quantity;
          const dailyPnlPct = pos.dayChangePct;

          return (
            <div key={pos.ticker}>
              <button
                onClick={() => setExpandedTicker(isExpanded ? null : pos.ticker)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                    {pos.ticker.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{pos.ticker}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {pos.quantity} share{pos.quantity !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${colVal.color}`}>{colVal.text}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {fmt(pos.value)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mx-3 mb-2 rounded-lg bg-secondary/30 p-3 space-y-2">
                      {/* Detail rows */}
                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <div>
                          <p className="text-muted-foreground">Avg Cost</p>
                          <p className="font-medium">{fmt(pos.avgCost)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="font-medium">{fmt(pos.livePrice)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Daily P&L</p>
                          <p className={`font-medium ${dailyPnl >= 0 ? "text-gain" : "text-loss"}`}>
                            {dailyPnl >= 0 ? "+" : ""}{fmt(dailyPnl)} ({pctFmt(dailyPnlPct)})
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total P&L</p>
                          <p className={`font-medium ${totalReturn >= 0 ? "text-gain" : "text-loss"}`}>
                            {totalReturn >= 0 ? "+" : ""}{fmt(totalReturn)} ({pctFmt(totalReturnPct)})
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Market Value</p>
                          <p className="font-medium">{fmt(pos.value)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost Basis</p>
                          <p className="font-medium">{fmt(totalCost)}</p>
                        </div>
                      </div>

                      {/* Buy / Sell buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invest/${pos.ticker}`);
                          }}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gain/15 py-2 text-xs font-medium text-gain transition-colors hover:bg-gain/25"
                        >
                          <ShoppingCart size={13} />
                          Buy
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invest/${pos.ticker}?action=sell`);
                          }}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-loss/15 py-2 text-xs font-medium text-loss transition-colors hover:bg-loss/25"
                        >
                          <BadgeDollarSign size={13} />
                          Sell
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyHoldingsWidget;
