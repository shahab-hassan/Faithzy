const asyncHandler = require("express-async-handler");
const disputeModel = require('../models/disputeModel');
const { productOrderModel, serviceOrderModel } = require('../models/orderModel');
const { paymentModel, withdrawModel } = require('../models/paymentModel');
const path = require('path');
const { io, getReceiverSocketId } = require('../config/socket');
const adminModel = require("../models/adminModel");
const adminSettingsModel = require("../models/adminSettingsModel");

exports.startNewProductOrderDispute = asyncHandler(async (req, res) => {
    try {
        const { orderId, productId, disputeReason, initiatedBy } = req.body;
        const order = await productOrderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, error: "Order not found" });

        const subOrder = order.products.id(productId);
        if (!subOrder) return res.status(404).json({ success: false, error: "Product not found in order" });

        const currentStatus = subOrder.status[subOrder.status.length - 1].name;
        if (currentStatus === "InDispute")
            return res.status(400).json({ success: false, error: "Order is already in Dispute" });

        subOrder.status.push({ name: 'InDispute', createdAt: new Date() });
        subOrder.crrStatus = 'InDispute';

        let dispute = new disputeModel({
            buyerId: order.userId,
            sellerId: subOrder.sellerId,
            orderId,
            subOrderId: productId,
            initiatedBy,
            orderAmount: subOrder.buyerPaid.subtotal,
            totalPaidByBuyer: subOrder.buyerPaid.total,
            provisionType: "Product",
            reason: disputeReason
        });

        subOrder.disputeId = dispute._id;

        await dispute.save();
        await order.save();

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

exports.startNewServiceOrderDispute = asyncHandler(async (req, res) => {
    try {
        const { orderId, disputeReason, initiatedBy } = req.body;
        const order = await serviceOrderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, error: "Order not found" });

        const currentStatus = order.service.status[order.service.status.length - 1].name;
        if (currentStatus === "InDispute")
            return res.status(400).json({ success: false, error: "Order is already in Dispute" });

        order.service.status.push({ name: 'InDispute', createdAt: new Date() });
        order.service.crrStatus = 'InDispute';

        let dispute = new disputeModel({
            buyerId: order.userId,
            sellerId: order.service.sellerId,
            orderId,
            initiatedBy,
            orderAmount: order.summary.paidByBuyer.salesPrice,
            totalPaidByBuyer: order.summary.paidByBuyer.total,
            provisionType: "Service",
            reason: disputeReason
        });

        order.service.disputeId = dispute._id;

        await dispute.save();
        await order.save();

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});


exports.getAllDisputes = asyncHandler(async (req, res) => {
    const { filterType } = req.query;
    let query = {};

    if (filterType === 'InProgress') query.status = 'InProgress';
    else if (filterType === 'Resolved') query.status = 'Resolved';

    const allDisputes = await disputeModel.find(query).populate({ path: 'buyerId' })
        .populate({
            path: 'sellerId',
            populate: {
                path: 'userId',
            },
        })
        .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, allDisputes });
})


exports.getDispute = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const dispute = await disputeModel.findById(id).populate({ path: 'buyerId' })
        .populate({
            path: 'sellerId',
            populate: {
                path: 'userId',
            },
        })

    let order, subOrder;
    if (dispute.provisionType === "Product") {
        order = await productOrderModel.findById(dispute.orderId).populate({
            path: 'products.productId',
            select: 'title category productImages'
        });
        subOrder = order.products.id(dispute.subOrderId);
    }
    else if (dispute.provisionType === "Service") {
        order = await serviceOrderModel.findById(dispute.orderId).populate({
            path: 'service.serviceId',
            select: 'title category serviceImages'
        });
        subOrder = order;
    }


    res.status(200).json({ success: true, dispute, subOrder });
})


