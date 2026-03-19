import { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import MavenAssistantFAB from "../MavenAssistantFAB";
import { useDmNotifications } from "@/hooks/use-dm-notifications";

const AppLayout = ({ children }: { children: ReactNode }) => {
  useDmNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DesktopSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <main className={`mx-auto max-w-[1440px] pb-28 lg:pb-8 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-14" : "lg:pl-56"}`}>
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />
      <MavenAssistantFAB />
    </div>
  );
};

export default AppLayout;
