import { useState, forwardRef } from "react";
import { Bell, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PriceAlertDialogProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  currentPrice: number;
  onCreateAlert: (
    coinId: string,
    coinName: string,
    coinSymbol: string,
    coinImage: string,
    targetPrice: number,
    condition: "above" | "below"
  ) => void;
  trigger?: React.ReactNode;
}

export const PriceAlertDialog = forwardRef<HTMLDivElement, PriceAlertDialogProps>(
  function PriceAlertDialog(
    {
      coinId,
      coinName,
      coinSymbol,
      coinImage,
      currentPrice,
      onCreateAlert,
      trigger,
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
    const [condition, setCondition] = useState<"above" | "below">("above");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price <= 0) return;

      onCreateAlert(coinId, coinName, coinSymbol, coinImage, price, condition);
      setOpen(false);
      setTargetPrice(currentPrice.toString());
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent ref={ref} className="glass-card border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <Bell className="h-5 w-5 text-primary" />
              Set Price Alert
            </DialogTitle>
            <DialogDescription>
              Get notified when {coinName} reaches your target price
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Coin info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <img src={coinImage} alt={coinName} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold">{coinName}</p>
                <p className="text-sm text-muted-foreground">
                  Current: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Condition selector */}
            <div className="space-y-2">
              <Label>Alert when price goes</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCondition("above")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    condition === "above"
                      ? "border-success bg-success/10 text-success"
                      : "border-border hover:border-success/50"
                  )}
                >
                  <TrendingUp className="h-4 w-4" />
                  Above
                </button>
                <button
                  type="button"
                  onClick={() => setCondition("below")}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                    condition === "below"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border hover:border-destructive/50"
                  )}
                >
                  <TrendingDown className="h-4 w-4" />
                  Below
                </button>
              </div>
            </div>

            {/* Target price input */}
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="targetPrice"
                  type="number"
                  step="any"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-7 bg-secondary/30 border-border/50"
                  placeholder="Enter target price"
                />
              </div>
              {parseFloat(targetPrice) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {condition === "above"
                    ? `+${(((parseFloat(targetPrice) - currentPrice) / currentPrice) * 100).toFixed(2)}% from current`
                    : `${(((parseFloat(targetPrice) - currentPrice) / currentPrice) * 100).toFixed(2)}% from current`}
                </p>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Bell className="h-4 w-4" />
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);
