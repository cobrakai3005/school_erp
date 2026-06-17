const { body } = require("express-validator");

const libraryValidation = {
  createBook: [
    body("book_code").notEmpty().trim().withMessage("Book code is required"),
    body("title").notEmpty().trim().withMessage("Book title is required"),
  ],

  issueBook: [
    body("book_id").isInt().withMessage("Valid book ID is required"),
    body("student_id").isInt().withMessage("Valid student ID is required"),
    body("due_date").isDate().withMessage("Valid due date is required"),
  ],
};

module.exports = libraryValidation;
