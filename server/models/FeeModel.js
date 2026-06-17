const { pool } = require("../config/database");

class FeeModel {
  // ===================== FEE STRUCTURES =====================

  // Create fee structure
  static async createStructure(data) {
    const {
      school_id,
      class_id,
      fee_type,
      amount,
      frequency,
      due_day,
      academic_year,
      description,
      late_fee,
      status,
    } = data;

    // Check duplicate fee structure
    const [existing] = await pool.query(
      `
      SELECT id
      FROM fee_structures
      WHERE class_id = ?
        AND fee_type = ?
        AND academic_year = ?
        AND (is_deleted = FALSE OR is_deleted IS NULL)
      LIMIT 1
    `,
      [class_id, fee_type, academic_year],
    );

    if (existing.length > 0) {
      throw new Error(
        "Fee structure already exists for this class, fee type, and academic year",
      );
    }

    const [result] = await pool.query(
      `
      INSERT INTO fee_structures (
        school_id,
        class_id,
        fee_type,
        amount,
        frequency,
        due_day,
        academic_year,
        description,
        late_fee,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        school_id,
        class_id,
        fee_type,
        amount,
        frequency || "monthly",
        due_day || 10,
        academic_year,
        description || null,
        late_fee || 0,
        status || "active",
      ],
    );

    return result.insertId;
  }

  // Get fee structures by school
  static async getStructuresBySchool(
    schoolId,
    page = 1,
    limit = 10,
    filters = {},
  ) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM fee_structures fs
    JOIN classes c ON fs.class_id = c.id
    WHERE c.school_id = ?
      AND (fs.is_deleted = FALSE OR fs.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.class_id) {
      baseQuery += ` AND fs.class_id = ?`;
      params.push(filters.class_id);
    }

    if (filters.status) {
      baseQuery += ` AND fs.status = ?`;
      params.push(filters.status);
    }

    if (filters.academic_year) {
      baseQuery += ` AND fs.academic_year = ?`;
      params.push(filters.academic_year);
    }

    if (filters.frequency) {
      baseQuery += ` AND fs.frequency = ?`;
      params.push(filters.frequency);
    }

    if (filters.fee_type) {
      baseQuery += ` AND fs.fee_type = ?`;
      params.push(filters.fee_type);
    }

    if (filters.search) {
      baseQuery += `
      AND (
        c.class_name LIKE ?
        OR c.section LIKE ?
        OR fs.fee_type LIKE ?
        OR fs.academic_year LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;

      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Count Query
    const countQuery = `
    SELECT COUNT(*) AS total
    ${baseQuery}
  `;

    const [countResult] = await pool.query(countQuery, params);

    // Data Query
    const dataQuery = `
    SELECT 
      fs.*,
      c.class_name,
      c.section
    ${baseQuery}
    ORDER BY c.class_name ASC, fs.fee_type ASC
    LIMIT ? OFFSET ?
  `;

    const dataParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(dataQuery, dataParams);

    return {
      feeStructures: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get fee structure by ID
  static async getStructureById(id) {
    const [rows] = await pool.query(
      `SELECT fs.*, c.class_name, c.section, c.school_id
       FROM fee_structures fs
       JOIN classes c ON fs.class_id = c.id
       WHERE fs.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Update fee structure
  static async updateStructure(id, data) {
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
      `UPDATE fee_structures SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete fee structure
  static async deleteStructure(id) {
    const [result] = await pool.query(
      "UPDATE fee_structures SET status = ? WHERE id = ?",
      ["inactive", id],
    );
    return result.affectedRows > 0;
  }

  // ===================== FEE PAYMENTS =====================

  // Create fee payment
  static async createPayment(data) {
    const {
      student_id,
      receipt_no,
      amount,
      payment_date,
      payment_mode,
      transaction_id,
      cheque_no,
      bank_name,
      notes,
      collected_by,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO fee_payments (
        student_id, receipt_no, amount, payment_date, payment_mode,
        transaction_id, cheque_no, bank_name, notes, collected_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        receipt_no,
        amount,
        payment_date,
        payment_mode,
        transaction_id,
        cheque_no,
        bank_name,
        notes,
        collected_by,
      ],
    );
    return result.insertId;
  }

  // Get payments by school
  static async getPaymentsBySchool(
    schoolId,
    page = 1,
    limit = 10,
    filters = {},
  ) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM fee_payments fp
    JOIN students s ON fp.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN users cu ON fp.collected_by = cu.id
    WHERE u.school_id = ?
      AND (fp.is_deleted = FALSE OR fp.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.student_id) {
      baseQuery += ` AND fp.student_id = ?`;
      params.push(filters.student_id);
    }

    if (filters.class_id) {
      baseQuery += ` AND s.class_id = ?`;
      params.push(filters.class_id);
    }

    if (filters.payment_mode) {
      baseQuery += ` AND fp.payment_mode = ?`;
      params.push(filters.payment_mode);
    }

    if (filters.status) {
      baseQuery += ` AND fp.status = ?`;
      params.push(filters.status);
    }

    if (filters.from_date) {
      baseQuery += ` AND fp.payment_date >= ?`;
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      baseQuery += ` AND fp.payment_date <= ?`;
      params.push(filters.to_date);
    }

    if (filters.search) {
      baseQuery += `
      AND (
        u.full_name LIKE ?
        OR s.admission_no LIKE ?
        OR s.roll_no LIKE ?
        OR c.class_name LIKE ?
        OR fp.receipt_no LIKE ?
        OR fp.transaction_id LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;

      params.push(
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      );
    }

    // Count Query
    const countQuery = `
    SELECT COUNT(*) AS total
    ${baseQuery}
  `;

    const [countResult] = await pool.query(countQuery, params);

    // Data Query
    const dataQuery = `
    SELECT 
      fp.*,
      s.admission_no,
      s.roll_no,
      u.full_name AS student_name,
      c.class_name,
      c.section,
      cu.full_name AS collected_by_name
    ${baseQuery}
    ORDER BY fp.payment_date DESC, fp.id DESC
    LIMIT ? OFFSET ?
  `;

    const dataParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(dataQuery, dataParams);

    return {
      payments: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get payment by ID
  static async getPaymentById(id) {
    const [rows] = await pool.query(
      `SELECT fp.*, s.admission_no, u.full_name as student_name, u.school_id,
              c.class_name, c.section
       FROM fee_payments fp
       JOIN students s ON fp.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE fp.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Get payments by student
  static async getPaymentsByStudent(studentId) {
    const [rows] = await pool.query(
      `SELECT fp.* FROM fee_payments fp
       WHERE fp.student_id = ? AND (fp.is_deleted = FALSE OR fp.is_deleted IS NULL)
       ORDER BY fp.payment_date DESC`,
      [studentId],
    );
    return rows;
  }

  // Update payment status
  static async updatePaymentStatus(id, status) {
    await pool.query("UPDATE fee_payments SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    return true;
  }

  // Delete payment (soft delete)
  static async deletePayment(id) {
    const [result] = await pool.query(
      "UPDATE fee_payments SET is_deleted = TRUE WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  // Generate unique receipt number
  static async generateReceiptNo(schoolId) {
    const date = new Date();
    const prefix = `RCP${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;

    const [rows] = await pool.query(
      `SELECT receipt_no FROM fee_payments fp
       JOIN students s ON fp.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE u.school_id = ? AND fp.receipt_no LIKE ?
       ORDER BY fp.id DESC LIMIT 1`,
      [schoolId, `${prefix}%`],
    );

    if (rows.length === 0) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(rows[0].receipt_no.slice(-4)) + 1;
    return `${prefix}${String(lastNumber).padStart(4, "0")}`;
  }

  // Get fee summary for school
  static async getFeeSummary(schoolId, academicYear) {
    const [totalCollected] = await pool.query(
      `SELECT COALESCE(SUM(fp.amount), 0) as total
       FROM fee_payments fp
       JOIN students s ON fp.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE u.school_id = ? AND fp.status = ? AND YEAR(fp.payment_date) = ?`,
      [schoolId, "confirmed", academicYear || new Date().getFullYear()],
    );

    const [totalExpected] = await pool.query(
      `SELECT COALESCE(SUM(fs.amount), 0) as total
       FROM fee_structures fs
       JOIN classes c ON fs.class_id = c.id
       WHERE c.school_id = ? AND fs.status = ?`,
      [schoolId, "active"],
    );

    const [studentCount] = await pool.query(
      `SELECT COUNT(*) as count FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE u.school_id = ? AND u.status = ?`,
      [schoolId, "active"],
    );

    return {
      totalCollected: totalCollected[0].total,
      totalExpected: totalExpected[0].total * studentCount[0].count,
      pendingAmount:
        totalExpected[0].total * studentCount[0].count -
        totalCollected[0].total,
    };
  }
}

module.exports = FeeModel;
