import Stripe from "stripe";
import { trustedReturnOrigin } from "./return-origin";

let cached: Stripe | undefined;

/**
 * The worker runtime has no real Node http stack: Stripe's default client goes
 * through a stub and adds seconds to every call. The fetch client is native
 * here, so checkout opens promptly. The instance is cached per isolate.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  cached = new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 1,
    timeout: 20000,
  });
  return cached;
}


export function getStripePublishableKey(): string {
  return process.env["STRIPE_PUBLISHABLE_KEY"] ?? "";
}

/** Checkout, gifts and billing share the same exact-origin allowlist. */
export function resolveReturnOrigin(request: Request | undefined): string {
  return trustedReturnOrigin(request, process.env["VITE_SITE_URL"]);
}

