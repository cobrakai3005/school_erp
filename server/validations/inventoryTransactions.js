const { body } = require("express-validator");

const inventoryTransactionValidation = {
  createTransaction: [
    body("item_id")
      .notEmpty()
      .withMessage("Item ID is required")
      .isInt()
      .withMessage("Item ID must be a number"),

    body("transaction_type")
      .notEmpty()
      .withMessage("Transaction type is required")
      .isIn(["purchase", "issue", "return", "damage", "adjustment"])
      .withMessage("Invalid transaction type"),

    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),

    body("transaction_date")
      .notEmpty()
      .withMessage("Transaction date is required")
      .isISO8601()
      .withMessage("Invalid date format (YYYY-MM-DD)"),

    body("student_id")
      .optional()
      .isInt()
      .withMessage("Student ID must be a number"),

    body("staff_id")
      .optional()
      .isInt()
      .withMessage("Staff ID must be a number"),

    body("remarks")
      .optional()
      .isString()
      .withMessage("Remarks must be a string"),
  ],
};
module.exports = inventoryTransactionValidation;
