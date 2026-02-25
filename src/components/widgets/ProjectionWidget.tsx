import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const generateProjection = () => {
  const data = [];
  let value = 12438;
  for (let i = 0; i <= 120; i++) { // 10 years monthly
    data.push({ month: i, value: Math.round(value) });
    value = value * 1.007 + 500; // ~8.4% annual + $500/mo
  }
  return data;
};

const projData = generateProjection();
const finalValue = projData[projData.length - 1].value;

const ProjectionWidget = () => (
  <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
    <h3 className="text-xs font-medium text-muted-foreground">Long-Term Projection</h3>
    <p className="mt-1 text-[11px] text-muted-foreground">If you invest $500/month for 10 years</p>
    <p className="mt-1 text-lg font-semibold">${finalValue.toLocaleString()}</p>
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={projData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(152,28%,40%)" stopOpacity={0.15} />
            <stop offset="100%" stopColor="hsl(152,28%,40%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <XAxis hide dataKey="month" />
        <Tooltip
          contentStyle={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "12px", fontSize: "11px" }}
          formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
          labelFormatter={(l) => `Month ${l}`}
        />
        <Area type="monotone" dataKey="value" stroke="hsl(152,28%,40%)" strokeWidth={1.5} fill="url(#projGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

export default ProjectionWidget;
