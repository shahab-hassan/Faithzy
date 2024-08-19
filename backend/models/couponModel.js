const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    discount: { type: Number, required: true },
    minToApply: { type: Number, required: true },
    expiry: { type: Date, required: true },
    isSchedule: { type: Boolean, default: false },
    scheduledDate: { type: Date },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Scheduled'],
        default: 'Active'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
