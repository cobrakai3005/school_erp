import api from "./axios";

export const superAdminApi = {
  // Get system-wide stats
  getStats: async () => {
    const response = await api.get("/super-admin/stats");
    return response.data;
  },

  // Get all schools with filters
  getSchools: async (params = {}) => {
    const response = await api.get("/super-admin/schools", { params });
    return response.data;
  },

  // Switch school context
  switchSchool: async (schoolId) => {
    const response = await api.get(`/super-admin/schools/${schoolId}/switch`);
    return response.data;
  },

  // Get all students across all schools
  getAllStudents: async (params = {}) => {
    const response = await api.get("/super-admin/students", { params });
    return response.data;
  },

  // Get all teachers across all schools
  getAllTeachers: async (params = {}) => {
    const response = await api.get("/super-admin/teachers", { params });
    return response.data;
  },

  // Get all staff across all schools
  getAllStaff: async (params = {}) => {
    const response = await api.get("/super-admin/staff", { params });
    return response.data;
  },

  // Get all admins across all schools
  getAllAdmins: async (params = {}) => {
    const response = await api.get("/super-admin/admins", { params });
    return response.data;
  },

  // Get all classes across all schools
  getAllClasses: async (params = {}) => {
    const response = await api.get("/super-admin/classes", { params });
    return response.data;
  },
};
