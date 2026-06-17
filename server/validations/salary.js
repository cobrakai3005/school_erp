const { body } = require("express-validator");

const salaryValidation = {
  createSalaryRecord: [
    body("staff_id").isInt().withMessage("Valid staff ID is required"),
    body("staff_type")
      .isIn(["teacher", "accountant", "other"])
      .withMessage("Valid staff type is required"),
    body("month")
      .isInt({ min: 1, max: 12 })
      .withMessage("Valid month is required"),
    body("year")
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Valid year is required"),
    body("basic_salary")
      .isFloat({ min: 0 })
      .withMessage("Valid basic salary is required"),
  ],
};

module.exports = salaryValidation;
