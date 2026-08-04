import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getStripe } from "./server";
import { portalInput } from "./billing.schemas";

export const getSubscriptionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("is_premium", {
      _user_id: context.userId,
    });

    if (error) {
      console.error("is_premium rpc error", error);
      return { isPremium: false };
    }

    return { isPremium: !!data };
  });

/**
 * A one-time link into Stripe's hosted billing portal.
 *
 * Everything about a subscription that isn't "start it" — payment method,
 * invoices, cancellation — belongs to Stripe's own screens, so the app never
 * handles card data or has to mirror billing state.
 */
export const createBillingPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    portalInput.parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: customer } = await context.supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (!customer?.stripe_customer_id) {
      return { url: null as string | null, reason: "no_customer" as const };
    }

    const stripe = getStripe();
    const origin = process.env["VITE_SITE_URL"] ?? "http://localhost:8080";
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${origin}${data.returnPath ?? "/settings"}`,
    });

    return { url: session.url, reason: null };
  });
