import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import MavenAssistantFAB from "../MavenAssistantFAB";
import { useDmNotifications } from "@/hooks/use-dm-notifications";

const AppLayout = ({ children }: { children: ReactNode }) => {
  useDmNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <main className={`mx-auto max-w-[1440px] pb-24 lg:pb-8 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-0" : "lg:pl-56"}`}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <BottomNav />
      <MavenAssistantFAB />
    </div>
  );
};

export default AppLayout;
