const express = require('express');
const router = express.Router();
const authenticate = require('../_middleware/authenticate');
const { upload, uploadProfileImage, uploadFollowerImage } = require('./upload.controller');
const accountService = require('./account.service');
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const Role = require('../_helpers/role');

console.log('Setting up accounts routes...');

// authentication routes
router.post('/authenticate', authenticateSchema, handleAuthenticate);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authenticate(), revokeTokenSchema, revokeToken);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);

// account routes
router.get('/', authenticate(), getAll);
router.get('/:id', authenticate(), getById);
router.post('/', authenticate(), createSchema, create);
router.put('/:id', authenticate(), updateSchema, update);
router.delete('/:id', authenticate(), _delete);

// Configure upload route with proper error handling
router.post('/upload-profile-image', 
    authenticate(),
    (req, res, next) => {
        upload.single('profileImage')(req, res, (err) => {
            if (err) {
                console.error('Upload middleware error:', err);
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    (req, res, next) => {
        console.log('Processing upload request:', {
            file: req.file ? {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : null,
            user: req.user?.id,
            email: req.body.userEmail
        });
        uploadProfileImage(req, res, next);
    }
);

// Add follower image upload route
router.post('/upload-follower-image', 
    authenticate(),
    (req, res, next) => {
        upload.single('followerImage')(req, res, (err) => {
            if (err) {
                console.error('Upload middleware error:', err);
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    },
    (req, res, next) => {
        console.log('Processing follower upload request:', {
            file: req.file ? {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : null,
            user: req.user?.id,
            followerName: req.body.followerName
        });
        
        try {
            uploadFollowerImage(req, res, next);
        } catch (error) {
            console.error('Error in upload follower image route:', error);
            res.status(500).json({ message: 'Server error during upload' });
        }
    }
);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function handleAuthenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    if (!req.user.ownsToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    accountService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}

function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
    accountService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

function getAll(req, res, next) {
    accountService.getAll()
        .then(accounts => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    accountService.create(req.body)
        .then(account => res.json(account))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
        
        // Profile template
        profileTemplateType: Joi.string().valid('STANDARD', 'BUSINESS_CARD', 'SOCIAL_MEDIA').empty(''),
        
        // Personal & Professional Details
        position: Joi.string().empty(''),
        company: Joi.string().empty(''),
        address: Joi.string().empty(''),
        city: Joi.string().empty(''),
        state: Joi.string().empty(''),
        zipCode: Joi.string().empty(''),
        phone: Joi.string().empty(''),
        mobile: Joi.string().empty(''),
        bio: Joi.string().empty(''),
        
        // Social Media Links
        website: Joi.string().uri().empty(''),
        github: Joi.string().empty(''),
        twitter: Joi.string().empty(''),
        instagram: Joi.string().empty(''),
        facebook: Joi.string().empty(''),
        
        // Social Media Stats
        followersCount: Joi.number().integer().min(0).empty(''),
        followingCount: Joi.number().integer().min(0).empty(''),
        
        // Professional Skills - allow array of strings
        skills: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).empty(''),
        
        // Follower images
        followerImages: Joi.array().items(
            Joi.object({
                id: Joi.string().required(),
                name: Joi.string().required(),
                title: Joi.string().allow('', null),
                imageUrl: Joi.string().allow('', null),
                path: Joi.string().allow('', null)
            })
        ).optional()
    };

    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.update(req.params.id, req.body)
        .then(account => res.json(account))
        .catch(next);
}

function _delete(req, res, next) {
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

// helper functions
function setTokenCookie(res, token) {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
} 