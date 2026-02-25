import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const gradeColors: Record<string, string> = {
  A: "bg-gain-subtle text-gain",
  B: "bg-gain-subtle text-gain",
  C: "bg-secondary text-muted-foreground",
  D: "bg-loss-subtle text-loss",
  F: "bg-loss-subtle text-loss",
};

const transactions = [
  {
    id: 1, symbol: "AAPL", action: "Buy", shares: 5, price: 232.1, date: "Feb 20, 2026", grade: "A",
    gradeExplanation: { risk: "Aligned", concentration: "Low impact (+2%)", volatility: "Calm market", duration: "Long hold expected", flags: "None" },
  },
  {
    id: 2, symbol: "TSLA", action: "Sell", shares: 3, price: 280.5, date: "Feb 18, 2026", grade: "C",
    gradeExplanation: { risk: "Moderate", concentration: "Reduced tech by 4%", volatility: "High VIX", duration: "2.1 weeks (short)", flags: "Possible emotional exit" },
  },
  {
    id: 3, symbol: "NVDA", action: "Buy", shares: 10, price: 138.0, date: "Feb 15, 2026", grade: "B",
    gradeExplanation: { risk: "Aligned", concentration: "Increased tech (+5%)", volatility: "Normal", duration: "Holding", flags: "None" },
  },
  {
    id: 4, symbol: "META", action: "Sell", shares: 2, price: 592.0, date: "Feb 10, 2026", grade: "D",
    gradeExplanation: { risk: "Misaligned", concentration: "N/A", volatility: "Sold during dip", duration: "1.3 weeks", flags: "Panic sell pattern" },
  },
];

const Transactions = () => {
  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Behavioral graded trade history</p>
      </motion.div>

      <div className="mt-5 space-y-3">
        {transactions.map((t, i) => (
          <motion.div key={t.id} className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${gradeColors[t.grade]}`}>
                  {t.grade}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.action} {t.symbol}</p>
                  <p className="text-xs text-muted-foreground">{t.shares} shares @ ${t.price}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t.date}</p>
                <p className="text-sm font-medium">${(t.shares * t.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            {/* Grade Explanation */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border/50 pt-3 text-[11px] md:grid-cols-3">
              <div><span className="text-muted-foreground">Risk: </span><span className="font-medium">{t.gradeExplanation.risk}</span></div>
              <div><span className="text-muted-foreground">Concentration: </span><span className="font-medium">{t.gradeExplanation.concentration}</span></div>
              <div><span className="text-muted-foreground">Volatility: </span><span className="font-medium">{t.gradeExplanation.volatility}</span></div>
              <div><span className="text-muted-foreground">Duration: </span><span className="font-medium">{t.gradeExplanation.duration}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Flags: </span><span className="font-medium">{t.gradeExplanation.flags}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;