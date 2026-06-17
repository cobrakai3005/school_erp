const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const schoolRoutes = require("./schools");
const userRoutes = require("./users");
const classRoutes = require("./classes");
const studentRoutes = require("./students");
const teacherRoutes = require("./teachers");
const feeRoutes = require("./fees");
const attendanceRoutes = require("./attendance");
const salaryRoutes = require("./salaries");
const libraryRoutes = require("./library");
const librarianRoutes = require("./librarian");
const examRoutes = require("./exams");
const examResultRoutes = require("./examResultRoutes");
const accountantRoutes = require("./accountant");
const homeworkRoutes = require("./homeworkRoutes");
const homeworkSubmissionRoutes = require("./homeworksubmission");
const dashboardRoutes = require("./dashboard");
const staffRoutes = require("./staff");
const notificationRoutes = require("./notifications");
const timetableRoutes = require("./timetable");
const superAdminRoutes = require("./superAdmin");
const parentsRoutes = require("./parents");
const transportManagerRoutes = require("./transportManagers");
const transportRoutes = require("./transportRoutes");
const studentTransportRoutes = require("./transportStudents");
const studyMaterialRoutes = require("./studyMaterialRoutes");
const inventoryRoutes = require("./inventoryRoutes");
const inventoryTransactionRoutes = require("./inventoryTransaction");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/classes", classRoutes);
router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/fees", feeRoutes);
router.use("/salaries", salaryRoutes);
router.use("/library", libraryRoutes);
router.use("/librarians", librarianRoutes);
router.use("/exams", examRoutes);
router.use("/exams-results", examResultRoutes);
router.use("/parents", parentsRoutes);
router.use("/schools", schoolRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/timetable", timetableRoutes);
router.use("/homework-assignment", homeworkRoutes);
router.use("/homework-submission", homeworkSubmissionRoutes);
router.use("/staff", staffRoutes);
router.use("/accountants", accountantRoutes);
router.use("/transport_managers", transportManagerRoutes);
router.use("/transport_routes", transportRoutes);
router.use("/student_transport_routes", studentTransportRoutes);
router.use("/study_materials", studyMaterialRoutes);
router.use("/inventory/items", inventoryRoutes);
router.use("/inventory/transactions", inventoryTransactionRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/super-admin", superAdminRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "School ERP API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
