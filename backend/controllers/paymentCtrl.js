const asyncHandler = require("express-async-handler");
const { paymentModel, withdrawModel } = require('../models/paymentModel');
const Seller = require('../models/sellerModel');
const AdminSettings = require('../models/adminSettingsModel');

const getStripeSecretKey = async () => {
  const settings = await AdminSettings.findOne();

  if (!settings || !settings.s_key)
    throw new Error('Stripe secret key not found in settings');

  return settings.s_key;
};

const createPaymentIntent = async (amount) => {
  amount = parseInt(amount);

  const stripeSecretKey = await getStripeSecretKey();
  const stripe = require('stripe')(stripeSecretKey);

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

  const stripeSecretKey = await getStripeSecretKey();
  const stripe = require('stripe')(stripeSecretKey);

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.status(200).json({ success: true, paymentIntent });
    } else {
      res.status(500);
      throw new Error('Payment confirmation failed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Payment confirmation failed' });
  }
});


// const getAllPayments = asyncHandler(async (req, res) => {
//   const payments = await Payment.find({})
//     .populate('buyerId', 'username')
//     .populate({
//       path: 'sellerId',
//       populate: {
//         path: 'userId',
//         select: 'username'
//       }
//     })
//   res.status(200).json({ success: true, payments });
// });


// const markPaymentAsPaid = asyncHandler(async (req, res) => {
//   const payment = await Payment.findById(req.body.paymentId);
//   payment.status = "Paid";
//   await payment.save();
//   res.status(200).json({ success: true });
// });


// const getSellerPayments = asyncHandler(async (req, res) => {
//   const { sellerId } = req.params;

//   const seller = await Seller.findById(sellerId);
//   if (!seller) {
//     return res.status(404).json({ success: false, message: 'Seller not found!' });
//   }

//   const payments = await Payment.find({ sellerId, to: "Seller" }).populate('buyerId', 'username').sort({ updatedAt: -1 });
//   res.status(200).json({ success: true, payments });
// });


const getSellerEarnings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  if (!seller)
    return res.status(404).json({ success: false, message: 'Seller not found!' });

  const payment = await paymentModel.findOne({ sellerId });
  if (!payment)
    return res.status(404).json({ success: false, message: 'Payment history not found!' });

  const { history } = payment;

  const totalEarnings = history
    .filter(entry => entry.status === "Earning")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const paidBalance = history
    .filter(entry => entry.status === "Paid")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const requestedForWithdrawal = history
    .filter(entry => entry.status === "Withdraw")
    .reduce((sum, entry) => sum + entry.amount, 0) - paidBalance;

  const availableBalance = totalEarnings - (requestedForWithdrawal + paidBalance);

  const productsSold = seller.productsSold;
  const servicesDone = seller.servicesDone;

  res.status(200).json({
    success: true,
    earnings: {
      totalEarnings,
      paidBalance,
      availableBalance,
      requestedForWithdrawal,
      productsSold,
      servicesDone
    }
  });
});


const getSellerHistory = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  if (!seller)
    return res.status(404).json({ success: false, message: 'Seller not found!' });

  const payment = await paymentModel.findOne({ sellerId });
  if (!payment)
    return res.status(404).json({ success: false, message: 'Payment history not found!' });

  res.status(200).json({
    success: true,
    history: payment?.history?.reverse()
  });
});


