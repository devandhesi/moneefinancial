import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const trendingStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 237.8, change: 2.4, data: [180, 190, 185, 210, 220, 238] },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 142.5, change: 5.1, data: [90, 100, 95, 120, 130, 142] },
  { symbol: "MSFT", name: "Microsoft", price: 445.2, change: -0.8, data: [440, 455, 448, 442, 450, 445] },
  { symbol: "AMZN", name: "Amazon.com", price: 198.6, change: 1.6, data: [170, 175, 180, 185, 190, 198] },
  { symbol: "GOOGL", name: "Alphabet", price: 176.9, change: 1.2, data: [160, 165, 158, 170, 172, 177] },
  { symbol: "META", name: "Meta Platforms", price: 588.3, change: -1.1, data: [600, 595, 580, 590, 585, 588] },
  { symbol: "TSLA", name: "Tesla Inc.", price: 276.0, change: -1.5, data: [290, 285, 280, 270, 278, 276] },
  { symbol: "JPM", name: "JPMorgan Chase", price: 242.1, change: 0.9, data: [230, 232, 236, 238, 240, 242] },
];

const sectors = ["All", "Technology", "Finance", "Healthcare", "Energy"];

const Invest = () => {
  const [activeSector, setActiveSector] = useState("All");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  return (
    <div className="px-5 pt-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Invest</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and simulate trades
        </p>
      </motion.div>

      {/* Sector filter */}
      <motion.div
        className="mt-4 flex gap-2 overflow-x-auto pb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSector(s)}
            className={`whitespace-nowrap rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
              activeSector === s
                ? "bg-foreground text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* Trending */}
      <motion.div
        className="mt-5 flex items-center gap-2 text-sm font-medium"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <TrendingUp size={14} />
        <span>Trending</span>
      </motion.div>

      {/* Stock List */}
      <div className="mt-3 space-y-2 pb-6">
        {trendingStocks.map((stock, i) => {
          const isPositive = stock.change >= 0;
          const sparkData = stock.data.map((v, idx) => ({ v, i: idx }));
          return (
            <motion.button
              key={stock.symbol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              onClick={() => setSelectedStock(stock.symbol)}
              className="glass-card flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xs font-bold">
                  {stock.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{stock.symbol}</p>
                  <p className="text-xs text-muted-foreground">{stock.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id={`spark-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={isPositive ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)"}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="100%"
                            stopColor={isPositive ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={isPositive ? "hsl(152,28%,40%)" : "hsl(0,32%,52%)"}
                        strokeWidth={1.2}
                        fill={`url(#spark-${stock.symbol})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${stock.price.toFixed(2)}</p>
                  <p className={`flex items-center gap-0.5 text-xs ${isPositive ? "text-gain" : "text-loss"}`}>
                    {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(stock.change)}%
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Stock Detail Modal Placeholder */}
      {selectedStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/10 backdrop-blur-sm"
          onClick={() => setSelectedStock(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card-strong w-full max-w-lg rounded-t-3xl p-6 pb-10"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedStock}</h2>
                <p className="text-sm text-muted-foreground">
                  {trendingStocks.find((s) => s.symbol === selectedStock)?.name}
                </p>
              </div>
              <button className="rounded-xl p-2 hover:bg-secondary">
                <Star size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="mt-4 text-3xl font-semibold">
              ${trendingStocks.find((s) => s.symbol === selectedStock)?.price.toFixed(2)}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]">
                Buy (Paper)
              </button>
              <button className="glass-card py-3 text-sm font-medium transition-transform active:scale-[0.98]">
                Simulate
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Paper trading only · Not a real transaction
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Invest;
