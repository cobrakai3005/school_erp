const { param, query } = require("express-validator");

const commonValidation = {
  idParam: [param("id").isInt().withMessage("Valid ID is required")],

  classIdParam: [
    param("classId").isInt().withMessage("Valid Class Id is reqiured"),
  ],

  teacherIdParam: [
    param("teacherId").isInt().withMessage("Valid Teacher Id is reqiured"),
  ],

  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};

module.exports = commonValidation;
