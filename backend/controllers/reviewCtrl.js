const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Product = require('../models/productModel');
const Service = require('../models/serviceModel');
const Seller = require('../models/sellerModel');
const { productOrderModel, serviceOrderModel } = require('../models/orderModel');


exports.getProductOrderReview = asyncHandler(async (req, res) => {
    const { sellerId, subOrderId } = req.params;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
        return res.status(404).json({ success: false, message: 'Seller not found!' });
    }

    const review = seller.reviews.find(r => r.orderId === subOrderId);

    if (!review || review.orderType !== "Product")
        return res.status(404).json({ success: false, message: 'Review not found!' });

    res.status(200).json({ success: true, review });
});


exports.getServiceOrderReview = asyncHandler(async (req, res) => {
    const { sellerId, orderId } = req.params;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
        return res.status(404).json({ success: false, message: 'Seller not found!' });
    }

    const review = seller.reviews.find(r => r.orderId === orderId);

    if (!review || review.orderType !== "Service")
        return res.status(404).json({ success: false, message: 'Review not found!' });

    res.status(200).json({ success: true, review });
});


exports.addNewProductReview = asyncHandler(async (req, res) => {
    const { subOrderId, productId, sellerId, rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    try {
        const product = await Product.findById(productId);
        const seller = await Seller.findById(sellerId);
        const order = await productOrderModel.findOne({ "products._id": subOrderId });
        const productOrder = order.products.id(subOrderId);

        if (!product || !seller) {
            return res.status(404).json({ success: false, message: 'Product or Seller not found.' });
        }

        if (productOrder && productOrder.isReviewSubmitted)
            return res.status(400).json({ success: false, message: 'You have already reviewed this product!' });

        const newProductReview = {
            userId: req.user._id,
            subOrderId: subOrderId,
            rating,
            comment
        };
        const newSellerReview = {
            userId: req.user._id,
            orderId: subOrderId,
            orderType: "Product",
            rating,
            comment
        };

        product.reviews.push(newProductReview);
        product.noOfReviews = product.reviews.length;

        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        seller.reviews.push(newSellerReview);
        seller.noOfReviews = seller.reviews.length;

        seller.rating = seller.reviews.reduce((acc, item) => item.rating + acc, 0) / seller.reviews.length;
        productOrder.isReviewSubmitted = true;

        await product.save();
        await seller.save();
        await order.save();

        res.status(200).json({ success: true, review: newProductReview });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


exports.addNewServiceReview = asyncHandler(async (req, res) => {
    const { orderId, serviceId, sellerId, rating, comment } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    try {
        const service = await Service.findById(serviceId);
        const seller = await Seller.findById(sellerId);
        const order = await serviceOrderModel.findById(orderId);
        const serviceOrder = order.service;

        if (!service || !seller) {
            return res.status(404).json({ success: false, message: 'Service or Seller not found.' });
        }

        if (serviceOrder && serviceOrder.isReviewSubmitted)
            return res.status(400).json({ success: false, message: 'You have already reviewed this service!' });

        const newServiceReview = {
            userId: req.user._id,
            orderId: orderId,
            rating,
            comment
        };
        const newSellerReview = {
            userId: req.user._id,
            orderId: orderId,
            orderType: "Service",
            rating,
            comment
        };

        service.reviews.push(newServiceReview);
        service.noOfReviews = service.reviews.length;

        service.rating = service.reviews.reduce((acc, item) => item.rating + acc, 0) / service.reviews.length;

        seller.reviews.push(newSellerReview);
        seller.noOfReviews = seller.reviews.length;

        seller.rating = seller.reviews.reduce((acc, item) => item.rating + acc, 0) / seller.reviews.length;
        serviceOrder.isReviewSubmitted = true;

        await service.save();
        await seller.save();
        await order.save();

        res.status(200).json({ success: true, review: newServiceReview });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


exports.replyToProductReview = asyncHandler(async (req, res) => {
    const { reply } = req.body;

    try {
        const product = await Product.findOne({ "reviews.subOrderId": req.params.subOrderId });
        const seller = await Seller.findOne({ "reviews.orderId": req.params.subOrderId });
        if (product && seller) {

            const productReview = product.reviews.find(review => review.subOrderId === req.params.subOrderId);
            const sellerReview = seller.reviews.find(review => review.orderId === req.params.subOrderId);

            productReview.reply = reply;
            sellerReview.reply = reply;

            await product.save();
            await seller.save();

            res.status(200).json({ success: true, updatedReview: productReview });
        } else {
            res.status(404).json({ success: false, message: 'Review not found.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error.' });
    }
});


exports.replyToServiceReview = asyncHandler(async (req, res) => {
    const { reply } = req.body;

    try {
        const service = await Service.findOne({ "reviews.orderId": req.params.orderId });
        const seller = await Seller.findOne({ "reviews.orderId": req.params.orderId });
        if (service && seller) {

            const serviceReview = service.reviews.find(review => review.orderId === req.params.orderId);
            const sellerReview = seller.reviews.find(review => review.orderId === req.params.orderId);

            serviceReview.reply = reply;
            sellerReview.reply = reply;

            await service.save();
            await seller.save();

            res.status(200).json({ success: true, updatedReview: serviceReview });
        } else {
            res.status(404).json({ success: false, message: 'Review not found.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error.' });
    }
});


exports.getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId)
        .populate({
            path: 'reviews.userId',
            select: 'username sellerId',
            populate: {
                path: 'sellerId',
                select: 'profileImage'
            }
        })

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found!' });
    }

    const sortedReviews = product.reviews.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({
        success: true,
        rating: product.rating,
        reviews: sortedReviews
    });
});


exports.getServiceReviews = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId)
        .populate({
            path: 'reviews.userId',
            select: 'username sellerId',
            populate: {
                path: 'sellerId',
                select: 'profileImage'
            }
        })

    if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found!' });
    }

    const sortedReviews = service.reviews.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({
        success: true,
        rating: service.rating,
        reviews: sortedReviews
    });
});


exports.getSellerReviews = asyncHandler(async (req, res) => {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId)
        .populate({
            path: 'reviews.userId',
            select: 'username sellerId',
            populate: {
                path: 'sellerId',
                select: 'profileImage'
            }
        })

    if (!seller) {
        return res.status(404).json({ success: false, message: 'Seller not found!' });
    }

    const sortedReviews = seller.reviews.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({
        success: true,
        rating: seller.rating,
        reviews: sortedReviews
    });
});


// exports.getProductOrderReview = asyncHandler(async (req, res) => {
//     const { subOrderId } = req.params;

//     const order = await productOrderModel.findOne({ "products._id": subOrderId });
//     const productOrder = order.products.id(subOrderId);

//     if (!productOrder || (!productOrder?.isReviewSubmitted))
//         return res.status(404).json({ success: false, message: 'Review not found!' });

//     return res.status(200).json({ success: true, reviewFound: true });
// });