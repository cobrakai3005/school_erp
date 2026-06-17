const { pool } = require("../config/database");

class ClassModel {
  // Create a new class
  static async create(data) {
    const {
      school_id,
      class_name,
      section,
      class_code,
      academic_year,
      class_teacher_id,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO classes (
        school_id, class_name, section, class_code, academic_year, class_teacher_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        school_id,
        class_name,
        section,
        class_code,
        academic_year,
        class_teacher_id,
      ],
    );
    return result.insertId;
  }

  // Find all classes by school
  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM classes c
    LEFT JOIN staff_teachers st ON c.class_teacher_id = st.id
    LEFT JOIN users u ON st.user_id = u.id
    WHERE c.school_id = ?
      AND (c.is_deleted = FALSE OR c.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.status) {
      baseQuery += ` AND c.status = ?`;
      params.push(filters.status);
    }

    if (filters.academic_year) {
      baseQuery += ` AND c.academic_year = ?`;
      params.push(filters.academic_year);
    }

    if (filters.search) {
      baseQuery += ` AND (
      c.class_name LIKE ?
      OR c.class_code LIKE ?
    )`;

      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Total Count Query
    const countQuery = `
    SELECT COUNT(*) AS total
    ${baseQuery}
  `;

    const [countResult] = await pool.query(countQuery, params);

    // Data Query
    const dataQuery = `
    SELECT 
      c.*,
      u.full_name AS class_teacher_name
    ${baseQuery}
    ORDER BY c.class_name ASC
    LIMIT ? OFFSET ?
  `;

    const dataParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(dataQuery, dataParams);

    return {
      classes: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Find class by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, u.full_name as class_teacher_name 
       FROM classes c 
       LEFT JOIN staff_teachers st ON c.class_teacher_id = st.id
       LEFT JOIN users u ON st.user_id = u.id
       WHERE c.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Find class by code within school
  static async findByCode(schoolId, classCode) {
    const [rows] = await pool.query(
      "SELECT * FROM classes WHERE school_id = ? AND class_code = ?",
      [schoolId, classCode],
    );
    return rows[0];
  }

  // Update class
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
      `UPDATE classes SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete class (soft delete)
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE classes SET is_deleted = TRUE WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  // Get students in class
  static async getStudents(classId) {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name, u.email, u.phone, u.profile_image
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.class_id = ? AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)
       ORDER BY s.roll_no`,
      [classId],
    );
    return rows;
  }

  // Get class count for a school
  static async countBySchool(schoolId) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM classes WHERE school_id = ? AND status = ? AND (is_deleted = FALSE OR is_deleted IS NULL)",
      [schoolId, "active"],
    );
    return rows[0].count;
  }
}

module.exports = ClassModel;
