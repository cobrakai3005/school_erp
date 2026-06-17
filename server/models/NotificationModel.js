const { pool } = require("../config/database");

class NotificationModel {
  // Create a new notification
  static async create(data) {
    const {
      title,
      message,
      notification_type = "announcement",
      target_roles,
      target_class_id,
      send_to_all = false,
      created_by,
      expiry_date,
      status = "published",
      school_id,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO notifications (
        title, message, notification_type, target_roles, target_class_id,
        send_to_all, created_by, expiry_date, status, school_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        message,
        notification_type,
        target_roles ? JSON.stringify(target_roles) : null,
        target_class_id,
        send_to_all,
        created_by,
        expiry_date,
        status,
        school_id,
      ],
    );
    return result.insertId;
  }

  // Find notifications for a user based on their role

  static async findForUser(
    userId,
    userType,
    schoolId,
    classId = null,
    page = 1,
    limit = 10,
  ) {
    const offset = (page - 1) * limit;

    let query = `
    SELECT n.*, 
           u.full_name as created_by_name,
           nr.read_at IS NOT NULL as is_read
    FROM notifications n
    LEFT JOIN users u ON n.created_by = u.id
    LEFT JOIN notification_reads nr 
      ON n.id = nr.notification_id 
      AND nr.user_id = ?
    WHERE n.status = 'published'
     
      AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
      AND (
        n.send_to_all = TRUE
        OR JSON_CONTAINS(n.target_roles, ?)
        ${classId ? "OR n.target_class_id = ?" : ""}
      )
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `;

    const params = [userId, JSON.stringify(userType)];

    if (classId) {
      params.push(classId);
    }

    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(query, params);

    // Total count query
    let countQuery = `
    SELECT COUNT(*) as total
    FROM notifications n
    WHERE n.status = 'published'
     
      AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
      AND (
        n.send_to_all = TRUE
        OR JSON_CONTAINS(n.target_roles, ?)
        ${classId ? "OR n.target_class_id = ?" : ""}
      )
  `;

    const countParams = [JSON.stringify(userType)];

    if (classId) {
      countParams.push(classId);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    return {
      notifications: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get unread count for a user

  static async getUnreadCount(userId, userType, schoolId, classId = null) {
    let query = `
    SELECT COUNT(*) AS count
    FROM notifications n

    LEFT JOIN notification_reads nr
      ON n.id = nr.notification_id
      AND nr.user_id = ?

    WHERE n.status = 'published'
      AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
      AND nr.id IS NULL

      AND (
        n.send_to_all = TRUE
        OR JSON_CONTAINS(n.target_roles, ?)
        ${classId ? "OR n.target_class_id = ?" : ""}
      )
  `;

    const params = [userId, JSON.stringify(userType)];

    if (classId) {
      params.push(classId);
    }

    const [rows] = await pool.query(query, params);

    return rows[0].count;
  }

  // Find notification by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT n.*, u.full_name as created_by_name
       FROM notifications n
       LEFT JOIN users u ON n.created_by = u.id
       WHERE n.id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM notifications n
    LEFT JOIN users u ON n.created_by = u.id
    WHERE (n.school_id = ? OR n.school_id IS NULL)
  `;

    const params = [schoolId];

    if (filters.status) {
      baseQuery += " AND n.status = ?";
      params.push(filters.status);
    }

    if (filters.notification_type) {
      baseQuery += " AND n.notification_type = ?";
      params.push(filters.notification_type);
    }

    if (filters.search) {
      baseQuery += " AND (n.title LIKE ? OR n.message LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count query
    const countQuery = `
    SELECT COUNT(*) as total
    ${baseQuery}
  `;

    const [countResult] = await pool.query(countQuery, params);

    // Main query
    const dataQuery = `
    SELECT 
      n.*, 
      u.full_name as created_by_name,
      (
        SELECT COUNT(*) 
        FROM notification_reads 
        WHERE notification_id = n.id
      ) as read_count
    ${baseQuery}
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `;

    const [rows] = await pool.query(dataQuery, [
      ...params,
      Number(limit),
      Number(offset),
    ]);

    return {
      notifications: rows,
      pagination: {
        total: countResult[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((countResult[0]?.total || 0) / limit),
      },
    };
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    await pool.query(
      `INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)`,
      [notificationId, userId],
    );
    return true;
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId, userType, schoolId, classId = null) {
    let query = `
      INSERT IGNORE INTO notification_reads (notification_id, user_id)
      SELECT n.id, ?
      FROM notifications n
      LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
      WHERE n.status = 'published'
        AND (n.school_id = ? OR n.school_id IS NULL)
        AND nr.id IS NULL
        AND (
          n.send_to_all = TRUE
          OR JSON_CONTAINS(n.target_roles, ?)
          ${classId ? "OR n.target_class_id = ?" : ""}
        )
    `;

    const params = [userId, userId, schoolId, JSON.stringify(userType)];
    if (classId) params.push(classId);

    await pool.query(query, params);
    return true;
  }

  // Update notification
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && key !== "id") {
        if (key === "target_roles") {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE notifications SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete notification
  static async delete(id) {
    // First delete read records
    await pool.query(
      "DELETE FROM notification_reads WHERE notification_id = ?",
      [id],
    );
    // Then delete notification
    const [result] = await pool.query(
      "DELETE FROM notifications WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = NotificationModel;
