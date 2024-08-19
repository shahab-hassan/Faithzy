const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    terms: { type: String, required: true },
    socialLinks: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        pinterest: { type: String },
        tumblr: { type: String },
        youtube: { type: String },
        snapchat: { type: String },
        tiktok: { type: String },
        linkedin: { type: String },
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);