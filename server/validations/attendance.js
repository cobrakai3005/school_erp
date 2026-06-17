const { body } = require("express-validator");

const attendanceValidation = {
  markAttendance: [
    body("student_id").isInt().withMessage("Valid student ID is required"),
    body("class_id").isInt().withMessage("Valid class ID is required"),
    body("status")
      .isIn(["present", "absent", "late", "half_day", "holiday"])
      .withMessage("Valid attendance status is required"),
  ],
};

module.exports = attendanceValidation;
