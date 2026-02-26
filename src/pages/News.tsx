import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, ExternalLink, Loader2, Sparkles, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string;
  relatedSymbols: string[];
}

interface ImpactItem {
  title: string;
  impact: string;
}

interface NewsData {
  yourNews: NewsArticle[];
  marketNews: NewsArticle[];
  impactAnalysis: ImpactItem[];
  generatedAt: string;
}

function useStockNews() {
  return useQuery({
    queryKey: ["stock-news"],
    queryFn: async (): Promise<NewsData> => {
      const { data, error } = await supabase.functions.invoke("stock-news", {
        body: { holdings: ["AAPL", "MSFT", "GOOGL", "TSLA"] },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
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
  } catch {
    return "";
  }
}

function isValidUrl(url: string): boolean {
  try {
    return url?.startsWith("http://") || url?.startsWith("https://");
  } catch {
    return false;
  }
}

const NewsCard = ({ article }: { article: NewsArticle }) => {
  const hasValidLink = isValidUrl(article.url);
  const Wrapper = hasValidLink ? "a" : "div";
  const linkProps = hasValidLink
    ? { href: article.url, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="block rounded-xl border border-border/40 bg-card p-4 transition-all hover:bg-secondary/30 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{article.title}</h3>
          {article.summary && (
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {article.summary}
            </p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-muted-foreground">
            <span className="font-medium">{article.source}</span>
            {article.author && article.author !== article.source && (
              <>
                <span className="opacity-40">·</span>
                <span>{article.author}</span>
              </>
            )}
            {article.publishedAt && (
              <>
                <span className="opacity-40">·</span>
                <span>{timeAgo(article.publishedAt)}</span>
              </>
            )}
            {article.relatedSymbols?.length > 0 && (
              <>
                <span className="opacity-40">·</span>
                {article.relatedSymbols.map((s) => (
                  <span key={s} className="rounded bg-secondary px-1.5 py-0.5 font-semibold text-foreground">
                    {s}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
        {hasValidLink && (
          <ExternalLink size={13} className="mt-1 shrink-0 text-muted-foreground/30" />
        )}
      </div>
    </Wrapper>
  );
};

const News = () => {
  const { data, isLoading, refetch, isFetching } = useStockNews();
  const [activeTab, setActiveTab] = useState<"your" | "market">("your");

  return (
    <div className="px-5 pb-24 pt-14 lg:pb-8 lg:pt-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Newspaper size={20} className="text-muted-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight">News</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              News that matters to your portfolio
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-xl bg-secondary p-1">
        {[
          { key: "your" as const, label: "Your Stocks", icon: TrendingUp },
          { key: "market" as const, label: "Market News", icon: Newspaper },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* AI Impact Analysis Banner */}
      {activeTab === "market" && data?.impactAnalysis && data.impactAnalysis.length > 0 && (
        <motion.div
          className="mt-4 rounded-xl border border-border/40 bg-card p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles size={14} className="text-muted-foreground" />
            <span>Maven Market Analysis</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {data.impactAnalysis.map((item, i) => (
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

      {/* News List */}
      <div className="mt-4 space-y-2 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : activeTab === "your" ? (
          data?.yourNews && data.yourNews.length > 0 ? (
            data.yourNews.map((article, i) => (
              <motion.div
                key={`${article.title}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <NewsCard article={article} />
              </motion.div>
            ))
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No news found for your holdings right now.
            </div>
          )
        ) : data?.marketNews && data.marketNews.length > 0 ? (
          data.marketNews.map((article, i) => (
            <motion.div
              key={`${article.title}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <NewsCard article={article} />
            </motion.div>
          ))
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No market news available right now.
          </div>
        )}
      </div>

      {/* Last updated */}
      {data?.generatedAt && (
        <p className="pb-4 text-center text-[10px] text-muted-foreground/50">
          Updated {timeAgo(data.generatedAt)}
        </p>
      )}
    </div>
  );
};

export default News;
