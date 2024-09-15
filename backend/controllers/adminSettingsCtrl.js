const adminSettingsModel = require('../models/adminSettingsModel');
const { productOrderModel, serviceOrderModel } = require('../models/orderModel');
const Seller = require('../models/sellerModel');
const Product = require('../models/productModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const sendEmail = require("../utils/sendEmail")
const {sendEmailFromAdminTemplate, receiveEmailFromUserTemplate} = require("../utils/emailTemplates")


exports.getTerms = asyncHandler(async (req, res) => {
    try {

        const settings = await adminSettingsModel.findOne({}, 'terms');

        if (!settings || !settings.terms) {
            res.status(404);
            throw new Error("Terms not found!");
        }

        res.status(200).json({ success: true, terms: settings.terms });

    } catch (err) {
        res.status(500);
        throw new Error(err);
    }
});

exports.createOrUpdateTerms = asyncHandler(async (req, res) => {

    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error("Content is required!");
    }

    let settings = await adminSettingsModel.findOne();

    if (settings) {
        settings.terms = content;
        settings = await settings.save();
    } else
        settings = await adminSettingsModel.create({ terms: content });

    res.status(200).json({
        success: true,
        terms: settings.terms
    });
});


exports.getSocialLinks = asyncHandler(async (req, res) => {
    const settings = await adminSettingsModel.findOne({}, 'socialLinks');

    if (!settings || !settings.socialLinks) {
        res.status(404);
        throw new Error("Social links not found!");
    }

    res.status(200).json({ success: true, socialLinks: settings.socialLinks });
});

exports.createOrUpdateSocialLinks = asyncHandler(async (req, res) => {
    const { socialLinks } = req.body;

    if (!socialLinks || Object.keys(socialLinks).length === 0) {
        res.status(400);
        throw new Error("At least one social link is required!");
    }

    let settings = await adminSettingsModel.findOne();

    if (settings) {
        settings.socialLinks = socialLinks;
        settings = await settings.save();
    } else {
        settings = await adminSettingsModel.create({ socialLinks });
    }

    res.status(200).json({ success: true, socialLinks: settings.socialLinks });
});

exports.getAdminFeesAndMembership = asyncHandler(async (req, res) => {
    const settings = await adminSettingsModel.findOne();
    res.status(200).json({ success: true, fees: settings.fees, membership: settings.membership });
});

exports.updateAdminFees = asyncHandler(async (req, res) => {
    const { fees } = req.body;

    let settings = await adminSettingsModel.findOne();

    if (!settings) {
        settings = new adminSettingsModel({ fees });
    } else {
        settings.fees = { ...settings.fees, ...fees };
    }

    await settings.save();
    res.status(200).json({ success: true, message: 'Fees updated successfully' });
});

exports.updateAdminMembership = asyncHandler(async (req, res) => {
    const { membership } = req.body;

    let settings = await adminSettingsModel.findOne();

    if (!settings) {
        settings = new adminSettingsModel({ membership });
    } else {
        settings.membership = { ...settings.membership, ...membership };
    }

    await settings.save();
    res.status(200).json({ success: true, message: 'Fees updated successfully' });
});


exports.getGeneralDashboardInfo = asyncHandler(async (req, res) => {
    try {
        const completedOrders = await productOrderModel.countDocuments({ 'products.crrStatus': 'Completed' }) + await serviceOrderModel.countDocuments({ 'service.crrStatus': 'Completed' });
        const activeOrders = await productOrderModel.countDocuments({ 'products.crrStatus': 'Active' }) + await serviceOrderModel.countDocuments({ 'service.crrStatus': 'Active' });
        const cancelledOrders = await productOrderModel.countDocuments({ 'products.crrStatus': 'Cancelled' }) + await serviceOrderModel.countDocuments({ 'service.crrStatus': 'Cancelled' });

        const productsSold = await productOrderModel.countDocuments({ 'products.crrStatus': 'Completed' });
        const servicesDone = await serviceOrderModel.countDocuments({ 'service.crrStatus': 'Completed' });

        const activeProducts = await Product.countDocuments();
        const activeServices = await Service.countDocuments();

        const registeredUsers = await User.countDocuments();

        const totalSellers = await Seller.countDocuments();
        const paidSellers = await Seller.countDocuments({ sellerType: 'Paid' });

        res.status(200).json({
            success: true,
            generalInfo: {
                completedOrders,
                activeOrders,
                cancelledOrders,
                productsSold,
                servicesDone,
                activeServices,
                activeProducts,
                registeredUsers,
                totalSellers,
                paidSellers
            }
        });

    } catch (err) {
        res.status(500);
        throw new Error(err);
    }
});

