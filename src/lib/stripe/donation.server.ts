import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getStripe, resolveReturnOrigin } from "./server";

/**
 * A gift is a one-off payment, open to signed-out readers too, so it carries
 * no account state. The amount is validated server side: the client only ever
 * proposes a number of whole dollars.
 */
export const DONATION_PRESETS = [5, 10, 30, 50, 100] as const;
export const DONATION_MIN = 5;
export const DONATION_MAX = 1000;

// The client only names a tier. Every charged amount is derived on the server:
// presets from DONATION_PRESETS, and "custom" from a Stripe price whose
// minimum and maximum are fixed here, with the donor entering the amount on
// Stripe's hosted checkout. No caller-supplied number reaches Stripe.
export const DONATION_TIERS = ["5", "10", "30", "50", "100", "custom"] as const;
export const donationInput = z.object({ tier: z.enum(DONATION_TIERS) });

export type DonationInput = z.infer<typeof donationInput>;

const GIFT_PRODUCT = {
  name: "Gift to Lumena",
  description: "Supports daily Scripture journeys for readers worldwide.",
};
const CUSTOM_LOOKUP_KEY = "lumena_gift_custom_usd_v1";

async function customGiftPriceId(stripe: ReturnType<typeof getStripe>): Promise<string> {
  const found = await stripe.prices.list({ lookup_keys: [CUSTOM_LOOKUP_KEY], active: true, limit: 1 });
  if (found.data[0]) return found.data[0].id;
  const product = await stripe.products.create(GIFT_PRODUCT);
  const price = await stripe.prices.create({
    currency: "usd",
    product: product.id,
    lookup_key: CUSTOM_LOOKUP_KEY,
    custom_unit_amount: {
      enabled: true,
      minimum: DONATION_MIN * 100,
      maximum: DONATION_MAX * 100,
      preset: 2500,
    },
  });
  return price.id;
}

export async function createDonationCheckout({ tier }: DonationInput) {
  const stripe = getStripe();
  const origin = resolveReturnOrigin(getRequest());

  const lineItem =
    tier === "custom"
      ? { quantity: 1, price: await customGiftPriceId(stripe) }
      : {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: DONATION_PRESETS[DONATION_PRESETS.map(String).indexOf(tier)] * 100,
            product_data: GIFT_PRODUCT,
          },
        };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [lineItem],
    success_url: `${origin}/checkout/success?kind=gift&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/donate`,
    billing_address_collection: "auto",
    metadata: { kind: "donation", tier },
  });

  return { url: session.url ?? "/donate" };
}
