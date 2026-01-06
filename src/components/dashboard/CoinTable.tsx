/**
 * Coin Table Component
 * 
 * Displays a table of top cryptocurrencies with:
 * - Rank, name, and symbol
 * - Current price and 24h change
 * - Market cap and volume
 * - 7-day sparkline chart
 * - Watchlist toggle
 */

import { Star, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopCoins } from "@/hooks/useCryptoData";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";
import type { CoinMarketData } from "@/services/cryptoApi";
import { useState } from "react";

interface CoinTableProps {
  onSelectCoin?: (coinId: string) => void;
  showWatchlistOnly?: boolean;
}

/**
 * Mini sparkline chart component
 */
function SparklineChart({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Generate SVG path
  const width = 100;
  const height = 32;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={pathD}
        fill="none"
        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

/**
 * Format market cap / volume
 */
function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

/**
 * Single coin row component
 */
function CoinRow({
  coin,
  isInWatchlist,
  onToggleWatchlist,
  onSelect,
}: {
  coin: CoinMarketData;
  isInWatchlist: boolean;
  onToggleWatchlist: () => void;
  onSelect: () => void;
}) {
  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <tr
      className="group cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50"
      onClick={onSelect}
    >
      {/* Rank */}
      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
        {coin.market_cap_rank}
      </td>

      {/* Name */}
      <td className="whitespace-nowrap px-3 py-4">
        <div className="flex items-center gap-3">
          <img
            src={coin.image}
            alt={coin.name}
            className="h-8 w-8 rounded-full"
            loading="lazy"
          />
          <div>
            <div className="font-medium">{coin.name}</div>
            <div className="text-xs text-muted-foreground uppercase">
              {coin.symbol}
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="whitespace-nowrap px-3 py-4 text-right font-mono font-medium">
        {formatPrice(coin.current_price)}
      </td>

      {/* 24h Change */}
      <td className="whitespace-nowrap px-3 py-4 text-right">
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium",
            isPositive
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {isPositive ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </div>
      </td>

      {/* Market Cap - Hidden on mobile */}
      <td className="hidden whitespace-nowrap px-3 py-4 text-right text-sm md:table-cell">
        {formatLargeNumber(coin.market_cap)}
      </td>

      {/* Volume - Hidden on mobile/tablet */}
      <td className="hidden whitespace-nowrap px-3 py-4 text-right text-sm lg:table-cell">
        {formatLargeNumber(coin.total_volume)}
      </td>

      {/* Sparkline - Hidden on mobile */}
      <td className="hidden px-3 py-4 md:table-cell">
        <SparklineChart
          data={coin.sparkline_in_7d?.price.filter((_, i) => i % 6 === 0) || []}
          isPositive={isPositive}
        />
      </td>

      {/* Watchlist */}
      <td className="whitespace-nowrap px-3 py-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist();
          }}
        >
          <Star
            className={cn(
              "h-4 w-4 transition-colors",
              isInWatchlist ? "fill-warning text-warning" : "text-muted-foreground"
            )}
          />
        </Button>
      </td>
    </tr>
  );
}

/**
 * Loading skeleton for coin rows
 */
function CoinRowSkeleton() {
  return (
    <tr className="border-b border-border/50">
      <td className="px-3 py-4">
        <div className="h-4 w-6 rounded bg-muted shimmer" />
      </td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted shimmer" />
          <div className="space-y-1">
            <div className="h-4 w-20 rounded bg-muted shimmer" />
            <div className="h-3 w-10 rounded bg-muted shimmer" />
          </div>
        </div>
      </td>
      <td className="px-3 py-4 text-right">
        <div className="ml-auto h-4 w-16 rounded bg-muted shimmer" />
      </td>
      <td className="px-3 py-4 text-right">
        <div className="ml-auto h-6 w-16 rounded bg-muted shimmer" />
      </td>
      <td className="hidden px-3 py-4 md:table-cell">
        <div className="ml-auto h-4 w-20 rounded bg-muted shimmer" />
      </td>
      <td className="hidden px-3 py-4 lg:table-cell">
        <div className="ml-auto h-4 w-20 rounded bg-muted shimmer" />
      </td>
      <td className="hidden px-3 py-4 md:table-cell">
        <div className="h-8 w-24 rounded bg-muted shimmer" />
      </td>
      <td className="px-3 py-4">
        <div className="h-8 w-8 rounded bg-muted shimmer" />
      </td>
    </tr>
  );
}

export function CoinTable({ onSelectCoin, showWatchlistOnly = false }: CoinTableProps) {
  const { data: coins, isLoading, error } = useTopCoins(1, 20);
  const { isInWatchlist, toggleWatchlist, watchlist } = useWatchlist();
  const [sortBy, setSortBy] = useState<"rank" | "price" | "change">("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and sort coins
  const filteredCoins = coins
    ? showWatchlistOnly
      ? coins.filter((coin) => watchlist.includes(coin.id))
      : coins
    : [];

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "rank":
        comparison = a.market_cap_rank - b.market_cap_rank;
        break;
      case "price":
        comparison = a.current_price - b.current_price;
        break;
      case "change":
        comparison = a.price_change_percentage_24h - b.price_change_percentage_24h;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (column: "rank" | "price" | "change") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">
          {showWatchlistOnly ? "Watchlist" : "Top Cryptocurrencies"}
        </CardTitle>
        {!showWatchlistOnly && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Live prices</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="overflow-auto p-0">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-destructive">Failed to load cryptocurrency data</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        ) : showWatchlistOnly && watchlist.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground">
              Click the star icon to add cryptocurrencies
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-sm text-muted-foreground">
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-3 text-left font-medium"
                  onClick={() => handleSort("rank")}
                >
                  <div className="flex items-center gap-1">
                    #
                    {sortBy === "rank" && (
                      sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left font-medium">Name</th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-3 text-right font-medium"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Price
                    {sortBy === "price" && (
                      sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-3 py-3 text-right font-medium"
                  onClick={() => handleSort("change")}
                >
                  <div className="flex items-center justify-end gap-1">
                    24h
                    {sortBy === "change" && (
                      sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="hidden whitespace-nowrap px-3 py-3 text-right font-medium md:table-cell">
                  Market Cap
                </th>
                <th className="hidden whitespace-nowrap px-3 py-3 text-right font-medium lg:table-cell">
                  Volume
                </th>
                <th className="hidden whitespace-nowrap px-3 py-3 text-left font-medium md:table-cell">
                  7d Chart
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-left font-medium">
                  <Star className="h-4 w-4" />
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(10)].map((_, i) => <CoinRowSkeleton key={i} />)
              ) : (
                sortedCoins.map((coin) => (
                  <CoinRow
                    key={coin.id}
                    coin={coin}
                    isInWatchlist={isInWatchlist(coin.id)}
                    onToggleWatchlist={() => toggleWatchlist(coin.id)}
                    onSelect={() => onSelectCoin?.(coin.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
