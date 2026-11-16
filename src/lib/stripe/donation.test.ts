import { describe, expect, it } from "vitest";
import { donationInput } from "./donation.server";

describe("donation amount", () => {
  it("accepts the minimum of $5", () => expect(donationInput.safeParse({ amount: 5 }).success).toBe(true));
  it("rejects below $5", () => expect(donationInput.safeParse({ amount: 4 }).success).toBe(false));
  it("rejects above $1000", () => expect(donationInput.safeParse({ amount: 1001 }).success).toBe(false));
  it("rejects fractional dollars", () => expect(donationInput.safeParse({ amount: 10.5 }).success).toBe(false));
});
