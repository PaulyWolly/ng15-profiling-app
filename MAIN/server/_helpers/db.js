const config = require('../config.json');
const mongoose = require('mongoose');
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(config.connectionString, connectionOptions)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.Promise = global.Promise;

module.exports = {
    Account: require('../accounts/account.model'),
    RefreshToken: require('../accounts/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
