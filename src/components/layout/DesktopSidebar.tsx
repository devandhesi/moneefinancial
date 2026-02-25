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
} from "lucide-react";

const mainLinks = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/chat", icon: MessageCircle, label: "Maven" },
  { path: "/invest", icon: TrendingUp, label: "Invest" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
];

const secondaryLinks = [
  { path: "/transactions", icon: Receipt, label: "Transactions" },
  { path: "/orders", icon: ClipboardList, label: "Orders" },
  { path: "/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/simulation", icon: FlaskConical, label: "Sim Lab" },
  { path: "/risk", icon: Shield, label: "Risk Map" },
  { path: "/social", icon: Users, label: "Social" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const DesktopSidebar = () => {
  const location = useLocation();

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
      active
        ? "bg-foreground text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/50 bg-background lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-semibold tracking-tight">monee</span>
        <span className="ml-2 text-xs text-muted-foreground">Money, made easy.</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 px-4 pt-2">
        {mainLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.path} to={link.path} className={linkClass(link.path)}>
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        <div className="my-4 h-px bg-border/50" />

        {secondaryLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.path} to={link.path} className={linkClass(link.path)}>
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-6 py-4">
        <p className="text-[10px] text-muted-foreground">
          📄 Paper Trading Mode · Educational only
        </p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;