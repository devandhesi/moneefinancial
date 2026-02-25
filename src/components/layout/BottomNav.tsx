import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/invest", icon: TrendingUp, label: "Invest" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 h-0.5 w-6 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                className={isActive ? "text-foreground" : "text-muted-foreground"}
              />
              <span
                className={`text-[10px] leading-tight ${
                  isActive ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;