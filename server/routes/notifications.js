const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { verifyToken, setSchoolContext, isSchoolAdmin, checkPermission } = require('../middleware/auth');

// All routes require authentication and school context
router.use(verifyToken, setSchoolContext);

// User routes - available to all authenticated users
router.get('/my', NotificationController.getMyNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.post('/:id/read', NotificationController.markAsRead);
router.post('/read-all', NotificationController.markAllAsRead);

// Admin routes - create, update, delete notifications
router.get('/', isSchoolAdmin, NotificationController.getAll);
router.get('/:id', NotificationController.getById);
router.post('/', isSchoolAdmin, NotificationController.create);
router.put('/:id', isSchoolAdmin, NotificationController.update);
router.delete('/:id', isSchoolAdmin, NotificationController.delete);

module.exports = router;
