import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { TimezoneProvider } from "@/hooks/use-timezone";
import { SidebarConfigProvider } from "@/hooks/use-sidebar-config";
import { AuthProvider } from "@/hooks/use-auth";
import { TradingModeProvider } from "@/hooks/use-trading-mode";
import { MavenChatProvider } from "@/hooks/use-maven-chat";
import { WalkthroughProvider } from "@/hooks/use-walkthrough";
import WalkthroughOverlay from "@/components/WalkthroughOverlay";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";

// Lazy-load every non-landing route to slash initial JS payload.
const Chat = lazy(() => import("./pages/Chat"));
const Invest = lazy(() => import("./pages/Invest"));
const StockDetail = lazy(() => import("./pages/StockDetail"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnModule = lazy(() => import("./pages/LearnModule"));
const LearnLesson = lazy(() => import("./pages/LearnLesson"));
const LearnQuiz = lazy(() => import("./pages/LearnQuiz"));
const LearnLessonQuiz = lazy(() => import("./pages/LearnLessonQuiz"));
const LearnGlossary = lazy(() => import("./pages/LearnGlossary"));
const LearnCharts = lazy(() => import("./pages/LearnCharts"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Social = lazy(() => import("./pages/Social"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Orders = lazy(() => import("./pages/Orders"));
const SimulationLab = lazy(() => import("./pages/SimulationLab"));
const Tools = lazy(() => import("./pages/Tools"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Auth = lazy(() => import("./pages/Auth"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed"));
const CommunityRoom = lazy(() => import("./pages/CommunityRoom"));
const DirectMessages = lazy(() => import("./pages/DirectMessages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const BrokerConnections = lazy(() => import("./pages/BrokerConnections"));
const BehavioralRisk = lazy(() => import("./pages/BehavioralRisk"));
const HeatEngine = lazy(() => import("./pages/HeatEngine"));
const Heatmap = lazy(() => import("./pages/Heatmap"));
const News = lazy(() => import("./pages/News"));
const Markets = lazy(() => import("./pages/Markets"));
const Calendar = lazy(() => import("./pages/Calendar"));
const InsiderTracking = lazy(() => import("./pages/InsiderTracking"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BrowseRooms = lazy(() => import("./pages/BrowseRooms"));
const CreateRoom = lazy(() => import("./pages/CreateRoom"));
const JoinRoom = lazy(() => import("./pages/JoinRoom"));
const DataSources = lazy(() => import("./pages/DataSources"));
const Methodology = lazy(() => import("./pages/Methodology"));
const Transparency = lazy(() => import("./pages/Transparency"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Sensible defaults: skip noisy refetches, share results across components.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TimezoneProvider>
      <SidebarConfigProvider>
      <AuthProvider>
      <TradingModeProvider>
      <MavenChatProvider>
      <WalkthroughProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <WalkthroughOverlay />
          <AppLayout>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/invest" element={<Invest />} />
              <Route path="/invest/:symbol" element={<StockDetail />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/charts" element={<LearnCharts />} />
              <Route path="/learn/glossary" element={<LearnGlossary />} />
              <Route path="/learn/:courseId/quiz" element={<LearnQuiz />} />
              <Route path="/learn/:courseId/test" element={<LearnQuiz />} />
              <Route path="/learn/:courseId/:lessonIndex/quiz" element={<LearnLessonQuiz />} />
              <Route path="/learn/:courseId/:lessonIndex" element={<LearnLesson />} />
              <Route path="/learn/:courseId" element={<LearnModule />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/social" element={<Social />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/simulation" element={<SimulationLab />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/community" element={<CommunityFeed />} />
              <Route path="/community/rooms" element={<BrowseRooms />} />
              <Route path="/community/create-room" element={<CreateRoom />} />
              <Route path="/community/room/:slug" element={<CommunityRoom />} />
              <Route path="/join/:code" element={<JoinRoom />} />
              <Route path="/community/dms" element={<DirectMessages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings/broker" element={<BrokerConnections />} />
              
              <Route path="/behavioral-risk" element={<BehavioralRisk />} />
              <Route path="/heat-engine" element={<HeatEngine />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/news" element={<News />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/insider-tracking" element={<InsiderTracking />} />
              <Route path="/institutional/data-sources" element={<DataSources />} />
              <Route path="/institutional/methodology" element={<Methodology />} />
              <Route path="/institutional/transparency" element={<Transparency />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
      </WalkthroughProvider>
      </MavenChatProvider>
      </TradingModeProvider>
      </AuthProvider>
      </SidebarConfigProvider>
      </TimezoneProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
