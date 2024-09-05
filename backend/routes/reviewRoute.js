const express = require('express');
const router = express.Router();

const { getProductOrderReview, addNewProductReview, replyToProductReview } = require("../controllers/reviewCtrl");

router.get('/order/product/:orderId', getProductOrderReview);
// router.get('/order/service/:orderId', getServiceOrderReview);
// router.get('/product/:productId', getSellerReviews);
// router.get('/seller/:sellerId', getProductReviews);
// router.get('/service/:serviceId', getServiceReviews);

router.post('/product/new', addNewProductReview);
// router.post('/service/new', addNewServiceReview);

router.put('/product/reply/:reviewId', replyToProductReview);
// router.put('/service/reply/:reviewId', replyToServiceReview);

module.exports = router;
