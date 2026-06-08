import Stripe from 'stripe';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Payments will not work.');
}

export const stripe = new Stripe(stripeSecretKey || 'sk_test_dummy', {
    apiVersion: '2023-10-16', // Use latest stable
});
