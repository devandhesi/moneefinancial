import MavenIcon from "./MavenIcon";
import { useNavigate } from "react-router-dom";

interface Props {
  symbol: string;
  context?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Small "Ask Maven" button that navigates to the chat page
 * with a pre-filled prompt about the given stock symbol.
 */
const AskMavenButton = ({ symbol, context, compact = false, className = "" }: Props) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = context
      ? `Tell me about ${symbol}. ${context}`
      : `Give me a full analysis on ${symbol} — price action, fundamentals, risks, and whether I should buy, hold, or sell right now.`;
    navigate("/chat", { state: { prefill: prompt } });
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary ${className}`}
        title={`Ask Maven about ${symbol}`}
      >
        <MavenIcon size={14} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary ${className}`}
      title={`Ask Maven about ${symbol}`}
    >
      <MavenIcon size={14} />
      Ask Maven
    </button>
  );
};

export default AskMavenButton;
