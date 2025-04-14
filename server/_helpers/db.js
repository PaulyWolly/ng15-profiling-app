const mongoose = require('mongoose');
const config = require('../config.json');

// Use environment variable for MongoDB connection string if available
const connectionString = process.env.MONGODB_URI || config.connectionString;

if (connectionString === 'MONGODB_URI') {
    throw new Error('MongoDB connection string not found in environment variables');
}

console.log('Attempting to connect to MongoDB...');

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB Atlas');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.Promise = global.Promise;

module.exports = {
    Account: require('../accounts/account.model'),
    RefreshToken: require('../accounts/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
