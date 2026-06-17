import api from './axios';

export const usersApi = {
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/schools/${schoolId}/users`, { params });
    return response.data;
  },

  getById: async (schoolId, id) => {
    const response = await api.get(`/schools/${schoolId}/users/${id}`);
    return response.data;
  },

  create: async (schoolId, data) => {
    const response = await api.post(`/schools/${schoolId}/users`, data);
    return response.data;
  },

  update: async (schoolId, id, data) => {
    const response = await api.put(`/schools/${schoolId}/users/${id}`, data);
    return response.data;
  },

  delete: async (schoolId, id) => {
    const response = await api.delete(`/schools/${schoolId}/users/${id}`);
    return response.data;
  }
};
