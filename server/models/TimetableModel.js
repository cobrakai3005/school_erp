const { pool } = require("../config/database");

class TimetableModel {
  // Create a new timetable entry
  static async create(data) {
    const {
      class_id,
      day_of_week,
      period_number,
      start_time,
      end_time,
      subject,
      teacher_id,
      room_no,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO timetable (
        class_id, day_of_week, period_number, start_time, end_time,
        subject, teacher_id, room_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        class_id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        subject,
        teacher_id,
        room_no,
      ],
    );
    return result.insertId;
  }

  // Find timetable by class
  static async findByClass(classId) {
    const [rows] = await pool.query(
      `SELECT t.*, u.full_name as teacher_name
       FROM timetable t
       LEFT JOIN staff_teachers st ON t.teacher_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       WHERE t.class_id = ?
       ORDER BY FIELD(t.day_of_week, 'monday', 'tuesday', 'wedensday', 'thursday', 'friday', 'saturday', 'sunday'), t.period_number`,
      [classId],
    );
    return rows;
  }

  // Find timetable by teacher
  static async findByTeacher(teacherId) {
    const [rows] = await pool.query(
      `SELECT t.*, c.class_name, c.section
       FROM timetable t
       JOIN classes c ON t.class_id = c.id
       WHERE t.teacher_id = ?
       ORDER BY FIELD(t.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'), t.period_number`,
      [teacherId],
    );
    return rows;
  }

  // Find timetable by day for a class
  static async findByClassAndDay(classId, dayOfWeek) {
    const [rows] = await pool.query(
      `SELECT t.*, u.full_name as teacher_name
       FROM timetable t
       LEFT JOIN staff_teachers st ON t.teacher_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       WHERE t.class_id = ? AND t.day_of_week = ?
       ORDER BY t.period_number`,
      [classId, dayOfWeek],
    );
    return rows;
  }

  // Find timetable entry by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT t.*, u.full_name as teacher_name, c.class_name, c.section
       FROM timetable t
       LEFT JOIN staff_teachers st ON t.teacher_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       LEFT JOIN classes c ON t.class_id = c.id
       WHERE t.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Get all timetable entries for a school
  static async findBySchool(schoolId, page = 1, limit = 50, filters = {}) {
    const offset = (page - 1) * limit;

    let whereClause = `
    WHERE c.school_id = ?
  `;

    const params = [schoolId];

    if (filters.class_id) {
      whereClause += " AND t.class_id = ?";
      params.push(filters.class_id);
    }

    if (filters.day_of_week) {
      whereClause += " AND t.day_of_week = ?";
      params.push(filters.day_of_week);
    }

    if (filters.teacher_id) {
      whereClause += " AND t.teacher_id = ?";
      params.push(filters.teacher_id);
    }

    // Main query
    const query = `
    SELECT 
      t.*, 
      u.full_name as teacher_name, 
      c.class_name, 
      c.section
    FROM timetable t
    JOIN classes c ON t.class_id = c.id
    LEFT JOIN staff_teachers st ON t.teacher_id = st.id
    LEFT JOIN users u ON st.user_id = u.id
    ${whereClause}
    ORDER BY 
      c.class_name,
      FIELD(
        t.day_of_week,
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ),
      t.period_number
    LIMIT ? OFFSET ?
  `;

    // Count query
    const countQuery = `
    SELECT COUNT(*) as total
    FROM timetable t
    JOIN classes c ON t.class_id = c.id
    ${whereClause}
  `;

    const [countResult] = await pool.query(countQuery, params);

    const [rows] = await pool.query(query, [...params, limit, offset]);

    return {
      timetable: rows,
      pagination: {
        total: countResult[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((countResult[0]?.total || 0) / limit),
      },
    };
  }

  // Update timetable entry
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && key !== "id") {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE timetable SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete timetable entry
  static async delete(id) {
    const [result] = await pool.query("DELETE FROM timetable WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }

  // Delete all timetable entries for a class
  static async deleteByClass(classId) {
    const [result] = await pool.query(
      "DELETE FROM timetable WHERE class_id = ?",
      [classId],
    );
    return result.affectedRows;
  }

  // Check for conflicts
  static async checkConflict(
    classId,
    dayOfWeek,
    periodNumber,
    excludeId = null,
  ) {
    let query = `SELECT id FROM timetable WHERE class_id = ? AND day_of_week = ? AND period_number = ?`;
    const params = [classId, dayOfWeek, periodNumber];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }

  // Check teacher availability
  static async checkTeacherConflict(
    teacherId,
    dayOfWeek,
    startTime,
    endTime,
    excludeId = null,
  ) {
    let query = `
      SELECT id FROM timetable 
      WHERE teacher_id = ? AND day_of_week = ?
        AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
    `;
    const params = [
      teacherId,
      dayOfWeek,
      startTime,
      startTime,
      endTime,
      endTime,
    ];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }
}

module.exports = TimetableModel;
