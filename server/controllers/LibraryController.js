const LibraryModel = require("../models/LibraryModel");

class LibraryController {
  //  BOOKS

  // Create book
  static async createBook(req, res) {
    try {
      const bookData = req.body;
      const schoolId = req.schoolId;

      const bookId = await LibraryModel.createBook({
        ...bookData,
        school_id: schoolId,
      });

      res.status(201).json({
        success: true,
        message: "Book added successfully",
        data: { id: bookId },
      });
    } catch (error) {
      console.error("Create Book Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }

  // Get all books
  static async getBooks(req, res) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;

      const result = await LibraryModel.getBooks(
        parseInt(page),
        parseInt(limit),
        { category, status, search },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Books Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get book by ID
  static async getBookById(req, res) {
    try {
      const { id } = req.params;

      const book = await LibraryModel.getBookById(id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      console.error("Get Book Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update book
  static async updateBook(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No Data Provided",
        });
      }
      const book = await LibraryModel.getBookById(id);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      await LibraryModel.updateBook(id, updateData);

      res.json({
        success: true,
        message: "Book updated successfully",
      });
    } catch (error) {
      console.error("Update Book Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete book
  static async deleteBook(req, res) {
    try {
      const { id } = req.params;

      await LibraryModel.deleteBook(id);

      res.json({
        success: true,
        message: "Book deleted successfully",
      });
    } catch (error) {
      console.error("Delete Book Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //  BOOK ISSUES

  // Issue book
  static async issueBook(req, res) {
    try {
      const issueData = req.body;
      const schoolId = req.schoolId;

      const issueId = await LibraryModel.issueBook({
        ...issueData,
        school_id: schoolId,
        issue_date:
          issueData.issue_date || new Date().toISOString().split("T")[0],
        issued_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Book issued successfully",
        data: { id: issueId },
      });
    } catch (error) {
      console.error("Issue Book Error:", error);
      if (error.message === "Book not available") {
        return res.status(400).json({
          success: false,
          message: "Book is not available",
        });
      }
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Return book
  static async returnBook(req, res) {
    try {
      const { id } = req.params;
      const { fine_amount } = req.body;

      await LibraryModel.returnBook(id, fine_amount || 0);

      res.json({
        success: true,
        message: "Book returned successfully",
      });
    } catch (error) {
      console.error("Return Book Error:", error);
      if (error.message === "Issue record not found or already returned") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get issued books
  static async getIssuedBooks(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 10, status, student_id, book_id } = req.query;

      const result = await LibraryModel.getIssuedBooks(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { status, student_id, book_id },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Issued Books Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get overdue books
  static async getOverdueBooks(req, res) {
    try {
      const schoolId = req.schoolId;

      const overdueBooks = await LibraryModel.getOverdueBooks(schoolId);

      res.json({
        success: true,
        data: overdueBooks,
      });
    } catch (error) {
      console.error("Get Overdue Books Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get books issued to a student
  static async getStudentBooks(req, res) {
    try {
      const { studentId } = req.params;

      const books = await LibraryModel.getStudentBooks(studentId);

      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("Get Student Books Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Pay fine
  static async payFine(req, res) {
    try {
      const { id } = req.params;

      await LibraryModel.payFine(id);

      res.json({
        success: true,
        message: "Fine paid successfully",
      });
    } catch (error) {
      console.error("Pay Fine Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = LibraryController;
