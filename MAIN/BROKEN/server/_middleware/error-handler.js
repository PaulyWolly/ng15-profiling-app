module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof err === 'string') {
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

    if (err.name === 'MongoError' && err.code === 11000) {
        // duplicate key error
        return res.status(400).json({ message: 'Duplicate field value entered' });
    }

    // default to 500 server error
    console.error(err);
    return res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
} 