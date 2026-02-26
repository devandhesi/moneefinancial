import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function allocationAction(action: string) {
  const { data, error } = await supabase.functions.invoke("capital-allocation", {
    body: { action },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useAllocationAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => allocationAction("analyze"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allocation-history"] });
    },
  });
}

export function useAllocationHistory() {
  return useQuery({
    queryKey: ["allocation-history"],
    queryFn: () => allocationAction("history"),
    staleTime: 1000 * 60 * 5,
  });
}
