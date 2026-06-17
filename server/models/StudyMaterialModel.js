const { pool } = require("../config/database");

class StudyMaterialModel {
  // Create
  static async create(data, connection = pool) {
    const {
      class_id,
      subject,
      title,
      description,
      file_path,
      file_type,
      uploaded_by,
    } = data;

    const [result] = await connection.query(
      `
      INSERT INTO study_materials (
        class_id,
        subject,
        title,
        description,
        file_path,
        file_type,
        uploaded_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        class_id,
        subject,
        title,
        description,
        file_path,
        file_type || "pdf",
        uploaded_by,
      ],
    );

    return result.insertId;
  }

  // Get all (with pagination + filters)
  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        sm.*,
        c.class_name,
        u.full_name AS uploaded_by_name
      FROM study_materials sm
      LEFT JOIN classes c ON sm.class_id = c.id
      LEFT JOIN users u ON sm.uploaded_by = u.id
      WHERE c.school_id = ?
    `;

    const params = [schoolId];

    if (filters.class_id) {
      query += " AND sm.class_id = ?";
      params.push(filters.class_id);
    }

    if (filters.subject) {
      query += " AND sm.subject = ?";
      params.push(filters.subject);
    }

    if (filters.status) {
      query += " AND sm.status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      const search = `%${filters.search}%`;
      query += `
        AND (
          sm.title LIKE ?
          OR sm.subject LIKE ?
          OR sm.description LIKE ?
        )
      `;
      params.push(search, search, search);
    }

    // Count query
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      "SELECT COUNT(*) as total FROM",
    );

    const [countResult] = await pool.query(countQuery, params);

    // pagination
    query += ` ORDER BY sm.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      materials: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        sm.*,
        c.class_name,
        u.full_name AS uploaded_by_name
      FROM study_materials sm
      LEFT JOIN classes c ON sm.class_id = c.id
      LEFT JOIN users u ON sm.uploaded_by = u.id
      WHERE sm.id = ?
      `,
      [id],
    );

    return rows[0];
  }

  // Update
  static async update(id, data, connection = pool) {
    const allowedFields = [
      "class_id",
      "subject",
      "title",
      "description",
      "file_path",
      "file_type",
      "status",
    ];

    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key) && data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);

    await connection.query(
      `
      UPDATE study_materials
      SET ${fields.join(", ")}
      WHERE id = ?
      `,
      values,
    );

    return true;
  }

  // Soft delete
  static async delete(id, connection = pool) {
    const [result] = await connection.query(
      `
      UPDATE study_materials
      SET status = 'inactive'
      WHERE id = ?
      `,
      [id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = StudyMaterialModel;
