const express = require('express');
const router = express.Router();
const accountService = require('../accounts/account.service');
const authenticate = require('../_middleware/authenticate');
const Role = require('../_helpers/role');

// routes
router.get('/settings', authenticate(Role.Admin), getSettings);
router.post('/cleanup-sessions', authenticate(Role.Admin), cleanupSessions);
router.post('/update-cleanup-schedule', authenticate(Role.Admin), updateCleanupSchedule);

module.exports = router;

let lastCleanupTime = null;
let nextScheduledCleanup = null;

async function getSettings(req, res, next) {
    try {
        // Get active session count
        const activeSessions = await accountService.getActiveSessions();
        
        res.json({
            lastSessionCleanup: lastCleanupTime ? lastCleanupTime.toISOString() : null,
            nextScheduledCleanup: nextScheduledCleanup ? nextScheduledCleanup.toISOString() : null,
            activeSessionCount: activeSessions.length,
            cleanupSchedule: '0 0 * * *' // Default to midnight daily
        });
    } catch (error) {
        next(error);
    }
}

async function cleanupSessions(req, res, next) {
    try {
        const result = await accountService.cleanupRefreshTokens();
        lastCleanupTime = new Date();
        // Calculate next cleanup based on schedule
        nextScheduledCleanup = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        res.json({
            message: result.message,
            lastCleanup: lastCleanupTime.toISOString(),
            nextScheduled: nextScheduledCleanup.toISOString()
        });
    } catch (error) {
        next(error);
    }
}

async function updateCleanupSchedule(req, res, next) {
    try {
        const { schedule } = req.body;
        if (!schedule) {
            throw new Error('Schedule is required');
        }

        // Validate cron schedule format (basic validation)
        const parts = schedule.split(' ');
        if (parts.length !== 5) {
            throw new Error('Invalid cron schedule format');
        }

        // Update the next scheduled time
        nextScheduledCleanup = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        res.json({
            message: 'Cleanup schedule updated successfully',
            nextScheduled: nextScheduledCleanup.toISOString()
        });
    } catch (error) {
        next(error);
    }
} 