import type {
  AccessLevel,
  ContentEntityType,
  ContentStatus,
  DifficultyLevel,
  FillerStrategy,
  OverlapPreference,
  ReviewDecision,
  ScriptureStrategy,
  SeedStrategy,
  TranslationStatus,
} from "./types";

// Row shapes returned by Supabase for the content tables. Hand-written rather
// than generated so the repository layer is typed before a Supabase project
// exists. Once `supabase gen types typescript` can run against the real
// project, replace these with the generated Database types.
// TODO(phase-5): swap for generated types once a Supabase project is linked.
// Pinned to phase 5 because Stripe work cannot start without a live project.

export type LanguageRow = {
  code: string;
  english_name: string;
  native_name: string;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
};

export type MediaAssetRow = {
  id: string;
  storage_path: string;
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  attribution: string | null;
  license_notes: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ScriptureSourceRow = {
  id: string;
  translation_code: string;
  translation_name: string;
  language_code: string;
  strategy: ScriptureStrategy;
  allows_text_storage: boolean;
  license_notes: string;
  attribution_required: string | null;
  api_provider: string | null;
  is_active: boolean;
};

export type CollectionRow = {
  id: string;
  internal_name: string;
  slug: string;
  primary_language_code: string;
  status: ContentStatus;
  access_level: AccessLevel;
  topic: string | null;
  audience: string | null;
  difficulty_min: DifficultyLevel | null;
  difficulty_max: DifficultyLevel | null;
  estimated_total_minutes: number | null;
  cover_media_id: string | null;
  thumbnail_media_id: string | null;
  is_featured: boolean;
  featured_from: string | null;
  featured_until: string | null;
  display_order: number;
  published_at: string | null;
  scheduled_publish_at: string | null;
  scheduled_unpublish_at: string | null;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CollectionTranslationRow = {
  id: string;
  collection_id: string;
  language_code: string;
  status: TranslationStatus;
  title: string;
  short_description: string | null;
  full_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  translator_id: string | null;
  reviewer_id: string | null;
  updated_at: string;
};

export type JourneyRow = {
  id: string;
  internal_title: string;
  slug: string;
  primary_collection_id: string;
  position: number;
  primary_language_code: string;
  status: ContentStatus;
  access_level: AccessLevel;
  difficulty: DifficultyLevel;
  theme: string | null;
  audience: string | null;
  estimated_minutes: number;
  is_featured: boolean;
  featured_from: string | null;
  featured_until: string | null;
  daily_eligible: boolean;
  hero_media_id: string | null;
  social_media_id: string | null;
  published_at: string | null;
  scheduled_publish_at: string | null;
  scheduled_unpublish_at: string | null;
  archived_at: string | null;
  current_version: number;
  author_id: string | null;
  reviewer_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JourneyTranslationRow = {
  id: string;
  journey_id: string;
  language_code: string;
  status: TranslationStatus;
  public_title: string;
  subtitle: string | null;
  devotional_body: string | null;
  reflection_prompt: string | null;
  prayer_body: string | null;
  completion_message: string | null;
  seo_title: string | null;
  seo_description: string | null;
  translator_id: string | null;
  reviewer_id: string | null;
  updated_at: string;
};

export type ScriptureReferenceRow = {
  id: string;
  journey_id: string;
  source_id: string;
  book_code: string;
  chapter: number;
  verse_start: number;
  verse_end: number | null;
  display_reference: string;
  stored_text: string | null;
  external_content_id: string | null;
  position: number;
};

export type JourneyWordRow = {
  id: string;
  journey_id: string;
  position: number;
  is_required: boolean;
  is_active: boolean;
  min_difficulty: DifficultyLevel;
  max_difficulty: DifficultyLevel | null;
  scripture_reference_id: string | null;
};

export type JourneyWordTranslationRow = {
  id: string;
  journey_word_id: string;
  journey_id: string;
  language_code: string;
  status: TranslationStatus;
  display_value: string;
  normalized_value: string;
  explanation: string | null;
};

// PuzzleSettingsRow was superseded by PuzzleTemplateRow in @/lib/puzzle/rows
// (migration 0005 replaced journey_puzzle_settings with puzzle_templates).

export type DailyJourneyRow = {
  journey_date: string;
  language_code: string;
  journey_id: string;
  is_fallback: boolean;
  notes: string | null;
};

export type ContentVersionRow = {
  id: string;
  entity_type: ContentEntityType;
  entity_id: string;
  version: number;
  snapshot: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
};

export type ContentReviewLogRow = {
  id: string;
  entity_type: ContentEntityType;
  entity_id: string;
  decision: ReviewDecision;
  notes: string | null;
  previous_status: ContentStatus | null;
  new_status: ContentStatus | null;
  actor_id: string | null;
  created_at: string;
};

export type ContentAuditLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: ContentEntityType;
  entity_id: string | null;
  summary: string | null;
  previous_status: ContentStatus | null;
  new_status: ContentStatus | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ContentTagRow = {
  id: string;
  slug: string;
  kind: string;
  is_active: boolean;
};
