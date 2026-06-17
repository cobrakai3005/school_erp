import api from "./axios";

export const staffApi = {
  // Get all staff members (teachers + accountants + other staff)
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/staff`, { params });
    return response.data;
  },

  // Get staff by ID
  getById: async (schoolId, id) => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  // Get staff salary history
  getSalaryHistory: async (schoolId, id, params = {}) => {
    const response = await api.get(`/staff/${id}/salary-history`, { params });
    return response.data;
  },

  // Get staff counts by type
  getCounts: async (schoolId) => {
    const response = await api.get(`/staff/counts`);
    return response.data;
  },
};
