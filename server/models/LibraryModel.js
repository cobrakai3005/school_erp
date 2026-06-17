const { pool } = require("../config/database");

class LibraryModel {
  //  BOOKS

  // Create book
  static async createBook(data) {
    const {
      school_id,
      book_code,
      isbn,
      title,
      author,
      publisher,
      edition,
      year_of_publication,
      category,
      rack_no,
      quantity,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO library_books (
        book_code, isbn, title, author, publisher, edition, 
        year_of_publication, category, rack_no, quantity, available_quantity,school_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book_code,
        isbn,
        title,
        author,
        publisher,
        edition,
        year_of_publication,
        category,
        rack_no,
        quantity || 1,
        quantity || 1,
        school_id,
      ],
    );
    return result.insertId;
  }

  // Get all books
  static async getBooks(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM library_books WHERE 1=1";
    const params = [];

    if (filters.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }

    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      query +=
        " AND (title LIKE ? OR author LIKE ? OR book_code LIKE ? OR isbn LIKE ?)";
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");
    const [countResult] = await pool.query(countQuery, params);

    query += " ORDER BY title ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
      books: rows,
      pagination: {
        total: countResult[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get book by ID
  static async getBookById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM library_books WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  // Update book
  static async updateBook(id, data) {
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
      `UPDATE library_books SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return true;
  }

  // Delete book
  static async deleteBook(id) {
    const [result] = await pool.query(
      "DELETE FROM library_books WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  //  BOOK ISSUES

  // Issue book
  static async issueBook(data) {
    const { school_id, book_id, student_id, issue_date, due_date, issued_by } =
      data;

    // Start transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if book is available
      const [book] = await connection.query(
        "SELECT available_quantity FROM library_books WHERE id = ? FOR UPDATE",
        [book_id],
      );

      if (book.length === 0 || book[0].available_quantity < 1) {
        throw new Error("Book not available");
      }

      // Create issue record
      const [result] = await connection.query(
        `INSERT INTO library_issues (school_id, book_id, student_id, issue_date, due_date, issued_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [school_id, book_id, student_id, issue_date, due_date, issued_by],
      );

      // Update book availability
      await connection.query(
        "UPDATE library_books SET available_quantity = available_quantity - 1 WHERE id = ?",
        [book_id],
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Return book
  static async returnBook(issueId, fineAmount = 0) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get issue record
      const [issue] = await connection.query(
        "SELECT book_id FROM library_issues WHERE id = ? AND status = ?",
        [issueId, "issued"],
      );

      if (issue.length === 0) {
        throw new Error("Issue record not found or already returned");
      }

      // Update issue record
      await connection.query(
        `UPDATE library_issues 
         SET status = ?, return_date = CURDATE(), fine_amount = ?
         WHERE id = ?`,
        ["returned", fineAmount, issueId],
      );

      // Update book availability
      await connection.query(
        "UPDATE library_books SET available_quantity = available_quantity + 1 WHERE id = ?",
        [issue[0].book_id],
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get issued books by school
  static async getIssuedBooks(schoolId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    let baseQuery = `
    FROM library_issues li
    JOIN library_books lb ON li.book_id = lb.id
    JOIN students s ON li.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN users iu ON li.issued_by = iu.id
    WHERE li.school_id = ?
  `;

    const params = [schoolId];

    if (filters.status) {
      baseQuery += ` AND li.status = ?`;
      params.push(filters.status);
    }

    if (filters.student_id) {
      baseQuery += ` AND li.student_id = ?`;
      params.push(filters.student_id);
    }

    if (filters.book_id) {
      baseQuery += ` AND li.book_id = ?`;
      params.push(filters.book_id);
    }

    if (filters.search) {
      baseQuery += `
      AND (
        lb.title LIKE ?
        OR lb.book_code LIKE ?
        OR lb.author LIKE ?
        OR u.full_name LIKE ?
        OR s.admission_no LIKE ?
      )
    `;

      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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
      li.*,
      lb.title,
      lb.book_code,
      lb.author,
      s.admission_no,
      u.full_name AS student_name,
      iu.full_name AS issued_by_name
    ${baseQuery}
    ORDER BY li.issue_date DESC
    LIMIT ? OFFSET ?
  `;

    const dataParams = [...params, Number(limit), Number(offset)];

    const [rows] = await pool.query(dataQuery, dataParams);

    return {
      issues: rows,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  }

  // Get overdue books
  static async getOverdueBooks(schoolId) {
    const [rows] = await pool.query(
      `SELECT li.*, lb.title, lb.book_code,
              s.admission_no, u.full_name as student_name, u.phone
       FROM library_issues li
       JOIN library_books lb ON li.book_id = lb.id
       JOIN students s ON li.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE li.school_id = ? AND li.status = ? AND li.due_date < CURDATE()
       ORDER BY li.due_date`,
      [schoolId, "issued"],
    );
    return rows;
  }

  // Get books issued to a student
  static async getStudentBooks(studentId) {
    const [rows] = await pool.query(
      `SELECT li.*, lb.title, lb.book_code, lb.author
       FROM library_issues li
       JOIN library_books lb ON li.book_id = lb.id
       WHERE li.student_id = ? AND li.status = ?
       ORDER BY li.due_date`,
      [studentId, "issued"],
    );
    return rows;
  }

  // Pay fine
  static async payFine(issueId) {
    await pool.query(
      "UPDATE library_issues SET fine_paid = TRUE WHERE id = ?",
      [issueId],
    );
    return true;
  }
}

module.exports = LibraryModel;
