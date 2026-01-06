import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Newspaper, TrendingUp, TrendingDown, Flame, Zap } from "lucide-react";
import { useCryptoNews } from "@/hooks/useCryptoNews";
import { NewsItem, NewsFilter, hasNewsApiKey } from "@/services/newsApi";
import { formatDistanceToNow } from "date-fns";

const getSentiment = (votes: NewsItem["votes"]): "bullish" | "bearish" | "neutral" => {
  const bullishScore = votes.positive + votes.liked;
  const bearishScore = votes.negative + votes.disliked;
  
  if (bullishScore > bearishScore * 2) return "bullish";
  if (bearishScore > bullishScore * 2) return "bearish";
  return "neutral";
};

const SentimentBadge = ({ sentiment }: { sentiment: "bullish" | "bearish" | "neutral" }) => {
  if (sentiment === "bullish") {
    return (
      <Badge className="gap-1 bg-success/20 text-success border-success/30 text-xs">
        <TrendingUp className="h-3 w-3" />
        Bullish 🚀
      </Badge>
    );
  }
  if (sentiment === "bearish") {
    return (
      <Badge className="gap-1 bg-destructive/20 text-destructive border-destructive/30 text-xs">
        <TrendingDown className="h-3 w-3" />
        Bearish 💀
      </Badge>
    );
  }
  return null;
};

const NewsCard = ({ news }: { news: NewsItem }) => {
  const sentiment = getSentiment(news.votes);
  const timeAgo = formatDistanceToNow(new Date(news.published_at), { addSuffix: true });

  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border/50 bg-card/50 p-3 transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {news.source.title}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <h4 className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
        {news.title}
      </h4>

      <div className="flex flex-wrap items-center gap-2">
        <SentimentBadge sentiment={sentiment} />
        {news.currencies?.slice(0, 3).map((currency) => (
          <Badge
            key={currency.code}
            variant="secondary"
            className="text-xs font-mono"
          >
            {currency.code}
          </Badge>
        ))}
      </div>
    </a>
  );
};

const NewsCardSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-card/50 p-3">
    <div className="mb-2 flex items-center gap-2">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="mb-2 h-4 w-3/4" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-12" />
    </div>
  </div>
);

export const NewsFeed = () => {
  const [filter, setFilter] = useState<NewsFilter>("all");
  const { data: news, isLoading, error } = useCryptoNews(filter);
  const hasApiKey = hasNewsApiKey();

  return (
    <Card className="glass-card neon-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-genz">
              <Newspaper className="h-4 w-4 text-white" />
            </span>
            Crypto News
          </CardTitle>
          {!hasApiKey && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Demo Mode
            </Badge>
          )}
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as NewsFilter)} className="mt-3">
          <TabsList className="h-8 w-full justify-start rounded-full bg-secondary/50 p-1">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-full px-2 text-xs data-[state=active]:gradient-genz data-[state=active]:text-white sm:flex-none sm:px-3"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="hot"
              className="flex-1 gap-1 rounded-full px-2 text-xs data-[state=active]:gradient-genz data-[state=active]:text-white sm:flex-none sm:px-3"
            >
              <Flame className="h-3 w-3" />
              <span className="hidden sm:inline">Hot</span>
            </TabsTrigger>
            <TabsTrigger
              value="bullish"
              className="flex-1 gap-1 rounded-full px-2 text-xs data-[state=active]:gradient-genz data-[state=active]:text-white sm:flex-none sm:px-3"
            >
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Bullish</span>
            </TabsTrigger>
            <TabsTrigger
              value="bearish"
              className="flex-1 gap-1 rounded-full px-2 text-xs data-[state=active]:gradient-genz data-[state=active]:text-white sm:flex-none sm:px-3"
            >
              <TrendingDown className="h-3 w-3" />
              <span className="hidden sm:inline">Bearish</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {isLoading ? (
          <>
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">Failed to load news</p>
            <p className="mt-1 text-xs text-muted-foreground">Please try again later</p>
          </div>
        ) : news && news.length > 0 ? (
          news.map((item) => <NewsCard key={item.id} news={item} />)
        ) : (
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 text-center">
            <Zap className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No news available</p>
          </div>
        )}

        {!hasApiKey && (
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              🔑 Add <code className="rounded bg-secondary px-1 text-accent">VITE_CRYPTOPANIC_API_KEY</code> for live news
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
