import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!webhookSecret) {
          console.error("STRIPE_WEBHOOK_SECRET is not configured");
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const stripe = getStripe();
        const payload = await request.text();
        const signature = request.headers.get("stripe-signature") ?? "";

        let event: Stripe.Event;
        try {
          // Async variant: the Worker runtime only exposes WebCrypto (SubtleCrypto),
          // which cannot be used by the synchronous constructEvent.
          event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Invalid signature";
          console.error("Stripe webhook signature verification failed", message);
          return new Response(`Invalid signature: ${message}`, { status: 400 });
        }

        const supabaseAdmin = createClient<Database>(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
          { auth: { persistSession: false } },
        );

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              const userId = session.metadata?.user_id ?? session.client_reference_id;
              if (!userId) {
                console.warn("checkout.session.completed without user_id", session.id);
                break;
              }
              if (session.subscription) {
                const subscription = await stripe.subscriptions.retrieve(
                  session.subscription as string,
                );
                await syncSubscription(supabaseAdmin, userId, subscription);
              }
              break;
            }
            case "customer.subscription.created":
            case "customer.subscription.updated": {
              const subscription = event.data.object as Stripe.Subscription;
              const userId = await resolveUserIdFromCustomer(
                supabaseAdmin,
                subscription.customer as string,
              );
              if (!userId) {
                console.warn("Subscription event without mapped user", subscription.id);
                break;
              }
              await syncSubscription(supabaseAdmin, userId, subscription);
              break;
            }
            case "customer.subscription.deleted": {
              const subscription = event.data.object as Stripe.Subscription;
              const userId = await resolveUserIdFromCustomer(
                supabaseAdmin,
                subscription.customer as string,
              );
              if (!userId) break;
              await syncSubscription(supabaseAdmin, userId, subscription);
              break;
            }
            default:
              console.log("Unhandled Stripe event", event.type);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Webhook handler error";
          console.error("Stripe webhook handler error", message);
          return new Response(`Handler error: ${message}`, { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

async function resolveUserIdFromCustomer(
  supabase: ReturnType<typeof createClient<Database>>,
  stripeCustomerId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();
  return (data?.user_id as string) ?? null;
}

async function syncSubscription(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string,
  subscription: Stripe.Subscription,
) {
  const price = subscription.items.data[0]?.price;
  const item = subscription.items.data[0] as unknown as
    | { current_period_start?: number; current_period_end?: number }
    | undefined;
  // Stripe moved the period fields onto the subscription item; older payloads
  // still carry them on the subscription itself. Read both through one narrow
  // view rather than `any`.
  const legacy = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  };
  const periodStart = legacy.current_period_start ?? item?.current_period_start ?? null;
  const periodEnd = legacy.current_period_end ?? item?.current_period_end ?? null;
  const upsert = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    price_id: price?.id ?? null,
    product_id: price?.product ? (price.product as string) : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),

  };

  const { error } = await supabase.from("subscriptions").upsert(upsert, {
    onConflict: "stripe_subscription_id",
  });
  if (error) {
    throw new Error(`Failed to sync subscription: ${error.message}`);
  }
}

