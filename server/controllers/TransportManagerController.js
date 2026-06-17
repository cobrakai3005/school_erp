const bcrypt = require("bcryptjs");
const TransportManagerModel = require("../models/TransportManagerModel");
const UserModel = require("../models/UserModel");
const { pool } = require("../config/database");

class TransportManagerController {
  // Create Transport Manager
  static async create(req, res) {
    let connection;

    try {
      connection = await pool.getConnection();

      await connection.beginTransaction();
      let profile_image = null;

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }
      const transportManagerData = req.body;
      const schoolId = req.schoolId;

      // Check employee ID
      const existingEmployee = await TransportManagerModel.findByEmployeeId(
        transportManagerData.employee_id,
      );

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }

      // Check email
      const existingEmail = await UserModel.emailExists(
        transportManagerData.email,
      );

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        transportManagerData.password || transportManagerData.employee_id,
        10,
      );

      // Create user
      const userId = await UserModel.create({
        school_id: schoolId,
        user_type: "transport_manager",
        username:
          transportManagerData.username || transportManagerData.employee_id,
        email: transportManagerData.email,
        password: hashedPassword,
        full_name: transportManagerData.full_name,
        phone: transportManagerData.phone,
        address: transportManagerData.address,
        profile_image: profile_image || null,
      });

      // Create transport manager
      const transportManagerId = await TransportManagerModel.create({
        ...transportManagerData,
        user_id: userId,
      });

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Transport manager created successfully",
        data: {
          id: transportManagerId,
          user_id: userId,
        },
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error("Create Transport Manager Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get All Transport Managers
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;

      const { page = 1, limit = 10, department, status, search } = req.query;

      const result = await TransportManagerModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        {
          department,
          status,
          search,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Transport Managers Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get Transport Manager By ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const schoolId = req.schoolId;

      const transportManager = await TransportManagerModel.findById(id);

      if (!transportManager) {
        return res.status(404).json({
          success: false,
          message: "Transport manager not found",
        });
      }

      // School Access Check
      if (!req.user.isSuperAdmin && transportManager.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: transportManager,
      });
    } catch (error) {
      console.error("Get Transport Manager Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update Transport Manager
  static async update(req, res) {
    try {
      const { id } = req.params;
      let profile_image = null;

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }
      const updateData = { ...req.body, profile_image: profile_image };

      const schoolId = req.schoolId;

      const transportManager = await TransportManagerModel.findById(id);

      if (!transportManager) {
        return res.status(404).json({
          success: false,
          message: "Transport manager not found",
        });
      }

      // School Access Check
      if (!req.user.isSuperAdmin && transportManager.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Update User Fields
      if (
        updateData.full_name ||
        updateData.email ||
        updateData.phone ||
        updateData.address ||
        updateData.profile_image
      ) {
        const userUpdate = {};

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

        if (updateData.profile_image) {
          userUpdate.profile_image = updateData.profile_image;
        }

        await UserModel.update(transportManager.user_id, userUpdate);
      }

      // Update password if provided
      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);

        await UserModel.update(transportManager.user_id, {
          password: hashedPassword,
        });
      }

      // Remove user table fields
      delete updateData.full_name;
      delete updateData.email;
      delete updateData.phone;
      delete updateData.address;
      delete updateData.profile_image;
      delete updateData.password;

      // Update transport manager table
      await TransportManagerModel.update(id, updateData);

      res.json({
        success: true,
        message: "Transport manager updated successfully",
      });
    } catch (error) {
      console.error("Update Transport Manager Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete Transport Manager
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const schoolId = req.schoolId;

      const transportManager = await TransportManagerModel.findById(id);

      if (!transportManager) {
        return res.status(404).json({
          success: false,
          message: "Transport manager not found",
        });
      }

      // School Access Check
      if (!req.user.isSuperAdmin && transportManager.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Soft Delete Transport Manager
      await TransportManagerModel.delete(id);

      // Soft Delete User
      await UserModel.delete(transportManager.user_id);

      res.json({
        success: true,
        message: "Transport manager deleted successfully",
      });
    } catch (error) {
      console.error("Delete Transport Manager Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = TransportManagerController;
