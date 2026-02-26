import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Hash, TrendingUp, MessageCircle, Users, Search, Plus, Flame, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface Room {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string | null;
  ticker: string | null;
  member_count: number;
}

interface StockResult {
  symbol: string;
  name: string;
  exchange: string;
}

const TRENDING_TICKERS = [
  { symbol: "NVDA", change: "+4.2%", positive: true },
  { symbol: "AAPL", change: "-1.1%", positive: false },
  { symbol: "TSLA", change: "+2.8%", positive: true },
  { symbol: "GME", change: "+12.5%", positive: true },
  { symbol: "AMC", change: "+6.3%", positive: true },
  { symbol: "PLTR", change: "+3.1%", positive: true },
];

const SUGGESTED_ROOMS = [
  { name: "#gold", slug: "gold", type: "hashtag", members: 2341, description: "Gold & precious metals discussion" },
  { name: "#uranium", slug: "uranium", type: "hashtag", members: 892, description: "Nuclear energy & uranium plays" },
  { name: "$NVDA", slug: "NVDA", type: "stock", members: 5420, description: "NVIDIA Corporation" },
  { name: "$TSLA", slug: "TSLA", type: "stock", members: 4102, description: "Tesla, Inc." },
  { name: "#smallcaps", slug: "smallcaps", type: "hashtag", members: 1560, description: "Small cap discoveries" },
  { name: "#options", slug: "options", type: "hashtag", members: 3200, description: "Options strategies & flow" },
];

const CommunityFeed = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stockResults, setStockResults] = useState<StockResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .neq("type", "dm")
        .order("member_count", { ascending: false })
        .limit(20);
      if (data) setRooms(data as Room[]);
    };
    fetchRooms();
  }, []);

  // Debounced stock search
  useEffect(() => {
    if (!search.trim() || search.length < 1) {
      setStockResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("stock-search", {
          body: { query: search },
        });
        if (data?.results) {
          setStockResults(data.results.slice(0, 8));
        }
      } catch (e) {
        console.error("Stock search failed:", e);
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const filteredSuggested = search
    ? SUGGESTED_ROOMS.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : SUGGESTED_ROOMS;

  const hasSearchResults = search.trim().length > 0 && (stockResults.length > 0 || filteredSuggested.length > 0);

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile ? `Welcome, ${profile.display_name || profile.username}` : "Real-time investor discussion"}
            </p>
          </div>
          <button
            onClick={() => navigate("/community/create-room")}
            className="flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-primary-foreground transition-transform active:scale-95"
          >
            <Plus size={14} />
            New Room
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div className="mt-4 relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <div className="glass-card flex items-center gap-2 px-4 py-2.5">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any ticker to open its room..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {searching && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
        </div>

        {/* Live stock search results */}
        {search.trim().length > 0 && stockResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 top-full z-20 mt-1 glass-card-strong overflow-hidden"
          >
            <p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Stocks — tap to enter room
            </p>
            {stockResults.map((s) => (
              <button
                key={s.symbol}
                onClick={() => {
                  setSearch("");
                  setStockResults([]);
                  navigate(`/community/room/${s.symbol}`);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <TrendingUp size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">${s.symbol}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.name} · {s.exchange}</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </button>
            ))}

            {/* Direct ticker entry */}
            {search.match(/^[A-Za-z]{1,5}$/) && (
              <button
                onClick={() => {
                  const ticker = search.toUpperCase();
                  setSearch("");
                  setStockResults([]);
                  navigate(`/community/room/${ticker}`);
                }}
                className="flex w-full items-center gap-3 border-t border-border/30 px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
                  <ArrowRight size={14} />
                </div>
                <p className="text-sm">
                  Go to <span className="font-semibold">${search.toUpperCase()}</span> room
                </p>
              </button>
            )}
          </motion.div>
        )}

        {/* Direct entry when no results but valid ticker format */}
        {search.trim().length > 0 && stockResults.length === 0 && !searching && search.match(/^[A-Za-z]{1,5}$/) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 top-full z-20 mt-1 glass-card-strong overflow-hidden"
          >
            <button
              onClick={() => {
                const ticker = search.toUpperCase();
                setSearch("");
                navigate(`/community/room/${ticker}`);
              }}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Open <span className="font-semibold">${search.toUpperCase()}</span> room
                </p>
                <p className="text-[11px] text-muted-foreground">Every stock has a room — be the first to chat</p>
              </div>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Trending Tickers Strip */}
      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
        <div className="flex items-center gap-2 mb-2">
          <Flame size={14} className="text-loss" />
          <span className="text-xs font-medium text-muted-foreground">Trending Now</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TRENDING_TICKERS.map((t) => (
            <button
              key={t.symbol}
              onClick={() => navigate(`/community/room/${t.symbol}`)}
              className="glass-card flex shrink-0 items-center gap-2 px-3 py-2 transition-colors hover:bg-secondary"
            >
              <span className="text-xs font-semibold">${t.symbol}</span>
              <span className={`text-[11px] font-medium ${t.positive ? "text-gain" : "text-loss"}`}>
                {t.change}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div className="mt-4 glass-card p-3 flex items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.09 }}>
        <TrendingUp size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium">Every stock has a room</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Search any ticker above to enter its discussion room — even if no one's there yet. Rooms are created automatically.
          </p>
        </div>
      </motion.div>

      {/* Quick Nav */}
      <motion.div className="mt-4 grid grid-cols-2 gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <button
          onClick={() => navigate("/community/rooms")}
          className="glass-card flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <Hash size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">Browse Rooms</p>
            <p className="text-[11px] text-muted-foreground">Stock & hashtag rooms</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/community/dms")}
          className="glass-card flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">Messages</p>
            <p className="text-[11px] text-muted-foreground">Direct conversations</p>
          </div>
        </button>
      </motion.div>

      {/* Suggested / Popular Rooms */}
      <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Popular Rooms</h2>
        <div className="space-y-1.5">
          {filteredSuggested.map((room) => (
            <button
              key={room.slug}
              onClick={() => navigate(`/community/room/${room.slug}`)}
              className="glass-card flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                  {room.type === "stock" ? <TrendingUp size={16} /> : <Hash size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="text-[11px] text-muted-foreground">{room.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users size={12} />
                  {room.members.toLocaleString()}
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Rooms from DB */}
      {rooms.length > 0 && (
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Your Rooms</h2>
          <div className="space-y-1.5">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/community/room/${room.slug}`)}
                className="glass-card flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                    {room.type === "stock" ? <TrendingUp size={16} /> : <Hash size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-[11px] text-muted-foreground">{room.description || room.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users size={12} />
                  {room.member_count}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CommunityFeed;
