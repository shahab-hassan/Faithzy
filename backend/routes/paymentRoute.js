const express = require('express');
const { confirmPaymentIntent } = require('../controllers/paymentCtrl');
const { authorized } = require('../middlewares/authorization');
const router = express.Router();

router.post('/confirm', authorized, confirmPaymentIntent);

module.exports = router;
