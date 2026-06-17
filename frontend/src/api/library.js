import api from "./axios";

export const libraryApi = {
  getBooks: async (schoolId, params = {}) => {
    const response = await api.get(`/library/books`, { params });
    return response.data;
  },

  getBookById: async (schoolId, id) => {
    const response = await api.get(`/library/books/${id}`);
    return response.data;
  },

  createBook: async (schoolId, data) => {
    const response = await api.post(`/library/books`, data);
    return response.data;
  },

  updateBook: async (schoolId, id, data) => {
    const response = await api.put(`/library/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (schoolId, id) => {
    const response = await api.delete(`/library/books/${id}`);
    return response.data;
  },

  getIssues: async (schoolId, params = {}) => {
    const response = await api.get(`/library/issues`, { params });
    return response.data;
  },

  issueBook: async (schoolId, data) => {
    const response = await api.post(`/library/issues`, data);
    return response.data;
  },

  returnBook: async (schoolId, issueId) => {
    const response = await api.put(`/library/issues/${issueId}/return`);
    return response.data;
  },
};
