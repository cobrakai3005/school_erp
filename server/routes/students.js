const express = require("express");
const router = express.Router({ mergeParams: true });
const StudentController = require("../controllers/StudentController");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Create student (admin only)
router.post(
  "/",
  isSchoolAdmin,
  upload.single("profile_image"),
  validationRules.createStudent,
  handleValidationErrors,
  StudentController.create,
);

// Get all students
router.get(
  "/",
  checkPermission("students", "read"),
  validationRules.pagination,
  handleValidationErrors,
  StudentController.getAll,
);

// Get students by class
router.get(
  "/class/:classId",
  checkPermission("students", "read"),
  StudentController.getByClass,
);

// Get student by ID
router.get(
  "/:id",
  checkPermission("students", "read"),
  validationRules.idParam,
  handleValidationErrors,
  StudentController.getById,
);

// Update student (admin only)
router.put(
  "/:id",
  upload.single("profile_image"),
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  StudentController.update,
);

// Delete student (admin only)
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  StudentController.delete,
);

// Get student fee dues
router.get(
  "/:id/fee-dues",
  checkPermission("fee_payments", "read"),
  validationRules.idParam,
  handleValidationErrors,
  StudentController.getFeeDues,
);

module.exports = router;
