const express = require('express');
const { confirmPaymentIntent, getSellerPayments, getSellerEarnings, getAllPayments, markPaymentAsPaid } = require('../controllers/paymentCtrl');
const { authorized, authorizeAdmin } = require('../middlewares/authorization');
const router = express.Router();

router.post('/confirm', authorized, confirmPaymentIntent);

router.get('/seller/:sellerId', authorized, getSellerPayments);

router.get('/all', authorizeAdmin, getAllPayments);

router.put('/markPaid', authorizeAdmin, markPaymentAsPaid);

router.get('/seller/:sellerId/earnings', authorized, getSellerEarnings);

module.exports = router;
