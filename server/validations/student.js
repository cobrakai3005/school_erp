const { body } = require("express-validator");

const studentValidation = {
  createStudent: [
    body("admission_no")
      .notEmpty()
      .trim()
      .withMessage("Admission number is required"),
    body("aadhar_number")
      .notEmpty()
      .trim()
      .withMessage("Aadhar number is required"),
    body("full_name").notEmpty().trim().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
};

module.exports = studentValidation;
