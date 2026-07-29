-- 0003_content_platform.sql
-- Phase 2: content platform tables, enums, constraints and indexes.
-- RLS policies and triggers live in 0004 so this file stays reviewable.
--
-- Blueprint: docs/product/content-platform-blueprint.md
-- Reversible: drop tables in reverse dependency order, then the enum types.

-- ===========================================================================
-- ENUM TYPES
-- New types (unlike ALTER TYPE ... ADD VALUE) may be created and used in the
-- same transaction, so these are safe here.
-- ===========================================================================

create type public.content_status as enum (
  'draft',
  'in_review',
  'changes_requested',
  'approved',
  'scheduled',
  'published',
  'unpublished',
  'archived'
);

create type public.translation_status as enum (
  'missing',
  'draft',
  'in_review',
  'approved',
  'published'
);

create type public.access_level as enum (
  'free',
  'premium',
  'preview',
  'internal'
);

create type public.difficulty_level as enum (
  'gentle',
  'balanced',
  'challenging',
  'expert'
);

create type public.scripture_strategy as enum (
  'reference_only',
  'public_domain',
  'licensed',
  'api'
);

-- Entity discriminator for cross-entity tables (versions, audit, review logs).
create type public.content_entity_type as enum (
  'collection',
  'journey',
  'collection_translation',
  'journey_translation',
  'journey_word',
  'media_asset',
  'daily_journey'
);

create type public.review_decision as enum (
  'submitted',
  'approved',
  'changes_requested',
  'withdrawn'
);

-- ===========================================================================
-- SHARED TRIGGER FUNCTIONS
-- ===========================================================================

-- Sets created_by/updated_by from the authenticated session. Clients cannot
-- forge attribution because the value never comes from the payload.
create or replace function public.set_audit_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(auth.uid(), new.created_by);
    new.updated_by := coalesce(auth.uid(), new.updated_by);
  elsif tg_op = 'UPDATE' then
    new.created_by := old.created_by;
    new.updated_by := coalesce(auth.uid(), old.updated_by);
  end if;
  return new;
end;
$$;

-- ===========================================================================
-- LANGUAGES
-- ===========================================================================

