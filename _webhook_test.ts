import Stripe from "stripe";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {auth:{persistSession:false}});
// cleanup from previous run
try { await stripe.subscriptions.cancel("sub_1U0n7RFuQCgxxa3vXWaSWWfQ"); } catch {}
try { await stripe.customers.del("cus_V0okA9YXXaf7EJ"); } catch {}

const { data: users } = await sb.auth.admin.listUsers({ page:1, perPage:200 });
const user = users.users.find(u => u.email === "juniorxavierusa@gmail.com")!;
const customer = await stripe.customers.create({ email: user.email!, metadata: { user_id: user.id } });
const price = await stripe.prices.create({ unit_amount: 900, currency: "usd", recurring: { interval: "month" }, product_data: { name: "Lumena Webhook Test" } });
const sub = await stripe.subscriptions.create({ customer: customer.id, items: [{ price: price.id }], trial_period_days: 7 });
console.log("stripe:", customer.id, sub.id, sub.status);
await sb.from("customers").upsert({ user_id: user.id, stripe_customer_id: customer.id }, { onConflict: "user_id" });

const event = { id: "evt_test_webhook", object: "event", api_version: "2026-07-29.dahlia", created: Math.floor(Date.now()/1000), livemode: false, pending_webhooks: 0, request: null, type: "customer.subscription.updated", data: { object: sub } };
const payload = JSON.stringify(event);
const ts = Math.floor(Date.now()/1000);
const sig = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!).update(`${ts}.${payload}`).digest("hex");
const res = await fetch("http://localhost:8080/api/public/stripe-webhook", { method: "POST", headers: { "stripe-signature": `t=${ts},v1=${sig}`, "content-type": "application/json" }, body: payload });
console.log("webhook:", res.status, await res.text());
const { data: row } = await sb.from("subscriptions").select("status,price_id,current_period_end,cancel_at_period_end").eq("stripe_subscription_id", sub.id).maybeSingle();
console.log("db row:", row);

await stripe.subscriptions.cancel(sub.id);
await sb.from("subscriptions").delete().eq("stripe_subscription_id", sub.id);
await sb.from("customers").delete().eq("stripe_customer_id", customer.id);
await stripe.customers.del(customer.id);
console.log("cleanup done");
