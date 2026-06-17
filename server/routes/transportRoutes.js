const express = require("express");

const router = express.Router({ mergeParams: true });
const {
  createRoute,
  updateRoute,
} = require("../validations/transportRouteValidation");
const TransportRouteController = require("../controllers/TransportRouteController");

const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  checkPermission,
} = require("../middleware/auth");

const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// Auth Middleware
router.use(verifyToken, setSchoolContext);

// Create Route
router.post(
  "/",
  isSchoolAdmin,
  createRoute,
  handleValidationErrors,

  TransportRouteController.create,
);

// Get All Routes
router.get(
  "/",
  checkPermission("transport", "read"),
  validationRules.pagination,
  handleValidationErrors,
  TransportRouteController.getAll,
);

// Get Route By ID
router.get(
  "/:id",
  checkPermission("transport", "read"),
  validationRules.idParam,
  handleValidationErrors,
  TransportRouteController.getById,
);

// Update Route
router.put(
  "/:id",
  isSchoolAdmin,
  updateRoute,
  validationRules.idParam,

  handleValidationErrors,
  TransportRouteController.update,
);

// Delete Route
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  TransportRouteController.delete,
);

module.exports = router;
