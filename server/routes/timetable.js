const express = require("express");
const router = express.Router();
const TimetableController = require("../controllers/TimetableController");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  isTeacher,
  isStudent,
} = require("../middleware/auth");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Teacher: Get my timetable
router.get("/my", isTeacher, TimetableController.getMyTimetable);

// Student: Get my class timetable
router.get("/student", isStudent, TimetableController.getStudentTimetable);

// Get timetable by class (accessible to teachers and admins)
router.get("/class/:classId", TimetableController.getByClass);

// Admin routes
router.get("/", isSchoolAdmin, TimetableController.getAll);
router.get("/:id", TimetableController.getById);
router.post("/", isSchoolAdmin, TimetableController.create);
router.put("/:id", isSchoolAdmin, TimetableController.update);
router.delete("/:id", isSchoolAdmin, TimetableController.delete);
router.delete(
  "/class/:classId",
  isSchoolAdmin,
  TimetableController.clearByClass,
);

module.exports = router;
