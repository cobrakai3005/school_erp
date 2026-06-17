const { body, param } = require("express-validator");

const userValidation = {
  createUser: [
    body("user_type")
      .isIn([
        "admin",
        "teacher",
        "accountant_fee",
        "accountant_salary",
        "student",
        "parent",
        "librarian",
        "transport_manager",
      ])
      .withMessage("Valid user type is required"),
    body("username").notEmpty().trim().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("full_name").notEmpty().trim().withMessage("Full name is required"),
  ],

  updateUser: [
    param("id").isInt().withMessage("Valid user ID is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("full_name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Full name cannot be empty"),
  ],
};

module.exports = userValidation;
