const bcrypt = require("bcryptjs");
const TeacherModel = require("../models/TeacherModel");
const UserModel = require("../models/UserModel");
const { pool } = require("../config/database");
const fs = require("fs");
const path = require("path");
class TeacherController {
  // Create a new teacher

  static async create(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const teacherData = req.body;
      const schoolId = req.schoolId;

      // Check if employee ID already exists
      const existingEmployee = await TeacherModel.findByEmployeeId(
        teacherData.employee_id,
      );
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }

      // Check if email already exists
      const existingEmail = await UserModel.emailExists(teacherData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
      let profile_image = null;

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }
      // Create user account for teacher

      const hashedPassword = await bcrypt.hash(
        teacherData.password || teacherData.employee_id,
        10,
      );

      const userId = await UserModel.create({
        school_id: schoolId,
        user_type: "teacher",
        username: teacherData.username || teacherData.employee_id,
        email: teacherData.email,
        password: hashedPassword,
        full_name: teacherData.full_name,
        phone: teacherData.phone,
        address: teacherData.address,
        profile_image: profile_image || null,
      });

      // Create teacher record
      const teacherId = await TeacherModel.create({
        ...teacherData,

        user_id: userId,
      });
      await connection.commit();
      res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: { id: teacherId, user_id: userId },
      });
    } catch (error) {
      await connection.rollback();

      console.error("Create Teacher Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all teachers by school
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 10, department, status, search } = req.query;

      const result = await TeacherModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { department, status, search },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Teachers Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get teacher by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const teacher = await TeacherModel.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && teacher.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Get assigned classes
      const assignedClasses = await TeacherModel.getAssignedClasses(id);

      res.json({
        success: true,
        data: { ...teacher, assigned_classes: assignedClasses },
      });
    } catch (error) {
      console.error("Get Teacher Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update teacher
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      // Find teacher
      const teacher = await TeacherModel.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Check school access
      // if (
      //   !req.user.isSuperAdmin &&
      //   teacher.school_id != Number(schoolId)
      // ) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied",
      //   });
      // }

      // USER UPDATE DATA

      let userUpdate = {};

      // PROFILE IMAGE HANDLING

      if (req.file) {
        const newImageUrl = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;

        userUpdate.profile_image = newImageUrl;

        // Get user data
        const user = await UserModel.findById(teacher.user_id);

        // Delete old image safely
        if (user?.profile_image) {
          console.log(user.profile_image);

          const oldFileName = user.profile_image.split("/uploads/")[1];

          const oldPath = path.join(__dirname, "../uploads", oldFileName);

          console.log(oldPath);

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log("Old image deleted");
          } else {
            console.log("Old image not found");
          }
        }
      }

      // OTHER USER FIELDS

      if (updateData.full_name) {
        userUpdate.full_name = updateData.full_name;
      }

      if (updateData.email) {
        userUpdate.email = updateData.email;
      }

      if (updateData.phone) {
        userUpdate.phone = updateData.phone;
      }

      if (updateData.address) {
        userUpdate.address = updateData.address;
      }

      // Update users table
      if (Object.keys(userUpdate).length > 0) {
        await UserModel.update(teacher.user_id, userUpdate);
      }

      // TEACHER TABLE UPDATE

      const cleanTeacherData = {};

      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] !== undefined &&
          updateData[key] !== "" &&
          key !== "id" &&
          key !== "user_id"
        ) {
          cleanTeacherData[key] = updateData[key];
        }
      });

      // Update teacher table
      if (Object.keys(cleanTeacherData).length > 0) {
        await TeacherModel.update(id, cleanTeacherData);
      }

      return res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
      });
    } catch (error) {
      console.error("Update Teacher Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  // Delete teacher (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const teacher = await TeacherModel.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && teacher.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await TeacherModel.delete(id);
      await UserModel.delete(teacher.user_id);

      res.json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (error) {
      console.error("Delete Teacher Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get teacher timetable
  static async getTimetable(req, res) {
    try {
      const { id } = req.params;

      const teacher = await TeacherModel.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      const timetable = await TeacherModel.getTimetable(id);

      res.json({
        success: true,
        data: timetable,
      });
    } catch (error) {
      console.error("Get Teacher Timetable Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get assigned classes
  static async getAssignedClasses(req, res) {
    try {
      const { id } = req.params;

      const teacher = await TeacherModel.findById(id);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      const classes = await TeacherModel.getAssignedClasses(id);

      res.json({
        success: true,
        data: classes,
      });
    } catch (error) {
      console.error("Get Assigned Classes Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = TeacherController;
