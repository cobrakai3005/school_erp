const { pool } = require("../config/database");

class ExamResultModel {
  //  CREATE RESULT
  static async create(data) {
    const {
      exam_id,
      student_id,
      subject,
      marks_obtained,
      total_marks,
      percentage,
      grade,
      remarks,
      entered_by,
    } = data;

    const query = `
      INSERT INTO exam_results 
      (exam_id, student_id, subject, marks_obtained, total_marks, percentage, grade, remarks, entered_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      exam_id,
      student_id,
      subject,
      marks_obtained,
      total_marks,
      percentage,
      grade,
      remarks,
      entered_by,
    ]);

    return result.insertId;
  }

  //  BULK INSERT
  static async createBulk(examId, results, enteredBy) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const r of results) {
        const percentage = r.total_marks
          ? (r.marks_obtained / r.total_marks) * 100
          : null;

        await connection.execute(
          `
  INSERT INTO exam_results 
  (exam_id, student_id, subject, marks_obtained, total_marks, percentage, grade, remarks, entered_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    marks_obtained = VALUES(marks_obtained),
    total_marks = VALUES(total_marks),
    percentage = VALUES(percentage),
    grade = VALUES(grade),
    remarks = VALUES(remarks),
    entered_by = VALUES(entered_by)
`,
          [
            examId,
            r.student_id,
            r.subject,
            r.marks_obtained,
            r.total_marks,
            percentage,
            r.grade,
            r.remarks ?? null,
            enteredBy,
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  //  GET BY EXAM
  static async getByExam(examId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let query = `
    SELECT 
      er.*,
      u.full_name AS student_name
    FROM exam_results er
    JOIN students s ON s.id = er.student_id
    JOIN users u ON u.id = s.user_id
    WHERE er.exam_id = ?
  `;

    let values = [examId];

    // 🔍 SEARCH
    if (filters.search && filters.search.trim() !== "") {
      query += ` AND (er.subject LIKE ? OR u.full_name LIKE ?)`;
      values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // 🎯 SUBJECT FILTER
    if (filters.subject) {
      query += ` AND er.subject = ?`;
      values.push(filters.subject);
    }

    // 🎯 STUDENT FILTER
    if (filters.student_id) {
      query += ` AND er.student_id = ?`;
      values.push(Number(filters.student_id));
    }

    // 🎯 GRADE FILTER
    if (filters.grade) {
      query += ` AND er.grade = ?`;
      values.push(filters.grade);
    }

    //  FINAL ORDER + PAGINATION (ONLY ONCE)
    query += ` ORDER BY er.student_id, er.subject LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

    const [rows] = await pool.execute(query, values);

    // ================= COUNT QUERY =================
    let countQuery = `
    SELECT COUNT(*) as total
    FROM exam_results er
    JOIN students s ON s.id = er.student_id
    JOIN users u ON u.id = s.user_id
    WHERE er.exam_id = ?
  `;

    let countValues = [examId];

    if (filters.search && filters.search.trim() !== "") {
      countQuery += ` AND (er.subject LIKE ? OR u.full_name LIKE ?)`;
      countValues.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.subject) {
      countQuery += ` AND er.subject = ?`;
      countValues.push(filters.subject);
    }

    if (filters.student_id) {
      countQuery += ` AND er.student_id = ?`;
      countValues.push(Number(filters.student_id));
    }

    if (filters.grade) {
      countQuery += ` AND er.grade = ?`;
      countValues.push(filters.grade);
    }

    const [countResult] = await pool.execute(countQuery, countValues);

    return {
      data: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }
  //  GET BY STUDENT
  static async getByStudent(studentId) {
    const query = `
    SELECT 
      er.*,
      e.exam_name,
      u.full_name AS student_name
    FROM exam_results er
    JOIN exams e ON e.id = er.exam_id
    JOIN students s ON s.id = er.student_id
    JOIN users u ON u.id = s.user_id
    WHERE er.student_id = ?
    ORDER BY er.entered_at DESC
  `;

    const [rows] = await pool.execute(query, [studentId]);
    return rows;
  }

  //  REPORT CARD
  static async getReportCard(studentId, examId) {
    const query = `
    SELECT 
      er.*,
      u.full_name AS student_name,
      e.exam_name
    FROM exam_results er
    JOIN students s ON s.id = er.student_id
    JOIN users u ON u.id = s.user_id
    JOIN exams e ON e.id = er.exam_id
    WHERE er.student_id = ? AND er.exam_id = ?
  `;

    const [rows] = await pool.execute(query, [studentId, examId]);
    return rows;
  }

  //  UPDATE RESULT
  static async update(id, data = {}) {
    const fields = [];
    const values = [];

    if (data.marks_obtained !== undefined) {
      fields.push("marks_obtained = ?");
      values.push(data.marks_obtained);
    }

    if (data.total_marks !== undefined) {
      fields.push("total_marks = ?");
      values.push(data.total_marks);
    }

    if (data.marks_obtained !== undefined && data.total_marks !== undefined) {
      const percentage = (data.marks_obtained / data.total_marks) * 100;

      fields.push("percentage = ?");
      values.push(percentage);
    } else if (data.percentage !== undefined) {
      fields.push("percentage = ?");
      values.push(data.percentage);
    }

    if (data.grade !== undefined) {
      fields.push("grade = ?");
      values.push(data.grade);
    }

    if (data.remarks !== undefined) {
      fields.push("remarks = ?");
      values.push(data.remarks);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided for update");
    }

    const query = `
    UPDATE exam_results
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

    values.push(id);

    await pool.execute(query, values);
  }

  //  DELETE RESULT
  static async delete(id) {
    await pool.execute(`DELETE FROM exam_results WHERE id = ?`, [id]);
  }
}

module.exports = ExamResultModel;
