module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }

    if (err.name === 'ValidationError') {
        // mongoose validation error
        return res.status(400).json({ message: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            message: 'File size is too large. Maximum size is 5MB'
        });
    }

    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
            message: err.message
        });
    }

    // default to 500 server error
    console.error(err);
    return res.status(500).json({ message: err.message });
} 