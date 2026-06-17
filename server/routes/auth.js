const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { verifyToken } = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
  body,
} = require("../middleware/validation");

// Super Admin Login
router.post(
  "/super-admin/login",
  validationRules.superAdminLogin,
  handleValidationErrors,
  AuthController.superAdminLogin,
);

// School User Login
router.post(
  "/login",
  validationRules.login,
  handleValidationErrors,
  AuthController.login,
);

// Get current user profile (protected)
router.get("/profile", verifyToken, AuthController.getProfile);

// Change password (protected)
router.put(
  "/change-password",
  verifyToken,
  [
    body("current_password")
      .notEmpty()
      .withMessage("Current password is required"),
    body("new_password")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  handleValidationErrors,
  AuthController.changePassword,
);

// Create Super Admin (initial setup or by existing super admin)
router.post(
  "/super-admin/register",
  [
    body("username").notEmpty().trim().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("full_name").notEmpty().trim().withMessage("Full name is required"),
  ],
  handleValidationErrors,
  AuthController.createSuperAdmin,
);

module.exports = router;
