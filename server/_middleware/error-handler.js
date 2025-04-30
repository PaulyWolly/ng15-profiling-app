module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    console.error('[ErrorHandler] Error:', {
        error: err,
        message: err.message,
        stack: err.stack
    });

    // Handle multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            message: 'File upload error',
            error: err.message
        });
    }

    // Handle file-related errors
    if (err.message && (
        err.message.includes('No file uploaded') ||
        err.message.includes('Follower name is required') ||
        err.message.includes('file')
    )) {
        return res.status(400).json({
            message: err.message
        });
    }

    // Handle authentication errors
    if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: err.message
        });
    }

    // Default to 500 server error
    return res.status(500).json({
        message: err.message || 'Internal Server Error'
    });
} 