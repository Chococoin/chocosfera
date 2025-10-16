import Stripe from 'stripe';
import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

// Client-side Stripe instance
let stripePromise: Promise<StripeClient | null>;

export function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
