/**
 * PulseTrack - Gen Z Crypto Dashboard ✨
 * 
 * Neon vibes, glassmorphism, and real-time crypto data
 */

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MarketStatsCards } from "@/components/dashboard/MarketStatsCards";
import { CoinTable } from "@/components/dashboard/CoinTable";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";

const Index = () => {
  const [selectedCoin, setSelectedCoin] = useState({
    id: "bitcoin",
    name: "Bitcoin",
  });

  // Default to dark mode (Gen Z loves dark mode)
  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  const handleSelectCoin = (coinId: string) => {
    const coinNames: Record<string, string> = {
      bitcoin: "Bitcoin",
      ethereum: "Ethereum",
      tether: "Tether",
      binancecoin: "BNB",
      solana: "Solana",
      ripple: "XRP",
      cardano: "Cardano",
      dogecoin: "Dogecoin",
    };

    setSelectedCoin({
      id: coinId,
      name: coinNames[coinId] || coinId.charAt(0).toUpperCase() + coinId.slice(1),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Background Orbs - Smaller on mobile */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl sm:-left-40 sm:-top-40 sm:h-80 sm:w-80" />
        <div className="absolute -right-20 top-1/3 h-48 w-48 rounded-full bg-accent/20 blur-3xl sm:-right-40 sm:h-96 sm:w-96" />
        <div className="absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-success/10 blur-3xl sm:-bottom-40 sm:left-1/3 sm:h-80 sm:w-80" />
      </div>

      {/* Header */}
      <div className="relative px-3 pt-3 sm:px-0 sm:pt-0">
        <DashboardHeader onSelectCoin={handleSelectCoin} />
      </div>

      {/* Main Content */}
      <main className="container relative px-3 py-4 space-y-4 sm:px-4 sm:py-6 sm:space-y-6">
        {/* Market Statistics Cards */}
        <section className="animate-fade-in">
          <MarketStatsCards />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Chart and Table */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <PriceChart coinId={selectedCoin.id} coinName={selectedCoin.name} />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-3 sm:mb-4 w-full justify-start rounded-full bg-secondary/50 p-1">
                  <TabsTrigger 
                    value="all" 
                    className="flex-1 rounded-full text-xs sm:text-sm data-[state=active]:gradient-genz data-[state=active]:text-white sm:flex-none"
                  >
                    All Coins
                  </TabsTrigger>
                  <TabsTrigger 
                    value="watchlist" 
                    className="flex-1 rounded-full text-xs sm:text-sm data-[state=active]:gradient-genz data-[state=active]:text-white sm:flex-none"
                  >
                    Watchlist ⭐
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <CoinTable onSelectCoin={handleSelectCoin} />
                </TabsContent>

                <TabsContent value="watchlist" className="mt-0">
                  <CoinTable onSelectCoin={handleSelectCoin} showWatchlistOnly />
                </TabsContent>
              </Tabs>
            </section>
          </div>

          {/* Right Column - Trending */}
          <div className="space-y-4 sm:space-y-6">
            <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
              <TrendingCoins onSelectCoin={handleSelectCoin} />
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/30 pt-6 pb-4 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            made with 💜 by{" "}
            <span className="font-display font-bold text-gradient-genz">
              PulseTrack
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            data from CoinGecko • not financial advice fr fr
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
