import api from './axios';

export const dashboardApi = {
  // Get super admin dashboard stats
  getSuperAdminStats: async () => {
    const response = await api.get('/dashboard/super-admin');
    return response.data;
  },

  // Get admin dashboard stats
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Get teacher dashboard stats
  getTeacherStats: async () => {
    const response = await api.get('/dashboard/teacher');
    return response.data;
  },

  // Get student dashboard stats
  getStudentStats: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  // Get fee accountant dashboard stats
  getAccountantFeeStats: async () => {
    const response = await api.get('/dashboard/accountant-fee');
    return response.data;
  },

  // Get salary accountant dashboard stats
  getAccountantSalaryStats: async () => {
    const response = await api.get('/dashboard/accountant-salary');
    return response.data;
  },

  // Get librarian dashboard stats
  getLibrarianStats: async () => {
    const response = await api.get('/dashboard/librarian');
    return response.data;
  },
};
