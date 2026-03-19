import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export interface SidebarLink {
  id: string;
  path: string;
  label: string;
  icon: string; // lucide icon name
  section: "main" | "investing" | "social" | "learn" | "bottom";
  visible: boolean;
  order: number;
}

const DEFAULT_LINKS: SidebarLink[] = [
  // Main (ungrouped top)
  { id: "dashboard", path: "/", label: "Dashboard", icon: "LayoutDashboard", section: "main", visible: true, order: 0 },
  { id: "maven", path: "/chat", label: "Maven AI", icon: "MessageCircle", section: "main", visible: true, order: 1 },

  // Investing
  { id: "invest", path: "/invest", label: "Invest", icon: "TrendingUp", section: "investing", visible: true, order: 10 },
  { id: "watchlist", path: "/watchlist", label: "Watchlist", icon: "Star", section: "investing", visible: true, order: 11 },
  { id: "news", path: "/news", label: "Market News", icon: "Newspaper", section: "investing", visible: true, order: 12 },
  { id: "reports", path: "/reports", label: "Reports", icon: "FileBarChart", section: "investing", visible: true, order: 13 },
  { id: "orders", path: "/orders", label: "Orders", icon: "ClipboardList", section: "investing", visible: true, order: 14 },
  { id: "transactions", path: "/transactions", label: "Transactions", icon: "Receipt", section: "investing", visible: true, order: 15 },

  // Social
  { id: "social", path: "/social", label: "Finance For You", icon: "Users", section: "social", visible: true, order: 20 },
  { id: "community", path: "/community", label: "Community", icon: "Hash", section: "social", visible: true, order: 21 },
  { id: "dms", path: "/community/dms", label: "Messages", icon: "MessageCircle", section: "social", visible: true, order: 22 },
  { id: "notifications", path: "/notifications", label: "Notifications", icon: "Bell", section: "social", visible: true, order: 23 },

  // Learn
  { id: "learn", path: "/learn", label: "Modules", icon: "BookOpen", section: "learn", visible: true, order: 30 },
  { id: "learncharts", path: "/learn/charts", label: "Learn Charts", icon: "TrendingUp", section: "learn", visible: true, order: 31 },
  { id: "simlab", path: "/simulation", label: "Sim Lab", icon: "FlaskConical", section: "learn", visible: true, order: 32 },
  { id: "tools", path: "/tools", label: "Tools", icon: "Wrench", section: "learn", visible: true, order: 33 },

  // Bottom (always shown, not in groups)
  { id: "profile", path: "/profile", label: "Profile", icon: "User", section: "bottom", visible: true, order: 90 },
  { id: "settings", path: "/settings", label: "Settings", icon: "Settings", section: "bottom", visible: true, order: 91 },
];

export const SECTION_LABELS: Record<string, string> = {
  main: "Main",
  investing: "Investing",
  social: "Social",
  learn: "Learn",
  bottom: "Account",
};

const STORAGE_KEY = "monee-sidebar-config";

interface SidebarConfigContextType {
  links: SidebarLink[];
  toggleVisibility: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  reorder: (section: string, fromIndex: number, toIndex: number) => void;
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
        // Remove links that no longer exist in defaults
        const defaultIds = new Set(DEFAULT_LINKS.map(l => l.id));
        const cleaned = merged.filter(l => defaultIds.has(l.id));
        return cleaned.sort((a, b) => a.order - b.order);
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

  const reorder = useCallback((section: string, fromIndex: number, toIndex: number) => {
    setLinks(prev => {
      const sectionItems = prev.filter(l => l.section === section);
      const otherItems = prev.filter(l => l.section !== section);
      const [moved] = sectionItems.splice(fromIndex, 1);
      sectionItems.splice(toIndex, 0, moved);
      // Re-assign orders based on section base
      const sectionBases: Record<string, number> = { main: 0, investing: 10, social: 20, learn: 30, bottom: 90 };
      const base = sectionBases[section] ?? 0;
      const reordered = sectionItems.map((item, i) => ({ ...item, order: base + i }));
      return [...otherItems, ...reordered].sort((a, b) => a.order - b.order);
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setLinks(DEFAULT_LINKS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SidebarConfigContext.Provider value={{ links, toggleVisibility, moveUp, moveDown, reorder, resetToDefaults }}>
      {children}
    </SidebarConfigContext.Provider>
  );
}

export function useSidebarConfig() {
  const ctx = useContext(SidebarConfigContext);
  if (!ctx) throw new Error("useSidebarConfig must be used within SidebarConfigProvider");
  return ctx;
}
