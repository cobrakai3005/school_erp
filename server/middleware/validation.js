const { validationResult, body, param, query } = require("express-validator");

const authValidation = require("../validations/auth");
const schoolValidation = require("../validations/school");
const userValidation = require("../validations/user");
const accountantValidation = require("../validations/accountant");
const classValidation = require("../validations/class");
const parentValidation = require("../validations/parent");
const studentValidation = require("../validations/student");
const feeValidation = require("../validations/fee");
const attendanceValidation = require("../validations/attendance");
const salaryValidation = require("../validations/salary");
const libraryValidation = require("../validations/library");
const examValidation = require("../validations/exam");
const homeworkValidation = require("../validations/homework");
const homeworkSubmissionValidation = require("../validations/homeworkSubmission");
const commonValidation = require("../validations/common");

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

const validationRules = {
  ...authValidation,
  ...schoolValidation,
  ...userValidation,
  ...accountantValidation,
  ...classValidation,
  ...parentValidation,
  ...studentValidation,
  ...feeValidation,
  ...attendanceValidation,
  ...salaryValidation,
  ...libraryValidation,
  ...examValidation,
  ...homeworkValidation,
  ...homeworkSubmissionValidation,
  ...commonValidation,
};

module.exports = {
  handleValidationErrors,
  validationRules,
  body,
  param,
  query,
};
