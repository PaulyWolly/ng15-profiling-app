const logger = require('../logs/logger.service');
const geoip = require('geoip-lite');

/**
 * Middleware to automatically log API requests
 */
function requestLogger(req, res, next) {
  // Skip logging for static files and certain endpoints
  if (req.path.startsWith('/assets') || req.path.startsWith('/logs')) {
    return next();
  }

  const startTime = Date.now();
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Get geolocation from IP if available
  let geoLocation = '';
  try {
    const geo = geoip.lookup(ipAddress);
    if (geo) {
      geoLocation = `${geo.city}, ${geo.region}, ${geo.country}`;
    }
  } catch (err) {
    console.error('Error determining geolocation:', err);
  }

  const requestData = {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: ipAddress,
    geoLocation: geoLocation,
    userAgent: req.headers['user-agent'] || 'Unknown',
    referer: req.headers.referer || 'Direct',
    timestamp: new Date().toISOString()
  };

  // Capture the original send method
  const originalSend = res.send;

  // Override the send method to log the response
  res.send = function (body) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logData = {
      ...requestData,
      statusCode,
      responseTime: `${responseTime}ms`,
      endTimestamp: new Date().toISOString()
    };

    // Log based on status code
    const status = statusCode >= 500 ? 'Error' : (statusCode >= 400 ? 'Warning' : 'Success');

    // Log different types based on the endpoint and status
    if (statusCode >= 500) {
      // Error logs for server errors
      logger.createErrorLog(
        `API ${req.method}`,
        `${req.method} ${req.path} ${statusCode} (${responseTime}ms)\nRequest: ${JSON.stringify(logData)}\nError: ${body}`,
        req.user?.username || req.user?.email,
        requestData.ip,
        geoLocation
      );
    } else if (req.path.startsWith('/accounts')) {
      // User logs for account-related actions
      if (req.user) {
        logger.createUserLog(
          req.user.username || req.user.email,
          `${req.method} ${req.path.split('/')[2] || 'account'}`,
          `${req.method} ${req.path} ${statusCode} (${responseTime}ms)\nLocation: ${geoLocation}`,
          status,
          requestData.ip,
          geoLocation,
          requestData.userAgent,
          responseTime
        );
      }
    } else if (req.path.includes('admin') || req.path.includes('config')) {
      // Audit logs for admin actions
      if (req.user) {
        logger.createAuditLog(
          req.user.username || req.user.email,
          `${req.method} ${req.path}`,
          `${req.method} ${req.path} ${statusCode} (${responseTime}ms)\nLocation: ${geoLocation}`,
          status,
          requestData.ip,
          geoLocation
        );
      }
    } else if (req.user && (req.path.includes('/api/') || req.path.includes('/user/'))) {
      // User navigation/activity logs for registered users
      logger.createUserLog(
        req.user.username || req.user.email,
        `Page Access`,
        `Accessed: ${req.path} (${responseTime}ms)${req.headers.referer ? `\nFrom: ${req.headers.referer}` : ''}`,
        'Info',
        requestData.ip,
        geoLocation,
        requestData.userAgent,
        responseTime
      );
    } else if (statusCode !== 200 || req.method !== 'GET') {
      // System logs for other activities (non-GET or non-200)
      logger.createSystemLog(
        `API ${req.method}`,
        `${req.method} ${req.path} ${statusCode} (${responseTime}ms)`,
        status,
        requestData.ip,
        geoLocation
      );
    }

    // Call the original send method and return its value
    return originalSend.call(this, body);
  };

  next();
}

module.exports = requestLogger;
