const express = require('express');
const router = express.Router();
const { authenticate } = require('../_middleware/authenticate');
const { upload, uploadProfileImage } = require('./upload.controller');

console.log('Setting up accounts routes...');

// Add the upload route
router.post('/upload-profile-image', 
    authenticate, 
    upload.single('profileImage'), 
    (req, res, next) => {
        console.log('Received upload request:', {
            file: req.file,
            user: req.user?.id,
            contentType: req.get('Content-Type')
        });
        uploadProfileImage(req, res, next);
    }
);

// Export all routes
module.exports = router; 