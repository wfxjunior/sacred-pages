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

create table public.scripture_sources (
  id uuid primary key default gen_random_uuid(),
  translation_code text not null unique,
  translation_name text not null,
  language_code text not null references public.languages (code) on delete restrict,
  strategy public.scripture_strategy not null,
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

insert into public.scripture_sources
  (translation_code, translation_name, language_code, strategy, allows_text_storage, license_notes)
values
  ('WEB', 'World English Bible', 'en', 'public_domain', true,
   'Public domain. No permission required for storage or redistribution.'),
  ('ARC1898', 'Almeida Revista e Corrigida (1898)', 'pt', 'public_domain', true,
   'Public domain edition. Verify edition provenance before launch.'),
  ('RVR1909', 'Reina-Valera 1909', 'es', 'public_domain', true,
   'Public domain edition. Verify edition provenance before launch.');

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