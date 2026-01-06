/**
 * Dashboard Header Component - Gen Z Edition ✨
 * 
 * Top navigation with gradient logo, glassy search, and neon vibes
 */

import { Moon, Sun, Sparkles, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/useTheme";
import { useState, useEffect, useRef } from "react";
import { useSearchCoins } from "@/hooks/useCryptoData";
import type { SearchResult } from "@/services/cryptoApi";

interface DashboardHeaderProps {
  onSelectCoin?: (coinId: string) => void;
}

export function DashboardHeader({ onSelectCoin }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const { data: searchResults, isLoading: isSearching } = useSearchCoins(searchQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    onSelectCoin?.(result.id);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass rounded-xl sm:rounded-2xl">
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4">
        {/* Logo with gradient */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="gradient-genz flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl shadow-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-base sm:text-lg font-bold text-gradient-genz">
              PulseTrack
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              your crypto bestie ✨
            </span>
          </div>
        </div>

        {/* Search - Desktop */}
        <div ref={searchRef} className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="search coins..."
            className="w-full rounded-full border-2 border-transparent bg-secondary/50 pl-11 pr-4 transition-all focus:border-primary focus:shadow-[0_0_20px_hsl(270_91%_65%/0.3)]"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          
          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-auto rounded-2xl glass p-2 shadow-xl animate-fade-in">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="space-y-1">
                  {searchResults.slice(0, 8).map((coin) => (
                    <li key={coin.id}>
                      <button
                        onClick={() => handleSelectResult(coin)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-primary/10"
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="h-7 w-7 rounded-full"
                        />
                        <div className="flex-1 truncate">
                          <span className="font-display font-medium">{coin.name}</span>
                          <span className="ml-2 text-muted-foreground uppercase text-sm">
                            {coin.symbol}
                          </span>
                        </div>
                        {coin.market_cap_rank && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                            #{coin.market_cap_rank}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  no coins found 😅
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          {/* Live Indicator */}
          <div className="hidden items-center gap-2 rounded-full bg-success/20 px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs font-bold text-success">vibing 🔥</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-secondary/50 hover:bg-secondary transition-all"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-border/50 p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="search coins..."
              className="w-full rounded-full pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {searchQuery.length >= 2 && (
            <div className="mt-3 max-h-60 overflow-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <ul className="space-y-1">
                  {searchResults.slice(0, 6).map((coin) => (
                    <li key={coin.id}>
                      <button
                        onClick={() => handleSelectResult(coin)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-primary/10"
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="font-display font-medium">{coin.name}</span>
                        <span className="text-muted-foreground uppercase text-sm">
                          {coin.symbol}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  no coins found 😅
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
