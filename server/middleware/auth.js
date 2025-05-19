const jwt = require('jsonwebtoken');
const config = require('../config.json');
const logger = require('../logs/logger.service');
const geoip = require('geoip-lite');

function extractToken(req) {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt_token) {
    token = req.cookies.jwt_token;
  }
  return token;
}

function getGeoLocation(ipAddress) {
  try {
    const geo = geoip.lookup(ipAddress);
    return geo ? `${geo.city}, ${geo.region}, ${geo.country}` : '';
  } catch (err) {
    console.error('Error determining geolocation:', err);
    return '';
  }
}

module.exports = {
  authenticate: async (req, res, next) => {
    const token = extractToken(req);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const geoLocation = getGeoLocation(ipAddress);

    if (!token) {
      await logger.logFailedLogin(
        'Anonymous',
        ipAddress,
        geoLocation,
        userAgent,
        'No token provided'
      );
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, config.secret);
      req.user = decoded;

      // Log successful authentication
      await logger.createSecurityLog(
        decoded.username || decoded.email,
        'Login',
        'User authenticated successfully',
        'Success',
        ipAddress,
        geoLocation,
        userAgent
      );

      next();
    } catch (error) {
      const reason = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      await logger.logFailedLogin(
        'Anonymous',
        ipAddress,
        geoLocation,
        userAgent,
        reason
      );
      return res.status(401).json({ message: reason });
    }
  },

  isAdmin: async (req, res, next) => {
    const token = extractToken(req);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const geoLocation = getGeoLocation(ipAddress);

    if (!token) {
      await logger.logFailedLogin(
        'Anonymous',
        ipAddress,
        geoLocation,
        userAgent,
        'No token provided for admin access'
      );
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, config.secret);
      if (decoded.role !== 'Admin' && decoded.role !== 'Super-Admin') {
        await logger.createSecurityLog(
          decoded.username || decoded.email,
          'AccessDenied',
          'Attempted admin access without proper role',
          'Warning',
          ipAddress,
          geoLocation,
          userAgent
        );
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      const reason = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      await logger.logFailedLogin(
        'Anonymous',
        ipAddress,
        geoLocation,
        userAgent,
        `Admin access failed: ${reason}`
      );
      return res.status(401).json({ message: 'Invalid token' });
    }
  },

  isSuperAdmin: async (req, res, next) => {
    const token = extractToken(req);
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const geoLocation = getGeoLocation(ipAddress);

    if (!token) {
      await logger.logFailedLogin(
        'Anonymous',
        ipAddress,
        geoLocation,
        userAgent,
        'No token provided for super-admin access'
      );
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, config.secret);
      if (decoded.role !== 'Super-Admin') {
        await logger.createSecurityLog(
          decoded.username || decoded.email,
          'AccessDenied',
          'Attempted super-admin access without proper role',
          'Warning',
          ipAddress,
          geoLocation,
          userAgent
        );
        return res.status(403).json({ message: 'Forbidden: Super-Admin only' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      const reason = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      await logger.logFailedLogin(
        'Anonymous',
        ipAddress,
        geoLocation,
        userAgent,
        `Super-admin access failed: ${reason}`
      );
      return res.status(401).json({ message: 'Invalid token' });
    }
  },

  // Middleware to handle session expiration
  handleSessionExpiration: async (req, res, next) => {
    const token = extractToken(req);
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, config.secret);
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown';
      const geoLocation = getGeoLocation(ipAddress);

      // Check if token is about to expire (within 5 minutes)
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const fiveMinutes = 5 * 60 * 1000;

      if (expirationTime - Date.now() < fiveMinutes) {
        await logger.logSessionExpiration(
          decoded.username || decoded.email,
          ipAddress,
          geoLocation,
          userAgent,
          'Token approaching expiration'
        );
      }

      // Check for inactivity timeout (30 minutes)
      const lastActivity = decoded.lastActivity || decoded.iat * 1000;
      const thirtyMinutes = 30 * 60 * 1000;

      if (Date.now() - lastActivity > thirtyMinutes) {
        await logger.createSecurityLog(
          decoded.username || decoded.email,
          'SessionExpired',
          'Session expired due to inactivity',
          'Warning',
          ipAddress,
          geoLocation,
          userAgent,
          `No activity for ${Math.round((Date.now() - lastActivity) / 60000)} minutes`
        );
        return res.status(401).json({ message: 'Session expired due to inactivity' });
      }

      // Update last activity time in the token
      decoded.lastActivity = Date.now();
      const newToken = jwt.sign(decoded, config.secret, { expiresIn: '1h' });
      res.setHeader('Authorization', `Bearer ${newToken}`);

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const geoLocation = getGeoLocation(ipAddress);

        await logger.createSecurityLog(
          'Anonymous',
          'SessionExpired',
          'Session expired',
          'Warning',
          ipAddress,
          geoLocation,
          userAgent,
          'Token expired'
        );
      }
      next();
    }
  }
};
