const express = require('express');
const { movePaymentToPending, markPaymentAsPaidManually, confirmPaymentIntent, getSellerHistory, getWithdrawalRequests, getSellerEarnings, connectStripe, requestForWithdraw } = require('../controllers/paymentCtrl');
const { authorized, authorizeAdmin, combinedAuthorization } = require('../middlewares/authorization');
const router = express.Router();

router.post('/confirm', authorized, confirmPaymentIntent);

// router.get('/seller/:sellerId', authorized, getSellerPayments);

// router.get('/all', authorizeAdmin, getAllPayments);

// router.put('/markPaid', authorizeAdmin, markPaymentAsPaid);

router.get('/seller/:sellerId', combinedAuthorization, getSellerHistory);

router.get('/seller/:sellerId/earnings', combinedAuthorization, getSellerEarnings);

router.post('/seller/connect-stripe', authorized, connectStripe);

router.post('/seller/request-withdrawal', authorized, requestForWithdraw);

router.get('/withdrawal-requests', authorizeAdmin, getWithdrawalRequests);

router.put('/mark-paid', authorizeAdmin, markPaymentAsPaidManually);

router.put('/move-to-pending', authorizeAdmin, movePaymentToPending);

module.exports = router;