create table public.languages (
  code text primary key check (code ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  english_name text not null,
  native_name text not null,
  is_active boolean not null default false,
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Exactly one default language.
create unique index languages_single_default_idx
  on public.languages ((is_default)) where is_default;

create trigger languages_set_updated_at
  before update on public.languages
  for each row execute function public.set_updated_at();

insert into public.languages (code, english_name, native_name, is_active, is_default, sort_order)
values
  ('en', 'English', 'English', true, true, 0),
  ('pt', 'Portuguese', 'Português', true, false, 1),
  ('es', 'Spanish', 'Español', true, false, 2);

-- ===========================================================================
-- MEDIA ASSETS
-- Single table for every image (collection cover, journey hero, social card).
-- Deviation from the brief's journey_media/collection_media split: the columns
-- would be identical, and entity linkage is expressed by FKs on the consumers.
-- ===========================================================================

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  byte_size int not null check (byte_size > 0 and byte_size <= 10 * 1024 * 1024),
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  alt_text text check (alt_text is null or char_length(alt_text) <= 300),
  caption text check (caption is null or char_length(caption) <= 500),
  attribution text,
  license_notes text,
  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_assets_archived_idx on public.media_assets (archived_at) where archived_at is null;

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row execute function public.set_updated_at();

create trigger media_assets_set_audit_user
  before insert or update on public.media_assets
  for each row execute function public.set_audit_user();

-- ===========================================================================
-- SCRIPTURE SOURCES
-- Per-translation licensing strategy. No copyrighted text is stored unless a
-- source is explicitly marked licensed with recorded permission.
-- ===========================================================================

create table public.scripture_sources (
  id uuid primary key default gen_random_uuid(),
  translation_code text not null unique,
  translation_name text not null,
  language_code text not null references public.languages (code) on delete restrict,
  strategy public.scripture_strategy not null,
  -- Storing verse text is only permitted for public-domain or licensed sources.
  allows_text_storage boolean not null default false,
  license_notes text not null,
  attribution_required text,
  api_provider text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scripture_sources_storage_requires_permission check (
    allows_text_storage = false
    or strategy in ('public_domain', 'licensed')
  ),
  constraint scripture_sources_api_needs_provider check (
    strategy <> 'api' or api_provider is not null
  )
);

create index scripture_sources_language_idx on public.scripture_sources (language_code) where is_active;

create trigger scripture_sources_set_updated_at
  before update on public.scripture_sources
  for each row execute function public.set_updated_at();

-- Public-domain seeds only. See docs/legal-and-content/01-bible-content-licensing-notes.md.
insert into public.scripture_sources
  (translation_code, translation_name, language_code, strategy, allows_text_storage, license_notes)
values
  ('WEB', 'World English Bible', 'en', 'public_domain', true,
   'Public domain. No permission required for storage or redistribution.'),
  ('ARC1898', 'Almeida Revista e Corrigida (1898)', 'pt', 'public_domain', true,
   'Public domain edition. Verify edition provenance before launch.'),
  ('RVR1909', 'Reina-Valera 1909', 'es', 'public_domain', true,
   'Public domain edition. Verify edition provenance before launch.');

-- ===========================================================================
-- COLLECTIONS
-- ===========================================================================

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  -- Internal name is staff-facing and never rendered publicly.
  internal_name text not null check (char_length(internal_name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  primary_language_code text not null references public.languages (code) on delete restrict,
  status public.content_status not null default 'draft',
  access_level public.access_level not null default 'free',
  topic text,
  audience text,
  difficulty_min public.difficulty_level,
  difficulty_max public.difficulty_level,
  estimated_total_minutes int check (estimated_total_minutes is null or estimated_total_minutes > 0),
  cover_media_id uuid references public.media_assets (id) on delete set null,
  thumbnail_media_id uuid references public.media_assets (id) on delete set null,
  is_featured boolean not null default false,
  featured_from timestamptz,
  featured_until timestamptz,
  display_order int not null default 0,
  published_at timestamptz,
  scheduled_publish_at timestamptz,
  scheduled_unpublish_at timestamptz,
  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_published_needs_date check (
    status <> 'published' or published_at is not null
  ),
  constraint collections_scheduled_needs_date check (
    status <> 'scheduled' or scheduled_publish_at is not null
  ),
  constraint collections_unpublish_after_publish check (
    scheduled_unpublish_at is null
    or scheduled_publish_at is null
    or scheduled_unpublish_at > scheduled_publish_at
  ),
  constraint collections_featured_range check (
    featured_until is null or featured_from is null or featured_until > featured_from
  ),
  constraint collections_archived_state check (
    (archived_at is null) or status = 'archived'
  )
);

create index collections_status_idx on public.collections (status);
create index collections_public_listing_idx
  on public.collections (display_order, published_at desc)
  where status = 'published' and archived_at is null;
create index collections_featured_idx
  on public.collections (featured_from, featured_until)
  where is_featured;

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create trigger collections_set_audit_user
  before insert or update on public.collections
  for each row execute function public.set_audit_user();

create table public.collection_translations (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  status public.translation_status not null default 'draft',
  title text not null check (char_length(title) between 1 and 160),
  short_description text check (short_description is null or char_length(short_description) <= 300),
  full_description text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 180),
  translator_id uuid references auth.users (id) on delete set null,
  reviewer_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, language_code)
);

create index collection_translations_lookup_idx
  on public.collection_translations (language_code, status);

create trigger collection_translations_set_updated_at
  before update on public.collection_translations
  for each row execute function public.set_updated_at();

create trigger collection_translations_set_audit_user
  before insert or update on public.collection_translations
  for each row execute function public.set_audit_user();

-- ===========================================================================
-- JOURNEYS
-- ===========================================================================

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  internal_title text not null check (char_length(internal_title) between 1 and 160),
  -- Globally unique so journeys can be addressed directly (/journeys/:slug).
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  primary_collection_id uuid not null references public.collections (id) on delete restrict,
  position int not null default 0,
  primary_language_code text not null references public.languages (code) on delete restrict,
  status public.content_status not null default 'draft',
  access_level public.access_level not null default 'free',
  difficulty public.difficulty_level not null default 'gentle',
  theme text,
  audience text,
  estimated_minutes int not null default 7 check (estimated_minutes between 1 and 120),
  is_featured boolean not null default false,
  featured_from timestamptz,
  featured_until timestamptz,
  -- Eligible to be selected as a Daily Journey.
  daily_eligible boolean not null default true,
  hero_media_id uuid references public.media_assets (id) on delete set null,
  social_media_id uuid references public.media_assets (id) on delete set null,
  published_at timestamptz,
  scheduled_publish_at timestamptz,
  scheduled_unpublish_at timestamptz,
  archived_at timestamptz,
  current_version int not null default 1 check (current_version >= 1),
  author_id uuid references auth.users (id) on delete set null,
  reviewer_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journeys_published_needs_date check (
    status <> 'published' or published_at is not null
  ),
  constraint journeys_scheduled_needs_date check (
    status <> 'scheduled' or scheduled_publish_at is not null
  ),
  constraint journeys_unpublish_after_publish check (
    scheduled_unpublish_at is null
    or scheduled_publish_at is null
    or scheduled_unpublish_at > scheduled_publish_at
  ),
  constraint journeys_featured_range check (
    featured_until is null or featured_from is null or featured_until > featured_from
  ),
  constraint journeys_archived_state check (
    (archived_at is null) or status = 'archived'
  )
);

