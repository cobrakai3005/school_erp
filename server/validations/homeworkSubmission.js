const { body } = require("express-validator");

const homeworkSubmissionValidation = {
  createHomeworkSubmission: [
    body("homework_id")
      .notEmpty()
      .withMessage("Homework ID is required")
      .isInt({ min: 1 })
      .withMessage("Homework ID must be a valid integer"),

    body("student_id")
      .notEmpty()
      .withMessage("Student ID is required")
      .isInt({ min: 1 })
      .withMessage("Student ID must be a valid integer"),

    body("submission_date")
      .notEmpty()
      .withMessage("Submission date is required")
      .isDate()
      .withMessage("Submission date must be a valid date"),

    body("remarks")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Remarks cannot exceed 1000 characters"),
  ],

  updateHomeworkSubmission: [
    body("submission_date")
      .optional()
      .isDate()
      .withMessage("Submission date must be a valid date"),

    body("remarks")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Remarks cannot exceed 1000 characters"),

    body("marks")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Marks must be between 0 and 100"),

    body("feedback")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Feedback cannot exceed 2000 characters"),
  ],
};

module.exports = homeworkSubmissionValidation;
