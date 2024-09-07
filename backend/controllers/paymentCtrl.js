const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const Payment = require('../models/paymentModel');
const Seller = require('../models/sellerModel');

const createPaymentIntent = async (amount) => {
  amount = parseInt(amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
    return paymentIntent;
  }
  catch (e) {
    console.log(e);
    throw new Error('Stripe payment intent creation failed');
  }
};

const confirmPaymentIntent = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

  if (paymentIntent.status === 'succeeded')
    res.status(200).json({ success: true, paymentIntent });
  else {
    res.status(500);
    throw new Error('Payment confirmation failed');
  }
});


const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate('buyerId', 'username')
    .populate({
      path: 'sellerId',
      populate: {
        path: 'userId',
        select: 'username'
      }
    })
  res.status(200).json({ success: true, payments });
});

const markPaymentAsPaid = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.body.paymentId);
  payment.status = "Paid";
  await payment.save();
  res.status(200).json({ success: true });
});


const getSellerPayments = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  if (!seller) {
    return res.status(404).json({ success: false, message: 'Seller not found!' });
  }

  const payments = await Payment.find({ sellerId, to: "Seller" }).populate('buyerId', 'username').sort({ updatedAt: -1 });
  res.status(200).json({ success: true, payments });
});


const getSellerEarnings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  if (!seller)
    return res.status(404).json({ success: false, message: 'Seller not found!' });

  const payments = await Payment.find({ sellerId, status: "Paid", to: "Seller" });

  const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = await Payment.find({ sellerId, status: "Pending", to: "Seller" });
  const pendingBalance = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const currentMonth = new Date().getMonth();
  const earningsInCurrentMonth = payments
    .filter(payment => new Date(payment.createdAt).getMonth() === currentMonth)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const productsSold = seller.productsSold;
  const servicesDone = seller.servicesDone;

  res.status(200).json({
    success: true,
    totalEarnings,
    pendingBalance,
    earningsInCurrentMonth,
    productsSold,
    servicesDone
  });
});


module.exports = { confirmPaymentIntent, createPaymentIntent, getSellerPayments, getSellerEarnings, getAllPayments, markPaymentAsPaid };