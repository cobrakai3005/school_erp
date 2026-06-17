const { pool } = require("../config/database");

class UserModel {
  // Create a new user
  static async create(data) {
    const {
      school_id,
      user_type,
      username,
      email,
      password,
      full_name,
      phone,
      address,
      profile_image,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO users (
        school_id, user_type, username, email, password, full_name, phone, address, profile_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        school_id,
        user_type,
        username,
        email,
        password,
        full_name,
        phone,
        address,
        profile_image,
      ],
    );
    return result.insertId;
  }

  // Find user by email within a school
  static async findByEmail(email, schoolId = null) {
    let query = "SELECT * FROM users WHERE email = ?";
    const params = [email];

    if (schoolId) {
      query += " AND school_id = ?";
      params.push(schoolId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
  }

  // Find user by username within a school
  static async findByUsername(username, schoolId = null) {
    let query = "SELECT * FROM users WHERE username = ?";
    const params = [username];

    if (schoolId) {
      query += " AND school_id = ?";
      params.push(schoolId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT id, school_id, user_type, username, email, full_name, phone, address, 
              profile_image, status, last_login, created_at, updated_at 
       FROM users WHERE id = ?`,
      [id],
    );
    return rows[0];
  }

  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let whereConditions = ["school_id = ?"];
    let params = [schoolId];

    if (filters.user_type) {
      whereConditions.push("user_type = ?");
      params.push(filters.user_type);
    }

    if (filters.status) {
      whereConditions.push("status = ?");
      params.push(filters.status);
    }

    if (filters.search) {
      whereConditions.push(`
      (
        full_name LIKE ?
        OR username LIKE ?
        OR email LIKE ?
      )
    `);

      const searchTerm = `%${filters.search}%`;

      params.push(searchTerm, searchTerm, searchTerm);
    }

    // IMPORTANT
    const whereClause = whereConditions.join(" AND ");

    const query = `
    SELECT
      id,
      school_id,
      user_type,
      username,
      email,
      full_name,
      phone,
      profile_image,
      status,
      last_login,
      created_at
    FROM users
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

    const countQuery = `
    SELECT COUNT(*) AS total
    FROM users
    WHERE ${whereClause}
  `;

    const [countRows] = await pool.query(countQuery, params);

    const [rows] = await pool.query(query, [
      ...params,
      Number(limit),
      Number(offset),
    ]);

    const total = countRows[0]?.total || 0;

    return {
      users: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Update user
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

  // Update last login
  static async updateLastLogin(id) {
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);
  }

  // Delete user (soft delete)
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE users SET status = ? WHERE id = ?",
      ["inactive", id],
    );
    return result.affectedRows > 0;
  }

  // Hard delete user
  static async hardDelete(id) {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  // Get users by type for a school
  static async findByType(schoolId, userType) {
    const [rows] = await pool.query(
      `SELECT id, username, email, full_name, phone, status 
       FROM users WHERE school_id = ? AND user_type = ? AND status = ?`,
      [schoolId, userType, "active"],
    );
    return rows;
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let query = "SELECT id FROM users WHERE email = ?";
    const params = [email];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }

  // Check if username exists in school
  static async usernameExistsInSchool(username, schoolId, excludeId = null) {
    let query = "SELECT id FROM users WHERE username = ? AND school_id = ?";
    const params = [username, schoolId];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }
}

module.exports = UserModel;
