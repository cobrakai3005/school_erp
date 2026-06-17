const ExamModel = require("../models/ExamModel");

class ExamController {
  //  Exams

  // Create exam
  static async create(req, res) {
    try {
      const examData = req.body;
      const schoolId = req.schoolId;

      const examId = await ExamModel.create({
        ...examData,
        school_id: schoolId,
      });

      res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: { id: examId },
      });
    } catch (error) {
      console.error("Create Exam Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all exams by school
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const {
        page = 1,
        limit = 10,
        class_id,
        exam_type,
        status,
        academic_year,
      } = req.query;

      const result = await ExamModel.getBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { class_id, exam_type, status, academic_year },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Exams Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get exam by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const exam = await ExamModel.getById(id);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && exam.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: exam,
      });
    } catch (error) {
      console.error("Get Exam Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update exam
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      const exam = await ExamModel.getById(id);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && exam.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await ExamModel.update(id, updateData);

      res.json({
        success: true,
        message: "Exam updated successfully",
      });
    } catch (error) {
      console.error("Update Exam Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete exam
  static async delete(req, res) {
    try {
      const { id } = req.params;

      await ExamModel.delete(id);

      res.json({
        success: true,
        message: "Exam cancelled successfully",
      });
    } catch (error) {
      console.error("Delete Exam Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //  EXAM RESULTS

  // Add exam result
  static async addResult(req, res) {
    try {
      const resultData = req.body;

      await ExamModel.addResult({
        ...resultData,
        entered_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Result added successfully",
      });
    } catch (error) {
      console.error("Add Result Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Add bulk results
  static async addBulkResults(req, res) {
    try {
      const { exam_id, results } = req.body;

      await ExamModel.addBulkResults(exam_id, results, req.user.id);

      res.status(201).json({
        success: true,
        message: "Results added successfully",
      });
    } catch (error) {
      console.error("Add Bulk Results Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get results by exam
  static async getResultsByExam(req, res) {
    try {
      const { examId } = req.params;

      const results = await ExamModel.getResultsByExam(examId);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Get Exam Results Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get results by student
  static async getResultsByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { academic_year } = req.query;

      const results = await ExamModel.getResultsByStudent(
        studentId,
        academic_year,
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Get Student Results Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get student report card
  static async getReportCard(req, res) {
    try {
      const { studentId, examId } = req.params;

      const reportCard = await ExamModel.getStudentReportCard(
        studentId,
        examId,
      );

      if (!reportCard) {
        return res.status(404).json({
          success: false,
          message: "Results not found",
        });
      }

      res.json({
        success: true,
        data: reportCard,
      });
    } catch (error) {
      console.error("Get Report Card Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get class rankings
  static async getClassRankings(req, res) {
    try {
      const { examId } = req.params;

      const rankings = await ExamModel.getClassRankings(examId);

      res.json({
        success: true,
        data: rankings,
      });
    } catch (error) {
      console.error("Get Class Rankings Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = ExamController;
