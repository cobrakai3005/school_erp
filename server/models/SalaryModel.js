const { pool } = require("../config/database");

class SalaryModel {
  // Create salary record
  static async create(data) {
    const {
      staff_id,
      staff_type,
      month,
      year,
      basic_salary,
      allowances,
      deductions,
      net_salary,
      advance_deduction,
      bonus,
      bank_name,
      account_number,
      remarks,
      generated_by,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO salary_records (
        staff_id, staff_type, month, year, basic_salary, allowances, deductions,
        net_salary, advance_deduction, bonus, bank_name, account_number, remarks, generated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        staff_id,
        staff_type,
        month,
        year,
        basic_salary,
        allowances || 0,
        deductions || 0,
        net_salary,
        advance_deduction || 0,
        bonus || 0,
        bank_name,
        account_number,
        remarks,
        generated_by,
      ],
    );
    return result.insertId;
  }

  // Get salary records by school


  static async getBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM salary_records sr
    JOIN users u ON sr.staff_id = u.id
    WHERE u.school_id = ?
  `;

    const params = [schoolId];

    if (filters.month) {
      baseQuery += " AND sr.month = ?";
      params.push(filters.month);
    }

    if (filters.year) {
      baseQuery += " AND sr.year = ?";
      params.push(filters.year);
    }

    if (filters.staff_type) {
      baseQuery += " AND sr.staff_type = ?";
      params.push(filters.staff_type);
    }

    if (filters.status) {
      baseQuery += " AND sr.status = ?";
      params.push(filters.status);
    }

    if (filters.staff_id) {
      baseQuery += " AND sr.staff_id = ?";
      params.push(filters.staff_id);
    }

    // Count Query
    const countQuery = `
    SELECT COUNT(*) as total
    ${baseQuery}
  `;

    const [countResult] = await pool.query(countQuery, params);

    // Data Query
    const dataQuery = `
    SELECT 
      sr.*, 
      u.full_name, 
      u.email
    ${baseQuery}
    ORDER BY sr.year DESC, sr.month DESC, u.full_name ASC
    LIMIT ? OFFSET ?
  `;

    const [rows] = await pool.query(dataQuery, [
      ...params,
      Number(limit),
      Number(offset),
    ]);

    return {
      salaries: rows,
      pagination: {
        total: countResult[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((countResult[0]?.total || 0) / limit),
      },
    };
  }

  // Get salary record by ID
  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT sr.*, u.full_name, u.email, u.school_id
       FROM salary_records sr
       JOIN users u ON sr.staff_id = u.id
       WHERE sr.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Get salary records by staff
  static async getByStaff(staffId, year = null) {
    let query = "SELECT * FROM salary_records WHERE staff_id = ?";
    const params = [staffId];

    if (year) {
      query += " AND year = ?";
      params.push(year);
    }

    query += " ORDER BY year DESC, month DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Update salary record
  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && key !== "id" && key !== "staff_id") {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.query(
      `UPDATE salary_records SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Mark salary as paid
  static async markAsPaid(id, paymentDate) {
    await pool.query(
      "UPDATE salary_records SET status = ?, payment_date = ? WHERE id = ?",
      ["paid", paymentDate, id],
    );
    return true;
  }

  // Delete salary record
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE salary_records SET status = ? WHERE id = ?",
      ["cancelled", id],
    );
    return result.affectedRows > 0;
  }

  // Check if salary already exists for staff for a month/year
  static async exists(staffId, month, year) {
    const [rows] = await pool.query(
      "SELECT id FROM salary_records WHERE staff_id = ? AND month = ? AND year = ? AND status != ?",
      [staffId, month, year, "cancelled"],
    );
    return rows.length > 0;
  }

  // Generate bulk salaries for all staff
  static async generateBulkSalaries(schoolId, month, year, generatedBy) {
    // Get all active staff
    const [staff] = await pool.query(
      `SELECT u.id, u.user_type, 
              COALESCE(st.id, sa.id) as staff_record_id,
              CASE WHEN st.id IS NOT NULL THEN 'teacher' ELSE 'accountant' END as staff_type
       FROM users u
       LEFT JOIN staff_teachers st ON u.id = st.user_id AND st.status = 'active'
       LEFT JOIN staff_accountants sa ON u.id = sa.user_id AND sa.status = 'active'
       WHERE u.school_id = ? AND u.status = 'active' 
         AND u.user_type IN ('teacher', 'accountant_fee', 'accountant_salary')`,
      [schoolId],
    );

    const results = { created: 0, skipped: 0 };

    for (const s of staff) {
      // Check if salary already exists
      const exists = await this.exists(s.id, month, year);
      if (exists) {
        results.skipped++;
        continue;
      }

      // For now, create with 0 values - can be updated later
      await this.create({
        staff_id: s.id,
        staff_type: s.staff_type,
        month,
        year,
        basic_salary: 0,
        net_salary: 0,
        generated_by: generatedBy,
      });
      results.created++;
    }

    return results;
  }

  // Get salary summary for school
  static async getSalarySummary(schoolId, year) {
    const [rows] = await pool.query(
      `SELECT 
        sr.month,
        SUM(sr.net_salary) as total_salary,
        SUM(CASE WHEN sr.status = 'paid' THEN sr.net_salary ELSE 0 END) as paid_amount,
        SUM(CASE WHEN sr.status = 'pending' THEN sr.net_salary ELSE 0 END) as pending_amount,
        COUNT(sr.id) as total_records
       FROM salary_records sr
       JOIN users u ON sr.staff_id = u.id
       WHERE u.school_id = ? AND sr.year = ?
       GROUP BY sr.month
       ORDER BY sr.month`,
      [schoolId, year],
    );
    return rows;
  }
}

module.exports = SalaryModel;
