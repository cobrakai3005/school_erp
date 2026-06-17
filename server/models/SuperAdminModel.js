const { pool } = require('../config/database');

class SuperAdminModel {
  // Find super admin by email
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM super_admin_users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Find super admin by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, status, last_login, created_at FROM super_admin_users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create super admin
  static async create(data) {
    const { username, email, password, full_name, role } = data;
    const [result] = await pool.query(
      `INSERT INTO super_admin_users (username, email, password, full_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password, full_name, role || 'super_admin']
    );
    return result.insertId;
  }

  // Update last login
  static async updateLastLogin(id) {
    await pool.query(
      'UPDATE super_admin_users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  }

  // Get all super admins
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, status, last_login, created_at FROM super_admin_users'
    );
    return rows;
  }

  // Update super admin
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE super_admin_users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  // Delete super admin
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM super_admin_users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = SuperAdminModel;
