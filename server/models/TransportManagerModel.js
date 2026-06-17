const { pool } = require("../config/database");

class TransportManagerModel {
  // Create transport manager
  static async create(data) {
    const {
      employee_id,
      user_id,
      designation,
      department,
      qualification,
      experience_years,
      emergency_contact,
      joining_date,
      status,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO transport_managers (
        employee_id,
        user_id,
        designation,
        department,
        qualification,
        experience_years,
        emergency_contact,
        joining_date,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        user_id,
        designation,
        department,
        qualification,
        experience_years,
        emergency_contact,
        joining_date,
        status || "active",
      ],
    );

    return result.insertId;
  }

  // Find all transport managers by school
  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
    SELECT tm.*, 
           u.full_name, 
           u.email, 
           u.phone, 
           u.address,
           u.profile_image,
           u.status as user_status,
           u.school_id
    FROM transport_managers tm
    JOIN users u ON tm.user_id = u.id
    WHERE u.school_id = ?
    AND (tm.is_deleted = FALSE OR tm.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.department) {
      query += " AND tm.department = ?";
      params.push(filters.department);
    }

    if (filters.status) {
      query += " AND tm.status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      query += `
      AND (
        u.full_name LIKE ?
        OR tm.employee_id LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count Query
    let countQuery = `
    SELECT COUNT(*) as total
    FROM transport_managers tm
    JOIN users u ON tm.user_id = u.id
    WHERE u.school_id = ?
    AND (tm.is_deleted = FALSE OR tm.is_deleted IS NULL)
  `;

    const countParams = [schoolId];

    if (filters.department) {
      countQuery += " AND tm.department = ?";
      countParams.push(filters.department);
    }

    if (filters.status) {
      countQuery += " AND tm.status = ?";
      countParams.push(filters.status);
    }

    if (filters.search) {
      countQuery += `
      AND (
        u.full_name LIKE ?
        OR tm.employee_id LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    // Main Query Pagination
    query += " ORDER BY tm.employee_id ASC LIMIT ? OFFSET ?";

    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      transportManagers: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  } 

  // Find by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT tm.*, 
              u.full_name,
              u.email,
              u.phone,
              u.address,
              u.profile_image,
              u.status as user_status,
              u.school_id
       FROM transport_managers tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.id = ?`,
      [id],
    );

    return rows[0];
  }

  // Find by User ID
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT tm.*, 
              u.full_name,
              u.email,
              u.phone,
              u.address,
              u.profile_image,
              u.status as user_status,
              u.school_id
       FROM transport_managers tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.user_id = ?`,
      [userId],
    );

    return rows[0];
  }

  // Find by Employee ID
  static async findByEmployeeId(employeeId) {
    const [rows] = await pool.query(
      "SELECT * FROM transport_managers WHERE employee_id = ?",
      [employeeId],
    );

    return rows[0];
  }

  // Update transport manager
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && key !== "id" && key !== "user_id") {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);

    await pool.query(
      `UPDATE transport_managers 
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values,
    );

    return true;
  }

  // Soft delete
  static async delete(id) {
    const [result] = await pool.query(
      `UPDATE transport_managers
       SET is_deleted = TRUE,
           status = ?
       WHERE id = ?`,
      ["inactive", id],
    );

    return result.affectedRows > 0;
  }

  // Count by school
  static async countBySchool(schoolId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count
       FROM transport_managers tm
       JOIN users u ON tm.user_id = u.id
       WHERE u.school_id = ?
       AND tm.status = ?
       AND (tm.is_deleted = FALSE OR tm.is_deleted IS NULL)`,
      [schoolId, "active"],
    );

    return rows[0].count;
  }
}

module.exports = TransportManagerModel;
