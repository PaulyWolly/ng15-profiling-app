const express = require('express');
const router = express.Router();
const accountService = require('./account.service');
const upload = require('../_middleware/upload');
const authorize = require('../_middleware/authorize');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/validate-reset-token', validateResetToken);
router.post('/reset-password', resetPassword);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(), create);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);
router.put('/:id/upload-image', authorize(), upload.single('image'), uploadImage);

module.exports = router;

function authenticate(req, res, next) {
    accountService.authenticate(req.body)
        .then(account => res.json(account))
        .catch(next);
}

function register(req, res, next) {
    accountService.register(req.body)
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}

function verifyEmail(req, res, next) {
    accountService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body)
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
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
    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.sendStatus(404))
        .catch(next);
}

function create(req, res, next) {
    accountService.create(req.body)
        .then(account => res.json(account))
        .catch(next);
}

function update(req, res, next) {
    accountService.update(req.params.id, req.body)
        .then(account => res.json(account))
        .catch(next);
}

function _delete(req, res, next) {
    accountService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

function uploadImage(req, res, next) {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image file' });
    }

    accountService.uploadImage(req.params.id, req.file.path)
        .then(account => res.json({ 
            message: 'Profile image uploaded successfully',
            profileImage: account.profileImage
        }))
        .catch(next);
} 