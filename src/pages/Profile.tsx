import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, MessageSquare, Clock, Activity, PieChart, Zap, ChevronRight, Settings, LogOut, Eye, EyeOff, ArrowRight, Loader2, Pencil, Camera, Check, X, KeyRound, AtSign } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSimAccount, useSimCash, useSimPositions } from "@/hooks/use-sim-portfolio";

const behaviorStats = [
  { icon: Clock, label: "Avg Hold Time", value: "3.2 weeks" },
  { icon: Activity, label: "Trading Frequency", value: "4.1 trades/mo" },
  { icon: PieChart, label: "Sector Bias", value: "Technology (68%)" },
  { icon: Zap, label: "Volatility Response", value: "Moderate" },
];

const menuItems = [
  { icon: Shield, label: "Risk Profile", detail: "Moderate Growth" },
  { icon: MessageSquare, label: "Maven Tone", detail: "Conversational" },
];

const timelineData = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  trades: Math.floor(Math.random() * 6 + 1),
  volatility: +(10 + Math.random() * 25).toFixed(1),
}));
timelineData.forEach((d) => {
  if (d.volatility > 25) d.trades = Math.min(d.trades + 3, 10);
});

// Sector colors for the portfolio breakdown
const SECTOR_COLORS: Record<string, string> = {
  Technology: "hsl(215, 60%, 55%)",
  Consumer: "hsl(30, 70%, 50%)",
  Finance: "hsl(152, 28%, 40%)",
  Healthcare: "hsl(280, 40%, 55%)",
  Energy: "hsl(45, 75%, 50%)",
  Industrials: "hsl(190, 40%, 45%)",
  "Real Estate": "hsl(340, 45%, 50%)",
  Utilities: "hsl(160, 35%, 50%)",
  Materials: "hsl(25, 50%, 45%)",
  Cash: "hsl(220, 8%, 70%)",
  Other: "hsl(220, 8%, 60%)",
};

// Simple ticker-to-sector mapping
const TICKER_SECTOR: Record<string, string> = {
  AAPL: "Technology", MSFT: "Technology", GOOG: "Technology", GOOGL: "Technology", AMZN: "Technology",
  META: "Technology", NVDA: "Technology", TSLA: "Technology", AMD: "Technology", INTC: "Technology",
  CRM: "Technology", ORCL: "Technology", ADBE: "Technology", NFLX: "Technology", AVGO: "Technology",
  QCOM: "Technology", MU: "Technology", UBER: "Technology", SHOP: "Technology", SQ: "Technology",
  PYPL: "Technology", PLTR: "Technology", SNAP: "Technology", COIN: "Technology", RBLX: "Technology",
  JPM: "Finance", BAC: "Finance", GS: "Finance", MS: "Finance", WFC: "Finance", C: "Finance",
  V: "Finance", MA: "Finance", AXP: "Finance", BLK: "Finance", SCHW: "Finance",
  JNJ: "Healthcare", PFE: "Healthcare", UNH: "Healthcare", MRK: "Healthcare", ABBV: "Healthcare",
  LLY: "Healthcare", TMO: "Healthcare", ABT: "Healthcare", MDT: "Healthcare", BMY: "Healthcare",
  XOM: "Energy", CVX: "Energy", COP: "Energy", SLB: "Energy", EOG: "Energy", OXY: "Energy",
  PG: "Consumer", KO: "Consumer", PEP: "Consumer", WMT: "Consumer", COST: "Consumer",
  NKE: "Consumer", MCD: "Consumer", SBUX: "Consumer", TGT: "Consumer", HD: "Consumer",
  DIS: "Consumer", CMCSA: "Consumer", T: "Consumer", VZ: "Consumer",
  CAT: "Industrials", BA: "Industrials", HON: "Industrials", UPS: "Industrials", DE: "Industrials",
  GE: "Industrials", RTX: "Industrials", LMT: "Industrials",
  SPY: "Other", QQQ: "Other", DIA: "Other", IWM: "Other", VTI: "Other", VOO: "Other",
  VT: "Other", BND: "Other", XLV: "Healthcare", XLF: "Finance", XLE: "Energy", XLK: "Technology",
  GME: "Consumer", AMC: "Consumer", RIVN: "Consumer", LCID: "Consumer",
  BTC: "Other", ETH: "Other", SOL: "Other", DOGE: "Other",
  GLD: "Other", SLV: "Other", USO: "Other",
};

