const { pool } = require("../config/database");

class HomeworkSubmissionModel {
  static async create(data, connection = pool) {
    const {
      homework_id,
      student_id,
      submission_date,
      attachment,
      remarks,
      marks,
      feedback,
    } = data;

    const [result] = await connection.query(
      `
      INSERT INTO homework_submissions (
        homework_id,
        student_id,
        submission_date,
        attachment,
        remarks,
        marks,
        feedback
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        homework_id,
        student_id,
        submission_date,
        attachment,
        remarks,
        marks || null,
        feedback || null,
      ],
    );

    return result.insertId;
  }

  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        hs.*,
        ha.title AS homework_title,
        ha.subject,
        s.roll_no,
        u.full_name AS student_name,
        c.class_name,
        c.section,
        c.school_id
      FROM homework_submissions hs
      JOIN homework_assignments ha ON hs.homework_id = ha.id
      JOIN students s ON hs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ?
    `;

    const params = [schoolId];

    // Teacher-specific filter: only their assignments
    if (filters.teacherHomeworkIds && filters.teacherHomeworkIds.length > 0) {
      const placeholders = filters.teacherHomeworkIds.map(() => "?").join(",");
      query += ` AND hs.homework_id IN (${placeholders})`;
      params.push(...filters.teacherHomeworkIds);
    }

    // Filters
    if (filters.class_id) {
      query += ` AND c.id = ?`;
      params.push(filters.class_id);
    }

    if (filters.student_id) {
      query += ` AND hs.student_id = ?`;
      params.push(filters.student_id);
    }

    if (filters.homework_id) {
      query += ` AND hs.homework_id = ?`;
      params.push(filters.homework_id);
    }

    if (filters.search) {
      query += `
        AND (
          u.full_name LIKE ?
          OR ha.title LIKE ?
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
      ORDER BY hs.id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      submissions: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  static async alreadySubmitted(homeworkId, studentId) {
    const [rows] = await pool.query(
      `
      SELECT id
      FROM homework_submissions
      WHERE homework_id = ?
      AND student_id = ?
      `,
      [homeworkId, studentId],
    );

    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT
        hs.*,
        ha.title AS homework_title,
        ha.subject,
        c.school_id,
        s.roll_no,
        u.full_name AS student_name
      FROM homework_submissions hs
      JOIN homework_assignments ha ON hs.homework_id = ha.id
      JOIN students s ON hs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN classes c ON s.class_id = c.id
      WHERE hs.id = ?
      `,
      [id],
    );

    return rows[0];
  }

  static async update(id, data, connection = pool) {
    const allowedFields = [
      "submission_date",
      "attachment",
      "remarks",
      "marks",
      "feedback",
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
      UPDATE homework_submissions
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
      DELETE FROM homework_submissions
      WHERE id = ?
      `,
      [id],
    );

    return result.affectedRows > 0;
  }

  static async findByStudentId(studentId) {
    const [rows] = await pool.query(
      `
      SELECT
        hs.*,
        ha.title AS homework_title,
        ha.subject
      FROM homework_submissions hs
      JOIN homework_assignments ha ON hs.homework_id = ha.id
      WHERE hs.student_id = ?
      ORDER BY hs.id DESC
      `,
      [studentId],
    );

    return rows;
  }

  static async findByHomeworkId(homeworkId) {
    const [rows] = await pool.query(
      `
      SELECT
        hs.*,
        s.roll_no,
        u.full_name AS student_name
      FROM homework_submissions hs
      JOIN students s ON hs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE hs.homework_id = ?
      ORDER BY hs.id DESC
      `,
      [homeworkId],
    );

    return rows;
  }
}

module.exports = HomeworkSubmissionModel;
