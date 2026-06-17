const { body } = require("express-validator");

const homeworkValidation = {
  createHomework: [
    body("class_id")
      .notEmpty()
      .withMessage("Class ID is required")
      .isInt({ min: 1 })
      .withMessage("Class ID must be a valid integer"),

    body("subject")
      .notEmpty()
      .trim()
      .withMessage("Subject is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Subject must be between 2 and 100 characters"),

    body("title")
      .notEmpty()
      .trim()
      .withMessage("Title is required")
      .isLength({ min: 3, max: 255 })
      .withMessage("Title must be between 3 and 255 characters"),

    body("description")
      .notEmpty()
      .trim()
      .withMessage("Description is required")
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long"),

    body("given_date")
      .notEmpty()
      .withMessage("Given date is required")
      .isDate()
      .withMessage("Given date must be a valid date"),

    body("submission_date")
      .notEmpty()
      .withMessage("Submission date is required")
      .isDate()
      .withMessage("Submission date must be a valid date")
      .custom((value, { req }) => {
        if (new Date(value) < new Date(req.body.given_date)) {
          throw new Error("Submission date cannot be earlier than given date");
        }
        return true;
      }),
  ],
};

module.exports = homeworkValidation;
