import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here in future
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      // redirect to login
    }
    return Promise.reject(error)
  }
)

export default api

// API client functions
export const patientAPI = {
  list: async (params?: { skip?: number; limit?: number; search?: string }) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/patients/${id}`);
  },
};

export const analysisAPI = {
  list: async (params?: { skip?: number; limit?: number; status?: string; patient_id?: number }) => {
    const response = await api.get('/analyses', { params });
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/analyses/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/analyses/${id}`);
  },
  create: async (imageFile: File, patientId?: number) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (patientId) {
      formData.append('patient_id', patientId.toString());
    }
    
    const response = await api.post('/infer/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const statisticsAPI = {
  get: async () => {
    const response = await api.get('/statistics');
    return response.data;
  },
  trends: async (days?: number) => {
    const response = await api.get('/statistics/trends', { params: { days } });
    return response.data;
  },
  findings: async () => {
    const response = await api.get('/statistics/findings');
    return response.data;
  },
};

export const searchAPI = {
  global: async (query: string) => {
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  },
};
