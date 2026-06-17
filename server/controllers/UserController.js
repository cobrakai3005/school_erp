const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const StudentModel = require("../models/StudentModel");
const TeacherModel = require("../models/TeacherModel");

class UserController {
  // Create a new user
  static async create(req, res) {
    try {
      const userData = req.body;
      const schoolId = req.schoolId;

      // Check if email already exists
      const existingEmail = await UserModel.emailExists(userData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Check if username exists in school
      const existingUsername = await UserModel.usernameExistsInSchool(
        userData.username,
        schoolId,
      );
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: "Username already exists in this school",
        });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const userId = await UserModel.create({
        ...userData,
        school_id: schoolId,
        password: hashedPassword,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: { id: userId },
      });
    } catch (error) {
      console.error("Create User Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all users by school
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 10, user_type, status, search } = req.query;

      const result = await UserModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { user_type, status, search },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Users Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && user.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Get additional details based on user type
      let additionalInfo = null;
      if (user.user_type === "student") {
        additionalInfo = await StudentModel.findByUserId(id);
      } else if (user.user_type === "teacher") {
        additionalInfo = await TeacherModel.findByUserId(id);
      }

      res.json({
        success: true,
        data: { ...user, details: additionalInfo },
      });
    } catch (error) {
      console.error("Get User Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && user.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check email uniqueness if updating email
      if (updateData.email && updateData.email !== user.email) {
        const existingEmail = await UserModel.emailExists(updateData.email, id);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      // Hash password if provided
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      await UserModel.update(id, updateData);

      res.json({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Update User Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && user.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await UserModel.delete(id);

      res.json({
        success: true,
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("Delete User Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get users by type
  static async getByType(req, res) {
    try {
      const schoolId = req.schoolId;
      const { type } = req.params;

      const users = await UserModel.findByType(schoolId, type);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Get Users By Type Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user status
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const schoolId = req.schoolId;

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && user.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await UserModel.update(id, { status });

      res.json({
        success: true,
        message: `User status updated to ${status}`,
      });
    } catch (error) {
      console.error("Update User Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = UserController;
