const { expressjwt: jwt } = require('express-jwt');
const { secret } = require('../config.json');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');
const logger = require('../logs/logger.service');

module.exports = authorize;

function authorize(requiredRole) {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        (req, res, next) => {
            console.log('[Authenticate] Middleware called for', req.originalUrl);
            return jwt({ secret, algorithms: ['HS256'] })(req, res, (err) => {
                if (err) {
                    console.error('[Authenticate] JWT error:', err);
                    // Log authentication failures
                    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                    logger.createSystemLog(
                        'Authentication Failure',
                        `Failed JWT authentication for ${req.originalUrl}: ${err.message}`,
                        'Error',
                        ipAddress
                    );
                    return next(err);
                }
                next();
            });
        },
        // attach full user record to request object and check role
        async (req, res, next) => {
            try {
                // get user with id from token 'sub' (subject) property
                const user = await db.Account.findById(req.auth.sub);
                const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

                // check user still exists
                if (!user) {
                    console.error('[Authenticate] No user found for sub:', req.auth.sub);
                    // Log user not found
                    logger.createSystemLog(
                        'Authentication Failure',
                        `No user found for ID: ${req.auth.sub}`,
                        'Error',
                        ipAddress
                    );
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                // role-based authorization
                if (requiredRole) {
                    if (requiredRole === Role.Admin) {
                        if (user.role !== Role.Admin && user.role !== Role.SuperAdmin) {
                            console.error('[Authenticate] User does not have required admin role:', user.role);
                            // Log insufficient permission
                            logger.createAuditLog(
                                user.email,
                                'Permission Denied',
                                `User with role ${user.role} attempted to access admin resource: ${req.originalUrl}`,
                                'Warning',
                                ipAddress
                            );
                            return res.status(401).json({ message: 'Unauthorized' });
                        }
                    } else if (user.role !== requiredRole) {
                        console.error('[Authenticate] User does not have required role:', requiredRole, 'Actual:', user.role);
                        // Log insufficient permission
                        logger.createAuditLog(
                            user.email,
                            'Permission Denied',
                            `User with role ${user.role} attempted to access resource requiring ${requiredRole}: ${req.originalUrl}`,
                            'Warning',
                            ipAddress
                        );
                        return res.status(401).json({ message: 'Unauthorized' });
                    }
                }

                // Log successful authentication for sensitive paths
                if (req.originalUrl.includes('/admin') ||
                    req.originalUrl.includes('/settings') ||
                    req.method !== 'GET') {
                    logger.createAuditLog(
                        user.email,
                        'Authentication Success',
                        `User authenticated for ${req.method} ${req.originalUrl}`,
                        'Success',
                        ipAddress
                    );
                }

                // authorization successful
                req.user = user.toJSON();
                next();
            } catch (err) {
                console.error('[Authenticate] Error in user lookup/role check:', err);
                const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                logger.createErrorLog(
                    'Authentication Error',
                    `Error during authentication: ${err.message}`,
                    req.auth?.sub ? `User ID: ${req.auth.sub}` : 'Unknown user',
                    ipAddress
                );
                next(err);
            }
        }
    ];
}
