import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  X,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useSidebarConfig } from "@/hooks/use-sidebar-config";

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
};

const DesktopSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { links } = useSidebarConfig();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistOpen, setWatchlistOpen] = useState(true);

  const mainLinks = links.filter(l => l.section === "main" && l.visible);
  const secondaryLinks = links.filter(l => l.section === "secondary" && l.visible);

  useEffect(() => {
    const load = () => {
      try {
        setWatchlist(JSON.parse(localStorage.getItem("monee-watchlist") || "[]"));
      } catch { setWatchlist([]); }
    };
    load();
    window.addEventListener("storage", load);
    const interval = setInterval(load, 2000);
    return () => { window.removeEventListener("storage", load); clearInterval(interval); };
  }, []);

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(s => s !== symbol);
    localStorage.setItem("monee-watchlist", JSON.stringify(updated));
    setWatchlist(updated);
  };

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

        {/* Watchlist */}
        <div className="my-4 h-px bg-border/50" />
        <button
          onClick={() => setWatchlistOpen(!watchlistOpen)}
          className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          <span className="flex items-center gap-2">
            <Star size={14} />
            Watchlist
            {watchlist.length > 0 && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {watchlist.length}
              </span>
            )}
          </span>
          {watchlistOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {watchlistOpen && (
          <div className="space-y-0.5">
            {watchlist.length === 0 ? (
              <p className="px-4 py-2 text-[11px] text-muted-foreground">
                No stocks saved yet. Star a stock to add it here.
              </p>
            ) : (
              watchlist.map((symbol) => (
                <div
                  key={symbol}
                  className="group flex items-center justify-between rounded-xl px-4 py-2 text-sm transition-all hover:bg-secondary cursor-pointer"
                  onClick={() => navigate(`/invest/${symbol}`)}
                >
                  <span className="font-medium">{symbol}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(symbol); }}
                    className="rounded-lg p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </nav>

      <div className="border-t border-border/50 px-4 py-4 space-y-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <p className="px-4 text-[10px] text-muted-foreground">
          📄 Paper Trading Mode · Educational only
        </p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
