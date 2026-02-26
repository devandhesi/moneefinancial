import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BrokerConnection {
  id: string;
  user_id: string;
  provider: string;
  status: string;
  last_sync_at: string | null;
  metadata: any;
  created_at: string;
}

export interface BrokerPortfolio {
  accounts: any[];
  positions: any[];
  orders: any[];
  fills: any[];
  summary: { totalCash: number; totalValue: number; positionCount: number };
}

async function brokerAction(action: string, extra: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("broker", {
    body: { action, ...extra },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useBrokerConnections() {
  return useQuery({
    queryKey: ["broker-connections"],
    queryFn: () => brokerAction("get_connections") as Promise<BrokerConnection[]>,
    staleTime: 1000 * 30,
  });
}

export function useBrokerPortfolio() {
  return useQuery({
    queryKey: ["broker-portfolio"],
    queryFn: () => brokerAction("get_portfolio") as Promise<BrokerPortfolio>,
    staleTime: 1000 * 60,
  });
}

export function useConnectAlpaca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { api_key: string; api_secret: string }) =>
      brokerAction("connect_alpaca", args),
    onSuccess: () => {
      toast.success("Alpaca connected successfully");
      qc.invalidateQueries({ queryKey: ["broker-connections"] });
      qc.invalidateQueries({ queryKey: ["broker-portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSyncBroker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => brokerAction("sync", { provider }),
    onSuccess: () => {
      toast.success("Sync completed");
      qc.invalidateQueries({ queryKey: ["broker-connections"] });
      qc.invalidateQueries({ queryKey: ["broker-portfolio"] });
    },
    onError: (e: Error) => toast.error(`Sync failed: ${e.message}`),
  });
}

export function useDisconnectBroker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => brokerAction("disconnect", { provider }),
    onSuccess: () => {
      toast.success("Disconnected");
      qc.invalidateQueries({ queryKey: ["broker-connections"] });
      qc.invalidateQueries({ queryKey: ["broker-portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useImportCsv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any[]) => brokerAction("import_csv", { data }),
    onSuccess: () => {
      toast.success("CSV imported successfully");
      qc.invalidateQueries({ queryKey: ["broker-connections"] });
      qc.invalidateQueries({ queryKey: ["broker-portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
