const Log = require('./log.model');
const crypto = require('crypto');

// Store active user sessions for tracking purposes
const activeSessions = new Map();

/**
 * Logger Service for creating different types of logs
 */
class LoggerService {
  /**
   * Create a system log
   * @param {string} action - The action being performed
   * @param {string} message - The log message
   * @param {string} status - Log status (Success, Warning, Error, Info)
   * @param {string} ipAddress - The IP address
   * @param {string} geoLocation - Geographic location based on IP
   * @returns {Promise<Object>} The created log
   */
  async createSystemLog(action, message, status = 'Info', ipAddress = '', geoLocation = '') {
    const log = new Log({
      type: 'System',
      action,
      entries: [{
        message,
        status,
        ipAddress,
        geoLocation
      }]
    });
    return await log.save();
  }

  /**
   * Create a user log
   * @param {string} user - The username
   * @param {string} action - The action being performed
   * @param {string} message - The log message
   * @param {string} status - Log status (Success, Warning, Error, Info)
   * @param {string} ipAddress - The IP address
   * @param {string} geoLocation - Geographic location based on IP
   * @param {string} userAgent - User's browser info
   * @param {number} responseTime - Time taken to process request
   * @returns {Promise<Object>} The created log
   */
  async createUserLog(user, action, message, status = 'Info', ipAddress = '', geoLocation = '', userAgent = '', responseTime = 0) {
    // Generate or retrieve a session ID for the user
    const sessionId = this.getOrCreateSessionId(user, ipAddress);

    const log = new Log({
      type: 'User',
      user,
      action,
      sessionId,
      sessionStartTime: activeSessions.get(sessionId)?.startTime,
      entries: [{
        message,
        status,
        ipAddress,
        geoLocation,
        userAgent,
        responseTime: responseTime || undefined,
        timestamp: new Date()
      }]
    });

    // For login actions, record the session start time
    if (action === 'Login') {
      this.startUserSession(user, ipAddress, userAgent);
      log.sessionStartTime = new Date();
    }

    // For logout actions, record the session end time and calculate duration
    if (action === 'Logout') {
      const sessionInfo = activeSessions.get(sessionId);
      if (sessionInfo) {
        const duration = this.endUserSession(sessionId);
        log.sessionEndTime = new Date();
        log.entries[0].message += `\nSession Duration: ${this.formatDuration(duration)}`;
      }
    }

    return await log.save();
  }

  /**
   * Create an error log
   * @param {string} action - The action being performed
   * @param {string} message - The error message
   * @param {string} user - Optional username related to the error
   * @param {string} ipAddress - The IP address
   * @param {string} geoLocation - Geographic location based on IP
   * @returns {Promise<Object>} The created log
   */
  async createErrorLog(action, message, user = '', ipAddress = '', geoLocation = '') {
    const log = new Log({
      type: 'Error',
      user,
      action,
      entries: [{
        message,
        status: 'Error',
        ipAddress,
        geoLocation
      }]
    });
    return await log.save();
  }

  /**
   * Create an audit log
   * @param {string} user - The username
   * @param {string} action - The action being performed
   * @param {string} message - The log message
   * @param {string} status - Log status (Success, Warning, Error, Info)
   * @param {string} ipAddress - The IP address
   * @param {string} geoLocation - Geographic location based on IP
   * @returns {Promise<Object>} The created log
   */
  async createAuditLog(user, action, message, status = 'Info', ipAddress = '', geoLocation = '') {
    const log = new Log({
      type: 'Audit',
      user,
      action,
      entries: [{
        message,
        status,
        ipAddress,
        geoLocation
      }]
    });
    return await log.save();
  }

  /**
   * Add an entry to an existing log
   * @param {string} logId - The ID of the log to add an entry to
   * @param {string} message - The log message
   * @param {string} status - Log status (Success, Warning, Error, Info)
   * @param {string} ipAddress - The IP address
   * @returns {Promise<Object>} The updated log
   */
  async addLogEntry(logId, message, status = 'Info', ipAddress = '') {
    const log = await Log.findById(logId);
    if (!log) throw new Error('Log not found');

    log.entries.push({ message, status, ipAddress });
    return await log.save();
  }

  /**
   * Create or retrieve a session ID for a user
   * @param {string} user - The username
   * @param {string} ipAddress - The IP address
   * @returns {string} Session ID
   */
  getOrCreateSessionId(user, ipAddress) {
    // Look for existing active session for this user+IP
    for (const [sessionId, sessionInfo] of activeSessions.entries()) {
      if (sessionInfo.user === user && sessionInfo.ipAddress === ipAddress && !sessionInfo.endTime) {
        return sessionId;
      }
    }

    // Create new session ID if none exists
    const sessionId = crypto.randomBytes(16).toString('hex');
    return sessionId;
  }

  /**
   * Start tracking a user session
   * @param {string} user - The username
   * @param {string} ipAddress - The IP address
   * @param {string} userAgent - User's browser info
   * @returns {string} Session ID
   */
  startUserSession(user, ipAddress, userAgent) {
    const sessionId = this.getOrCreateSessionId(user, ipAddress);

    // Record session start
    activeSessions.set(sessionId, {
      user,
      ipAddress,
      userAgent,
      startTime: new Date(),
      pages: []
    });

    return sessionId;
  }

  /**
   * Record a page visit in the user's session
   * @param {string} sessionId - The session ID
   * @param {string} pageUrl - The URL of the page visited
   * @param {number} duration - Time spent on the page in ms (optional)
   */
  recordPageVisit(sessionId, pageUrl, referrer = '', duration = 0) {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    session.pages.push({
      url: pageUrl,
      referrer,
      visitTime: new Date(),
      duration
    });

    // Update last activity
    session.lastActivity = new Date();
  }

  /**
   * End a user session and return duration
   * @param {string} sessionId - The session ID
   * @returns {number} Session duration in milliseconds
   */
  endUserSession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) return 0;

    session.endTime = new Date();
    const duration = session.endTime - session.startTime;

    // Keep the session info for a while before deleting
    setTimeout(() => {
      activeSessions.delete(sessionId);
    }, 3600000); // Remove after 1 hour

    return duration;
  }

  /**
   * Format a duration in milliseconds to a human-readable string
   * @param {number} duration - Duration in milliseconds
   * @returns {string} Formatted duration string
   */
  formatDuration(duration) {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = new LoggerService();
