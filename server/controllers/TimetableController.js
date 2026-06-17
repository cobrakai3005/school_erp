const TimetableModel = require("../models/TimetableModel");
const TeacherModel = require("../models/TeacherModel");
const StudentModel = require("../models/StudentModel");

class TimetableController {
  // Get timetable for a class
  static async getByClass(req, res) {
    try {
      const { classId } = req.params;
      const timetable = await TimetableModel.findByClass(classId);

      // Group by day
      const grouped = timetable.reduce((acc, entry) => {
        if (!acc[entry.day_of_week]) {
          acc[entry.day_of_week] = [];
        }
        acc[entry.day_of_week].push(entry);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          timetable,
          grouped,
        },
      });
    } catch (error) {
      console.error("Get Timetable By Class Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get timetable for current teacher
  static async getMyTimetable(req, res) {
    try {
      const userId = req.user.id;
      const teacher = await TeacherModel.findByUserId(userId);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      const timetable = await TimetableModel.findByTeacher(teacher.id);

      // Group by day
      const grouped = timetable.reduce((acc, entry) => {
        if (!acc[entry.day_of_week]) {
          acc[entry.day_of_week] = [];
        }
        acc[entry.day_of_week].push(entry);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          timetable,
          grouped,
        },
      });
    } catch (error) {
      console.error("Get My Timetable Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get timetable for current student
  static async getStudentTimetable(req, res) {
    try {
      const userId = req.user.id;
      const student = await StudentModel.findByUserId(userId);

      if (!student || !student.class_id) {
        return res.status(404).json({
          success: false,
          message: "Student or class not found",
        });
      }

      const timetable = await TimetableModel.findByClass(student.class_id);

      // Group by day
      const grouped = timetable.reduce((acc, entry) => {
        if (!acc[entry.day_of_week]) {
          acc[entry.day_of_week] = [];
        }
        acc[entry.day_of_week].push(entry);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          timetable,
          grouped,
        },
      });
    } catch (error) {
      console.error("Get Student Timetable Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all timetable entries for school (admin)
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const {
        page = 1,
        limit = 50,
        class_id,
        day_of_week,
        teacher_id,
      } = req.query;

      const result = await TimetableModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        {
          class_id,
          day_of_week,
          teacher_id,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Timetable Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get single timetable entry
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const entry = await TimetableModel.findById(id);

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Timetable entry not found",
        });
      }

      res.json({
        success: true,
        data: entry,
      });
    } catch (error) {
      console.error("Get Timetable Entry Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create timetable entry
  static async create(req, res) {
    try {
      const {
        class_id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        subject,
        teacher_id,
        room_no,
      } = req.body;

      if (
        !class_id ||
        !day_of_week ||
        !period_number ||
        !start_time ||
        !end_time
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Class, day, period number, start time, and end time are required",
        });
      }

      // Check for existing entry in same slot
      const hasConflict = await TimetableModel.checkConflict(
        class_id,
        day_of_week,
        period_number,
      );
      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: "A timetable entry already exists for this period",
        });
      }

      // Check teacher availability if teacher is assigned
      if (teacher_id) {
        const teacherConflict = await TimetableModel.checkTeacherConflict(
          teacher_id,
          day_of_week,
          start_time,
          end_time,
        );
        if (teacherConflict) {
          return res.status(400).json({
            success: false,
            message:
              "Teacher is already assigned to another class at this time",
          });
        }
      }

      const entryId = await TimetableModel.create({
        class_id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        subject,
        teacher_id,
        room_no,
      });

      const entry = await TimetableModel.findById(entryId);

      res.status(201).json({
        success: true,
        message: "Timetable entry created successfully",
        data: entry,
      });
    } catch (error) {
      console.error("Create Timetable Entry Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update timetable entry
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        class_id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        subject,
        teacher_id,
        room_no,
      } = req.body;

      const existing = await TimetableModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Timetable entry not found",
        });
      }

      // Check for conflicts if slot changed
      if (class_id || day_of_week || period_number) {
        const checkClassId = class_id || existing.class_id;
        const checkDay = day_of_week || existing.day_of_week;
        const checkPeriod = period_number || existing.period_number;

        const hasConflict = await TimetableModel.checkConflict(
          checkClassId,
          checkDay,
          checkPeriod,
          id,
        );
        if (hasConflict) {
          return res.status(400).json({
            success: false,
            message: "A timetable entry already exists for this period",
          });
        }
      }

      // Check teacher availability if teacher changed
      if (teacher_id && teacher_id !== existing.teacher_id) {
        const checkDay = day_of_week || existing.day_of_week;
        const checkStart = start_time || existing.start_time;
        const checkEnd = end_time || existing.end_time;

        const teacherConflict = await TimetableModel.checkTeacherConflict(
          teacher_id,
          checkDay,
          checkStart,
          checkEnd,
          id,
        );
        if (teacherConflict) {
          return res.status(400).json({
            success: false,
            message:
              "Teacher is already assigned to another class at this time",
          });
        }
      }

      await TimetableModel.update(id, {
        class_id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        subject,
        teacher_id,
        room_no,
      });

      const entry = await TimetableModel.findById(id);

      res.json({
        success: true,
        message: "Timetable entry updated successfully",
        data: entry,
      });
    } catch (error) {
      console.error("Update Timetable Entry Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete timetable entry
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const existing = await TimetableModel.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Timetable entry not found",
        });
      }

      await TimetableModel.delete(id);

      res.json({
        success: true,
        message: "Timetable entry deleted successfully",
      });
    } catch (error) {
      console.error("Delete Timetable Entry Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Clear timetable for a class
  static async clearByClass(req, res) {
    try {
      const { classId } = req.params;

      const count = await TimetableModel.deleteByClass(classId);

      res.json({
        success: true,
        message: `Deleted ${count} timetable entries`,
      });
    } catch (error) {
      console.error("Clear Timetable Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = TimetableController;
