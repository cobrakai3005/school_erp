const express = require("express");

const router = express.Router({ mergeParams: true });
const {
  createTransportManager,
  updateTransportManager,
} = require("../validations/transportManager");
const TransportManagerController = require("../controllers/TransportManagerController");

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
const upload = require("../middleware/upload");
// All routes require authentication
router.use(verifyToken, setSchoolContext);

// Create transport manager
router.post(
  "/",
  isSchoolAdmin,
  createTransportManager,
  handleValidationErrors,
  upload.single("profile_image"),
  TransportManagerController.create,
);

// Get all transport managers
router.get(
  "/",
  checkPermission("transport", "read"),
  validationRules.pagination,
  handleValidationErrors,
  TransportManagerController.getAll,
);

// Get transport manager by ID
router.get(
  "/:id",
  checkPermission("transport", "read"),
  validationRules.idParam,
  handleValidationErrors,
  TransportManagerController.getById,
);

// Update transport manager
router.put(
  "/:id",
  isSchoolAdmin,
  updateTransportManager,
  validationRules.idParam,
  handleValidationErrors,
  upload.single("profile_image"),
  TransportManagerController.update,
);

// Delete transport manager
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  TransportManagerController.delete,
);

module.exports = router;
