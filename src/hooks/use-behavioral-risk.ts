import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function behavioralAction(action: string) {
  const { data, error } = await supabase.functions.invoke("behavioral-risk", {
    body: { action },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useBehavioralAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => behavioralAction("analyze"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["behavioral-history"] });
    },
  });
}

export function useBehavioralHistory() {
  return useQuery({
    queryKey: ["behavioral-history"],
    queryFn: () => behavioralAction("history"),
    staleTime: 1000 * 60 * 5,
  });
}
