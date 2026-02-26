import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MoodData {
  score: number;
  mood: string;
  moodIdx: number;
  insight: string;
}

export interface HealthFactor {
  label: string;
  score: number;
}

export interface HealthData {
  score: number;
  factors: HealthFactor[];
  insight: string;
}

export interface UpcomingEvent {
  date: string;
  label: string;
  type: string;
}

export interface DailyDigest {
  mood: MoodData;
  health: HealthData;
  aiInsight: string;
  upcomingEvents: UpcomingEvent[];
  generatedAt: string;
}

export function useDailyDigest() {
  return useQuery({
    queryKey: ["daily-digest"],
    queryFn: async (): Promise<DailyDigest> => {
      const { data, error } = await supabase.functions.invoke("daily-digest", {
        body: { holdings: ["AAPL", "MSFT", "GOOGL", "TSLA"] },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // refresh every hour
    refetchOnWindowFocus: false,
  });
}
