create table public.collections (
  id uuid primary key default gen_random_uuid(),
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

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  internal_title text not null check (char_length(internal_title) between 1 and 160),
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

create table public.scripture_references (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  source_id uuid not null references public.scripture_sources (id) on delete restrict,
  book_code text not null check (book_code ~ '^[A-Z0-9]{3}$'),
  chapter int not null check (chapter > 0),
  verse_start int not null check (verse_start > 0),
  verse_end int check (verse_end is null or verse_end >= verse_start),
  display_reference text not null,
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

create table public.journey_words (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  position int not null default 0,
  is_required boolean not null default true,
  is_active boolean not null default true,
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
  journey_id uuid not null references public.journeys (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  status public.translation_status not null default 'draft',
  display_value text not null check (char_length(display_value) between 2 and 24),
  normalized_value text not null check (normalized_value ~ '^[A-Z0-9Ñ]{2,24}$'),
  explanation text,
  translator_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_word_id, language_code)
);

create unique index journey_word_translations_unique_normalized_idx
  on public.journey_word_translations (journey_id, language_code, normalized_value);

create index journey_word_translations_lookup_idx
  on public.journey_word_translations (journey_id, language_code, status);

create trigger journey_word_translations_set_updated_at
  before update on public.journey_word_translations
  for each row execute function public.set_updated_at();

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