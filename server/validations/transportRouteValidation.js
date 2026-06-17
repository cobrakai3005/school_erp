const { body } = require("express-validator");

const transportRouteValidation = {
  // Create Route
  createRoute: [
    body("route_name").notEmpty().trim().withMessage("Route name is required"),

    body("route_code").notEmpty().trim().withMessage("Route code is required"),

    body("vehicle_no").optional().trim(),

    body("driver_name").optional().trim(),

    body("driver_phone").optional().trim(),

    body("conductor_name").optional().trim(),

    body("pickup_points").optional().trim(),

    body("fare_amount")
      .optional()
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage("Fare amount must be valid"),

    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Invalid status value"),
  ],

  // Update Route
  updateRoute: [
    body("route_name").optional().trim(),

    body("route_code").optional().trim(),

    body("vehicle_no").optional().trim(),

    body("driver_name").optional().trim(),

    body("driver_phone").optional().trim(),

    body("conductor_name").optional().trim(),

    body("pickup_points").optional().trim(),

    body("fare_amount")
      .optional()
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage("Fare amount must be valid"),

    body("status")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Invalid status value"),
  ],
};

module.exports = transportRouteValidation;
