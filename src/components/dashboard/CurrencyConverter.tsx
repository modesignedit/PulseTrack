/**
 * Currency Converter - Real-time crypto conversions ✨
 */

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Copy, Check, RefreshCw } from "lucide-react";
import { useExchangeRates } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";

// Supported currencies with display info
const CRYPTO_CURRENCIES = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
] as const;

const FIAT_CURRENCIES = [
  { id: "usd", symbol: "USD", name: "US Dollar" },
  { id: "eur", symbol: "EUR", name: "Euro" },
  { id: "gbp", symbol: "GBP", name: "British Pound" },
  { id: "jpy", symbol: "JPY", name: "Japanese Yen" },
  { id: "aud", symbol: "AUD", name: "Australian Dollar" },
  { id: "cad", symbol: "CAD", name: "Canadian Dollar" },
  { id: "inr", symbol: "INR", name: "Indian Rupee" },
] as const;

// Quick conversion pairs
const QUICK_PAIRS = [
  { from: "bitcoin", to: "usd", label: "BTC/USD" },
  { from: "ethereum", to: "usd", label: "ETH/USD" },
  { from: "bitcoin", to: "eth", label: "BTC/ETH" },
  { from: "solana", to: "usd", label: "SOL/USD" },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("bitcoin");
  const [toCurrency, setToCurrency] = useState("usd");
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const { data: rates, isLoading, refetch, isFetching } = useExchangeRates(fromCurrency);

  // Calculate converted amount
  const result = useMemo(() => {
    if (!rates || !amount) return null;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return null;
    
    const rate = rates[toCurrency];
    if (!rate) return null;
    
    return numAmount * rate;
  }, [rates, amount, toCurrency]);

  // Format result for display
  const formattedResult = useMemo(() => {
    if (result === null) return "—";
    
    // Format based on size
    if (result >= 1000000) {
      return result.toLocaleString(undefined, { maximumFractionDigits: 0 });
    } else if (result >= 1) {
      return result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
    }
  }, [result]);

  // Handle swap currencies
  const handleSwap = () => {
    setIsSwapping(true);
    
    // Check if we can swap (toCurrency must be a valid crypto for rates)
    const isToCrypto = CRYPTO_CURRENCIES.some(c => c.id === toCurrency);
    
    if (isToCrypto) {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
    }
    
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Copy result to clipboard
  const handleCopy = async () => {
    if (result !== null) {
      await navigator.clipboard.writeText(result.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle quick pair selection
  const handleQuickPair = (from: string, to: string) => {
    setFromCurrency(from);
    setToCurrency(to);
    setAmount("1");
  };

  // Get display symbol
  const getSymbol = (id: string) => {
    const crypto = CRYPTO_CURRENCIES.find(c => c.id === id);
    if (crypto) return crypto.symbol;
    const fiat = FIAT_CURRENCIES.find(f => f.id === id);
    return fiat?.symbol || id.toUpperCase();
  };

  return (
    <Card className="glass neon-border overflow-hidden">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-display">
            <span className="text-lg sm:text-xl">💱</span>
            Convert
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4">
        {/* Quick Pair Chips */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {QUICK_PAIRS.map((pair) => (
            <button
              key={pair.label}
              onClick={() => handleQuickPair(pair.from, pair.to)}
              className={cn(
                "px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-full transition-all",
                "bg-secondary/50 hover:bg-secondary text-secondary-foreground",
                fromCurrency === pair.from && toCurrency === pair.to && "gradient-genz text-white"
              )}
            >
              {pair.label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
            Amount
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="h-10 sm:h-12 text-base sm:text-lg font-semibold bg-secondary/30 border-border/50"
          />
        </div>

        {/* Currency Selectors */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* From Currency */}
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              From
            </label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="h-10 sm:h-12 bg-secondary/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <div className="px-2 py-1.5 text-[10px] sm:text-xs text-muted-foreground uppercase">
                  Crypto
                </div>
                {CRYPTO_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    <span className="font-medium">{currency.symbol}</span>
                    <span className="ml-2 text-muted-foreground text-xs hidden sm:inline">
                      {currency.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className={cn(
              "mt-5 sm:mt-6 h-9 w-9 sm:h-10 sm:w-10 rounded-full border-primary/50 hover:border-primary",
              "hover:bg-primary/10 transition-all duration-300",
              isSwapping && "rotate-180"
            )}
            style={{ transition: "transform 0.3s ease" }}
          >
            <ArrowDownUp className="h-4 w-4 text-primary" />
          </Button>

          {/* To Currency */}
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            <label className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              To
            </label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="h-10 sm:h-12 bg-secondary/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <div className="px-2 py-1.5 text-[10px] sm:text-xs text-muted-foreground uppercase">
                  Fiat
                </div>
                {FIAT_CURRENCIES.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    <span className="font-medium">{currency.symbol}</span>
                    <span className="ml-2 text-muted-foreground text-xs hidden sm:inline">
                      {currency.name}
                    </span>
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-[10px] sm:text-xs text-muted-foreground uppercase mt-2">
                  Crypto
                </div>
                {CRYPTO_CURRENCIES.filter(c => c.id !== fromCurrency).map((currency) => (
                  <SelectItem key={currency.id} value={currency.id.slice(0, 3)}>
                    <span className="font-medium">{currency.symbol}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result Display */}
        <div className="rounded-xl bg-secondary/30 p-3 sm:p-4 border border-border/30">
          {isLoading ? (
            <div className="h-8 sm:h-10 shimmer rounded-lg" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">
                  {amount || "0"} {getSymbol(fromCurrency)} =
                </p>
                <p className="text-xl sm:text-2xl font-bold font-display text-gradient-genz">
                  {formattedResult} {getSymbol(toCurrency)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 sm:h-9 sm:w-9"
                disabled={result === null}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          {rates && rates[toCurrency] && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
              1 {getSymbol(fromCurrency)} = {rates[toCurrency].toLocaleString(undefined, { maximumFractionDigits: 6 })} {getSymbol(toCurrency)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
