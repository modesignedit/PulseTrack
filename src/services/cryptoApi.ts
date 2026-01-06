/**
 * CoinGecko API Service
 * 
 * This service handles all communication with the CoinGecko public API.
 * CoinGecko provides free cryptocurrency data including prices, market cap,
 * volume, and historical data.
 * 
 * API Documentation: https://www.coingecko.com/en/api/documentation
 * Rate Limit: ~10-50 requests per minute (free tier)
 */

// Base URL for CoinGecko API v3
const BASE_URL = "https://api.coingecko.com/api/v3";

// Types for API responses
export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { thumb: string; small: string; large: string };
  links?: {
    homepage?: string[];
    blockchain_site?: string[];
  };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    market_cap_rank: number | null;
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_change_percentage: { usd: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
}

export interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
  };
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TrendingCoin {
  item: {
    id: string;
    coin_id: number;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    price_btc: number;
    score: number;
  };
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

/**
 * Fetch top cryptocurrencies by market cap
 * @param page - Page number for pagination
 * @param perPage - Number of results per page (max 250)
 * @param sparkline - Include 7-day sparkline data
 */
export async function fetchTopCoins(
  page: number = 1,
  perPage: number = 20,
  sparkline: boolean = true
): Promise<CoinMarketData[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: sparkline.toString(),
  });

  const response = await fetch(`${BASE_URL}/coins/markets?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch coins: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch global cryptocurrency market data
 * Returns overall market statistics like total market cap and volume
 */
export async function fetchGlobalData(): Promise<GlobalData> {
  const response = await fetch(`${BASE_URL}/global`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch global data: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch historical chart data for a specific coin
 * @param coinId - The coin ID (e.g., "bitcoin", "ethereum")
 * @param days - Number of days of data (1, 7, 14, 30, 90, 180, 365, max)
 */
export async function fetchCoinChart(
  coinId: string,
  days: number | string = 7
): Promise<ChartData> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: days.toString(),
  });

  const response = await fetch(
    `${BASE_URL}/coins/${coinId}/market_chart?${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch chart data: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch trending coins (based on search popularity)
 */
export async function fetchTrendingCoins(): Promise<TrendingCoin[]> {
  const response = await fetch(`${BASE_URL}/search/trending`);

  if (!response.ok) {
    throw new Error(`Failed to fetch trending coins: ${response.status}`);
  }

  const data = await response.json();
  return data.coins;
}

/**
 * Search for coins by name or symbol
 * @param query - Search query string
 */
export async function searchCoins(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ query });
  const response = await fetch(`${BASE_URL}/search?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to search coins: ${response.status}`);
  }

  const data = await response.json();
  return data.coins;
}

/**
 * Fetch detailed information for a specific coin
 * @param coinId - The coin ID (e.g., "bitcoin")
 */
export async function fetchCoinDetails(coinId: string): Promise<CoinDetails> {
  const params = new URLSearchParams({
    localization: "false",
    tickers: "false",
    community_data: "false",
    developer_data: "false",
  });

  const response = await fetch(`${BASE_URL}/coins/${coinId}?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch coin details: ${response.status}`);
  }

  return response.json();
}

// Exchange rate types
export interface ExchangeRates {
  [currency: string]: number;
}

/**
 * Fetch exchange rates for a coin in multiple currencies
 * @param coinId - The coin ID (e.g., "bitcoin")
 * @param vsCurrencies - Comma-separated list of currencies
 */
export async function fetchExchangeRates(
  coinId: string,
  vsCurrencies: string = "usd,eur,gbp,jpy,aud,cad,chf,cny,inr,btc,eth"
): Promise<ExchangeRates> {
  const params = new URLSearchParams({
    ids: coinId,
    vs_currencies: vsCurrencies,
  });

  const response = await fetch(`${BASE_URL}/simple/price?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.status}`);
  }

  const data = await response.json();
  return data[coinId] || {};
}
