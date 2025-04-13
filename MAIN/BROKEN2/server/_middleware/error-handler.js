const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Handle Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files uploaded.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected file field.' });
        }
        return res.status(400).json({ message: err.message });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }

    // Handle JWT errors
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid Token' });
    }

    // Handle other errors
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler; 