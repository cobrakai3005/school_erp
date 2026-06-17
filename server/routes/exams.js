const express = require("express");
const router = express.Router({ mergeParams: true });
const ExamController = require("../controllers/ExamController");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  isTeacher,
  checkPermission,
} = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

//  EXAMS

// Create exam (admin only)
router.post(
  "/",
  isSchoolAdmin,
  validationRules.createExam,
  handleValidationErrors,
  ExamController.create,
);

// Get all exams
router.get(
  "/",
  checkPermission("exams", "read"),
  validationRules.pagination,
  handleValidationErrors,
  ExamController.getAll,
);

// Get exam by ID
router.get(
  "/:id",
  checkPermission("exams", "read"),
  validationRules.idParam,
  handleValidationErrors,
  ExamController.getById,
);

// Update exam (admin only)
router.put(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  ExamController.update,
);

// Delete exam (admin only)
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  ExamController.delete,
);

//  EXAM RESULTS

// Add exam result (teacher or admin)
router.post("/results", isTeacher, ExamController.addResult);

// Add bulk results (teacher or admin)
router.post("/results/bulk", isTeacher, ExamController.addBulkResults);

// Get results by exam
router.get(
  "/:examId/results",
  checkPermission("exam_results", "read"),
  ExamController.getResultsByExam,
);

// Get results by student
router.get(
  "/results/student/:studentId",
  checkPermission("exam_results", "read"),
  ExamController.getResultsByStudent,
);

// Get student report card
router.get(
  "/results/student/:studentId/exam/:examId/report-card",
  checkPermission("exam_results", "read"),
  ExamController.getReportCard,
);

// Get class rankings
router.get(
  "/:examId/rankings",
  checkPermission("exams", "read"),
  ExamController.getClassRankings,
);

module.exports = router;
