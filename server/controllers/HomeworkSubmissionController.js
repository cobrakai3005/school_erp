const { pool } = require("../config/database");
const HomeworkModel = require("../models/HomeworkModel");
const HomeworkSubmissionModel = require("../models/HomeworkSubmissionModel");
const StudentModel = require("../models/StudentModel");
const TeacherModel = require("../models/TeacherModel");
const path = require("path");
const fs = require("fs");
class HomeworkSubmissionController {
  static async create(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const schoolId = req.schoolId;
      const { homework_id, student_id, submission_date, remarks } = req.body;

      // Validate student belongs to school
      const student = await StudentModel.findById(student_id);
      if (!student || student.school_id != schoolId) {
        await connection.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      // Check if already submitted
      const existing = await HomeworkSubmissionModel.alreadySubmitted(
        homework_id,
        student.id,
      );

      if (existing) {
        await connection.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Already submitted" });
      }

      // Validate homework exists and belongs to school
      const homework = await HomeworkModel.findById(homework_id);

      if (homework.class_id !== student.class_id) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "This Homework is  not for yor class",
        });
      }
      if (!homework || homework.school_id != schoolId) {
        await connection.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Homework not found" });
      }

      // File handling
      let attachment = null;
      if (req.file) {
        attachment = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }

      // Create submission
      const submissionId = await HomeworkSubmissionModel.create(
        {
          homework_id,
          student_id: student.id,
          submission_date,
          attachment,
          remarks,
        },
        connection,
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Homework submitted successfully",
        data: {
          id: submissionId,
        },
      });
    } catch (error) {
      await connection.rollback();

      console.error("Create Homework Submission Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  static async update(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;

      // FIND SUBMISSION

      const submission = await HomeworkSubmissionModel.findById(id);

      if (!submission) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Homework submission not found",
        });
      }

      // SCHOOL ACCESS CHECK

      if (submission.school_id != Number(schoolId)) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // UPDATE DATA

      const updates = {};

      // Remarks update
      if (req.body.remarks !== undefined && req.body.remarks !== "") {
        updates.remarks = req.body.remarks;
      }

      // ATTACHMENT HANDLING

      let oldAttachmentPath = null;

      if (req.file) {
        const newAttachment = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;

        updates.attachment = newAttachment;

        // Store old attachment path
        if (submission.attachment) {
          const oldFileName = submission.attachment.split("/uploads/")[1];

          oldAttachmentPath = path.join(__dirname, "../uploads", oldFileName);
        }
      }

      // CHECK IF DATA EXISTS

      if (Object.keys(updates).length === 0) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "No data provided",
        });
      }

      // UPDATE SUBMISSION

      await HomeworkSubmissionModel.update(id, updates, connection);

      // COMMIT TRANSACTION

      await connection.commit();

      // DELETE OLD FILE AFTER COMMIT

      if (oldAttachmentPath && fs.existsSync(oldAttachmentPath)) {
        fs.unlinkSync(oldAttachmentPath);

        console.log("Old attachment deleted");
      }

      return res.status(200).json({
        success: true,
        message: "Homework submission updated successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Update Homework Submission Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const userType = req.user?.user_type;
      const userId = req.user?.id;

      const teacher = await TeacherModel.findByUserId(userId);

      const {
        page = 1,
        limit = 10,
        class_id,
        student_id,
        homework_id,
        search,
      } = req.query;

      // Teachers can only view submissions for their own assignments
      let filters = { class_id, student_id, homework_id, search };
      if (userType === "teacher") {
        // Get teacher's homework IDs to filter submissions
        const teacherHomework = await HomeworkModel.findByTeacherId(teacher.id);

        const teacherHomeworkIds = teacherHomework.map((hw) => hw.id);

        if (teacherHomeworkIds.length === 0) {
          return res.status(200).json({
            success: true,
            data: {
              submissions: [],
              pagination: {
                total: 0,
                page: 1,
                limit,
                totalPages: 0,
              },
            },
          });
        }

        filters.teacherHomeworkIds = teacherHomeworkIds;
      }

      const result = await HomeworkSubmissionModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        filters,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Homework Submission Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;
      const userType = req.user?.user_type;
      const userId = req.user?.id;

      const submission = await HomeworkSubmissionModel.findById(id);

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: "Homework submission not found",
        });
      }

      // School access check
      if (submission.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Teachers can view submissions for their own assignments
      if (userType === "teacher") {
        const homework = await HomeworkModel.findById(submission.homework_id);
        if (!homework) {
          return res.status(403).json({
            success: false,
            message: "You can only view submissions for your own assignments",
          });
        }
      }

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      console.error("Get Homework Submission By ID Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async delete(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;

      // FIND SUBMISSION

      const submission = await HomeworkSubmissionModel.findById(id);

      if (!submission) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Homework submission not found",
        });
      }

      // SCHOOL ACCESS CHECK

      if (submission.school_id != Number(schoolId)) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // STORE FILE PATH

      let attachmentPath = null;

      if (submission.attachment) {
        const oldFileName = submission.attachment.split("/uploads/")[1];

        attachmentPath = path.join(__dirname, "../uploads", oldFileName);
      }

      // DELETE SUBMISSION

      await HomeworkSubmissionModel.delete(id, connection);

      // COMMIT TRANSACTION

      await connection.commit();

      // DELETE FILE AFTER COMMIT

      if (attachmentPath && fs.existsSync(attachmentPath)) {
        fs.unlinkSync(attachmentPath);

        console.log("Attachment deleted");
      }

      return res.status(200).json({
        success: true,
        message: "Homework submission deleted successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Delete Homework Submission Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // Grade a homework submission (teachers only)
  static async grade(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;
      const userId = req.user?.id;
      const { marks, feedback } = req.body;

      const submission = await HomeworkSubmissionModel.findById(id);

      if (!submission) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Homework submission not found",
        });
      }

      // School access check
      if (submission.school_id != schoolId) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Validate marks
      if (marks !== undefined && (marks < 0 || marks > 100)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Marks must be between 0 and 100",
        });
      }

      // Update submission with grade
      await HomeworkSubmissionModel.update(
        id,
        {
          marks,
          feedback,
        },
        connection,
      );

      await connection.commit();

      res.status(200).json({
        success: true,
        message: "Homework graded successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Grade Homework Submission Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // Get submissions for a specific homework
  static async getByHomework(req, res) {
    try {
      const { homeworkId } = req.params;
      const schoolId = req.schoolId;

      // Validate homework belongs to school
      const homework = await HomeworkModel.findById(homeworkId);

      if (!homework || homework.school_id != schoolId) {
        return res.status(404).json({
          success: false,
          message: "Homework not found",
        });
      }

      const submissions =
        await HomeworkSubmissionModel.findByHomeworkId(homeworkId);

      res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error("Get Submissions By Homework Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get student's own submissions
  static async getMySubmissions(req, res) {
    try {
      const userId = req.user?.id;

      // Get student record
      const student = await StudentModel.findByUserId(userId);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      const submissions = await HomeworkSubmissionModel.findByStudentId(
        student.id,
      );

      res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error("Get My Submissions Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = HomeworkSubmissionController;
