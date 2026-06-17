const { pool } = require("../config/database");

class AttendanceModel {
  // ===================== STUDENT ATTENDANCE =====================
  // Mark student attendance
  static async markStudentAttendance(data) {
    const {
      student_id,
      class_id,
      attendance_date,
      status,
      remarks,
      marked_by,
    } = data;
    // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert behavior
    const [result] = await pool.query(
      `INSERT INTO attendance (student_id, class_id, attendance_date, status, remarks, marked_by)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
      [student_id, class_id, attendance_date, status, remarks, marked_by],
    );
    return result.insertId || result.affectedRows;
  }

  // Mark bulk attendance for a class
  static async markBulkAttendance(
    class_Id,
    attendance_date,
    attendanceList,
    markedBy,
  ) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const record of attendanceList) {
        await connection.query(
          `INSERT INTO attendance (student_id, class_id, attendance_date, status, remarks, marked_by)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
          [
            record.student_id,
            class_Id,
            attendance_date,
            record.status,
            record.remarks || null,
            markedBy,
          ],
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get attendance by class and date
  static async getByClassAndDate(classId, attendanceDate) {
    const [rows] = await pool.query(
      `SELECT a.*, s.admission_no, s.roll_no, u.full_name
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE a.class_id = ? AND a.attendance_date = ? 
       AND (a.is_deleted = FALSE OR a.is_deleted IS NULL)
       ORDER BY s.roll_no`,
      [classId, attendanceDate],
    );
    return rows;
  }

  // Get attendance by student
  static async getByStudent(studentId, filters = {}) {
    let query = `
      SELECT a.*, c.class_name, c.section
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      WHERE a.student_id = ? AND (a.is_deleted = FALSE OR a.is_deleted IS NULL)
    `;
    const params = [studentId];

    if (filters.from_date) {
      query += " AND a.attendance_date >= ?";
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      query += " AND a.attendance_date <= ?";
      params.push(filters.to_date);
    }

    if (filters.status) {
      query += " AND a.status = ?";
      params.push(filters.status);
    }

    query += " ORDER BY a.attendance_date DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get attendance summary for a class
  static async getClassSummary(classId, month, year) {
    const [rows] = await pool.query(
      `SELECT 
        s.id as student_id,
        s.admission_no,
        s.roll_no,
        u.full_name,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) as half_days,
        COUNT(a.id) as total_days
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN attendance a ON s.id = a.student_id 
         AND MONTH(a.attendance_date) = ? 
         AND YEAR(a.attendance_date) = ?
         AND (a.is_deleted = FALSE OR a.is_deleted IS NULL)
       WHERE s.class_id = ? AND (s.is_deleted = FALSE OR s.is_deleted IS NULL)
       GROUP BY s.id
       ORDER BY s.roll_no`,
      [month, year, classId],
    );
    return rows;
  }

  // Get attendance for school by date range
  static async getSchoolAttendance(schoolId, fromDate, toDate) {
    const [rows] = await pool.query(
      `SELECT 
        a.attendance_date,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
        COUNT(a.id) as total_count
       FROM attendance a
       JOIN classes c ON a.class_id = c.id
       WHERE c.school_id = ? 
         AND a.attendance_date BETWEEN ? AND ?
         AND (a.is_deleted = FALSE OR a.is_deleted IS NULL)
       GROUP BY a.attendance_date
       ORDER BY a.attendance_date`,
      [schoolId, fromDate, toDate],
    );
    return rows;
  }

  // ===================== STAFF ATTENDANCE =====================

  // Mark staff attendance
  static async markStaffAttendance(data) {
    const {
      user_id,
      attendance_date,
      check_in,
      check_out,
      status,
      leave_type,
      remarks,
      marked_by,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO staff_attendance (user_id, attendance_date, check_in, check_out, status, leave_type, remarks, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), check_out = VALUES(check_out), 
                               status = VALUES(status), leave_type = VALUES(leave_type), 
                               remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
      [
        user_id,
        attendance_date,
        check_in,
        check_out,
        status,
        leave_type,
        remarks,
        marked_by,
      ],
    );
    return result.insertId || result.affectedRows;
  }

  // Get staff attendance by user
  static async getStaffAttendanceByUser(userId, filters = {}) {
    let query = "SELECT * FROM staff_attendance WHERE user_id = ?";
    const params = [userId];

    if (filters.from_date) {
      query += " AND attendance_date >= ?";
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      query += " AND attendance_date <= ?";
      params.push(filters.to_date);
    }

    query += " ORDER BY attendance_date DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get staff attendance summary for salary calculation
  static async getStaffAttendanceSummary(userId, month, year) {
    const [rows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days,
        COUNT(*) as total_days
       FROM staff_attendance
       WHERE user_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?`,
      [userId, month, year],
    );
    return rows[0];
  }

  // Get all staff attendance for a school on a date
  static async getSchoolStaffAttendance(schoolId, attendanceDate) {
    const [rows] = await pool.query(
      `SELECT sa.*, u.full_name, u.user_type
       FROM staff_attendance sa
       JOIN users u ON sa.user_id = u.id
       WHERE u.school_id = ? AND sa.attendance_date = ?
       ORDER BY u.full_name`,
      [schoolId, attendanceDate],
    );
    return rows;
  }

  // Delete attendance record
  static async deleteAttendance(id) {
    const [result] = await pool.query(
      "UPDATE attendance SET is_deleted = TRUE WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}

module.exports = AttendanceModel;
