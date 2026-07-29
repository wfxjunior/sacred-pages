import { z } from "zod";

// Browser-safe environment. Server-only secrets (SUPABASE_SERVICE_ROLE_KEY,
// STRIPE_*) must never be read here — they belong to *.server.ts modules.

const optionalKey = z
  .string()
  .min(20)
  .optional()
  .or(z.literal("").transform(() => undefined));

const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  // Two names for the same public key. Lovable's integration writes
  // VITE_SUPABASE_PUBLISHABLE_KEY (new-style `sb_publishable_…` keys);
  // VITE_SUPABASE_ANON_KEY is the classic name and stays supported so an
  // existing local .env keeps working. Both are browser-safe — access is
  // enforced by RLS, not by key secrecy.
  VITE_SUPABASE_PUBLISHABLE_KEY: optionalKey,
  VITE_SUPABASE_ANON_KEY: optionalKey,
  VITE_SITE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment configuration: ${issues.join("; ")}`);
    this.name = "EnvValidationError";
  }
}

export function parseClientEnv(raw: Record<string, unknown>): ClientEnv {
  const result = clientEnvSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new EnvValidationError(issues);
  }
  return result.data;
}

let cached: ClientEnv | undefined;

export function getClientEnv(): ClientEnv {
  if (!cached) {
    cached = parseClientEnv(import.meta.env as unknown as Record<string, unknown>);
  }
  return cached;
}

/** The public key under whichever name is configured. */
export function getPublicSupabaseKey(env: ClientEnv = getClientEnv()): string | undefined {
  return env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY;
}

// The app must run with zero configuration (Lovable preview / local visual work):
// Supabase-backed features switch on only when a URL and a public key are present.
export function isSupabaseConfigured(env: ClientEnv = getClientEnv()): boolean {
  return Boolean(env.VITE_SUPABASE_URL && getPublicSupabaseKey(env));
}
