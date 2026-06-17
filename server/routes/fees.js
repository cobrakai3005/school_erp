const express = require("express");
const router = express.Router({ mergeParams: true });
const FeeController = require("../controllers/FeeController");
const {
  verifyToken,
  setSchoolContext,
  isSchoolAdmin,
  isAccountantFee,
  checkPermission,
} = require("../middleware/auth");
const {
  validationRules,
  handleValidationErrors,
} = require("../middleware/validation");

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// FEE STRUCTURES
// Fee structures are managed by admin only

// Create fee structure (admin only)
router.post(
  "/structures",
  isSchoolAdmin,
  validationRules.createFeeStructure,
  handleValidationErrors,
  FeeController.createStructure,
);

// Get all fee structures
router.get(
  "/structures",
  checkPermission("fee_structures", "read"),
  validationRules.pagination,
  handleValidationErrors,
  FeeController.getStructures,
);

// Get fee structure by ID
router.get(
  "/structures/:id",
  checkPermission("fee_structures", "read"),
  validationRules.idParam,
  handleValidationErrors,
  FeeController.getStructureById,
);

// Update fee structure (admin only)
router.put(
  "/structures/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  FeeController.updateStructure,
);

// Delete fee structure (admin only)
router.delete(
  "/structures/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  FeeController.deleteStructure,
);

// FEE PAYMENTS
// Fee payments can be managed by fee accountant

// Create fee payment (admin or fee accountant)
router.post(
  "/payments",
  isAccountantFee,
  validationRules.createFeePayment,
  handleValidationErrors,
  FeeController.createPayment,
);

// Get all fee payments (admin or fee accountant)
router.get(
  "/payments",
  isAccountantFee,
  validationRules.pagination,
  handleValidationErrors,
  FeeController.getPayments,
);

// Get payment by ID
router.get(
  "/payments/:id",
  checkPermission("fee_payments", "read"),
  validationRules.idParam,
  handleValidationErrors,
  FeeController.getPaymentById,
);

// Get payments by student
router.get(
  "/payments/student/:studentId",
  checkPermission("fee_payments", "read"),
  FeeController.getPaymentsByStudent,
);

// Update payment status (admin or fee accountant)
router.patch(
  "/payments/:id/status",
  isAccountantFee,
  validationRules.idParam,
  handleValidationErrors,
  FeeController.updatePaymentStatus,
);

// Delete payment (admin only)
router.delete(
  "/payments/:id",
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  FeeController.deletePayment,
);

// Get fee summary (admin or fee accountant)
router.get("/summary", isAccountantFee, FeeController.getFeeSummary);

module.exports = router;
