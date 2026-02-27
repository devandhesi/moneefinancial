import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageCircle,
  TrendingUp,
  BookOpen,
  User,
  FileBarChart,
  FlaskConical,
  Settings,
  Moon,
  Sun,
  Star,
  ChevronDown,
  Bell,
  Hash,
  Newspaper,
  Wrench,
  type LucideIcon,
  Users,
  PieChart,
  ShieldAlert,
  Flame,
  Grid3X3,
  Receipt,
  ClipboardList,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import MavenIcon from "@/components/MavenIcon";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User,
  FlaskConical, Settings, Star, Bell, Hash, Newspaper, Wrench, FileBarChart, Users,
  PieChart, ShieldAlert, Flame, Grid3X3, Receipt, ClipboardList, Link2,
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
      { path: "/chat", icon: "MessageCircle", label: "Maven AI" },
    ],
  },
  {
    label: "Investing",
    defaultOpen: true,
    items: [
      { path: "/invest", icon: "TrendingUp", label: "Invest" },
      { path: "/watchlist", icon: "Star", label: "Watchlist" },
      { path: "/news", icon: "Newspaper", label: "Market News" },
      { path: "/reports", icon: "FileBarChart", label: "Reports" },
      { path: "/allocation", icon: "PieChart", label: "Allocation" },
      { path: "/orders", icon: "ClipboardList", label: "Orders" },
      { path: "/transactions", icon: "Receipt", label: "Transactions" },
    ],
  },
  {
    label: "Social",
    defaultOpen: true,
    items: [
      { path: "/social", icon: "Newspaper", label: "Finance For You" },
      { path: "/community", icon: "Hash", label: "Rooms" },
      { path: "/notifications", icon: "Bell", label: "Notifications" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { path: "/heat-engine", icon: "Flame", label: "Heat Engine" },
      { path: "/heatmap", icon: "Grid3X3", label: "Heatmap" },
      { path: "/behavioral-risk", icon: "ShieldAlert", label: "Behavioral Risk" },
    ],
  },
  {
    label: "Modules",
    items: [
      { path: "/learn", icon: "BookOpen", label: "Learn" },
      { path: "/learn/charts", icon: "TrendingUp", label: "Learn Charts" },
      { path: "/simulation", icon: "FlaskConical", label: "Sim Lab" },
      { path: "/tools", icon: "Wrench", label: "Tools" },
    ],
  },
];

interface DesktopSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const DesktopSidebar = ({ collapsed, onCollapsedChange }: DesktopSidebarProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [hovered, setHovered] = useState(false);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const open = new Set<string>();
    navGroups.forEach((g) => {
      if (g.defaultOpen || g.items.some((i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/"))) {
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
    const active = location.pathname === path || (path !== "/" && location.pathname.startsWith(path + "/"));
    return `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
      active
        ? "bg-foreground text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;
  };

  const visible = !collapsed || hovered;

  return (
    <>
      {/* Persistent logo + hover trigger when collapsed */}
      {collapsed && !hovered && (
        <div
          className="fixed inset-y-0 left-0 z-50 hidden w-14 lg:flex lg:flex-col items-center"
          onMouseEnter={() => setHovered(true)}
        >
          <div className="flex h-14 items-center justify-center w-full">
            <span className="text-lg font-semibold tracking-tight">m</span>
          </div>
        </div>
      )}

      <aside
        onMouseEnter={() => collapsed && setHovered(true)}
        onMouseLeave={() => collapsed && setHovered(false)}
        className={`fixed inset-y-0 left-0 z-40 hidden w-56 glass-sidebar lg:flex lg:flex-col rounded-r-2xl transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "-translate-x-full"
        } ${collapsed && hovered ? "shadow-xl z-50" : ""}`}
      >
        <div className="flex h-14 items-center justify-between px-5">
          <div className="flex items-center">
            <span className="text-lg font-semibold tracking-tight">monee</span>
            <span className="ml-1.5 text-[10px] text-muted-foreground">beta</span>
          </div>
          <button
            onClick={() => {
              onCollapsedChange(!collapsed);
              setHovered(false);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={collapsed ? "Pin sidebar" : "Hide sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-1 space-y-1">
          {navGroups.map((group) => {
            const isUngrouped = group.label === "";
            const isOpen = openGroups.has(group.label);

            return (
              <div key={group.label || "top"}>
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

                {(isUngrouped || isOpen) && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = iconMap[item.icon] || LayoutDashboard;
                      const isMaven = item.path === "/chat";
                      return (
                        <NavLink key={item.path} to={item.path} className={linkClass(item.path)}>
                          {isMaven ? <MavenIcon size={16} /> : <Icon size={16} />}
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

        <div className="border-t border-[var(--glass-border-subtle)] px-3 py-3 space-y-2">
          <NavLink to="/profile" className={linkClass("/profile")}>
            <User size={16} />
            <span>{profile?.display_name || "Profile"}</span>
          </NavLink>
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
            Paper Trading · Educational only
          </p>
        </div>
      </aside>
    </>
  );
};

export default DesktopSidebar;
