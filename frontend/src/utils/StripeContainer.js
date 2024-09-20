import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import Checkout from '../pages/buyer/Checkout';
import Upgrade from '../pages/seller/Upgrade';


const CheckoutStripeContainer = () => {

  const [stripePromise, setStripePromise] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/settings/admin/stripe_keys',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          const stripePublishableKey = response.data.stripePublishableKey;
          const stripe = loadStripe(stripePublishableKey);
          setStripePromise(stripe);
        }
      } catch (error) {
        console.error("Error fetching Stripe keys:", error);
      }
    };

    fetchStripeKey();
  }, [token]);

  if (!stripePromise) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
};

const UpgradeStripeContainer = () => {

  const [stripePromise, setStripePromise] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStripeKey = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/settings/admin/stripe_keys',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          const stripePublishableKey = response.data.stripePublishableKey;
          const stripe = loadStripe(stripePublishableKey);
          setStripePromise(stripe);
        }
      } catch (error) {
        console.error("Error fetching Stripe keys:", error);
      }
    };

    fetchStripeKey();
  }, [token]);

  // if (!stripePromise) return <div>Loading...</div>;

  return (
    <Elements stripe={stripePromise}>
      <Upgrade />
    </Elements>
  );
};

export { CheckoutStripeContainer, UpgradeStripeContainer };
