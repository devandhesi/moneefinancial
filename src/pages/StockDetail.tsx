import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Sparkles, Star } from "lucide-react";
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";

// Mock data for any stock
const generateChartData = () => {
  const data = [];
  let price = 180;
  for (let i = 0; i < 60; i++) {
    price += (Math.random() - 0.48) * 4;
    const sma20 = price + (Math.random() - 0.5) * 3;
    const sma50 = price + (Math.random() - 0.5) * 5;
    const ema12 = price + (Math.random() - 0.5) * 2;
    const ema26 = price + (Math.random() - 0.5) * 4;
    data.push({
      date: `Day ${i + 1}`,
      price: +price.toFixed(2),
      volume: Math.floor(Math.random() * 80 + 20),
      sma20: +sma20.toFixed(2),
      sma50: +sma50.toFixed(2),
      ema12: +ema12.toFixed(2),
      ema26: +ema26.toFixed(2),
      rsi: +(30 + Math.random() * 40).toFixed(1),
      macd: +((Math.random() - 0.5) * 4).toFixed(2),
    });
  }
  return data;
};

const eventMarkers = [
  { day: 15, type: "earnings", label: "Q4 Earnings" },
  { day: 30, type: "order", label: "Limit Buy Filled" },
  { day: 45, type: "trade", label: "Paper Sell Executed" },
];

