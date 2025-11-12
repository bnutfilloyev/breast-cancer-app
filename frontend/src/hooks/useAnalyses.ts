"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { analysisService } from "@/services/analyses";
import type {
  AnalysisDetail,
  AnalysisListParams,
  AnalysisListResponse,
  AnalysisUpdateInput,
} from "@/types/analysis";

export const ANALYSES_QUERY_KEY = "analyses";

type UseAnalysesOptions = {
  enabled?: boolean;
};

export function useAnalysesList(
  params?: AnalysisListParams,
  options?: UseAnalysesOptions,
) {
  return useQuery<AnalysisListResponse>({
    queryKey: [ANALYSES_QUERY_KEY, params ?? {}],
    queryFn: () => analysisService.list(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

export function useAnalysisDetail(id?: number) {
  return useQuery<AnalysisDetail>({
    queryKey: [ANALYSES_QUERY_KEY, "detail", id],
    queryFn: () => analysisService.get(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useUpdateAnalysis(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnalysisUpdateInput) => analysisService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANALYSES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ANALYSES_QUERY_KEY, "detail", id] });
    },
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
