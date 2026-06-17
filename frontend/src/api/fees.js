import api from "./axios";

export const feesApi = {
  getStructures: async (schoolId, params = {}) => {
    const response = await api.get(`/fees/structures`, { params });
    return response.data;
  },

  createStructure: async (schoolId, data) => {
    const response = await api.post(`/fees/structures`, data);
    return response.data;
  },

  updateStructure: async (schoolId, id, data) => {
    const response = await api.put(`/fees/structures/${id}`, data);
    return response.data;
  },

  deleteStructure: async (schoolId, id) => {
    const response = await api.delete(`/fees/structures/${id}`);
    return response.data;
  },

  getPayments: async (schoolId, params = {}) => {
    const response = await api.get(`/fees/payments`, { params });
    return response.data;
  },

  createPayment: async (schoolId, data) => {
    const response = await api.post(`/fees/payments`, data);
    return response.data;
  },

  getStudentFees: async (schoolId, studentId) => {
    const response = await api.get(`/fees/student/${studentId}`);
    return response.data;
  },
};
