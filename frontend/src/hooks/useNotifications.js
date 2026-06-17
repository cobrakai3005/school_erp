import { useState, useCallback } from "react";
import { notificationsApi } from "../api/notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get My Notifications
  const fetchMyNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationsApi.getMyNotifications(params);

      if (response.success) {
        setNotifications(response.data.notifications || []);
        setPagination(response.data.pagination || null);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notifications");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get Unread Count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount();

      if (response.success) {
        setUnreadCount(response.data.count || 0);
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to fetch unread notification count",
      };
    }
  }, []);

  // Mark As Read
  const markAsRead = useCallback(async (id) => {
    try {
      const response = await notificationsApi.markAsRead(id);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_read: true } : item,
          ),
        );
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to mark notification as read",
      };
    }
  }, []);

  // Mark All As Read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationsApi.markAllAsRead();

      if (response.success) {
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            is_read: true,
          })),
        );
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message ||
          "Failed to mark all notifications as read",
      };
    }
  }, []);

  // Admin: Get All Notifications
  const fetchAllNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationsApi.getAll(params);

      if (response.success) {
        setNotifications(response.data.notifications || []);
        setPagination(response.data.pagination || null);
      }

      return response;
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch all notifications",
      );

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Get Notification By ID
  const fetchNotificationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await notificationsApi.getById(id);

      if (response.success) {
        setNotification(response.data);
      }

      return response;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notification");

      return {
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Create Notification
  const createNotification = useCallback(async (data) => {
    try {
      const response = await notificationsApi.create(data);

      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create notification",
      };
    }
  }, []);

  // Admin: Update Notification
  const updateNotification = useCallback(async (id, data) => {
    try {
      const response = await notificationsApi.update(id, data);

      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update notification",
      };
    }
  }, []);

  // Admin: Delete Notification
  const deleteNotification = useCallback(async (id) => {
    try {
      const response = await notificationsApi.delete(id);

      if (response.success) {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
      }

      return response;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to delete notification",
      };
    }
  }, []);

  return {
    notifications,
    notification,
    unreadCount,
    pagination,
    loading,
    error,

    fetchMyNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,

    fetchAllNotifications,
    fetchNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
  };
}
