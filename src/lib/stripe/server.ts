import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });
}

export function getStripePublishableKey(): string {
  return process.env["STRIPE_PUBLISHABLE_KEY"] ?? "";
}

