import { useQuery } from "@tanstack/react-query";
import { fetchCryptoNews, NewsFilter, NewsItem } from "@/services/newsApi";

// Query key factory
export const newsKeys = {
  all: ["news"] as const,
  list: (filter: NewsFilter, currencies?: string) =>
    [...newsKeys.all, "list", filter, currencies] as const,
};

export const useCryptoNews = (
  filter: NewsFilter = "all",
  currencies?: string
) => {
  return useQuery<NewsItem[]>({
    queryKey: newsKeys.list(filter, currencies),
    queryFn: () => fetchCryptoNews(filter, currencies),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
};
