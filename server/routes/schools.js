const express = require("express");
const router = express.Router({ mergeParams: true });
const SchoolController = require("../controllers/SchoolController");
const { verifyToken, isSuperAdmin } = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// All routes require super admin access
router.use(verifyToken, isSuperAdmin);

// Create school
router.post(
  "/",
  validationRules.createSchool,
  handleValidationErrors,
  SchoolController.create,
);

// Get all schools
router.get(
  "/",
  validationRules.pagination,
  handleValidationErrors,
  SchoolController.getAll,
);

// Get school by ID
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  SchoolController.getById,
);

// Update school
router.put(
  "/:id",
  validationRules.updateSchool,
  handleValidationErrors,
  SchoolController.update,
);

// Delete school
router.delete(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  SchoolController.delete,
);

// Update school status
router.patch(
  "/:id/status",
  validationRules.idParam,
  handleValidationErrors,
  SchoolController.updateStatus,
);

// Get school statistics
router.get(
  "/:id/statistics",
  validationRules.idParam,
  handleValidationErrors,
  SchoolController.getStatistics,
);

module.exports = router;
