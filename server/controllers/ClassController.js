const ClassModel = require("../models/ClassModel");

class ClassController {
  // Create a new class
  static async create(req, res) {
    try {
      const classData = req.body;
      const schoolId = req.schoolId;

      // Check if class code already exists in school
      const existingClass = await ClassModel.findByCode(
        schoolId,
        classData.class_code,
      );
      if (existingClass) {
        return res.status(400).json({
          success: false,
          message: "Class code already exists in this school",
        });
      }

      const classId = await ClassModel.create({
        ...classData,
        school_id: schoolId,
      });

      res.status(201).json({
        success: true,
        message: "Class created successfully",
        data: { id: classId },
      });
    } catch (error) {
      console.error("Create Class Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all classes by school
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 10, status, academic_year, search } = req.query;

      const result = await ClassModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { status, academic_year, search },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Classes Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get class by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const classData = await ClassModel.findById(id);

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && classData.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: classData,
      });
    } catch (error) {
      console.error("Get Class Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update class
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      const classData = await ClassModel.findById(id);

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && classData.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check class code uniqueness if updating
      if (
        updateData.class_code &&
        updateData.class_code !== classData.class_code
      ) {
        const existingClass = await ClassModel.findByCode(
          schoolId,
          updateData.class_code,
        );
        if (existingClass) {
          return res.status(400).json({
            success: false,
            message: "Class code already exists",
          });
        }
      }

      await ClassModel.update(id, updateData);

      res.json({
        success: true,
        message: "Class updated successfully",
      });
    } catch (error) {
      console.error("Update Class Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete class (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const classData = await ClassModel.findById(id);

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && classData.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await ClassModel.delete(id);

      res.json({
        success: true,
        message: "Class deleted successfully",
      });
    } catch (error) {
      console.error("Delete Class Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get students in class
  static async getStudents(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const classData = await ClassModel.findById(id);

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && classData.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const students = await ClassModel.getStudents(id);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Get Class Students Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = ClassController;
