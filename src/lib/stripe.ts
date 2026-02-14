import Stripe from 'stripe';

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(stripeSecretKey || 'dummy-key', {
    apiVersion: '2023-10-16', // Use latest stable
});