const RiskBar = ({ title, items }: { title: string; items: { label: string; pct: number }[] }) => (
  <div>
    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</h4>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs">
            <span>{item.label}</span>
            <span className="font-medium">{item.pct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div className="h-full rounded-full bg-foreground/60" initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AuthForm = () => {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (mode === "forgot") {
      setLoading(true);
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email for a password reset link");
        setMode("login");
      }
      setLoading(false);
      return;
    }

    if (!password.trim()) return;
    if (mode === "signup" && (!username.trim() || !fullName.trim())) return;
    setLoading(true);
    const result = mode === "signup"
      ? await signUp(email, password, username, fullName)
      : await signIn(email, password);
    if (result.error) {
      toast.error(result.error);
    } else if (mode === "signup") {
      toast.success("Check your email to confirm your account");
    }
    setLoading(false);
  };

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password";
  const subtitle = mode === "login" ? "Sign in to continue" : mode === "signup" ? "Join monee today" : "Enter your email to receive a reset link";

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to access your profile</p>
      </motion.div>

      <motion.div className="mt-8 mx-auto max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-6">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <User size={28} className="text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-center text-lg font-semibold mb-1">{title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-5">{subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground"
                  maxLength={60}
                  required
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground"
                  maxLength={30}
                  required
                />
              </motion.div>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground"
              required
            />
            {mode !== "forgot" && (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setMode("forgot")} className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[11px] text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <GoogleSignInButton />
            </>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "forgot" ? (
              <button onClick={() => setMode("login")} className="font-medium text-foreground underline-offset-2 hover:underline">
                Back to sign in
              </button>
            ) : (
              <>
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-medium text-foreground underline-offset-2 hover:underline">
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Profile = () => {
  const { data: simAccount } = useSimAccount();
  const { data: cash } = useSimCash(simAccount?.id);
  const { data: positions } = useSimPositions(simAccount?.id);
  const [snapshotIdx, setSnapshotIdx] = useState(0);
  const [riskExpanded, setRiskExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, profile, signOut, loading, refreshProfile } = useAuth();

  if (loading) return null;
  if (!user) return <AuthForm />;

  // ── Compute portfolio data from real holdings ──
  const cashBalance = cash?.available ?? 0;
  const investedValue = (positions || []).reduce((sum, p) => sum + (p.market_value ?? (p.avg_cost ?? 0) * p.quantity), 0);
  const totalPortfolioValue = cashBalance + investedValue;

  // Sector breakdown from positions
  const sectorMap: Record<string, number> = {};
  (positions || []).forEach((p) => {
    const sector = TICKER_SECTOR[p.ticker] || "Other";
    sectorMap[sector] = (sectorMap[sector] || 0) + (p.market_value ?? (p.avg_cost ?? 0) * p.quantity);
  });
  if (cashBalance > 0) sectorMap["Cash"] = cashBalance;

  const sectorData = Object.entries(sectorMap)
    .map(([label, val]) => ({
      label,
      pct: totalPortfolioValue > 0 ? Math.round((val / totalPortfolioValue) * 100) : 0,
      color: SECTOR_COLORS[label] || SECTOR_COLORS["Other"],
    }))
    .sort((a, b) => b.pct - a.pct);

  // Ensure pcts add up to 100
  if (sectorData.length > 0) {
    const sum = sectorData.reduce((s, d) => s + d.pct, 0);
    if (sum !== 100 && sum > 0) sectorData[0].pct += 100 - sum;
  }

  const cashPct = totalPortfolioValue > 0 ? Math.round((cashBalance / totalPortfolioValue) * 100) : 0;
  const equityPct = 100 - cashPct;

  const assetTypes = [
    { label: "Equities", pct: equityPct },
    { label: "Cash", pct: cashPct },
  ];

  const holdingsCount = (positions || []).length;
  const hasPortfolio = totalPortfolioValue > 0 || holdingsCount > 0;

  const displayName = profile?.display_name || profile?.username || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const startEditing = () => {
    setEditName(profile?.display_name || "");
    setEditBio(profile?.bio || "");
    setEditUsername(profile?.username || "");
    setEditing(true);
    setChangingPassword(false);
  };

  const saveProfile = async () => {
    if (!profile) return;
    const trimmedUsername = editUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!trimmedUsername || trimmedUsername.length < 3) {
      toast.error("Username must be at least 3 characters (letters, numbers, underscores)");
      return;
    }
    // Check username uniqueness if changed
    if (trimmedUsername !== profile.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("username", trimmedUsername)
        .neq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        toast.error("Username is already taken");
        return;
      }
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: editName.trim() || null, bio: editBio.trim() || null, username: trimmedUsername })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Upload failed");
      setUploadingAvatar(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    await refreshProfile();
    toast.success("Avatar updated");
    setUploadingAvatar(false);
  };

  return (
    <div className="px-5 pt-14 pb-6 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your behavioral intelligence</p>
      </motion.div>

      {/* User Card */}
      <motion.div className="glass-card mt-5 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-14 w-14 rounded-2xl">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={displayName} className="rounded-2xl object-cover" />}
              <AvatarFallback className="rounded-2xl bg-secondary text-sm font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-primary-foreground shadow-md transition-transform hover:scale-110"
            >
              {uploadingAvatar ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <AtSign size={11} />{profile?.username || "username"}
            </p>
            {profile?.bio && !editing && <p className="mt-0.5 text-[11px] text-muted-foreground/70 truncate">{profile.bio}</p>}
          </div>
          {!editing && !changingPassword && (
            <button onClick={startEditing} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Pencil size={16} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <input value={editUsername} onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="username" maxLength={30} className="w-full rounded-xl border border-border/50 bg-secondary pl-8 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Letters, numbers, underscores only. Min 3 chars.</p>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Display Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your display name" maxLength={60} className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Bio</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={200} rows={3} className="w-full resize-none rounded-xl border border-border/50 bg-secondary px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground" />
                  <p className="mt-1 text-right text-[10px] text-muted-foreground">{editBio.length}/200</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/50 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={saveProfile} disabled={saving} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Save</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {changingPassword && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                <div className="relative">
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">New Password</label>
                  <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-2.5 pr-10 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 text-muted-foreground">
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted-foreground">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30 placeholder:text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/50 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary">
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={handleChangePassword} disabled={savingPassword} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground py-2.5 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50">
                    {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <><KeyRound size={14} /> Update</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Password button - below card content */}
        {!editing && !changingPassword && (
          <div className="mt-3 border-t border-border/30 pt-3">
            <button
              onClick={() => { setChangingPassword(true); setEditing(false); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <KeyRound size={15} />
              <span className="font-medium">Change Password</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Pattern Summary */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <p className="text-xs font-medium text-muted-foreground">Pattern Detected</p>
        <p className="mt-1 text-sm font-semibold">Momentum Bias</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          You tend to enter positions after 5+ day uptrends and exit within 2–4 weeks. This pattern is consistent with short-term momentum trading.
        </p>
      </motion.div>

      {/* Behavioral Pattern Timeline */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <h3 className="mb-1 text-xs font-medium text-muted-foreground">Behavioral Pattern Timeline</h3>
        <p className="mb-3 text-[11px] text-muted-foreground">Your trading intensity increases during high volatility periods.</p>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={timelineData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,89%)" strokeOpacity={0.5} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(220,8%,50%)" }} interval={3} />
            <YAxis yAxisId="trades" hide />
            <YAxis yAxisId="vol" hide orientation="right" />
            <Tooltip
              contentStyle={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "12px", fontSize: "11px" }}
            />
            <Bar yAxisId="trades" dataKey="trades" fill="hsl(228,12%,22%)" opacity={0.15} name="Trades" />
            <Line yAxisId="vol" type="monotone" dataKey="volatility" stroke="hsl(0,32%,52%)" strokeWidth={1.5} dot={false} name="VIX" />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-foreground/15" /> Trades</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-loss" /> Market Volatility</span>
        </div>
      </motion.div>

      {/* Portfolio Overview - Real Data */}
      <motion.div className="glass-card mt-4 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="mb-3 text-xs font-medium text-muted-foreground">Portfolio Overview</h3>
        {!hasPortfolio ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No holdings yet. Start paper trading to see your portfolio here.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Total Value</span>
              <span className="text-lg font-semibold">${totalPortfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground">Invested</p>
                <p className="text-sm font-semibold">${investedValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-[10px] text-muted-foreground">Cash</p>
                <p className="text-sm font-semibold">${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{holdingsCount} position{holdingsCount !== 1 ? "s" : ""} held</div>
          </>
        )}
      </motion.div>

      {/* Holdings List */}
      {(positions || []).length > 0 && (
        <motion.div className="glass-card mt-3 p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
          <h3 className="mb-3 text-xs font-medium text-muted-foreground">Holdings</h3>
          <div className="space-y-2">
            {(positions || []).map((p) => {
              const value = p.market_value ?? (p.avg_cost ?? 0) * p.quantity;
              const pnl = p.unrealized_pnl ?? 0;
              const pnlPct = p.avg_cost && p.avg_cost > 0 ? ((value - p.avg_cost * p.quantity) / (p.avg_cost * p.quantity)) * 100 : 0;
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{p.ticker}</p>
                    <p className="text-[11px] text-muted-foreground">{p.quantity} share{p.quantity !== 1 ? "s" : ""} · avg ${(p.avg_cost ?? 0).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className={`text-[11px] font-medium ${pnl >= 0 ? "text-gain" : "text-loss"}`}>
                      {pnl >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Sector Breakdown - Real Data */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <button onClick={() => setRiskExpanded(!riskExpanded)} className="flex w-full items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Portfolio Breakdown</h2>
          <span className="text-[10px] text-muted-foreground">{riskExpanded ? "Collapse" : "Expand"}</span>
        </button>

        {sectorData.length > 0 ? (
          <div className="glass-card p-4">
            <h3 className="mb-3 text-xs font-medium text-muted-foreground">Sector Breakdown</h3>
            <div className="flex h-7 overflow-hidden rounded-lg">
              {sectorData.map((s) => (
                <motion.div
                  key={s.label}
                  style={{ background: s.color }}
                  className="flex items-center justify-center text-[9px] font-medium text-primary-foreground transition-all hover:opacity-80"
                  title={`${s.label}: ${s.pct}%`}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8 }}
                >
                  {s.pct > 8 && `${s.pct}%`}
                </motion.div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
              {sectorData.map((s) => (
                <span key={s.label} className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label} ({s.pct}%)
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground text-center py-2">No positions to analyze</p>
          </div>
        )}

        {riskExpanded && sectorData.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3">
            <div className="glass-card p-4">
              <RiskBar title="Asset Allocation" items={assetTypes} />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Settings</h2>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-card flex w-full items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium outline-none text-muted-foreground"
                    defaultValue={item.detail}
                    onChange={() => toast.success(`${item.label} updated`)}
                  >
                    {item.label === "Risk Profile" ? (
                      <>
                        <option>Conservative</option>
                        <option>Moderate Growth</option>
                        <option>Aggressive</option>
                      </>
                    ) : (
                      <>
                        <option>Professional</option>
                        <option>Conversational</option>
                        <option>Detailed</option>
                        <option>Brief</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Behavioral Report */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Behavioral Report</h2>
        <div className="grid grid-cols-2 gap-2">
          {behaviorStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card p-4">
                <Icon size={14} className="text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 text-sm font-semibold">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Sign Out */}
      {user && (
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
          <button
            onClick={() => signOut()}
            className="glass-card flex w-full items-center justify-center gap-2 p-4 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div className="mt-4 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <p className="text-[11px] text-muted-foreground">All data is from paper trading. Behavioral analysis is educational only.</p>
      </motion.div>
    </div>
  );
};

export default Profile;
