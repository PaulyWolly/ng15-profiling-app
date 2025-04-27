const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authorize = require('../_middleware/authenticate');
const uploadService = require('./upload.service');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Select the upload directory based on the endpoint
        const uploadType = req.path.includes('follower') ? 'followers' : 'profiles';
        const uploadDir = path.join(__dirname, '..', 'uploads', uploadType);
        
        console.log(`[UploadController] Ensuring directory exists: ${uploadDir}`);
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const followerEmail = req.body.followerEmail; // <-- Make sure this is sent from the frontend!
        if (!followerEmail) {
            return cb(new Error('Follower email is required'), null);
        }
        const filename = `followerImage-${followerEmail}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

// Configure upload limits
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Routes
router.post('/profile', authorize(), upload.single('file'), uploadProfileImage);
router.post('/follower', authorize(), upload.single('file'), uploadFollowerImage);
router.get('/profile/:userId', authorize(), getProfileImage);
router.get('/follower/:userId', authorize(), getFollowerImage);
router.delete('/profile', authorize(), deleteProfileImage);
router.delete('/follower', authorize(), deleteFollowerImage);

// Export multer middleware
const uploadMiddleware = upload.single('file');

// Controllers
async function uploadProfileImage(req, res, next) {
    try {
        console.log('[UploadController] Processing profile image upload');
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the user ID from the authenticated request
        const userId = req.user.id;
        
        // Update the database with the new image path
        await uploadService.updateProfileImage(userId, req.file.filename);

        // Return the URL to the uploaded file (remove leading slash to prevent double slash)
        const fileUrl = `uploads/profiles/${req.file.filename}`;
        console.log(`[UploadController] Profile image uploaded successfully: ${fileUrl}`);
        return res.json({ 
            message: 'File uploaded successfully', 
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('[UploadController] Error uploading profile image:', error);
        next(error);
    }
}

async function uploadFollowerImage(req, res, next) {
    try {
        console.log('[UploadController] Processing follower image upload');
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the user ID from the authenticated request
        const userId = req.user.id;
        
        // Update the database with the new image path
        await uploadService.updateFollowerImage(userId, req.file.filename);

        // Return the URL to the uploaded file (remove leading slash to prevent double slash)
        const fileUrl = `uploads/followers/${req.file.filename}`;
        console.log(`[UploadController] Follower image uploaded successfully: ${fileUrl}`);
        return res.json({ 
            message: 'File uploaded successfully', 
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('[UploadController] Error uploading follower image:', error);
        next(error);
    }
}

async function getProfileImage(req, res, next) {
    try {
        const userId = req.params.userId;
        console.log(`[UploadController] Getting profile image for user: ${userId}`);
        
        const imagePath = await uploadService.getProfileImage(userId);
        if (!imagePath) {
            console.log(`[UploadController] Profile image not found for user: ${userId}`);
            return res.status(404).json({ message: 'Image not found' });
        }

        // Construct the full file path for checking existence
        const filePath = path.join(__dirname, '..', 'uploads', 'profiles', imagePath);
        console.log(`[UploadController] Checking file path: ${filePath}`);
        
        // Check if file exists
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            // Return the URL that matches the static file serving path (remove leading slash)
            const fileUrl = `uploads/profiles/${imagePath}`;
            res.json({ url: fileUrl });
        } catch (error) {
            console.log(`[UploadController] Profile image file not found: ${filePath}`);
            res.status(404).json({ message: 'Image file not found' });
        }
    } catch (error) {
        console.error('[UploadController] Error getting profile image:', error);
        next(error);
    }
}

async function getFollowerImage(req, res, next) {
    try {
        const userId = req.params.userId;
        console.log(`[UploadController] Getting follower image for user: ${userId}`);
        
        const imagePath = await uploadService.getFollowerImage(userId);
        if (!imagePath) {
            console.log(`[UploadController] Follower image not found for user: ${userId}`);
            return res.status(404).json({ message: 'Image not found' });
        }

        // Construct the full file path for checking existence
        const filePath = path.join(__dirname, '..', 'uploads', 'followers', imagePath);
        console.log(`[UploadController] Checking file path: ${filePath}`);
        
        // Check if file exists
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            // Return the URL that matches the static file serving path (remove leading slash)
            const fileUrl = `uploads/followers/${imagePath}`;
            res.json({ url: fileUrl });
        } catch (error) {
            console.log(`[UploadController] Follower image file not found: ${filePath}`);
            res.status(404).json({ message: 'Image file not found' });
        }
    } catch (error) {
        console.error('[UploadController] Error getting follower image:', error);
        next(error);
    }
}

async function deleteProfileImage(req, res, next) {
    try {
        const userId = req.user.id;
        console.log(`[UploadController] Deleting profile image for user: ${userId}`);
        
        await uploadService.deleteProfileImage(userId);
        return res.json({ message: 'Profile image deleted successfully' });
    } catch (error) {
        console.error('[UploadController] Error deleting profile image:', error);
        next(error);
    }
}

async function deleteFollowerImage(req, res, next) {
    try {
        const userId = req.user.id;
        console.log(`[UploadController] Deleting follower image for user: ${userId}`);
        
        await uploadService.deleteFollowerImage(userId);
        return res.json({ message: 'Follower image deleted successfully' });
    } catch (error) {
        console.error('[UploadController] Error deleting follower image:', error);
        next(error);
    }
}

module.exports = {
    uploadMiddleware,
    uploadProfileImage,
    uploadFollowerImage,
    getProfileImage,
    getFollowerImage,
    deleteProfileImage,
    deleteFollowerImage
}; 