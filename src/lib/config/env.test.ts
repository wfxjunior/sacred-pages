import { describe, expect, it } from "vitest";
import { EnvValidationError, isSupabaseConfigured, parseClientEnv } from "./env";

describe("parseClientEnv", () => {
  it("accepts an empty environment (zero-config prototype mode)", () => {
    const env = parseClientEnv({});
    expect(env.VITE_SUPABASE_URL).toBeUndefined();
    expect(env.VITE_SUPABASE_ANON_KEY).toBeUndefined();
  });

  it("treats empty strings as absent", () => {
    const env = parseClientEnv({
      VITE_SUPABASE_URL: "",
      VITE_SUPABASE_ANON_KEY: "",
      VITE_SITE_URL: "",
    });
    expect(env.VITE_SUPABASE_URL).toBeUndefined();
    expect(env.VITE_SUPABASE_ANON_KEY).toBeUndefined();
    expect(env.VITE_SITE_URL).toBeUndefined();
  });

  it("accepts a valid configuration", () => {
    const env = parseClientEnv({
      VITE_SUPABASE_URL: "https://example.supabase.co",
      VITE_SUPABASE_ANON_KEY: "a".repeat(40),
      VITE_SITE_URL: "https://example.com",
    });
    expect(env.VITE_SUPABASE_URL).toBe("https://example.supabase.co");
    expect(env.VITE_SITE_URL).toBe("https://example.com");
  });

  it("rejects a malformed Supabase URL", () => {
    expect(() => parseClientEnv({ VITE_SUPABASE_URL: "not-a-url" })).toThrow(EnvValidationError);
  });

  it("rejects an implausibly short anon key", () => {
    expect(() => parseClientEnv({ VITE_SUPABASE_ANON_KEY: "short" })).toThrow(EnvValidationError);
  });

  it("ignores unrelated variables", () => {
    const env = parseClientEnv({ VITE_SOMETHING_ELSE: "x", NODE_ENV: "test" });
    expect(env.VITE_SUPABASE_URL).toBeUndefined();
  });
});

describe("isSupabaseConfigured", () => {
  it("is false when either value is missing", () => {
    expect(isSupabaseConfigured(parseClientEnv({}))).toBe(false);
    expect(
      isSupabaseConfigured(parseClientEnv({ VITE_SUPABASE_URL: "https://example.supabase.co" })),
    ).toBe(false);
    expect(isSupabaseConfigured(parseClientEnv({ VITE_SUPABASE_ANON_KEY: "a".repeat(40) }))).toBe(
      false,
    );
  });

  it("is true when both values are present", () => {
    expect(
      isSupabaseConfigured(
        parseClientEnv({
          VITE_SUPABASE_URL: "https://example.supabase.co",
          VITE_SUPABASE_ANON_KEY: "a".repeat(40),
        }),
      ),
    ).toBe(true);
  });
});