create index journeys_collection_idx on public.journeys (primary_collection_id, position);
create index journeys_status_idx on public.journeys (status);
create index journeys_public_listing_idx
  on public.journeys (published_at desc)
  where status = 'published' and archived_at is null;
create index journeys_daily_pool_idx
  on public.journeys (daily_eligible)
  where status = 'published' and daily_eligible;
create index journeys_author_idx on public.journeys (author_id);

create trigger journeys_set_updated_at
  before update on public.journeys
  for each row execute function public.set_updated_at();

create trigger journeys_set_audit_user
  before insert or update on public.journeys
  for each row execute function public.set_audit_user();

-- Devotional, reflection prompt and prayer are strictly 1:1 per journey per
-- language, so they live here rather than in three separate tables. Documented
-- in docs/product/content-platform-blueprint.md §"Model deviations".
create table public.journey_translations (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  status public.translation_status not null default 'draft',
  public_title text not null check (char_length(public_title) between 1 and 160),
  subtitle text,
  devotional_body text,
  reflection_prompt text,
  prayer_body text,
  completion_message text,
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 180),
  translator_id uuid references auth.users (id) on delete set null,
  reviewer_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_id, language_code)
);

create index journey_translations_lookup_idx
  on public.journey_translations (language_code, status);

create trigger journey_translations_set_updated_at
  before update on public.journey_translations
  for each row execute function public.set_updated_at();

create trigger journey_translations_set_audit_user
  before insert or update on public.journey_translations
  for each row execute function public.set_audit_user();

-- ===========================================================================
-- SCRIPTURE REFERENCES
-- ===========================================================================

