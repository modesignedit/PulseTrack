/**
 * CryptoPanic News API Service
 * Fetches latest crypto news with sentiment analysis
 */

export interface NewsSource {
  title: string;
  region: string;
  domain: string;
}

export interface NewsVotes {
  negative: number;
  positive: number;
  important: number;
  liked: number;
  disliked: number;
  lol: number;
  toxic: number;
  saved: number;
  comments: number;
}

export interface NewsCurrency {
  code: string;
  title: string;
  slug: string;
  url: string;
}

export interface NewsItem {
  kind: string;
  domain: string;
  source: NewsSource;
  title: string;
  published_at: string;
  slug: string;
  id: number;
  url: string;
  created_at: string;
  votes: NewsVotes;
  currencies?: NewsCurrency[];
}

export interface NewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsItem[];
}

export type NewsFilter = "rising" | "hot" | "bullish" | "bearish" | "all";

const API_KEY = import.meta.env.VITE_CRYPTOPANIC_API_KEY;
const BASE_URL = "https://cryptopanic.com/api/v1";

export const fetchCryptoNews = async (
  filter: NewsFilter = "all",
  currencies?: string
): Promise<NewsItem[]> => {
  if (!API_KEY) {
    // Return mock data when no API key is configured
    return getMockNews();
  }

  try {
    const params = new URLSearchParams({
      auth_token: API_KEY,
      public: "true",
    });

    if (filter !== "all") {
      params.append("filter", filter);
    }

    if (currencies) {
      params.append("currencies", currencies);
    }

    const response = await fetch(`${BASE_URL}/posts/?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data.results.slice(0, 8);
  } catch (error) {
    console.error("Failed to fetch crypto news:", error);
    return getMockNews();
  }
};

export const hasNewsApiKey = (): boolean => {
  return !!API_KEY;
};

// Mock news data for demo/fallback
const getMockNews = (): NewsItem[] => [
  {
    kind: "news",
    domain: "coindesk.com",
    source: { title: "CoinDesk", region: "en", domain: "coindesk.com" },
    title: "Bitcoin Surges Past Key Resistance Level as Institutional Interest Grows",
    published_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    slug: "bitcoin-surges",
    id: 1,
    url: "#",
    created_at: new Date().toISOString(),
    votes: { negative: 2, positive: 45, important: 12, liked: 30, disliked: 1, lol: 0, toxic: 0, saved: 8, comments: 15 },
    currencies: [{ code: "BTC", title: "Bitcoin", slug: "bitcoin", url: "#" }],
  },
  {
    kind: "news",
    domain: "decrypt.co",
    source: { title: "Decrypt", region: "en", domain: "decrypt.co" },
    title: "Ethereum Layer 2 Solutions See Record Transaction Volume",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    slug: "ethereum-l2",
    id: 2,
    url: "#",
    created_at: new Date().toISOString(),
    votes: { negative: 1, positive: 32, important: 8, liked: 22, disliked: 0, lol: 0, toxic: 0, saved: 5, comments: 9 },
    currencies: [{ code: "ETH", title: "Ethereum", slug: "ethereum", url: "#" }],
  },
  {
    kind: "news",
    domain: "cointelegraph.com",
    source: { title: "Cointelegraph", region: "en", domain: "cointelegraph.com" },
    title: "Major Bank Announces Crypto Custody Services for Institutional Clients",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    slug: "bank-custody",
    id: 3,
    url: "#",
    created_at: new Date().toISOString(),
    votes: { negative: 5, positive: 28, important: 15, liked: 18, disliked: 3, lol: 0, toxic: 0, saved: 12, comments: 22 },
  },
  {
    kind: "news",
    domain: "theblock.co",
    source: { title: "The Block", region: "en", domain: "theblock.co" },
    title: "Solana DeFi TVL Hits New All-Time High Amid Network Upgrades",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    slug: "solana-defi",
    id: 4,
    url: "#",
    created_at: new Date().toISOString(),
    votes: { negative: 0, positive: 41, important: 6, liked: 35, disliked: 0, lol: 0, toxic: 0, saved: 9, comments: 11 },
    currencies: [{ code: "SOL", title: "Solana", slug: "solana", url: "#" }],
  },
  {
    kind: "news",
    domain: "bitcoinmagazine.com",
    source: { title: "Bitcoin Magazine", region: "en", domain: "bitcoinmagazine.com" },
    title: "Lightning Network Capacity Reaches Record 5,000 BTC",
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    slug: "lightning-capacity",
    id: 5,
    url: "#",
    created_at: new Date().toISOString(),
    votes: { negative: 1, positive: 55, important: 20, liked: 42, disliked: 2, lol: 0, toxic: 0, saved: 15, comments: 18 },
    currencies: [{ code: "BTC", title: "Bitcoin", slug: "bitcoin", url: "#" }],
  },
];
