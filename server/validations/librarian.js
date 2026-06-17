const { body, param } = require("express-validator");

const librarianValidation = {
  createLibrarian: [
    body("employee_id")
      .notEmpty()
      .trim()
      .withMessage("Employee ID is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Employee ID must be between 2 and 50 characters"),

    body("username")
      .notEmpty()
      .trim()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3 and 50 characters"),

    body("email")
      .notEmpty()
      .trim()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email is required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),

    body("full_name")
      .notEmpty()
      .trim()
      .withMessage("Full name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),

    body("phone")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Phone number must be between 10 and 20 characters"),

    body("address")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Address cannot exceed 500 characters"),

    body("designation")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Designation cannot exceed 100 characters"),

    body("department")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Department cannot exceed 100 characters"),

    body("qualification")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Qualification cannot exceed 255 characters"),

    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience years must be a positive number"),

    body("specialization")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Specialization cannot exceed 255 characters"),

    body("joining_date")
      .optional()
      .isDate()
      .withMessage("Joining date must be a valid date"),

    body("status")
      .optional()
      .isIn(["active", "inactive", "on_leave"])
      .withMessage("Invalid status"),
  ],

  updateLibrarian: [
    param("id").isInt({ min: 1 }).withMessage("Invalid librarian ID"),

    body("full_name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Full name must be between 2 and 100 characters"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Valid email is required"),

    body("phone")
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage("Phone number must be between 10 and 20 characters"),

    body("address")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Address cannot exceed 500 characters"),

    body("designation")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Designation cannot exceed 100 characters"),

    body("department")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Department cannot exceed 100 characters"),

    body("qualification")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Qualification cannot exceed 255 characters"),

    body("experience_years")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience years must be a positive number"),

    body("specialization")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Specialization cannot exceed 255 characters"),

    body("joining_date")
      .optional()
      .isDate()
      .withMessage("Joining date must be a valid date"),

    body("status")
      .optional()
      .isIn(["active", "inactive", "on_leave"])
      .withMessage("Invalid status"),
  ],

  librarianId: [
    param("id").isInt({ min: 1 }).withMessage("Invalid librarian ID"),
  ],
};

module.exports = librarianValidation;
