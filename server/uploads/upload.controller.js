const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Get the absolute path to the uploads directories
const uploadsDir = path.join(__dirname, '..', 'uploads');
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
const followersDir = path.join(__dirname, '..', 'uploads', 'followers');

// Configure multer for file upload with dynamic destination
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use different directories based on the endpoint
        const uploadPath = req.originalUrl.includes('follower-image') ? followersDir : profilesDir;
        
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using timestamp and random string
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(file.originalname);
        const filename = `temp_${timestamp}_${randomString}${extension}`;
        cb(null, filename);
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only images
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Create middleware for file upload
const uploadMiddleware = upload.single('file');

// Add a function to handle follower image uploads
async function uploadFollowerImage(req, res, next) {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        if (!req.user || !req.user.id) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            throw new Error('Unauthorized');
        }

        // Get follower details from the request body
        const followerName = req.body.followerName;
        const followerTitle = req.body.followerTitle;

        if (!followerName) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            throw new Error('Follower name is required');
        }

        // Create the final filename using follower name
        const sanitizedName = followerName.replace(/[^a-zA-Z0-9]/g, '_');
        const finalFilename = `followerImage-${sanitizedName}${path.extname(req.file.originalname)}`;
        const finalPath = path.join(followersDir, finalFilename);

        // Overwrite any existing file
        if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
        }

        // Move the uploaded file to the final location
        fs.renameSync(req.file.path, finalPath);

        const urlPath = `/uploads/followers/${finalFilename}`;
        const apiUrl = process.env.API_URL || 'http://localhost:5001';

        const follower = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: followerName,
            title: followerTitle || '',
            imageUrl: `${apiUrl}${urlPath}`,
            path: urlPath
        };

        return res.json(follower);
    } catch (error) {
        // Clean up temp file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('[UploadController:uploadFollowerImage] Error cleaning up temp file:', cleanupError);
            }
        }
        
        next(error);
    }
}

// Export the middleware and functions
module.exports = {
    upload,
    uploadMiddleware,
    uploadFollowerImage
};