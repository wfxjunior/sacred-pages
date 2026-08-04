import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripe } from "./server";

const checkoutInput = z.object({
  cycle: z.enum(["monthly", "yearly"]),
  returnPath: z.string().optional(),
});

async function ensurePremiumPrice(cycle: "monthly" | "yearly") {
  const stripe = getStripe();
  const isYearly = cycle === "yearly";
  const productName = "Lumena Premium";
  const productDescription = "Unlimited collections, Journey Together, and deeper study.";
  const unitAmount = isYearly ? 6000 : 600; // $60/year or $6/month
  const lookupKey = isYearly ? "premium-yearly" : "premium-monthly";

  const existingPrices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });

  if (existingPrices.data[0]) {
    return existingPrices.data[0].id;
  }

  const product =
    (await stripe.products.list({ active: true, limit: 100 })).data.find(
      (p) => p.name === productName,
    ) ??
    (await stripe.products.create({
      name: productName,
      description: productDescription,
      metadata: { plan: "premium" },
    }));

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: "usd",
    recurring: isYearly
      ? { interval: "year", interval_count: 1 }
      : { interval: "month", interval_count: 1 },
    lookup_key: lookupKey,
    metadata: { cycle },
  });

  return price.id;
}

async function getOrCreateCustomer(
  supabase: ReturnType<typeof getStripe> extends never ? never : any,
  userId: string,
  email: string,
  displayName: string | null,
) {
  const { data: existing } = await supabase
    .from("customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    name: displayName ?? undefined,
    metadata: { user_id: userId },
  });

  await supabase.from("customers").insert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });

  return customer.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => checkoutInput.parse(input))
  .handler(async ({ data, context }) => {
    const stripe = getStripe();
    const userId = context.userId;
    const email = context.claims.email as string | undefined;
    if (!email) throw new Error("User email is required");

    const { supabase } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    const priceId = await ensurePremiumPrice(data.cycle);
    const customerId = await getOrCreateCustomer(
      supabase,
      userId,
      email,
      (profile?.display_name as string | null) ?? null,
    );

    const origin = process.env["VITE_SITE_URL"] ?? "http://localhost:8080";
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}${data.returnPath ?? "/pricing"}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: { user_id: userId },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return { url: session.url ?? "/pricing" };
  });

