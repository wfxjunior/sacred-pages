-- 0009_profile_from_oauth_metadata.sql
-- Corrective migration. Non-destructive: replaces one function body and
-- backfills profile rows that are missing a display name. No row is deleted,
-- and no non-null value is overwritten.
--
-- FINDING: handle_new_user() reads only `raw_user_meta_data ->> 'display_name'`.
-- Google — currently the ONLY enabled sign-in provider on this project
-- (auth settings report email:false, google:true) — never sets that key. It
-- sets `full_name`, `name` and `picture`. Every account therefore landed with
-- display_name NULL and avatar_url NULL, so the whole product would greet its
-- readers as nobody.
--
-- Verified before the fix, against PostgreSQL 17:
--   insert into auth.users (..., raw_user_meta_data)
--     values (..., '{"full_name":"Ana Ribeiro","picture":"…"}')
--   -> profiles.display_name = NULL, profiles.avatar_url = NULL
--
-- FIX: read the keys the providers actually send, in preference order, and
-- fall back to the local part of the email so a profile is never nameless.
--
-- The ON CONFLICT clauses are defensive rather than a fix for an observed
-- failure: any exception raised inside this trigger aborts the whole signup
-- and surfaces to the reader as "Database error saving new user". The inserts
-- are all keyed on new.id and cascade-cleaned with the user, so a conflict
-- should be impossible — these make it harmless if that assumption ever breaks.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  resolved_name text;
  resolved_avatar text;
begin
  -- Preference order covers Google (full_name / name / picture), generic OIDC
  -- and the original email+password path (display_name), then degrades to the
  -- part of the email before the @.
  resolved_name := nullif(trim(coalesce(
    meta ->> 'display_name',
    meta ->> 'full_name',
    meta ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1)
  )), '');

  resolved_avatar := nullif(trim(coalesce(
    meta ->> 'avatar_url',
    meta ->> 'picture'
  )), '');

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, resolved_name, resolved_avatar)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'free_user')
  on conflict do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Backfill: only rows that have no name at all. A reader who already set a
-- display name keeps it — coalesce never overwrites a non-null value.
update public.profiles p
   set display_name = nullif(trim(coalesce(
         u.raw_user_meta_data ->> 'display_name',
         u.raw_user_meta_data ->> 'full_name',
         u.raw_user_meta_data ->> 'name',
         split_part(coalesce(u.email, ''), '@', 1)
       )), '')
  from auth.users u
 where u.id = p.id
   and p.display_name is null;

update public.profiles p
   set avatar_url = nullif(trim(coalesce(
         u.raw_user_meta_data ->> 'avatar_url',
         u.raw_user_meta_data ->> 'picture'
       )), '')
  from auth.users u
 where u.id = p.id
   and p.avatar_url is null;
