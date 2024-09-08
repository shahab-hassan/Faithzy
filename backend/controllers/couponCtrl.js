const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');
const cron = require('node-cron');

cron.schedule('* * * * *', async () => {

    const now = new Date();

    await Coupon.updateMany(
        { isSchedule: true, scheduledDate: { $lte: now }, status: 'Scheduled' },
        { $set: { status: 'Active', isSchedule: false } }
    );

    await Coupon.updateMany(
        { expiry: { $lte: now }, status: 'Active' },
        { $set: { status: 'Expired' } }
    );
});

// Get all coupons
exports.getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort({ updatedAt: -1 });
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
    const newCoupon = await Coupon.create({ code, discount, minToApply, expiry, isSchedule, scheduledDate: isSchedule ? scheduledDate : "", status: isSchedule ? "Scheduled" : "Active" });
    res.json({ success: true, coupon: newCoupon });
});

// Update a coupon
exports.updateCoupon = asyncHandler(async (req, res) => {
    const { code, discount, minToApply, expiry, isSchedule, scheduledDate } = req.body;
    const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, { code, discount, minToApply, expiry, isSchedule, scheduledDate: isSchedule ? scheduledDate : "", status: isSchedule ? "Scheduled" : "Active" }, { new: true });
    res.json({ success: true, coupon: updatedCoupon });
});

// Delete a coupon
exports.deleteCoupon = asyncHandler(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

exports.applyCoupon = asyncHandler(async (req, res) => {
    const { code, salesPrice } = req.body;

    const coupon = await Coupon.findOne({ code });
    if (!coupon)
        return res.status(400).json({ success: false, error: "Invalid coupon code!" });
    
    if(coupon.status !== "Active")
        return res.status(400).json({ success: false, error: `Coupon is not Active at the Moment` });

    if(salesPrice < coupon.minToApply)
        return res.status(400).json({ success: false, error: `Sales Price should be atleast $${coupon.minToApply} to apply this Coupon!` });
    

    return res.status(200).json({ success: true, coupon });

});