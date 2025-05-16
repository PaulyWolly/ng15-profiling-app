const SessionInfo = require('../models/session-info.model');
const moment = require('moment');
const db = require('../_helpers/db');

exports.cleanupOldSessions = async (req, res) => {
  try {
    const today = moment().startOf('day');
    // Find sessions to keep: today (loginTime >= today)
    const sessionsToKeep = await SessionInfo.find({
      loginTime: { $gte: today.toDate() }
    }).select('_id');

    const keepIds = sessionsToKeep.map(s => s._id);

    // Delete all sessions NOT in keepIds
    const result = await SessionInfo.deleteMany({ _id: { $nin: keepIds } });

    res.json({
      message: `Deleted ${result.deletedCount} outdated sessions.`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Cleanup failed', error: err.message });
  }
};

exports.deleteAllExceptSuperAdmin = async (req, res) => {
  try {
    // Remove all sessions except those belonging to Super-Admin
    const result = await SessionInfo.deleteMany({ email: { $ne: 'pwelby@gmail.com' } });
    res.json({
      message: `Deleted ${result.deletedCount} sessions (excluding Super-Admin).`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete sessions', error: err.message });
  }
};

exports.deleteAllButMostRecentPerUser = async (req, res) => {
  try {
    // Get all tokens, sorted by accountId and created descending
    const allTokens = await db.RefreshToken.find({}).sort({ account: 1, created: -1 });
    const toDelete = [];
    let lastAccountId = null;
    for (const token of allTokens) {
      if (String(token.account) !== lastAccountId) {
        lastAccountId = String(token.account);
        continue; // Keep the first (most recent) token for each user
      }
      toDelete.push(token._id);
    }
    const result = await db.RefreshToken.deleteMany({ _id: { $in: toDelete } });
    res.json({
      message: `Deleted ${result.deletedCount} sessions (kept only most recent per user).`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete sessions', error: err.message });
  }
};
