const { body, param } = require("express-validator");

const schoolValidation = {
  createSchool: [
    body("school_code")
      .notEmpty()
      .trim()
      .withMessage("School code is required"),
    body("school_name")
      .notEmpty()
      .trim()
      .withMessage("School name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("database_name")
      .notEmpty()
      .trim()
      .withMessage("Database name is required"),
  ],

  updateSchool: [
    param("id").isInt().withMessage("Valid school ID is required"),
    body("school_name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("School name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
  ],
};

module.exports = schoolValidation;
