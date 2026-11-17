import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertBillingAdmin, isLumenaPrice, payingPeople, type Subscriber } from "./subscription-report";

export const getSubscriptionReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ cursor: z.string().max(255).optional() }).parse(input ?? {}))
  .handler(async ({ context, data }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { uid: context.userId, r: "super_admin" });
    assertBillingAdmin(!error && admin === true);
    const { getStripe } = await import("@/lib/stripe/server");
    const stripe = getStripe();
    const productIds = new Set<string>();
    for await (const product of stripe.products.list({ limit: 100 })) {
      if (product.name === "Lumena Premium") productIds.add(product.id);
    }
    const subscribers: Subscriber[] = [];
    for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.customer", "data.latest_invoice"] })) {
      const belongsToLumena = sub.items.data.some(({ price }) =>
        isLumenaPrice(price.lookup_key, typeof price.product === "string" ? price.product : price.product.id, productIds));
      if (!belongsToLumena) continue;
      const customer = typeof sub.customer === "string" || sub.customer.deleted ? null : sub.customer;
      const item = sub.items.data[0];
      const invoice = typeof sub.latest_invoice === "object" ? sub.latest_invoice : null;
      subscribers.push({
        id: sub.id, customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        name: customer?.name ?? null, email: customer?.email ?? null, status: sub.status,
        amount: sub.items.data.reduce((sum, i) => sum + (i.price.unit_amount ?? 0) * (i.quantity ?? 1), 0),
        currency: sub.currency, interval: item?.price.recurring?.interval ?? "—",
        renewsAt: sub.status === "canceled" ? null : item?.current_period_end ?? null, cancelling: sub.cancel_at_period_end,
        paid: invoice?.status === "paid" && invoice.amount_paid > 0,
      });
    }
    const page = await stripe.invoices.list({ status: "paid", limit: 50, ...(data.cursor ? { starting_after: data.cursor } : {}) });
    const subscriptionIds = new Set(subscribers.map((s) => s.id));
    const invoices = page.data.filter((i) => {
      const sub = i.parent?.subscription_details?.subscription;
      return sub && subscriptionIds.has(typeof sub === "string" ? sub : sub.id);
    }).map((i) => ({
      id: i.id, number: i.number, email: i.customer_email, name: i.customer_name,
      amount: i.amount_paid, currency: i.currency, paidAt: i.status_transitions.paid_at ?? i.created,
      reason: i.billing_reason, url: i.hosted_invoice_url,
    }));
    return {
      payingPeople: payingPeople(subscribers), active: subscribers.filter((s) => s.status === "active").length,
      cancelling: subscribers.filter((s) => s.status === "active" && s.cancelling).length,
      pastDue: subscribers.filter((s) => s.status === "past_due" || s.status === "unpaid").length,
      subscribers, invoices, nextCursor: page.has_more ? page.data.at(-1)?.id ?? null : null,
      live: page.data[0]?.livemode ?? null, checkedAt: new Date().toISOString(),
    };
  });