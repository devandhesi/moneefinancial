import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { TimezoneProvider } from "@/hooks/use-timezone";
import { SidebarConfigProvider } from "@/hooks/use-sidebar-config";
import { AuthProvider } from "@/hooks/use-auth";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Invest from "./pages/Invest";
import StockDetail from "./pages/StockDetail";
import Learn from "./pages/Learn";
import LearnCourse from "./pages/LearnCourse";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Social from "./pages/Social";
import Transactions from "./pages/Transactions";
import Orders from "./pages/Orders";
import SimulationLab from "./pages/SimulationLab";
import Watchlist from "./pages/Watchlist";
import Auth from "./pages/Auth";
import CommunityFeed from "./pages/CommunityFeed";
import CommunityRoom from "./pages/CommunityRoom";
import DirectMessages from "./pages/DirectMessages";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TimezoneProvider>
      <SidebarConfigProvider>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/invest" element={<Invest />} />
              <Route path="/invest/:symbol" element={<StockDetail />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:courseId" element={<LearnCourse />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/social" element={<Social />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/simulation" element={<SimulationLab />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/community/room/:slug" element={<CommunityRoom />} />
              <Route path="/community/dms" element={<DirectMessages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
      </SidebarConfigProvider>
      </TimezoneProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
