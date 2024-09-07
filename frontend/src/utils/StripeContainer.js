import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Checkout from '../pages/buyer/Checkout';
import Upgrade from '../pages/seller/Upgrade';

const PUBLIC_KEY = "pk_test_51PwLbfP5UwIgdJNUfISniYzV0Ej8bN8flTU3PWIIsfn8hb4iG1qT9ogbWLqgRV8Pg0nELMcadmmfCzcYTA1l47pB00zDOuozR1";

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
