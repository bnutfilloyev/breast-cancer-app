import { httpClient } from "@/lib/http";
import type {
  FindingsBreakdown,
  StatisticsResponse,
  TrendResponse,
} from "@/types/statistics";

const fetchOverview = async () => {
  const { data } = await httpClient.get<StatisticsResponse>("/statistics");
  return data;
};

const fetchTrends = async (days?: number) => {
  const { data } = await httpClient.get<TrendResponse>("/statistics/trends", {
    params: { days },
  });
  return data;
};

const fetchFindingsBreakdown = async () => {
  const { data } = await httpClient.get<FindingsBreakdown>(
    "/statistics/findings",
  );
  return data;
};

export const statisticsService = {
  getOverview: fetchOverview,
  getTrends: fetchTrends,
  getFindingsBreakdown: fetchFindingsBreakdown,
  get: fetchOverview,
  trends: fetchTrends,
  findings: fetchFindingsBreakdown,
};
