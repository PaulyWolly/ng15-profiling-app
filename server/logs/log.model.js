const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['Success', 'Warning', 'Error', 'Info'], required: true },
  ipAddress: { type: String },
  geoLocation: { type: String },
  userAgent: { type: String },
  responseTime: { type: Number },
  pageUrl: { type: String },
  referrer: { type: String }
});

const logSchema = new mongoose.Schema({
  type: { type: String, enum: ['User', 'System', 'Error', 'Audit'], required: true },
  user: { type: String },
  action: { type: String, required: true },
  entries: [logEntrySchema],
  sessionId: { type: String },
  sessionStartTime: { type: Date },
  sessionEndTime: { type: Date }
});

module.exports = mongoose.model('Log', logSchema, 'logs');
