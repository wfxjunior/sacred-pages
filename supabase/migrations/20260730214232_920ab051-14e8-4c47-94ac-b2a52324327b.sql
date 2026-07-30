-- ============================================================
-- 1. Function hardening
-- ============================================================

-- fixed search_path on the remaining mutable function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- helper: content staff check (security definer, reads user_roles)
create or replace function public.is_content_staff(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid
      and role in ('content_editor','content_reviewer','publication_admin','super_admin')
  );
$$;

-- trigger-only functions must not be callable through the Data API
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_audit_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- role checks: signed-in users only (required by RLS policy evaluation)
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

revoke all on function public.is_content_staff(uuid) from public, anon;
grant execute on function public.is_content_staff(uuid) to authenticated;

-- ============================================================
-- 2. Reference data: languages, scripture_sources
-- ============================================================

grant select on public.languages to anon, authenticated;
grant insert, update, delete on public.languages to authenticated;
grant all on public.languages to service_role;
alter table public.languages enable row level security;

create policy "languages readable by everyone"
  on public.languages for select
  to anon, authenticated
  using (true);

create policy "staff manage languages"
  on public.languages for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

grant select on public.scripture_sources to anon, authenticated;
grant insert, update, delete on public.scripture_sources to authenticated;
grant all on public.scripture_sources to service_role;
alter table public.scripture_sources enable row level security;

create policy "active scripture sources readable"
  on public.scripture_sources for select
  to anon, authenticated
  using (is_active);

create policy "staff manage scripture sources"
  on public.scripture_sources for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 3. Media assets
-- ============================================================

grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;
alter table public.media_assets enable row level security;

create policy "published media readable"
  on public.media_assets for select
  to anon, authenticated
  using (archived_at is null);

create policy "staff manage media"
  on public.media_assets for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 4. Collections
-- ============================================================

grant select on public.collections to anon, authenticated;
grant insert, update, delete on public.collections to authenticated;
grant all on public.collections to service_role;
alter table public.collections enable row level security;

create policy "published collections readable"
  on public.collections for select
  to anon, authenticated
  using (status = 'published' and archived_at is null);

create policy "staff manage collections"
  on public.collections for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 5. Journeys
-- ============================================================

grant select on public.journeys to anon, authenticated;
grant insert, update, delete on public.journeys to authenticated;
grant all on public.journeys to service_role;
alter table public.journeys enable row level security;

create policy "published journeys readable"
  on public.journeys for select
  to anon, authenticated
  using (status = 'published' and archived_at is null);

create policy "staff manage journeys"
  on public.journeys for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 6. Collection translations
-- ============================================================

grant select on public.collection_translations to anon, authenticated;
grant insert, update, delete on public.collection_translations to authenticated;
grant all on public.collection_translations to service_role;
alter table public.collection_translations enable row level security;

create policy "published collection translations readable"
  on public.collection_translations for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.collections c
      where c.id = collection_id
        and c.status = 'published'
        and c.archived_at is null
    )
  );

create policy "staff manage collection translations"
  on public.collection_translations for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 7. Journey translations
-- ============================================================

grant select on public.journey_translations to anon, authenticated;
grant insert, update, delete on public.journey_translations to authenticated;
grant all on public.journey_translations to service_role;
alter table public.journey_translations enable row level security;

create policy "published journey translations readable"
  on public.journey_translations for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.journeys j
      where j.id = journey_id
        and j.status = 'published'
        and j.archived_at is null
    )
  );

create policy "staff manage journey translations"
  on public.journey_translations for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 8. Journey words
-- ============================================================

grant select on public.journey_words to anon, authenticated;
grant insert, update, delete on public.journey_words to authenticated;
grant all on public.journey_words to service_role;
alter table public.journey_words enable row level security;

create policy "published journey words readable"
  on public.journey_words for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1 from public.journeys j
      where j.id = journey_id
        and j.status = 'published'
        and j.archived_at is null
    )
  );

create policy "staff manage journey words"
  on public.journey_words for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 9. Journey word translations
-- ============================================================

grant select on public.journey_word_translations to anon, authenticated;
grant insert, update, delete on public.journey_word_translations to authenticated;
grant all on public.journey_word_translations to service_role;
alter table public.journey_word_translations enable row level security;

create policy "published journey word translations readable"
  on public.journey_word_translations for select
  to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.journeys j
      where j.id = journey_id
        and j.status = 'published'
        and j.archived_at is null
    )
  );

create policy "staff manage journey word translations"
  on public.journey_word_translations for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 10. Journey puzzle settings
-- ============================================================

grant select on public.journey_puzzle_settings to anon, authenticated;
grant insert, update, delete on public.journey_puzzle_settings to authenticated;
grant all on public.journey_puzzle_settings to service_role;
alter table public.journey_puzzle_settings enable row level security;

create policy "published puzzle settings readable"
  on public.journey_puzzle_settings for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.journeys j
      where j.id = journey_id
        and j.status = 'published'
        and j.archived_at is null
    )
  );

create policy "staff manage puzzle settings"
  on public.journey_puzzle_settings for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 11. Scripture references
-- ============================================================

grant select on public.scripture_references to anon, authenticated;
grant insert, update, delete on public.scripture_references to authenticated;
grant all on public.scripture_references to service_role;
alter table public.scripture_references enable row level security;

create policy "published scripture references readable"
  on public.scripture_references for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.journeys j
      where j.id = journey_id
        and j.status = 'published'
        and j.archived_at is null
    )
  );

create policy "staff manage scripture references"
  on public.scripture_references for all
  to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));

-- ============================================================
-- 12. Role management hardening
-- ============================================================

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

drop policy if exists "users read own roles" on public.user_roles;
drop policy if exists "super admins grant roles" on public.user_roles;
drop policy if exists "super admins revoke roles" on public.user_roles;

create policy "users read own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'));

create policy "super admins grant roles"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "super admins revoke roles"
  on public.user_roles for delete
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));

-- profiles / user_preferences: scope existing policies to signed-in users
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select, insert, update on public.user_preferences to authenticated;
grant all on public.user_preferences to service_role;