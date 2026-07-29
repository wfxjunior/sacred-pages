-- Supabase-compatible shim for validating migrations against a plain PostgreSQL
-- server. This file is NEVER applied to a Supabase project — Supabase provides
-- all of it. It exists so migrations 0001-0006 can be executed and proven to
-- work before they touch the live database.
--
-- The migrations reference exactly two Supabase-provided things:
--   auth.users   (47 references)
--   auth.uid()   (160 references)
-- Nothing else — no extensions, no storage schema, no role grants — so the
-- shim stays this small.

create schema if not exists auth;

-- Minimal stand-in for Supabase's auth.users. Only the columns the migrations
-- actually reference are modelled: everything keys off id, and handle_new_user()
-- reads email and raw_user_meta_data.
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- auth.uid(), reproduced faithfully.
--
-- This is Supabase's own definition: it prefers the flattened
-- `request.jwt.claim.sub` GUC and falls back to parsing `request.jwt.claims`.
-- Reproducing BOTH paths matters — the test suites set `request.jwt.claims`
-- the way PostgREST does, and a shim that only read the flattened form would
-- silently return NULL and make every owner-only policy look like it denies
-- everything. That would be a false pass.
--
-- `true` as the second argument to current_setting suppresses the error when
-- the GUC is unset, which is what makes the anonymous case return NULL rather
-- than throw.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid;
$$;

-- Supabase's client roles.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

-- Grants, mirroring Supabase's defaults.
--
-- Without these, a test running as `authenticated` would fail with "permission
-- denied for table" instead of exercising the RLS policy — an error that looks
-- like a security pass but proves nothing. Default privileges cover the tables
-- the migrations are about to create.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

grant select on auth.users to authenticated, service_role;
