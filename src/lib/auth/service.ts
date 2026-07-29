import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { logger } from "@/lib/logger";

// The ONLY module allowed to call supabase.auth.*. UI code talks to this
// service and receives typed results — switching providers or adding OAuth
// must never require UI changes.

export type AuthResult =
  { ok: true; user: User; session: Session | null } | { ok: false; error: AppError };

export type AuthActionResult = { ok: true } | { ok: false; error: AppError };

function mapAuthError(message: string, status?: number): AppError {
  const normalized = message.toLowerCase();
  let code: AppErrorCode = "auth/unknown";
  if (normalized.includes("invalid login credentials")) code = "auth/invalid-credentials";
  else if (normalized.includes("email not confirmed")) code = "auth/email-not-confirmed";
  else if (normalized.includes("already registered") || normalized.includes("already exists"))
    code = "auth/user-already-exists";
  else if (normalized.includes("password")) code = "auth/weak-password";
  else if (status === 429 || normalized.includes("rate limit")) code = "auth/rate-limited";
  return new AppError(code, message);
}

function notConfigured(): AppError {
  return new AppError("config/not-configured", "Authentication backend is not configured.");
}

export const authService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  async signUp(input: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<AuthResult> {
    if (!isSupabaseConfigured()) return { ok: false, error: notConfigured() };
    const { data, error } = await getSupabaseClient().auth.signUp({
      email: input.email,
      password: input.password,
      options: { data: input.displayName ? { display_name: input.displayName } : undefined },
    });
    if (error) return { ok: false, error: mapAuthError(error.message, error.status) };
    if (!data.user) return { ok: false, error: new AppError("auth/unknown", "No user returned.") };
    return { ok: true, user: data.user, session: data.session };
  },

  async signIn(input: { email: string; password: string }): Promise<AuthResult> {
    if (!isSupabaseConfigured()) return { ok: false, error: notConfigured() };
    const { data, error } = await getSupabaseClient().auth.signInWithPassword(input);
    if (error) return { ok: false, error: mapAuthError(error.message, error.status) };
    return { ok: true, user: data.user, session: data.session };
  },

  async signOut(): Promise<AuthActionResult> {
    if (!isSupabaseConfigured()) return { ok: false, error: notConfigured() };
    const { error } = await getSupabaseClient().auth.signOut({ scope: "global" });
    if (error) return { ok: false, error: mapAuthError(error.message, error.status) };
    return { ok: true };
  },

  async requestPasswordReset(email: string, redirectTo?: string): Promise<AuthActionResult> {
    if (!isSupabaseConfigured()) return { ok: false, error: notConfigured() };
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      // Do not reveal account existence — log server-side signal, return ok.
      logger.warn("password reset request failed", { status: error.status });
    }
    return { ok: true };
  },

  async getSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    const { data } = await getSupabaseClient().auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    if (!isSupabaseConfigured()) return () => {};
    const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return () => data.subscription.unsubscribe();
  },
};
