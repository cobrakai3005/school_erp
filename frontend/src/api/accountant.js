import api from "../api/axios";

export const accountantApi = {
  // Get all accountants
  getAll: async (params = {}) => {
    const response = await api.get("/accountants", {
      params,
    });

    return response.data;
  },

  // Get accountant by ID
  getById: async (id) => {
    const response = await api.get(`/accountants/${id}`);

    return response.data;
  },

  // Create accountant
  create: async (data) => {
    const response = await api.post("/accountants", data);

    return response.data;
  },

  // Update accountant
  update: async (id, data) => {
    const response = await api.put(`/accountants/${id}`, data);

    return response.data;
  },

  // Delete accountant
  delete: async (id) => {
    const response = await api.delete(`/accountants/${id}`);

    return response.data;
  },
};
