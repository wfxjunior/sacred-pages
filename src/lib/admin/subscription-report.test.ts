import { describe, expect, it } from "vitest";
import { assertBillingAdmin, isLumenaPrice, payingPeople, type Subscriber } from "./subscription-report";
const base: Subscriber = { id: "sub1", customerId: "person1", name: null, email: null, status: "active", amount: 600, currency: "usd", interval: "month", renewsAt: null, cancelling: false, paid: true };
describe("subscription administration", () => {
  it("counts people paying once even with two subscriptions", () => {
    expect(payingPeople([base, { ...base, id: "sub2" }, { ...base, id: "sub3", customerId: "person2" }])).toBe(2);
  });
  it("excludes trials, cancelled, unpaid and free subscriptions", () => {
    expect(payingPeople([{ ...base, status: "trialing" }, { ...base, status: "canceled" }, { ...base, paid: false }, { ...base, amount: 0 }])).toBe(0);
  });
  it("blocks non-administrators", () => expect(() => assertBillingAdmin(false)).toThrow("Forbidden"));
  it("allows administrators", () => expect(() => assertBillingAdmin(true)).not.toThrow());
  it("includes only Lumena prices, never another Stripe product", () => {
    const ids = new Set(["lumena_product"]);
    expect(isLumenaPrice(null, "other_product", ids)).toBe(false);
    expect(isLumenaPrice(null, "lumena_product", ids)).toBe(true);
    expect(isLumenaPrice("premium-monthly", "legacy_product", ids)).toBe(true);
    expect(isLumenaPrice("premium-yearly", "legacy_product", ids)).toBe(true);
  });
});