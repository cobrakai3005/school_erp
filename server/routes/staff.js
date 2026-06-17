const express = require("express");
const router = express.Router({ mergeParams: true });
const StaffController = require("../controllers/StaffController");
const {
  verifyToken,
  setSchoolContext,
  isAccountantSalary,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Get all staff (teachers + accountants) for salary management
router.get("/", isAccountantSalary, StaffController.getAllStaff);

// Get staff counts by type
router.get("/counts", isAccountantSalary, StaffController.getStaffCounts);

// Get staff by ID
router.get(
  "/:id",
  checkPermission("salary", "read"),
  StaffController.getStaffById,
);

// Get staff salary history
router.get(
  "/:id/salary-history",
  checkPermission("salary", "read"),
  StaffController.getStaffSalaryHistory,
);

module.exports = router;
