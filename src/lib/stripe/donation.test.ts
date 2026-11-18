import { describe, expect, it } from "vitest";
import { donationInput } from "./donation.server";

describe("donation tier", () => {
  it("accepts a preset tier", () => expect(donationInput.safeParse({ tier: "10" }).success).toBe(true));
  it("accepts the custom tier", () => expect(donationInput.safeParse({ tier: "custom" }).success).toBe(true));
  it("rejects unknown tiers", () => expect(donationInput.safeParse({ tier: "7" }).success).toBe(false));
  it("rejects a raw amount", () => expect(donationInput.safeParse({ amount: 1000 }).success).toBe(false));
});
