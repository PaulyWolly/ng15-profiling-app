const logger = require('../logs/logger.service');

/**
 * Global error handler middleware
 * Catches all uncaught errors and logs them
 */
function errorHandler(err, req, res, next) {
  // Log the error
  const errorMessage = err.stack || err.message || 'Unknown error';
  const username = req.user?.username || req.user?.email || 'Anonymous';
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  logger.createErrorLog(
    `Uncaught Error: ${req.method} ${req.path}`,
    errorMessage,
    username,
    ipAddress
  );

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Unknown error',
    statusCode
  });
}

module.exports = errorHandler;
