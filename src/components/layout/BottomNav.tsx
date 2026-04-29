import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, TrendingUp, Bell, MoreHorizontal, Star, MessageCircle, BookOpen, FlaskConical, User, Settings, Newspaper, Wrench, FileBarChart, Hash, PieChart, ShieldAlert, Flame, Grid3X3, Receipt, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MavenIcon from "@/components/MavenIcon";

const primaryTabs = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/chat", icon: MessageCircle, label: "Maven" },
  { path: "/invest", icon: TrendingUp, label: "Invest" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
];

const extraGroups = [
  {
    label: "Social",
    pages: [
      { path: "/social", icon: Users, label: "Finance For You" },
      { path: "/community", icon: Hash, label: "Community" },
      { path: "/community/dms", icon: MessageCircle, label: "Messages" },
    ],
  },
  {
    label: "Investing",
    pages: [
      { path: "/watchlist", icon: Star, label: "Watchlist" },
      { path: "/news", icon: Newspaper, label: "Market News" },
      { path: "/orders", icon: ClipboardList, label: "Orders" },
      { path: "/transactions", icon: Receipt, label: "Transactions" },
    ],
  },
  {
    label: "More",
    pages: [
      { path: "/learn", icon: BookOpen, label: "Learn" },
      { path: "/simulation", icon: FlaskConical, label: "Sim Lab" },
      { path: "/tools", icon: Wrench, label: "Tools" },
      { path: "/profile", icon: User, label: "Profile" },
      { path: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

const allExtraPaths = extraGroups.flatMap(g => g.pages.map(p => p.path));

const BottomNav = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isExtraActive = allExtraPaths.some((p) => location.pathname === p);

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed inset-0 z-[70] bg-card lg:hidden overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-[env(safe-area-inset-top)] bg-card">
              <h2 className="text-lg font-semibold tracking-tight pt-4 pb-3">More</h2>
              <button onClick={() => setShowMore(false)} className="pt-4 pb-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Done
              </button>
            </div>

            <div className="px-5 pb-24 space-y-5">
              {extraGroups.map((group, gi) => (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * gi, duration: 0.3 }}
                >
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.pages.map((page) => {
                      const Icon = page.icon;
                      const isActive = location.pathname === page.path;
                      return (
                        <NavLink
                          key={page.path + page.label}
                          to={page.path}
                          onClick={() => setShowMore(false)}
                          data-tour-id={
                            page.path === "/settings" ? "tour-settings-link" :
                            page.path === "/invest" ? "tour-invest-link" :
                            page.path === "/watchlist" ? "tour-watchlist-link" : undefined
                          }
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98] ${
                            isActive
                              ? "bg-foreground/[0.06] text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                          <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                            {page.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {primaryTabs.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.path !== "/" && location.pathname.startsWith(tab.path + "/"));
            const Icon = tab.icon;
            const isMaven = tab.path === "/chat";
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                data-tour-id={tab.path === "/invest" ? "tour-invest-link" : undefined}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 h-0.5 w-6 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: 1 } : { scale: 1 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  {isMaven ? (
                    <MavenIcon size={20} className={isActive ? "text-foreground" : "text-muted-foreground"} />
                  ) : (
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-foreground" : "text-muted-foreground"} />
                  )}
                </motion.div>
                <span className={`text-[10px] leading-tight ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}

          <button onClick={() => setShowMore(!showMore)} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5">
            {(isExtraActive || showMore) && (
              <motion.div layoutId="nav-indicator-more" className="absolute -top-1 h-0.5 w-6 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <motion.div whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <MoreHorizontal size={20} strokeWidth={showMore || isExtraActive ? 2 : 1.5} className={showMore || isExtraActive ? "text-foreground" : "text-muted-foreground"} />
            </motion.div>
            <span className={`text-[10px] leading-tight ${showMore || isExtraActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
