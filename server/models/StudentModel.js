const { pool } = require("../config/database");

class StudentModel {
  // Create a new student
  static async create(data) {
    const {
      admission_no,
      roll_no,
      user_id,
      class_id,
      father_name,
      mother_name,
      parent_phone,
      parent_email,
      date_of_birth,
      gender,
      blood_group,
      religion,
      caste,
      nationality,
      mother_tongue,
      aadhar_number,
      admission_date,
      previous_school,
      medical_info,
      transport_route_id,
      hostel_id,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO students (
        admission_no, roll_no, user_id, class_id, father_name, mother_name, 
        parent_phone, parent_email, date_of_birth, gender, blood_group, 
        religion, caste, nationality, mother_tongue, aadhar_number, 
        admission_date, previous_school, medical_info, transport_route_id, hostel_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        admission_no,
        roll_no,
        user_id,
        class_id,
        father_name,
        mother_name,
        parent_phone,
        parent_email,
        date_of_birth,
        gender,
        blood_group,
        religion,
        caste,
        nationality,
        mother_tongue,
        aadhar_number,
        admission_date,
        previous_school,
        medical_info,
        transport_route_id,
        hostel_id,
      ],
    );
    return result.insertId;
  }

  static async findBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let whereClause = `
    WHERE u.school_id = ?
    AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.class_id) {
      whereClause += " AND s.class_id = ?";
      params.push(filters.class_id);
    }

    if (filters.status) {
      whereClause += " AND u.status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      whereClause += `
      AND (
        u.full_name LIKE ?
        OR s.admission_no LIKE ?
        OR s.roll_no LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Main query
    const query = `
    SELECT
      s.*,
      u.full_name,
      u.email,
      u.phone,
      u.profile_image,
      u.status,
      c.class_name,
      c.section
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN classes c ON s.class_id = c.id
    ${whereClause}
    ORDER BY s.admission_no ASC
    LIMIT ? OFFSET ?
  `;

    // Count query
    const countQuery = `
    SELECT COUNT(*) AS total
    FROM students s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN classes c ON s.class_id = c.id
    ${whereClause}
  `;

    const [countResult] = await pool.query(countQuery, params);

    const queryParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(query, queryParams);

    return {
      students: rows,
      pagination: {
        total: countResult[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((countResult[0]?.total || 0) / limit),
      },
    };
  }

  // Find student by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name, u.email, u.phone, u.profile_image, u.status, u.school_id,
              c.class_name, c.section
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Find student by user ID
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name, u.email, u.phone, u.profile_image, u.status, u.school_id,
              c.class_name, c.section
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.user_id = ?`,
      [userId],
    );
    return rows[0];
  }

  // Find student by admission number
  static async findByAdmissionNo(admissionNo) {
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE admission_no = ?",
      [admissionNo],
    );
    return rows[0];
  }

  // Update student
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
      `UPDATE students SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete student (soft delete)
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE students SET is_deleted = TRUE WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  // Get students by class
  static async findByClass(classId) {
    const [rows] = await pool.query(
      `SELECT s.*, u.full_name, u.email, u.phone
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.class_id = ? AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)
       ORDER BY s.roll_no`,
      [classId],
    );
    return rows;
  }

  // Count students by school
  static async countBySchool(schoolId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE u.school_id = ? AND u.status = ? AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)`,
      [schoolId, "active"],
    );
    return rows[0].count;
  }

  // Get fee dues for a student
  static async getFeeDues(studentId) {
    const [rows] = await pool.query(
      `SELECT fs.*, 
              COALESCE(SUM(fp.amount), 0) as paid_amount,
              (fs.amount - COALESCE(SUM(fp.amount), 0)) as due_amount
       FROM fee_structures fs
       JOIN students s ON fs.class_id = s.class_id
       LEFT JOIN fee_payments fp ON fp.student_id = s.id AND fs.id = fp.id
       WHERE s.id = ? AND fs.status = 'active'
       GROUP BY fs.id`,
      [studentId],
    );
    return rows;
  }
}

module.exports = StudentModel;
