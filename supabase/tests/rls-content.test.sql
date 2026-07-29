-- rls-content.test.sql
--
-- Authorization tests for the Phase 2 content platform.
--
-- STATUS: written but NOT YET EXECUTED — no Supabase project exists at the time
-- of writing, so these assertions are unverified. Run them before trusting the
-- policies in production.
--
-- Run against a DISPOSABLE database only (it creates users and content):
--   psql "$TEST_DATABASE_URL" -f supabase/migrations/0001_identity_foundation.sql
--   psql "$TEST_DATABASE_URL" -f supabase/migrations/0002_publication_admin_role.sql
--   psql "$TEST_DATABASE_URL" -f supabase/migrations/0003_content_platform.sql
--   psql "$TEST_DATABASE_URL" -f supabase/migrations/0004_content_rls_and_workflow.sql
--   psql "$TEST_DATABASE_URL" -f supabase/tests/rls-content.test.sql
--
-- Any failed assertion raises an exception and aborts the transaction.

begin;

-- ---------------------------------------------------------------------------
-- Helpers: impersonate a user the way PostgREST does.
-- ---------------------------------------------------------------------------
create or replace function pg_temp.act_as(uid uuid)
returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end;
$$;

create or replace function pg_temp.act_as_anon()
returns void language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
end;
$$;

create or replace function pg_temp.act_as_admin_setup()
returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

create or replace function pg_temp.assert(condition boolean, description text)
returns void language plpgsql as $$
begin
  if condition then
    raise notice 'PASS: %', description;
  else
    raise exception 'FAIL: %', description;
  end if;
end;
$$;

-- Asserts that a statement is rejected (by RLS or by a trigger).
create or replace function pg_temp.assert_rejected(stmt text, description text)
returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'PASS: % (rejected: %)', description, sqlerrm;
    return;
  end;
  raise exception 'FAIL: % — statement unexpectedly succeeded', description;
end;
$$;

-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------
select pg_temp.act_as_admin_setup();

insert into auth.users (id, email) values
  ('e0000000-0000-4000-8000-000000000001', 'editor@test.local'),
  ('e0000000-0000-4000-8000-000000000002', 'reviewer@test.local'),
  ('e0000000-0000-4000-8000-000000000003', 'publisher@test.local'),
  ('e0000000-0000-4000-8000-000000000004', 'reader@test.local'),
  ('e0000000-0000-4000-8000-000000000005', 'editor2@test.local')
on conflict (id) do nothing;

-- handle_new_user() grants free_user; add the editorial roles.
insert into public.user_roles (user_id, role) values
  ('e0000000-0000-4000-8000-000000000001', 'content_editor'),
  ('e0000000-0000-4000-8000-000000000002', 'content_reviewer'),
  ('e0000000-0000-4000-8000-000000000003', 'publication_admin'),
  ('e0000000-0000-4000-8000-000000000005', 'content_editor')
on conflict do nothing;

insert into public.collections
  (id, internal_name, slug, primary_language_code, status, published_at)
values
  ('c1000000-0000-4000-8000-000000000001', 'Published Fixture', 'published-fixture', 'en', 'published', now() - interval '1 day'),
  ('c1000000-0000-4000-8000-000000000002', 'Draft Fixture', 'draft-fixture', 'en', 'draft', null)
on conflict (id) do nothing;

insert into public.collection_translations (collection_id, language_code, status, title) values
  ('c1000000-0000-4000-8000-000000000001', 'en', 'published', 'Published Fixture'),
  ('c1000000-0000-4000-8000-000000000002', 'en', 'draft', 'Draft Fixture')
on conflict do nothing;

insert into public.journeys
  (id, internal_title, slug, primary_collection_id, primary_language_code, status, published_at, created_by)
