import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Hash, TrendingUp, Users, Search, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Room {
  id: string;
  type: string;
  name: string;
  slug: string;
  description: string | null;
  ticker: string | null;
  member_count: number;
}

const BrowseRooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .neq("type", "dm")
        .order("member_count", { ascending: false })
        .limit(100);
      if (data) setRooms(data as Room[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = search
    ? rooms.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.ticker || "").toLowerCase().includes(search.toLowerCase())
      )
    : rooms;

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/community")} className="rounded-lg p-1.5 hover:bg-secondary lg:hidden">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse Rooms</h1>
            <p className="mt-1 text-sm text-muted-foreground">Stock & hashtag discussion rooms</p>
          </div>
        </div>
      </motion.div>

      <motion.div className="mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
        <div className="glass-card flex items-center gap-2 px-4 py-2.5">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Hash size={28} className="mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{search ? "No matching rooms" : "No rooms yet"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Search a ticker on the community page to create one automatically.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-1.5">
          {filtered.map((room, i) => (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * i }}
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Users size={12} />
                  {room.member_count}
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseRooms;
