/**
 * Trending Coins Component
 * 
 * Displays trending/popular cryptocurrencies
 * based on search popularity on CoinGecko
 */

import { TrendingUp, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrendingCoins } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";

interface TrendingCoinsProps {
  onSelectCoin?: (coinId: string) => void;
}

/**
 * Single trending coin card
 */
function TrendingCoinCard({
  rank,
  name,
  symbol,
  image,
  onClick,
}: {
  rank: number;
  name: string;
  symbol: string;
  image: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-muted"
    >
      {/* Rank Badge */}
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
          rank === 1
            ? "bg-warning/20 text-warning"
            : rank === 2
            ? "bg-muted-foreground/20 text-muted-foreground"
            : rank === 3
            ? "bg-warning/10 text-warning"
            : "bg-muted text-muted-foreground"
        )}
      >
        {rank}
      </div>

      {/* Coin Image */}
      <img
        src={image}
        alt={name}
        className="h-8 w-8 rounded-full"
        loading="lazy"
      />

      {/* Coin Info */}
      <div className="flex-1 text-left">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground uppercase">{symbol}</div>
      </div>

      {/* Trending Icon */}
      <TrendingUp className="h-4 w-4 text-success" />
    </button>
  );
}

/**
 * Loading skeleton
 */
function TrendingCoinSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="h-6 w-6 rounded-full bg-muted shimmer" />
      <div className="h-8 w-8 rounded-full bg-muted shimmer" />
      <div className="flex-1 space-y-1">
        <div className="h-4 w-20 rounded bg-muted shimmer" />
        <div className="h-3 w-12 rounded bg-muted shimmer" />
      </div>
    </div>
  );
}

export function TrendingCoins({ onSelectCoin }: TrendingCoinsProps) {
  const { data: trendingCoins, isLoading, error } = useTrendingCoins();

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Flame className="h-5 w-5 text-warning" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {/* Loading State */}
        {isLoading && (
          <>
            {[...Array(7)].map((_, i) => (
              <TrendingCoinSkeleton key={i} />
            ))}
          </>
        )}

        {/* Error State */}
        {error && (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load trending coins
            </p>
          </div>
        )}

        {/* Trending Coins List */}
        {!isLoading &&
          !error &&
          trendingCoins?.slice(0, 7).map((coin, index) => (
            <TrendingCoinCard
              key={coin.item.id}
              rank={index + 1}
              name={coin.item.name}
              symbol={coin.item.symbol}
              image={coin.item.small}
              onClick={() => onSelectCoin?.(coin.item.id)}
            />
          ))}
      </CardContent>
    </Card>
  );
}
