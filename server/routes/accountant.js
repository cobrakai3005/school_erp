const AccountantController = require("../controllers/AccountantController");
const express = require("express");

const router = express.Router({ mergeParams: true });

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

// All routes require authentication + school context
router.use(verifyToken, setSchoolContext);

//  ACCOUNTANTS

// Create accountant
router.post(
  "/",
  upload.single("profile_image"),
  isSchoolAdmin,
  validationRules.createAccountant,
  handleValidationErrors,
  AccountantController.create,
);

// Get all accountants
router.get(
  "/",
  checkPermission("accountants", "read"),
  AccountantController.getAll,
);

// Get accountant by ID
router.get(
  "/:id",
  validationRules.idParam,
  handleValidationErrors,
  checkPermission("accountants", "read"),
  AccountantController.getById,
);

// Update accountant
router.put(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  upload.single("profile_image"),
  handleValidationErrors,
  AccountantController.update,
);

// Delete accountant
router.delete(
  "/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  AccountantController.delete,
);

module.exports = router;
