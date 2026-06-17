const { body, param } = require("express-validator");

const examResultValidation = {
  //  CREATE RESULT
  createResult: [
    body("exam_id")
      .notEmpty()
      .withMessage("Exam ID is required")
      .isInt()
      .withMessage("Exam ID must be an integer"),

    body("student_id")
      .notEmpty()
      .withMessage("Student ID is required")
      .isInt()
      .withMessage("Student ID must be an integer"),

    body("subject")
      .notEmpty()
      .withMessage("Subject is required")
      .isString()
      .withMessage("Subject must be a string"),

    body("marks_obtained")
      .notEmpty()
      .withMessage("Marks obtained is required")
      .isInt({ min: 0 })
      .withMessage("Marks obtained must be a valid number"),

    body("total_marks")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Total marks must be greater than 0"),

    body("percentage")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Percentage must be between 0 and 100"),

    body("grade")
      .optional()
      .isString()
      .isLength({ max: 2 })
      .withMessage("Grade must be max 2 characters"),

    body("remarks")
      .optional()
      .isString()
      .withMessage("Remarks must be a string"),
  ],

  //  BULK RESULTS
  bulkResults: [
    body("exam_id")
      .notEmpty()
      .isInt()
      .withMessage("Exam ID is required and must be an integer"),

    body("results")
      .isArray({ min: 1 })
      .withMessage("Results must be a non-empty array"),

    body("results.*.student_id")
      .notEmpty()
      .isInt()
      .withMessage("Student ID is required"),

    body("results.*.subject")
      .notEmpty()
      .isString()
      .withMessage("Subject is required"),

    body("results.*.marks_obtained")
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Marks obtained must be a valid number"),

    body("results.*.total_marks")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Total marks must be valid"),

    body("results.*.grade")
      .optional()
      .isString()
      .isLength({ max: 2 })
      .withMessage("Grade must be max 2 characters"),

    //  ADDED: remarks
    body("results.*.remarks")
      .optional()
      .isString()
      .withMessage("Remarks must be a string"),
  ],

  //  UPDATE RESULT
  updateResult: [
    param("id").notEmpty().isInt().withMessage("Result ID must be valid"),

    body("marks_obtained")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Marks must be valid"),

    body("total_marks").optional().isInt({ min: 1 }),

    body("grade").optional().isString().isLength({ max: 2 }),

    body("remarks").optional().isString(),
  ],

  //  PARAM VALIDATION
  idParam: [
    param("id").notEmpty().isInt().withMessage("ID must be an integer"),
  ],

  examIdParam: [
    param("examId")
      .exists({ checkFalsy: true })
      .withMessage("Student ID is required")
      .bail()
      .isInt()
      .withMessage("Student ID must be an integer"),
  ],

  studentIdParam: [
    param("studentId")
      .exists({ checkFalsy: true })
      .withMessage("Student ID is required")
      .bail()
      .isInt()
      .withMessage("Student ID must be an integer"),
  ],
};

module.exports = examResultValidation;
