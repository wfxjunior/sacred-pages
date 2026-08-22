import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getStripe, resolveReturnOrigin } from "./server";

/**
 * A gift is a one-off payment, open to signed-out readers too, so it carries
 * no account state. The amount is validated server side: the client only ever
 * proposes a number of whole dollars.
 */
export const donationInput = z.object({
  amount: z.number().int().min(5).max(5000),
});

export type DonationInput = z.infer<typeof donationInput>;

export async function createDonationCheckout({ amount }: DonationInput) {
  const stripe = getStripe();
  const origin = resolveReturnOrigin(getRequest());

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount * 100,
          product_data: {
            name: "Gift to Lumena",
            description: "Supports daily Scripture journeys for readers worldwide.",
          },
        },
      },
    ],
    success_url: `${origin}/checkout/success?kind=gift&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/donate`,
    billing_address_collection: "auto",
    metadata: { kind: "donation" },
  });

  return { url: session.url ?? "/donate" };
}