const connectStripe = asyncHandler(async (req, res) => {
  const { sellerId } = req.body;
  const stripeSecretKey = await getStripeSecretKey();
  const stripe = require('stripe')(stripeSecretKey);

  try {
    const seller = await Seller.findById(sellerId).populate("userId");
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    // const sellerCountry = seller.country;
    // if (!sellerCountry) return res.status(400).json({ message: 'Seller country is required' });

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: seller?.userId?.email,
    });
    seller.stripeAccountId = account.id;
    await seller.save();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/seller/earnings',
      return_url: 'http://localhost:3000/seller/earnings',
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


const requestForWithdraw = asyncHandler(async (req, res) => {
  const { userId, sellerId, amount } = req.body;

  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    const withdrawalRequest = new withdrawModel({
      userId,
      to: "Seller",
      amount
    });


    let payment = await paymentModel.findOne({ sellerId });

    if (!payment)
      payment = new paymentModel({ sellerId, history: [] });

    payment.history.push({
      amount,
      status: "Withdraw",
      description: "Requested for Withdrawal"
    });

    await payment.save();
    await withdrawalRequest.save();

    res.status(200).json({ success: true, message: 'Withdrawal request submitted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


const getWithdrawalRequests = asyncHandler(async (req, res) => {
  try {
      const { type } = req.query;

      let filter = {};

      switch (type) {
          case 'pendingPayments':
              filter = { to: "Seller", status: "Pending" };
              break;
          case 'completedPayments':
              filter = { to: "Seller", status: "Paid" };
              break;
          case 'pendingRefunds':
              filter = { to: "Buyer", status: "Pending" };
              break;
          case 'completedRefunds':
              filter = { to: "Buyer", status: "Paid" };
              break;
          default:
              return res.status(400).json({ success: false, message: "Invalid type specified" });
      }

      const withdrawalRequests = await withdrawModel.find(filter).populate('userId');

      res.status(200).json({
          success: true,
          withdrawalRequests
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});



const markPaymentAsPaidManually = asyncHandler(async (req, res) => {

  const { requestIds, paidOn, comment } = req.body;

  for (let requestId of requestIds) {

    const request = await withdrawModel.findById(requestId).populate("userId");
    if (!request) return res.status(404).json({ message: `Request ${requestId} not found` });

    let payment = await paymentModel.findOne({ sellerId: request?.userId?.sellerId });
    if (!payment || !payment.history) return res.status(404).json({ message: `Payment not found` });

    payment.history.push({
      amount: request.amount,
      status: "Paid",
      description: "Amount Paid"
    });


    request.status = "Paid";
    request.paymentType = "Manual";
    request.paidOn = paidOn;
    request.comment = comment;

    await request.save();
    await payment.save();
  }

  res.status(200).json({ success: true });
});



const movePaymentToPending = asyncHandler(async (req, res) => {

  const { requestIds, paidOn, comment } = req.body;

  for (let requestId of requestIds) {

    const request = await withdrawModel.findById(requestId).populate("userId");
    if (!request) return res.status(404).json({ message: `Request ${requestId} not found` });

    let payment = await paymentModel.findOne({ sellerId: request?.userId?.sellerId });
    if (!payment || !payment.history) return res.status(404).json({ message: `Payment not found` });

    payment.history.pop();

    request.status = "Pending";
    // request.paymentType = "Manual";
    // request.paidOn = paidOn;
    // request.comment = comment;

    await request.save();
    await payment.save();
  }

  res.status(200).json({ success: true });
});



const releasePayments = asyncHandler(async (req, res) => {
  const { requestIds } = req.body;
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  for (let requestId of requestIds) {
    const request = await withdrawModel.findById(requestId).populate('userId');
    if (!request) return res.status(404).json({ message: `Request ${requestId} not found` });

    const seller = await Seller.findById(request.userId._id);
    if (!seller || !seller.stripeAccountId) {
      return res.status(400).json({ message: `Seller with Stripe account not found for request ${requestId}` });
    }

    await stripe.transfers.create({
      amount: Math.round(request.amount * 100),
      currency: 'usd',
      destination: seller.stripeAccountId,
      transfer_group: `Withdrawal-${requestId}`
    });

    request.status = "Paid";
    request.paymentType = "Auto";
    request.paidOn = Date.now();
    await request.save();
  }

  res.status(200).json({ success: true });
});




module.exports = { movePaymentToPending, markPaymentAsPaidManually, confirmPaymentIntent, createPaymentIntent, getSellerEarnings, connectStripe, requestForWithdraw, getSellerHistory, getWithdrawalRequests };