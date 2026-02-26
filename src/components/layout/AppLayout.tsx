import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop nav sidebar - hidden on mobile */}
      <DesktopSidebar />

      {/* Main content area */}
      <main className="mx-auto max-w-[1440px] pb-24 lg:pb-8 lg:pl-56">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Mobile bottom nav - hidden on desktop */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;