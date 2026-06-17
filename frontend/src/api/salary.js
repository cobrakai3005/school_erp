import api from "./axios";

export const salaryApi = {
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/salaries`, { params });
    return response.data;
  },

  getById: async (schoolId, id) => {
    const response = await api.get(`/salaries/${id}`);
    return response.data;
  },

  create: async (schoolId, data) => {
    const response = await api.post(`/salaries`, data);
    return response.data;
  },

  update: async (schoolId, id, data) => {
    const response = await api.put(`/salaries/${id}`, data);
    return response.data;
  },

  delete: async (schoolId, id) => {
    const response = await api.delete(`/salaries/${id}`);
    return response.data;
  },

  generatePayslip: async (schoolId, salaryId) => {
    const response = await api.get(`/salaries/${salaryId}/payslip`);
    return response.data;
  },
};
