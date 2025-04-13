const mongoose = require('mongoose');
const config = require('config.json');

const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

async function connectWithRetry(retryCount = 0) {
    try {
        await mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
        console.log('MongoDB connected successfully');
        return mongoose.connection;
    } catch (err) {
        if (retryCount < MAX_RETRIES) {
            console.log(`MongoDB connection attempt ${retryCount + 1} failed. Retrying in ${RETRY_DELAY/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retryCount + 1);
        }
        throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${err.message}`);
    }
}

// Initialize connection
const connection = connectWithRetry();

// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

module.exports = {
    Account: require('../accounts/account.model'),
    RefreshToken: require('../accounts/refresh-token.model'),
    isValidId,
    connection
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
