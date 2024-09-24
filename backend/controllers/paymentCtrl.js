const asyncHandler = require("express-async-handler");
const { paymentModel, withdrawModel } = require('../models/paymentModel');
const Seller = require('../models/sellerModel');
const AdminSettings = require('../models/adminSettingsModel');
const {productOrderModel, serviceOrderModel} = require('../models/orderModel');

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


const getSellerEarnings = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  if (!seller)
    return res.status(404).json({ success: false, message: 'Seller not found!' });

  let totalEarnings = 0, paidBalance = 0, requestedForWithdrawal = 0, availableBalance = 0, productsSold = 0, servicesDone = 0;

  let payment = await paymentModel.findOne({ sellerId });

  if(payment) {
    const { history } = payment;

    totalEarnings = history
      .filter(entry => entry.status === "Earning")
      .reduce((sum, entry) => sum + entry.amount, 0);

    paidBalance = history
      .filter(entry => entry.status === "Paid")
      .reduce((sum, entry) => sum + entry.amount, 0);

    requestedForWithdrawal = history
      .filter(entry => entry.status === "Withdraw")
      .reduce((sum, entry) => sum + entry.amount, 0) - paidBalance;

    availableBalance = totalEarnings - (requestedForWithdrawal + paidBalance);

    productsSold = seller.productsSold;
    servicesDone = seller.servicesDone;
  }

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

  let payment = await paymentModel.findOne({ sellerId });
  if (!payment) {
    payment = new paymentModel({ sellerId, history: [] });
    payment.save();
  }

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

    const withdrawalRequests = await withdrawModel.find(filter).populate('userId').sort({ updatedAt: -1 });

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

  const { requestIds, paidOn, comment, isRelease } = req.body;

  for (let requestId of requestIds) {
    
    const request = await withdrawModel.findById(requestId).populate("userId");
    if (!request) return res.status(404).json({ message: `Request ${requestId} not found` });

    request.status = "Paid";
    request.paymentType = "Manual";
    request.paidOn = paidOn;
    request.comment = comment;

    if(isRelease){
      let payment = await paymentModel.findOne({ sellerId: request?.userId?.sellerId });
      if (!payment || !payment.history) return res.status(404).json({ message: `Payment not found` });
  
      payment.history.push({
        amount: request.amount,
        status: "Paid",
        description: "Amount Paid"
      });
      await payment.save();
    }

    await request.save();
  }

  res.status(200).json({ success: true });
});



const movePaymentToPending = asyncHandler(async (req, res) => {
  const { requestIds, isRefund } = req.body;

  for (let requestId of requestIds) {

    const request = await withdrawModel.findById(requestId).populate("userId");
    if (!request) return res.status(404).json({ message: `Request ${requestId} not found` });

    if(!isRefund){
      let payment = await paymentModel.findOne({ sellerId: request?.userId?.sellerId });
      if (!payment || !payment.history) return res.status(404).json({ message: `Payment not found` });
  
      const historyIndex = payment.history.findIndex(entry =>
        entry.amount === request.amount &&
        entry.status === "Paid" &&
        entry.description === "Amount Paid"
      );
  
      if (historyIndex > -1) {
        payment.history.splice(historyIndex, 1);
      }
      await payment.save();
    }


    request.status = "Pending";

    await request.save();
  }

  res.status(200).json({ success: true });
});


const releasePayments = asyncHandler(async (req, res) => {
  const { requestIds } = req.body;
  const stripeSecretKey = await getStripeSecretKey();
  const stripe = require('stripe')(stripeSecretKey);

  for (let requestId of requestIds) {
    const request = await withdrawModel.findById(requestId).populate('userId');
    if (!request || request?.to === "Buyer") return res.status(404).json({ message: `Request ${requestId} not found` });

    const seller = await Seller.findById(request.userId?.sellerId);
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

    let payment = await paymentModel.findOne({ sellerId: request?.userId?.sellerId });
    if (!payment || !payment.history) return res.status(404).json({ message: `Payment not found` });

    payment.history.push({
      amount: request.amount,
      status: "Paid",
      description: "Amount Paid"
    });

    await request.save();
    await payment.save();
  }

  res.status(200).json({ success: true });
});


const refundPayments = asyncHandler(async (req, res) => {
  
  const { requestIds } = req.body;
  const stripeSecretKey = await getStripeSecretKey();
  const stripe = require('stripe')(stripeSecretKey);

  for (let requestId of requestIds) {
    const request = await withdrawModel.findById(requestId).populate('userId');
    if (!request || request?.to === "Seller") return res.status(404).json({ message: `Request ${requestId} not found` });

    if(request.itemType === "Product"){

      const order = await productOrderModel.findById(request.orderId);
      if (!order || !order?.paymentIntentId)
        return res.status(400).json({ message: `Order not found for request ${requestId}` });

      await stripe.refunds.create({
        amount: Math.round(request.amount * 100),
        payment_intent: order.paymentIntentId
      });
      
    }
    else if(request.itemType === "Service"){

      const order = await serviceOrderModel.findById(request.orderId);
      if (!order || !order?.paymentIntentId)
        return res.status(400).json({ message: `Order not found for request ${requestId}` });
  
      await stripe.refunds.create({
        amount: Math.round(request.amount * 100),
        payment_intent: order.paymentIntentId
      });
      
    }

    request.status = "Paid";
    request.paymentType = "Auto";
    request.paidOn = Date.now();

    await request.save();
  }

  res.status(200).json({ success: true });
});




module.exports = { refundPayments, releasePayments, movePaymentToPending, markPaymentAsPaidManually, confirmPaymentIntent, createPaymentIntent, getSellerEarnings, connectStripe, requestForWithdraw, getSellerHistory, getWithdrawalRequests };