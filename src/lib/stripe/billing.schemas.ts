import { z } from "zod";

/**
 * A return destination is only ever an internal path of this app.
 *
 * Stripe redirects the reader back to `${origin}${returnPath}`, so anything
 * that can change the effective host — a protocol, a protocol-relative `//`,
 * userinfo (`@`), or a backslash some parsers treat as a slash — must never
 * reach that concatenation. Anything unexpected falls back to a known page
 * rather than failing the payment flow.
 */
export function safeReturnPath(path: string | undefined, fallback: string): string {
  if (!path) return fallback;
  const candidate = path.trim();
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  if (/[\\@]/.test(candidate)) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(candidate)) return fallback;
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(candidate)) return fallback;
  if (candidate.length > 512) return fallback;
  return candidate;
}

export const portalInput = z.object({
  returnPath: z.string().optional(),
});
