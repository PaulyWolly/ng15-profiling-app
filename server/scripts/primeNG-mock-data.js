const mongoose = require('mongoose');
const Log = require('../logs/log.model');
const config = require('../config.json');

const mockLogs = [
  {
    type: 'User',
    user: 'pwelby@gmail.com',
    action: 'Login',
    status: 'Success',
    message: 'User logged in successfully',
    ipAddress: '192.168.1.1',
    geoLocation: 'New York, USA',
    timestamp: new Date()
  },
  {
    type: 'User',
    user: 'pwelby@gmail.com',
    action: 'Page Navigation',
    status: 'Info',
    message: 'User navigated to dashboard',
    ipAddress: '192.168.1.1',
    geoLocation: 'New York, USA',
    timestamp: new Date()
  },
  {
    type: 'User',
    user: 'Anonymous',
    action: 'Token Refresh',
    status: 'Success',
    message: 'Token refreshed',
    ipAddress: '192.168.1.2',
    geoLocation: 'London, UK',
    timestamp: new Date()
  },
  {
    type: 'User',
    user: 'jane.doe@example.com',
    action: 'GET Request',
    status: 'Success',
    message: 'Fetched user profile',
    ipAddress: '10.0.0.5',
    geoLocation: 'San Francisco, USA',
    timestamp: new Date()
  },
  {
    type: 'User',
    user: 'jane.doe@example.com',
    action: 'Login',
    status: 'Error',
    message: 'Failed login attempt',
    ipAddress: '10.0.0.5',
    geoLocation: 'San Francisco, USA',
    timestamp: new Date()
  }
];

async function seedPrimeNGLogs() {
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  await Log.deleteMany({});
  console.log('Removed all logs');

  for (const log of mockLogs) {
    await Log.create(log);
    console.log(`Inserted log for user: ${log.user}, action: ${log.action}`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedPrimeNGLogs().catch(err => {
  console.error('Error seeding PrimeNG logs:', err);
  process.exit(1);
});