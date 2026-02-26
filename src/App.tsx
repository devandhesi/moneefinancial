import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { TimezoneProvider } from "@/hooks/use-timezone";
import { SidebarConfigProvider } from "@/hooks/use-sidebar-config";
import { AuthProvider } from "@/hooks/use-auth";
import { TradingModeProvider } from "@/hooks/use-trading-mode";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Invest from "./pages/Invest";
import StockDetail from "./pages/StockDetail";
import Learn from "./pages/Learn";
import LearnCourse from "./pages/LearnCourse";
import LearnCharts from "./pages/LearnCharts";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Social from "./pages/Social";
import Transactions from "./pages/Transactions";
import Orders from "./pages/Orders";
import SimulationLab from "./pages/SimulationLab";
import Tools from "./pages/Tools";
import Reports from "./pages/Reports";
import Watchlist from "./pages/Watchlist";
import Auth from "./pages/Auth";
import CommunityFeed from "./pages/CommunityFeed";
import CommunityRoom from "./pages/CommunityRoom";
import DirectMessages from "./pages/DirectMessages";
import Notifications from "./pages/Notifications";
import BrokerConnections from "./pages/BrokerConnections";
import CapitalAllocation from "./pages/CapitalAllocation";
import BehavioralRisk from "./pages/BehavioralRisk";
import HeatEngine from "./pages/HeatEngine";
import Heatmap from "./pages/Heatmap";
import News from "./pages/News";
import Markets from "./pages/Markets";
import Calendar from "./pages/Calendar";
import InsiderTracking from "./pages/InsiderTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TimezoneProvider>
      <SidebarConfigProvider>
      <AuthProvider>
      <TradingModeProvider>
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
              <Route path="/learn/charts" element={<LearnCharts />} />
              <Route path="/learn/:courseId" element={<LearnCourse />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/social" element={<Social />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/simulation" element={<SimulationLab />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/community/room/:slug" element={<CommunityRoom />} />
              <Route path="/community/dms" element={<DirectMessages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings/broker" element={<BrokerConnections />} />
              <Route path="/allocation" element={<CapitalAllocation />} />
              <Route path="/behavioral-risk" element={<BehavioralRisk />} />
              <Route path="/heat-engine" element={<HeatEngine />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/news" element={<News />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/insider-tracking" element={<InsiderTracking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
      </TradingModeProvider>
      </AuthProvider>
      </SidebarConfigProvider>
      </TimezoneProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
