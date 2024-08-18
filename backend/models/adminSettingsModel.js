const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({

    terms: { type: String, required: true }

}, {
    timestamps: true
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);