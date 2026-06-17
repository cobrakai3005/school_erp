const { pool } = require("../config/database");

class AccountantModel {
  static async create(data, connection = pool) {
    const { employee_id, user_id, designation, type, joining_date, salary } =
      data;
    const [result] = await connection.query(
      `
      INSERT INTO staff_accountants (
        employee_id,
        user_id,
        designation,
        type,
        joining_date,
        salary
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        employee_id,
        user_id,
        designation,
        type || "accountant_both",
        joining_date,
        salary,
      ],
    );

    return result.insertId;
  }

  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        sa.*,
        u.full_name,
        u.email,
        u.phone,
        u.profile_image,
        u.school_id
      FROM staff_accountants sa
      JOIN users u ON sa.user_id = u.id
      WHERE u.school_id = ?
    `;

    const params = [schoolId];

    if (filters.status) {
      query += " AND sa.status = ?";
      params.push(filters.status);
    }

    if (filters.type) {
      query += " AND sa.type = ?";
      params.push(filters.type);
    }

    if (filters.search) {
      query += `
        AND (
          u.full_name LIKE ?
          OR sa.employee_id LIKE ?
        )
      `;

      const search = `%${filters.search}%`;

      params.push(search, search);
    }

    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      "SELECT COUNT(*) as total FROM",
    );

    const [countResult] = await pool.query(countQuery, params);

    query += `
      ORDER BY sa.id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      accountants: rows,
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
        sa.*,
        u.full_name,
        u.email,
        u.phone,
        u.profile_image,
        u.school_id
      FROM staff_accountants sa
      JOIN users u ON sa.user_id = u.id
      WHERE sa.id = ?
      `,
      [id],
    );

    return rows[0];
  }

  static async findByEmployeeIdAndSchool(employeeId, schoolId) {
    const [rows] = await pool.query(
      `
      SELECT sa.*
      FROM staff_accountants sa
      JOIN users u ON sa.user_id = u.id
      WHERE sa.employee_id = ?
      AND u.school_id = ?
      `,
      [employeeId, schoolId],
    );

    return rows[0];
  }

  static async update(id, data, connection = pool) {
    const allowedFields = [
      "designation",
      "type",
      "joining_date",
      "salary",
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
      UPDATE staff_accountants
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
      UPDATE staff_accountants
      SET status = 'inactive'
      WHERE id = ?
      `,
      [id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = AccountantModel;
