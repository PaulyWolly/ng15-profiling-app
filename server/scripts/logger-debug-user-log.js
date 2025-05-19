const mongoose = require('mongoose');
const Log = require('../logs/log.model');
const config = require('../config.json');

async function loggerDebugUserLog() {
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  const log = new Log({
    type: 'User',
    user: 'debuguser@example.com',
    action: 'Login',
    sessionId: 'debug-session-id',
    sessionStartTime: new Date(),
    entries: [{
      message: 'Debug login event',
      status: 'Success',
      ipAddress: '127.0.0.1',
      geoLocation: '',
      userAgent: 'DebugAgent/1.0',
      responseTime: 0,
      timestamp: new Date()
    }]
  });

  console.log('[LOGGER DEBUG SCRIPT] About to save user log:', JSON.stringify(log, null, 2));

  try {
    await log.save();
    console.log('Logger debug user log saved successfully!');
  } catch (err) {
    console.error('[LOGGER ERROR SCRIPT] Failed to save user log:', err);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

loggerDebugUserLog();
