import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, ExternalLink, Loader2, Sparkles, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";

interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
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
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 15,
  });
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "";
  }
}

const NewsCard = ({ article }: { article: NewsArticle }) => (
  <a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    className="glass-card block p-4 transition-all hover:shadow-md active:scale-[0.99]"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{article.title}</h3>
        {article.summary && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {article.summary}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          {article.publishedAt && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </>
          )}
          {article.relatedSymbols.length > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              {article.relatedSymbols.map((s) => (
                <span key={s} className="rounded bg-secondary px-1.5 py-0.5 font-semibold">
                  {s}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
      <ExternalLink size={14} className="mt-1 shrink-0 text-muted-foreground/40" />
    </div>
  </a>
);

const News = () => {
  const { data, isLoading } = useStockNews();
  const [activeTab, setActiveTab] = useState<"your" | "market">("your");

  return (
    <div className="px-5 pt-14 lg:pt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <Newspaper size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">News</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Stay informed with news that matters to your portfolio
        </p>
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
          className="glass-card mt-4 p-4"
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
                key={article.url}
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
              key={article.url}
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
