const asyncHandler = require("express-async-handler");
const disputeModel = require('../models/disputeModel');
const { productOrderModel, serviceOrderModel } = require('../models/orderModel');
const path = require('path');
const { io, getReceiverSocketId } = require('../config/socket');
const adminModel = require("../models/adminModel");

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
            provisionType: "Product",
            disputeReason
        });

        subOrder.disputeId = dispute._id;

        await order.save();
        await dispute.save();

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
