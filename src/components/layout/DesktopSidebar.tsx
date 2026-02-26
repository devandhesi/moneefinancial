import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  TrendingUp,
  BookOpen,
  User,
  Receipt,
  ClipboardList,
  CalendarDays,
  FlaskConical,
  Shield,
  Settings,
  Users,
  Moon,
  Sun,
  Star,
  Globe,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User, Receipt,
  ClipboardList, CalendarDays, FlaskConical, Shield, Settings, Users, Star, Globe,
};

interface NavGroup {
  label: string;
  items: { path: string; icon: string; label: string }[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: "",
    defaultOpen: true,
    items: [
      { path: "/", icon: "LayoutDashboard", label: "Dashboard" },
      { path: "/chat", icon: "MessageCircle", label: "Maven" },
    ],
  },
  {
    label: "Investing",
    defaultOpen: true,
    items: [
      { path: "/invest", icon: "TrendingUp", label: "Invest" },
      { path: "/watchlist", icon: "Star", label: "Watchlist" },
      { path: "/markets", icon: "Globe", label: "Markets" },
      { path: "/risk", icon: "Shield", label: "Risk Map" },
    ],
  },
  {
    label: "Activity",
    items: [
      { path: "/transactions", icon: "Receipt", label: "Transactions" },
      { path: "/orders", icon: "ClipboardList", label: "Orders" },
      { path: "/calendar", icon: "CalendarDays", label: "Calendar" },
    ],
  },
  {
    label: "Learning",
    items: [
      { path: "/learn", icon: "BookOpen", label: "Learn" },
      { path: "/simulation", icon: "FlaskConical", label: "Sim Lab" },
    ],
  },
  {
    label: "Community",
    items: [
      { path: "/social", icon: "Users", label: "Social" },
      { path: "/profile", icon: "User", label: "Profile" },
    ],
  },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  // Track which groups are open; default open if group has active route or defaultOpen
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const open = new Set<string>();
    navGroups.forEach((g) => {
      if (g.defaultOpen || g.items.some((i) => location.pathname === i.path)) {
        open.add(g.label);
      }
    });
    return open;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
      active
        ? "bg-foreground text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-border/30 bg-background/80 backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="flex h-14 items-center px-5">
        <span className="text-lg font-semibold tracking-tight">monee</span>
        <span className="ml-1.5 text-[10px] text-muted-foreground">beta</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-1 space-y-1">
        {navGroups.map((group) => {
          const isUngrouped = group.label === "";
          const isOpen = openGroups.has(group.label);

          return (
            <div key={group.label || "top"}>
              {/* Group header */}
              {!isUngrouped && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-3 py-2 mt-2"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-muted-foreground/50 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                  />
                </button>
              )}

              {/* Links */}
              {(isUngrouped || isOpen) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = iconMap[item.icon] || LayoutDashboard;
                    return (
                      <NavLink key={item.path} to={item.path} className={linkClass(item.path)}>
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border/30 px-3 py-3 space-y-2">
        <NavLink to="/settings" className={linkClass("/settings")}>
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            <span className="text-[12px] font-medium">Dark Mode</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
        <p className="px-3 text-[9px] text-muted-foreground/60">
          📄 Paper Trading · Educational only
        </p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
