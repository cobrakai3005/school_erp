const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const { hasPermission, ROLES } = require("../config/roles");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is active
    let query, params;

    if (decoded.isSuperAdmin) {
      query = "SELECT * FROM super_admin_users WHERE id = ? AND status = ?";
      params = [decoded.id, "active"];
    } else {
      query = "SELECT * FROM users WHERE id = ? AND status = ?";
      params = [decoded.id, "active"];
    }

    const [users] = await pool.query(query, params);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive.",
      });
    }

    req.user = {
      ...decoded,
      ...users[0],
      password: undefined, // Don't include password
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

// Check if user is super admin
const isSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin privileges required.",
    });
  }
  next();
};

// Check if user belongs to a specific school
const belongsToSchool = (req, res, next) => {
  const schoolId =
    req.params.schoolId ||
    req.body.school_id ||
    req.query.school_id ||
    req.user?.school_id;

  // Super admin can access any school
  if (req.user?.isSuperAdmin) {
    req.schoolId = schoolId;
    return next();
  }

  // Regular users must belong to the school
  if (req.user?.school_id != schoolId) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You do not belong to this school.",
    });
  }

  req.schoolId = req.user.school_id;
  next();
};

// Automatically set school_id from authenticated user
const setSchoolContext = (req, res, next) => {
  if (req.user?.isSuperAdmin) {
    req.schoolId =
      req.params.schoolId ||
      req.body.school_id ||
      req.query.school_id ||
      req.user?.school_id;
  } else {
    req.schoolId = req.user?.school_id;
  }
  next();
};

// Check role-based permissions
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user?.isSuperAdmin
      ? ROLES.SUPER_ADMIN
      : req.user?.user_type;

    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You don't have permission to ${action} ${resource}.`,
      });
    }

    next();
  };
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.isSuperAdmin
      ? ROLES.SUPER_ADMIN
      : req.user?.user_type;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// School Admin check
const isSchoolAdmin = (req, res, next) => {
  if (req.user?.isSuperAdmin || req.user?.user_type === ROLES.ADMIN) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. School admin privileges required.",
  });
};

// Accountant (Fee) specific middleware
const isAccountantFee = (req, res, next) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT_FEE];
  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Fee accountant privileges required.",
    });
  }
  next();
};

// Accountant (Salary) specific middleware
const isAccountantSalary = (req, res, next) => {
  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.ACCOUNTANT_SALARY,
  ];
  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Salary accountant privileges required.",
    });
  }
  next();
};

// Teacher specific middleware
const isTeacher = (req, res, next) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER];
  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Teacher privileges required.",
    });
  }
  next();
};

// Librarian specific middleware
const isLibrarian = (req, res, next) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.LIBRARIAN];
  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Librarian privileges required.",
    });
  }
  next();
};
const isParent = (req, res, next) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PARENT];
  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Parent privileges required.",
    });
  }
  next();
};

// Transport Manager specific middleware
const isTransportManager = (req, res, next) => {
  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.TRANSPORT_MANAGER,
  ];
  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Transport manager privileges required.",
    });
  }
  next();
};
const isStudent = (req, res, next) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT];

  const userRole = req.user?.isSuperAdmin
    ? ROLES.SUPER_ADMIN
    : req.user?.user_type;

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Student privileges required.",
    });
  }

  next();
};
module.exports = {
  verifyToken,
  isSuperAdmin,
  belongsToSchool,
  setSchoolContext,
  checkPermission,
  restrictTo,
  isSchoolAdmin,
  isAccountantFee,
  isAccountantSalary,
  isTeacher,
  isLibrarian,
  isTransportManager,
  isStudent,
  isParent,
};
