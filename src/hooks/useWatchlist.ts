/**
 * Watchlist Hook
 * 
 * Manages a persistent watchlist of favorite cryptocurrencies
 * Uses localStorage for persistence across sessions
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pulsetrack-watchlist";

/**
 * Hook to manage cryptocurrency watchlist
 * Provides functions to add, remove, and check items in the watchlist
 */
export function useWatchlist() {
  // Initialize state from localStorage
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever watchlist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  }, [watchlist]);

  /**
   * Add a coin to the watchlist
   */
  const addToWatchlist = useCallback((coinId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(coinId)) return prev;
      return [...prev, coinId];
    });
  }, []);

  /**
   * Remove a coin from the watchlist
   */
  const removeFromWatchlist = useCallback((coinId: string) => {
    setWatchlist((prev) => prev.filter((id) => id !== coinId));
  }, []);

  /**
   * Toggle a coin in the watchlist
   */
  const toggleWatchlist = useCallback((coinId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(coinId)) {
        return prev.filter((id) => id !== coinId);
      }
      return [...prev, coinId];
    });
  }, []);

  /**
   * Check if a coin is in the watchlist
   */
  const isInWatchlist = useCallback(
    (coinId: string) => watchlist.includes(coinId),
    [watchlist]
  );

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
  };
}
