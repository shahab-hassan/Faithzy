const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");

const createPaymentIntent = async (amount) => {
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

module.exports = { confirmPaymentIntent, createPaymentIntent };
