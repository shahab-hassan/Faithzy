const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');

// Get all coupons
exports.getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find();
    res.json({ success: true, coupons });
});

// Get active coupons
exports.getActiveCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({ status: 'Active' });
    res.json({ success: true, coupons });
});

// Get expired coupons
exports.getExpiredCoupons = asyncHandler(async (req, res) => {
    const today = new Date();
    const coupons = await Coupon.find({ expiry: { $lt: today } });
    res.json({ success: true, coupons });
});

// Get scheduled coupons
exports.getScheduledCoupons = asyncHandler(async (req, res) => {
    const today = new Date();
    const coupons = await Coupon.find({ scheduledDate: { $gt: today } });
    res.json({ success: true, coupons });
});

// Create a new coupon
exports.createCoupon = asyncHandler(async (req, res) => {
    const { code, discount, minToApply, expiry, isSchedule, scheduledDate } = req.body;
    const newCoupon = await Coupon.create({ code, discount, minToApply, expiry, isSchedule, scheduledDate: isSchedule? scheduledDate : "", status: isSchedule? "Scheduled":"Active" });
    res.json({ success: true, coupon: newCoupon });
});

// Update a coupon
exports.updateCoupon = asyncHandler(async (req, res) => {
    const { code, discount, minToApply, expiry, isSchedule, scheduledDate } = req.body;
    const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, { code, discount, minToApply, expiry, isSchedule, scheduledDate: isSchedule? scheduledDate : "", status: isSchedule? "Scheduled":"Active" }, { new: true });
    res.json({ success: true, coupon: updatedCoupon });
});

// Delete a coupon
exports.deleteCoupon = asyncHandler(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});