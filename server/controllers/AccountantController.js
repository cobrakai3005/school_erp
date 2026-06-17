const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/database");
const path = require("path");
const fs = require("fs");
const AccountantModel = require("../models/AccountantModel");
const UserModel = require("../models/UserModel");

class AccountantController {
  // Create accountant
  static async create(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const accountantData = req.body;
      const schoolId = req.schoolId;
      let profile_image = null;

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }
      // Check employee ID
      const existingEmployee = await AccountantModel.findByEmployeeIdAndSchool(
        accountantData.employee_id,
        schoolId,
      );
      if (existingEmployee) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Employee ID already exists",
        });
      }

      // Check email
      const existingEmail = await UserModel.emailExists(accountantData.email);

      if (existingEmail) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Generate password
      const rawPassword = accountantData.password || accountantData.employee_id;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Create user
      const userId = await UserModel.create({
        school_id: schoolId,
        user_type: "accountant_fee",
        username: accountantData.username || accountantData.employee_id,
        email: accountantData.email,
        password: hashedPassword,
        full_name: accountantData.full_name,
        phone: accountantData.phone,
        address: accountantData.address,
        profile_image: profile_image || null,
      });

      // Create accountant
      const accountantId = await AccountantModel.create(
        {
          employee_id: accountantData.employee_id,
          user_id: userId,
          designation: accountantData.designation,
          type: accountantData.type,
          joining_date: accountantData.joining_date,
          salary: accountantData.salary,
        },
        connection,
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Accountant created successfully",
        data: {
          id: accountantId,
          user_id: userId,
        },
      });
    } catch (error) {
      await connection.rollback();

      console.error("Create Accountant Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // Get all accountants
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;

      const { page = 1, limit = 10, status, type, search } = req.query;

      const result = await AccountantModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        {
          status,
          type,
          search,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Accountants Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get accountant by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const accountant = await AccountantModel.findById(id);

      if (!accountant) {
        return res.status(404).json({
          success: false,
          message: "Accountant not found",
        });
      }

      // School access check
      if (!req.user.isSuperAdmin && accountant.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: accountant,
      });
    } catch (error) {
      console.error("Get Accountant Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async update(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      // Find accountant
      const accountant = await AccountantModel.findById(id);

      if (!accountant) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Accountant not found",
        });
      }

      // School access check
      // if (!req.user.isSuperAdmin && accountant.school_id != Number(schoolId)) {
      //   await connection.rollback();

      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied",
      //   });
      // }

      // CHECK DUPLICATE EMAIL

      if (updateData.email) {
        const existingEmail = await UserModel.emailExists(
          updateData.email,
          accountant.user_id,
        );

        if (existingEmail) {
          await connection.rollback();

          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      // USER UPDATE DATA

      const userUpdate = {};

      let oldImagePath = null;

      // PROFILE IMAGE HANDLING
      console.log(req.file);

      if (req.file) {
        const newImageUrl = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;

        userUpdate.profile_image = newImageUrl;

        // Get user data
        const user = await UserModel.findById(accountant.user_id);

        // Store old image path for deletion later
        if (user?.profile_image) {
          const oldFileName = user.profile_image.split("/uploads/")[1];

          oldImagePath = path.join(__dirname, "../uploads", oldFileName);
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
        await UserModel.update(accountant.user_id, userUpdate, connection);
      }

      // ACCOUNTANT TABLE UPDATE

      const cleanAccountantData = {};

      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] !== undefined &&
          updateData[key] !== "" &&
          key !== "id" &&
          key !== "user_id" &&
          key !== "profile_image"
        ) {
          cleanAccountantData[key] = updateData[key];
        }
      });

      // Update accountant table
      if (Object.keys(cleanAccountantData).length > 0) {
        await AccountantModel.update(id, cleanAccountantData, connection);
      }

      // Commit transaction
      await connection.commit();

      // DELETE OLD IMAGE AFTER COMMIT

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log("Old image deleted");
      }

      return res.status(200).json({
        success: true,
        message: "Accountant updated successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Update Accountant Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // Delete accountant
  static async delete(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;

      const accountant = await AccountantModel.findById(id);

      if (!accountant) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Accountant not found",
        });
      }

      // School access check
      if (!req.user.isSuperAdmin && accountant.school_id != schoolId) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Soft delete accountant
      await AccountantModel.delete(id, connection);

      // Soft delete user
      await UserModel.delete(accountant.user_id, connection);

      await connection.commit();

      res.json({
        success: true,
        message: "Accountant deleted successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Delete Accountant Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = AccountantController;
