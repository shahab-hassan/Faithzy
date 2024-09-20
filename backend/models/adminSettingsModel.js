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
    fees: {
        seller: {
            product: { type: Number, default: 0 },
            service: { type: Number, default: 0 },
        },
        paidSeller: {
            product: { type: Number, default: 0 },
            service: { type: Number, default: 0 },
        },
        buyer: {
            product: { type: Number, default: 0 },
            service: { type: Number, default: 0 },
        },
    },
    membership: {
        threeMonths: { type: Number, default: 0 },
        sixMonths: { type: Number, default: 0 },
        twelveMonths: { type: Number, default: 0 },
        offerDiscount: { type: Boolean, default: false },
        discountType: { type: String, enum: ['onAllPlans', 'individualDiscount'], default: 'onAllPlans' },
        discounts: {
            allPlans: { discount: { type: Number }, expiryDate: { type: Date } },
            threeMonths: { discount: { type: Number }, expiryDate: { type: Date } },
            sixMonths: { discount: { type: Number }, expiryDate: { type: Date } },
            twelveMonths: { discount: { type: Number }, expiryDate: { type: Date } },
        }
    },
    p_key: String,
    s_key: String
},
{
    timestamps: true
});

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);