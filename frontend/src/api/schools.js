import api from "./axios";

export const schoolsApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/schools", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/schools/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/schools", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/schools/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  },

  getDashboardStats: async (schoolId) => {
    const response = await api.get(`/schools/${schoolId}/dashboard`);
    return response.data;
  },
};
