"use client";

import { useQuery } from "@tanstack/react-query";

import { statisticsService } from "@/services/statistics";
import type {
  FindingsBreakdown,
  StatisticsResponse,
  TrendResponse,
} from "@/types/statistics";

export const STATISTICS_QUERY_KEY = "statistics";

export function useStatisticsOverview() {
  return useQuery<StatisticsResponse>({
    queryKey: [STATISTICS_QUERY_KEY, "overview"],
    queryFn: () => statisticsService.getOverview(),
    staleTime: 1000 * 60,
  });
}

export function useStatisticsTrends(days?: number) {
  return useQuery<TrendResponse>({
    queryKey: [STATISTICS_QUERY_KEY, "trends", days ?? "default"],
    queryFn: () => statisticsService.getTrends(days),
    staleTime: 1000 * 60,
  });
}

export function useFindingsBreakdown() {
  return useQuery<FindingsBreakdown>({
    queryKey: [STATISTICS_QUERY_KEY, "findings"],
    queryFn: () => statisticsService.getFindingsBreakdown(),
    staleTime: 1000 * 60,
  });
}

