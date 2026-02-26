import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  RefreshCw,
  Newspaper,
  FileText,
  Eye,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  User,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface InsiderReport {
  insider: string;
  company: string;
  symbol: string;
  transactionType: string;
  shares: number;
  price: number;
  value: number;
  date: string;
  source: string;
  url: string;
}

interface StockWatchItem {
  symbol: string;
  company: string;
  activity: string;
  actor: string;
  details: string;
  volume: number;
  priceChange: number;
  date: string;
  significance: string;
  source: string;
}

interface NewsItem {
  title: string;
  summary: string;
  author: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
}

const AUTO_REFRESH_MS = 60_000; // 1 min

const Reports = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("news");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sedi, setSedi] = useState<InsiderReport[]>([]);
  const [stockWatch, setStockWatch] = useState<StockWatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("reports-data", {
        body: { section: "all" },
      });
      if (error) throw error;
      setNews(data?.news || []);
      setSedi(data?.insiderReports || []);
      setStockWatch(data?.stockWatch || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Reports fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (n: number) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n?.toLocaleString() || "0";
  };

  const formatCurrency = (n: number) => {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n?.toFixed(2);
  };

  const txBadgeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("purchase") || t.includes("buy")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    if (t.includes("sale") || t.includes("sell") || t.includes("disposition")) return "bg-red-500/15 text-red-400 border-red-500/20";
    if (t.includes("grant") || t.includes("exercise")) return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    return "bg-muted text-muted-foreground";
  };

  const sigBadge = (sig: string) => {
    if (sig === "high") return "bg-red-500/15 text-red-400 border-red-500/20";
    if (sig === "medium") return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Live market intelligence · SEDI filings · Insider activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={12} />
              {formatTime(lastUpdated.toISOString())}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="news" className="gap-1.5">
            <Newspaper size={14} />
            News
          </TabsTrigger>
          <TabsTrigger value="sedi" className="gap-1.5">
            <FileText size={14} />
            SEDI / Insider
          </TabsTrigger>
          <TabsTrigger value="stockwatch" className="gap-1.5">
            <Eye size={14} />
            StockWatch
          </TabsTrigger>
        </TabsList>

        {/* NEWS TAB */}
        <TabsContent value="news" className="space-y-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </Card>
            ))
          ) : news.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Newspaper size={32} className="mx-auto mb-2 opacity-40" />
              <p>No news articles available right now.</p>
            </Card>
          ) : (
            news.map((item, i) => (
              <Card key={i} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">
                      {item.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatTime(item.publishedAt)}
                    </span>
                  </div>
                  {item.url?.startsWith("http") ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold hover:underline flex items-center gap-1.5"
                    >
                      <span className="line-clamp-2">{item.title}</span>
                      <ExternalLink size={12} className="shrink-0 text-muted-foreground/40" />
                    </a>
                  ) : (
                    <p className="text-sm font-semibold line-clamp-2">{item.title}</p>
                  )}
                  {item.summary && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <User size={11} />
                    <span>{item.author}</span>
                    {item.author !== item.source && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{item.source}</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* SEDI TAB */}
        <TabsContent value="sedi" className="space-y-3">
          <Card className="p-3 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle size={14} />
              <span>
                SEDI & SEC insider filings sourced from public records. Verify with{" "}
                <a href="https://www.sedi.ca" target="_blank" rel="noopener noreferrer" className="underline">
                  sedi.ca
                </a>{" "}
                or{" "}
                <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=4" target="_blank" rel="noopener noreferrer" className="underline">
                  SEC EDGAR
                </a>
                .
              </span>
            </div>
          </Card>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))
          ) : sedi.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p>No insider reports available.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-2">
                <Card className="p-3 text-center">
                  <p className="text-lg font-bold text-emerald-400">
                    {sedi.filter(s => s.transactionType.toLowerCase().includes("purchase") || s.transactionType.toLowerCase().includes("buy")).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Buys</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-lg font-bold text-red-400">
                    {sedi.filter(s => s.transactionType.toLowerCase().includes("sale") || s.transactionType.toLowerCase().includes("sell")).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sales</p>
                </Card>
                <Card className="p-3 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(sedi.reduce((sum, s) => sum + (s.value || 0), 0))}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
                </Card>
              </div>

              {sedi.map((item, i) => {
                const isBuy = item.transactionType.toLowerCase().includes("purchase") || item.transactionType.toLowerCase().includes("buy");
                return (
                  <Card key={i} className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => navigate(`/stock/${item.symbol}`)}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{item.symbol}</span>
                          <span className="text-xs text-muted-foreground">{item.company}</span>
                          <ExternalLink size={11} className="text-muted-foreground/40" />
                        </div>
                        <Badge className={`text-[10px] ${txBadgeColor(item.transactionType)}`}>
                          {isBuy ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                          {item.transactionType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <User size={12} className="text-muted-foreground" />
                        <span className="font-medium">{item.insider}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Shares</p>
                          <p className="font-semibold">{formatNumber(item.shares)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-semibold">${item.price?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Value</p>
                          <p className={`font-semibold ${isBuy ? "text-emerald-400" : "text-red-400"}`}>
                            {formatCurrency(item.value)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{item.date}</span>
                        <span>{item.source}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* STOCKWATCH TAB */}
        <TabsContent value="stockwatch" className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))
          ) : stockWatch.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Eye size={32} className="mx-auto mb-2 opacity-40" />
              <p>No notable activity detected.</p>
            </Card>
          ) : (
            stockWatch.map((item, i) => {
              const isPositive = item.priceChange >= 0;
              return (
                <Card
                  key={i}
                  className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.symbol}</span>
                        <span className="text-xs text-muted-foreground">{item.company}</span>
                        <ExternalLink size={11} className="text-muted-foreground/40" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${sigBadge(item.significance)}`}>
                          {item.significance}
                        </Badge>
                        {item.priceChange !== 0 && (
                          <span className={`text-xs font-semibold flex items-center ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isPositive ? "+" : ""}{item.priceChange?.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {item.activity}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Building2 size={12} className="text-muted-foreground" />
                      <span className="font-medium">{item.actor}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.details}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Vol: {formatNumber(item.volume)}</span>
                      <span>{item.date} · {item.source}</span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
