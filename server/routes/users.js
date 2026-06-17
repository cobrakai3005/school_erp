const express = require("express");
const UserController = require("../controllers/UserController");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
} = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

const router = express.Router({ mergeParams: true });
// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Get all users
router.get(
  "/",
  validationRules.pagination,
  handleValidationErrors,
  UserController.getAll,
);
// Create user (admin only)
router.post(
  "/",
  isSchoolAdmin,
  validationRules.createUser,
  handleValidationErrors,
  UserController.create,
);

// Get users by type
router.get("/type/:type", UserController.getByType);

// Get user by ID
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  UserController.getById,
);

// Update user (admin only)
router.put(
  "/:id",
  isSchoolAdmin,
  validationRules.updateUser,
  handleValidationErrors,
  UserController.update,
);

// Delete user (admin only)
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  UserController.delete,
);

// Update user status (admin only)
router.patch(
  "/:id/status",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  UserController.updateStatus,
);

module.exports = router;
