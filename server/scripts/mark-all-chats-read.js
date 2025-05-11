// Usage: node mark-all-chats-read.js <recipientId>
const mongoose = require('mongoose');
const path = require('path');
const Chat = require(path.join(__dirname, '../models/chat.model.js'));

const recipientId = process.argv[2];
if (!recipientId) {
  console.error('Usage: node mark-all-chats-read.js <recipientId>');
  process.exit(1);
}

const mongoUri = 'mongodb://localhost:27017/angular-profiling-app'; // <-- CHANGED to the actual DB name

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const res = await Chat.updateMany({ recipientId, read: false }, { $set: { read: true } });
    console.log(`Marked all unread chats as read for recipientId: ${recipientId}`);
    console.log('MongoDB result:', res);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 