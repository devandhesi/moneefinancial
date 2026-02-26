import { Flame, Loader2 } from "lucide-react";
import { useTickerHeat, STAGE_CONFIG } from "@/hooks/use-heat-engine";

interface Props {
  symbol: string;
  compact?: boolean;
}

const HeatBadgeInline = ({ symbol, compact = false }: Props) => {
  const { data: heat, isLoading } = useTickerHeat(symbol);

  if (isLoading) {
    return compact ? null : <Loader2 size={12} className="animate-spin text-muted-foreground" />;
  }

  if (!heat || heat.heat_score < 25) return null;

  const config = STAGE_CONFIG[heat.stage] || STAGE_CONFIG.cold;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold ${config.bg} ${config.color}`}>
        <Flame size={8} />
        {heat.heat_score}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium ${config.bg} ${config.color}`}>
      <Flame size={11} />
      <span className="font-bold tabular-nums">{heat.heat_score}</span>
      <span className="opacity-80">{config.label}</span>
    </div>
  );
};

export default HeatBadgeInline;
