"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { patientService } from "@/services/patients";
import type { PatientListParams, PatientListResponse } from "@/types/patient";

export const PATIENTS_QUERY_KEY = "patients";

export function usePatientsList(params: PatientListParams) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, params],
    queryFn: () => patientService.list(params),
    keepPreviousData: true,
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => patientService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [PATIENTS_QUERY_KEY] });

      const previous = queryClient.getQueriesData<PatientListResponse>({
        queryKey: [PATIENTS_QUERY_KEY],
      });

      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<PatientListResponse>(key, {
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
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
  });
}

