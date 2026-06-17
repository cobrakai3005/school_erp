const { pool } = require("../config/database");

class TransportStudentModel {
  // Assign Student Route
  static async create(data) {
    const {
      student_id,
      route_id,
      pickup_point,
      drop_point,
      pickup_time,
      drop_time,
      status,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO transport_students (
        student_id,
        route_id,
        pickup_point,
        drop_point,
        pickup_time,
        drop_time,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        route_id,
        pickup_point,
        drop_point,
        pickup_time,
        drop_time,
        status || "active",
      ],
    );

    return result.insertId;
  }

  // Get All Student Routes
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT ts.*,
             s.admission_no,
             u.full_name as student_name,
             tr.route_name,
             tr.route_code,
             tr.vehicle_no
      FROM transport_students ts
      JOIN students s ON ts.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN transport_routes tr ON ts.route_id = tr.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.status) {
      query += " AND ts.status = ?";
      params.push(filters.status);
    }

    if (filters.route_id) {
      query += " AND ts.route_id = ?";
      params.push(filters.route_id);
    }

    if (filters.search) {
      query += `
        AND (
          u.full_name LIKE ?
          OR s.admission_no LIKE ?
          OR tr.route_name LIKE ?
        )
      `;

      const searchTerm = `%${filters.search}%`;

      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Count Query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM transport_students ts
      JOIN students s ON ts.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN transport_routes tr ON ts.route_id = tr.id
      WHERE 1=1
    `;

    const countParams = [];

    if (filters.status) {
      countQuery += " AND ts.status = ?";
      countParams.push(filters.status);
    }

    if (filters.route_id) {
      countQuery += " AND ts.route_id = ?";
      countParams.push(filters.route_id);
    }

    if (filters.search) {
      countQuery += `
        AND (
          u.full_name LIKE ?
          OR s.admission_no LIKE ?
          OR tr.route_name LIKE ?
        )
      `;

      const searchTerm = `%${filters.search}%`;

      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    query += " ORDER BY ts.id DESC LIMIT ? OFFSET ?";

    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      studentRoutes: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Find By ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT ts.*,
              s.admission_no,
              u.full_name as student_name,
              tr.route_name,
              tr.route_code,
              tr.vehicle_no
       FROM transport_students ts
       JOIN students s ON ts.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN transport_routes tr ON ts.route_id = tr.id
       WHERE ts.id = ?`,
      [id],
    );

    return rows[0];
  }

  // Find By Student ID
  static async findByStudentId(studentId) {
    const [rows] = await pool.query(
      `SELECT ts.*,
              tr.route_name,
              tr.route_code,
              tr.vehicle_no
       FROM transport_students ts
       JOIN transport_routes tr ON ts.route_id = tr.id
       WHERE ts.student_id = ?`,
      [studentId],
    );

    return rows;
  }

  // Update
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
      `UPDATE transport_students
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values,
    );

    return true;
  }

  // Delete
  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM transport_students
       WHERE id = ?`,
      [id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = TransportStudentModel;
