const SalaryModel = require("../models/SalaryModel");

class SalaryController {
  // Create salary record
  static async create(req, res) {
    try {
      const salaryData = req.body;

      // Check if salary already exists for this staff/month/year
      const exists = await SalaryModel.exists(
        salaryData.staff_id,
        salaryData.month,
        salaryData.year,
      );

      if (exists) {
        return res.status(400).json({
          success: false,
          message:
            "Salary record already exists for this staff member for the specified month/year",
        });
      }

      // Calculate net salary if not provided
      const netSalary =
        salaryData.net_salary ||
        parseFloat(salaryData.basic_salary || 0) +
          parseFloat(salaryData.allowances || 0) +
          parseFloat(salaryData.bonus || 0) -
          parseFloat(salaryData.deductions || 0) -
          parseFloat(salaryData.advance_deduction || 0);

      const salaryId = await SalaryModel.create({
        ...salaryData,
        net_salary: netSalary,
        generated_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Salary record created successfully",
        data: { id: salaryId },
      });
    } catch (error) {
      console.error("Create Salary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all salary records by school
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const {
        page = 1,
        limit = 10,
        month,
        year,
        staff_type,
        status,
        staff_id,
      } = req.query;

      const result = await SalaryModel.getBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        { month, year, staff_type, status, staff_id },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Salaries Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get salary record by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const schoolId = req.schoolId;

      const salary = await SalaryModel.getById(id);

      if (!salary) {
        return res.status(404).json({
          success: false,
          message: "Salary record not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && salary.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      res.json({
        success: true,
        data: salary,
      });
    } catch (error) {
      console.error("Get Salary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get salary records by staff
  static async getByStaff(req, res) {
    try {
      const { staffId } = req.params;
      const { year } = req.query;

      const salaries = await SalaryModel.getByStaff(staffId, year);

      res.json({
        success: true,
        data: salaries,
      });
    } catch (error) {
      console.error("Get Staff Salaries Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update salary record
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const schoolId = req.schoolId;

      const salary = await SalaryModel.getById(id);

      if (!salary) {
        return res.status(404).json({
          success: false,
          message: "Salary record not found",
        });
      }

      // Check school access
      if (!req.user.isSuperAdmin && salary.school_id != schoolId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check if already paid
      if (salary.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Cannot modify a paid salary record",
        });
      }

      // Recalculate net salary if components changed
      if (
        updateData.basic_salary ||
        updateData.allowances ||
        updateData.deductions ||
        updateData.bonus ||
        updateData.advance_deduction
      ) {
        const basicSalary = updateData.basic_salary ?? salary.basic_salary ?? 0;
        const allowances = updateData.allowances ?? salary.allowances ?? 0;
        const deductions = updateData.deductions ?? salary.deductions ?? 0;
        const bonus = updateData.bonus ?? salary.bonus ?? 0;
        const advanceDeduction =
          updateData.advance_deduction ?? salary.advance_deduction ?? 0;

        updateData.net_salary =
          parseFloat(basicSalary) +
          parseFloat(allowances) +
          parseFloat(bonus) -
          parseFloat(deductions) -
          parseFloat(advanceDeduction);
      }

      await SalaryModel.update(id, updateData);

      res.json({
        success: true,
        message: "Salary record updated successfully",
      });
    } catch (error) {
      console.error("Update Salary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark salary as paid
  static async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      const { payment_date } = req.body;

      await SalaryModel.markAsPaid(
        id,
        payment_date || new Date().toISOString().split("T")[0],
      );

      res.json({
        success: true,
        message: "Salary marked as paid successfully",
      });
    } catch (error) {
      console.error("Mark Salary Paid Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete salary record
  static async delete(req, res) {
    try {
      const { id } = req.params;

      await SalaryModel.delete(id);

      res.json({
        success: true,
        message: "Salary record cancelled successfully",
      });
    } catch (error) {
      console.error("Delete Salary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Generate bulk salaries
  static async generateBulk(req, res) {
    try {
      const schoolId = req.schoolId;
      const { month, year } = req.body;

      const result = await SalaryModel.generateBulkSalaries(
        schoolId,
        month,
        year,
        req.user.id,
      );

      res.status(201).json({
        success: true,
        message: `Generated ${result.created} salary records. ${result.skipped} already existed.`,
        data: result,
      });
    } catch (error) {
      console.error("Generate Bulk Salaries Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get salary summary
  static async getSummary(req, res) {
    try {
      const schoolId = req.schoolId;
      const { year } = req.query;

      const summary = await SalaryModel.getSalarySummary(
        schoolId,
        parseInt(year) || new Date().getFullYear(),
      );

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get Salary Summary Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = SalaryController;
