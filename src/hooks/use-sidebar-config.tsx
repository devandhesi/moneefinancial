import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export interface SidebarLink {
  id: string;
  path: string;
  label: string;
  icon: string; // lucide icon name
  section: "main" | "secondary";
  visible: boolean;
  order: number;
}

const DEFAULT_LINKS: SidebarLink[] = [
  { id: "dashboard", path: "/", label: "Dashboard", icon: "LayoutDashboard", section: "main", visible: true, order: 0 },
  { id: "maven", path: "/chat", label: "Maven", icon: "MessageCircle", section: "main", visible: true, order: 1 },
  { id: "invest", path: "/invest", label: "Invest", icon: "TrendingUp", section: "main", visible: true, order: 2 },
  { id: "markets", path: "/markets", label: "Markets", icon: "Globe", section: "main", visible: true, order: 3 },
  { id: "watchlist", path: "/watchlist", label: "Watchlist", icon: "Star", section: "main", visible: true, order: 4 },
  { id: "learn", path: "/learn", label: "Learn", icon: "BookOpen", section: "main", visible: true, order: 5 },
  { id: "transactions", path: "/transactions", label: "Transactions", icon: "Receipt", section: "secondary", visible: true, order: 6 },
  { id: "orders", path: "/orders", label: "Orders", icon: "ClipboardList", section: "secondary", visible: true, order: 7 },
  { id: "calendar", path: "/calendar", label: "Calendar", icon: "CalendarDays", section: "secondary", visible: true, order: 8 },
  { id: "simlab", path: "/simulation", label: "Sim Lab", icon: "FlaskConical", section: "secondary", visible: true, order: 9 },
  { id: "riskmap", path: "/risk", label: "Risk Map", icon: "Shield", section: "secondary", visible: true, order: 10 },
  { id: "social", path: "/social", label: "Social", icon: "Users", section: "secondary", visible: true, order: 11 },
  { id: "profile", path: "/profile", label: "Profile", icon: "User", section: "secondary", visible: true, order: 12 },
  { id: "settings", path: "/settings", label: "Settings", icon: "Settings", section: "secondary", visible: true, order: 13 },
];

const STORAGE_KEY = "monee-sidebar-config";

interface SidebarConfigContextType {
  links: SidebarLink[];
  toggleVisibility: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  resetToDefaults: () => void;
}

const SidebarConfigContext = createContext<SidebarConfigContextType | null>(null);

export function SidebarConfigProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<SidebarLink[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SidebarLink[];
        // Merge with defaults to pick up any new links
        const ids = new Set(parsed.map(l => l.id));
        const merged = [...parsed];
        for (const def of DEFAULT_LINKS) {
          if (!ids.has(def.id)) merged.push(def);
        }
        return merged.sort((a, b) => a.order - b.order);
      }
    } catch {}
    return DEFAULT_LINKS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  const toggleVisibility = useCallback((id: string) => {
    // Don't allow hiding Dashboard or Settings
    if (id === "dashboard" || id === "settings") return;
    setLinks(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

  const moveUp = useCallback((id: string) => {
    setLinks(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx <= 0) return prev;
      // Only swap within same section
      const target = prev[idx];
      const above = prev[idx - 1];
      if (target.section !== above.section) return prev;
      const next = [...prev];
      next[idx - 1] = { ...target, order: above.order };
      next[idx] = { ...above, order: target.order };
      return next.sort((a, b) => a.order - b.order);
    });
  }, []);

  const moveDown = useCallback((id: string) => {
    setLinks(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const target = prev[idx];
      const below = prev[idx + 1];
      if (target.section !== below.section) return prev;
      const next = [...prev];
      next[idx + 1] = { ...target, order: below.order };
      next[idx] = { ...below, order: target.order };
      return next.sort((a, b) => a.order - b.order);
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setLinks(DEFAULT_LINKS);
  }, []);

  return (
    <SidebarConfigContext.Provider value={{ links, toggleVisibility, moveUp, moveDown, resetToDefaults }}>
      {children}
    </SidebarConfigContext.Provider>
  );
}

export function useSidebarConfig() {
  const ctx = useContext(SidebarConfigContext);
  if (!ctx) throw new Error("useSidebarConfig must be used within SidebarConfigProvider");
  return ctx;
}
