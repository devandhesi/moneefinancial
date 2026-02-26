import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Newspaper, ExternalLink, Loader2, Sparkles, TrendingUp,
  AlertTriangle, RefreshCw, Briefcase, Flame, BarChart3,
  Globe, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string;
  relatedSymbols: string[];
  category?: string;
}

interface ImpactItem { title: string; impact: string; }

interface NewsData {
  holdingsNews: NewsArticle[];
  watchlistNews: NewsArticle[];
  trendingNews: NewsArticle[];
  sectorNews: NewsArticle[];
  marketNews: NewsArticle[];
  impactAnalysis: ImpactItem[];
  generatedAt: string;
}

const TABS = [
  { key: "all", label: "All News", icon: Globe },
  { key: "my-stocks", label: "My Stocks", icon: Star },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "important", label: "Important", icon: AlertTriangle },
  { key: "sectors", label: "Sectors", icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function useStockNews() {
  return useQuery({
    queryKey: ["stock-news-v2"],
    queryFn: async (): Promise<NewsData> => {
      // Get user watchlist for "My Stocks" tab
      const watchlist: string[] = JSON.parse(localStorage.getItem("monee-watchlist") || "[]");
      const { data, error } = await supabase.functions.invoke("stock-news", {
        body: {
          holdings: ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"],
          watchlist: watchlist.length > 0 ? watchlist : ["NVDA", "META", "AMD", "PLTR", "COIN"],
          trending: ["NVDA", "TSLA", "SMCI", "PLTR", "GME", "RIVN", "SOFI", "ARM"],
        },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 3,
    refetchInterval: 1000 * 60 * 3,
  });
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return ""; }
}

function isValidUrl(url: string): boolean {
  try { return url?.startsWith("http://") || url?.startsWith("https://"); } catch { return false; }
}

const NewsCard = ({ article }: { article: NewsArticle }) => {
  const hasValidLink = isValidUrl(article.url);
  const Wrapper = hasValidLink ? "a" : "div";
  const linkProps = hasValidLink ? { href: article.url, target: "_blank" as const, rel: "noopener noreferrer" } : {};

  return (
    <Wrapper {...linkProps} className="block rounded-xl border border-border/40 bg-card p-4 transition-all hover:bg-secondary/30 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{article.title}</h3>
          {article.summary && <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{article.summary}</p>}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            {article.author && article.author !== article.source && (
              <><span className="opacity-40">·</span><span>{article.author}</span></>
            )}
            {article.publishedAt && (
              <><span className="opacity-40">·</span><span>{timeAgo(article.publishedAt)}</span></>
            )}
            {article.relatedSymbols?.length > 0 && (
              <>{article.relatedSymbols.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-semibold">{s}</Badge>
              ))}</>
            )}
          </div>
        </div>
        {hasValidLink && <ExternalLink size={13} className="mt-1 shrink-0 text-muted-foreground/30" />}
      </div>
    </Wrapper>
  );
};

function getArticlesForTab(data: NewsData | undefined, tab: TabKey): NewsArticle[] {
  if (!data) return [];
  switch (tab) {
    case "all": {
      const all = [...data.holdingsNews, ...data.watchlistNews, ...data.trendingNews, ...data.marketNews, ...data.sectorNews];
      const seen = new Set<string>();
      return all.filter(a => {
        const key = a.title.toLowerCase().slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    case "my-stocks": return [...data.holdingsNews, ...data.watchlistNews].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    case "trending": return data.trendingNews;
    case "important": return data.marketNews;
    case "sectors": return data.sectorNews;
  }
}

const News = () => {
  const { data, isLoading, refetch, isFetching } = useStockNews();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const articles = getArticlesForTab(data, activeTab);
  const showImpact = (activeTab === "all" || activeTab === "important") && data?.impactAnalysis?.length;

  return (
    <div className="px-5 pb-24 pt-14 lg:pb-8 lg:pt-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper size={20} className="text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">News</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">General market news · Sort by what matters to you</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </motion.div>

      <ScrollArea className="mt-5 w-full">
        <div className="flex gap-1 rounded-xl bg-secondary p-1 w-max min-w-full">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                activeTab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              {label}
              {data && <span className={`ml-0.5 text-[10px] ${activeTab === key ? "text-muted-foreground" : "opacity-50"}`}>{getArticlesForTab(data, key).length}</span>}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <AnimatePresence mode="wait">
        {showImpact && (
          <motion.div key="impact" className="mt-4 rounded-xl border border-border/40 bg-card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles size={14} className="text-muted-foreground" />
              <span>Market Impact Analysis</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {data!.impactAnalysis.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0 text-muted-foreground/60" />
                  <div>
                    <p className="text-xs font-medium leading-snug">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 space-y-2 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading news feeds...</span>
          </div>
        ) : articles.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {articles.map((article, i) => (
                <motion.div key={`${article.title}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <NewsCard article={article} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">No news available for this category right now.</div>
        )}
      </div>

      {data?.generatedAt && (
        <p className="pb-4 text-center text-[10px] text-muted-foreground/50">Auto-refreshes every 3 min · Updated {timeAgo(data.generatedAt)}</p>
      )}
    </div>
  );
};

export default News;
