const mongoose = require('mongoose');
const Log = require('../logs/log.model');
const config = require('../config.json');

async function testUserLog() {
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  const log = new Log({
    type: 'User',
    user: 'testuser@example.com',
    action: 'Login',
    entries: [{
      message: 'Manual test login',
      status: 'Success',
      ipAddress: '127.0.0.1',
      geoLocation: '',
      userAgent: 'ManualTestAgent/1.0',
      timestamp: new Date()
    }]
  });

  try {
    await log.save();
    console.log('Manual user log saved successfully!');
  } catch (err) {
    console.error('Error saving manual user log:', err);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

testUserLog();
