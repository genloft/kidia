import Stripe from 'stripe';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;



export const stripe = new Stripe(stripeSecretKey || 'dummy-key', {
    apiVersion: '2023-10-16', // Use latest stable
});
