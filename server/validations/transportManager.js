const { body } = require("express-validator");

const transportManagerValidation = {
  // Create Transport Manager
  createTransportManager: [
    // Employee Details
    body("employee_id")
      .notEmpty()
      .trim()
      .withMessage("Employee ID is required"),

    // User Details
    body("full_name").notEmpty().trim().withMessage("Full name is required"),

    body("email")
      .notEmpty()
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("phone").notEmpty().trim().withMessage("Phone number is required"),

    body("address").optional().trim(),

    body("username").optional().trim(),

    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("profile_image").optional().trim(),

    // Professional Info
    body("designation").optional().trim(),

    body("department").optional().trim(),

    body("qualification").optional().trim(),

    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience years must be a positive number"),

    // Contact
    body("emergency_contact").optional().trim(),

    // Joining
    body("joining_date")
      .optional()
      .isDate()
      .withMessage("Joining date must be valid"),

    // Status
    body("status")
      .optional()
      .isIn(["active", "inactive", "on_leave"])
      .withMessage("Invalid status value"),
  ],

  // Update Transport Manager
  updateTransportManager: [
    body("employee_id").optional().trim(),

    body("full_name").optional().trim(),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("phone").optional().trim(),

    body("address").optional().trim(),

    body("username").optional().trim(),

    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("profile_image").optional().trim(),

    body("designation").optional().trim(),

    body("department").optional().trim(),

    body("qualification").optional().trim(),

    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience years must be a positive number"),

    body("emergency_contact").optional().trim(),

    body("joining_date")
      .optional()
      .isDate()
      .withMessage("Joining date must be valid"),

    body("status")
      .optional()
      .isIn(["active", "inactive", "on_leave"])
      .withMessage("Invalid status value"),
  ],
};

module.exports = transportManagerValidation;