exports.getRevenueAndProfitDetails = asyncHandler(async (req, res) => {
    const { filter, startDate: customStartDate, endDate: customEndDate } = req.query;

    let startDate, endDate;

    if (filter === 'custom') {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'lifetime') {
        startDate = new Date('2024-08-01');
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    } else {
        const dateMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        };
        startDate = new Date();
        startDate.setHours(12, 1, 1, 1);
        startDate.setDate(startDate.getDate() - (dateMap[filter] - 1));
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    }

    const dateRange = {};
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dateRange[currentDate.toISOString().split('T')[0]] = { revenue: 0, profit: 0 };
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const productOrders = await productOrderModel.aggregate([
        {
            $unwind: "$products"
        },
        {
            $match: {
                "products.crrStatus": "Completed",
                "updatedAt": { $gte: startDate, $lte: endDate }
            }
        },
        {
            $project: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                revenue: "$products.buyerPaid.total",
                profit: "$products.netProfit"
            }
        },
        {
            $group: {
                _id: "$date",
                revenue: { $sum: "$revenue" },
                profit: { $sum: "$profit" }
            }
        }
    ]);

    const serviceOrders = await serviceOrderModel.aggregate([
        {
            $match: {
                "service.crrStatus": "Completed",
                "updatedAt": { $gte: startDate, $lte: endDate }
            }
        },
        {
            $project: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                revenue: "$summary.paidByBuyer.total",
                profit: "$netProfit"
            }
        },
        {
            $group: {
                _id: "$date",
                revenue: { $sum: "$revenue" },
                profit: { $sum: "$profit" }
            }
        }
    ]);

    let totalRevenue = 0, fromOrders = 0, fromMemberships = 0, fromBoosts = 0, newUsers = 0, netProfit = 0;

    const orders = [...productOrders, ...serviceOrders];
    orders.forEach(order => {
        if (dateRange[order._id]) {
            dateRange[order._id].revenue += order.revenue;
            dateRange[order._id].profit += order.profit;
            totalRevenue += order.revenue;
            fromOrders += order.revenue;
            netProfit += order.profit;
        }
    });

    const sellerInvestments = await Seller.aggregate([
        {
            $unwind: "$investment"
        },
        {
            $match: {
                "investment.on": { $gte: startDate, $lte: endDate }
            }
        },
        {
            $project: {
                date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$investment.on" }
                },
                type: "$investment.in",
                amount: "$investment.of"
            }
        },
        {
            $group: {
                _id: {
                    date: "$date",
                    type: "$type"
                },
                totalAmount: { $sum: "$amount" }
            }
        }
    ]);

    sellerInvestments.forEach(investment => {
        const { date, type } = investment._id;
        const amount = investment.totalAmount;

        if (dateRange[date]) {
            dateRange[date].revenue += amount;
            dateRange[date].profit += amount;
            totalRevenue += amount;
            netProfit += amount;

            if (type === 'membership') {
                fromMemberships += amount;
            } else if (type === 'boosts') {
                fromBoosts += amount;
            }
        }
    });

    const revenueData = Object.keys(dateRange).map(date => ({
        date,
        total: dateRange[date].revenue
    }));

    const netProfitData = Object.keys(dateRange).map(date => ({
        date,
        total: dateRange[date].profit
    }));

    res.json({
        generalData: { totalRevenue, fromOrders, fromMemberships, fromBoosts, newUsers, netProfit },
        revenue: revenueData,
        netProfit: netProfitData
    });
});


exports.sendEmailToUserFromAdmin = asyncHandler(async (req, res) => {
    const { receiverEmail, subject, message, buttons } = req.body;

    await sendEmail({
        to: receiverEmail,
        subject,
        text: sendEmailFromAdminTemplate(subject, message, buttons),
    });

    res.status(200).json({ success: true });
});


exports.receiveEmailFromUser = asyncHandler(async (req, res) => {

    await sendEmail({
        from: req.body.email,
        subject: `New Contact Form Submission: ${req.body.subject}`,
        text: receiveEmailFromUserTemplate(req.body.fullName, req.body.email, req.body.country, req.body.phoneNumber, req.body.message),
    });

    res.status(200).json({ success: true });

});