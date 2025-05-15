const logger = require('../logs/logger.service');

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    // Enhanced logging
    console.error('[GlobalErrorHandler] Error:', err);
    if (err && err.stack) {
        console.error('[GlobalErrorHandler] Stack:', err.stack);
    }
    console.error('[GlobalErrorHandler] Request:', {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        user: req.user
    });

    // Log to our logging system
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user = req.user?.email || req.user?.username;
    const errorMessage = typeof err === 'string' ? err : err.message || 'Unknown error';
    const errorDetails = `${req.method} ${req.originalUrl} - ${errorMessage}`;

    // Create an error log
    logger.createErrorLog(
        `API Error - ${req.method}`,
        errorDetails,
        user,
        ipAddress
    ).catch(logErr => {
        console.error('[GlobalErrorHandler] Failed to create error log:', logErr);
    });

    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });
        case err.name === 'ValidationError':
            // mongoose validation error
            return res.status(400).json({ message: err.message });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            return res.status(500).json({ message: err.message });
    }
}
