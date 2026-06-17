import api from "./axios";

export const attendanceApi = {
  getByClass: async (classId, date) => {
    const response = await api.get(`/attendance/class/${classId}`, {
      params: { date },
    });
    return response.data;
  },

  getByStudent: async (studentId, params = {}) => {
    const response = await api.get(`/attendance/student/${studentId}`, {
      params,
    });
    return response.data;
  },

  mark: async (data) => {
    const response = await api.post("/attendance", data);
    return response.data;
  },

  markBulk: async (data) => {
    console.log(data);

    const response = await api.post("/attendance/students/bulk", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },

  getReport: async (params) => {
    const response = await api.get("/attendance/report", { params });
    return response.data;
  },
};
