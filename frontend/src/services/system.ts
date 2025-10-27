import { httpClient } from "@/lib/http";
import type { HealthResponse } from "@/types/system";

export const systemService = {
  async health() {
    const { data } = await httpClient.get<HealthResponse>("/health");
    return data;
  },
};

