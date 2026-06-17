const bcrypt = require("bcryptjs");
const SchoolModel = require("../models/SchoolModel");
const UserModel = require("../models/UserModel");
const { pool } = require("../config/database");

class SchoolController {
  // Create a new school
  static async create(req, res) {
    try {
      const connection = await pool.getConnection();
      await connection.rollback();
      const schoolData = req.body;

      // Check if school code already exists
      const existingCode = await SchoolModel.findByCode(schoolData.school_code);
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "School code already exists",
        });
      }

      // Check if email already exists
      const existingEmail = await SchoolModel.findByEmail(schoolData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const schoolId = await SchoolModel.create(schoolData);

      // Create school admin user if admin details provided
      if (schoolData.admin_email && schoolData.admin_password) {
        const hashedPassword = await bcrypt.hash(schoolData.admin_password, 10);

        await UserModel.create({
          school_id: schoolId,
          user_type: "admin",
          username:
            schoolData.admin_username || schoolData.admin_email.split("@")[0],
          email: schoolData.admin_email,
          password: hashedPassword,
          full_name: schoolData.admin_name || "School Admin",
          phone: schoolData.admin_phone,
        });
      }
      await connection.commit();
      res.status(201).json({
        success: true,
        message: "School created successfully",
        data: { id: schoolId },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Create School Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all schools
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      const result = await SchoolModel.findAll(
        parseInt(page),
        parseInt(limit),
        { status, search },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Schools Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get school by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const school = await SchoolModel.findById(id);

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      // Get statistics
      const statistics = await SchoolModel.getStatistics(id);

      res.json({
        success: true,
        data: { ...school, statistics },
      });
    } catch (error) {
      console.error("Get School Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update school
  static async update(req, res) {
    try {
      const connection = await pool.getConnection();
      const { id } = req.params;
      const updateData = req.body;

      const school = await SchoolModel.findById(id);

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      // Check email uniqueness if updating email
      if (updateData.email && updateData.email !== school.email) {
        const existingEmail = await SchoolModel.findByEmail(updateData.email);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      await SchoolModel.update(id, updateData);
      await pool.commit();
      res.json({
        success: true,
        message: "School updated successfully",
      });
    } catch (error) {
      await pool.rollback();
      console.error("Update School Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete school (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const school = await SchoolModel.findById(id);

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      await SchoolModel.delete(id);

      res.json({
        success: true,
        message: "School deactivated successfully",
      });
    } catch (error) {
      console.error("Delete School Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update school status
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const school = await SchoolModel.findById(id);

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      await SchoolModel.update(id, { status });

      res.json({
        success: true,
        message: `School status updated to ${status}`,
      });
    } catch (error) {
      console.error("Update School Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get school statistics
  static async getStatistics(req, res) {
    try {
      const { id } = req.params;

      const school = await SchoolModel.findById(id);

      if (!school) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }

      const statistics = await SchoolModel.getStatistics(id);

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error("Get School Statistics Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = SchoolController;
