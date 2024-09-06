const express = require('express');
const router = express.Router();
const {authorized} = require("../middlewares/authorization")

const { getProductOrderReview, addNewProductReview, replyToProductReview } = require("../controllers/reviewCtrl");

// router.get('/order/product/:subOrderId', authorized, checkProductOrderReviewExist);
// router.get('/order/service/:subOrderId', authorized, checkServiceOrderReviewExist);

router.get('/order/product/:sellerId/:subOrderId', authorized, getProductOrderReview);
// router.get('/order/service/:sellerId/:subOrderId', authorized, getServiceOrderReview);

// router.get('/product/:productId', getProductReviews);
// router.get('/seller/:sellerId', getSellerReviews);
// router.get('/service/:serviceId', getServiceReviews);

router.post('/product/new', authorized, addNewProductReview);
// router.post('/service/new', addNewServiceReview);

router.put('/review/reply/:orderId', authorized, replyToProductReview);
// router.put('/service/reply/:reviewId', replyToServiceReview);

module.exports = router;
