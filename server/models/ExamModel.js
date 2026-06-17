const { pool } = require("../config/database");

class ExamModel {
  // ===================== EXAMS =====================

  // Create exam
  static async create(data) {
    const {
      school_id,
      exam_name,
      exam_type,
      class_id,
      academic_year,
      start_date,
      end_date,
      max_marks,
      passing_marks,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO exams (
        exam_name, exam_type, class_id, academic_year, start_date, end_date, max_marks, passing_marks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exam_name,
        exam_type,
        class_id,
        academic_year,
        start_date,
        end_date,
        max_marks || 100,
        passing_marks || 35,
      ],
    );
    return result.insertId;
  }

  // Get exams by school
  static async getBySchool(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM exams e
    JOIN classes c ON e.class_id = c.id
    WHERE c.school_id = ?
      AND (e.is_deleted = FALSE OR e.is_deleted IS NULL)
  `;

    const params = [schoolId];

    if (filters.class_id) {
      baseQuery += ` AND e.class_id = ?`;
      params.push(filters.class_id);
    }

    if (filters.exam_type) {
      baseQuery += ` AND e.exam_type = ?`;
      params.push(filters.exam_type);
    }

    if (filters.status) {
      baseQuery += ` AND e.status = ?`;
      params.push(filters.status);
    }

    if (filters.academic_year) {
      baseQuery += ` AND e.academic_year = ?`;
      params.push(filters.academic_year);
    }

    if (filters.search) {
      baseQuery += `
      AND (
        e.exam_name LIKE ?
        OR e.exam_type LIKE ?
        OR c.class_name LIKE ?
        OR c.section LIKE ?
        OR e.academic_year LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;

      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.from_date) {
      baseQuery += ` AND e.start_date >= ?`;
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      baseQuery += ` AND e.end_date <= ?`;
      params.push(filters.to_date);
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
      e.*,
      c.class_name,
      c.section
    ${baseQuery}
    ORDER BY e.start_date DESC
    LIMIT ? OFFSET ?
  `;

    const dataParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(dataQuery, dataParams);

    return {
      exams: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get exam by ID
  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT e.*, c.class_name, c.section, c.school_id
       FROM exams e
       JOIN classes c ON e.class_id = c.id
       WHERE e.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Update exam
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
      `UPDATE exams SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete exam
  static async delete(id) {
    const [result] = await pool.query(
      "UPDATE exams SET status = ? WHERE id = ?",
      ["cancelled", id],
    );
    return result.affectedRows > 0;
  }

  // ===================== EXAM RESULTS =====================

  // Add exam result
  static async addResult(data) {
    const {
      exam_id,
      student_id,
      subject,
      marks_obtained,
      total_marks,
      remarks,
      entered_by,
    } = data;

    // Calculate percentage and grade
    const percentage = ((marks_obtained / total_marks) * 100).toFixed(2);
    const grade = this.calculateGrade(percentage);

    const [result] = await pool.query(
      `INSERT INTO exam_results (
        exam_id, student_id, subject, marks_obtained, total_marks, percentage, grade, remarks, entered_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        marks_obtained = VALUES(marks_obtained), 
        total_marks = VALUES(total_marks),
        percentage = VALUES(percentage),
        grade = VALUES(grade),
        remarks = VALUES(remarks),
        entered_by = VALUES(entered_by)`,
      [
        exam_id,
        student_id,
        subject,
        marks_obtained,
        total_marks,
        percentage,
        grade,
        remarks,
        entered_by,
      ],
    );
    return result.insertId || result.affectedRows;
  }

  // Add bulk results
  static async addBulkResults(examId, results, enteredBy) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const result of results) {
        const percentage = (
          (result.marks_obtained / result.total_marks) *
          100
        ).toFixed(2);
        const grade = this.calculateGrade(percentage);

        await connection.query(
          `INSERT INTO exam_results (
            exam_id, student_id, subject, marks_obtained, total_marks, percentage, grade, remarks, entered_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            marks_obtained = VALUES(marks_obtained), 
            total_marks = VALUES(total_marks),
            percentage = VALUES(percentage),
            grade = VALUES(grade),
            remarks = VALUES(remarks),
            entered_by = VALUES(entered_by)`,
          [
            examId,
            result.student_id,
            result.subject,
            result.marks_obtained,
            result.total_marks,
            percentage,
            grade,
            result.remarks,
            enteredBy,
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

  // Get results by exam
  static async getResultsByExam(examId) {
    const [rows] = await pool.query(
      `SELECT er.*, s.admission_no, s.roll_no, u.full_name as student_name
       FROM exam_results er
       JOIN students s ON er.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE er.exam_id = ?
       ORDER BY s.roll_no, er.subject`,
      [examId],
    );
    return rows;
  }

  // Get results by student
  static async getResultsByStudent(studentId, academicYear = null) {
    let query = `
      SELECT er.*, e.exam_name, e.exam_type, e.academic_year
      FROM exam_results er
      JOIN exams e ON er.exam_id = e.id
      WHERE er.student_id = ?
    `;
    const params = [studentId];

    if (academicYear) {
      query += " AND e.academic_year = ?";
      params.push(academicYear);
    }

    query += " ORDER BY e.start_date DESC, er.subject";

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get student report card
  static async getStudentReportCard(studentId, examId) {
    const [results] = await pool.query(
      `SELECT er.*, s.admission_no, s.roll_no, u.full_name,
              c.class_name, c.section, e.exam_name, e.exam_type
       FROM exam_results er
       JOIN students s ON er.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       JOIN exams e ON er.exam_id = e.id
       WHERE er.student_id = ? AND er.exam_id = ?
       ORDER BY er.subject`,
      [studentId, examId],
    );

    if (results.length === 0) return null;

    // Calculate totals
    const totalMarks = results.reduce((sum, r) => sum + r.marks_obtained, 0);
    const totalMaxMarks = results.reduce((sum, r) => sum + r.total_marks, 0);
    const overallPercentage = ((totalMarks / totalMaxMarks) * 100).toFixed(2);
    const overallGrade = this.calculateGrade(overallPercentage);

    return {
      student: {
        admission_no: results[0].admission_no,
        roll_no: results[0].roll_no,
        name: results[0].full_name,
        class: `${results[0].class_name} ${results[0].section || ""}`,
      },
      exam: {
        name: results[0].exam_name,
        type: results[0].exam_type,
      },
      subjects: results,
      summary: {
        totalMarks,
        totalMaxMarks,
        percentage: overallPercentage,
        grade: overallGrade,
      },
    };
  }

  // Calculate grade based on percentage
  static calculateGrade(percentage) {
    const pct = parseFloat(percentage);
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  }

  // Get class rankings for an exam
  static async getClassRankings(examId) {
    const [rows] = await pool.query(
      `SELECT 
        s.id as student_id,
        s.admission_no,
        s.roll_no,
        u.full_name,
        SUM(er.marks_obtained) as total_marks,
        SUM(er.total_marks) as max_marks,
        ROUND((SUM(er.marks_obtained) / SUM(er.total_marks)) * 100, 2) as percentage
       FROM exam_results er
       JOIN students s ON er.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE er.exam_id = ?
       GROUP BY s.id
       ORDER BY percentage DESC`,
      [examId],
    );

    // Add rank
    return rows.map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
  }
}

module.exports = ExamModel;
