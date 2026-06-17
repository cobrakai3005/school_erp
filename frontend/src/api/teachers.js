import api from "./axios";

export const teachersApi = {
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/teachers`, { params });
    return response.data;
  },

  getById: async (schoolId, id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (schoolId, data) => {
    const response = await api.post(`/teachers`, data);
    return response.data;
  },

  update: async (schoolId, id, data) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (schoolId, id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
