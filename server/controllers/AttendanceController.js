const AttendanceModel = require("../models/AttendanceModel");
const ClassModel = require("../models/ClassModel");
const TeacherModel = require("../models/TeacherModel");

class AttendanceController {
  //  STUDENT ATTENDANCE

  // Mark student attendance
  static async markStudentAttendance(req, res) {
    try {
      const attendanceData = req.body;

      await AttendanceModel.markStudentAttendance({
        ...attendanceData,
        marked_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
      });
    } catch (error) {
      console.error("Mark Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark bulk attendance for a class
  static async markBulkAttendance(req, res) {
    try {
      const { class_id, attendance_date, attendance_list } = req.body;

      const existingClass = await ClassModel.findById(class_id);
      const teacher = await TeacherModel.findByUserId(req.user.id);
      if (existingClass.class_teacher_id === teacher.id) {
        await AttendanceModel.markBulkAttendance(
          class_id,
          attendance_date,
          attendance_list,
          req.user.id,
        );

        res.status(201).json({
          success: true,
          message: "Bulk attendance marked successfully",
        });
      } else {
        res.status(400).json({
          success: true,
          message: "You are not Class Teacher of this Class",
        });
      }
    } catch (error) {
      console.error("Mark Bulk Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get attendance by class and date
  static async getByClassAndDate(req, res) {
    try {
      const { classId, date } = req.params;

      const attendance = await AttendanceModel.getByClassAndDate(classId, date);

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error("Get Class Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get attendance by student
  static async getByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { from_date, to_date, status } = req.query;

      const attendance = await AttendanceModel.getByStudent(studentId, {
        from_date,
        to_date,
        status,
      });

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error("Get Student Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get class attendance summary
  static async getClassSummary(req, res) {
    try {
      const { classId } = req.params;
      const { month, year } = req.query;

      const summary = await AttendanceModel.getClassSummary(
        classId,
        parseInt(month) || new Date().getMonth() + 1,
        parseInt(year) || new Date().getFullYear(),
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get Class Summary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get school attendance report
  static async getSchoolAttendance(req, res) {
    try {
      const schoolId = req.schoolId;
      const { from_date, to_date } = req.query;

      const attendance = await AttendanceModel.getSchoolAttendance(
        schoolId,
        from_date,
        to_date,
      );

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error("Get School Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //  STAFF ATTENDANCE

  // Mark staff attendance
  static async markStaffAttendance(req, res) {
    try {
      const attendanceData = req.body;

      await AttendanceModel.markStaffAttendance({
        ...attendanceData,
        marked_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Staff attendance marked successfully",
      });
    } catch (error) {
      console.error("Mark Staff Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get staff attendance by user
  static async getStaffAttendanceByUser(req, res) {
    try {
      const { userId } = req.params;
      const { from_date, to_date } = req.query;

      const attendance = await AttendanceModel.getStaffAttendanceByUser(
        userId,
        { from_date, to_date },
      );

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error("Get Staff Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get staff attendance summary for salary calculation
  static async getStaffAttendanceSummary(req, res) {
    try {
      const { userId } = req.params;
      const { month, year } = req.query;

      const summary = await AttendanceModel.getStaffAttendanceSummary(
        userId,
        parseInt(month) || new Date().getMonth() + 1,
        parseInt(year) || new Date().getFullYear(),
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get Staff Attendance Summary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all staff attendance for a school on a date
  static async getSchoolStaffAttendance(req, res) {
    try {
      const schoolId = req.schoolId;
      const { date } = req.params;

      const attendance = await AttendanceModel.getSchoolStaffAttendance(
        schoolId,
        date,
      );

      res.json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      console.error("Get School Staff Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete attendance record
  static async deleteAttendance(req, res) {
    try {
      const { id } = req.params;

      await AttendanceModel.deleteAttendance(id);

      res.json({
        success: true,
        message: "Attendance record deleted successfully",
      });
    } catch (error) {
      console.error("Delete Attendance Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = AttendanceController;
