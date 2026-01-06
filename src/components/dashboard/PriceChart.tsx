/**
 * Price Chart Component
 * 
 * Interactive line chart showing price trends over time
 * Uses Recharts for beautiful, responsive charts
 */

import { useState } from "react";
import {
  LineChart,
  Line,
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

interface PriceChartProps {
  coinId: string;
  coinName?: string;
}

// Time range options
const timeRanges = [
  { label: "24H", value: 1 },
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
] as const;

/**
 * Format timestamp to readable date/time
 */
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

/**
 * Format price for display
 */
function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
}

/**
 * Custom tooltip component
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export function PriceChart({ coinId, coinName = "Bitcoin" }: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<number>(7);
  const { data: chartData, isLoading, error } = useCoinChart(coinId, selectedRange);

  // Transform API data into chart format
  const formattedData = chartData?.prices.map(([timestamp, price]) => ({
    date: formatDate(timestamp, selectedRange),
    price,
    timestamp,
  })) || [];

  // Calculate price change for gradient color
  const priceChange =
    formattedData.length >= 2
      ? formattedData[formattedData.length - 1].price - formattedData[0].price
      : 0;
  const isPositive = priceChange >= 0;

  // Sample data points for performance (max 100 points)
  const sampledData =
    formattedData.length > 100
      ? formattedData.filter((_, i) => i % Math.ceil(formattedData.length / 100) === 0)
      : formattedData;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">
          {coinName} Price Chart
        </CardTitle>

        {/* Time Range Selector */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-xs font-medium transition-all",
                selectedRange === range.value
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setSelectedRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex h-[300px] flex-col items-center justify-center text-center">
            <p className="text-destructive">Failed to load chart data</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        )}

        {/* Chart */}
        {!isLoading && !error && sampledData.length > 0 && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampledData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickMargin={10}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={["dataMin", "dataMax"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => formatPrice(value).replace("$", "")}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  strokeWidth={2}
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
