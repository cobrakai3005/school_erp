const TransportStudentModel = require("../models/TransportStudentModel");

const StudentModel = require("../models/StudentModel");

const TransportRouteModel = require("../models/TransportRouteModel");

class TransportStudentController {
  // Assign Student Route
  static async create(req, res) {
    try {
      const routeData = req.body;

      // Check Student
      const student = await StudentModel.findById(routeData.student_id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check Route
      const route = await TransportRouteModel.findById(routeData.route_id);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
      }

      const assignmentId = await TransportStudentModel.create(routeData);

      res.status(201).json({
        success: true,
        message: "Student assigned to transport route successfully",
        data: {
          id: assignmentId,
        },
      });
    } catch (error) {
      console.error("Create Student Transport Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get All
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, route_id, search } = req.query;

      const result = await TransportStudentModel.findAll(
        parseInt(page),
        parseInt(limit),
        {
          status,
          route_id,
          search,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Student Routes Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get By ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const assignment = await TransportStudentModel.findById(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Student transport assignment not found",
        });
      }

      res.json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      console.error("Get Student Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get Student Routes
  static async getByStudent(req, res) {
    try {
      const { studentId } = req.params;

      const routes = await TransportStudentModel.findByStudentId(studentId);

      res.json({
        success: true,
        data: routes,
      });
    } catch (error) {
      console.error("Get Student Transport Routes Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update
  static async update(req, res) {
    try {
      const { id } = req.params;

      const updateData = req.body;

      const assignment = await TransportStudentModel.findById(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Student transport assignment not found",
        });
      }

      await TransportStudentModel.update(id, updateData);

      res.json({
        success: true,
        message: "Student transport route updated successfully",
      });
    } catch (error) {
      console.error("Update Student Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const assignment = await TransportStudentModel.findById(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Student transport assignment not found",
        });
      }

      await TransportStudentModel.delete(id);

      res.json({
        success: true,
        message: "Student transport assignment deleted successfully",
      });
    } catch (error) {
      console.error("Delete Student Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = TransportStudentController;
