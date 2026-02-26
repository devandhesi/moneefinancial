import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  currentValue?: number;
}

const generateProjection = (startValue: number) => {
  const data = [];
  let value = startValue;
  for (let i = 0; i <= 120; i++) {
    data.push({ month: i, value: Math.round(value) });
    value = value * 1.007 + 500;
  }
  return data;
};

const ProjectionWidget = ({ currentValue }: Props) => {
  const startVal = currentValue && currentValue > 0 ? currentValue : 12438;
  const projData = generateProjection(startVal);
  const finalValue = projData[projData.length - 1].value;

  return (
    <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <div className="mb-3">
        <h3 className="text-sm font-medium">Long-Term Projection</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">If you invest $500/month for 10 years</p>
        <p className="mt-1.5 text-xl font-semibold">${finalValue.toLocaleString()}</p>
      </div>
      <ResponsiveContainer width="100%" height={100}>
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
};

export default ProjectionWidget;
