const bcrypt = require("bcryptjs");
const StudentModel = require("../models/StudentModel");
const UserModel = require("../models/UserModel");

class StudentController {
  // Create a new student
  static async create(req, res) {
    try {
      const studentData = req.body;
      const schoolId = req.schoolId;

      // Check if admission number already exists
      const existingAdmission = await StudentModel.findByAdmissionNo(
        studentData.admission_no,
      );
      if (existingAdmission) {
        return res.status(400).json({
          success: false,
          message: "Admission number already exists",
        });
      }

      // Check if email already exists
      const existingEmail = await UserModel.emailExists(studentData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Create user account for student
      const hashedPassword = await bcrypt.hash(
        studentData.password || studentData.admission_no,
        10,
      );
      let profile_image = null;

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }

      const userId = await UserModel.create({
        school_id: schoolId,
        user_type: "student",
        username: studentData.username || studentData.admission_no,
        email: studentData.email,
        password: hashedPassword,
        full_name: studentData.full_name,
        phone: studentData.phone,
        address: studentData.address,
        profile_image: profile_image || null,
      });

      // Create student record
      const studentId = await StudentModel.create({
        ...studentData,
        user_id: userId,
      });

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: { id: studentId, user_id: userId },
      });
    } catch (error) {
      console.error("Create Student Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all students by school
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 10, class_id, status, search } = req.query;

      const result = await StudentModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { class_id, status, search },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Students Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get student by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const student = await StudentModel.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && student.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      console.error("Get Student Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update student
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

      const student = await StudentModel.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && student.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Update user details if provided (full_name, email, phone, address belong to users table)
      const userFields = [
        "full_name",
        "email",
        "phone",
        "address",
        "profile_image",
      ];
      const userUpdate = {};
      userFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          userUpdate[field] = updateData[field];
        }
      });

      if (Object.keys(userUpdate).length > 0) {
        await UserModel.update(student.user_id, userUpdate);
      }

      // Remove user fields from student update data to avoid updating wrong table
      const studentUpdateData = { ...updateData };
      userFields.forEach((field) => delete studentUpdateData[field]);

      // Update student details (only student-specific fields)
      if (Object.keys(studentUpdateData).length > 0) {
        await StudentModel.update(id, studentUpdateData);
      }

      res.json({
        success: true,
        message: "Student updated successfully",
      });
    } catch (error) {
      console.error("Update Student Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete student (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const student = await StudentModel.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && student.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await StudentModel.delete(id);
      await UserModel.delete(student.user_id);

      res.json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.error("Delete Student Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get students by class
  static async getByClass(req, res) {
    try {
      const { classId } = req.params;

      const students = await StudentModel.findByClass(classId);

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Get Students By Class Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get student fee dues
  static async getFeeDues(req, res) {
    try {
      const { id } = req.params;

      const student = await StudentModel.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const feeDues = await StudentModel.getFeeDues(id);

      res.json({
        success: true,
        data: feeDues,
      });
    } catch (error) {
      console.error("Get Student Fee Dues Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = StudentController;
