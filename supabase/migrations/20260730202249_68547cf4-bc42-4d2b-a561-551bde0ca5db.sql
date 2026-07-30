-- 0001_identity_foundation.sql
-- Phase 1: profiles, roles, user preferences + RLS.

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
create type public.app_role as enum (
  'free_user',
  'premium_user',
  'content_editor',
  'content_reviewer',
  'support_admin',
  'super_admin'
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index user_roles_user_id_idx on public.user_roles (user_id);

alter table public.user_roles enable row level security;

create or replace function public.has_role(uid uuid, r public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid and role = r
  );
$$;

create policy "users read own roles"
  on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'));

create policy "super admins grant roles"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "super admins revoke roles"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  avatar_url text,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- User preferences
-- ---------------------------------------------------------------------------
create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'pt', 'es')),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  selection_color text not null default 'gold'
    check (selection_color in ('gold', 'blue', 'sage', 'purple', 'amber', 'teal')),
  preferred_difficulty text not null default 'gentle'
    check (preferred_difficulty in ('gentle', 'balanced', 'challenging', 'expert')),
  font_size text not null default 'medium' check (font_size in ('small', 'medium', 'large')),
  sound_enabled boolean not null default true,
  email_reminders boolean not null default false,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

create policy "users read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "users insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "users update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Signup trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));

  insert into public.user_roles (user_id, role)
  values (new.id, 'free_user');

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();