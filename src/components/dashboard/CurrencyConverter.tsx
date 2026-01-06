/**
 * Currency Converter - Real-time crypto conversions ✨
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Copy, Check, RefreshCw } from "lucide-react";
import { useExchangeRates } from "@/hooks/useCryptoData";
import { cn } from "@/lib/utils";

// Supported crypto currencies
const CRYPTO_CURRENCIES = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", icon: "⬡" },
  { id: "solana", symbol: "SOL", name: "Solana", icon: "◎" },
  { id: "ripple", symbol: "XRP", name: "XRP", icon: "✕" },
  { id: "cardano", symbol: "ADA", name: "Cardano", icon: "₳" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", icon: "🔺" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", icon: "●" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", icon: "⬡" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", icon: "⬡" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", icon: "Ł" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", icon: "Ð" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu", icon: "🐕" },
  { id: "tron", symbol: "TRX", name: "Tron", icon: "◈" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", icon: "🦄" },
];

// Supported fiat and other currencies grouped by region
const FIAT_CURRENCIES = [
  // Americas
  { id: "usd", symbol: "USD", name: "US Dollar", icon: "$", region: "Americas" },
  { id: "cad", symbol: "CAD", name: "Canadian Dollar", icon: "C$", region: "Americas" },
  { id: "mxn", symbol: "MXN", name: "Mexican Peso", icon: "MX$", region: "Americas" },
  { id: "brl", symbol: "BRL", name: "Brazilian Real", icon: "R$", region: "Americas" },
  // Europe
  { id: "eur", symbol: "EUR", name: "Euro", icon: "€", region: "Europe" },
  { id: "gbp", symbol: "GBP", name: "British Pound", icon: "£", region: "Europe" },
  { id: "chf", symbol: "CHF", name: "Swiss Franc", icon: "Fr", region: "Europe" },
  { id: "sek", symbol: "SEK", name: "Swedish Krona", icon: "kr", region: "Europe" },
  { id: "nok", symbol: "NOK", name: "Norwegian Krone", icon: "kr", region: "Europe" },
  { id: "dkk", symbol: "DKK", name: "Danish Krone", icon: "kr", region: "Europe" },
  { id: "pln", symbol: "PLN", name: "Polish Zloty", icon: "zł", region: "Europe" },
  { id: "try", symbol: "TRY", name: "Turkish Lira", icon: "₺", region: "Europe" },
  { id: "rub", symbol: "RUB", name: "Russian Ruble", icon: "₽", region: "Europe" },
  // Asia-Pacific
  { id: "jpy", symbol: "JPY", name: "Japanese Yen", icon: "¥", region: "Asia-Pacific" },
  { id: "cny", symbol: "CNY", name: "Chinese Yuan", icon: "¥", region: "Asia-Pacific" },
  { id: "krw", symbol: "KRW", name: "South Korean Won", icon: "₩", region: "Asia-Pacific" },
  { id: "inr", symbol: "INR", name: "Indian Rupee", icon: "₹", region: "Asia-Pacific" },
  { id: "aud", symbol: "AUD", name: "Australian Dollar", icon: "A$", region: "Asia-Pacific" },
  { id: "sgd", symbol: "SGD", name: "Singapore Dollar", icon: "S$", region: "Asia-Pacific" },
  { id: "hkd", symbol: "HKD", name: "Hong Kong Dollar", icon: "HK$", region: "Asia-Pacific" },
  { id: "thb", symbol: "THB", name: "Thai Baht", icon: "฿", region: "Asia-Pacific" },
  { id: "idr", symbol: "IDR", name: "Indonesian Rupiah", icon: "Rp", region: "Asia-Pacific" },
  { id: "php", symbol: "PHP", name: "Philippine Peso", icon: "₱", region: "Asia-Pacific" },
  { id: "myr", symbol: "MYR", name: "Malaysian Ringgit", icon: "RM", region: "Asia-Pacific" },
  // Middle East & Africa
  { id: "aed", symbol: "AED", name: "UAE Dirham", icon: "د.إ", region: "Middle East" },
  { id: "sar", symbol: "SAR", name: "Saudi Riyal", icon: "﷼", region: "Middle East" },
  { id: "zar", symbol: "ZAR", name: "South African Rand", icon: "R", region: "Africa" },
  // Commodities & Crypto
  { id: "xau", symbol: "XAU", name: "Gold (oz)", icon: "🥇", region: "Commodities" },
  { id: "xag", symbol: "XAG", name: "Silver (oz)", icon: "🥈", region: "Commodities" },
  { id: "sats", symbol: "SATS", name: "Satoshis", icon: "⚡", region: "Crypto" },
];

// Quick conversion pairs
const QUICK_PAIRS = [
  { from: "bitcoin", to: "usd", label: "BTC/USD" },
  { from: "ethereum", to: "usd", label: "ETH/USD" },
  { from: "bitcoin", to: "eur", label: "BTC/EUR" },
  { from: "ethereum", to: "eur", label: "ETH/EUR" },
  { from: "binancecoin", to: "usd", label: "BNB/USD" },
  { from: "solana", to: "usd", label: "SOL/USD" },
  { from: "cardano", to: "usd", label: "ADA/USD" },
  { from: "bitcoin", to: "xau", label: "BTC/Gold" },
];

// Group currencies by region
const groupedFiatCurrencies = FIAT_CURRENCIES.reduce((acc, currency) => {
  if (!acc[currency.region]) {
    acc[currency.region] = [];
  }
  acc[currency.region].push(currency);
  return acc;
}, {} as Record<string, typeof FIAT_CURRENCIES>);

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
              <SelectContent className="bg-popover border-border max-h-[300px]">
                <SelectGroup>
                  <SelectLabel className="text-[10px] sm:text-xs text-muted-foreground">
                    Cryptocurrencies
                  </SelectLabel>
                  {CRYPTO_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      <span className="mr-2">{currency.icon}</span>
                      <span className="font-medium">{currency.symbol}</span>
                      <span className="ml-2 text-muted-foreground text-xs hidden sm:inline">
                        {currency.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
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
              <SelectContent className="bg-popover border-border max-h-[300px]">
                {Object.entries(groupedFiatCurrencies).map(([region, currencies]) => (
                  <SelectGroup key={region}>
                    <SelectLabel className="text-[10px] sm:text-xs text-muted-foreground">
                      {region}
                    </SelectLabel>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        <span className="mr-2">{currency.icon}</span>
                        <span className="font-medium">{currency.symbol}</span>
                        <span className="ml-2 text-muted-foreground text-xs hidden sm:inline">
                          {currency.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
                <SelectGroup>
                  <SelectLabel className="text-[10px] sm:text-xs text-muted-foreground">
                    Crypto
                  </SelectLabel>
                  {CRYPTO_CURRENCIES.filter(c => c.id !== fromCurrency).map((currency) => (
                    <SelectItem key={currency.id} value={currency.id.slice(0, 3)}>
                      <span className="mr-2">{currency.icon}</span>
                      <span className="font-medium">{currency.symbol}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
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
