const express = require('express');
const { releasePayoneerPayments, updateActivePaymentMethod, addPayoneer, refundPayments, releasePayments, movePaymentToPending, markPaymentAsPaidManually, confirmPaymentIntent, getSellerHistory, getWithdrawalRequests, getSellerEarnings, connectStripe, requestForWithdraw } = require('../controllers/paymentCtrl');
const { authorized, authorizeAdmin, combinedAuthorization } = require('../middlewares/authorization');
const router = express.Router();

router.post('/confirm', authorized, confirmPaymentIntent);

router.get('/seller/:sellerId', combinedAuthorization, getSellerHistory);

router.get('/seller/:sellerId/earnings', combinedAuthorization, getSellerEarnings);

router.post('/seller/connect-stripe', authorized, connectStripe);

router.post('/seller/add-payoneer', authorized, addPayoneer);

router.post('/seller/update-active-payment-method', authorized, updateActivePaymentMethod);

router.post('/seller/request-withdrawal', authorized, requestForWithdraw);

router.get('/withdrawal-requests', authorizeAdmin, getWithdrawalRequests);

router.put('/mark-paid', authorizeAdmin, markPaymentAsPaidManually);

router.put('/move-to-pending', authorizeAdmin, movePaymentToPending);

router.put('/release-payment', authorizeAdmin, releasePayments);

router.put('/release-payment/payoneer', authorizeAdmin, releasePayoneerPayments);

router.put('/refund-payment', authorizeAdmin, refundPayments);

module.exports = router;
