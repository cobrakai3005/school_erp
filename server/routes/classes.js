const express = require('express');
const router = express.Router({ mergeParams: true });
const ClassController = require('../controllers/ClassController');
const { verifyToken, setSchoolContext, isSchoolAdmin, checkPermission } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// Create class (admin only)
router.post(
  '/',
  isSchoolAdmin,
  validationRules.createClass,
  handleValidationErrors,
  ClassController.create
);

// Get all classes
router.get(
  '/',
  checkPermission('classes', 'read'),
  validationRules.pagination,
  handleValidationErrors,
  ClassController.getAll
);

// Get class by ID
router.get(
  '/:id',
  checkPermission('classes', 'read'),
  validationRules.idParam,
  handleValidationErrors,
  ClassController.getById
);

// Update class (admin only)
router.put(
  '/:id',
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  ClassController.update
);

// Delete class (admin only)
router.delete(
  '/:id',
  isSchoolAdmin,
  validationRules.idParam,
  handleValidationErrors,
  ClassController.delete
);

// Get students in class
router.get(
  '/:id/students',
  checkPermission('students', 'read'),
  validationRules.idParam,
  handleValidationErrors,
  ClassController.getStudents
);

module.exports = router;
