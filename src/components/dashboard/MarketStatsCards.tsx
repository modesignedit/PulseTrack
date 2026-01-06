/**
 * Market Stats Cards
 * 
 * Displays global cryptocurrency market statistics:
 * - Total market cap
 * - 24h volume
 * - BTC dominance
 * - Active cryptocurrencies
 */

import { TrendingUp, TrendingDown, DollarSign, BarChart3, Bitcoin, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalData } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Single stat card component
 */
interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, change, icon, delay = 0 }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-glow"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold tracking-tight sm:text-2xl">{value}</p>
            {change !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(change).toFixed(2)}%</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for stat cards
 */
function StatCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 rounded bg-muted shimmer" />
            <div className="h-7 w-32 rounded bg-muted shimmer" />
            <div className="h-4 w-16 rounded bg-muted shimmer" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketStatsCards() {
  const { data: globalData, isLoading, error } = useGlobalData();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error || !globalData) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
        <p className="text-destructive">Failed to load market data</p>
        <p className="text-sm text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  const { data } = globalData;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Market Cap"
        value={formatNumber(data.total_market_cap.usd)}
        change={data.market_cap_change_percentage_24h_usd}
        icon={<DollarSign className="h-6 w-6" />}
        delay={0}
      />
      <StatCard
        title="24h Volume"
        value={formatNumber(data.total_volume.usd)}
        icon={<BarChart3 className="h-6 w-6" />}
        delay={50}
      />
      <StatCard
        title="BTC Dominance"
        value={`${data.market_cap_percentage.btc.toFixed(1)}%`}
        icon={<Bitcoin className="h-6 w-6" />}
        delay={100}
      />
      <StatCard
        title="Active Cryptos"
        value={data.active_cryptocurrencies.toLocaleString()}
        icon={<Coins className="h-6 w-6" />}
        delay={150}
      />
    </div>
  );
}
