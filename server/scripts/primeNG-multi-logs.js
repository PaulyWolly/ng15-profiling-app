const mongoose = require('mongoose');
const Log = require('../logs/log.model');
const config = require('../config.json');

const now = new Date();

const mockLogs = [
  // Multiple logs for pwelby@gmail.com, Login
  {
    type: 'User',
    user: 'pwelby@gmail.com',
    action: 'Login',
    status: 'Success',
    message: 'User logged in successfully',
    ipAddress: '192.168.1.1',
    geoLocation: 'New York, USA',
    timestamp: new Date(now.getTime() - 60000)
  },
  {
    type: 'User',
    user: 'pwelby@gmail.com',
    action: 'Login',
    status: 'Info',
    message: 'User session started',
    ipAddress: '192.168.1.1',
    geoLocation: 'New York, USA',
    timestamp: new Date(now.getTime() - 120000)
  },
  // Multiple logs for pwelby@gmail.com, Page Navigation
  {
    type: 'User',
    user: 'pwelby@gmail.com',
    action: 'Page Navigation',
    status: 'Info',
    message: 'User navigated to dashboard',
    ipAddress: '192.168.1.1',
    geoLocation: 'New York, USA',
    timestamp: new Date(now.getTime() - 180000)
  },
  {
    type: 'User',
    user: 'pwelby@gmail.com',
    action: 'Page Navigation',
    status: 'Info',
    message: 'User navigated to reports',
    ipAddress: '192.168.1.1',
    geoLocation: 'New York, USA',
    timestamp: new Date(now.getTime() - 240000)
  },
  // Multiple logs for jane.doe@example.com, GET Request
  {
    type: 'User',
    user: 'jane.doe@example.com',
    action: 'GET Request',
    status: 'Success',
    message: 'Fetched user profile',
    ipAddress: '10.0.0.5',
    geoLocation: 'San Francisco, USA',
    timestamp: new Date(now.getTime() - 300000)
  },
  {
    type: 'User',
    user: 'jane.doe@example.com',
    action: 'GET Request',
    status: 'Success',
    message: 'Fetched user settings',
    ipAddress: '10.0.0.5',
    geoLocation: 'San Francisco, USA',
    timestamp: new Date(now.getTime() - 360000)
  },
  // Anonymous user, Token Refresh
  {
    type: 'User',
    user: 'Anonymous',
    action: 'Token Refresh',
    status: 'Success',
    message: 'Token refreshed',
    ipAddress: '192.168.1.2',
    geoLocation: 'London, UK',
    timestamp: new Date(now.getTime() - 420000)
  },
  {
    type: 'User',
    user: 'Anonymous',
    action: 'Token Refresh',
    status: 'Info',
    message: 'Token refresh scheduled',
    ipAddress: '192.168.1.2',
    geoLocation: 'London, UK',
    timestamp: new Date(now.getTime() - 480000)
  }
];

async function seedPrimeNGMultiLogs() {
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  await Log.deleteMany({});
  console.log('Removed all logs');

  for (const log of mockLogs) {
    await Log.create(log);
    console.log(`Inserted log for user: ${log.user}, action: ${log.action}, message: ${log.message}`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedPrimeNGMultiLogs().catch(err => {
  console.error('Error seeding PrimeNG multi logs:', err);
  process.exit(1);
});
