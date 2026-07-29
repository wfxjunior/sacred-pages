import { beforeEach, describe, expect, it, vi } from "vitest";

// The auth service must refuse cleanly (typed error, no throw) when Supabase
// is not configured — the zero-config prototype environment depends on it.

vi.mock("@/lib/supabase/client", () => ({
  isSupabaseConfigured: vi.fn(() => false),
  getSupabaseClient: vi.fn(() => {
    throw new Error("must not be called when unconfigured");
  }),
}));

import { authService } from "./service";
import { authErrorKey } from "./error-keys";
import { AppError } from "@/lib/errors";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authService (unconfigured environment)", () => {
  it("reports isConfigured() = false", () => {
    expect(authService.isConfigured()).toBe(false);
  });

  it("signUp returns a typed config error without touching the client", async () => {
    const result = await authService.signUp({ email: "a@b.co", password: "12345678" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.code).toBe("config/not-configured");
    }
  });

  it("signIn returns a typed config error", async () => {
    const result = await authService.signIn({ email: "a@b.co", password: "12345678" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("config/not-configured");
  });

  it("signOut returns a typed config error", async () => {
    const result = await authService.signOut();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("config/not-configured");
  });

  it("getSession resolves null instead of throwing", async () => {
    await expect(authService.getSession()).resolves.toBeNull();
  });

  it("onAuthStateChange returns a no-op unsubscribe", () => {
    const unsubscribe = authService.onAuthStateChange(() => {});
    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
  });
});

describe("authErrorKey", () => {
  it("maps every auth error code to an i18n key", () => {
    expect(authErrorKey("auth/invalid-credentials")).toBe("auth.errorInvalidCredentials");
    expect(authErrorKey("auth/email-not-confirmed")).toBe("auth.errorEmailNotConfirmed");
    expect(authErrorKey("auth/user-already-exists")).toBe("auth.errorUserExists");
    expect(authErrorKey("auth/weak-password")).toBe("auth.errorWeakPassword");
    expect(authErrorKey("auth/rate-limited")).toBe("auth.errorRateLimited");
    expect(authErrorKey("unknown")).toBe("auth.errorUnknown");
    expect(authErrorKey("config/not-configured")).toBe("auth.errorUnknown");
  });
});
