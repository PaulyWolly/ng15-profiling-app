const express = require('express');
const Log = require('./log.model');
const logger = require('./logger.service');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new log entry
router.post('/', async (req, res) => {
  try {
    const log = new Log(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a System log
router.post('/system', async (req, res) => {
  try {
    const { action, message, status, ipAddress, geoLocation } = req.body;
    const log = await logger.createSystemLog(action, message, status, ipAddress, geoLocation);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a User log
router.post('/user', async (req, res) => {
  try {
    const {
      user,
      action,
      message,
      status,
      ipAddress,
      geoLocation,
      userAgent,
      responseTime,
      pageUrl,
      referrer,
      sessionId
    } = req.body;

    const log = await logger.createUserLog(
      user,
      action,
      message,
      status,
      ipAddress,
      geoLocation,
      userAgent,
      responseTime
    );

    // If this is a navigation log, record the page visit
    if (action === 'Page Navigation' && sessionId) {
      logger.recordPageVisit(sessionId, pageUrl, referrer, responseTime);
    }

    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create an Error log
router.post('/error', async (req, res) => {
  try {
    const { action, message, user, ipAddress, geoLocation } = req.body;
    const log = await logger.createErrorLog(action, message, user, ipAddress, geoLocation);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create an Audit log
router.post('/audit', async (req, res) => {
  try {
    const { user, action, message, status, ipAddress, geoLocation } = req.body;
    const log = await logger.createAuditLog(user, action, message, status, ipAddress, geoLocation);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add entry to existing log
router.post('/:logId/entries', async (req, res) => {
  try {
    const { logId } = req.params;
    const { message, status, ipAddress } = req.body;
    const log = await logger.addLogEntry(logId, message, status, ipAddress);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get logs (with optional filtering and pagination)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      status,
      user,
      action,
      fromDate,
      toDate,
      ipAddress,
      page = 1,
      pageSize = 20
    } = req.query;

    const filter = {};

    // Basic filters
    if (type) filter.type = type;
    if (user) filter.user = { $regex: new RegExp(user, 'i') }; // Case-insensitive user search

    // Status filtering on entries
    if (status) {
      filter['entries.status'] = status;
    }

    // Action filtering (partial match)
    if (action) {
      filter.action = { $regex: new RegExp(action, 'i') };
    }

    // Date range filtering
    if (fromDate || toDate) {
      filter['entries.timestamp'] = {};
      if (fromDate) {
        filter['entries.timestamp'].$gte = new Date(fromDate);
      }
      if (toDate) {
        filter['entries.timestamp'].$lte = new Date(toDate);
      }
    }

    // IP address filtering
    if (ipAddress) {
      filter['entries.ipAddress'] = { $regex: new RegExp(ipAddress) };
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const logs = await Log.find(filter)
      .sort({ 'entries.timestamp': -1 })
      .skip(skip)
      .limit(parseInt(pageSize));
    const total = await Log.countDocuments(filter);
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a summary of user activity
router.get('/user-activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fromDate, toDate } = req.query;

    const filter = {
      type: 'User',
      user: userId
    };

    // Date range filtering
    if (fromDate || toDate) {
      filter['entries.timestamp'] = {};
      if (fromDate) {
        filter['entries.timestamp'].$gte = new Date(fromDate);
      }
      if (toDate) {
        filter['entries.timestamp'].$lte = new Date(toDate);
      }
    }

    // Get all user logs
    const logs = await Log.find(filter);

    // Calculate statistics
    const sessions = logs.filter(log => log.sessionStartTime && log.sessionEndTime);

    // Calculate total session time
    let totalSessionTime = 0;
    sessions.forEach(session => {
      const duration = new Date(session.sessionEndTime) - new Date(session.sessionStartTime);
      if (duration > 0 && duration < 24 * 60 * 60 * 1000) { // Ignore sessions longer than 24 hours (likely errors)
        totalSessionTime += duration;
      }
    });

    // Count page navigations
    const pageNavigations = logs.filter(log => log.action === 'Page Navigation').length;

    // Collect visited pages
    const visitedPages = new Set();
    logs.forEach(log => {
      log.entries.forEach(entry => {
        if (entry.pageUrl) {
          visitedPages.add(entry.pageUrl);
        }
      });
    });

    // Most visited pages
    const pageVisits = {};
    logs.forEach(log => {
      log.entries.forEach(entry => {
        if (entry.pageUrl) {
          pageVisits[entry.pageUrl] = (pageVisits[entry.pageUrl] || 0) + 1;
        }
      });
    });

    const topPages = Object.entries(pageVisits)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      userId,
      totalSessions: sessions.length,
      totalSessionTime,
      pageNavigations,
      uniquePagesVisited: visitedPages.size,
      topPages,
      firstLogin: sessions.length > 0 ?
        sessions.reduce((earliest, session) => {
          const startTime = new Date(session.sessionStartTime);
          return startTime < earliest ? startTime : earliest;
        }, new Date()) : null,
      lastLogin: sessions.length > 0 ?
        sessions.reduce((latest, session) => {
          const startTime = new Date(session.sessionStartTime);
          return startTime > latest ? startTime : latest;
        }, new Date(0)) : null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a log entry by logId and entry index
router.delete('/:logId/entry/:entryIndex', async (req, res) => {
  const { logId, entryIndex } = req.params;
  try {
    const log = await Log.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    if (entryIndex < 0 || entryIndex >= log.entries.length) return res.status(400).json({ error: 'Invalid entry index' });
    log.entries.splice(entryIndex, 1);
    await log.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to handle inactivity logs
router.post('/inactivity', auth.authenticate, async (req, res) => {
    try {
        const { type, action, message } = req.body;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const geoLocation = req.geoLocation || '';

        // Create security log for inactivity event
        await logger.createSecurityLog(
            req.user.email,
            type,
            message,
            'Warning',
            ipAddress,
            geoLocation,
            userAgent,
            `Inactivity ${action}`
        );

        res.json({ message: 'Inactivity event logged successfully' });
    } catch (error) {
        console.error('Error logging inactivity event:', error);
        res.status(500).json({ message: 'Error logging inactivity event' });
    }
});

module.exports = router;
