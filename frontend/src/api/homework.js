import api from "./axios";

export const homeworkApi = {
  // Get all homework assignments
  getAll: async (params = {}) => {
    const response = await api.get("/homework-assignment", { params });
    return response.data;
  },

  getHomeWorkForStudent: async (params = {}) => {
    const response = await api.get("/homework-assignment/class", { params });
    return response.data;
  },

  // Get homework by ID
  getById: async (id) => {
    const response = await api.get(`/homework-assignment/${id}`);
    return response.data;
  },
  // Get homework get by class
  getByClass: async (classId) => {
    const response = await api.get(`/homework-assignment/class/${classId}`);
    return response.data;
  },
  getByTeacher: async (teacherId) => {
    const response = await api.get(
      `/homework-assignment/teachers/${teacherId}`,
    );
    return response.data;
  },

  // Create homework assignment
  create: async (data, file) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    if (file) {
      formData.append("attachment", file);
    }

    const response = await api.post("/homework-assignment", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Update homework assignment
  update: async (id, data, file) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    if (file) {
      formData.append("attachment", file);
    }

    const response = await api.put(`/homework-assignment/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Delete homework assignment
  delete: async (id) => {
    const response = await api.delete(`/homework-assignment/${id}`);
    return response.data;
  },

  // Get submissions for a homework
  getSubmissions: async (homeworkId, params = {}) => {
    const response = await api.get(
      `/homework-submission/homework/${homeworkId}`,
      { params },
    );
    return response.data;
  },

  // Submit homework (student)
  submitHomework: async (data, file = null) => {
    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      formData.append("attachment", file);
      const response = await api.post("/homework-submission", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }
    const response = await api.post("/homework-submission", data);
    return response.data;
  },

  // Get all submissions (teacher/admin)
  getAllSubmissions: async (params = {}) => {
    const response = await api.get("/homework-submission", { params });
    return response.data;
  },

  // Get student's own submissions
  getMySubmissions: async () => {
    const response = await api.get("/homework-submission/my-submissions");
    return response.data;
  },

  // Grade a submission (teacher)
  gradeSubmission: async (id, data) => {
    const response = await api.put(`/homework-submission/${id}/grade`, data);
    return response.data;
  },

  // Update submission
  updateSubmission: async (id, data, file = null) => {
    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });
      formData.append("attachment", file);
      const response = await api.put(`/homework-submission/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    }
    const response = await api.put(`/homework-submission/${id}`, data);
    return response.data;
  },

  // Delete submission
  deleteSubmission: async (id) => {
    const response = await api.delete(`/homework-submission/${id}`);
    return response.data;
  },
};
