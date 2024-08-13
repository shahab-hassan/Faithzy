import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Checkout from '../pages/buyer/Checkout';

const PUBLIC_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";

const stripePromise = loadStripe(PUBLIC_KEY);

const StripeContainer = () => {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  )
}

export default StripeContainer;
