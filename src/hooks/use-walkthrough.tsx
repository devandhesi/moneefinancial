import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WalkthroughStep {
  targetId: string;         // data-tour-id value
  title: string;
  description: string;
  route?: string;           // auto-navigate to this route before highlighting
  action?: "click";         // simulate interaction hint
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
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

interface WalkthroughContextType {
  isActive: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= WALKTHROUGH_STEPS.length - 1) {
        setIsActive(false);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  return (
    <WalkthroughContext.Provider value={{ isActive, currentStep, steps: WALKTHROUGH_STEPS, startTour, nextStep, prevStep, skipTour }}>
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthrough must be used within WalkthroughProvider");
  return ctx;
}
