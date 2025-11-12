import { httpClient } from "@/lib/http";
import type {
  AnalysisDetail,
  AnalysisListParams,
  AnalysisListResponse,
  AnalysisStatus,
  AnalysisUpdateInput,
} from "@/types/analysis";

export const analysisService = {
  async list(params?: AnalysisListParams) {
    const { data } = await httpClient.get<AnalysisListResponse>("/analyses", { params });
    return data;
  },

  async get(id: number) {
    const { data } = await httpClient.get<AnalysisDetail>(`/analyses/${id}`);
    return data;
  },

  async update(id: number, payload: AnalysisUpdateInput) {
    const { data } = await httpClient.patch<AnalysisDetail>(`/analyses/${id}`, payload);
    return data;
  },

  async delete(id: number) {
    await httpClient.delete(`/analyses/${id}`);
  },

  async create(imageFile: File, patientId?: number) {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (patientId) {
      formData.append("patient_id", String(patientId));
    }

    const { data } = await httpClient.post("/infer/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data as { analysis_id: number } & Record<string, unknown>;
  },

  async listByPatient(patientId: number, status?: AnalysisStatus) {
    const params: AnalysisListParams = { patient_id: patientId };
    if (status) {
      params.status = status;
    }
    return this.list(params);
  },

  async createMulti(files: {
    lcc: File;
    rcc: File;
    lmlo: File;
    rmlo: File;
  }, patientId?: number) {
    const formData = new FormData();
    formData.append("lcc", files.lcc);
    formData.append("rcc", files.rcc);
    formData.append("lmlo", files.lmlo);
    formData.append("rmlo", files.rmlo);
    if (patientId) {
      formData.append("patient_id", String(patientId));
    }

    const { data } = await httpClient.post("/infer/multi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data as { analysis_id: number } & Record<string, unknown>;
  },

  async exportJson(id: number) {
    const { data } = await httpClient.get(`/export/analyses/${id}/json`);
    return data as Record<string, unknown>;
  },

  async exportPdf(id: number) {
    const response = await httpClient.get(`/export/analyses/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
