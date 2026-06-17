const { pool } = require("../config/database");
const TeacherModel = require("../models/TeacherModel");
const AccountantModel = require("../models/AccountantModel");

class StaffController {
  // Get all staff members (teachers + accountants) for salary management
  static async getAllStaff(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 100, search, staff_type } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT 
          u.id as user_id,
          u.full_name,
          u.email,
          u.phone,
          u.user_type,
          COALESCE(st.employee_id, sa.employee_id) as employee_id,
          COALESCE(st.designation, sa.designation) as designation,
          COALESCE(st.status, sa.status) as staff_status,
          CASE 
            WHEN st.id IS NOT NULL THEN 'teacher'
            WHEN sa.id IS NOT NULL THEN 'accountant'
            ELSE 'other'
          END as staff_type,
          st.department,
          st.subjects,
          sa.type as accountant_type
        FROM users u
        LEFT JOIN staff_teachers st ON u.id = st.user_id AND (st.is_deleted = FALSE OR st.is_deleted IS NULL)
        LEFT JOIN staff_accountants sa ON u.id = sa.user_id AND sa.status = 'active'
        WHERE u.school_id = ? 
          AND u.status = 'active'
          AND u.user_type IN ('teacher', 'accountant_fee', 'accountant_salary', 'librarian', 'transport_manager')
          AND (st.id IS NOT NULL OR sa.id IS NOT NULL OR u.user_type IN ('librarian', 'transport_manager'))
      `;
      const params = [schoolId];

      if (search) {
        query += ` AND (u.full_name LIKE ? OR COALESCE(st.employee_id, sa.employee_id) LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (staff_type) {
        if (staff_type === "teacher") {
          query += ` AND st.id IS NOT NULL`;
        } else if (staff_type === "accountant") {
          query += ` AND sa.id IS NOT NULL`;
        }
      }

      // Get total count
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        "SELECT COUNT(DISTINCT u.id) as total FROM",
      );
      const [countResult] = await pool.query(countQuery, params);

      query += ` ORDER BY u.full_name ASC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          staff: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get All Staff Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get staff by ID
  static async getStaffById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const [rows] = await pool.query(
        `SELECT 
        u.id as user_id,
        u.full_name,
        u.email,
        u.phone,
        u.user_type,
        u.address,
        u.profile_image,

        CASE
          WHEN st.user_id IS NOT NULL THEN 'teacher'
          WHEN sa.type = 'fee' THEN 'accountant_fee'
          WHEN sa.type = 'salary' THEN 'accountant_salary'
          WHEN sa.type = 'both' THEN 'accountant_both'
          ELSE 'staff'
        END as staff_type,

        COALESCE(st.employee_id, sa.employee_id) as employee_id,
        COALESCE(st.designation, sa.designation) as designation,
        COALESCE(st.status, sa.status) as staff_status,
        COALESCE(st.joining_date, sa.joining_date) as joining_date,

        -- Teacher Fields
        st.department,
        st.qualification,
        st.experience_years,
        st.specialization,
        st.subjects,

        -- Accountant Fields
        sa.type as accountant_type,
        sa.salary as base_salary

      FROM users u
      LEFT JOIN staff_teachers st 
        ON u.id = st.user_id

      LEFT JOIN staff_accountants sa 
        ON u.id = sa.user_id

      WHERE u.id = ? 
      AND u.school_id = ?`,
        [id, schoolId],
      );

      if (!rows[0]) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("Get Staff By ID Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get staff salary history
  static async getStaffSalaryHistory(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const [rows] = await pool.query(
        `SELECT 
        u.id as user_id,
        u.full_name,
        u.email,
        u.phone,
        u.user_type,
        u.address,
        u.profile_image,

        CASE
          WHEN st.user_id IS NOT NULL THEN 'teacher'
          WHEN sa.type = 'fee' THEN 'accountant_fee'
          WHEN sa.type = 'salary' THEN 'accountant_salary'
          WHEN sa.type = 'both' THEN 'accountant_both'
          ELSE 'staff'
        END as staff_type,

        COALESCE(st.employee_id, sa.employee_id) as employee_id,
        COALESCE(st.designation, sa.designation) as designation,
        COALESCE(st.status, sa.status) as staff_status,
        COALESCE(st.joining_date, sa.joining_date) as joining_date,

        -- Teacher Fields
        st.department,
        st.qualification,
        st.experience_years,
        st.specialization,
        st.subjects,

        -- Accountant Fields
        sa.type as accountant_type,
        sa.salary as base_salary

      FROM users u
      LEFT JOIN staff_teachers st 
        ON u.id = st.user_id

      LEFT JOIN staff_accountants sa 
        ON u.id = sa.user_id

      WHERE u.id = ? 
      AND u.school_id = ?`,
        [id, schoolId],
      );

      if (!rows[0]) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        });
      }

      res.json({
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("Get Staff By ID Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get staff salary history
  static async getStaffSalaryHistory(req, res) {
    try {
      const { id } = req.params;
      const { year } = req.query;
      const schoolId = req.schoolId;

      let query = `
        SELECT sr.*, u.full_name
        FROM salary_records sr
        JOIN users u ON sr.staff_id = u.id
        WHERE sr.staff_id = ?
          AND u.school_id = ?
      `;
      const params = [id, schoolId];

      if (year) {
        query += ` AND sr.year = ?`;
        params.push(year);
      }

      query += ` ORDER BY sr.year DESC, sr.month DESC`;

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Get Staff Salary History Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get staff count by type
  static async getStaffCounts(req, res) {
    try {
      const schoolId = req.schoolId;

      const [result] = await pool.query(
        `SELECT 
          SUM(CASE WHEN u.user_type = 'teacher' THEN 1 ELSE 0 END) as teachers,
          SUM(CASE WHEN u.user_type IN ('accountant_fee', 'accountant_salary') THEN 1 ELSE 0 END) as accountants,
          SUM(CASE WHEN u.user_type = 'librarian' THEN 1 ELSE 0 END) as librarians,
          SUM(CASE WHEN u.user_type = 'transport_manager' THEN 1 ELSE 0 END) as transport_managers,
          COUNT(*) as total
        FROM users u
        WHERE u.school_id = ? 
          AND u.status = 'active'
          AND u.user_type IN ('teacher', 'accountant_fee', 'accountant_salary', 'librarian', 'transport_manager')`,
        [schoolId],
      );

      res.json({
        success: true,
        data: result[0],
      });
    } catch (error) {
      console.error("Get Staff Counts Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = StaffController;
