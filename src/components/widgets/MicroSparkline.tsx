import { memo, useMemo } from "react";

interface Props {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

const MicroSparkline = memo(({ data, width = 80, height = 32, positive = true }: Props) => {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    
    return data
      .map((v, i) => {
        const x = i * stepX;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data, width, height]);

  const gradientId = useMemo(() => `spark-${Math.random().toString(36).slice(2, 8)}`, []);

  const fillPath = useMemo(() => {
    if (data.length < 2) return "";
    return `${path} L${width},${height} L0,${height} Z`;
  }, [path, width, height, data.length]);

  if (data.length < 2) return null;

  const color = positive ? "hsl(var(--gain))" : "hsl(var(--loss))";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

MicroSparkline.displayName = "MicroSparkline";
export default MicroSparkline;
