import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Eye, Lock, ShieldCheck, Scale, FileText, Users, Heart, Bug, MessageCircle, Code, Globe, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Transparency = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14 pb-10 lg:pt-8 max-w-3xl mx-auto">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="rounded-xl p-2 transition-colors hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transparency</h1>
          <p className="mt-1 text-sm text-muted-foreground">Our commitment to clarity and honesty</p>
        </div>
      </motion.div>

      {/* Beta Banner */}
      <motion.div
        className="mt-5 flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      >
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-foreground" />
        <div>
          <p className="text-xs font-semibold">Beta Transparency Report</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            Monee is in <span className="font-semibold text-foreground">public beta</span>. This page outlines our principles, known limitations, and what you should expect as an early user. We update this page as the platform evolves.
          </p>
        </div>
      </motion.div>

      {/* What We Are / Are Not */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Eye size={14} className="text-muted-foreground" /> What Monee Is — And Isn't
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-gain mb-2">✓ What We Are</p>
            <ul className="space-y-2">
              {[
                "An educational platform for learning to invest",
                "A paper trading simulator with realistic mechanics",
                "A behavioral analysis tool to improve trading habits",
                "An AI-assisted financial literacy coach",
                "A community for discussing markets and strategies",
                "A portfolio tracking and analytics dashboard",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <ShieldCheck size={10} className="mt-0.5 shrink-0 text-gain" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-loss mb-2">✗ What We Are Not</p>
            <ul className="space-y-2">
              {[
                "A registered investment advisor or broker-dealer",
                "A source of personalized financial advice",
                "A guaranteed profit or trading signal service",
                "A replacement for professional financial planning",
                "A custodian of real money or securities",
                "Affiliated with or endorsed by any exchange or regulator",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <AlertTriangle size={10} className="mt-0.5 shrink-0 text-loss" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Data Handling */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Lock size={14} className="text-muted-foreground" /> Data Handling & Privacy
        </h2>
        <div className="glass-card p-4 space-y-3">
          {[
            { title: "Authentication", desc: "Email/password authentication with encrypted sessions. Google OAuth available as an alternative. Passwords are never stored in plaintext — Supabase Auth handles bcrypt hashing." },
            { title: "Personal Data", desc: "We store your username, display name, avatar URL, and bio. Your email is stored by the authentication system. We do not sell or share personal data with third parties." },
            { title: "Trading Data", desc: "Paper trading positions, orders, and transactions are stored in your account. If you connect a real broker, we store encrypted access tokens — never your brokerage password. Position data is cached locally and refreshed from the broker API." },
            { title: "AI Conversations", desc: "Maven AI chat history is stored in your account for continuity. Conversations are sent to LLM providers (Google Gemini, OpenAI) for processing. We do not use your conversations to train models — check each provider's data usage policy for details." },
            { title: "Analytics", desc: "We track anonymized usage events (page views, feature usage) to improve the product. No personally identifiable information is included in analytics payloads." },
            { title: "Data Deletion", desc: "You can reset your paper trading data from Settings. Full account deletion is available upon request during the beta period — email support or use the feedback system." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2.5">
              <Lock size={11} className="mt-1 shrink-0 text-muted-foreground/50" />
              <div>
                <p className="text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Known Beta Limitations */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Bug size={14} className="text-muted-foreground" /> Known Beta Limitations
        </h2>
        <div className="glass-card p-4 space-y-2">
          {[
            { issue: "Price Data Delays", detail: "Quotes may be delayed up to 15 minutes depending on the data source. Real-time streaming is not yet available for all tickers." },
            { issue: "Heat Engine Coverage", detail: "Currently limited to ~500 of the most liquid U.S. equities. Small-cap and international coverage is planned for future releases." },
            { issue: "Broker Integration", detail: "Real broker connections (Wealthsimple, Questrade, etc.) are in early alpha. Some API endpoints may not sync reliably. Paper trading mode is the recommended experience." },
            { issue: "Mobile Experience", detail: "While responsive, the platform is optimized for desktop. Some advanced features (chart indicators, drag-and-drop reorder) work best on larger screens." },
            { issue: "AI Hallucinations", detail: "Despite guardrails, Maven AI may occasionally produce inaccurate information. Always verify AI-provided data points against primary sources." },
            { issue: "Community Moderation", detail: "Automated moderation is in early stages. Report inappropriate content using the in-app reporting system." },
          ].map((item) => (
            <div key={item.issue} className="rounded-xl bg-secondary p-3">
              <p className="text-xs font-medium">{item.issue}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Conflict of Interest */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Scale size={14} className="text-muted-foreground" /> Conflict of Interest Policy
        </h2>
        <div className="glass-card p-4 space-y-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Monee does not receive payment for order flow, commissions on trades, or referral fees from any brokerage. We do not hold positions in any securities mentioned on the platform. Our revenue model during beta is:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Sparkles size={16} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">Free Tier</p>
              <p className="text-[9px] text-muted-foreground">Core features at no cost</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Heart size={16} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">Premium (Future)</p>
              <p className="text-[9px] text-muted-foreground">Advanced analytics, real-time data</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <Users size={16} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-[10px] font-medium">No Ads</p>
              <p className="text-[9px] text-muted-foreground">We will never show ads</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Community members who share stock ideas are encouraged to disclose their positions using the conflict disclosure field on their profile. This is voluntary during beta but will become required for verified contributors.
          </p>
        </div>
      </motion.div>

      {/* Regulatory */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileText size={14} className="text-muted-foreground" /> Regulatory Disclaimer
        </h2>
        <div className="glass-card p-4">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Monee is not registered as a broker-dealer, investment advisor, or in any other securities-related capacity with the SEC, FINRA, any state securities commission, the CSA, IIROC, or any other regulatory body. The platform provides <strong className="text-foreground">educational content and simulated trading experiences only</strong>.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Nothing on this platform constitutes an offer to buy or sell securities, investment advice, or a recommendation of any kind. Past performance of any simulated portfolio does not guarantee future results. Paper trading results may not reflect real market conditions including slippage, partial fills, and market impact.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            If you need financial advice, consult a qualified, registered financial advisor in your jurisdiction. Investing in securities involves risk of loss. You should only invest money you can afford to lose.
          </p>
        </div>
      </motion.div>

      {/* Feedback */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <MessageCircle size={14} className="text-muted-foreground" /> Beta Feedback
        </h2>
        <div className="glass-card p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            We are actively building in public and value your feedback. If you find bugs, inaccuracies, or have feature requests, use the in-app feedback system or community channels. Beta testers who contribute meaningful feedback may receive early access to premium features when they launch.
          </p>
        </div>
      </motion.div>

      <motion.div className="mt-6 rounded-lg bg-secondary px-4 py-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <p className="text-[11px] text-muted-foreground">
          🧪 Monee Beta · Last updated: March 2026 · Not financial advice
        </p>
      </motion.div>
    </div>
  );
};

export default Transparency;
