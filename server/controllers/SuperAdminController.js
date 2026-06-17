const { pool } = require("../config/database");
const StudentModel = require("../models/StudentModel");
const TeacherModel = require("../models/TeacherModel");
const AccountantModel = require("../models/AccountantModel");

class SuperAdminController {
  // Get all schools with filters
  static async getSchools(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        subscription_plan,
      } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `SELECT * FROM schools WHERE 1=1`;
      const params = [];

      if (search) {
        query += ` AND (school_name LIKE ? OR school_code LIKE ? OR email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      if (subscription_plan) {
        query += ` AND subscription_plan = ?`;
        params.push(subscription_plan);
      }

      // Get count
      const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");
      const [countResult] = await pool.query(countQuery, params);

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          schools: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get Schools Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all students across all schools (for super admin)
  static async getAllStudents(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        school_id,
        class_id,
        search,
        status,
      } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT s.*, u.full_name, u.email, u.phone, u.status, u.school_id,
               c.class_name, c.section,
               sc.school_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN classes c ON s.class_id = c.id
        LEFT JOIN schools sc ON u.school_id = sc.id
        WHERE (s.is_deleted = FALSE OR s.is_deleted IS NULL)
      `;
      const params = [];

      if (school_id) {
        query += ` AND u.school_id = ?`;
        params.push(school_id);
      }

      if (class_id) {
        query += ` AND s.class_id = ?`;
        params.push(class_id);
      }

      if (search) {
        query += ` AND (u.full_name LIKE ? OR s.admission_no LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND u.status = ?`;
        params.push(status);
      }

      // Count
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        "SELECT COUNT(*) as total FROM",
      );
      const [countResult] = await pool.query(countQuery, params);

      query += ` ORDER BY u.full_name ASC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          students: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get All Students Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all teachers across all schools
  static async getAllTeachers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        school_id,
        subject,
        search,
        status,
      } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT st.*, u.full_name, u.email, u.phone, u.status, u.school_id,
               sc.school_name
        FROM staff_teachers st
        JOIN users u ON st.user_id = u.id
        LEFT JOIN schools sc ON u.school_id = sc.id
        WHERE (st.is_deleted = FALSE OR st.is_deleted IS NULL)
      `;
      const params = [];

      if (school_id) {
        query += ` AND u.school_id = ?`;
        params.push(school_id);
      }

      if (subject) {
        query += ` AND st.subjects LIKE ?`;
        params.push(`%${subject}%`);
      }

      if (search) {
        query += ` AND (u.full_name LIKE ? OR st.employee_id LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND st.status = ?`;
        params.push(status);
      }

