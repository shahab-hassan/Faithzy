import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Checkout from '../pages/buyer/Checkout';
import Upgrade from '../pages/seller/Upgrade';

const PUBLIC_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

const stripePromise = loadStripe(PUBLIC_KEY);

const CheckoutStripeContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  )
}
const UpgradeStripeContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <Upgrade />
    </Elements>
  )
}

export {CheckoutStripeContainer, UpgradeStripeContainer};
