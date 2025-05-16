const express = require('express');
const router = express.Router();
const { cleanupOldSessions, deleteAllExceptSuperAdmin, deleteAllButMostRecentPerUser } = require('../controllers/sessions.controller');
// TODO: Add your authentication/authorization middleware as needed
// const { authenticate, authorizeAdmin } = require('../middleware/auth');

// For now, no auth middleware for demo/testing
router.delete('/cleanup-old', cleanupOldSessions);
router.delete('/delete-all-except-super-admin', deleteAllExceptSuperAdmin);
router.delete('/delete-all-but-most-recent', deleteAllButMostRecentPerUser);

module.exports = router;
