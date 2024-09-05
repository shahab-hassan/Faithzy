const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Product = require('../models/productModel');
const Seller = require('../models/sellerModel');




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

        if (!product || !seller) {
            return res.status(404).json({ success: false, message: 'Product or Seller not found.' });
        }

        const existingProductReview = product.reviews.find(r => r.userId.toString() === userId.toString() && r.subOrderId === subOrderId);
        if (existingProductReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this product!' });
        }

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

        await product.save();
        await seller.save();

        res.status(200).json({ success: true, review: newProductReview });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error.' });
    }
});




exports.getProductOrderReview = asyncHandler(async (req, res) => {
    const { productId, sellerId } = req.params;
    const userId = req.user._id;

    // Fetch the review from Product collection
    const product = await Product.findById(productId).populate('reviews.userId', 'name email');
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Find the review by this user for this product
    const review = product.reviews.find(r => r.userId.toString() === userId.toString() && r.subOrderId === req.query.subOrderId);

    if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({ success: true, review });
});



exports.replyToProductReview = asyncHandler(async (req, res) => {
    const { reply } = req.body;
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!reply || reply.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Reply cannot be empty.' });
    }

    try {
        // Find the seller by the user's ID
        const seller = await Seller.findOne({ userId: userId });
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found.' });
        }

        // Find the review in the Seller's reviews
        const sellerReview = seller.reviews.id(reviewId);
        if (!sellerReview) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        // Only the seller can reply
        // (Assuming that the Seller is the owner of the review)
        // If you have roles, ensure the user is a seller.

        // Update the reply
        sellerReview.reply = reply;

        // Save the seller
        await seller.save();

        // Also update the reply in the Product's reviews
        const product = await Product.findById(sellerReview.orderId); // Assuming orderId corresponds to productId
        if (product) {
            const productReview = product.reviews.find(r => r.userId.toString() === sellerReview.userId.toString() && r.subOrderId === sellerReview.orderId);
            if (productReview) {
                productReview.reply = reply;
                await product.save();
            }
        }

        res.status(200).json({ success: true, updatedReview: sellerReview });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error.' });
    }
});


// exporys.replyToProductReview = asyncHandler(async (req, res) => {
//     const { reply } = req.body;

//     try {
//         const product = await Product.findOne({ "reviews._id": req.params.reviewId });
//         const seller = await Seller.findOne({ "reviews._id": req.params.reviewId });

//         if (product && seller) {
//             const productReview = product.reviews.id(req.params.reviewId);
//             const sellerReview = seller.reviews.id(req.params.reviewId);

//             productReview.reply = reply;
//             sellerReview.reply = reply;

//             await product.save();
//             await seller.save();

//             res.status(200).json({ success: true, updatedReview: productReview });
//         } else {
//             res.status(404).json({ success: false, message: 'Review not found.' });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Server Error.' });
//     }
// });