      // Count
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        "SELECT COUNT(*) as total FROM",
      );
      const [countResult] = await pool.query(countQuery, params);

      query += ` ORDER BY u.full_name ASC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          teachers: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get All Teachers Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all staff (accountants, librarians, transport managers)
  static async getAllStaff(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        school_id,
        user_type,
        search,
        status,
      } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      console.log(school_id);

      let query = `
        SELECT u.id, u.full_name, u.email, u.phone, u.user_type, u.status, u.school_id,
               u.created_at, u.last_login,
               sc.school_name,
               COALESCE(sa.employee_id, NULL) as employee_id,
               COALESCE(sa.designation, NULL) as designation
        FROM users u
        LEFT JOIN schools sc ON u.school_id = sc.id
        LEFT JOIN staff_accountants sa ON u.id = sa.user_id
        WHERE u.user_type IN ('accountant_fee', 'accountant_salary', 'librarian', 'transport_manager')
          AND u.status != 'blocked'
      `;
      const params = [];

      if (school_id) {
        query += ` AND u.school_id = ?`;
        params.push(school_id);
      }

      if (user_type) {
        query += ` AND u.user_type = ?`;
        params.push(user_type);
      }

      if (search) {
        query += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND u.status = ?`;
        params.push(status);
      }

      // Count
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

  // Get all admins across all schools
  static async getAllAdmins(req, res) {
    try {
      const { page = 1, limit = 20, school_id, search, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let query = `
        SELECT u.id, u.full_name, u.email, u.phone, u.user_type, u.status, u.school_id,
               u.created_at, u.last_login,
               sc.school_name,
               sa.designation
        FROM users u
        LEFT JOIN schools sc ON u.school_id = sc.id
        LEFT JOIN school_admins sa ON u.id = sa.user_id
        WHERE u.user_type = 'admin'
      `;
      const params = [];

      if (school_id) {
        query += ` AND u.school_id = ?`;
        params.push(school_id);
      }

      if (search) {
        query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR sc.school_name LIKE ?)`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (status) {
        query += ` AND u.status = ?`;
        params.push(status);
      }

      // Count
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        "SELECT COUNT(*) as total FROM",
      );
      const [countResult] = await pool.query(countQuery, params);

      query += ` ORDER BY u.full_name ASC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const [rows] = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          admins: rows,
          pagination: {
            total: countResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get All Admins Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create a school admin for any school
  static async createAdmin(req, res) {
    const connection = await pool.getConnection();

    try {
      const {
        school_id,
        username,
        email,
        password,
        full_name,
        phone,
        address,
        designation,
        join_date,
      } = req.body;

      const school = await SchoolModel.findById(school_id);
      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      const existingEmail = await UserModel.emailExists(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const adminUsername = username || email.split("@")[0];
      const existingUsername = await UserModel.usernameExistsInSchool(
        adminUsername,
        school_id,
      );
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists in this school",
        });
      }

      await connection.beginTransaction();

      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await connection.query(
        `INSERT INTO users (
          school_id, user_type, username, email, password, full_name, phone, address
        ) VALUES (?, 'admin', ?, ?, ?, ?, ?, ?)`,
        [
          school_id,
          adminUsername,
          email,
          hashedPassword,
          full_name,
          phone || null,
          address || null,
        ],
      );

      await connection.query(
        `INSERT INTO school_admins (school_id, user_id, designation, join_date)
         VALUES (?, ?, ?, ?)`,
        [
          school_id,
          userResult.insertId,
          designation || "School Admin",
          join_date || null,
        ],
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "School admin created successfully",
        data: { id: userResult.insertId },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Create Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // Update school admin status
  static async updateAdminStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const [rows] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND user_type = 'admin'",
        [id],
      );

      if (!rows[0]) {
        return res.status(404).json({
          success: false,
          message: "School admin not found",
        });
      }

      await pool.query("UPDATE users SET status = ? WHERE id = ?", [
        status,
        id,
      ]);

      res.json({
        success: true,
        message: `School admin status updated to ${status}`,
      });
    } catch (error) {
      console.error("Update Admin Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all classes across all schools
  // static async getAllClasses(req, res) {
  //   try {
  //     const { page = 1, limit = 20, school_id, search } = req.query;
  //     const offset = (parseInt(page) - 1) * parseInt(limit);

  //     let query = `
  //       SELECT c.*, sc.school_name,
  //              (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)) as student_count,
  //              u.full_name as class_teacher_name
  //       FROM classes c
  //       LEFT JOIN schools sc ON c.school_id = sc.id
  //       LEFT JOIN staff_teachers st ON c.class_teacher_id = st.id
  //       LEFT JOIN users u ON st.user_id = u.id
  //       WHERE (c.is_deleted = FALSE OR c.is_deleted IS NULL)
  //     `;
  //     const params = [];

  //     if (school_id) {
  //       query += ` AND c.school_id = ?`;
  //       params.push(school_id);
  //     }

  //     if (search) {
  //       query += ` AND (c.class_name LIKE ? OR c.class_code LIKE ?)`;
  //       const searchTerm = `%${search}%`;
  //       params.push(searchTerm, searchTerm);
  //     }

  //     // Count
  //     const countQuery = query.replace(/SELECT[\s\S]*?FROM/, "SELECT COUNT(*) as total FROM");
  //     const [countResult] = await pool.query(countQuery, params);

  //     query += ` ORDER BY sc.school_name, c.class_name ASC LIMIT ? OFFSET ?`;
  //     params.push(parseInt(limit), offset);

  //     const [rows] = await pool.query(query, params);

  //     res.json({
  //       success: true,
  //       data: {
  //         classes: rows,
  //         pagination: {
  //           total: countResult[0].total,
  //           page: parseInt(page),
  //           limit: parseInt(limit),
  //           totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Get All Classes Error:", error);
  //     res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }
  // }
  static async getAllClasses(req, res) {
    try {
      const query = `
      SELECT 
          c.*,
          sc.school_name,

          (
              SELECT COUNT(*)
              FROM students s
              WHERE s.class_id = c.id
              AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)
          ) AS student_count,

          u.full_name AS class_teacher_name

      FROM classes c

      LEFT JOIN schools sc
          ON c.school_id = sc.id

      LEFT JOIN staff_teachers st
          ON c.class_teacher_id = st.id

      LEFT JOIN users u
          ON st.user_id = u.id

      WHERE (c.is_deleted = FALSE OR c.is_deleted IS NULL)
    `;

      const [rows] = await pool.query(query);

      return res.status(200).json({
        success: true,
        count: rows.length,
        data: rows,
      });
    } catch (error) {
      console.error("Get All Classes Error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch classes",
        error: error.message,
      });
    }
  }

  // Get system stats summary
  static async getSystemStats(req, res) {
    try {
      // Get all counts in parallel
      const [
        [schoolsResult],
        [usersResult],
        [studentsResult],
        [teachersResult],
        [feeResult],
      ] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM schools",
        ),
        pool.query(
          "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM users",
        ),
        pool.query(
          `SELECT COUNT(*) as total FROM students s JOIN users u ON s.user_id = u.id WHERE u.status = 'active' AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)`,
        ),
        pool.query(
          `SELECT COUNT(*) as total FROM staff_teachers st JOIN users u ON st.user_id = u.id WHERE st.status = 'active' AND (st.is_deleted = FALSE OR st.is_deleted IS NULL)`,
        ),
        pool.query(
          `SELECT COALESCE(SUM(amount), 0) as total FROM fee_payments WHERE status = 'confirmed' AND YEAR(payment_date) = YEAR(CURDATE())`,
        ),
      ]);

      res.json({
        success: true,
        data: {
          schools: {
            total: schoolsResult[0].total,
            active: schoolsResult[0].active,
          },
          users: {
            total: usersResult[0].total,
            active: usersResult[0].active,
          },
          students: studentsResult[0].total,
          teachers: teachersResult[0].total,
          feeCollectionThisYear: feeResult[0].total,
        },
      });
    } catch (error) {
      console.error("Get System Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Switch school context for super admin
  static async switchSchool(req, res) {
    try {
      const { schoolId } = req.params;

      const [rows] = await pool.query("SELECT * FROM schools WHERE id = ?", [
        schoolId,
      ]);

      if (!rows[0]) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      res.json({
        success: true,
        data: rows[0],
        message: `Switched to ${rows[0].school_name}`,
      });
    } catch (error) {
      console.error("Switch School Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = SuperAdminController;
