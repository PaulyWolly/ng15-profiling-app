const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { secret, emailFrom, smtpOptions } = require('../config.json');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');
const nodemailer = require('nodemailer');

// Configure SMTP options with environment variable for password
const smtpConfig = {
    ...smtpOptions,
    auth: {
        ...smtpOptions.auth,
        pass: process.env.SMTP_APP_PASSWORD || smtpOptions.auth.pass
    }
};

// Check if SMTP password is properly configured
if (smtpConfig.auth.pass === 'SMTP_APP_PASSWORD') {
    throw new Error('SMTP App Password not found in environment variables');
}

// create reusable transporter object using the SMTP transport
const transporter = nodemailer.createTransport(smtpConfig);

// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Error:", error);
    } else {
        console.log("SMTP Server is ready to take our messages");
    }
});

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    uploadImage
};

async function authenticate({ email, password, ipAddress }) {
    console.log('Authentication attempt:', { email, ipAddress });
    
    try {
        // Trim the email and convert to lowercase for consistent comparison
        const normalizedEmail = email.trim().toLowerCase();
        console.log('Searching for email (normalized):', normalizedEmail);
        
        // Use case-insensitive query
        const account = await db.Account.findOne({ 
            email: { $regex: new RegExp('^' + normalizedEmail + '$', 'i') }
        });
        console.log('Database query completed');

        if (!account) {
            console.log('No account found for email:', normalizedEmail);
            throw 'Email or password is incorrect';
        }

        console.log('Account found:', {
            id: account._id,
            email: account.email,
            verified: account.verified,
            role: account.role,
            passwordHash: account.passwordHash ? 'exists' : 'missing'
        });

        const passwordValid = bcrypt.compareSync(password, account.passwordHash);
        console.log('Password validation result:', passwordValid);

        if (!account.verified || !passwordValid) {
            console.log('Authentication failed:', {
                verified: account.verified,
                passwordValid
            });
            throw 'Email or password is incorrect';
        }

        // authentication successful so generate jwt and refresh tokens
        console.log('Authentication successful, generating tokens');
        const jwtToken = generateJwtToken(account);
        const refreshToken = generateRefreshToken(account, ipAddress);

        // save refresh token
        await refreshToken.save();
        console.log('Refresh token saved');

        const response = {
            ...basicDetails(account),
            jwtToken,
            refreshToken: refreshToken.token
        };
        console.log('Authentication response prepared:', {
            id: response.id,
            email: response.email,
            role: response.role,
            hasJwtToken: !!response.jwtToken,
            hasRefreshToken: !!response.refreshToken
        });

        return response;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await getAccount(refreshToken.account);

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    console.log('Registering new account:', {
        email: params.email,
        requestedRole: params.role
    });

    // create account object
    const account = new db.Account(params);

    // Ensure role is provided and valid
    if (!params.role || ![Role.Admin, Role.User].includes(params.role)) {
        console.log('Invalid role provided:', params.role);
        throw 'Role must be either "Admin" or "User"';
    }

    console.log('Setting account role:', params.role);
    
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    console.log('Account saved with role:', account.role);

    // send email
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ verificationToken: token });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = undefined;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ email });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = {
        token: randomTokenString(),
        expires: new Date(Date.now() + 24*60*60*1000)
    };
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid token';
}

async function resetPassword({ token, password }) {
    const account = await db.Account.findOne({
        'resetToken.token': token,
        'resetToken.expires': { $gt: Date.now() }
    });

    if (!account) throw 'Invalid token';

    // update password and remove reset token
    account.passwordHash = hash(password);
    account.passwordReset = Date.now();
    account.resetToken = undefined;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.find();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
        // Don't store the plain text password in the DB
        delete params.password;
    }
    
    // Remove confirmPassword if it exists (we don't store this)
    if (params.confirmPassword) {
        delete params.confirmPassword;
    }
    
    // Handle skills array if it's provided as a string
    if (params.skills && typeof params.skills === 'string') {
        params.skills = params.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    }
    
    // Log the parameters we're about to save
    console.log('Updating account with these parameters:', JSON.stringify(params, null, 2));

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();
    
    console.log('Account updated successfully');

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.deleteOne();
}

async function uploadImage(accountId, imagePath) {
    const account = await getAccount(accountId);
    account.profileImage = imagePath;
    await account.save();
    return basicDetails(account);
}

// helper functions

async function getAccount(id) {
    if (!db.isValidId(id)) throw 'Account not found';
    const account = await db.Account.findById(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function hash(password) {
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    console.log('Generating JWT token for account:', {
        id: account.id,
        email: account.email,
        role: account.role
    });
    
    const token = jwt.sign({ sub: account.id, id: account.id }, secret, { expiresIn: '15m' });
    console.log('JWT token generated successfully');
    return token;
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified, profileImage,
          // Include all the new fields
          profileTemplateType, position, company, address, phone, mobile, bio,
          website, github, twitter, instagram, facebook,
          followersCount, followingCount, skills } = account;
    
    return { id, title, firstName, lastName, email, role, created, updated, isVerified, profileImage,
           // Return all the new fields
           profileTemplateType, position, company, address, phone, mobile, bio,
           website, github, twitter, instagram, facebook,
           followersCount, followingCount, skills };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/accounts/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await transporter.sendMail({
        from: emailFrom,
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = '<p>If you don\'t know your password you can reset it via the <code>/accounts/forgot-password</code> api route.</p>';
    }

    await transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
} 