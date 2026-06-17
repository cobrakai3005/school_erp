const express = require("express");
const router = express.Router({ mergeParams: true });
const TeacherController = require("../controllers/TeacherController");
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
const upload = require("../middleware/upload");
// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Create teacher (admin only)
router.post(
  "/",
  isSchoolAdmin,
  upload.single("profile_image"),
  handleValidationErrors,
  TeacherController.create,
);

// Get all teachers
router.get(
  "/",
  checkPermission("teachers", "read"),
  validationRules.pagination,
  handleValidationErrors,
  TeacherController.getAll,
);

// Get teacher by ID
router.get(
  "/:id",
  checkPermission("teachers", "read"),
  validationRules.idParam,
  handleValidationErrors,
  TeacherController.getById,
);

// Update teacher (admin only)
router.put(
  "/:id",
  isSchoolAdmin,
  upload.single("profile_image"),
  validationRules.idParam,
  handleValidationErrors,
  TeacherController.update,
);

// Delete teacher (admin only)
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  TeacherController.delete,
);

// Get teacher timetable
router.get(
  "/:id/timetable",
  checkPermission("timetable", "read"),
  validationRules.idParam,
  handleValidationErrors,
  TeacherController.getTimetable,
);

// Get assigned classes
router.get(
  "/:id/classes",
  checkPermission("classes", "read"),
  validationRules.idParam,
  handleValidationErrors,
  TeacherController.getAssignedClasses,
);

module.exports = router;
