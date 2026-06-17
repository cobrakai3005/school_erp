const express = require("express");

const router = express.Router({ mergeParams: true });

const TransportStudentController = require("../controllers/TransportStudentController");
const {
  createAssignment,
  updateAssignment,
} = require("../validations/transportStudentValidation");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");

const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// Auth
router.use(verifyToken, setSchoolContext);

// Assign Student
router.post(
  "/",
  isSchoolAdmin,
  createAssignment,
  handleValidationErrors,
  TransportStudentController.create,
);

// Get All Assignments
router.get(
  "/",
  checkPermission("transport", "read"),
  validationRules.pagination,
  handleValidationErrors,
  TransportStudentController.getAll,
);

// Get Assignment By ID
router.get(
  "/:id",
  checkPermission("transport", "read"),
  validationRules.idParam,
  handleValidationErrors,
  TransportStudentController.getById,
);

// Get Student Routes
router.get(
  "/student/:studentId",
  checkPermission("transport", "read"),
  handleValidationErrors,
  TransportStudentController.getByStudent,
);

// Update Assignment
router.put(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  updateAssignment,
  handleValidationErrors,
  TransportStudentController.update,
);

// Delete Assignment
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  TransportStudentController.delete,
);

module.exports = router;
