"use client";

import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { patientService } from "@/services/patients";
import type {
  PatientCreateInput,
  PatientListParams,
  PatientListResponse,
  PatientUpdateInput,
} from "@/types/patient";

export const PATIENTS_QUERY_KEY = "patients";

export function usePatientsList(params: PatientListParams) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, params],
    queryFn: () => patientService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePatientDetail(id?: number) {
  return useQuery({
    queryKey: [PATIENTS_QUERY_KEY, "detail", id],
    queryFn: () => patientService.get(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientCreateInput) => patientService.create(payload),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
    },
  });
}

export function useUpdatePatient(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientUpdateInput) => patientService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY, "detail", id] });
    },
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
