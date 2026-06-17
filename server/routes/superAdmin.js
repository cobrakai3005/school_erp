const express = require("express");
const router = express.Router();
const SuperAdminController = require("../controllers/SuperAdminController.js");
const {
  verifyToken,
  isSuperAdmin,
  setSchoolContext,
} = require("../middleware/auth");
const { body, param } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validation.js");

// All routes require authentication and super admin privileges
router.use(verifyToken, setSchoolContext, isSuperAdmin);

// System stats
router.get("/stats", SuperAdminController.getSystemStats);

// Schools management
router.get("/schools", SuperAdminController.getSchools);
router.get("/schools/:schoolId/switch", SuperAdminController.switchSchool);

// All users management across schools
router.get("/students", SuperAdminController.getAllStudents);
router.get("/teachers", SuperAdminController.getAllTeachers);
router.get("/staff", SuperAdminController.getAllStaff);
router.get("/admins", SuperAdminController.getAllAdmins);
router.get("/classes", SuperAdminController.getAllClasses);

router.post(
  "/admins",
  [
    body("school_id").isInt().withMessage("Valid school is required"),
    body("full_name").notEmpty().trim().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("username")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Username cannot be empty"),
    body("phone").optional().trim(),
    body("address").optional().trim(),
    body("designation").optional().trim(),
    body("join_date")
      .optional({ values: "falsy" })
      .isDate()
      .withMessage("Valid join date is required"),
  ],
  handleValidationErrors,
  SuperAdminController.createAdmin,
);
router.patch(
  "/admins/:id/status",
  [
    param("id").isInt().withMessage("Valid admin ID is required"),
    body("status")
      .isIn(["active", "inactive", "blocked"])
      .withMessage("Valid status is required"),
  ],
  handleValidationErrors,
  SuperAdminController.updateAdminStatus,
);

module.exports = router;
