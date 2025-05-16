// cleanup-ghost-tokens.js
// Script to remove expired, revoked, or orphaned tokens from the RefreshToken collection

const mongoose = require('mongoose');
const config = require('../config.json');
const db = require('../_helpers/db');

async function cleanupGhostTokens() {
  console.log('--- Cleanup Ghost/Expired/Revoked/Orphaned Tokens Script ---');
  console.log('Connecting to DB:', config.connectionString);
  await mongoose.connect(config.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB.');

  const now = new Date();
  let totalDeleted = 0;

  // Remove expired or revoked tokens
  const expiredOrRevoked = await db.RefreshToken.deleteMany({
    $or: [
      { expires: { $lt: now } },
      { revoked: { $ne: null } }
    ]
  });
  totalDeleted += expiredOrRevoked.deletedCount;
  console.log(`Deleted ${expiredOrRevoked.deletedCount} expired or revoked tokens.`);

  // Remove orphaned tokens (no associated account)
  const orphaned = await db.RefreshToken.deleteMany({ account: { $exists: false } });
  totalDeleted += orphaned.deletedCount;
  console.log(`Deleted ${orphaned.deletedCount} orphaned tokens (no account).`);

  // Optionally, remove tokens with invalid account references
  const tokens = await db.RefreshToken.find({}).populate('account');
  let invalidAccountIds = [];
  for (const token of tokens) {
    if (!token.account) {
      invalidAccountIds.push(token._id);
    }
  }
  if (invalidAccountIds.length > 0) {
    const invalid = await db.RefreshToken.deleteMany({ _id: { $in: invalidAccountIds } });
    totalDeleted += invalid.deletedCount;
    console.log(`Deleted ${invalid.deletedCount} tokens with invalid account references.`);
  }

  console.log('--- Cleanup Complete ---');
  console.log(`Total tokens deleted: ${totalDeleted}`);
  mongoose.disconnect();
}

cleanupGhostTokens().catch(err => {
  console.error('Error during cleanup:', err);
  mongoose.disconnect();
});
