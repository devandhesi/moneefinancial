import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "monee-timezone";

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
}

const TimezoneContext = createContext<TimezoneContextType | null>(null);

export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern (ET)", short: "ET" },
  { value: "America/Chicago", label: "Central (CT)", short: "CT" },
  { value: "America/Denver", label: "Mountain (MT)", short: "MT" },
  { value: "America/Los_Angeles", label: "Pacific (PT)", short: "PT" },
  { value: "America/Toronto", label: "Toronto (ET)", short: "ET" },
  { value: "America/Vancouver", label: "Vancouver (PT)", short: "PT" },
  { value: "America/Halifax", label: "Atlantic (AT)", short: "AT" },
  { value: "America/St_Johns", label: "Newfoundland (NT)", short: "NT" },
  { value: "Europe/London", label: "London (GMT/BST)", short: "GMT" },
  { value: "Europe/Paris", label: "Paris (CET)", short: "CET" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", short: "JST" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", short: "HKT" },
  { value: "Australia/Sydney", label: "Sydney (AEST)", short: "AEST" },
  { value: "UTC", label: "UTC", short: "UTC" },
];

function getDefault(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {}
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTz] = useState(getDefault);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, timezone);
  }, [timezone]);

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone: setTz }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const ctx = useContext(TimezoneContext);
  if (!ctx) throw new Error("useTimezone must be used within TimezoneProvider");
  return ctx;
}
