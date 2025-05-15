const mongoose = require('mongoose');
const Log = require('../logs/log.model');
const config = require('../config.json');

const DUMMY_LOGS = [
  {
    type: 'User',
    user: 'dummyuser1',
    action: '**dummy** Login',
    status: 'Success',
    message: '**dummy** User logged in successfully.',
    ipAddress: '192.168.1.101'
  },
  {
    type: 'System',
    action: '**dummy** Server Restart',
    status: 'Info',
    message: '**dummy** Server restarted for maintenance.',
    ipAddress: '127.0.0.1'
  },
  {
    type: 'Error',
    user: 'dummyadmin',
    action: '**dummy** Data Import',
    status: 'Error',
    message: '**dummy** Failed to import data: Invalid format.',
    ipAddress: '192.168.1.102'
  },
  {
    type: 'Audit',
    user: 'dummysuperadmin',
    action: '**dummy** Role Change',
    status: 'Warning',
    message: '**dummy** User role changed from User to Admin.',
    ipAddress: '192.168.1.103'
  }
];

async function seedLogs() {
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  await Log.deleteMany({});
  console.log('Removed all logs');

  // Create 4 logs, each with 50 entries
  const logTypes = ['System', 'Audit', 'Error', 'User'];
  const statuses = ['Success', 'Warning', 'Error', 'Info'];
  for (const type of logTypes) {
    const entries = [];
    for (let i = 1; i <= 50; i++) {
      entries.push({
        message: `**dummy** [${type}] Entry #${i}\nDetails for ${type} log entry #${i}...`,
        timestamp: new Date(Date.now() - i * 60000),
        status: statuses[i % statuses.length],
        ipAddress: `192.168.1.${100 + i}`
      });
    }
    const log = {
      type,
      user: type === 'User' ? `testuser` : '',
      action: `**dummy** ${type} Log Test`,
      entries
    };
    await Log.create(log);
    console.log(`Inserted ${type} log with 50 entries`);
  }

  // Add a dummy log with a long message (50+ lines)
  let longMessage = '';
  for (let i = 1; i <= 50; i++) {
    longMessage += `Line ${i}: This is a long dummy log message for scrollbar testing.\n`;
  }
  const longLog = {
    type: 'System',
    action: '**dummy** Long Message Test',
    status: 'Info',
    message: longMessage,
    ipAddress: '127.0.0.1',
    timestamp: new Date()
  };
  await Log.create(longLog);
  console.log('Inserted long message log for scrollbar testing');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedLogs().catch(err => {
  console.error('Error seeding logs:', err);
  process.exit(1);
});
 