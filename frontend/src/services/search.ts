import { httpClient } from "@/lib/http";
import type { GlobalSearchResponse } from "@/types/search";

export const searchService = {
  async global(query: string) {
    const { data } = await httpClient.get<GlobalSearchResponse>("/search", {
      params: { q: query },
    });
    return data;
  },
};

