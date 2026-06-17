import api from "./axios";

export const notificationsApi = {
  // Get my notifications (user-specific)
  getMyNotifications: async (params = {}) => {
    const response = await api.get("/notifications/my", { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.post("/notifications/read-all");
    return response.data;
  },

  // Admin: Get all notifications
  getAll: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  // Admin: Get notification by ID
  getById: async (id) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  // Admin: Create notification
  create: async (data) => {
    const response = await api.post("/notifications", data);
    return response.data;
  },

  // Admin: Update notification
  update: async (id, data) => {
    const response = await api.put(`/notifications/${id}`, data);
    return response.data;
  },

  // Admin: Delete notification
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
