// FILE: src/lib/stripe.ts

import Stripe from "stripe";

function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();

  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return key;
}

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey());
  }

  return stripeInstance;
}

export const STRIPE_CURRENCY = "usd";
export const CHECKOUT_SESSION_MINUTES = 30;
export const CHECKOUT_LOCK_MINUTES = CHECKOUT_SESSION_MINUTES;
