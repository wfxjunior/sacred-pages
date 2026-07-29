import type { Locale } from "@/lib/i18n";

// Single source of truth for displayed prices until Stripe becomes authoritative.
// TODO(phase-5): replace with plans/prices resolved from Stripe price IDs — no
// amount may be authored client-side once billing is live.

export const PREMIUM_MONTHLY_USD = 6;
export const PREMIUM_YEARLY_USD = 60;

export const PRICING_DISPLAY: Record<Locale, { free: string; premium: string }> = {
  en: { free: "$0", premium: `$${PREMIUM_MONTHLY_USD}` },
  pt: { free: "R$0", premium: "R$29" },
  es: { free: "$0", premium: `$${PREMIUM_MONTHLY_USD}` },
};
