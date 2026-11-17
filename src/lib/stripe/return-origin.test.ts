import { describe, expect, it } from "vitest";
import { trustedReturnOrigin } from "./return-origin";
import { safeReturnPath } from "./billing.schemas";

describe("Stripe return destinations", () => {
  it("blocks an external origin for subscription checkout", () => {
    expect(trustedReturnOrigin(new Request("https://lumenadaily.com", { headers: { origin: "https://attacker.example" } }))).toBe("https://lumenadaily.com");
  });
  it("blocks external origin and referer for donation checkout", () => {
    expect(trustedReturnOrigin(new Request("https://attacker.example", { headers: { origin: "https://attacker.example", referer: "https://attacker.example" } }))).toBe("https://lumenadaily.com");
  });
  it("blocks external configured origins for the billing portal", () => {
    expect(trustedReturnOrigin(undefined, "https://attacker.example")).toBe("https://lumenadaily.com");
  });
  it("allows the exact live domain and local preview", () => {
    expect(trustedReturnOrigin(new Request("https://www.lumenadaily.com/settings"))).toBe("https://www.lumenadaily.com");
    expect(trustedReturnOrigin(new Request("http://localhost:8080/donate"))).toBe("http://localhost:8080");
  });
  it("rejects lookalike domains and credentials", () => {
    expect(trustedReturnOrigin(undefined, "https://lumenadaily.com.attacker.example")).toBe("https://lumenadaily.com");
    expect(trustedReturnOrigin(undefined, "https://attacker@www.lumenadaily.com")).toBe("https://lumenadaily.com");
  });
  it("rejects external return paths", () => {
    for (const path of ["https://attacker.example", "//attacker.example", "/\\attacker.example", "/\n/attacker.example"]) {
      expect(safeReturnPath(path, "/settings")).toBe("/settings");
    }
    expect(safeReturnPath("/pricing?cycle=yearly", "/settings")).toBe("/pricing?cycle=yearly");
  });
});