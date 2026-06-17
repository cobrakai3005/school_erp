const { pool } = require("../config/database");

class TransportRouteModel {
  // Create Route
  static async create(data) {
    const {
      route_name,
      route_code,
      vehicle_no,
      driver_name,
      driver_phone,
      conductor_name,
      pickup_points,
      fare_amount,
      status,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO transport_routes (
        route_name,
        route_code,
        vehicle_no,
        driver_name,
        driver_phone,
        conductor_name,
        pickup_points,
        fare_amount,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        route_name,
        route_code,
        vehicle_no,
        driver_name,
        driver_phone,
        conductor_name,
        pickup_points,
        fare_amount,
        status || "active",
      ],
    );

    return result.insertId;
  }

  // Get All Routes
  static async findAll(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
      SELECT *
      FROM transport_routes
      WHERE 1=1
    `;

    const params = [];

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      query += `
        AND (
          route_name LIKE ?
          OR route_code LIKE ?
          OR vehicle_no LIKE ?
        )
      `;

      const searchTerm = `%${filters.search}%`;

      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Count Query
    let countQuery = `
      SELECT COUNT(*) as total
      FROM transport_routes
      WHERE 1=1
    `;

    const countParams = [];

    if (filters.status) {
      countQuery += " AND status = ?";
      countParams.push(filters.status);
    }

    if (filters.search) {
      countQuery += `
        AND (
          route_name LIKE ?
          OR route_code LIKE ?
          OR vehicle_no LIKE ?
        )
      `;

      const searchTerm = `%${filters.search}%`;

      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.query(countQuery, countParams);

    query += " ORDER BY id DESC LIMIT ? OFFSET ?";

    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      routes: rows,
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
      `SELECT *
       FROM transport_routes
       WHERE id = ?`,
      [id],
    );

    return rows[0];
  }

  // Find By Route Code
  static async findByRouteCode(routeCode) {
    const [rows] = await pool.query(
      `SELECT *
       FROM transport_routes
       WHERE route_code = ?`,
      [routeCode],
    );

    return rows[0];
  }

  // Update Route
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
      `UPDATE transport_routes
       SET ${fields.join(", ")}
       WHERE id = ?`,
      values,
    );

    return true;
  }

  // Delete Route
  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM transport_routes
       WHERE id = ?`,
      [id],
    );

    return result.affectedRows > 0;
  }
}

module.exports = TransportRouteModel;
