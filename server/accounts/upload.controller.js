const multer = require('multer');
const path = require('path');
const fs = require('fs');
const accountService = require('./account.service');

// Get the absolute path to the uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
console.log('Upload directory configured as:', uploadsDir);

// Helper function to check if file exists for an email
function getExistingProfileImage(userEmail) {
    if (!fs.existsSync(uploadsDir)) {
        return null;
    }
    const filename = `profileImage-${userEmail}.png`;
    const filePath = path.join(uploadsDir, filename);
    return fs.existsSync(filePath) ? filePath : null;
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure uploads directory exists
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
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

module.exports = {
    upload,
    uploadProfileImage
};