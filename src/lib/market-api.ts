import { supabase } from "@/integrations/supabase/client";

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: string;
  peRatio: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  avgVolume: string;
  dividendYield: string;
  beta: number | null;
  chart: ChartPoint[];
}

export interface ChartPoint {
  date: string;
  timestamp: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  sector: string;
  marketCap: number;
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const { data, error } = await supabase.functions.invoke("stock-search", {
    body: { query },
  });
  if (error) throw error;
  return data?.results || [];
}

export async function getStockQuote(symbol: string, range?: string): Promise<StockQuote> {
  const { data, error } = await supabase.functions.invoke("stock-quote", {
    body: { symbol, range: range || "3M" },
  });
  if (error) throw error;
  return data;
}

export async function getTrendingStocks(): Promise<TrendingStock[]> {
  const { data, error } = await supabase.functions.invoke("trending-stocks", {
    body: {},
  });
  if (error) throw error;
  return data?.stocks || [];
}
