const { body, param } = require("express-validator");

const accountantValidation = {
  createAccountant: [
    body("employee_id").notEmpty().withMessage("Employee ID is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("username").optional().trim(),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("full_name").notEmpty().trim().withMessage("Full name is required"),
    body("phone").optional().trim(),
    body("address").optional().trim(),
    body("designation").optional().trim(),
    body("type").optional().trim(),
    body("joining_date")
      .optional()
      .isISO8601()
      .withMessage("Valid joining date is required"),
    body("salary")
      .optional()
      .isNumeric()
      .withMessage("Salary must be a number"),
  ],

  idParam: [param("id").isInt().withMessage("Valid ID is required")]
};

module.exports = accountantValidation;
