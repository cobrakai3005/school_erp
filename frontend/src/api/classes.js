import api from "./axios";

export const classesApi = {
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/classes`, { params });
    return response.data;
  },

  getById: async (schoolId, id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (schoolId, data) => {
    const response = await api.post(`/classes`, data);
    return response.data;
  },

  update: async (schoolId, id, data) => {
    const response = await api.put(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (schoolId, id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};
