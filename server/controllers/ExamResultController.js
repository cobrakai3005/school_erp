const ExamResultModel = require("../models/ExamResultModel");

class ExamResultController {
  // ADD RESULT
  static async create(req, res) {
    try {
      const resultData = req.body;

      const id = await ExamResultModel.create({
        ...resultData,
        entered_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Exam result created successfully",
        data: { id },
      });
    } catch (error) {
      console.error("Create Result Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // BULK RESULTS
  static async createBulk(req, res) {
    try {
      const { exam_id, results } = req.body;

      await ExamResultModel.createBulk(exam_id, results, req.user.id);

      res.status(201).json({
        success: true,
        message: "Bulk results added successfully",
      });
    } catch (error) {
      console.error("Bulk Result Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET BY EXAM
  static async getByExam(req, res) {
    try {
      const { examId } = req.params;

      const {
        page = 1,
        limit = 10,
        search = "",
        subject,
        student_id,
        grade,
      } = req.query;

      const result = await ExamResultModel.getByExam(
        examId,
        parseInt(page),
        parseInt(limit),
        {
          search,
          subject,
          student_id,
          grade,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Exam Results Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET BY STUDENT
  static async getByStudent(req, res) {
    try {
      const { studentId } = req.params;

      const results = await ExamResultModel.getByStudent(studentId);

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

  // REPORT CARD
  static async getReportCard(req, res) {
    try {
      const { studentId, examId } = req.params;

      const data = await ExamResultModel.getReportCard(studentId, examId);

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No results found",
        });
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Report Card Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // UPDATE
  static async update(req, res) {
    try {
      const { id } = req.params;

      await ExamResultModel.update(id, req.body);

      res.json({
        success: true,
        message: "Result updated successfully",
      });
    } catch (error) {
      console.error("Update Result Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  // DELETE
  static async delete(req, res) {
    try {
      const { id } = req.params;

      await ExamResultModel.delete(id);

      res.json({
        success: true,
        message: "Result deleted successfully",
      });
    } catch (error) {
      console.error("Delete Result Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = ExamResultController;
