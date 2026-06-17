const { pool } = require("../config/database");

class SchoolModel {
  // Create a new school
  static async create(data) {
    const {
      school_code,
      school_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      logo,
      subscription_plan,
      subscription_expiry,
      database_name,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO schools (
        school_code, school_name, email, phone, address, city, state, pincode, 
        country, logo, subscription_plan, subscription_expiry, database_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        school_code,
        school_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        country || "India",
        logo,
        subscription_plan || "standard",
        subscription_expiry,
        database_name,
      ],
    );
    return result.insertId;
  }

  // Find all schools with pagination
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM schools WHERE 1=1";
    const params = [];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      query +=
        " AND (school_name LIKE ? OR school_code LIKE ? OR email LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.query(
      query.replace("SELECT *", "SELECT COUNT(*) as total"),
      params,
    );

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      schools: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Find school by ID
  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM schools WHERE id = ?", [id]);
    return rows[0];
  }

  // Find school by code
  static async findByCode(school_code) {
    const [rows] = await pool.query(
      "SELECT * FROM schools WHERE school_code = ?",
      [school_code],
    );
    return rows[0];
  }

  // Find school by email
  static async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM schools WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  // Update school
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
      `UPDATE schools SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete school (soft delete by changing status)
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE schools SET status = ? WHERE id = ?",
      ["inactive", id],
    );
    return result.affectedRows > 0;
  }

  // Hard delete school
  static async hardDelete(id) {
    const [result] = await pool.query("DELETE FROM schools WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  // Get school statistics
  static async getStatistics(schoolId) {
    const [students] = await pool.query(
      "SELECT COUNT(*) as count FROM students s JOIN users u ON s.user_id = u.id WHERE u.school_id = ? AND u.status = ?",
      [schoolId, "active"],
    );

    const [teachers] = await pool.query(
      "SELECT COUNT(*) as count FROM staff_teachers st JOIN users u ON st.user_id = u.id WHERE u.school_id = ? AND st.status = ?",
      [schoolId, "active"],
    );

    const [classes] = await pool.query(
      "SELECT COUNT(*) as count FROM classes WHERE school_id = ? AND status = ?",
      [schoolId, "active"],
    );

    return {
      totalStudents: students[0].count,
      totalTeachers: teachers[0].count,
      totalClasses: classes[0].count,
    };
  }
}

module.exports = SchoolModel;
