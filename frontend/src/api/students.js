import api from "./axios";

export const studentsApi = {
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/students`, { params });
    return response.data;
  },

  getById: async (schoolId, id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (schoolId, data) => {
    const response = await api.post(`/students`, data);
    return response.data;
  },

  update: async (schoolId, id, data) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  },

  delete: async (schoolId, id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  getByClass: async (schoolId, classId) => {
    const response = await api.get(`/students/class/${classId}`);
    return response.data;
  },

  getFeeDues: async (schoolId, studentId) => {
    const response = await api.get(`/students/${studentId}/fees`);
    return response.data;
  },
};
