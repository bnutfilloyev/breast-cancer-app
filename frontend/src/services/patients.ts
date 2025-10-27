import { httpClient } from "@/lib/http";
import type {
  PatientCreateInput,
  PatientDetail,
  PatientListParams,
  PatientListResponse,
  PatientUpdateInput,
} from "@/types/patient";

export const patientService = {
  async list(params?: PatientListParams) {
    const { data } = await httpClient.get<PatientListResponse>("/patients", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await httpClient.get<PatientDetail>(`/patients/${id}`);
    return data;
  },

  async create(payload: PatientCreateInput) {
    const { data } = await httpClient.post<PatientDetail>("/patients", payload);
    return data;
  },

  async update(id: number, payload: PatientUpdateInput) {
    const { data } = await httpClient.patch<PatientDetail>(`/patients/${id}`, payload);
    return data;
  },

  async delete(id: number) {
    await httpClient.delete(`/patients/${id}`);
  },
};

