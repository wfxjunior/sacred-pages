import Stripe from "stripe";

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

/**
 * The origin Stripe should send the reader back to. VITE_SITE_URL wins when
 * set; otherwise the incoming request's own origin — a localhost fallback in
 * production would strand readers after checkout.
 */
export function resolveReturnOrigin(request: Request | undefined): string {
  const configured = process.env["VITE_SITE_URL"];
  if (configured) return configured;
  const fromRequest = request?.headers.get("origin");
  if (fromRequest) return fromRequest;
  const referer = request?.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      /* fall through */
    }
  }
  return "http://localhost:8080";
}

