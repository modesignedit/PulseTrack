import { Bell, BellOff, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PriceAlert } from "@/hooks/usePriceAlerts";
import { cn } from "@/lib/utils";

interface PriceAlertsPanelProps {
  alerts: PriceAlert[];
  activeAlerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];
  onRemoveAlert: (alertId: string) => void;
  onClearTriggered: () => void;
  currentPrices?: Record<string, number>;
}

export function PriceAlertsPanel({
  alerts,
  activeAlerts,
  triggeredAlerts,
  onRemoveAlert,
  onClearTriggered,
  currentPrices = {},
}: PriceAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card className="glass neon-border">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Price Alerts 🔔
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No alerts yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Click the bell icon on any coin to set an alert
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass neon-border">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display text-base sm:text-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Price Alerts 🔔
            {activeAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeAlerts.length} active
              </Badge>
            )}
          </CardTitle>
          {triggeredAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearTriggered}
              className="text-xs h-7"
            >
              Clear triggered
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[200px] sm:h-[250px]">
          <div className="space-y-2">
            {/* Active alerts first */}
            {activeAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                currentPrice={currentPrices[alert.coinId]}
                onRemove={() => onRemoveAlert(alert.id)}
              />
            ))}
            
            {/* Triggered alerts */}
            {triggeredAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                currentPrice={currentPrices[alert.coinId]}
                onRemove={() => onRemoveAlert(alert.id)}
                triggered
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AlertItem({
  alert,
  currentPrice,
  onRemove,
  triggered = false,
}: {
  alert: PriceAlert;
  currentPrice?: number;
  onRemove: () => void;
  triggered?: boolean;
}) {
  const percentFromTarget = currentPrice
    ? ((currentPrice - alert.targetPrice) / alert.targetPrice) * 100
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        triggered
          ? "bg-primary/10 border border-primary/30"
          : "bg-secondary/30 hover:bg-secondary/50"
      )}
    >
      <img
        src={alert.coinImage}
        alt={alert.coinName}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate">{alert.coinSymbol.toUpperCase()}</span>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5",
              alert.condition === "above"
                ? "border-success/50 text-success"
                : "border-destructive/50 text-destructive"
            )}
          >
            {alert.condition === "above" ? "↑" : "↓"} ${alert.targetPrice.toLocaleString()}
          </Badge>
          {triggered && (
            <Badge className="text-[10px] px-1.5 bg-primary/20 text-primary border-0">
              Triggered!
            </Badge>
          )}
        </div>
        
        {currentPrice && !triggered && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Current: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            {percentFromTarget !== null && (
              <span className={cn(
                "ml-1",
                percentFromTarget >= 0 ? "text-success" : "text-destructive"
              )}>
                ({percentFromTarget >= 0 ? "+" : ""}{percentFromTarget.toFixed(1)}%)
              </span>
            )}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
