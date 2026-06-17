const ParentModel = require("../models/ParentModel");
const path = require("path");
const fs = require("fs");
const UserModel = require("../models/UserModel");
class ParentController {
  static async createParent(req, res) {
    try {
      const {
        school_id,
        username,
        email,
        password,
        full_name,
        phone,
        address,
        student_id,
        relationship,
        is_primary,
      } = req.body;
      let profile_image = null;

      if (req.file) {
        profile_image = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;
      }
      const userData = {
        school_id: school_id || req.schoolId,
        username,
        email,
        password,
        full_name,
        phone,
        address,
        profile_image,
      };
      const parentData = { student_id, relationship, is_primary };

      const result = await ParentModel.create(userData, parentData);

      res
        .status(201)
        .json({ message: "Parent created successfully", data: result });
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: error.message });
    }
  }
  static async getAllParents(req, res) {
    try {
      const schoolId = req.schoolId; // Usually from auth middleware

      const parents = await ParentModel.findAll(schoolId);
      res.status(200).json(parents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async getParentById(req, res) {
    try {
      const parent = await ParentModel.findById(req.params.id);
      if (!parent) return res.status(404).json({ message: "Parent not found" });
      res.status(200).json(parent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async updateParent(req, res) {
    try {
      console.log("Updating Parent");

      const updateData = req.body;
      const { id } = req.params;
      const schoolId = req.schoolId;

      // Find parent
      const parent = await ParentModel.findById(id);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent Not Found",
        });
      }

      console.log(parent);

      // Access check
      // if (
      //   !req.user.isSuperAdmin &&
      //   parent.school_id != Number(schoolId)
      // ) {
      //   return res.status(403).json({
      //     success: false,
      //     message: "Access Denied",
      //   });
      // }

      // User update object
      let userUpdateData = {};

      // Profile Image Handling

      if (req.file) {
        const newProfilePic = `${req.protocol}://${req.get(
          "host",
        )}/uploads/${req.file.filename}`;

        userUpdateData.profile_image = newProfilePic;

        console.log(userUpdateData);

        // Get user details
        const user = await UserModel.findById(parent.user_id);

        // Delete old image
        if (user?.profile_image) {
          console.log(user.profile_image);

          const oldFileName = user.profile_image.split("/uploads/")[1];

          const oldPath = path.join(__dirname, "../uploads", oldFileName);

          console.log(oldPath);

          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
            console.log("Old image deleted");
          } else {
            console.log("Old image not found");
          }
        }
      }

      // Other User Fields

      if (updateData.full_name) {
        userUpdateData.full_name = updateData.full_name;
      }

      if (updateData.email) {
        userUpdateData.email = updateData.email;
      }

      if (updateData.username) {
        userUpdateData.username = updateData.username;
      }

      if (updateData.address) {
        userUpdateData.address = updateData.address;
      }

      // Update user table
      if (Object.keys(userUpdateData).length > 0) {
        await UserModel.update(parent.user_id, userUpdateData);
      }

      // Parent Table Update

      const cleanParentData = {};

      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] !== undefined &&
          updateData[key] !== "" &&
          key !== "id" &&
          key !== "user_id"
        ) {
          cleanParentData[key] = updateData[key];
        }
      });

      // Update parent table
      if (Object.keys(cleanParentData).length > 0) {
        await ParentModel.update(id, cleanParentData, req.user);
      }

      return res.status(200).json({
        success: true,
        message: "Parent updated successfully",
      });
    } catch (error) {
      console.error("Update Parent Error:", error);

      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to update parent",
      });
    }
  }
  static async deleteParent(req, res) {
    try {
      await ParentModel.delete(req.params.id);
      res.status(200).json({ message: "Parent soft deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ParentController;