exports.sendDisputeMessage = asyncHandler(async (req, res) => {
    const { disputeId, senderId, receiverIds, text } = req.body;

    const message = {
        senderId,
        text,
        timestamp: new Date()
    };

    if (req.file) {
        message.fileUrl = path.join('uploads', req.file.filename);
        message.fileType = req.file.mimetype;
    }

    try {
        const dispute = await disputeModel.findById(disputeId);
        if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

        dispute.messages.push(message);
        await dispute.save();

        JSON.parse(receiverIds).forEach(id => {
            if (id && id !== senderId) {
                const receiverSocketId = getReceiverSocketId(id);
                if (receiverSocketId)
                    io.to(receiverSocketId).emit('receiveDisputeMessage', message);
            }
        });

        const admins = await adminModel.find({});
        admins.forEach((admin) => {
            if (admin && (admin._id.toString() !== senderId)) {
                const receiverSocketId = getReceiverSocketId(admin._id);
                if (receiverSocketId)
                    io.to(receiverSocketId).emit('receiveDisputeMessage', message);
            }
        })

        res.status(200).json({ success: true, message });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

exports.resolveProductOrderDispute = asyncHandler(async (req, res) => {

    const { disputeId, amountToBuyer } = req.body;

    if (amountToBuyer < 0) {
        return res.status(400).json({ error: "Refund amount cannot be negative!" });
    }

    try {
        const dispute = await disputeModel.findById(disputeId).populate('buyerId sellerId');
        if (!dispute) return res.status(404).json({ error: "Dispute not found" });

        const orderAmount = dispute.orderAmount;
        const amountToSeller = orderAmount - amountToBuyer;

        if (amountToBuyer > orderAmount || amountToSeller < 0)
            return res.status(400).json({ error: "Invalid refund and payment amounts!" });

        dispute.status = "Resolved";
        dispute.amountToBuyer = amountToBuyer;
        dispute.amountToSeller = amountToSeller;
        dispute.resolutionDate = new Date();


        const order = await productOrderModel.findById(dispute.orderId);
        let subOrder = order.products.id(dispute.subOrderId);
        subOrder.status.push({ name: 'Resolved', createdAt: new Date() });
        subOrder.crrStatus = "Resolved";

        if (amountToSeller !== 0) {

            let settings = await adminSettingsModel.findOne();
            let tax;
            if (dispute.sellerId.sellerType === "Free")
                tax = settings.fees.seller.product;
            else
                tax = settings.fees.paidSeller.product;

            let payment = await paymentModel.findOne({ sellerId: dispute.sellerId._id });
            if (!payment) {
                payment = new paymentModel({ sellerId: dispute.sellerId._id, history: [] });
            }
            payment.history.push({
                buyerUsername: dispute.buyerId.username,
                amount: amountToSeller * (1 - (tax / 100)),
                itemType: dispute.provisionType,
                status: "Earning",
                description: "Order Completed (Dispute Resolved)"
            });
            await payment.save();
            dispute.totalReceivedBySeller = amountToSeller * (1 - (tax / 100));
        }

        if (amountToBuyer !== 0) {
            const withdrawRequest = new withdrawModel({
                userId: dispute.buyerId._id,
                to: "Buyer",
                orderId: dispute.orderId,
                itemType: dispute.provisionType,
                amount: amountToBuyer
            });
            await withdrawRequest.save();
        }

        await dispute.save();
        await order.save();

        return res.status(200).json({ success: true, message: "Dispute resolved successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error resolving dispute." });
    }
});

exports.resolveServiceOrderDispute = asyncHandler(async (req, res) => {

    const { disputeId, amountToBuyer } = req.body;

    if (amountToBuyer < 0) {
        return res.status(400).json({ error: "Refund amount cannot be negative!" });
    }

    try {
        const dispute = await disputeModel.findById(disputeId).populate('buyerId sellerId');
        if (!dispute) return res.status(404).json({ error: "Dispute not found" });

        const orderAmount = dispute.orderAmount;
        const amountToSeller = orderAmount - amountToBuyer;

        if (amountToBuyer > orderAmount || amountToSeller < 0)
            return res.status(400).json({ error: "Invalid refund and payment amounts!" });

        dispute.status = "Resolved";
        dispute.amountToBuyer = amountToBuyer;
        dispute.amountToSeller = amountToSeller;
        dispute.resolutionDate = new Date();


        const order = await serviceOrderModel.findById(dispute.orderId);
        order.service.status.push({ name: 'Resolved', createdAt: new Date() });
        order.service.crrStatus = "Resolved";

        if (amountToSeller !== 0) {

            let settings = await adminSettingsModel.findOne();
            let tax;
            if (dispute.sellerId.sellerType === "Free")
                tax = settings.fees.seller.service;
            else
                tax = settings.fees.paidSeller.service;

            let payment = await paymentModel.findOne({ sellerId: dispute.sellerId._id });
            if (!payment) {
                payment = new paymentModel({ sellerId: dispute.sellerId._id, history: [] });
            }
            payment.history.push({
                buyerUsername: dispute.buyerId.username,
                amount: amountToSeller * (1 - (tax / 100)),
                itemType: dispute.provisionType,
                status: "Earning",
                description: "Order Completed (Dispute Resolved)"
            });
            await payment.save();
            dispute.totalReceivedBySeller = amountToSeller * (1 - (tax / 100));
        }

        if (amountToBuyer !== 0) {
            const withdrawRequest = new withdrawModel({
                userId: dispute.buyerId._id,
                to: "Buyer",
                orderId: dispute.orderId,
                itemType: dispute.provisionType,
                amount: amountToBuyer
            });
            await withdrawRequest.save();
        }

        await dispute.save();
        await order.save();

        return res.status(200).json({ success: true, message: "Dispute resolved successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error resolving dispute." });
    }
});