import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Hash, TrendingUp, Bell, MoreHorizontal, Star, MessageCircle, BookOpen, FlaskConical, User, Settings, Newspaper, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const primaryTabs = [
  { path: "/", icon: LayoutDashboard, label: "Home" },
  { path: "/community", icon: Hash, label: "Rooms" },
  { path: "/invest", icon: TrendingUp, label: "Invest" },
  { path: "/notifications", icon: Bell, label: "Alerts" },
];

const extraGroups = [
  {
    label: "Community",
    pages: [
      { path: "/community", icon: Hash, label: "Rooms" },
      { path: "/community/dms", icon: MessageCircle, label: "Messages" },
      { path: "/social", icon: Newspaper, label: "Finance For You" },
      { path: "/chat", icon: MessageCircle, label: "Maven AI" },
    ],
  },
  {
    label: "Investing",
    pages: [
      { path: "/invest", icon: TrendingUp, label: "Invest" },
      { path: "/watchlist", icon: Star, label: "Watchlist" },
    ],
  },
  {
    label: "More",
    pages: [
      { path: "/learn", icon: BookOpen, label: "Learn" },
      { path: "/simulation", icon: FlaskConical, label: "Sim Lab" },
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
            className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-[70] glass-card-strong p-4 lg:hidden max-h-[70vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">More Pages</span>
              <button onClick={() => setShowMore(false)} className="rounded-lg p-1 hover:bg-secondary">
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              {extraGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {group.pages.map((page) => {
                      const Icon = page.icon;
                      const isActive = location.pathname === page.path;
                      return (
                        <NavLink
                          key={page.path + page.label}
                          to={page.path}
                          onClick={() => setShowMore(false)}
                          className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-colors ${
                            isActive ? "bg-foreground/10" : "hover:bg-secondary"
                          }`}
                        >
                          <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-foreground" : "text-muted-foreground"} />
                          <span className={`text-[10px] leading-tight text-center ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                            {page.label}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
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
            return (
              <NavLink key={tab.path} to={tab.path} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 h-0.5 w-6 rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-foreground" : "text-muted-foreground"} />
                <span className={`text-[10px] leading-tight ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}

          <button onClick={() => setShowMore(!showMore)} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5">
            {(isExtraActive || showMore) && (
              <motion.div layoutId="nav-indicator-more" className="absolute -top-1 h-0.5 w-6 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <MoreHorizontal size={20} strokeWidth={showMore || isExtraActive ? 2 : 1.5} className={showMore || isExtraActive ? "text-foreground" : "text-muted-foreground"} />
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
