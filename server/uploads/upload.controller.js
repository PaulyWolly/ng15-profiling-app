const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Select the upload directory based on the endpoint
        const uploadType = req.path.includes('follower') ? 'followers' : 'profiles';
        const uploadDir = path.join(__dirname, uploadType);
        
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use a unique filename based on timestamp and original extension
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
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
router.post('/profile', upload.single('file'), uploadProfileImage);
router.post('/follower', upload.single('file'), uploadFollowerImage);

// Controllers
function uploadProfileImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the URL to the uploaded file
        const fileUrl = `/uploads/profiles/${req.file.filename}`;
        return res.json({ 
            message: 'File uploaded successfully', 
            url: fileUrl 
        });
    } catch (error) {
        next(error);
    }
}

function uploadFollowerImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the URL to the uploaded file
        const fileUrl = `/uploads/followers/${req.file.filename}`;
        return res.json({ 
            message: 'File uploaded successfully', 
            url: fileUrl 
        });
    } catch (error) {
        next(error);
    }
}

module.exports = router; 