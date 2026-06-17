import api from "../api/axios";

const parentService = {
  // Fetch all parents for a specific school
  getAllParents: async () => {
    const response = await api.get(`/parents`);
    console.log(response);

    return response.data;
  },

  // Get a single parent by ID
  getParentById: async (id) => {
    const response = await api.get(`/parents`);
    return response.data;
  },

  // Create a new parent (and user)
  createParent: async (parentData) => {
    const response = await api.post(`/parents`, parentData);
    return response.data;
  },

  // Update parent details
  updateParent: async (id, parentData) => {
    const response = await api.put(`/parents/${id}`, parentData);
    return response.data;
  },

  // Soft delete a parent
  deleteParent: async (id) => {
    const response = await api.delete(`/parents`);
    return response.data;
  },
};

export default parentService;
