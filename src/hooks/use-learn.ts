import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

/* ── Streak ────────────────────────────────────────────────── */

export interface LearnStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_xp: number;
  level: number;
}

export function useLearnStreak() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["learn-streak", user?.id],
    queryFn: async (): Promise<LearnStreak | null> => {
      if (!user) return null;
      const { data } = await supabase
        .from("learn_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateStreak() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (xpGained: number) => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabase
        .from("learn_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("learn_streaks").insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_xp: xpGained,
          level: 1,
        });
        return;
      }

      const lastDate = existing.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = existing.current_streak;
      if (lastDate === today) {
        // Already logged today, just add XP
      } else if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const newXp = existing.total_xp + xpGained;
      const newLevel = Math.floor(newXp / 500) + 1;
      const newLongest = Math.max(existing.longest_streak, newStreak);

      await supabase
        .from("learn_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today,
          total_xp: newXp,
          level: newLevel,
        })
        .eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learn-streak"] }),
  });
}

/* ── Quiz Attempts ─────────────────────────────────────────── */

export interface QuizAttempt {
  id: string;
  quiz_type: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  passed: boolean;
  answers: any[];
  time_spent_seconds: number | null;
  attempted_at: string;
}

export function useQuizAttempts(quizId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quiz-attempts", user?.id, quizId],
    queryFn: async (): Promise<QuizAttempt[]> => {
      if (!user) return [];
      let q = supabase
        .from("learn_quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("attempted_at", { ascending: false });
      if (quizId) q = q.eq("quiz_id", quizId);
      const { data } = await q.limit(50);
      return (data as QuizAttempt[]) || [];
    },
    enabled: !!user,
  });
}

export function useSaveQuizAttempt() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const updateStreak = useUpdateStreak();

  return useMutation({
    mutationFn: async (attempt: {
      quiz_type: string;
      quiz_id: string;
      score: number;
      total_questions: number;
      passed: boolean;
      answers: any[];
      time_spent_seconds?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("learn_quiz_attempts").insert({
        user_id: user.id,
        ...attempt,
      });
      // Award XP
      const xp = attempt.passed ? 50 : 10;
      await updateStreak.mutateAsync(xp);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quiz-attempts"] }),
  });
}

/* ── Bookmarks ─────────────────────────────────────────────── */

export function useLearnBookmarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["learn-bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("learn_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

export function useToggleBookmark() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ item_type, item_id }: { item_type: string; item_id: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("learn_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_type", item_type)
        .eq("item_id", item_id)
        .maybeSingle();

      if (existing) {
        await supabase.from("learn_bookmarks").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("learn_bookmarks").insert({
          user_id: user.id,
          item_type,
          item_id,
        });
        return true;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learn-bookmarks"] }),
  });
}

/* ── Notes ─────────────────────────────────────────────────── */

export function useLearnNotes(lessonId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["learn-notes", user?.id, lessonId],
    queryFn: async () => {
      if (!user || !lessonId) return [];
      const { data } = await supabase
        .from("learn_notes")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user && !!lessonId,
  });
}

export function useSaveNote() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ lesson_id, content, source }: { lesson_id: string; content: string; source?: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("learn_notes").insert({
        user_id: user.id,
        lesson_id: lesson_id,
        content,
        source: source || "user",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learn-notes"] }),
  });
}
