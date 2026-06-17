const express = require("express");
const HomeworkController = require("../controllers/HomeworkController");

const router = express.Router({ mergeParams: true });

const {
  verifyToken,
  setSchoolContext,
  isTeacher,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");

const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

const upload = require("../middleware/upload");

// All routes require authentication + school context
router.use(verifyToken, setSchoolContext);

// HOMEWORK

// Create homework
router.post(
  "/",
  isTeacher,
  upload.single("attachment"),
  handleValidationErrors,
  HomeworkController.create,
);

// Get all homework
router.get("/", checkPermission("homework", "read"), HomeworkController.getAll);

// Get homework by ID
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  checkPermission("homework", "read"),
  HomeworkController.getById,
);

// Update homework
router.put(
  "/:id",
  isTeacher,
  upload.single("attachment"),
  validationRules.idParam,
  //   validationRules.updateHomework,
  handleValidationErrors,
  HomeworkController.update,
);

// Delete homework
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  HomeworkController.delete,
);

router.get(
  "/class/:classId",
  validationRules.classIdParam,
  handleValidationErrors,
  HomeworkController.getByClass,
);
router.get(
  "/teachers/:teacherId",
  isTeacher,
  validationRules.teacherIdParam,
  handleValidationErrors,
  HomeworkController.getByTeacher,
);

module.exports = router;
