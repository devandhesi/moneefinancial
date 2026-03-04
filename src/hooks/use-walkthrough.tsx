import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WalkthroughStep {
  targetId: string;
  title: string;
  description: string;
  route?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

export interface Tour {
  id: string;
  label: string;
  description: string;
  icon: string;
  steps: WalkthroughStep[];
}

const GETTING_STARTED: WalkthroughStep[] = [
  {
    targetId: "tour-welcome",
    title: "Welcome to Monee! 👋",
    description: "Let's get you set up in under a minute. We'll walk you through the key features so you can start paper trading right away.",
    route: "/",
    position: "center",
  },
  {
    targetId: "tour-portfolio-value",
    title: "Your Portfolio Value",
    description: "This shows your total portfolio balance — cash plus investments. Right now it's $0, but we'll fix that!",
    route: "/",
    position: "bottom",
  },
  {
    targetId: "tour-accounts-summary",
    title: "Cash & Investments",
    description: "Here you can see your cash balance and investment value broken down. Cash is what you use to buy stocks.",
    route: "/",
    position: "top",
  },
  {
    targetId: "tour-settings-link",
    title: "Head to Settings",
    description: "Let's go to Settings to add paper money to your account so you can start trading.",
    route: "/",
    position: "right",
  },
  {
    targetId: "tour-deposit-section",
    title: "Add Paper Money 💰",
    description: "Enter an amount or tap a quick-add button like $10K. This is simulated money — not real! Tap 'Add' when ready.",
    route: "/settings",
    position: "top",
  },
  {
    targetId: "tour-invest-link",
    title: "Find Stocks to Buy",
    description: "Head to Invest to search for stocks, view prices and charts, and place your first paper trade.",
    route: "/settings",
    position: "right",
  },
  {
    targetId: "tour-invest-search",
    title: "Search & Browse Stocks",
    description: "Type a company name or ticker symbol to find stocks. Tap any stock to see details and buy/sell.",
    route: "/invest",
    position: "bottom",
  },
  {
    targetId: "tour-watchlist-link",
    title: "Save Stocks to Watchlist ⭐",
    description: "Track stocks you're interested in by adding them to your Watchlist. You'll see live prices and changes.",
    route: "/invest",
    position: "right",
  },
  {
    targetId: "tour-maven-fab",
    title: "Ask Maven AI 🤖",
    description: "Maven is your personal financial assistant. Ask anything about markets, your portfolio, or investing concepts.",
    route: "/",
    position: "left",
  },
  {
    targetId: "tour-complete",
    title: "You're All Set! 🎉",
    description: "You've completed the walkthrough. Start by adding funds in Settings, then explore stocks to buy. Happy trading!",
    route: "/",
    position: "center",
  },
];

const ANALYZING_GRAPHS: WalkthroughStep[] = [
  {
    targetId: "tour-graphs-intro",
    title: "Learn to Read Charts 📊",
    description: "Welcome to the chart analysis tutorial. You'll learn how to read stock charts, use indicators, and spot patterns with Maven AI as your teacher.",
    route: "/learn/charts",
    position: "center",
  },
  {
    targetId: "tour-charts-search",
    title: "Pick a Stock",
    description: "Start by searching for any stock — try AAPL, TSLA, or NVDA. You can also tap one of the popular stocks below the search bar.",
    route: "/learn/charts",
    position: "bottom",
  },
  {
    targetId: "tour-charts-popular",
    title: "Quick Pick Stocks",
    description: "These are popular stocks to analyze. Tap any one to instantly load its chart. Great for practice!",
    route: "/learn/charts",
    position: "top",
  },
  {
    targetId: "tour-charts-timerange",
    title: "Timeframe Controls",
    description: "Switch between 1 Day, 1 Week, 1 Month, and more. Different timeframes reveal different patterns — short-term traders use 1D/1W, long-term investors use 3M/1Y.",
    route: "/learn/charts",
    position: "top",
  },
  {
    targetId: "tour-charts-mode",
    title: "Chart Modes",
    description: "Simple mode shows a clean line. Candle mode shows open/high/low/close per period — essential for technical analysis. Try switching!",
    route: "/learn/charts",
    position: "bottom",
  },
  {
    targetId: "tour-charts-indicators",
    title: "Technical Indicators",
    description: "Toggle SMA20, EMA12, Bollinger Bands, and Volume. These overlays help you spot trends, momentum, and volatility. Tap each to see it on the chart.",
    route: "/learn/charts",
    position: "top",
  },
  {
    targetId: "tour-charts-ai",
    title: "Ask Maven to Teach You 🧠",
    description: "This is your AI chart teacher. Ask 'What does this pattern mean?' or 'Is the volume significant?' — Maven sees the same chart data you do and explains it in plain English.",
    route: "/learn/charts",
    position: "left",
  },
  {
    targetId: "tour-graphs-done",
    title: "You're a Chart Reader Now! 📈",
    description: "Practice makes perfect. Load different stocks, toggle indicators, switch timeframes, and ask Maven questions. The more you explore, the better you'll read charts.",
    route: "/learn/charts",
    position: "center",
  },
];

export const ALL_TOURS: Tour[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Learn the basics — add funds, find stocks, place trades",
    icon: "🚀",
    steps: GETTING_STARTED,
  },
  {
    id: "analyzing-graphs",
    label: "Analyzing Charts",
    description: "Read stock charts, use indicators, and spot patterns",
    icon: "📊",
    steps: ANALYZING_GRAPHS,
  },
];

interface WalkthroughContextType {
  isActive: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  activeTourId: string | null;
  startTour: (tourId?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);

  const activeTour = ALL_TOURS.find((t) => t.id === activeTourId);
  const steps = activeTour?.steps || [];

  const startTour = useCallback((tourId: string = "getting-started") => {
    setActiveTourId(tourId);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        setIsActive(false);
        setActiveTourId(null);
        return 0;
      }
      return prev + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setActiveTourId(null);
    setCurrentStep(0);
  }, []);

  return (
    <WalkthroughContext.Provider value={{ isActive, currentStep, steps, activeTourId, startTour, nextStep, prevStep, skipTour }}>
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used within WalkthroughProvider");
  return ctx;
}
