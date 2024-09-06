const express = require('express');
const router = express.Router();
const {authorized} = require("../middlewares/authorization")

const { getProductOrderReview, getServiceOrderReview, addNewProductReview, addNewServiceReview, replyToProductReview, replyToServiceReview, getProductReviews, getSellerReviews, getServiceReviews } = require("../controllers/reviewCtrl");

// router.get('/order/product/:subOrderId', authorized, checkProductOrderReviewExist);
// router.get('/order/service/:subOrderId', authorized, checkServiceOrderReviewExist);

router.get('/order/product/:sellerId/:subOrderId', authorized, getProductOrderReview);
router.get('/order/service/:sellerId/:orderId', authorized, getServiceOrderReview);

router.get('/product/:productId', getProductReviews);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/service/:serviceId', getServiceReviews);

router.post('/product/new', authorized, addNewProductReview);
router.post('/service/new', authorized, addNewServiceReview);

router.put('/review/product/reply/:subOrderId', authorized, replyToProductReview);
router.put('/review/service/reply/:orderId', authorized, replyToServiceReview);

module.exports = router;