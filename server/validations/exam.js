const { body } = require("express-validator");

const examValidation = {
  createExam: [
    body("exam_name").notEmpty().trim().withMessage("Exam name is required"),
    body("exam_type")
      .isIn(["quarterly", "half_yearly", "annual", "unit_test", "preliminary"])
      .withMessage("Valid exam type is required"),
    body("class_id").isInt().withMessage("Valid class ID is required"),
    body("start_date").isDate().withMessage("Valid start date is required"),
    body("end_date").isDate().withMessage("Valid end date is required"),
  ],
};

module.exports = examValidation;