const indicators = ["SMA20", "SMA50", "EMA12", "EMA26", "RSI14", "MACD", "Volume"] as const;
type Indicator = typeof indicators[number];

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set(["SMA20"]));
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [chartData] = useState(generateChartData);

  const toggleIndicator = (ind: Indicator) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      next.has(ind) ? next.delete(ind) : next.add(ind);
      return next;
    });
  };

  const currentPrice = chartData[chartData.length - 1]?.price ?? 0;
  const prevPrice = chartData[chartData.length - 2]?.price ?? currentPrice;
  const change = ((currentPrice - prevPrice) / prevPrice * 100);
  const isPositive = change >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass-card-strong px-3 py-2 text-xs">
        <p className="font-semibold">{label}</p>
        <p>Price: <span className="font-medium">${d?.price}</span></p>
        <p>Volume: <span className="font-medium">{d?.volume}M</span></p>
        <p className={change >= 0 ? "text-gain" : "text-loss"}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</p>
      </div>
    );
  };

  return (
    <div className="px-5 pt-14 pb-8 lg:pt-8">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{symbol}</h1>
          <p className="text-sm text-muted-foreground">Stock Detail</p>
        </div>
        <button className="rounded-xl p-2 hover:bg-secondary">
          <Star size={18} className="text-muted-foreground" />
        </button>
      </motion.div>

      {/* Price Hero */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <p className="text-3xl font-semibold">${currentPrice.toFixed(2)}</p>
        <p className={`mt-1 flex items-center gap-1 text-sm ${isPositive ? "text-gain" : "text-loss"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change).toFixed(2)}% today
        </p>
      </motion.div>

      {/* Simulated Trade Banner */}
      <div className="mt-3 rounded-lg bg-secondary px-3 py-2 text-center text-[11px] text-muted-foreground">
        📄 Simulated Trading · Not a real transaction
      </div>

      {/* Indicator Pills */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {indicators.map((ind) => (
          <button
            key={ind}
            onClick={() => toggleIndicator(ind)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeIndicators.has(ind) ? "bg-foreground text-primary-foreground" : "glass-card text-muted-foreground"
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Advanced Chart */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(152,28%,40%)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="hsl(152,28%,40%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,89%)" strokeOpacity={0.5} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(220,8%,50%)" }} interval={9} />
            <YAxis yAxisId="price" hide domain={["dataMin - 5", "dataMax + 5"]} />
            <YAxis yAxisId="volume" hide orientation="right" domain={[0, "dataMax + 50"]} />
            <Tooltip content={<CustomTooltip />} />

            {/* Event markers */}
            {eventMarkers.map((e) => (
              <ReferenceLine key={e.day} x={`Day ${e.day}`} yAxisId="price" stroke="hsl(220,8%,70%)" strokeDasharray="2 4" label={{ value: e.label, position: "top", fontSize: 9, fill: "hsl(220,8%,50%)" }} />
            ))}

            {activeIndicators.has("Volume") && (
              <Bar yAxisId="volume" dataKey="volume" fill="hsl(220,8%,85%)" opacity={0.4} />
            )}

            <Area yAxisId="price" type="monotone" dataKey="price" stroke="hsl(152,28%,40%)" strokeWidth={1.5} fill="url(#priceGrad)" />

            {activeIndicators.has("SMA20") && <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="hsl(215,60%,55%)" strokeWidth={1} dot={false} />}
            {activeIndicators.has("SMA50") && <Line yAxisId="price" type="monotone" dataKey="sma50" stroke="hsl(280,40%,55%)" strokeWidth={1} dot={false} />}
            {activeIndicators.has("EMA12") && <Line yAxisId="price" type="monotone" dataKey="ema12" stroke="hsl(30,70%,50%)" strokeWidth={1} dot={false} />}
            {activeIndicators.has("EMA26") && <Line yAxisId="price" type="monotone" dataKey="ema26" stroke="hsl(350,50%,50%)" strokeWidth={1} dot={false} />}
          </ComposedChart>
        </ResponsiveContainer>

        {/* RSI / MACD mini charts */}
        {(activeIndicators.has("RSI14") || activeIndicators.has("MACD")) && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {activeIndicators.has("RSI14") && (
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-[10px] font-medium text-muted-foreground">RSI (14)</p>
                <ResponsiveContainer width="100%" height={60}>
                  <ComposedChart data={chartData}>
                    <Line type="monotone" dataKey="rsi" stroke="hsl(215,60%,55%)" strokeWidth={1} dot={false} />
                    <ReferenceLine y={70} stroke="hsl(0,32%,52%)" strokeDasharray="2 2" />
                    <ReferenceLine y={30} stroke="hsl(152,28%,40%)" strokeDasharray="2 2" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            {activeIndicators.has("MACD") && (
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-[10px] font-medium text-muted-foreground">MACD</p>
                <ResponsiveContainer width="100%" height={60}>
                  <ComposedChart data={chartData}>
                    <Bar dataKey="macd" fill="hsl(220,8%,75%)" />
                    <ReferenceLine y={0} stroke="hsl(220,8%,60%)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Key Stats */}
      <motion.div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {[
          { label: "Open", value: `$${(currentPrice - 1.2).toFixed(2)}` },
          { label: "High", value: `$${(currentPrice + 2.3).toFixed(2)}` },
          { label: "Low", value: `$${(currentPrice - 3.1).toFixed(2)}` },
          { label: "Mkt Cap", value: "2.87T" },
          { label: "P/E", value: "31.2" },
          { label: "52W High", value: `$${(currentPrice + 40).toFixed(2)}` },
          { label: "52W Low", value: `$${(currentPrice - 60).toFixed(2)}` },
          { label: "Avg Vol", value: "52.4M" },
        ].map((s) => (
          <div key={s.label} className="glass-card px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-xs font-semibold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* AI Analysis */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles size={14} className="text-muted-foreground" />
          <span>Maven Analysis</span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Based on your tech concentration ({symbol} would increase it to 72%) and average 3-week hold time, this stock aligns with your short-term momentum exposure pattern. RSI shows moderate levels suggesting neutral entry conditions.
        </p>
      </motion.div>

      {/* Order Ticket */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-sm font-medium">Simulated Order</h3>
        <div className="mt-3 flex gap-2">
          <button onClick={() => setOrderType("market")} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${orderType === "market" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>
            Market
          </button>
          <button onClick={() => setOrderType("limit")} className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${orderType === "limit" ? "bg-foreground text-primary-foreground" : "glass-card"}`}>
            Limit
          </button>
        </div>
        {orderType === "limit" && (
          <div className="glass-input mt-3 px-3 py-2">
            <label className="text-[10px] text-muted-foreground">Limit Price</label>
            <input type="number" defaultValue={currentPrice.toFixed(2)} className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none" />
          </div>
        )}
        <div className="glass-input mt-2 px-3 py-2">
          <label className="text-[10px] text-muted-foreground">Shares</label>
          <input type="number" defaultValue={1} className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]">Buy (Paper)</button>
          <button className="glass-card py-3 text-sm font-medium transition-transform active:scale-[0.98]">Sell (Paper)</button>
        </div>
      </motion.div>
    </div>
  );
};

export default StockDetail;