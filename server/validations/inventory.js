const { body } = require("express-validator");

const inventoryItemValidation = {
  createItem: [
    body("item_code")
      .notEmpty()
      .withMessage("Item code is required")
      .isString()
      .withMessage("Item code must be string"),

    body("item_name")
      .notEmpty()
      .withMessage("Item name is required")
      .isString(),

    body("category")
      .notEmpty()
      .withMessage("Category is required")
      .isIn([
        "uniform",
        "book",
        "stationery",
        "furniture",
        "electronics",
        "sports",
        "other",
      ])
      .withMessage("Invalid category"),

    body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity cannot be negative"),

    body("unit").optional().isString(),

    body("purchase_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Purchase price must be >= 0"),

    body("selling_price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Selling price must be >= 0"),

    body("supplier").optional().isString(),

    body("location").optional().isString(),

    body("min_stock_level")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Min stock must be >= 0"),

    body("max_stock_level")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Max stock must be >= 0"),
  ],

  // 🔥 UPDATE VALIDATION (IMPORTANT FIX)
  updateItem: [
    body("item_name")
      .optional()
      .isString()
      .withMessage("Item name must be string"),

    body("category")
      .optional()
      .isIn([
        "uniform",
        "book",
        "stationery",
        "furniture",
        "electronics",
        "sports",
        "other",
      ])
      .withMessage("Invalid category"),

    body("quantity")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Quantity cannot be negative"),

    body("unit").optional().isString(),

    body("purchase_price").optional().isFloat({ min: 0 }),

    body("selling_price").optional().isFloat({ min: 0 }),

    body("supplier").optional().isString(),

    body("location").optional().isString(),

    body("min_stock_level").optional().isInt({ min: 0 }),

    body("max_stock_level").optional().isInt({ min: 0 }),

    body("status")
      .optional()
      .isIn(["in_stock", "low_stock", "out_of_stock"])
      .withMessage("Invalid status"),
  ],
};
module.exports = inventoryItemValidation
