const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const authorize = require('../_middleware/authenticate');

// Profile image routes
router.get('/profile/:userId', authorize(), uploadController.getProfileImage);
router.post('/profile', authorize(), uploadController.uploadMiddleware, uploadController.uploadProfileImage);
router.delete('/profile', authorize(), uploadController.deleteProfileImage);

// Follower image routes
router.get('/follower/:userId', authorize(), uploadController.getFollowerImage);
router.post('/follower', authorize(), uploadController.uploadMiddleware, uploadController.uploadFollowerImage);
router.delete('/follower', authorize(), uploadController.deleteFollowerImage);

module.exports = router; 