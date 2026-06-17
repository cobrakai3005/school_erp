const TransportRouteModel = require("../models/TransportRouteModel");

class TransportRouteController {
  // Create Route
  static async create(req, res) {
    try {
      const routeData = req.body;

      // Check route code
      const existingRoute = await TransportRouteModel.findByRouteCode(
        routeData.route_code,
      );

      if (existingRoute) {
        return res.status(400).json({
          success: false,
          message: "Route code already exists",
        });
      }

      const routeId = await TransportRouteModel.create(routeData);

      res.status(201).json({
        success: true,
        message: "Transport route created successfully",
        data: {
          id: routeId,
        },
      });
    } catch (error) {
      console.error("Create Transport Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get All Routes
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      const result = await TransportRouteModel.findAll(
        parseInt(page),
        parseInt(limit),
        {
          status,
          search,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get All Transport Routes Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get Route By ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const route = await TransportRouteModel.findById(id);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
      }

      res.json({
        success: true,
        data: route,
      });
    } catch (error) {
      console.error("Get Transport Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update Route
  static async update(req, res) {
    try {
      const { id } = req.params;

      const updateData = req.body;

      const route = await TransportRouteModel.findById(id);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
      }

      await TransportRouteModel.update(id, updateData);

      res.json({
        success: true,
        message: "Transport route updated successfully",
      });
    } catch (error) {
      console.error("Update Transport Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete Route
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const route = await TransportRouteModel.findById(id);

      if (!route) {
        return res.status(404).json({
          success: false,
          message: "Transport route not found",
        });
      }

      await TransportRouteModel.delete(id);

      res.json({
        success: true,
        message: "Transport route deleted successfully",
      });
    } catch (error) {
      console.error("Delete Transport Route Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = TransportRouteController;
