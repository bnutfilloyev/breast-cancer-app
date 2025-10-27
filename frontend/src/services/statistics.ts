import { httpClient } from "@/lib/http";
import type {
  FindingsBreakdown,
  StatisticsResponse,
  TrendResponse,
} from "@/types/statistics";

export const statisticsService = {
  async getOverview() {
    const { data } = await httpClient.get<StatisticsResponse>("/statistics");
    return data;
  },

  async getTrends(days?: number) {
    const { data } = await httpClient.get<TrendResponse>("/statistics/trends", { params: { days } });
    return data;
  },

  async getFindingsBreakdown() {
    const { data } = await httpClient.get<FindingsBreakdown>("/statistics/findings");
    return data;
  },
};