create table public.scripture_references (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  source_id uuid not null references public.scripture_sources (id) on delete restrict,
  book_code text not null check (book_code ~ '^[A-Z0-9]{3}$'),
  chapter int not null check (chapter > 0),
  verse_start int not null check (verse_start > 0),
  verse_end int check (verse_end is null or verse_end >= verse_start),
  -- Human-readable form shown in the UI, e.g. "Philippians 4:6-7".
  display_reference text not null,
  -- Populated only when the source permits storage (enforced by trigger in 0004).
  stored_text text,
  external_content_id text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scripture_references_journey_idx on public.scripture_references (journey_id, position);

create trigger scripture_references_set_updated_at
  before update on public.scripture_references
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- JOURNEY WORDS
-- journey_words holds the language-neutral slot; the display and matching
-- forms are per-language in journey_word_translations.
-- ===========================================================================

create table public.journey_words (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  position int not null default 0,
  is_required boolean not null default true,
  is_active boolean not null default true,
  -- Difficulty band in which this word may appear.
  min_difficulty public.difficulty_level not null default 'gentle',
  max_difficulty public.difficulty_level,
  scripture_reference_id uuid references public.scripture_references (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_id, position) deferrable initially deferred
);

create index journey_words_journey_idx on public.journey_words (journey_id, position) where is_active;

create trigger journey_words_set_updated_at
  before update on public.journey_words
  for each row execute function public.set_updated_at();

create table public.journey_word_translations (
  id uuid primary key default gen_random_uuid(),
  journey_word_id uuid not null references public.journey_words (id) on delete cascade,
  -- Denormalized from journey_words so duplicate normalized forms can be
  -- rejected per journey per language by a unique index. Kept in sync by a
  -- trigger in 0004; never written by clients.
  journey_id uuid not null references public.journeys (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  status public.translation_status not null default 'draft',
  -- Accents preserved, shown to the reader: "ORAÇÃO".
  display_value text not null check (char_length(display_value) between 2 and 24),
  -- Accent-folded uppercase used for puzzle matching: "ORACAO".
  normalized_value text not null check (normalized_value ~ '^[A-Z0-9Ñ]{2,24}$'),
  explanation text,
  translator_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_word_id, language_code)
);

-- Rejects two words in the same journey+language that normalize identically.
create unique index journey_word_translations_unique_normalized_idx
  on public.journey_word_translations (journey_id, language_code, normalized_value);

create index journey_word_translations_lookup_idx
  on public.journey_word_translations (journey_id, language_code, status);

create trigger journey_word_translations_set_updated_at
  before update on public.journey_word_translations
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- PUZZLE SETTINGS (content-side configuration for the Phase 3 engine)
-- Stable, well-known settings are real columns rather than JSONB.
-- ===========================================================================

create table public.journey_puzzle_settings (
  journey_id uuid primary key references public.journeys (id) on delete cascade,
  default_difficulty public.difficulty_level not null default 'gentle',
  allowed_difficulties public.difficulty_level[] not null default
    array['gentle', 'balanced', 'challenging', 'expert']::public.difficulty_level[],
  min_grid_size int not null default 10 check (min_grid_size between 6 and 20),
  max_grid_size int not null default 16 check (max_grid_size between 6 and 20),
  target_word_count int not null default 8 check (target_word_count between 3 and 24),
  allowed_directions text[] not null default array['E', 'S', 'SE', 'NE'],
  allow_reversed boolean not null default false,
  allow_diagonal boolean not null default true,
  overlap_preference text not null default 'allowed'
    check (overlap_preference in ('none', 'allowed', 'encouraged')),
  seed_strategy text not null default 'per_journey'
    check (seed_strategy in ('per_journey', 'per_user', 'per_day')),
  hints_enabled boolean not null default true,
  full_solution_enabled boolean not null default true,
  filler_strategy text not null default 'weighted'
    check (filler_strategy in ('uniform', 'weighted', 'word_letters')),
  custom_alphabet text check (custom_alphabet is null or char_length(custom_alphabet) between 10 and 64),
  estimated_completion_seconds int check (
    estimated_completion_seconds is null or estimated_completion_seconds > 0
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint puzzle_grid_range check (max_grid_size >= min_grid_size),
  constraint puzzle_directions_valid check (
    allowed_directions <@ array['E', 'W', 'N', 'S', 'NE', 'NW', 'SE', 'SW']::text[]
    and array_length(allowed_directions, 1) >= 1
  ),
  constraint puzzle_default_difficulty_allowed check (
    default_difficulty = any (allowed_difficulties)
  )
);

create trigger journey_puzzle_settings_set_updated_at
  before update on public.journey_puzzle_settings
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- TAGS
-- ===========================================================================

create table public.content_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind text not null default 'topic' check (kind in ('topic', 'audience', 'season', 'book')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger content_tags_set_updated_at
  before update on public.content_tags
  for each row execute function public.set_updated_at();

create table public.content_tag_translations (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.content_tags (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tag_id, language_code)
);

create trigger content_tag_translations_set_updated_at
  before update on public.content_tag_translations
  for each row execute function public.set_updated_at();

create table public.journey_tags (
  journey_id uuid not null references public.journeys (id) on delete cascade,
  tag_id uuid not null references public.content_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (journey_id, tag_id)
);

create index journey_tags_tag_idx on public.journey_tags (tag_id);

create table public.collection_tags (
  collection_id uuid not null references public.collections (id) on delete cascade,
  tag_id uuid not null references public.content_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, tag_id)
);

create index collection_tags_tag_idx on public.collection_tags (tag_id);

-- ===========================================================================
-- DAILY JOURNEY
-- One assignment per (date, language). A "global" daily journey is expressed
-- as the same journey_id across locales; lookups fall back to the default
-- language when a locale has no row.
-- ===========================================================================

create table public.daily_journeys (
  journey_date date not null,
  language_code text not null references public.languages (code) on delete restrict,
  journey_id uuid not null references public.journeys (id) on delete restrict,
  is_fallback boolean not null default false,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (journey_date, language_code)
);

create index daily_journeys_journey_idx on public.daily_journeys (journey_id);
create index daily_journeys_upcoming_idx on public.daily_journeys (journey_date desc);

create trigger daily_journeys_set_updated_at
  before update on public.daily_journeys
  for each row execute function public.set_updated_at();

create trigger daily_journeys_set_audit_user
  before insert or update on public.daily_journeys
  for each row execute function public.set_audit_user();

-- ===========================================================================
-- VERSIONING, REVIEW, STATUS HISTORY, AUDIT
-- ===========================================================================

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  version int not null check (version >= 1),
  -- Heterogeneous entity payloads: JSONB is the correct choice for snapshots.
  snapshot jsonb not null,
  change_summary text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);

create index content_versions_entity_idx
  on public.content_versions (entity_type, entity_id, version desc);

create table public.content_review_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  decision public.review_decision not null,
  notes text,
  previous_status public.content_status,
  new_status public.content_status,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index content_review_logs_entity_idx
  on public.content_review_logs (entity_type, entity_id, created_at desc);

create table public.content_status_history (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  previous_status public.content_status,
  new_status public.content_status not null,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index content_status_history_entity_idx
  on public.content_status_history (entity_type, entity_id, created_at desc);

create table public.content_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type public.content_entity_type not null,
  entity_id uuid,
  summary text,
  previous_status public.content_status,
  new_status public.content_status,
  -- Metadata only: never full content bodies, never secrets.
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index content_audit_logs_entity_idx
  on public.content_audit_logs (entity_type, entity_id, created_at desc);
create index content_audit_logs_actor_idx on public.content_audit_logs (actor_id, created_at desc);

-- ===========================================================================
-- PREVIEW TOKENS
-- Opaque, revocable, expiring links to unpublished content.
-- ===========================================================================

create table public.content_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique check (char_length(token) >= 32),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index content_preview_tokens_entity_idx
  on public.content_preview_tokens (entity_type, entity_id);
