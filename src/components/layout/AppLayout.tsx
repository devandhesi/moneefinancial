import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import MavenAssistantFAB from "../MavenAssistantFAB";
import { useDmNotifications } from "@/hooks/use-dm-notifications";

const AppLayout = ({ children }: { children: ReactNode }) => {
  useDmNotifications();

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      <main className="mx-auto max-w-[1440px] pb-24 lg:pb-8 lg:pl-56">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <BottomNav />
      <MavenAssistantFAB />
    </div>
  );
};

export default AppLayout;