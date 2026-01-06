/**
 * Trending Coins Component - Gen Z Edition ✨
 * 
 * Shows what's hot rn with gradient badges
 */

import { TrendingUp, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrendingCoins } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";

interface TrendingCoinsProps {
  onSelectCoin?: (coinId: string) => void;
}

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
      className="flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-primary/10 hover:-translate-y-0.5"
    >
      {/* Rank Badge - Gradient for top 3 */}
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
          rank === 1
            ? "gradient-fire text-white shadow-lg"
            : rank === 2
            ? "gradient-genz text-white"
            : rank === 3
            ? "gradient-mint text-white"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {rank}
      </div>

      <img
        src={image}
        alt={name}
        className="h-9 w-9 rounded-full ring-2 ring-border/50"
        loading="lazy"
      />

      <div className="flex-1 text-left">
        <div className="font-display font-semibold">{name}</div>
        <div className="text-xs uppercase text-muted-foreground">{symbol}</div>
      </div>

      <TrendingUp className="h-4 w-4 text-success" />
    </button>
  );
}

function TrendingCoinSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="h-7 w-7 rounded-full bg-muted shimmer" />
      <div className="h-9 w-9 rounded-full bg-muted shimmer" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-24 rounded bg-muted shimmer" />
        <div className="h-3 w-12 rounded bg-muted shimmer" />
      </div>
    </div>
  );
}

export function TrendingCoins({ onSelectCoin }: TrendingCoinsProps) {
  const { data: trendingCoins, isLoading, error } = useTrendingCoins();

  return (
    <Card className="glass neon-border overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
          <Flame className="h-5 w-5 text-warning" />
          Trending rn 🔥
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {isLoading && (
          <>
            {[...Array(7)].map((_, i) => (
              <TrendingCoinSkeleton key={i} />
            ))}
          </>
        )}

        {error && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              couldn't load trending 😅
            </p>
          </div>
        )}

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
