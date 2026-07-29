// Shared content-platform types. These mirror the database enums created in
// supabase/migrations/0003_content_platform.sql — keep both in sync.

export const CONTENT_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "scheduled",
  "published",
  "unpublished",
  "archived",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const TRANSLATION_STATUSES = [
  "missing",
  "draft",
  "in_review",
  "approved",
  "published",
] as const;
export type TranslationStatus = (typeof TRANSLATION_STATUSES)[number];

export const ACCESS_LEVELS = ["free", "premium", "preview", "internal"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

export const DIFFICULTY_LEVELS = ["gentle", "balanced", "challenging", "expert"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const SCRIPTURE_STRATEGIES = ["reference_only", "public_domain", "licensed", "api"] as const;
export type ScriptureStrategy = (typeof SCRIPTURE_STRATEGIES)[number];

export const CONTENT_ENTITY_TYPES = [
  "collection",
  "journey",
  "collection_translation",
  "journey_translation",
  "journey_word",
  "media_asset",
  "daily_journey",
] as const;
export type ContentEntityType = (typeof CONTENT_ENTITY_TYPES)[number];

export const REVIEW_DECISIONS = [
  "submitted",
  "approved",
  "changes_requested",
  "withdrawn",
] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const PUZZLE_DIRECTIONS = ["E", "W", "N", "S", "NE", "NW", "SE", "SW"] as const;
export type PuzzleDirection = (typeof PUZZLE_DIRECTIONS)[number];

export const OVERLAP_PREFERENCES = ["none", "allowed", "encouraged"] as const;
export type OverlapPreference = (typeof OVERLAP_PREFERENCES)[number];

export const SEED_STRATEGIES = ["per_journey", "per_user", "per_day"] as const;
export type SeedStrategy = (typeof SEED_STRATEGIES)[number];

export const FILLER_STRATEGIES = ["uniform", "weighted", "word_letters"] as const;
export type FillerStrategy = (typeof FILLER_STRATEGIES)[number];

/** Content statuses that are visible to the public frontend. */
export const PUBLIC_CONTENT_STATUSES: readonly ContentStatus[] = ["published"];

/** Access levels that may appear in public listings (premium shows metadata only). */
export const PUBLICLY_LISTED_ACCESS_LEVELS: readonly AccessLevel[] = ["free", "premium"];
