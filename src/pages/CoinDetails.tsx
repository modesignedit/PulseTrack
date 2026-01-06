import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, TrendingUp, TrendingDown, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoinDetails, useCoinChart } from "@/hooks/useCryptoData";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from "recharts";

const timeRanges = [
  { label: "24H", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
];

export default function CoinDetails() {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState(7);
  const [copied, setCopied] = useState(false);
  
  const { data: coin, isLoading: coinLoading, error: coinError } = useCoinDetails(coinId || "");
  const { data: chartData, isLoading: chartLoading } = useCoinChart(coinId || "", selectedRange);
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toFixed(6)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatPercentage = (pct: number) => {
    const formatted = Math.abs(pct).toFixed(2);
    return pct >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied! 📋", description: "Coin ID copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Transform chart data for Recharts
  const priceChartData = chartData?.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString(),
    time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price,
  })) || [];

  const volumeChartData = chartData?.total_volumes.map(([timestamp, volume]) => ({
    date: new Date(timestamp).toLocaleDateString(),
    volume,
  })) || [];

  const priceChange = coin?.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange >= 0;

  if (coinError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card border-destructive/50 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive text-lg mb-4">Failed to load coin data 😢</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {coinLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-7 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ) : coin && (
            <div className="flex items-center gap-3 flex-1">
              <img
                src={coin.image.large}
                alt={coin.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold truncate">{coin.name}</h1>
                  <Badge variant="secondary" className="uppercase">
                    {coin.symbol}
                  </Badge>
                  {coin.market_data.market_cap_rank && (
                    <Badge variant="outline">#{coin.market_data.market_cap_rank}</Badge>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(coin.id)}
                  className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <span className="truncate">{coin.id}</span>
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleWatchlist(coin.id)}
                className={isInWatchlist(coin.id) ? "text-yellow-500" : "text-muted-foreground"}
              >
                <Star className={`w-5 h-5 ${isInWatchlist(coin.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          )}
        </div>

        {/* Price Section */}
        {coinLoading ? (
          <Card className="glass-card mb-6">
            <CardContent className="pt-6">
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ) : coin && (
          <Card className="glass-card mb-6 overflow-hidden">
            <div className={`h-1 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end gap-4">
                <span className="text-4xl md:text-5xl font-bold">
                  {formatPrice(coin.market_data.current_price.usd)}
                </span>
                <div className={`flex items-center gap-1 text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span className="font-semibold">{formatPercentage(priceChange)}</span>
                  <span className="text-muted-foreground text-sm">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart Section */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Price History 📈</CardTitle>
              <div className="flex gap-1 flex-wrap">
                {timeRanges.map((range) => (
                  <Button
                    key={range.value}
                    variant={selectedRange === range.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedRange(range.value)}
                    className="text-xs px-3"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceChartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey={selectedRange <= 1 ? "time" : "date"}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(value, index) => {
                        const totalTicks = priceChartData.length;
                        const showEvery = Math.ceil(totalTicks / 6);
                        return index % showEvery === 0 ? value : '';
                      }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(value) => formatPrice(value).replace('$', '')}
                      width={60}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card p-3 border rounded-lg shadow-lg">
                              <p className="text-sm text-muted-foreground">{payload[0].payload.date}</p>
                              <p className="text-lg font-bold">{formatPrice(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? "#22c55e" : "#ef4444"}
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {coinLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="pt-4 pb-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : coin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatCard label="Market Cap" value={formatLargeNumber(coin.market_data.market_cap.usd)} />
            <StatCard label="24h Volume" value={formatLargeNumber(coin.market_data.total_volume.usd)} />
            <StatCard label="24h High" value={formatPrice(coin.market_data.high_24h.usd)} positive />
            <StatCard label="24h Low" value={formatPrice(coin.market_data.low_24h.usd)} negative />
            <StatCard label="All-Time High" value={formatPrice(coin.market_data.ath.usd)} positive />
            <StatCard 
              label="ATH Change" 
              value={formatPercentage(coin.market_data.ath_change_percentage.usd)} 
              negative={coin.market_data.ath_change_percentage.usd < 0}
            />
            <StatCard label="Circulating Supply" value={`${(coin.market_data.circulating_supply / 1e6).toFixed(2)}M`} />
            <StatCard 
              label="Max Supply" 
              value={coin.market_data.max_supply ? `${(coin.market_data.max_supply / 1e6).toFixed(2)}M` : "∞"} 
            />
          </div>
        )}

        {/* Volume Chart */}
        <Card className="glass-card mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Trading Volume 📊</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeChartData}>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(value, index) => {
                        const totalTicks = volumeChartData.length;
                        const showEvery = Math.ceil(totalTicks / 6);
                        return index % showEvery === 0 ? value : '';
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(value) => {
                        if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
                        if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
                        return value;
                      }}
                      width={50}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card p-3 border rounded-lg shadow-lg">
                              <p className="text-sm text-muted-foreground">{payload[0].payload.date}</p>
                              <p className="text-lg font-bold">{formatLargeNumber(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="volume"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {coin?.description?.en && (
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">About {coin.name} 📖</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ 
                  __html: coin.description.en.split('. ').slice(0, 3).join('. ') + '.' 
                }}
              />
              {coin.links?.homepage?.[0] && (
                <a
                  href={coin.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-primary hover:underline"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  positive, 
  negative 
}: { 
  label: string; 
  value: string; 
  positive?: boolean; 
  negative?: boolean;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-4 pb-4">
        <p className="text-xs md:text-sm text-muted-foreground mb-1">{label}</p>
        <p className={`text-sm md:text-lg font-bold truncate ${
          positive ? 'text-green-500' : negative ? 'text-red-500' : ''
        }`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
