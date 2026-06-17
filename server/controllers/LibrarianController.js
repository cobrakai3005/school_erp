const LibrarianModel = require("../models/LibrarianModel.js");

class LibrarianController {
  // Create Librarian
  static async create(req, res) {
    try {
      let profile_image = null;
      console.log(req.body);

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }
      let data = { ...req.body };
      if (profile_image) {
        data = { profile_image: profile_image, ...req.body };
      }
      console.log(data, req.body);

      const librarian = await LibrarianModel.create({
        ...data,
        school_id: req.schoolId,
      });

      res.status(201).json({
        success: true,
        data: librarian,
        message: "Librarian created successfully",
      });
    } catch (error) {
      console.error("Create Librarian Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get All Librarians
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;

      let { page = 1, limit = 10, search, status } = req.query;

      page = Math.max(1, parseInt(page) || 1);
      limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

      const result = await LibrarianModel.findBySchool(schoolId, page, limit, {
        search,
        status,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Librarians Error:", error);

      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get By ID
  static async getById(req, res) {
    try {
      const librarian = await LibrarianModel.findById(req.params.id);

      if (!librarian) {
        return res.status(404).json({
          success: false,
          message: "Librarian not found",
        });
      }

      res.json({
        success: true,
        data: librarian,
      });
    } catch (error) {
      console.error("Get Librarian Error:", error);

      res.status(500).json({
        success: false,

        message: error.message || "Internal server error",
      });
    }
  }

  // Update
  // Update Librarian
  static async update(req, res) {
    try {
      let profile_image;

      // Only set if file uploaded
      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }

      const data = {
        ...req.body,
      };

      // Add profile image only if uploaded
      if (profile_image) {
        data.profile_image = profile_image;
      }

      const librarian = await LibrarianModel.update(
        req.params.id,
        data,
        req.user,
      );

      return res.status(200).json({
        success: true,
        librarian,
        message: "Librarian updated successfully",
      });
    } catch (error) {
      console.error("Update Librarian Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  // Delete
  static async delete(req, res) {
    try {
      await LibrarianModel.delete(req.params.id);

      res.json({
        success: true,
        message: "Librarian deleted successfully",
      });
    } catch (error) {
      console.error("Delete Librarian Error:", error);

      res.status(500).json({
        success: false,

        message: error.message || "Internal server error",
      });
    }
  }
}

module.exports = LibrarianController;
