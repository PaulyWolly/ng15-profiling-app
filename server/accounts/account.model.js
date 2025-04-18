const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    title: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    acceptTerms: Boolean,
    role: { type: String, required: true },
    verificationToken: String,
    verified: Date,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    created: { type: Date, default: Date.now },
    updated: Date,
    profileImage: String,
    
    // Profile template selection
    profileTemplateType: { type: String, default: 'STANDARD' },
    
    // Personal & Professional Details
    position: String,
    company: String, 
    address: String,
    phone: String,
    mobile: String,
    bio: String,
    
    // Social Media Links
    website: String,
    github: String,
    twitter: String,
    instagram: String,
    facebook: String,
    
    // Social Media Stats
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    
    // Professional Skills
    skills: [String]
});

schema.virtual('isVerified').get(function () {
    return !!(this.verified || this.passwordReset);
});

// Add method to check if account owns a refresh token
schema.methods.ownsToken = function(token) {
    return this.model('RefreshToken').findOne({ token, account: this._id })
        .then(refreshToken => !!refreshToken);
};

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('Account', schema); 