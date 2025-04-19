const multer = require('multer');
const path = require('path');
const fs = require('fs');
const accountService = require('./account.service');
const crypto = require('crypto');
const config = require('../config.json');

// Get the absolute path to the uploads directories
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
const followerUploadsDir = path.join(__dirname, '..', 'uploads', 'followers');

// Ensure both upload directories exist
console.log('Upload directory configured as:', uploadsDir);
console.log('Follower uploads directory configured as:', followerUploadsDir);

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created profile uploads directory');
}

if (!fs.existsSync(followerUploadsDir)) {
    fs.mkdirSync(followerUploadsDir, { recursive: true });
    console.log('Created follower uploads directory');
}

// Helper function to check if file exists for an email
function getExistingProfileImage(userEmail) {
    if (!fs.existsSync(uploadsDir)) {
        return null;
    }
    const filename = `profileImage-${userEmail}.png`;
    const filePath = path.join(uploadsDir, filename);
    return fs.existsSync(filePath) ? filePath : null;
}

// Configure multer for file upload with dynamic destination
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use different directories based on the endpoint
        let uploadPath = uploadsDir;
        
        // If this is a follower image upload, use the followers directory
        if (req.originalUrl.includes('upload-follower-image')) {
            uploadPath = followerUploadsDir;
        }
        
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Use a temporary filename initially
        const timestamp = Date.now();
        const tempFilename = `temp_${timestamp}${path.extname(file.originalname)}`;
        cb(null, tempFilename);
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
        }
        cb(null, true);
    }
});

// Upload profile image
async function uploadProfileImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!req.user || !req.user.id) {
            // Clean up temp file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!req.body.userEmail) {
            // Clean up temp file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'User email is required' });
        }

        // Create the final filename with email
        const finalFilename = `profileImage-${req.body.userEmail}${path.extname(req.file.originalname)}`;
        const finalPath = path.join(uploadsDir, finalFilename);

        // Check if an image already exists
        if (fs.existsSync(finalPath)) {
            // If no confirmation, ask for it
            if (req.body.confirmed !== 'true') {
                // Clean up temp file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(409).json({
                    message: 'An image already exists for this profile. Do you want to overwrite it?',
                    exists: true
                });
            }
            // If confirmed, delete existing file
            fs.unlinkSync(finalPath);
        }

        // Rename temp file to final filename
        fs.renameSync(req.file.path, finalPath);

        // Create URL-friendly path
        const urlPath = ['uploads', 'profiles', finalFilename].join('/');
        
        // Update database
        await accountService.uploadImage(req.body.userId || req.user.id, urlPath);
        
        res.json({
            message: 'Profile image uploaded successfully',
            imagePath: urlPath
        });
    } catch (error) {
        // Clean up temp file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
}

// Add a function to handle follower image uploads
async function uploadFollowerImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!req.user || !req.user.id) {
            // Clean up temp file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!req.body.followerName) {
            // Clean up temp file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: 'Follower name is required' });
        }

        // Create a sanitized version of the follower name for the filename
        const sanitizedName = req.body.followerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Create the final filename with follower name and timestamp
        const timestamp = Date.now();
        const finalFilename = `follower-${sanitizedName}-${timestamp}${path.extname(req.file.originalname)}`;
        const finalPath = path.join(followerUploadsDir, finalFilename);

        // Rename temp file to final filename
        fs.renameSync(req.file.path, finalPath);

        // Create URL-friendly path
        const urlPath = ['uploads', 'followers', finalFilename].join('/');
        
        // Get apiUrl from config
        const apiUrl = process.env.API_URL || 'http://localhost:5001';
        
        // Create follower object
        const follower = {
            id: crypto.randomUUID ? crypto.randomUUID() : timestamp, // Fallback for older Node versions
            name: req.body.followerName,
            title: req.body.followerTitle || '',
            imageUrl: `${apiUrl}/${urlPath}`,
            path: urlPath
        };

        console.log('Follower image uploaded successfully:', follower);

        // Return the follower object
        return res.status(200).json(follower);
    } catch (error) {
        console.error('Error uploading follower image:', error);
        return res.status(500).json({ message: 'Error uploading follower image' });
    }
}

module.exports = {
    upload,
    uploadProfileImage,
    uploadFollowerImage
};