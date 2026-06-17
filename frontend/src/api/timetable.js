import api from "./axios";

export const timetableApi = {
  // Get timetable for a class
  getByClass: async (classId) => {
    const response = await api.get(`/timetable/class/${classId}`);
    return response.data;
  },

  // Teacher: Get my timetable
  getMyTimetable: async () => {
    const response = await api.get("/timetable/my");
    return response.data;
  },

  // Student: Get my class timetable
  getStudentTimetable: async () => {
    const response = await api.get("/timetable/student");
    return response.data;
  },

  // Admin: Get all timetable entries
  getAll: async (params = {}) => {
    const response = await api.get("/timetable", { params });
    return response.data;
  },

  // Get timetable entry by ID
  getById: async (id) => {
    const response = await api.get(`/timetable/${id}`);
    return response.data;
  },

  // Admin: Create timetable entry
  create: async (data) => {
    const response = await api.post("/timetable", data);
    return response.data;
  },

  // Admin: Update timetable entry
  update: async (id, data) => {
    const response = await api.put(`/timetable/${id}`, data);
    return response.data;
  },

  // Admin: Delete timetable entry
  delete: async (id) => {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  },

  // Admin: Clear timetable for a class
  clearByClass: async (classId) => {
    const response = await api.delete(`/timetable/class/${classId}`);
    return response.data;
  },
};
