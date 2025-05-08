const { expressjwt: jwt } = require('express-jwt');
const { secret } = require('../config.json');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

module.exports = authorize;

function authorize(requiredRole) {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),

        // attach full user record to request object and check role
        async (req, res, next) => {
            // get user with id from token 'sub' (subject) property
            const user = await db.Account.findById(req.auth.sub);

            // check user still exists
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });

            // role-based authorization
            if (requiredRole) {
                if (requiredRole === Role.Admin) {
                    if (user.role !== Role.Admin && user.role !== Role.SuperAdmin) {
                        return res.status(401).json({ message: 'Unauthorized' });
                    }
                } else if (user.role !== requiredRole) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
            }

            // authorization successful
            req.user = user.toJSON();
            next();
        }
    ];
} 