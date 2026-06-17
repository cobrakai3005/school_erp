const express = require("express");
const router = express.Router();

const ExamResultController = require("../controllers/ExamResultController");
const {
  verifyToken,
  setSchoolContext,
  isTeacher,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");
const validate = require("../validations/examResultValidation");
const {
  handleValidationErrors,
  validationRules,
} = require("../middleware/validation");
router.use(verifyToken, setSchoolContext);

//  CREATE
router.post(
  "/",
  isTeacher,

  validate.createResult,
  handleValidationErrors,
  ExamResultController.create,
);

//  BULK INSERT
router.post(
  "/bulk",
  isTeacher,
  validate.bulkResults,
  handleValidationErrors,

  ExamResultController.createBulk,
);

//  GET BY EXAM
router.get(
  "/exam/:examId",
  checkPermission("exam_results", "read"),
  validate.examIdParam,
  handleValidationErrors,
  ExamResultController.getByExam,
);

//  GET BY STUDENT
router.get(
  "/student/:studentId",
  checkPermission(
    "exam_results",

    "read",
  ),
  validate.studentIdParam,
  handleValidationErrors,
  ExamResultController.getByStudent,
);

//  REPORT CARD
router.get(
  "/student/:studentId/exam/:examId",
  checkPermission("exam_results", "read"),
  validate.examIdParam,
  validate.studentIdParam,
  handleValidationErrors,
  ExamResultController.getReportCard,
);

//  UPDATE
router.put(
  "/:id",
  isTeacher,
  validate.updateResult,
  handleValidationErrors,
  ExamResultController.update,
);

//  DELETE
router.delete("/:id", isSchoolAdmin, ExamResultController.delete);

module.exports = router;
