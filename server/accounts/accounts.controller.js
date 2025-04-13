const express = require('express');
const router = express.Router();
const { upload, uploadProfileImage } = require('./upload.controller');

// Add the upload route
router.post('/upload-profile-image', 
    authenticate, 
    upload.single('profileImage'), 
    uploadProfileImage
); 