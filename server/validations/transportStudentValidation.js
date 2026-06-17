const { body } = require("express-validator");

const transportStudentValidation = {
  // Assign Student Route
  createAssignment: [
    body("student_id").notEmpty().isInt().withMessage("Student ID is required"),

    body("route_id").notEmpty().isInt().withMessage("Route ID is required"),

    body("pickup_point").optional().trim(),

    body("drop_point").optional().trim(),

    body("pickup_time")
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .withMessage("Pickup time must be valid (HH:mm:ss)"),
    body("drop_time")
      .optional()
      .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
      .withMessage("Drop time must be valid (HH:mm:ss)"),

    body("status")
      .optional()
      .isIn(["active", "inactive", "cancelled"])
      .withMessage("Invalid status value"),
  ],

  // Update Assignment
  updateAssignment: [
    body("student_id")
      .optional()
      .isInt()
      .withMessage("Student ID must be valid"),

    body("route_id").optional().isInt().withMessage("Route ID must be valid"),

    body("pickup_point").optional().trim(),

    body("drop_point").optional().trim(),

    body("pickup_time")
      .optional()
      .isTime()
      .withMessage("Pickup time must be valid"),

    body("drop_time")
      .optional()
      .isTime()
      .withMessage("Drop time must be valid"),

    body("status")
      .optional()
      .isIn(["active", "inactive", "cancelled"])
      .withMessage("Invalid status value"),
  ],
};

module.exports = transportStudentValidation;
