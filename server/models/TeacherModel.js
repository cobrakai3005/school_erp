const { pool } = require("../config/database");

class TeacherModel {
  // Create a new teacher
  static async create(data) {
    const {
      employee_id,
      user_id,
      designation,
      department,
      qualification,
      experience_years,
      specialization,
      joining_date,
      class_teacher_of,
      subjects,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO staff_teachers (
        employee_id, user_id, designation, department, qualification, 
        experience_years, specialization, joining_date, class_teacher_of, subjects
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        user_id,
        designation,
        department,
        qualification,
        experience_years,
        specialization,
        joining_date,
        class_teacher_of || null,
        typeof subjects === "object" ? JSON.stringify(subjects) : subjects,
      ],
    );
    return result.insertId;
  }

  // Find all teachers by school
  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM staff_teachers st
    JOIN users u ON st.user_id = u.id
    WHERE u.school_id = ?
      AND (st.is_deleted = FALSE OR st.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.department) {
      baseQuery += ` AND st.department = ?`;
      params.push(filters.department);
    }

    if (filters.status) {
      baseQuery += ` AND st.status = ?`;
      params.push(filters.status);
    }

    if (filters.search) {
      baseQuery += `
      AND (
        u.full_name LIKE ?
        OR u.email LIKE ?
        OR u.phone LIKE ?
        OR st.employee_id LIKE ?
        OR st.designation LIKE ?
        OR st.specialization LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;

      params.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      );
    }

    // Count Query
    const countQuery = `
    SELECT COUNT(*) AS total
    ${baseQuery}
  `;

    const [countResult] = await pool.query(countQuery, params);

    // Data Query
    const dataQuery = `
    SELECT 
      st.*,
      u.full_name,
      u.email,
      u.phone,
      u.profile_image,
      u.status,
      u.school_id
    ${baseQuery}
    ORDER BY st.employee_id ASC
    LIMIT ? OFFSET ?
  `;

    const dataParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(dataQuery, dataParams);

    return {
      teachers: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Find teacher by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT st.*, u.full_name, u.email, u.phone, u.profile_image, u.status, u.school_id
       FROM staff_teachers st
       JOIN users u ON st.user_id = u.id
       WHERE st.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Find teacher by user ID
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT st.*, u.full_name, u.email, u.phone, u.profile_image, u.status, u.school_id
       FROM staff_teachers st
       JOIN users u ON st.user_id = u.id
       WHERE st.user_id = ?`,
      [userId],
    );
    return rows[0];
  }

  // Find teacher by employee ID
  static async findByEmployeeId(employeeId) {
    const [rows] = await pool.query(
      "SELECT * FROM staff_teachers WHERE employee_id = ?",
      [employeeId],
    );
    return rows[0];
  }

  // Update teacher
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && key !== "id" && key !== "school_id") {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);

    await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return true;
  }

  // Delete teacher (soft delete)
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE staff_teachers SET is_deleted = TRUE, status = ? WHERE id = ?",
      ["inactive", id],
    );
    return result.affectedRows > 0;
  }

  // Get classes assigned to teacher
  static async getAssignedClasses(teacherId) {
    const [rows] = await pool.query(
      `SELECT c.* FROM classes c 
       WHERE c.class_teacher_id = ? AND c.status = ? AND (c.is_deleted = FALSE OR c.is_deleted IS NULL)`,
      [teacherId, "active"],
    );
    return rows;
  }

  // Get timetable for teacher
  static async getTimetable(teacherId) {
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

  // Count teachers by school
  static async countBySchool(schoolId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM staff_teachers st
       JOIN users u ON st.user_id = u.id
       WHERE u.school_id = ? AND st.status = ? AND (st.is_deleted = FALSE OR st.is_deleted IS NULL)`,
      [schoolId, "active"],
    );
    return rows[0].count;
  }
}

module.exports = TeacherModel;
