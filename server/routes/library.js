const express = require("express");
const router = express.Router({ mergeParams: true });
const LibraryController = require("../controllers/LibraryController");
const {
  verifyToken,
  setSchoolContext,
  isLibrarian,
  checkPermission,
} = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

//  BOOKS

// Create book (librarian only)
router.post(
  "/books",
  isLibrarian,
  validationRules.createBook,
  handleValidationErrors,
  LibraryController.createBook,
);

// Get all books
router.get(
  "/books",
  checkPermission("library", "read"),
  validationRules.pagination,
  handleValidationErrors,
  LibraryController.getBooks,
);

// Get book by ID
router.get(
  "/books/:id",
  checkPermission("library", "read"),
  validationRules.idParam,
  handleValidationErrors,
  LibraryController.getBookById,
);

// Update book (librarian only)
router.put(
  "/books/:id",
  isLibrarian,
  validationRules.idParam,
  handleValidationErrors,
  LibraryController.updateBook,
);

// Delete book (librarian only)
router.delete(
  "/books/:id",
  isLibrarian,
  validationRules.idParam,
  handleValidationErrors,
  LibraryController.deleteBook,
);

//  BOOK ISSUES

// Issue book (librarian only)
router.post(
  "/issues",
  isLibrarian,
  validationRules.issueBook,
  handleValidationErrors,
  LibraryController.issueBook,
);

// Return book (librarian only)
router.post(
  "/issues/:id/return",
  isLibrarian,
  validationRules.idParam,
  handleValidationErrors,
  LibraryController.returnBook,
);

// Get issued books
router.get(
  "/issues",
  checkPermission("library", "read"),
  validationRules.pagination,
  handleValidationErrors,
  LibraryController.getIssuedBooks,
);

// Get overdue books (librarian only)
router.get("/issues/overdue", isLibrarian, LibraryController.getOverdueBooks);

// Get books issued to a student
router.get(
  "/issues/student/:studentId",
  checkPermission("library", "read"),
  LibraryController.getStudentBooks,
);

// Pay fine (librarian only)
router.post(
  "/issues/:id/pay-fine",
  isLibrarian,
  validationRules.idParam,
  handleValidationErrors,
  LibraryController.payFine,
);

module.exports = router;
