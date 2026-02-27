import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Hash, Lock, Link2, Copy, Check, Eye, EyeOff, Globe, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type RoomAccess = "public" | "invite_only" | "password";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "room";
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "monee-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const ACCESS_OPTIONS: { value: RoomAccess; icon: typeof Globe; label: string; desc: string }[] = [
  { value: "public", icon: Globe, label: "Public", desc: "Anyone can find and join" },
  { value: "invite_only", icon: Link2, label: "Invite Only", desc: "Join via link or code" },
  { value: "password", icon: Lock, label: "Password", desc: "Requires a password to enter" },
];

const CreateRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<RoomAccess>("public");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [joinCode] = useState(generateJoinCode);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const joinLink = `${window.location.origin}/join/${joinCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied!");
  };

  const handleCreate = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!name.trim()) { toast.error("Room name is required"); return; }
    if (name.trim().length > 50) { toast.error("Room name must be under 50 characters"); return; }
    if (description.length > 300) { toast.error("Description must be under 300 characters"); return; }
    if (access === "password" && password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    setCreating(true);

    const slug = slugify(name.trim()) + "-" + Date.now().toString(36);

    const roomData: Record<string, unknown> = {
      name: name.trim(),
      slug,
      description: description.trim() || null,
      type: "private" as const,
      created_by: user.id,
      is_invite_only: access === "invite_only" || access === "password",
      join_code: access !== "public" ? joinCode : null,
      password_hash: access === "password" ? await hashPassword(password) : null,
    };

    const { data: room, error } = await supabase
      .from("rooms")
      .insert(roomData as any)
      .select("id, slug")
      .single();

    if (error) {
      console.error("Create room error:", error);
      toast.error("Failed to create room");
      setCreating(false);
      return;
    }

    // Auto-join as owner
    await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      role: "owner",
    });

    toast.success("Room created!");
    navigate(`/community/room/${room.slug}`);
  };

  if (!user) {
    return (
      <div className="px-5 pt-14 pb-6 lg:pt-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Shield size={32} className="text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">Sign in to create a room</p>
        <button onClick={() => navigate("/auth")} className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Create Room</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Set up a new community space</p>
        </div>
      </motion.div>

      {/* Name */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Room Name</label>
        <div className="glass-card flex items-center gap-3 px-4 py-3">
          <Hash size={16} className="text-muted-foreground shrink-0" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 50))}
            placeholder="e.g. Options Trading, Crypto Talk"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">{name.length}/50</p>
      </motion.div>

      {/* Description */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
        <div className="glass-card px-4 py-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 300))}
            placeholder="What's this room about?"
            rows={3}
            className="w-full bg-transparent text-sm outline-none resize-none placeholder:text-muted-foreground/60"
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">{description.length}/300</p>
      </motion.div>

      {/* Access Type */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Access</label>
        <div className="space-y-2">
          {ACCESS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAccess(opt.value)}
              className={`glass-card w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                access === opt.value ? "ring-1 ring-foreground/20 bg-secondary/50" : "hover:bg-secondary/30"
              }`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                access === opt.value ? "bg-foreground text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                <opt.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 ${
                access === opt.value ? "border-foreground bg-foreground" : "border-muted-foreground/30"
              }`}>
                {access === opt.value && <div className="h-full w-full rounded-full flex items-center justify-center"><Check size={10} className="text-primary-foreground" /></div>}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Password input */}
      {access === "password" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Room Password</label>
          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Lock size={16} className="text-muted-foreground shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, 64))}
              placeholder="Enter a password"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </motion.div>
      )}

      {/* Join Code & Link (for non-public) */}
      {access !== "public" && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">Share Access</label>

          {/* Join Code */}
          <div className="glass-card flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Join Code</p>
              <p className="text-lg font-mono font-bold tracking-[0.25em]">{joinCode}</p>
            </div>
            <button onClick={copyCode} className="rounded-lg p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Copy size={14} />
            </button>
          </div>

          {/* Invite Link */}
          <div className="glass-card flex items-center gap-2 px-4 py-3">
            <Link2 size={14} className="text-muted-foreground shrink-0" />
            <p className="flex-1 text-xs text-muted-foreground truncate font-mono">{joinLink}</p>
            <button
              onClick={copyLink}
              className="rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Create Button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={handleCreate}
        disabled={creating || !name.trim()}
        className="w-full rounded-xl bg-foreground py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {creating ? "Creating…" : "Create Room"}
      </motion.button>
    </div>
  );
};

export default CreateRoom;
