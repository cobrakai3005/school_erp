const AttendanceController = require("../controllers/AttendanceController");
const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  verifyToken,
  setSchoolContext,
  isTeacher,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

//  STUDENT ATTENDANCE

// Mark student attendance (teacher or admin)
router.post(
  "/students",
  isTeacher,
  validationRules.markAttendance,
  handleValidationErrors,
  AttendanceController.markStudentAttendance,
);

// Mark bulk attendance (teacher or admin)
router.post(
  "/students/bulk",
  isTeacher,
  AttendanceController.markBulkAttendance,
);

// Get attendance by class and date
router.get(
  "/students/class/:classId/date/:date",
  checkPermission("attendance", "read"),
  AttendanceController.getByClassAndDate,
);

// Get attendance by student
router.get(
  "/students/:studentId",
  checkPermission("attendance", "read"),
  AttendanceController.getByStudent,
);

// Get class attendance summary
router.get(
  "/students/class/:classId/summary",
  checkPermission("attendance", "read"),
  AttendanceController.getClassSummary,
);

// Get school attendance report (admin only)
router.get(
  "/school/report",
  isSchoolAdmin,
  AttendanceController.getSchoolAttendance,
);

//  STAFF ATTENDANCE

// Mark staff attendance (admin only)
router.post("/staff", isSchoolAdmin, AttendanceController.markStaffAttendance);

// Get staff attendance by user
router.get(
  "/staff/:userId",
  checkPermission("staff_attendance", "read"),
  AttendanceController.getStaffAttendanceByUser,
);

// Get staff attendance summary (for salary calculation)
router.get(
  "/staff/:userId/summary",
  checkPermission("staff_attendance", "read"),
  AttendanceController.getStaffAttendanceSummary,
);

// Get all staff attendance for a date (admin only)
router.get(
  "/staff/school/:date",
  isSchoolAdmin,
  AttendanceController.getSchoolStaffAttendance,
);

// Delete attendance record (admin only)
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  AttendanceController.deleteAttendance,
);

module.exports = router;
