const express = require('express');
const router = express.Router();
const { uploadMiddleware, uploadFollowerImage } = require('./upload.controller');
const authorize = require('../_middleware/authenticate');

// Follower image upload route
router.post('/follower-image', 
    authorize(),
    uploadMiddleware,
    uploadFollowerImage
);

module.exports = router;