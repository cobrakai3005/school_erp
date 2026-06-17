const { pool } = require("../config/database");
const StudyMaterialModel = require("../models/StudyMaterialModel");
const fs = require("fs");
const path = require("path");
class StudyMaterialController {
  // CREATE
  static async create(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const data = req.body;
      const schoolId = req.schoolId;
      const uploadedBy = req.user.id;
      const file = req.file;

      let file_path = null;
      let file_type = "other";

      if (file) {
        file_path = `${req.protocol}://${req.get("host")}/uploads/${
          file.filename
        }`;

        if (file.mimetype === "application/pdf") file_type = "pdf";
        else if (file.mimetype.startsWith("video/")) file_type = "video";
        else if (file.mimetype.startsWith("image/")) file_type = "image";
        else if (
          file.mimetype.includes("word") ||
          file.mimetype.includes("document")
        )
          file_type = "document";
      }
      const id = await StudyMaterialModel.create(
        {
          ...data,
          file_path: file_path ? file_path : null,
          file_type: file_type,
          uploaded_by: uploadedBy,
        },
        connection,
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: "Study material uploaded successfully",
        data: { id },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Create Study Material Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }

  // GET ALL
  static async getAll(req, res) {
    try {
      const schoolId = req.schoolId;
      const {
        page = 1,
        limit = 10,
        class_id,
        subject,
        status,
        search,
      } = req.query;

      const result = await StudyMaterialModel.findBySchool(
        schoolId,
        parseInt(page),
        parseInt(limit),
        {
          class_id,
          subject,
          status,
          search,
        },
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Study Materials Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET BY ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const material = await StudyMaterialModel.findById(id);

      if (!material) {
        return res.status(404).json({
          success: false,
          message: "Study material not found",
        });
      }

      res.json({
        success: true,
        data: material,
      });
    } catch (error) {
      console.error("Get Study Material Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // UPDATE

  static async update(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const data = req.body;
      const file = req.file;

      const material = await StudyMaterialModel.findById(id);

      if (!material) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Study material not found",
        });
      }

      let file_path = material.file_path;
      let file_type = material.file_type;

      // 🔥 NEW FILE UPLOADED
      if (file) {
        // 🗑 DELETE OLD FILE FIRST
        if (material.file_path) {
          const oldPath = path.join(
            __dirname,
            "..",
            material.file_path.replace(
              `${req.protocol}://${req.get("host")}`,
              "",
            ),
          );

          fs.unlink(oldPath, (err) => {
            if (err) {
              console.log("Old file delete error:", err.message);
            } else {
              console.log("Old file deleted:", oldPath);
            }
          });
        }

        // 📁 SET NEW FILE
        file_path = `${req.protocol}://${req.get("host")}/uploadsWWW/${
          file.filename
        }`;

        if (file.mimetype === "application/pdf") file_type = "pdf";
        else if (file.mimetype.startsWith("video/")) file_type = "video";
        else if (file.mimetype.startsWith("image/")) file_type = "image";
        else file_type = "document";
      }

      const updateData = {
        ...data,
        file_path,
        file_type,
      };

      await StudyMaterialModel.update(id, updateData, connection);

      await connection.commit();

      res.json({
        success: true,
        message: "Study material updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Update Study Material Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }
  // DELETE
  static async delete(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;

      const material = await StudyMaterialModel.findById(id);

      if (!material) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Study material not found",
        });
      }

      await StudyMaterialModel.delete(id, connection);

      await connection.commit();

      res.json({
        success: true,
        message: "Study material deleted successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Delete Study Material Error:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = StudyMaterialController;
