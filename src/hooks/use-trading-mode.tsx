import { useState, useEffect, createContext, useContext, type ReactNode } from "react";

type TradingMode = "paper" | "real";

interface TradingModeContextType {
  mode: TradingMode;
  setMode: (mode: TradingMode) => void;
  hasBrokerConnected: boolean;
  setHasBrokerConnected: (v: boolean) => void;
}

const TradingModeContext = createContext<TradingModeContextType>({
  mode: "paper",
  setMode: () => {},
  hasBrokerConnected: false,
  setHasBrokerConnected: () => {},
});

export function TradingModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<TradingMode>(() => {
    const stored = localStorage.getItem("monee-trading-mode");
    return stored === "real" ? "real" : "paper";
  });
  const [hasBrokerConnected, setHasBrokerConnected] = useState(() => {
    return localStorage.getItem("monee-broker-connected") === "true";
  });

  const setMode = (m: TradingMode) => {
    // Can only switch to real if a broker is connected
    if (m === "real" && !hasBrokerConnected) return;
    setModeState(m);
    localStorage.setItem("monee-trading-mode", m);
  };

  useEffect(() => {
    localStorage.setItem("monee-broker-connected", String(hasBrokerConnected));
    if (!hasBrokerConnected && mode === "real") {
      setModeState("paper");
      localStorage.setItem("monee-trading-mode", "paper");
    }
  }, [hasBrokerConnected]);

  return (
    <TradingModeContext.Provider value={{ mode, setMode, hasBrokerConnected, setHasBrokerConnected }}>
      {children}
    </TradingModeContext.Provider>
  );
}

export function useTradingMode() {
  return useContext(TradingModeContext);
}
