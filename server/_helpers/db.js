const mongoose = require('mongoose');
const config = require('../config.json');

// Use environment variable for MongoDB connection string if available
const connectionString = process.env.MONGODB_URI || config.connectionString;

if (connectionString === 'MONGODB_URI') {
    throw new Error('MongoDB connection string not found in environment variables');
}

console.log('Attempting to connect to MongoDB...');

// Connection options with auto reconnect enabled
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s
};

// Function to handle connection
function connectWithRetry() {
    console.log('MongoDB connection with retry');
    mongoose.connect(connectionString, connectionOptions)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Retrying MongoDB connection in 5 seconds');
        setTimeout(connectWithRetry, 5000);
    });
}

// Initial connection
connectWithRetry();

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    if (err.name === 'MongoNetworkError') {
        console.log('Attempting to reconnect to MongoDB...');
        setTimeout(connectWithRetry, 5000);
    }
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    setTimeout(connectWithRetry, 5000);
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
