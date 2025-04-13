const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Processing upload destination...', file);
        const uploadDir = 'uploads/profile-images';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            console.log('Creating upload directory:', uploadDir);
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        console.log('Generating filename for:', file.originalname);
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        console.log('Checking file type:', file.mimetype);
        // Accept only images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            console.error('Invalid file type:', file.originalname);
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Upload profile image
async function uploadProfileImage(req, res, next) {
    try {
        console.log('Starting uploadProfileImage handler');
        console.log('Request file:', req.file);
        console.log('Request user:', req.user);

        if (!req.file) {
            console.error('No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get the account from the request (assuming it's set by auth middleware)
        const account = req.user;
        if (!account) {
            console.error('No authenticated user found');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Update the account with the new image path
        const imagePath = `/uploads/profile-images/${req.file.filename}`;
        console.log('Setting new image path:', imagePath);
        account.profileImage = imagePath;
        await account.save();

        console.log('Profile image updated successfully');
        res.json({
            message: 'Profile image uploaded successfully',
            imagePath: account.profileImage
        });
    } catch (error) {
        console.error('Error in uploadProfileImage:', error);
        next(error);
    }
}

module.exports = {
    upload,
    uploadProfileImage
};