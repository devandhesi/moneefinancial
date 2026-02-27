import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart3, ExternalLink, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

// Detect URLs in text
const URL_REGEX = /(https?:\/\/[^\s<]+)/g;

// Detect special content markers
const SPECIAL_REGEX = /\[(img|stock|chart|poll):(.+?)\]/;

interface RichMessageContentProps {
  content: string;
  className?: string;
}

// Poll embed component
function PollEmbed({ pollId }: { pollId: string }) {
  const { user } = useAuth();
  const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [myVote, setMyVote] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: p } = await supabase.from("chat_polls").select("question, options").eq("id", pollId).single();
      if (p) setPoll({ question: p.question, options: p.options as string[] });

      const { data: v } = await supabase.from("chat_poll_votes").select("option_index, user_id").eq("poll_id", pollId);
      if (v) {
        const counts: Record<number, number> = {};
        v.forEach((vote: any) => {
          counts[vote.option_index] = (counts[vote.option_index] || 0) + 1;
          if (vote.user_id === user?.id) setMyVote(vote.option_index);
        });
        setVotes(counts);
        setTotalVotes(v.length);
      }
    };
    load();
  }, [pollId, user]);

  const vote = async (idx: number) => {
    if (!user || myVote !== null) return;
    await supabase.from("chat_poll_votes").insert({ poll_id: pollId, user_id: user.id, option_index: idx });
    setMyVote(idx);
    setVotes((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));
    setTotalVotes((prev) => prev + 1);
  };

  if (!poll) return <div className="text-xs text-muted-foreground">Loading poll…</div>;

  return (
    <div className="rounded-xl bg-secondary/60 p-3 space-y-2 max-w-[280px]">
      <p className="text-xs font-semibold">{poll.question}</p>
      <div className="space-y-1.5">
        {poll.options.map((opt, i) => {
          const count = votes[i] || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const voted = myVote === i;
          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={myVote !== null}
              className={`relative w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors overflow-hidden ${
                voted ? "ring-1 ring-foreground/20" : "hover:bg-secondary"
              } ${myVote !== null ? "cursor-default" : ""}`}
            >
              {myVote !== null && (
                <div
                  className="absolute inset-y-0 left-0 bg-foreground/10 rounded-lg transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between">
                <span>{opt}</span>
                {myVote !== null && <span className="text-muted-foreground">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
    </div>
  );
}

// Stock embed component
function StockEmbed({ symbol }: { symbol: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/invest/${symbol}`)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary transition-colors"
    >
      <TrendingUp size={12} className="text-muted-foreground" />
      ${symbol}
    </button>
  );
}

// Chart embed component
function ChartEmbed({ symbol }: { symbol: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/invest/${symbol}`)}
      className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5 hover:bg-secondary transition-colors max-w-[260px]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
        <BarChart3 size={14} />
      </div>
      <div className="text-left">
        <p className="text-xs font-semibold">${symbol} Chart</p>
        <p className="text-[10px] text-muted-foreground">Tap to view full chart</p>
      </div>
    </button>
  );
}

// Image embed
function ImageEmbed({ url }: { url: string }) {
  return (
    <img
      src={url}
      alt="Shared image"
      className="max-w-[260px] max-h-[200px] rounded-xl object-cover cursor-pointer"
      onClick={() => window.open(url, "_blank")}
    />
  );
}

// Bookmark-style link
function LinkBookmark({ url }: { url: string }) {
  let hostname = "";
  try { hostname = new URL(url).hostname.replace("www.", ""); } catch { hostname = url; }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 hover:bg-secondary transition-colors max-w-[280px] group"
    >
      <Bookmark size={14} className="text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate group-hover:underline">{hostname}</p>
        <p className="text-[10px] text-muted-foreground truncate">{url}</p>
      </div>
      <ExternalLink size={12} className="text-muted-foreground shrink-0" />
    </a>
  );
}

export default function RichMessageContent({ content, className = "" }: RichMessageContentProps) {
  const navigate = useNavigate();

  // Check for special content markers
  const specialMatch = content.match(SPECIAL_REGEX);
  if (specialMatch) {
    const [fullMatch, type, value] = specialMatch;
    const before = content.slice(0, specialMatch.index);
    const after = content.slice((specialMatch.index || 0) + fullMatch.length);

    return (
      <div className={className}>
        {before && <span>{before}</span>}
        {type === "img" && <ImageEmbed url={value} />}
        {type === "stock" && <StockEmbed symbol={value} />}
        {type === "chart" && <ChartEmbed symbol={value} />}
        {type === "poll" && <PollEmbed pollId={value} />}
        {after && <span>{after}</span>}
      </div>
    );
  }

  // Check for URLs → render as bookmarks
  const urlMatch = content.match(URL_REGEX);
  if (urlMatch) {
    const parts = content.split(URL_REGEX);
    return (
      <div className={`space-y-1.5 ${className}`}>
        {parts.map((part, i) => {
          if (URL_REGEX.test(part)) {
            return <LinkBookmark key={i} url={part} />;
          }
          // Handle $TICKER and #hashtag in plain text
          if (part.trim()) return <span key={i}>{renderInlineContent(part, navigate)}</span>;
          return null;
        })}
      </div>
    );
  }

  // Plain text with $TICKER and #hashtag support
  return <span className={className}>{renderInlineContent(content, navigate)}</span>;
}

function renderInlineContent(content: string, navigate: ReturnType<typeof useNavigate>) {
  const parts = content.split(/(\$[A-Z]{1,5}|#\w+|@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("$")) {
      return (
        <button key={i} onClick={() => navigate(`/invest/${part.slice(1)}`)} className="font-semibold text-accent-foreground hover:underline">
          {part}
        </button>
      );
    }
    if (part.startsWith("#")) {
      return (
        <button key={i} onClick={() => navigate(`/community/room/${part.slice(1)}`)} className="font-medium text-gain hover:underline">
          {part}
        </button>
      );
    }
    if (part.startsWith("@")) {
      return <span key={i} className="font-semibold text-foreground">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
