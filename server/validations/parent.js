const { body } = require("express-validator");

const parentValidation = {
  createParent: [
    body("username")
      .notEmpty()
      .trim()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),

    body("email")
      .notEmpty()
      .trim()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    body("full_name").notEmpty().trim().withMessage("Full name is required"),

    body("phone")
      .notEmpty()
      .trim()
      .withMessage("Phone number is required")
      .isMobilePhone()
      .withMessage("Please provide a valid phone number"),

    body("address").optional().trim(),

    body("student_id").notEmpty().withMessage("Student ID is required"),

    body("relationship")
      .notEmpty()
      .trim()
      .withMessage("Relationship is required")
      .isIn(["father", "mother", "guardian", "other"])
      .withMessage("Invalid relationship type"),

    body("is_primary")
      .optional()
      .isBoolean()
      .withMessage("is_primary must be true or false"),
  ],

  updateParent: [
    body("is_primary")
      .notEmpty()
      .isBoolean()
      .withMessage("Please  provide is_primary"),
    body("relationship").notEmpty().withMessage("Please Provide relationship"),
  ],
};

module.exports = parentValidation;
