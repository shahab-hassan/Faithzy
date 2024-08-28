const adminSettingsModel = require('../models/adminSettingsModel');
const {productOrderModel, serviceOrderModel} = require('../models/orderModel');
const asyncHandler = require('express-async-handler');


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

        const settings = await adminSettingsModel.findOne({});

        if (!settings) {
            res.status(404);
            throw new Error("Settings not found!");
        }

        res.status(200).json({
            success: true, generalInfo: {
                completedOrders: settings.completedOrders,
                productsSold: settings.productsSold,
                servicesDone: settings.servicesDone,
                activeOrders: settings.activeOrders,
                cancelledOrders: settings.cancelledOrders,
                activeServices: settings.activeServices,
                activeProducts: settings.activeProducts,
                registeredUsers: settings.registeredUsers,
                totalSellers: settings.totalSellers,
                paidSellers: settings.paidSellers,
            }
        });

    } catch (err) {
        res.status(500);
        throw new Error(err);
    }
});

// exports.getRevenueAndProfitDetails = asyncHandler(async (req, res) => {
//     const { filter } = req.query;

//     // Calculate the start date based on the filter
//     const dateMap = {
//         '7d': 7,
//         '30d': 30,
//         '90d': 180,
//         'lifetime': 360
//     };

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - dateMap[filter]);

//     const orders = await serviceOrderModel.find({
//         createdAt: { $gte: startDate }
//     }).select('createdAt netProfit summary');

//     const revenueData = orders.map(order => ({
//         date: order.createdAt,
//         total: order.summary.paidByBuyer.total
//     }));

//     const netProfitData = orders.map(order => ({
//         date: order.createdAt,
//         total: order.summary.netProfit
//     }));

//     res.json({ revenue: revenueData, netProfit: netProfitData });
// });


exports.getRevenueAndProfitDetails = asyncHandler(async (req, res) => {
    const { filter } = req.query;

    const dateMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        'lifetime': 360
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateMap[filter]);
    
    const dateRange = {};
    for (let i = 1; i <= dateMap[filter]; i++) {
        const date = new Date();
        date.setDate(startDate.getDate() + i);
        dateRange[date.toISOString().split('T')[0]] = { revenue: 0, profit: 0 };
        console.log(date.getDate());
    }

    const productOrders = await productOrderModel.aggregate([
        {
            $unwind: "$products"
        },
        {
            $match: {
                "products.crrStatus": "Delivered",
                "updatedAt": { $gte: startDate }
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
                "updatedAt": { $gte: startDate }
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

    let totalRevenue = 0, fromOrders = 0, fromMemberships=0, fromBoosts=0, newUsers=0, netProfit = 0;

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

    const revenueData = Object.keys(dateRange).map(date => ({
        date,
        total: dateRange[date].revenue
    }));

    const netProfitData = Object.keys(dateRange).map(date => ({
        date,
        total: dateRange[date].profit
    }));

    res.json({ generalData: {totalRevenue, fromOrders, fromMemberships, fromBoosts, newUsers, netProfit}, revenue: revenueData, netProfit: netProfitData });
});