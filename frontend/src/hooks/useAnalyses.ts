"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { analysisService } from "@/services/analyses";
import type { AnalysisListParams, AnalysisListResponse } from "@/types/analysis";

export const ANALYSES_QUERY_KEY = "analyses";

export function useAnalysesList(params: AnalysisListParams) {
  return useQuery({
    queryKey: [ANALYSES_QUERY_KEY, params],
    queryFn: () => analysisService.list(params),
    keepPreviousData: true,
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => analysisService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [ANALYSES_QUERY_KEY] });

      const previous = queryClient.getQueriesData<AnalysisListResponse>({
        queryKey: [ANALYSES_QUERY_KEY],
      });

      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<AnalysisListResponse>(key, {
          ...data,
          items: data.items.filter((item) => item.id !== id),
          total: Math.max(data.total - 1, 0),
        });
      });

      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYSES_QUERY_KEY] });
    },
  });
}

