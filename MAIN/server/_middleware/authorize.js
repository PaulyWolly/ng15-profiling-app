const jwt = require('jsonwebtoken');
const config = require('../config.json');
const db = require('../_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        async (req, res, next) => {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, config.secret);
                const user = await db.Account.findById(decoded.id);

                if (!user) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                // authentication and authorization successful
                req.user = user;
                next();
            } catch (error) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        },

        // authorize based on user role
        async (req, res, next) => {
            if (roles.length && !roles.includes(req.user.role)) {
                // user's role is not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            next();
        }
    ];
} 