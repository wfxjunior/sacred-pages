import { normalizeDisplayWord } from "./normalize";

// Slugs are public URL identifiers. They must never leak internal ids and must
// match the database CHECK constraint: ^[a-z0-9]+(-[a-z0-9]+)*$

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COMBINING_MARKS = /[̀-ͯ]/g;

export const SLUG_MAX_LENGTH = 80;

/**
 * Builds a URL-safe slug from a human title. Accents fold to ASCII (including
 * N-tilde here - unlike puzzle matching, a URL should stay ASCII-only).
 */
export function slugify(input: string): string {
  return normalizeDisplayWord(input)
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= SLUG_MAX_LENGTH && SLUG_PATTERN.test(slug);
}

/**
 * Appends a numeric suffix until the slug is unique within `taken`.
 * Used when an editor titles a new collection the same as an existing one.
 */
export function uniqueSlug(desired: string, taken: Iterable<string>): string {
  const base = slugify(desired);
  const existing = new Set(taken);
  if (!existing.has(base)) return base;

  for (let suffix = 2; suffix < 1000; suffix++) {
    const candidate = `${base.slice(0, SLUG_MAX_LENGTH - String(suffix).length - 1)}-${suffix}`;
    if (!existing.has(candidate)) return candidate;
  }
  throw new Error(`Unable to derive a unique slug from "${desired}"`);
}
