import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Lock, Users, Hash, Eye, EyeOff, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "monee-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const JoinRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    password_hash: string | null;
    member_count: number;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [joining, setJoining] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      if (!code) { setNotFound(true); setLoading(false); return; }

      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, slug, description, password_hash, member_count")
        .eq("join_code", code.toUpperCase())
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setRoom(data);
      }
      setLoading(false);
    };
    loadRoom();
  }, [code]);

  const handleJoin = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!room) return;

    // Check password if needed
    if (room.password_hash) {
      const hashed = await hashPassword(password);
      if (hashed !== room.password_hash) {
        toast.error("Incorrect password");
        return;
      }
    }

    setJoining(true);

    // Check if already a member
    const { data: existing } = await supabase
      .from("room_members")
      .select("id")
      .eq("room_id", room.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      navigate(`/community/room/${room.slug}`);
      return;
    }

    const { error } = await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      role: "member",
    });

    if (error) {
      toast.error("Failed to join room");
      setJoining(false);
      return;
    }

    // Increment member count (best effort)
    try {
      await supabase.from("rooms").update({ member_count: (room.member_count || 0) + 1 }).eq("id", room.id);
    } catch {}

    toast.success(`Joined ${room.name}!`);
    navigate(`/community/room/${room.slug}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="px-5 pt-14 pb-6 lg:pt-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-4 rounded-2xl bg-secondary p-4">
          <Hash size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Room Not Found</h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          This invite link or code is invalid or has expired.
        </p>
        <button
          onClick={() => navigate("/community")}
          className="mt-5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Browse Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-5 text-center"
      >
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-secondary">
          <Hash size={24} className="text-foreground" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">{room?.name}</h2>
          {room?.description && (
            <p className="mt-1.5 text-sm text-muted-foreground">{room.description}</p>
          )}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Users size={12} />
            {room?.member_count || 0} member{(room?.member_count || 0) !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Password field */}
        {room?.password_hash && (
          <div className="space-y-2 text-left">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock size={12} />
              This room requires a password
            </label>
            <div className="glass-card flex items-center gap-3 px-4 py-3">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        )}

        {user ? (
          <button
            onClick={handleJoin}
            disabled={joining || (!!room?.password_hash && !password)}
            className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {joining ? "Joining…" : "Join Room"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <Shield size={12} />
              Sign in to join this room
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-primary-foreground"
            >
              Sign In
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JoinRoom;
