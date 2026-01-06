/**
 * Market Stats Cards - Gen Z Edition ✨
 * 
 * Displays key market metrics with gradient icons and neon glow
 */

import { TrendingUp, TrendingDown, DollarSign, BarChart3, Bitcoin, Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalData } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, change, icon, gradient, delay = 0 }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card
      className="glass neon-border overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
            {change !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                  isPositive
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change).toFixed(2)}%
              </div>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg", gradient)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="glass overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 rounded bg-muted shimmer" />
            <div className="h-7 w-32 rounded bg-muted shimmer" />
            <div className="h-6 w-16 rounded-full bg-muted shimmer" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted shimmer" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MarketStatsCards() {
  const { data: globalData, isLoading, error } = useGlobalData();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !globalData) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">oops, couldn't load stats 😅</p>
      </div>
    );
  }

  const { data } = globalData;

  const stats = [
    {
      title: "Total Market Cap 💰",
      value: formatNumber(data.total_market_cap.usd),
      change: data.market_cap_change_percentage_24h_usd,
      icon: <DollarSign className="h-6 w-6" />,
      gradient: "gradient-genz",
    },
    {
      title: "24h Volume 📊",
      value: formatNumber(data.total_volume.usd),
      icon: <BarChart3 className="h-6 w-6" />,
      gradient: "gradient-fire",
    },
    {
      title: "BTC Dominance ⚡",
      value: `${data.market_cap_percentage.btc.toFixed(1)}%`,
      icon: <Bitcoin className="h-6 w-6" />,
      gradient: "gradient-mint",
    },
    {
      title: "Active Coins 🚀",
      value: data.active_cryptocurrencies.toLocaleString(),
      icon: <Coins className="h-6 w-6" />,
      gradient: "gradient-genz",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} delay={index * 100} />
      ))}
    </div>
  );
}
