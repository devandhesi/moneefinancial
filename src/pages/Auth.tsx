import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2, Sparkles, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const Auth = () => {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">monee</h1>
          </motion.div>
          <motion.p
            className="mt-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {mode === "login" ? "Welcome back 👋" : "Start your investing journey"}
          </motion.p>
          {mode === "signup" && (
            <motion.div
              className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GraduationCap size={14} />
              <span>Free for students · Learn by doing</span>
            </motion.div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 placeholder:text-muted-foreground"
                maxLength={60}
                required
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 placeholder:text-muted-foreground"
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
            className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 placeholder:text-muted-foreground"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-foreground/30 focus:ring-2 focus:ring-foreground/5 placeholder:text-muted-foreground"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-medium text-primary-foreground transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[11px] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        <GoogleSignInButton />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <motion.p
          className="mt-4 text-center text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Sparkles size={9} />
          Paper trading · No real money involved
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
