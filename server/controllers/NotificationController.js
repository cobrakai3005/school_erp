const NotificationModel = require("../models/NotificationModel");
const StudentModel = require("../models/StudentModel");

class NotificationController {
  // Get notifications for current user
  static async getMyNotifications(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.user_type;
      const schoolId = req.schoolId;
      const { page = 1, limit = 10 } = req.query;

      // If student, get their class_id
      let classId = null;
      if (userType === "student") {
        const student = await StudentModel.findByUserId(userId);
        classId = student?.class_id;
      }

      const result = await NotificationModel.findForUser(
        userId,
        userType,
        schoolId,
        classId,
        parseInt(page),
        parseInt(limit),
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get My Notifications Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get unread count for current user
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.user_type;
      const schoolId = req.schoolId;

      // If student, get their class_id
      let classId = null;
      if (userType === "student") {
        const student = await StudentModel.findByUserId(userId);
        classId = student?.class_id;
      }

      const count = await NotificationModel.getUnreadCount(
        userId,
        userType,
        schoolId,
        classId,
      );

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Get Unread Count Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all notifications for school (admin view)
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const {
        page = 1,
        limit = 10,
        status,
        notification_type,
        search,
      } = req.query;

      const result = await NotificationModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        {
          status,
          notification_type,
          search,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Notifications Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get single notification
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error("Get Notification Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create notification
  static async create(req, res) {
    try {
      const schoolId = req.schoolId;
      const userId = req.user.id;
      const {
        title,
        message,
        notification_type,
        target_roles,
        target_class_id,
        send_to_all,
        expiry_date,
        status,
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      const notificationId = await NotificationModel.create({
        title,
        message,
        notification_type,
        target_roles,
        target_class_id,
        send_to_all,
        created_by: userId,
        expiry_date,
        status,
        school_id: schoolId,
      });

      const notification = await NotificationModel.findById(notificationId);

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
      });
    } catch (error) {
      console.error("Create Notification Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update notification
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        message,
        notification_type,
        target_roles,
        target_class_id,
        send_to_all,
        expiry_date,
        status,
      } = req.body;

      const existing = await NotificationModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      await NotificationModel.update(id, {
        title,
        message,
        notification_type,
        target_roles,
        target_class_id,
        send_to_all,
        expiry_date,
        status,
      });

      const notification = await NotificationModel.findById(id);

      res.json({
        success: true,
        message: "Notification updated successfully",
        data: notification,
      });
    } catch (error) {
      console.error("Update Notification Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete notification
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existing = await NotificationModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      await NotificationModel.delete(id);

      res.json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Delete Notification Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark as read
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await NotificationModel.markAsRead(id, userId);

      res.json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      console.error("Mark As Read Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark all as read
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const userType = req.user.user_type;
      const schoolId = req.schoolId;

      // If student, get their class_id
      let classId = null;
      if (userType === "student") {
        const student = await StudentModel.findByUserId(userId);
        classId = student?.class_id;
      }

      await NotificationModel.markAllAsRead(
        userId,
        userType,
        schoolId,
        classId,
      );

      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Mark All As Read Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = NotificationController;
