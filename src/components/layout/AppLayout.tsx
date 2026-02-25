import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg pb-24">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
