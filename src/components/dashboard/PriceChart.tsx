/**
 * Price Chart Component - Gen Z Edition ✨
 * 
 * Interactive chart with gradient lines and neon styling
 */

import { useState, forwardRef } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCoinChart } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface PriceChartProps {
  coinId: string;
  coinName?: string;
}

const timeRanges = [
  { label: "24H", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
] as const;

function formatDate(timestamp: number, days: number): string {
  const date = new Date(timestamp);
  if (days <= 1) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (days <= 7) {
    return date.toLocaleDateString([], { weekday: "short", hour: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
}

/**
 * Custom tooltip - using forwardRef to avoid React warning
 */
const CustomTooltip = forwardRef<HTMLDivElement, any>(({ active, payload, label }, ref) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div ref={ref} className="glass rounded-xl px-4 py-3 shadow-xl glow">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold text-primary">{formatPrice(payload[0].value)}</p>
    </div>
  );
});
CustomTooltip.displayName = "CustomTooltip";

export function PriceChart({ coinId, coinName = "Bitcoin" }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<number>(7);
  const { data: chartData, isLoading, error } = useCoinChart(coinId, selectedRange);

  const formattedData = chartData?.prices.map(([timestamp, price]) => ({
    date: formatDate(timestamp, selectedRange),
    price,
    timestamp,
  })) || [];

  const priceChange =
    formattedData.length >= 2
      ? formattedData[formattedData.length - 1].price - formattedData[0].price
      : 0;
  const isPositive = priceChange >= 0;

  const sampledData =
    formattedData.length > 100
      ? formattedData.filter((_, i) => i % Math.ceil(formattedData.length / 100) === 0)
      : formattedData;

  return (
    <Card className="glass neon-border overflow-hidden">
      <CardHeader className="flex flex-col gap-3 p-3 pb-3 sm:p-6 sm:pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex flex-wrap items-center gap-2 font-display text-base sm:text-lg font-semibold">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          {coinName} Chart
          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
            {isPositive ? "📈 going up" : "📉 going down"}
          </span>
        </CardTitle>

        {/* Time Range Selector */}
        <div className="flex gap-0.5 sm:gap-1 rounded-full bg-secondary/50 p-0.5 sm:p-1 w-full sm:w-auto">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 sm:h-8 rounded-full px-2 sm:px-4 text-xs font-semibold transition-all flex-1 sm:flex-none",
                selectedRange === range.value
                  ? "gradient-genz text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setSelectedRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        {isLoading && (
          <div className="flex h-[200px] sm:h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="flex h-[200px] sm:h-[300px] flex-col items-center justify-center text-center gap-2">
            <p className="text-muted-foreground">chart machine broke 😅</p>
            <p className="text-xs text-muted-foreground/70">API rate limited - try again in a moment</p>
          </div>
        )}

        {!isLoading && !error && sampledData.length > 0 && (
          <div className="h-[200px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampledData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isPositive ? "hsl(142, 76%, 55%)" : "hsl(0, 85%, 65%)"}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="50%"
                      stopColor="hsl(270, 91%, 70%)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(330, 90%, 70%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(270, 91%, 70%)" />
                    <stop offset="50%" stopColor="hsl(330, 90%, 70%)" />
                    <stop offset="100%" stopColor="hsl(180, 90%, 60%)" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickMargin={10}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={["dataMin", "dataMax"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => formatPrice(value).replace("$", "")}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="url(#lineGradient)"
                  strokeWidth={2.5}
                  fill="url(#colorPrice)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
