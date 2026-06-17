const express = require('express');
const router = express.Router({ mergeParams: true });
const SalaryController = require('../controllers/SalaryController');
const { verifyToken, setSchoolContext, isAccountantSalary, isSchoolAdmin, checkPermission } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Create salary record (admin or salary accountant)
router.post(
  '/',
  isAccountantSalary,
  validationRules.createSalaryRecord,
  handleValidationErrors,
  SalaryController.create
);

// Get all salary records (admin or salary accountant)
router.get(
  '/',
  isAccountantSalary,
  validationRules.pagination,
  handleValidationErrors,
  SalaryController.getAll
);

// Get salary record by ID
router.get(
  '/:id',
  checkPermission('salary', 'read'),
  validationRules.idParam,
  handleValidationErrors,
  SalaryController.getById
);

// Get salary records by staff
router.get(
  '/staff/:staffId',
  checkPermission('salary', 'read'),
  SalaryController.getByStaff
);

// Update salary record (admin or salary accountant)
router.put(
  '/:id',
  isAccountantSalary,
  validationRules.idParam,
  handleValidationErrors,
  SalaryController.update
);

// Mark salary as paid (admin or salary accountant)
router.patch(
  '/:id/pay',
  isAccountantSalary,
  validationRules.idParam,
  handleValidationErrors,
  SalaryController.markAsPaid
);

// Delete salary record (admin only)
router.delete(
  '/:id',
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  SalaryController.delete
);

// Generate bulk salaries (admin or salary accountant)
router.post(
  '/generate-bulk',
  isAccountantSalary,
  SalaryController.generateBulk
);

// Get salary summary (admin or salary accountant)
router.get('/reports/summary', isAccountantSalary, SalaryController.getSummary);

module.exports = router;
