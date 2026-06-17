const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");
const {
  verifyToken,
  setSchoolContext,
  isSuperAdmin,
  isSchoolAdmin,
  isTeacher,
  isStudent,
  checkPermission,
  isAccountantFee,
  isAccountantSalary,
  isLibrarian,
  isTransportManager,
  isParent,
} = require("../middleware/auth");

// Super Admin Dashboard
router.get(
  "/super-admin",
  verifyToken,
  isSuperAdmin,
  DashboardController.getSuperAdminStats,
);

// School Admin Dashboard
router.get(
  "/admin",
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  DashboardController.getAdminStats,
);

// Teacher Dashboard
router.get(
  "/teacher",
  verifyToken,
  setSchoolContext,
  isTeacher,
  DashboardController.getTeacherStats,
);

// Student Dashboard
router.get(
  "/student",
  verifyToken,
  setSchoolContext,
  isStudent,
  DashboardController.getStudentStats,
);

// Fee Accountant Dashboard
router.get(
  "/accountant-fee",
  verifyToken,
  setSchoolContext,
  checkPermission("fee_payments", "read"),
  isAccountantFee,
  DashboardController.getAccountantFeeStats,
);

// Salary Accountant Dashboard
router.get(
  "/accountant-salary",
  verifyToken,
  setSchoolContext,
  checkPermission("salary", "read"),
  isAccountantSalary,
  DashboardController.getAccountantSalaryStats,
);

// Librarian Dashboard
router.get(
  "/librarian",

  verifyToken,
  setSchoolContext,
  checkPermission("library", "read"),
  isLibrarian,
  DashboardController.getLibrarianStats,
);
// Librarian Dashboard
router.get(
  "/parent",
  verifyToken,
  setSchoolContext,
  isParent,
  DashboardController.getParentStats,
);
router.get(
  "/transport_manager",
  verifyToken,
  setSchoolContext,
  isTransportManager,
  DashboardController.getTransportStats,
);

module.exports = router;
