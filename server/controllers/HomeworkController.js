const { pool } = require("../config/database.js");
const HomeworkModel = require("../models/HomeworkModel.js");
const TeacherModel = require("../models/TeacherModel.js");
const path = require("path");
const fs = require("fs")


class HomeworkController {
  static async create(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const schoolId = req.schoolId || req.user.schoolId;

      const {
        class_id,
        subject,
        title,
        description,
        given_date,
        submission_date,
      } = req.body;

      // Validate class
      const classExists = await HomeworkModel.validateClass(class_id, schoolId);

      if (!classExists) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      // Validate teacher
      const teacher = await TeacherModel.findByUserId(req.user.id);

      if (!teacher || teacher.school_id != schoolId) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      // Validate dates
      if (new Date(submission_date) < new Date(given_date)) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Submission date cannot be before given date",
        });
      }

      // File upload
      let attachment = null;

      if (req.file) {
        attachment = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }

      // return res.json("hhi");
      // Create homework
      const homeworkId = await HomeworkModel.create(
        {
          class_id,
          subject,
          title,
          description,
          given_date,
          submission_date,
          teacher_id: teacher.id,
          attachment,
        },
        connection,
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Homework created successfully",
        data: {
          id: homeworkId,
        },
      });
    } catch (error) {
      await connection.rollback();

      console.error("Create Homework Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;

      const {
        page = 1,
        limit = 10,
        class_id,
        subject,
        teacher_id,
        search,
      } = req.query;

      const result = await HomeworkModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        {
          class_id,
          subject,
          teacher_id,
          search,
        },
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Homework Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getHomeWorkOfMyClass(req, res) {
    try {
      const { classId } = req.params;
      const schoolId = req.schoolId;
      const homework = await HomeworkModel.findByClassId(classId);

      if (!homework) {
        return res.status(404).json({
          success: false,
          message: "Homework not found",
        });
      }

      // School access check
      if (homework.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.status(200).json({
        success: true,
        data: homework,
      });
    } catch (error) {
      console.error("Get Homework By ID Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getById(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;

      const updates = req.body;

      const homework = await HomeworkModel.findById(id);

      if (!homework) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Homework not found",
        });
      }

      // School access check
      if (homework.school_id != schoolId) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.status(200).json({
        success: true,
        homework,
      });
    } catch (error) {
      await connection.rollback();

      console.error("Update Homework Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // static async update(req, res) {
  //   const connection = await pool.getConnection();

  //   try {
  //     await connection.beginTransaction();

  //     const { id } = req.params;
  //     const schoolId = req.schoolId;

  //     const updates = req.body;

  //     const homework = await HomeworkModel.findById(id);

  //     if (!homework) {
  //       await connection.rollback();

  //       return res.status(404).json({
  //         success: false,
  //         message: "Homework not found",
  //       });
  //     }

  //     // School access check
  //     if (homework.school_id != schoolId) {
  //       await connection.rollback();

  //       return res.status(403).json({
  //         success: false,
  //         message: "Access denied",
  //       });
  //     }

  //     // File upload
  //     if (req.file) {
  //       updates.attachment = `${req.protocol}://${req.get(
  //         "host",
  //       )}/uploads/${req.file.filename}`;
  //     }

  //     // Validate dates
  //     if (updates.given_date && updates.submission_date) {
  //       if (new Date(updates.submission_date) < new Date(updates.given_date)) {
  //         await connection.rollback();

  //         return res.status(400).json({
  //           success: false,
  //           message: "Submission date cannot be before given date",
  //         });
  //       }
  //     }

  //     await HomeworkModel.update(id, updates, connection);

  //     await connection.commit();

  //     res.status(200).json({
  //       success: true,
  //       message: "Homework updated successfully",
  //     });
  //   } catch (error) {
  //     await connection.rollback();

  //     console.error("Update Homework Error:", error);

  //     res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   } finally {
  //     connection.release();
  //   }
  // }

  static async update(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;

      const updates = { ...req.body };

      // FIND HOMEWORK

      const homework = await HomeworkModel.findById(id);

      if (!homework) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Homework not found",
        });
      }

      // SCHOOL ACCESS CHECK

      // if (homework.school_id != Number(schoolId)) {
      //   await connection.rollback();

      //   return res.status(403).json({
      //     success: false,
      //     message: "Access denied",
      //   });
      // }

      // FILE UPLOAD HANDLING

      let oldAttachmentPath = null;

      if (req.file) {
        const newAttachment = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;

        updates.attachment = newAttachment;

        // Store old file path for deletion later
        if (homework.attachment) {
          const oldFileName = homework.attachment.split("/uploads/")[1];

          oldAttachmentPath = path.join(__dirname, "../uploads", oldFileName);
        }
      }

      // DATE VALIDATION

      const givenDate = updates.given_date || homework.given_date;

      const submissionDate =
        updates.submission_date || homework.submission_date;

      if (
        givenDate &&
        submissionDate &&
        new Date(submissionDate) < new Date(givenDate)
      ) {
        await connection.rollback();

        return res.status(400).json({
          success: false,
          message: "Submission date cannot be before given date",
        });
      }

      // CLEAN UPDATE DATA

      const cleanUpdates = {};

      Object.keys(updates).forEach((key) => {
        if (
          updates[key] !== undefined &&
          updates[key] !== null &&
          updates[key] !== ""
        ) {
          cleanUpdates[key] = updates[key];
        }
      });

      // UPDATE HOMEWORK

      if (Object.keys(cleanUpdates).length > 0) {
        await HomeworkModel.update(id, cleanUpdates, connection);
      }

      // COMMIT TRANSACTION

      await connection.commit();

      // DELETE OLD FILE AFTER COMMIT

      if (oldAttachmentPath && fs.existsSync(oldAttachmentPath)) {
        fs.unlinkSync(oldAttachmentPath);

        console.log("Old attachment deleted");
      }

      return res.status(200).json({
        success: true,
        message: "Homework updated successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Update Homework Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  static async delete(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const schoolId = req.schoolId;

      const homework = await HomeworkModel.findById(id);

      if (!homework) {
        await connection.rollback();

        return res.status(404).json({
          success: false,
          message: "Homework not found",
        });
      }

      // School access check
      if (homework.school_id != schoolId) {
        await connection.rollback();

        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await HomeworkModel.delete(id, connection);

      await connection.commit();

      res.status(200).json({
        success: true,
        message: "Homework deleted successfully",
      });
    } catch (error) {
      await connection.rollback();

      console.error("Delete Homework Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  static async getByClass(req, res) {
    try {
      const { classId } = req.params;
      const schoolId = req.schoolId;

      // Validate class belongs to school
      const classExists = await HomeworkModel.validateClass(classId, schoolId);

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      const homework = await HomeworkModel.findByClassId(classId);

      res.status(200).json({
        success: true,
        data: homework,
      });
    } catch (error) {
      console.error("Get Homework By Class Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getByTeacher(req, res) {
    try {
      const { teacherId } = req.params;
      const schoolId = req.schoolId;

      // Validate teacher
      const teacher = await TeacherModel.findById(teacherId);

      if (!teacher || teacher.school_id != schoolId) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      const homework = await HomeworkModel.findByTeacherId(teacherId);

      res.status(200).json({
        success: true,
        data: homework,
      });
    } catch (error) {
      console.error("Get Homework By Teacher Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = HomeworkController;
