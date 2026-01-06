/**
 * PulseTrack - Crypto Dashboard
 * 
 * A modern, mobile-first cryptocurrency dashboard featuring:
 * - Live price data from CoinGecko API
 * - Interactive charts and market statistics
 * - Search functionality and watchlist
 * - Dark/Light mode toggle
 * - Fully responsive design
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MarketStatsCards } from "@/components/dashboard/MarketStatsCards";
import { CoinTable } from "@/components/dashboard/CoinTable";
import { PriceChart } from "@/components/dashboard/PriceChart";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";

const Index = () => {
  // Currently selected coin for the chart
  const [selectedCoin, setSelectedCoin] = useState({
    id: "bitcoin",
    name: "Bitcoin",
  });

  // Handler for selecting a coin from search or table
  const handleSelectCoin = (coinId: string) => {
    // Map common coins to their names, or capitalize the ID
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
      {/* Header with Search and Theme Toggle */}
      <DashboardHeader onSelectCoin={handleSelectCoin} />

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Market Statistics Cards */}
        <section className="animate-fade-in">
          <MarketStatsCards />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Chart and Table (2/3 width on desktop) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Price Chart */}
            <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
              <PriceChart coinId={selectedCoin.id} coinName={selectedCoin.name} />
            </section>

            {/* Coin Table with Tabs */}
            <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 w-full justify-start bg-muted/50">
                  <TabsTrigger value="all" className="flex-1 sm:flex-none">
                    All Coins
                  </TabsTrigger>
                  <TabsTrigger value="watchlist" className="flex-1 sm:flex-none">
                    Watchlist
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

          {/* Right Column - Trending (1/3 width on desktop) */}
          <div className="space-y-6">
            <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
              <TrendingCoins onSelectCoin={handleSelectCoin} />
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          <p>
            Data provided by{" "}
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              CoinGecko
            </a>
            . Prices update every 30 seconds.
          </p>
          <p className="mt-2">
            Built with React, Tailwind CSS, and TanStack Query
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
