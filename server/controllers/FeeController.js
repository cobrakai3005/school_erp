const ClassModel = require("../models/ClassModel");
const FeeModel = require("../models/FeeModel");

class FeeController {
  //  FEE STRUCTURES 

  // Create fee structure
  static async createStructure(req, res) {
    try {
      const feeData = req.body;
      const schoolId = req.schoolId;

      const structureId = await FeeModel.createStructure({
        ...feeData,
        school_id: schoolId,
      });

      res.status(201).json({
        success: true,
        message: "Fee structure created successfully",
        data: { id: structureId },
      });
    } catch (error) {
      console.error("Create Fee Structure Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all fee structures
  static async getStructures(req, res) {
    try {
      const schoolId = req.schoolId;
      const { page = 1, limit = 10, class_id, status } = req.query;

      const fullClass = await ClassModel.findById(class_id);

      const result = await FeeModel.getStructuresBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { class_id, status, academic_year: fullClass.academic_year },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Fee Structures Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get fee structure by ID
  static async getStructureById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const structure = await FeeModel.getStructureById(id);

      if (!structure) {
        return res.status(404).json({
          success: false,
          message: "Fee structure not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && structure.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: structure,
      });
    } catch (error) {
      console.error("Get Fee Structure Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update fee structure
  static async updateStructure(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      const structure = await FeeModel.getStructureById(id);

      if (!structure) {
        return res.status(404).json({
          success: false,
          message: "Fee structure not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && structure.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await FeeModel.updateStructure(id, updateData);

      res.json({
        success: true,
        message: "Fee structure updated successfully",
      });
    } catch (error) {
      console.error("Update Fee Structure Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete fee structure
  static async deleteStructure(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const structure = await FeeModel.getStructureById(id);

      if (!structure) {
        return res.status(404).json({
          success: false,
          message: "Fee structure not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && structure.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      await FeeModel.deleteStructure(id);

      res.json({
        success: true,
        message: "Fee structure deleted successfully",
      });
    } catch (error) {
      console.error("Delete Fee Structure Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //  FEE PAYMENTS 

  // Create fee payment
  static async createPayment(req, res) {
    try {
      const paymentData = req.body;
      const schoolId = req.schoolId;

      // Generate receipt number
      const receiptNo = await FeeModel.generateReceiptNo(schoolId);

      const paymentId = await FeeModel.createPayment({
        ...paymentData,
        receipt_no: receiptNo,
        payment_date:
          paymentData.payment_date || new Date().toISOString().split("T")[0],
        collected_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Fee payment recorded successfully",
        data: { id: paymentId, receipt_no: receiptNo },
      });
    } catch (error) {
      console.error("Create Fee Payment Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all fee payments
  static async getPayments(req, res) {
    try {
      const schoolId = req.schoolId;
      const {
        page = 1,
        limit = 10,
        student_id,
        class_id,
        payment_mode,
        status,
        from_date,
        to_date,
      } = req.query;

      const result = await FeeModel.getPaymentsBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { student_id, class_id, payment_mode, status, from_date, to_date },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Fee Payments Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get payment by ID
  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const payment = await FeeModel.getPaymentById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && payment.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error("Get Payment Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get payments by student
  static async getPaymentsByStudent(req, res) {
    try {
      const { studentId } = req.params;

      const payments = await FeeModel.getPaymentsByStudent(studentId);

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error("Get Student Payments Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await FeeModel.updatePaymentStatus(id, status);

      res.json({
        success: true,
        message: "Payment status updated successfully",
      });
    } catch (error) {
      console.error("Update Payment Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete payment
  static async deletePayment(req, res) {
    try {
      const { id } = req.params;

      await FeeModel.deletePayment(id);

      res.json({
        success: true,
        message: "Payment deleted successfully",
      });
    } catch (error) {
      console.error("Delete Payment Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get fee summary
  static async getFeeSummary(req, res) {
    try {
      const schoolId = req.schoolId;
      const { academic_year } = req.query;

      const summary = await FeeModel.getFeeSummary(schoolId, academic_year);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get Fee Summary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = FeeController;
