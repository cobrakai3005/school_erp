const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SuperAdminModel = require("../models/SuperAdminModel");
const UserModel = require("../models/UserModel");
const SchoolModel = require("../models/SchoolModel");
const StudentModel = require("../models/StudentModel");
const TeacherModel = require("../models/TeacherModel");
const AccountantModel = require("../models/AccountantModel");

class AuthController {
  // Super Admin Login
  static async superAdminLogin(req, res) {
    try {
      const { email, password } = req.body;
      const isProduction = process.env.NODE_ENV === "production";
      const admin = await SuperAdminModel.findByEmail(email);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (admin.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Account is inactive",
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Update last login
      await SuperAdminModel.updateLastLogin(admin.id);

      // Generate token
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          isSuperAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            full_name: admin.full_name,
            role: admin.role,
            isSuperAdmin: true,
          },
        },
      });
    } catch (error) {
      console.error("Super Admin Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // School User Login
  static async login(req, res) {
    try {
      const { email, password, school_code } = req.body;
      const isProduction = process.env.NODE_ENV === "production";
      // Find school by code if provided
      let schoolId = null;
      if (school_code) {
        const school = await SchoolModel.findByCode(school_code);
        if (!school || school.status !== "active") {
          return res.status(401).json({
            success: false,
            message: "Invalid school code or school is inactive",
          });
        }
        schoolId = school.id;
      }

      const user = await UserModel.findByEmail(email, schoolId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (user.status !== "active") {
        return res.status(401).json({
          success: false,
          message: "Account is inactive or blocked",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Update last login
      await UserModel.updateLastLogin(user.id);

      // Get school info
      const school = await SchoolModel.findById(user.school_id);
      let result;
      switch (user.user_type) {
        case "student":
          result = await StudentModel.findByUserId(user.id);
          break;
        case "teacher":
          result = await TeacherModel.findByUserId(user.id);
          break;
        // case "accountant_fee":
        //   result = await AccountantModel.findByUserId(user.id);
        //   break;
        // case "accountant_salary":
        //   result = await StudentModel.findByUserId(user.id);
        //   break;
        // case "accountant_both":
        //   result = await StudentModel.findByUserId(user.id);
        //   break;

        default:
          break;
      }
      // console.log(result);

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          school_id: user.school_id,
          isSuperAdmin: false,
          class_id: user.user_type === "student" ? result.class_id : "",
          teacher_id: user.user_type === "teacher" ? result.id : "",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            class_id: user.user_type === "student" ? result.class_id : "",
            teacher_id: user.user_type === "teacher" ? result.id : "",
            phone: user.phone,
            profile_image: user.profile_image,
          },
          school: school
            ? {
                id: school.id,
                school_code: school.school_code,
                school_name: school.school_name,
                logo: school.logo,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      if (req.user.isSuperAdmin) {
        const admin = await SuperAdminModel.findById(req.user.id);
        return res.json({
          success: true,
          data: { ...admin, isSuperAdmin: true },
        });
      }

      const user = await UserModel.findById(req.user.id);
      const school = await SchoolModel.findById(user.school_id);

      res.json({
        success: true,
        data: {
          user,
          school: school
            ? {
                id: school.id,
                school_code: school.school_code,
                school_name: school.school_name,
                logo: school.logo,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Get Profile Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;

      let user;
      if (req.user.isSuperAdmin) {
        user = await SuperAdminModel.findByEmail(req.user.email);
      } else {
        user = await UserModel.findByEmail(req.user.email);
      }

      const isMatch = await bcrypt.compare(current_password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      if (req.user.isSuperAdmin) {
        await SuperAdminModel.update(req.user.id, { password: hashedPassword });
      } else {
        await UserModel.update(req.user.id, { password: hashedPassword });
      }

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change Password Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create Super Admin (initial setup)
  static async createSuperAdmin(req, res) {
    try {
      const { username, email, password, full_name } = req.body;

      // Check if any super admin exists
      const existingAdmins = await SuperAdminModel.findAll();
      if (existingAdmins.length > 0 && !req.user?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "Super admin already exists. Only existing super admins can create new ones.",
        });
      }

      // Check if email already exists
      const existingEmail = await SuperAdminModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const adminId = await SuperAdminModel.create({
        username,
        email,
        password: hashedPassword,
        full_name,
        role: "super_admin",
      });

      res.status(201).json({
        success: true,
        message: "Super admin created successfully",
        data: { id: adminId },
      });
    } catch (error) {
      console.error("Create Super Admin Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = AuthController;
