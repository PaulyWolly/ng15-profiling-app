const mongoose = require('mongoose');
const Log = require('../logs/log.model');
const config = require('../config.json');

async function purgeUserLogs() {
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB');

  const result = await Log.deleteMany({ type: 'User' });
  console.log(`Deleted ${result.deletedCount} user logs.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

purgeUserLogs().catch(err => {
  console.error('Error purging user logs:', err);
  process.exit(1);
});
