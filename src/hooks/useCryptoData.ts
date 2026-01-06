/**
 * Custom hook for fetching cryptocurrency data
 * 
 * This hook uses TanStack Query (React Query) for:
 * - Automatic caching and background refetching
 * - Loading and error states
 * - Stale-while-revalidate pattern
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchTopCoins,
  fetchGlobalData,
  fetchCoinChart,
  fetchTrendingCoins,
  searchCoins,
  fetchCoinDetails,
  fetchExchangeRates,
  type CoinMarketData,
  type CoinDetails,
  type GlobalData,
  type ChartData,
  type TrendingCoin,
  type SearchResult,
  type ExchangeRates,
} from "@/services/cryptoApi";

// Query key factory for consistent cache keys
export const cryptoKeys = {
  all: ["crypto"] as const,
  coins: () => [...cryptoKeys.all, "coins"] as const,
  coinsList: (page: number, perPage: number) =>
    [...cryptoKeys.coins(), { page, perPage }] as const,
  global: () => [...cryptoKeys.all, "global"] as const,
  chart: (coinId: string, days: number | string) =>
    [...cryptoKeys.all, "chart", coinId, days] as const,
  trending: () => [...cryptoKeys.all, "trending"] as const,
  search: (query: string) => [...cryptoKeys.all, "search", query] as const,
};

/**
 * Hook to fetch top cryptocurrencies
 * Refetches every 30 seconds for live data
 */
export function useTopCoins(page: number = 1, perPage: number = 20) {
  return useQuery<CoinMarketData[], Error>({
    queryKey: cryptoKeys.coinsList(page, perPage),
    queryFn: () => fetchTopCoins(page, perPage),
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes (avoid rate limits)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch global market data
 */
export function useGlobalData() {
  return useQuery<GlobalData, Error>({
    queryKey: cryptoKeys.global(),
    queryFn: fetchGlobalData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000, // Avoid rate limits
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch chart data for a specific coin
 */
export function useCoinChart(coinId: string, days: number | string = 7) {
  return useQuery<ChartData, Error>({
    queryKey: cryptoKeys.chart(coinId, days),
    queryFn: () => fetchCoinChart(coinId, days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: !!coinId, // Only fetch if coinId is provided
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch trending coins
 */
export function useTrendingCoins() {
  return useQuery<TrendingCoin[], Error>({
    queryKey: cryptoKeys.trending(),
    queryFn: fetchTrendingCoins,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for searching coins
 * Only searches when query length >= 2
 */
export function useSearchCoins(query: string) {
  return useQuery<SearchResult[], Error>({
    queryKey: cryptoKeys.search(query),
    queryFn: () => searchCoins(query),
    enabled: query.length >= 2, // Only search with 2+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch detailed coin information
 */
export function useCoinDetails(coinId: string) {
  return useQuery<CoinDetails, Error>({
    queryKey: [...cryptoKeys.all, "details", coinId] as const,
    queryFn: () => fetchCoinDetails(coinId),
    enabled: !!coinId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch exchange rates for a coin
 */
export function useExchangeRates(coinId: string) {
  return useQuery<ExchangeRates, Error>({
    queryKey: [...cryptoKeys.all, "rates", coinId] as const,
    queryFn: () => fetchExchangeRates(coinId),
    enabled: !!coinId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
