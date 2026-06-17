const { body } = require("express-validator");

const feeValidation = {
  createFeeStructure: [
    body("class_id").isInt().withMessage("Valid class ID is required"),
    body("fee_type").notEmpty().trim().withMessage("Fee type is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Valid amount is required"),
  ],

  createFeePayment: [
    body("student_id").isInt().withMessage("Valid student ID is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Valid amount is required"),
    body("payment_mode")
      .isIn(["cash", "cheque", "online", "bank_transfer", "card"])
      .withMessage("Valid payment mode is required"),
  ],
};

module.exports = feeValidation;
