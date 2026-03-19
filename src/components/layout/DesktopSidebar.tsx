import { useState } from "react";
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
  Receipt,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarConfig, SECTION_LABELS } from "@/hooks/use-sidebar-config";
import { Switch } from "@/components/ui/switch";
import MavenIcon from "@/components/MavenIcon";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, MessageCircle, TrendingUp, BookOpen, User,
  FlaskConical, Settings, Star, Bell, Hash, Newspaper, Wrench, FileBarChart, Users,
  Receipt, ClipboardList,
};

interface DesktopSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const DesktopSidebar = ({ collapsed, onCollapsedChange }: DesktopSidebarProps) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth();
  const { links } = useSidebarConfig();
  const [hovered, setHovered] = useState(false);

  // Group visible links by section
  const visibleLinks = links.filter(l => l.visible);
  const sections = ["main", "investing", "social", "learn"] as const;

  const groupedLinks = sections.map(section => ({
    section,
    label: SECTION_LABELS[section] || section,
    items: visibleLinks.filter(l => l.section === section),
  })).filter(g => g.items.length > 0);

  const bottomLinks = visibleLinks.filter(l => l.section === "bottom");

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const open = new Set<string>();
    groupedLinks.forEach((g) => {
      if (g.section === "main" || g.items.some((i) => location.pathname === i.path || location.pathname.startsWith(i.path + "/"))) {
        open.add(g.section);
      }
    });
    // Default open investing and social
    open.add("investing");
    open.add("social");
    return open;
  });

  const toggleGroup = (section: string) => {
    if (section === "main") return; // main is always open
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
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
      {collapsed && !hovered && (
        <div
          className="fixed inset-y-0 left-0 z-50 hidden w-56 lg:flex lg:flex-col"
          onMouseEnter={() => setHovered(true)}
        >
          <div className="flex h-14 items-center px-5">
            <span className="text-lg font-semibold tracking-tight">monee</span>
            <span className="ml-1.5 text-[10px] text-muted-foreground">beta</span>
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
            onClick={() => { onCollapsedChange(!collapsed); setHovered(false); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={collapsed ? "Pin sidebar" : "Hide sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-1 space-y-1">
          {groupedLinks.map((group) => {
            const isMain = group.section === "main";
            const isOpen = isMain || openGroups.has(group.section);

            return (
              <div key={group.section}>
                {!isMain && (
                  <button
                    onClick={() => toggleGroup(group.section)}
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

                {isOpen && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = iconMap[item.icon] || LayoutDashboard;
                      const isMaven = item.path === "/chat";
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={linkClass(item.path)}
                          data-tour-id={
                            item.path === "/settings" ? "tour-settings-link" :
                            item.path === "/invest" ? "tour-invest-link" :
                            item.path === "/watchlist" ? "tour-watchlist-link" : undefined
                          }
                        >
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
          {bottomLinks.map((item) => {
            const Icon = iconMap[item.icon] || User;
            const label = item.id === "profile" ? (profile?.display_name || "Profile") : item.label;
            return (
              <NavLink key={item.path} to={item.path} className={linkClass(item.path)}>
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            );
          })}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
              <span className="text-[12px] font-medium">Dark Mode</span>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
          <p className="px-3 text-[9px] text-muted-foreground/60">Paper Trading · Educational only</p>
        </div>
      </aside>
    </>
  );
};

export default DesktopSidebar;
