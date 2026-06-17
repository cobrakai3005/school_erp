const { pool } = require("../config/database");
const StudentModel = require("../models/StudentModel");
const TeacherModel = require("../models/TeacherModel");

class DashboardController {
  // Get dashboard stats for super admin
  static async getSuperAdminStats(req, res) {
    try {
      // Get total schools
      const [schoolsResult] = await pool.query(
        "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM schools",
      );

      // Get total users across all schools
      const [usersResult] = await pool.query(
        "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM users",
      );

      // Get subscription stats
      const [subscriptionResult] = await pool.query(
        `SELECT 
          subscription_plan,
          COUNT(*) as count
         FROM schools 
         WHERE status = 'active'
         GROUP BY subscription_plan`,
      );

      // Get recent schools
      const [recentSchools] = await pool.query(
        `SELECT id, school_name, school_code, status, subscription_plan, created_at 
         FROM schools 
         ORDER BY created_at DESC 
         LIMIT 5`,
      );

      // Get user type distribution
      const [userDistribution] = await pool.query(
        `SELECT user_type, COUNT(*) as count 
         FROM users 
         WHERE status = 'active'
         GROUP BY user_type`,
      );

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
          subscriptions: subscriptionResult,
          recentSchools,
          userDistribution,
        },
      });
    } catch (error) {
      console.error("Get Super Admin Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get dashboard stats for school admin
  static async getAdminStats(req, res) {
    try {
      const schoolId = req.schoolId;

      // Get student count
      const studentCount = await StudentModel.countBySchool(schoolId);

      // Get teacher count
      const teacherCount = await TeacherModel.countBySchool(schoolId);

      // Get class count
      const [classResult] = await pool.query(
        `SELECT COUNT(*) as count FROM classes 
         WHERE school_id = ? AND status = 'active' AND (is_deleted = FALSE OR is_deleted IS NULL)`,
        [schoolId],
      );

      // Get fee collection stats (current month)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const [feeResult] = await pool.query(
        `SELECT 
          COALESCE(SUM(amount), 0) as total_collected
         FROM fee_payments fp
         JOIN students s ON fp.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE u.school_id = ? 
           AND MONTH(fp.payment_date) = ? 
           AND YEAR(fp.payment_date) = ?
           AND fp.status = 'confirmed'`,
        [schoolId, currentMonth, currentYear],
      );

      // Get today's attendance
      const today = new Date().toISOString().split("T")[0];
      const [attendanceResult] = await pool.query(
        `SELECT 
    COUNT(*) AS total,
    
    COALESCE(SUM(
        CASE 
            WHEN a.status = 'present' THEN 1 
            ELSE 0 
        END
    ), 0) AS present,

    COALESCE(SUM(
        CASE 
            WHEN a.status = 'absent' THEN 1 
            ELSE 0 
        END
    ), 0) AS absent

FROM attendance a
JOIN students s ON a.student_id = s.id
JOIN users u ON s.user_id = u.id

WHERE u.school_id = ?
AND a.attendance_date = ?`,
        [schoolId, today],
      );

      // Get pending homework count
      const [homeworkResult] = await pool.query(
        `SELECT COUNT(*) as pending FROM homework_assignments ha
         JOIN classes c ON ha.class_id = c.id
         WHERE c.school_id = ? AND ha.status = 'active' AND ha.submission_date >= CURDATE()`,
        [schoolId],
      );

      // Get recent activities (last 10)
      const [recentFees] = await pool.query(
        `SELECT fp.id, fp.amount, fp.payment_date, u.full_name as student_name
         FROM fee_payments fp
         JOIN students s ON fp.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE u.school_id = ? AND fp.status = 'confirmed'
         ORDER BY fp.created_at DESC
         LIMIT 5`,
        [schoolId],
      );

      res.json({
        success: true,
        data: {
          students: studentCount,
          teachers: teacherCount,
          classes: classResult[0].count,
          feeCollection: feeResult[0].total_collected,
          attendance: {
            total: attendanceResult[0].total || 0,
            present: attendanceResult[0].present || 0,
            absent: attendanceResult[0].absent || 0,
            percentage:
              attendanceResult[0].total > 0
                ? Math.round(
                    (attendanceResult[0].present / attendanceResult[0].total) *
                      100,
                  )
                : 0,
          },
          pendingHomework: homeworkResult[0].pending,
          recentFees,
        },
      });
    } catch (error) {
      console.error("Get Admin Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get dashboard stats for teacher
  static async getTeacherStats(req, res) {
    try {
      const userId = req.user.id;
      const schoolId = req.schoolId;

      // Get teacher info
      const [teacherResult] = await pool.query(
        `SELECT st.id, st.class_teacher_of FROM staff_teachers st WHERE st.user_id = ?`,
        [userId],
      );

      if (!teacherResult[0]) {
        return res.json({
          success: true,
          data: {
            myClasses: 0,
            totalStudents: 0,
            pendingHomework: 0,
            todayClasses: [],
          },
        });
      }

      const teacherId = teacherResult[0].id;

      // Get classes where teacher is assigned
      const [classesResult] = await pool.query(
        `SELECT COUNT(DISTINCT t.class_id) as count 
         FROM timetable t 
         WHERE t.teacher_id = ?`,
        [teacherId],
      );

      // Get total students in teacher's classes
      const [studentsResult] = await pool.query(
        `SELECT COUNT(DISTINCT s.id) as count 
         FROM students s
         JOIN timetable t ON s.class_id = t.class_id
         WHERE t.teacher_id = ? AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)`,
        [teacherId],
      );

      // Get pending homework by this teacher
      const [homeworkResult] = await pool.query(
        `SELECT COUNT(*) as pending FROM homework_assignments 
         WHERE teacher_id = ? AND status = 'active' AND submission_date >= CURDATE()`,
        [teacherId],
      );

      // Get ungraded submissions
      const [ungradedResult] = await pool.query(
        `SELECT COUNT(*) as count FROM homework_submissions hs
         JOIN homework_assignments ha ON hs.homework_id = ha.id
         WHERE ha.teacher_id = ? AND hs.marks IS NULL`,
        [teacherId],
      );

      // Get today's timetable
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const today = days[new Date().getDay()];
      const [todayClasses] = await pool.query(
        `SELECT t.*, c.class_name, c.section 
         FROM timetable t
         JOIN classes c ON t.class_id = c.id
         WHERE t.teacher_id = ? AND t.day_of_week = ?
         ORDER BY t.period_number`,
        [teacherId, today],
      );

      res.json({
        success: true,
        data: {
          myClasses: classesResult[0].count,
          totalStudents: studentsResult[0].count,
          pendingHomework: homeworkResult[0].pending,
          ungradedSubmissions: ungradedResult[0].count,
          todayClasses,
        },
      });
    } catch (error) {
      console.error("Get Teacher Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get dashboard stats for student
  static async getStudentStats(req, res) {
    try {
      const userId = req.user.id;

      // Get student info
      const [studentResult] = await pool.query(
        `SELECT s.id, s.class_id FROM students s WHERE s.user_id = ?`,
        [userId],
      );

      if (!studentResult[0]) {
        return res.json({
          success: true,
          data: {
            attendance: { percentage: 0 },
            pendingHomework: 0,
            feeDue: 0,
          },
        });
      }

      const studentId = studentResult[0].id;
      const classId = studentResult[0].class_id;

      // Get attendance stats (current month)
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const [attendanceResult] = await pool.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
         FROM attendance 
         WHERE student_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?`,
        [studentId, currentMonth, currentYear],
      );

      // Get pending homework
      const [homeworkResult] = await pool.query(
        `SELECT COUNT(*) as pending FROM homework_assignments ha
         LEFT JOIN homework_submissions hs ON ha.id = hs.homework_id AND hs.student_id = ?
         WHERE ha.class_id = ? AND ha.status = 'active' AND ha.submission_date >= CURDATE() AND hs.id IS NULL`,
        [studentId, classId],
      );

      // Get fee due (simplified - actual implementation would calculate properly)
      const [feeDueResult] = await pool.query(
        `SELECT 
          COALESCE(SUM(fs.amount), 0) as total_fee,
          COALESCE((SELECT SUM(amount) FROM fee_payments WHERE student_id = ? AND status = 'confirmed'), 0) as paid
         FROM fee_structures fs
         WHERE fs.class_id = ? AND fs.status = 'active'`,
        [studentId, classId],
      );

      // Get upcoming homework
      const [upcomingHomework] = await pool.query(
        `SELECT ha.id, ha.title, ha.subject, ha.submission_date,
          CASE WHEN hs.id IS NOT NULL THEN 'submitted' ELSE 'pending' END as submission_status
         FROM homework_assignments ha
         LEFT JOIN homework_submissions hs ON ha.id = hs.homework_id AND hs.student_id = ?
         WHERE ha.class_id = ? AND ha.status = 'active' AND ha.submission_date >= CURDATE()
         ORDER BY ha.submission_date
         LIMIT 5`,
        [studentId, classId],
      );

      const feeDue = Math.max(
        0,
        (feeDueResult[0].total_fee || 0) - (feeDueResult[0].paid || 0),
      );

      res.json({
        success: true,
        data: {
          attendance: {
            total: attendanceResult[0].total || 0,
            present: attendanceResult[0].present || 0,
            percentage:
              attendanceResult[0].total > 0
                ? Math.round(
                    (attendanceResult[0].present / attendanceResult[0].total) *
                      100,
                  )
                : 0,
          },
          pendingHomework: homeworkResult[0].pending,
          feeDue,
          upcomingHomework,
        },
      });
    } catch (error) {
      console.error("Get Student Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get dashboard stats for fee accountant
  static async getAccountantFeeStats(req, res) {
    try {
      const schoolId = req.schoolId;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Get collection stats
      const [collectionResult] = await pool.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN MONTH(fp.payment_date) = ? AND YEAR(fp.payment_date) = ? THEN fp.amount ELSE 0 END), 0) as this_month,
          COALESCE(SUM(CASE WHEN YEAR(fp.payment_date) = ? THEN fp.amount ELSE 0 END), 0) as this_year
         FROM fee_payments fp
         JOIN students s ON fp.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE u.school_id = ? AND fp.status = 'confirmed'`,
        [currentMonth, currentYear, currentYear, schoolId],
      );

      // Get student count
      const studentCount = await StudentModel.countBySchool(schoolId);

      // Get recent payments
      const [recentPayments] = await pool.query(
        `SELECT fp.id, fp.receipt_no, fp.amount, fp.payment_date, fp.payment_mode, u.full_name as student_name
         FROM fee_payments fp
         JOIN students s ON fp.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE u.school_id = ? AND fp.status = 'confirmed'
         ORDER BY fp.created_at DESC
         LIMIT 10`,
        [schoolId],
      );

      res.json({
        success: true,
        data: {
          collection: {
            thisMonth: collectionResult[0].this_month,
            thisYear: collectionResult[0].this_year,
          },
          studentCount,
          recentPayments,
        },
      });
    } catch (error) {
      console.error("Get Accountant Fee Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get dashboard stats for salary accountant
  static async getAccountantSalaryStats(req, res) {
    try {
      const schoolId = req.schoolId;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Get salary stats
      const [salaryResult] = await pool.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN sr.status = 'paid' THEN sr.net_salary ELSE 0 END), 0) as paid,
          COALESCE(SUM(CASE WHEN sr.status = 'pending' THEN sr.net_salary ELSE 0 END), 0) as pending,
          COUNT(*) as total_records
         FROM salary_records sr
         JOIN users u ON sr.staff_id = u.id
         WHERE u.school_id = ? AND sr.month = ? AND sr.year = ?`,
        [schoolId, currentMonth, currentYear],
      );

      // Get staff count
      const [staffResult] = await pool.query(
        `SELECT COUNT(*) as count FROM users 
         WHERE school_id = ? AND user_type IN ('teacher', 'accountant_fee', 'accountant_salary', 'librarian', 'transport_manager') AND status = 'active'`,
        [schoolId],
      );

      // Get pending salaries
      const [pendingSalaries] = await pool.query(
        `SELECT sr.id, sr.net_salary, sr.staff_type, u.full_name
         FROM salary_records sr
         JOIN users u ON sr.staff_id = u.id
         WHERE u.school_id = ? AND sr.month = ? AND sr.year = ? AND sr.status = 'pending'
         ORDER BY u.full_name
         LIMIT 10`,
        [schoolId, currentMonth, currentYear],
      );

      res.json({
        success: true,
        data: {
          salaries: {
            paid: salaryResult[0].paid,
            pending: salaryResult[0].pending,
            totalRecords: salaryResult[0].total_records,
          },
          staffCount: staffResult[0].count,
          pendingSalaries,
        },
      });
    } catch (error) {
      console.error("Get Accountant Salary Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get dashboard stats for librarian
  static async getLibrarianStats(req, res) {
    try {
      const schoolId = req.schoolId;

      // Get book stats
      const [bookResult] = await pool.query(
        `SELECT 
    COUNT(*) as total,
    SUM(quantity) as total_copies,
    SUM(available_quantity) as available
   FROM library_books
   WHERE school_id = ? OR school_id IS NULL`,
        [schoolId],
      );

      // Get issued books count
      const [issuedResult] = await pool.query(
        `SELECT 
          COUNT(*) as issued,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue
         FROM library_issues
         WHERE school_id = ? AND status IN ('issued', 'overdue')`,
        [schoolId],
      );

      // Get recent issues
      const [recentIssues] = await pool.query(
        `SELECT li.id, li.issue_date, li.due_date, li.status, lb.title as book_title, u.full_name as student_name
         FROM library_issues li
         JOIN library_books lb ON li.book_id = lb.id
         JOIN students s ON li.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE li.school_id = ?
         ORDER BY li.created_at DESC
         LIMIT 10`,
        [schoolId],
      );

      res.json({
        success: true,
        data: {
          books: {
            total: bookResult[0].total || 0,
            totalCopies: bookResult[0].total_copies || 0,
            available: bookResult[0].available || 0,
          },
          issues: {
            issued: issuedResult[0].issued || 0,
            overdue: issuedResult[0].overdue || 0,
          },
          recentIssues,
        },
      });
    } catch (error) {
      console.error("Get Librarian Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getParentStats(req, res) {
    try {
      const parentId = req.user.id;
      const schoolId = req.schoolId;

      // 👶 Children info
      const [children] = await pool.query(
        `SELECT 
  s.id AS student_id,
  u.full_name AS student_name,
  s.class_id
FROM parents p
JOIN students s ON p.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE p.user_id = ?
  AND u.school_id = ?`,
        [parentId, schoolId],
      );

      // 📊 Exam stats (single optimized query)
      const [examStats] = await pool.query(
        `SELECT 
    COUNT(DISTINCT er.exam_id) AS total_exams,
    COALESCE(AVG(er.percentage), 0) AS avg_percentage,
    COALESCE(MAX(er.percentage), 0) AS highest_percentage
   FROM exam_results er
   JOIN parents p ON p.student_id = er.student_id
   JOIN students s ON s.id = er.student_id
   JOIN users u ON u.id = s.user_id
   WHERE p.user_id = ?
     AND u.school_id = ?`,
        [parentId, schoolId],
      );

      // 📅 Attendance
      const [attendance] = await pool.query(
        `SELECT 
  COUNT(*) AS total_days,
  SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_days
FROM parents p
JOIN attendance a ON a.student_id = p.student_id
JOIN students s ON a.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE p.user_id = ?
  AND u.school_id = ?`,
        [parentId, schoolId],
      );

      return res.json({
        success: true,
        data: {
          children,
          examStats: {
            totalExams: examStats[0]?.total_exams || 0,
            averagePercentage: examStats[0]?.avg_percentage || 0,
            highestPercentage: examStats[0]?.highest_percentage || 0,
          },
          attendance: {
            totalDays: attendance[0]?.total_days || 0,
            presentDays: attendance[0]?.present_days || 0,
          },
        },
      });
    } catch (error) {
      console.error("Parent Stats Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getTransportStats(req, res) {
    try {
      const schoolId = req.schoolId;

      // 🛣️ ROUTES STATS
      const [routeStats] = await pool.query(
        `SELECT 
        COUNT(*) as total_routes,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_routes,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_routes
       FROM transport_routes
       WHERE school_id = ?`,
        [schoolId],
      );

      // 👨‍🎓 STUDENT TRANSPORT STATS
      const [studentStats] = await pool.query(
        `SELECT 
        COUNT(*) as total_assigned,
        SUM(CASE WHEN ts.status = 'active' THEN 1 ELSE 0 END) as active_assigned,
        SUM(CASE WHEN ts.status = 'inactive' THEN 1 ELSE 0 END) as inactive_assigned,
        SUM(CASE WHEN ts.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_assigned
       FROM transport_students ts
       JOIN students s ON ts.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE u.school_id = ?`,
        [schoolId],
      );

      // 📍 ROUTE WISE STUDENT COUNT
      const [routeWise] = await pool.query(
        `SELECT 
        tr.id,
        tr.route_name,
        tr.route_code,
        COUNT(ts.id) as total_students
       FROM transport_routes tr
       LEFT JOIN transport_students ts ON ts.route_id = tr.id
       WHERE tr.school_id = ?
       GROUP BY tr.id, tr.route_name, tr.route_code
       ORDER BY total_students DESC`,
        [schoolId],
      );

      // 👨‍🎓 RECENT ASSIGNMENTS
      const [recentAssignments] = await pool.query(
        `SELECT 
        ts.id,
        u.full_name as student_name,
        tr.route_name,
        ts.pickup_point,
        ts.drop_point,
        ts.pickup_time,
        ts.drop_time,
        ts.status
       FROM transport_students ts
       JOIN students s ON ts.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN transport_routes tr ON ts.route_id = tr.id
       WHERE tr.school_id = ?
       ORDER BY ts.id DESC
       LIMIT 10`,
        [schoolId],
      );

      // 🚌 BUS UTILIZATION (how full routes are)
      const [utilization] = await pool.query(
        `SELECT 
        tr.route_name,
        COUNT(ts.id) as assigned_students
       FROM transport_routes tr
       LEFT JOIN transport_students ts ON tr.id = ts.route_id
       WHERE tr.school_id = ?
       GROUP BY tr.id`,
        [schoolId],
      );

      res.json({
        success: true,
        data: {
          routes: {
            total: routeStats[0].total_routes || 0,
            active: routeStats[0].active_routes || 0,
            inactive: routeStats[0].inactive_routes || 0,
          },

          students: {
            totalAssigned: studentStats[0].total_assigned || 0,
            active: studentStats[0].active_assigned || 0,
            inactive: studentStats[0].inactive_assigned || 0,
            cancelled: studentStats[0].cancelled_assigned || 0,
          },

          routeWise,
          utilization,
          recentAssignments,
        },
      });
    } catch (error) {
      console.error("Transport Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = DashboardController;
