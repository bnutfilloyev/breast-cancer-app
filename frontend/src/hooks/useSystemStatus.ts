"use client";

import { useQuery } from "@tanstack/react-query";

import { systemService } from "@/services/system";
import type { HealthResponse } from "@/types/system";

export const SYSTEM_STATUS_QUERY_KEY = "system-health";

type SystemStatusData = {
  health: HealthResponse;
  checkedAt: string;
};

export function useSystemStatus() {
  return useQuery<SystemStatusData>({
    queryKey: [SYSTEM_STATUS_QUERY_KEY],
    queryFn: async () => ({
      health: await systemService.health(),
      checkedAt: new Date().toISOString(),
    }),
    refetchInterval: 30_000,
    retry: 1,
    staleTime: 0,
  });
}

