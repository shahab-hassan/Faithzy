const express = require('express');
const { markPaymentAsPaidManually, confirmPaymentIntent, getSellerHistory, getWithdrawalRequests, getSellerEarnings, connectStripe, requestForWithdraw } = require('../controllers/paymentCtrl');
const { authorized, authorizeAdmin } = require('../middlewares/authorization');
const router = express.Router();

router.post('/confirm', authorized, confirmPaymentIntent);

// router.get('/seller/:sellerId', authorized, getSellerPayments);

// router.get('/all', authorizeAdmin, getAllPayments);

// router.put('/markPaid', authorizeAdmin, markPaymentAsPaid);

router.get('/seller/:sellerId', authorized, getSellerHistory);

router.get('/seller/:sellerId/earnings', authorized, getSellerEarnings);

router.post('/seller/connect-stripe', authorized, connectStripe);

router.post('/seller/request-withdrawal', authorized, requestForWithdraw);

router.get('/withdrawal-requests', authorizeAdmin, getWithdrawalRequests);

router.get('/mark-paid', authorizeAdmin, markPaymentAsPaidManually);

module.exports = router;
