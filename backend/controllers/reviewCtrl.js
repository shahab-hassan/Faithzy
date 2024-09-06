const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Product = require('../models/productModel');
const Seller = require('../models/sellerModel');
const { productOrderModel } = require('../models/orderModel');


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


exports.replyToProductReview = asyncHandler(async (req, res) => {
    const { reply } = req.body;

    try {
        const product = await Product.findOne({ "reviews.subOrderId": req.params.orderId });
        const seller = await Seller.findOne({ "reviews.orderId": req.params.orderId });
        if (product && seller) {

            const productReview = product.reviews.find(review => review.subOrderId === req.params.orderId);
            const sellerReview = seller.reviews.find(review => review.orderId === req.params.orderId);

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



// exports.getProductOrderReview = asyncHandler(async (req, res) => {
//     const { subOrderId } = req.params;

//     const order = await productOrderModel.findOne({ "products._id": subOrderId });
//     const productOrder = order.products.id(subOrderId);

//     if (!productOrder || (!productOrder?.isReviewSubmitted))
//         return res.status(404).json({ success: false, message: 'Review not found!' });

//     return res.status(200).json({ success: true, reviewFound: true });
// });