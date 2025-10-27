import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Placeholder for auth handling
    }
    return Promise.reject(error);
  }
);

export const patientAPI = {
  list: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const response = await api.get("/patients", { params });
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  create: async (data: unknown) => {
    const response = await api.post("/patients", data);
    return response.data;
  },
  update: async (id: number, data: unknown) => {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/patients/${id}`);
  },
};

export const analysisAPI = {
  list: async (params?: { skip?: number; limit?: number; status?: string; patient_id?: number }) => {
    const response = await api.get("/analyses", { params });
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  },
  update: async (id: number, data: unknown) => {
    const response = await api.patch(`/analyses/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/analyses/${id}`);
  },
  create: async (imageFile: File, patientId?: number) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    if (patientId) {
      formData.append("patient_id", patientId.toString());
    }

    const response = await api.post("/infer/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export const statisticsAPI = {
  get: async () => {
    const response = await api.get("/statistics");
    return response.data;
  },
  trends: async (days?: number) => {
    const response = await api.get("/statistics/trends", { params: { days } });
    return response.data;
  },
  findings: async () => {
    const response = await api.get("/statistics/findings");
    return response.data;
  },
};

export const searchAPI = {
  global: async (query: string) => {
    const response = await api.get("/search", { params: { q: query } });
    return response.data;
  },
};

export const systemAPI = {
  health: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};
