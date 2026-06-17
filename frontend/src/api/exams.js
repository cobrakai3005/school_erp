import api from "./axios";

export const examsApi = {
  getAll: async (schoolId, params = {}) => {
    const response = await api.get(`/exams`, { params });
    return response.data;
  },

  getById: async (schoolId, id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  create: async (schoolId, data) => {
    const response = await api.post(`/exams`, data);
    return response.data;
  },

  update: async (schoolId, id, data) => {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (schoolId, id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  getResults: async (schoolId, examId, params = {}) => {
    const response = await api.get(`/exams/${examId}/results`, { params });
    return response.data;
  },

  addResult: async (schoolId, examId, data) => {
    const response = await api.post(`/exams/${examId}/results`, data);
    return response.data;
  },

  updateResult: async (schoolId, examId, resultId, data) => {
    const response = await api.put(
      `/exams/${examId}/results/${resultId}`,
      data,
    );
    return response.data;
  },
};
