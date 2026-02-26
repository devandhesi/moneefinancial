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
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";
import { Switch } from "@/components/ui/switch";

const iconMap: Record<string, LucideIcon> = {
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
  Star,
  Globe,
};

const DesktopSidebar = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { links } = useSidebarConfig();

  const mainLinks = links.filter(l => l.section === "main" && l.visible);
  const secondaryLinks = links.filter(l => l.section === "secondary" && l.visible);

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
      active
        ? "bg-foreground text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/20 bg-white/10 backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-semibold tracking-tight">monee</span>
        <span className="ml-2 text-xs text-muted-foreground">Money, made easy.</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 pt-2">
        {mainLinks.map((link) => {
          const Icon = iconMap[link.icon] || LayoutDashboard;
          return (
            <NavLink key={link.path} to={link.path} className={linkClass(link.path)}>
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        {secondaryLinks.length > 0 && <div className="my-4 h-px bg-border/50" />}

        {secondaryLinks.map((link) => {
          const Icon = iconMap[link.icon] || Settings;
          return (
            <NavLink key={link.path} to={link.path} className={linkClass(link.path)}>
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

      </nav>

      <div className="border-t border-border/50 px-4 py-4 space-y-3">
        <div className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            <span>Dark Mode</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
        </div>
        <p className="px-4 text-[10px] text-muted-foreground">
          📄 Paper Trading Mode · Educational only
        </p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
