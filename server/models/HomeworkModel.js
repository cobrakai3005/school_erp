const { pool } = require("../config/database");

class HomeworkModel {
  static async create(data, connection = pool) {
    const {
      class_id,
      subject,
      title,
      description,
      given_date,
      submission_date,
      teacher_id,
      attachment,
    } = data;

    const [result] = await connection.query(
      `
      INSERT INTO homework_assignments (
        class_id,
        subject,
        title,
        description,
        given_date,
        submission_date,
        teacher_id,
        attachment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        class_id,
        subject,
        title,
        description,
        given_date,
        submission_date,
        teacher_id,
        attachment,
      ],
    );

    return result.insertId;
  }

  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
          SELECT
            h.*,
            c.class_name,
            c.section,
            c.school_id,
            u.full_name AS teacher_name
          FROM homework_assignments h
          JOIN classes c ON h.class_id = c.id
          LEFT JOIN staff_teachers st ON h.teacher_id = st.id
          LEFT JOIN users u ON st.user_id = u.id
          WHERE c.school_id = ?
          AND h.is_deleted = 0
    `;

    const params = [schoolId];

    // Filters
    if (filters.class_id) {
      query += ` AND h.class_id = ?`;
      params.push(filters.class_id);
    }

    if (filters.subject) {
      query += ` AND h.subject = ?`;
      params.push(filters.subject);
    }

    if (filters.teacher_id) {
      query += ` AND h.teacher_id = ?`;
      params.push(filters.teacher_id);
    }

    if (filters.search) {
      query += `
        AND (
          h.title LIKE ?
          OR h.subject LIKE ?
        )
      `;

      const search = `%${filters.search}%`;

      params.push(search, search);
    }

    // Count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      "SELECT COUNT(*) as total FROM",
    );

    const [countResult] = await pool.query(countQuery, params);

    // Pagination
    query += `
      ORDER BY h.id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      homework: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT
        h.*,
        c.school_id,
        u.full_name AS teacher_name
      FROM homework_assignments h
      JOIN classes c ON h.class_id = c.id
      LEFT JOIN staff_teachers st ON h.teacher_id = st.id
      LEFT JOIN users u ON st.user_id = u.id
      WHERE h.id = ?
      `,
      [id],
    );

    return rows[0];
  }

  static async update(id, data, connection = pool) {
    const allowedFields = [
      "subject",
      "title",
      "description",
      "given_date",
      "submission_date",
      "teacher_id",
      "attachment",
    ];

    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    await connection.query(
      `
      UPDATE homework_assignments
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values,
    );

    return true;
  }

  static async delete(id, connection = pool) {
    const [result] = await connection.query(
      `
      UPDATE homework_assignments
      SET is_deleted = 1
      WHERE id = ?
      `,
      [id],
    );

    return result.affectedRows > 0;
  }

  static async validateClass(classId, schoolId) {
    const [rows] = await pool.query(
      `
      SELECT id
      FROM classes
      WHERE id = ?
      AND school_id = ?
      `,
      [classId, schoolId],
    );

    return rows[0];
  }

  static async findByClassId(classId) {
    const [rows] = await pool.query(
      `
      SELECT
        h.*,
        c.class_name,
        c.section,
        u.full_name AS teacher_name
      FROM homework_assignments h
      JOIN classes c ON h.class_id = c.id
      LEFT JOIN staff_teachers st ON h.teacher_id = st.id
      LEFT JOIN users u ON st.user_id = u.id
      WHERE h.class_id = ?
      AND h.is_deleted = 0
      ORDER BY h.id DESC
      `,
      [classId],
    );

    return rows;
  }

  static async findByTeacherId(teacherId) {
    const [rows] = await pool.query(
      `
      SELECT
        h.*,
        c.class_name,
        c.section,
        u.full_name AS teacher_name
      FROM homework_assignments h
      JOIN classes c ON h.class_id = c.id
      LEFT JOIN staff_teachers st ON h.teacher_id = st.id
      LEFT JOIN users u ON st.user_id = u.id
      WHERE h.teacher_id = ?
      AND h.is_deleted = 0
      ORDER BY h.id DESC
      `,
      [teacherId],
    );
    return rows;
  }
}

module.exports = HomeworkModel;