values
  ('41000000-0000-4000-8000-000000000001', 'Published Journey', 'published-journey',
   'c1000000-0000-4000-8000-000000000001', 'en', 'published', now() - interval '1 day', 'e0000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000002', 'Draft Journey', 'draft-journey',
   'c1000000-0000-4000-8000-000000000001', 'en', 'draft', null, 'e0000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000003', 'Scheduled Journey', 'scheduled-journey',
   'c1000000-0000-4000-8000-000000000001', 'en', 'published', now() + interval '5 days', 'e0000000-0000-4000-8000-000000000001'),
  ('41000000-0000-4000-8000-000000000004', 'Internal Journey', 'internal-journey',
   'c1000000-0000-4000-8000-000000000001', 'en', 'published', now() - interval '1 day', 'e0000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

update public.journeys set access_level = 'internal'
  where id = '41000000-0000-4000-8000-000000000004';

-- ===========================================================================
-- 1. ANONYMOUS VISITORS
-- ===========================================================================
select pg_temp.act_as_anon();

select pg_temp.assert(
  (select count(*) from public.collections where id = 'c1000000-0000-4000-8000-000000000001') = 1,
  'anon can read a published collection');

select pg_temp.assert(
  (select count(*) from public.collections where id = 'c1000000-0000-4000-8000-000000000002') = 0,
  'anon CANNOT read a draft collection');

select pg_temp.assert(
  (select count(*) from public.journeys where id = '41000000-0000-4000-8000-000000000002') = 0,
  'anon CANNOT read a draft journey');

select pg_temp.assert(
  (select count(*) from public.journeys where id = '41000000-0000-4000-8000-000000000003') = 0,
  'anon CANNOT read a journey whose published_at is in the future');

select pg_temp.assert(
  (select count(*) from public.journeys where id = '41000000-0000-4000-8000-000000000004') = 0,
  'anon CANNOT read an internal-access journey even when published');

select pg_temp.assert(
  (select count(*) from public.content_audit_logs) = 0,
  'anon CANNOT read audit logs');

select pg_temp.assert(
  (select count(*) from public.content_preview_tokens) = 0,
  'anon CANNOT read preview tokens');

select pg_temp.assert_rejected(
  $$insert into public.collections (internal_name, slug, primary_language_code)
    values ('Hacked', 'hacked', 'en')$$,
  'anon CANNOT create a collection');

-- ===========================================================================
-- 2. ORDINARY SIGNED-IN READER (free_user only)
-- ===========================================================================
select pg_temp.act_as('e0000000-0000-4000-8000-000000000004');

select pg_temp.assert(
  (select count(*) from public.collections where id = 'c1000000-0000-4000-8000-000000000002') = 0,
  'free_user CANNOT read draft collections');

select pg_temp.assert_rejected(
  $$insert into public.journeys (internal_title, slug, primary_collection_id, primary_language_code)
    values ('Sneaky', 'sneaky', 'c1000000-0000-4000-8000-000000000001', 'en')$$,
  'free_user CANNOT create a journey');

select pg_temp.assert_rejected(
  $$update public.journeys set internal_title = 'Defaced'
    where id = '41000000-0000-4000-8000-000000000001'$$,
  'free_user CANNOT edit a journey');

-- ===========================================================================
-- 3. CONTENT EDITOR
-- ===========================================================================
select pg_temp.act_as('e0000000-0000-4000-8000-000000000001');

select pg_temp.assert(
  (select count(*) from public.journeys where id = '41000000-0000-4000-8000-000000000002') = 1,
  'editor CAN read draft journeys');

select pg_temp.assert(
  (select count(*) from public.collections where status = 'draft') >= 1,
  'editor CAN read draft collections');

-- Editing an unpublished journey is allowed.
update public.journeys set internal_title = 'Draft Journey (edited)'
  where id = '41000000-0000-4000-8000-000000000002';
select pg_temp.assert(
  (select internal_title from public.journeys where id = '41000000-0000-4000-8000-000000000002')
    = 'Draft Journey (edited)',
  'editor CAN edit a draft journey');

select pg_temp.assert_rejected(
  $$update public.journeys set internal_title = 'Live edit'
    where id = '41000000-0000-4000-8000-000000000001'$$,
  'editor CANNOT edit a published journey');

-- Workflow: submit for review is allowed.
update public.journeys set status = 'in_review'
  where id = '41000000-0000-4000-8000-000000000002';
select pg_temp.assert(
  (select status from public.journeys where id = '41000000-0000-4000-8000-000000000002') = 'in_review',
  'editor CAN submit a draft for review');

select pg_temp.assert_rejected(
  $$update public.journeys set status = 'approved'
    where id = '41000000-0000-4000-8000-000000000002'$$,
  'editor CANNOT approve content');

select pg_temp.assert_rejected(
  $$update public.journeys set status = 'published'
    where id = '41000000-0000-4000-8000-000000000002'$$,
  'editor CANNOT publish content (and cannot skip review)');

select pg_temp.assert_rejected(
  $$delete from public.content_audit_logs$$,
  'editor CANNOT delete audit logs');

-- ===========================================================================
-- 4. SELF-APPROVAL
-- The editor above authored journey ...0002. Give that same person the
-- reviewer role and confirm they still cannot approve their own work.
-- ===========================================================================
select pg_temp.act_as_admin_setup();
insert into public.user_roles (user_id, role)
values ('e0000000-0000-4000-8000-000000000001', 'content_reviewer')
on conflict do nothing;

select pg_temp.act_as('e0000000-0000-4000-8000-000000000001');

select pg_temp.assert_rejected(
  $$update public.journeys set status = 'approved'
    where id = '41000000-0000-4000-8000-000000000002'$$,
  'an author with reviewer rights CANNOT approve their own content (self-approval blocked)');

-- ===========================================================================
-- 5. CONTENT REVIEWER (a different person)
-- ===========================================================================
select pg_temp.act_as('e0000000-0000-4000-8000-000000000002');

update public.journeys set status = 'approved'
  where id = '41000000-0000-4000-8000-000000000002';
select pg_temp.assert(
  (select status from public.journeys where id = '41000000-0000-4000-8000-000000000002') = 'approved',
  'a different reviewer CAN approve the content');

select pg_temp.assert_rejected(
  $$update public.journeys set status = 'published'
    where id = '41000000-0000-4000-8000-000000000002'$$,
  'reviewer CANNOT publish');

-- ===========================================================================
-- 6. PUBLICATION ADMIN
-- ===========================================================================
select pg_temp.act_as('e0000000-0000-4000-8000-000000000003');

update public.journeys set status = 'published'
  where id = '41000000-0000-4000-8000-000000000002';
select pg_temp.assert(
  (select status from public.journeys where id = '41000000-0000-4000-8000-000000000002') = 'published',
  'publication admin CAN publish approved content');

select pg_temp.assert(
  (select published_at is not null from public.journeys
    where id = '41000000-0000-4000-8000-000000000002'),
  'published_at is set automatically on publish');

select pg_temp.assert_rejected(
  $$update public.journeys set status = 'draft'
    where id = '41000000-0000-4000-8000-000000000002'$$,
  'published content CANNOT jump straight back to draft (must be unpublished first)');

-- ===========================================================================
-- 7. AUDIT TRAIL IS WRITTEN AND IMMUTABLE
-- ===========================================================================
select pg_temp.assert(
  (select count(*) from public.content_status_history
    where entity_id = '41000000-0000-4000-8000-000000000002') >= 3,
  'status history recorded every transition (draft -> in_review -> approved -> published)');

select pg_temp.assert(
  (select count(*) from public.content_audit_logs
    where entity_id = '41000000-0000-4000-8000-000000000002'
      and action = 'status_changed') >= 3,
  'audit log recorded every status change');

select pg_temp.assert_rejected(
  $$update public.content_audit_logs set summary = 'tampered'$$,
  'nobody CAN update audit logs');

select pg_temp.assert_rejected(
  $$delete from public.content_status_history$$,
  'nobody CAN delete status history');

-- ===========================================================================
-- 8. VERSIONING
-- ===========================================================================
select pg_temp.assert(
  (select count(*) from public.content_versions
    where entity_type = 'journey' and entity_id = '41000000-0000-4000-8000-000000000002') >= 1,
  'editing a journey created a version snapshot');

select pg_temp.assert(
  (select current_version from public.journeys
    where id = '41000000-0000-4000-8000-000000000002') > 1,
  'current_version incremented after significant edits');

-- ===========================================================================
-- 9. SCRIPTURE LICENSING BACKSTOP
-- ===========================================================================
select pg_temp.act_as_admin_setup();
insert into public.scripture_sources
  (id, translation_code, translation_name, language_code, strategy, allows_text_storage, license_notes)
values
  ('50000000-0000-4000-8000-000000000001', 'TESTREF', 'Reference Only Translation', 'en',
   'reference_only', false, 'Test fixture: storage not permitted')
on conflict (id) do nothing;

select pg_temp.act_as('e0000000-0000-4000-8000-000000000001');

select pg_temp.assert_rejected(
  $$insert into public.scripture_references
      (journey_id, source_id, book_code, chapter, verse_start, display_reference, stored_text)
    values ('41000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001',
            'PSA', 23, 1, 'Psalm 23:1', 'Copyrighted text that must not be stored')$$,
  'storing verse text for a reference-only source is REJECTED (licensing backstop)');

-- ===========================================================================
-- 10. WORD LIST INTEGRITY
-- ===========================================================================
select pg_temp.act_as('e0000000-0000-4000-8000-000000000001');

insert into public.journey_words (id, journey_id, position)
values ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000002', 0),
       ('42000000-0000-4000-8000-000000000002', '41000000-0000-4000-8000-000000000002', 1)
on conflict (id) do nothing;

insert into public.journey_word_translations
  (journey_word_id, journey_id, language_code, display_value, normalized_value)
values ('42000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000002',
        'pt', 'AVÔ', 'AVO');

select pg_temp.assert_rejected(
  $$insert into public.journey_word_translations
      (journey_word_id, journey_id, language_code, display_value, normalized_value)
    values ('42000000-0000-4000-8000-000000000002', '41000000-0000-4000-8000-000000000002',
            'pt', 'AVO', 'AVO')$$,
  'two words normalizing identically in the same journey+language are REJECTED');

-- ===========================================================================
-- 11. DAILY JOURNEY CONSTRAINTS
-- ===========================================================================
select pg_temp.act_as('e0000000-0000-4000-8000-000000000003');

insert into public.daily_journeys (journey_date, language_code, journey_id)
values (current_date + 10, 'en', '41000000-0000-4000-8000-000000000002');

select pg_temp.assert_rejected(
  $$insert into public.daily_journeys (journey_date, language_code, journey_id)
    values (current_date + 10, 'en', '41000000-0000-4000-8000-000000000001')$$,
  'two Daily Journeys for the same date+language are REJECTED');

select pg_temp.act_as_anon();
select pg_temp.assert(
  (select count(*) from public.daily_journeys where journey_date = current_date + 10) = 0,
  'anon CANNOT see future Daily Journey assignments');

rollback;

-- Nothing is persisted: the whole suite runs inside a transaction that is
-- rolled back, so it is safe to re-run.
