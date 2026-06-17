const express = require("express");

const HomeworkSubmissionController = require("../controllers/HomeworkSubmissionController");

const router = express.Router({
  mergeParams: true,
});

const {
  verifyToken,
  setSchoolContext,
  isTeacher,
  isStudent,
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

// Get student's own submissions
router.get(
  "/my-submissions",
  isStudent,
  HomeworkSubmissionController.getMySubmissions,
);

// Create homework submission
router.post(
  "/",
  isStudent,
  upload.single("attachment"),
  validationRules.createHomeworkSubmission,
  handleValidationErrors,
  HomeworkSubmissionController.create,
);

// Get all homework submissions - teachers and admins can view
router.get(
  "/",
  (req, res, next) => {
    const userType = req.user?.user_type;
    const isSuperAdmin = req.user?.isSuperAdmin;

    if (userType === "teacher" || userType === "admin" || isSuperAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  },
  HomeworkSubmissionController.getAll,
);

// Get homework submission by ID - teachers and admins can view
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  (req, res, next) => {
    const userType = req.user?.user_type;
    const isSuperAdmin = req.user?.isSuperAdmin;

    if (userType === "teacher" || userType === "admin" || isSuperAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  },
  HomeworkSubmissionController.getById,
);

// Update homework submission
router.put(
  "/:id",
  isStudent,
  upload.single("attachment"),
  validationRules.idParam,
  handleValidationErrors,
  HomeworkSubmissionController.update,
);

// Delete homework submission
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  HomeworkSubmissionController.delete,
);

// Grade a homework submission (teachers and admins only)
router.put(
  "/:id/grade",
  (req, res, next) => {
    const userType = req.user?.user_type;
    const isSuperAdmin = req.user?.isSuperAdmin;

    if (userType === "teacher" || userType === "admin" || isSuperAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied - only teachers and admins can grade",
    });
  },
  validationRules.idParam,
  handleValidationErrors,
  HomeworkSubmissionController.grade,
);

// Get submissions by homework ID
router.get(
  "/homework/:homeworkId",
  (req, res, next) => {
    const userType = req.user?.user_type;
    const isSuperAdmin = req.user?.isSuperAdmin;

    if (userType === "teacher" || userType === "admin" || isSuperAdmin) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  },
  HomeworkSubmissionController.getByHomework,
);

module.exports = router;
