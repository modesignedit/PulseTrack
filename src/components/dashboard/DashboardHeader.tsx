/**
 * Dashboard Header Component
 * 
 * Top navigation bar with:
 * - Logo and branding
 * - Search functionality
 * - Theme toggle
 * - Live indicator
 */

import { Moon, Sun, Activity, Search, X } from "lucide-react";
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
  
  // Fetch search results
  const { data: searchResults, isLoading: isSearching } = useSearchCoins(searchQuery);

  // Close search dropdown when clicking outside
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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">PulseTrack</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Crypto Dashboard
            </span>
          </div>
        </div>

        {/* Search - Desktop */}
        <div ref={searchRef} className="relative hidden w-full max-w-md md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cryptocurrencies..."
            className="w-full pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          
          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-auto rounded-lg border border-border bg-card p-2 shadow-lg animate-fade-in">
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
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <div className="flex-1 truncate">
                          <span className="font-medium">{coin.name}</span>
                          <span className="ml-2 text-muted-foreground uppercase">
                            {coin.symbol}
                          </span>
                        </div>
                        {coin.market_cap_rank && (
                          <span className="text-xs text-muted-foreground">
                            #{coin.market_cap_rank}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No results found
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
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>

          {/* Live Indicator */}
          <div className="hidden items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs font-medium text-success">Live</span>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-smooth hover:bg-muted"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-border p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cryptocurrencies..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Mobile Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mt-2 max-h-60 overflow-auto">
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
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                      >
                        <img
                          src={coin.thumb}
                          alt={coin.name}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="font-medium">{coin.name}</span>
                        <span className="text-muted-foreground uppercase">
                          {coin.symbol}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No results found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
