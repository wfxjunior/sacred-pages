-- rls-progress.test.sql
--
-- Authorization, privacy and server-authority tests for the progress domain
-- (migration 0006): journey sessions, private reflections and prayers,
-- favorites, consistency, milestones and activity events.
--
-- The claims this suite exists to prove, in order of how much damage a
-- regression would do:
--
--   1. No one can read another reader's reflection or prayer. Not another
--      user, not an editor, not a super admin.
--   2. A client cannot award itself a milestone, an active day, or progress.
--      Those tables are trigger-owned.
--   3. Completing a journey produces exactly the right consequences, once.
--
-- Run against a DISPOSABLE database. Everything is wrapped in a transaction
-- that rolls back, so nothing persists:
--
--   supabase/tests/local/verify-migrations.sh lumena_test
--   psql -v ON_ERROR_STOP=1 -d lumena_test -f supabase/tests/rls-progress.test.sql

begin;

-- ---------------------------------------------------------------------------
-- Helpers — impersonate the way PostgREST does.
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

create or replace function pg_temp.act_as_setup()
returns void language plpgsql as $$
begin
  perform set_config('role', 'none', true);
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

-- An exception passes; zero affected rows passes (RLS filtered them); any
-- affected row fails. See rls-content.test.sql for why both count as denial.
create or replace function pg_temp.assert_rejected(stmt text, description text)
returns void language plpgsql as $$
declare
  affected bigint;
begin
  begin
    execute stmt;
    get diagnostics affected = row_count;
  exception when others then
    raise notice 'PASS: % (rejected: %)', description, sqlerrm;
    return;
  end;

  if affected = 0 then
    raise notice 'PASS: % (no rows affected — filtered by RLS)', description;
    return;
  end if;

  raise exception 'FAIL: % — statement affected % row(s)', description, affected;
end;
$$;

-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------
select pg_temp.act_as_setup();

insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-000000000001', 'reader.a@example.com'),
  ('a0000000-0000-4000-8000-000000000002', 'reader.b@example.com'),
  ('a0000000-0000-4000-8000-000000000003', 'editor@example.com'),
  ('a0000000-0000-4000-8000-000000000004', 'superadmin@example.com');

insert into public.user_roles (user_id, role) values
  ('a0000000-0000-4000-8000-000000000003', 'content_editor'),
  ('a0000000-0000-4000-8000-000000000004', 'super_admin');

insert into public.languages (code, english_name, native_name, is_active, is_default)
values ('en', 'English', 'English', true, true)
on conflict (code) do nothing;

-- collections uses internal_name; journeys uses internal_title. Not a typo.
insert into public.collections (id, internal_name, slug, primary_language_code, status, published_at)
values ('c0000000-0000-4000-8000-000000000001', 'Peace', 'peace', 'en', 'published', now());

insert into public.journeys
  (id, internal_title, slug, primary_collection_id, primary_language_code, status, published_at, difficulty)
values
  ('30000000-0000-4000-8000-000000000001', 'Do Not Be Anxious', 'do-not-be-anxious',
   'c0000000-0000-4000-8000-000000000001', 'en', 'published', now(), 'gentle'),
  ('30000000-0000-4000-8000-000000000002', 'Be Still', 'be-still',
   'c0000000-0000-4000-8000-000000000001', 'en', 'published', now(), 'gentle');

-- Reader A writes a private reflection and prayer. This exact text is what the
-- privacy assertions hunt for everywhere else.
insert into public.user_reflections (user_id, journey_id, language_code, body)
values ('a0000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'en',
        'CONFIDENTIAL-REFLECTION-TEXT');

insert into public.user_prayers (user_id, journey_id, language_code, acknowledged, body)
values ('a0000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'en', true,
        'CONFIDENTIAL-PRAYER-TEXT');

-- ===========================================================================
-- 1. PRIVACY — the strongest claim in the product
-- ===========================================================================

select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
select pg_temp.assert(
  (select count(*) from public.user_reflections) = 1,
  'reader A CAN read their own reflection');

select pg_temp.act_as('a0000000-0000-4000-8000-000000000002');
select pg_temp.assert(
  (select count(*) from public.user_reflections) = 0,
  'reader B CANNOT read reader A''s reflection');
select pg_temp.assert(
  (select count(*) from public.user_prayers) = 0,
  'reader B CANNOT read reader A''s prayer');

-- The deliberate absence of an admin policy is the point of these two.
select pg_temp.act_as('a0000000-0000-4000-8000-000000000003');
select pg_temp.assert(
  (select count(*) from public.user_reflections) = 0,
  'a content EDITOR CANNOT read anyone''s reflection');

select pg_temp.act_as('a0000000-0000-4000-8000-000000000004');
select pg_temp.assert(
  (select count(*) from public.user_reflections) = 0,
  'a SUPER ADMIN CANNOT read anyone''s reflection');
select pg_temp.assert(
  (select count(*) from public.user_prayers) = 0,
  'a SUPER ADMIN CANNOT read anyone''s prayer');

select pg_temp.act_as_anon();
select pg_temp.assert(
  (select count(*) from public.user_reflections) = 0,
  'anon CANNOT read reflections');

select pg_temp.act_as('a0000000-0000-4000-8000-000000000002');
select pg_temp.assert_rejected(
  $$update public.user_reflections set body = 'defaced'
    where user_id = 'a0000000-0000-4000-8000-000000000001'$$,
  'reader B CANNOT edit reader A''s reflection');
select pg_temp.assert_rejected(
  $$delete from public.user_reflections
    where user_id = 'a0000000-0000-4000-8000-000000000001'$$,
  'reader B CANNOT delete reader A''s reflection');

-- Writing a reflection AS someone else must fail the WITH CHECK.
select pg_temp.assert_rejected(
  $$insert into public.user_reflections (user_id, journey_id, language_code, body)
    values ('a0000000-0000-4000-8000-000000000001',
            '30000000-0000-4000-8000-000000000002', 'en', 'forged')$$,
  'reader B CANNOT write a reflection owned by reader A');

-- ===========================================================================
-- 2. SERVER AUTHORITY — trigger-owned tables reject direct client writes
-- ===========================================================================

select pg_temp.act_as('a0000000-0000-4000-8000-000000000002');

select pg_temp.assert_rejected(
  $$insert into public.user_milestones (user_id, milestone_id)
    select 'a0000000-0000-4000-8000-000000000002', id
    from public.milestone_definitions limit 1$$,
  'a client CANNOT award itself a milestone (no INSERT policy exists)');

select pg_temp.assert_rejected(
  $$insert into public.journey_progress (user_id, journey_id, completion_count)
    values ('a0000000-0000-4000-8000-000000000002',
            '30000000-0000-4000-8000-000000000001', 999)$$,
  'a client CANNOT insert its own journey_progress');

select pg_temp.assert_rejected(
  $$insert into public.consistency_days (user_id, activity_date)
    values ('a0000000-0000-4000-8000-000000000002', current_date)$$,
  'a client CANNOT record its own active day');

select pg_temp.assert_rejected(
  $$insert into public.user_collection_progress
      (user_id, collection_id, journeys_completed, completion_percent)
    values ('a0000000-0000-4000-8000-000000000002',
            'c0000000-0000-4000-8000-000000000001', 99, 100)$$,
  'a client CANNOT fabricate collection progress');

-- The activity log is append-only: insert allowed, rewriting history is not.
select pg_temp.assert_rejected(
  $$update public.activity_events set type = 'milestone_earned'
    where user_id = 'a0000000-0000-4000-8000-000000000002'$$,
  'a client CANNOT rewrite its own activity events');

-- ===========================================================================
-- 3. JOURNEY COMPLETION — the trigger does the work, exactly once
-- ===========================================================================

select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');

insert into public.journey_sessions
  (id, user_id, journey_id, collection_id, language_code, status, difficulty)
values
  ('50000000-0000-4000-8000-000000000001',
   'a0000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000001',
   'c0000000-0000-4000-8000-000000000001', 'en', 'in_progress', 'gentle');

select pg_temp.assert(
  (select count(*) from public.journey_progress
    where user_id = 'a0000000-0000-4000-8000-000000000001') = 0,
  'starting a journey does NOT yet create durable progress');

-- Complete it. Everything downstream is the trigger's job.
update public.journey_sessions
   set status = 'completed', completed_at = now(), elapsed_ms = 421000
 where id = '50000000-0000-4000-8000-000000000001';

select pg_temp.assert(
  (select completion_count from public.journey_progress
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and journey_id = '30000000-0000-4000-8000-000000000001') = 1,
  'completion created journey_progress with completion_count = 1');

select pg_temp.assert(
  (select count(*) from public.consistency_days
    where user_id = 'a0000000-0000-4000-8000-000000000001') = 1,
  'completion recorded exactly one active day');

select pg_temp.assert(
  (select count(*) from public.activity_events
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and type = 'journey_completed') = 1,
  'completion appended exactly one journey_completed event');

select pg_temp.assert(
  (select completion_percent from public.user_collection_progress
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and collection_id = 'c0000000-0000-4000-8000-000000000001') = 50,
  'collection progress is 50% after 1 of 2 published journeys');

-- ---------------------------------------------------------------------------
-- 3b. A second journey the SAME local day must not grant a second active day.
-- ---------------------------------------------------------------------------
insert into public.journey_sessions
  (id, user_id, journey_id, collection_id, language_code, status, difficulty)
values
  ('50000000-0000-4000-8000-000000000002',
   'a0000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000002',
   'c0000000-0000-4000-8000-000000000001', 'en', 'in_progress', 'gentle');

update public.journey_sessions
   set status = 'completed', completed_at = now(), elapsed_ms = 300000
 where id = '50000000-0000-4000-8000-000000000002';

select pg_temp.assert(
  (select count(*) from public.consistency_days
    where user_id = 'a0000000-0000-4000-8000-000000000001') = 1,
  'a second journey the same day is STILL one active day (rhythm, not score)');

select pg_temp.assert(
  (select journeys_completed from public.consistency_days
    where user_id = 'a0000000-0000-4000-8000-000000000001') = 2,
  'but the day''s counter incremented to 2');

select pg_temp.assert(
  (select completion_percent from public.user_collection_progress
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and collection_id = 'c0000000-0000-4000-8000-000000000001') = 100,
  'collection progress reached 100% after both journeys');

select pg_temp.assert(
  (select completed_at is not null from public.user_collection_progress
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and collection_id = 'c0000000-0000-4000-8000-000000000001'),
  'collection completed_at was stamped');

-- ---------------------------------------------------------------------------
-- 3c. Re-running the completion UPDATE must not double-count.
-- ---------------------------------------------------------------------------
update public.journey_sessions
   set status = 'completed', last_active_at = now()
 where id = '50000000-0000-4000-8000-000000000001';

select pg_temp.assert(
  (select completion_count from public.journey_progress
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and journey_id = '30000000-0000-4000-8000-000000000001') = 1,
  'repeating the completion update does NOT increment completion_count again');

select pg_temp.assert(
  (select count(*) from public.activity_events
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and type = 'journey_completed') = 2,
  'still exactly one completion event per session (2 sessions = 2 events)');

-- ===========================================================================
-- 4. MILESTONES — server-side, idempotent
-- ===========================================================================
select pg_temp.act_as_setup();

select pg_temp.assert(
  public.evaluate_milestones('a0000000-0000-4000-8000-000000000001') > 0,
  'evaluate_milestones awarded milestones for a reader who completed journeys');

select pg_temp.assert(
  (select count(*) from public.user_milestones
    where user_id = 'a0000000-0000-4000-8000-000000000001'
      and milestone_id = (select id from public.milestone_definitions
                          where key = 'first_journey')) = 1,
  'first_journey was awarded exactly once');

-- Idempotency is the whole point: re-running must award nothing new.
select pg_temp.assert(
  public.evaluate_milestones('a0000000-0000-4000-8000-000000000001') = 0,
  're-running evaluate_milestones awards nothing (idempotent)');

select pg_temp.assert(
  (select count(*) from public.user_milestones
    where user_id = 'a0000000-0000-4000-8000-000000000001') =
  (select count(distinct milestone_id) from public.user_milestones
    where user_id = 'a0000000-0000-4000-8000-000000000001'),
  'no duplicate milestone rows exist');

-- A reader who did nothing earns nothing.
select pg_temp.assert(
  (select count(*) from public.user_milestones
    where user_id = 'a0000000-0000-4000-8000-000000000002') = 0,
  'a reader with no activity has no milestones');

-- Only seen_at is client-writable on user_milestones.
select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
update public.user_milestones set seen_at = now()
 where user_id = 'a0000000-0000-4000-8000-000000000001';
select pg_temp.assert(
  (select count(*) from public.user_milestones
    where user_id = 'a0000000-0000-4000-8000-000000000001' and seen_at is null) = 0,
  'a reader CAN mark their own milestones seen');

select pg_temp.act_as('a0000000-0000-4000-8000-000000000002');
select pg_temp.assert_rejected(
  $$update public.user_milestones set seen_at = null
    where user_id = 'a0000000-0000-4000-8000-000000000001'$$,
  'reader B CANNOT touch reader A''s milestones');

-- ===========================================================================
-- 5. CONSISTENCY — timezone-aware, computed not stored
-- ===========================================================================
select pg_temp.act_as_setup();

select pg_temp.assert(
  (select active_days from public.consistency_summary('a0000000-0000-4000-8000-000000000001')) = 1,
  'consistency_summary reports 1 active day');

select pg_temp.assert(
  (select current_run from public.consistency_summary('a0000000-0000-4000-8000-000000000001')) = 1,
  'consistency_summary reports a current run of 1');

-- user_local_date must follow the reader's stored zone, not the server's.
insert into public.user_preferences (user_id, timezone)
values ('a0000000-0000-4000-8000-000000000002', 'Pacific/Kiritimati')
on conflict (user_id) do update set timezone = excluded.timezone;

select pg_temp.assert(
  public.user_local_date('a0000000-0000-4000-8000-000000000002', '2026-07-29T12:00:00Z'::timestamptz)
    = date '2026-07-30',
  'user_local_date honours a UTC+14 reader (their day is already tomorrow)');

insert into public.user_preferences (user_id, timezone)
values ('a0000000-0000-4000-8000-000000000003', 'Pacific/Niue')
on conflict (user_id) do update set timezone = excluded.timezone;

select pg_temp.assert(
  public.user_local_date('a0000000-0000-4000-8000-000000000003', '2026-07-29T05:00:00Z'::timestamptz)
    = date '2026-07-28',
  'user_local_date honours a UTC-11 reader (their day is still yesterday)');

-- A reader with no stored preference must not break progress recording.
select pg_temp.assert(
  public.user_local_date('a0000000-0000-4000-8000-000000000004', '2026-07-29T12:00:00Z'::timestamptz)
    = date '2026-07-29',
  'user_local_date falls back to UTC when no timezone is set');

-- ===========================================================================
-- 6. SESSION OWNERSHIP
-- ===========================================================================
select pg_temp.act_as('a0000000-0000-4000-8000-000000000002');

select pg_temp.assert(
  (select count(*) from public.journey_sessions) = 0,
  'reader B CANNOT see reader A''s journey sessions');

select pg_temp.assert_rejected(
  $$update public.journey_sessions set status = 'abandoned'
    where id = '50000000-0000-4000-8000-000000000001'$$,
  'reader B CANNOT abandon reader A''s session');

select pg_temp.assert_rejected(
  $$insert into public.journey_sessions
      (user_id, journey_id, language_code)
    values ('a0000000-0000-4000-8000-000000000001',
            '30000000-0000-4000-8000-000000000002', 'en')$$,
  'reader B CANNOT open a session owned by reader A');

-- Step progress must belong to a session the caller owns.
select pg_temp.assert_rejected(
  $$insert into public.journey_step_progress (session_id, user_id, step_type)
    values ('50000000-0000-4000-8000-000000000001',
            'a0000000-0000-4000-8000-000000000002', 'scripture')$$,
  'reader B CANNOT attach step progress to reader A''s session');

select pg_temp.assert(
  (select count(*) from public.journey_progress) = 0,
  'reader B CANNOT see reader A''s durable progress');

select pg_temp.assert(
  (select count(*) from public.consistency_days) = 0,
  'reader B CANNOT see reader A''s active days');

select pg_temp.assert(
  (select count(*) from public.activity_events) = 0,
  'reader B CANNOT see reader A''s activity events');

-- ===========================================================================
-- 7. FAVORITES
-- ===========================================================================
select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');

insert into public.favorites (user_id, entity_type, journey_id)
values ('a0000000-0000-4000-8000-000000000001', 'journey',
        '30000000-0000-4000-8000-000000000001');

select pg_temp.assert_rejected(
  $$insert into public.favorites (user_id, entity_type, journey_id)
    values ('a0000000-0000-4000-8000-000000000001', 'journey',
            '30000000-0000-4000-8000-000000000001')$$,
  'the same journey cannot be favourited twice');

select pg_temp.assert_rejected(
  $$insert into public.favorites (user_id, entity_type, journey_id, collection_id)
    values ('a0000000-0000-4000-8000-000000000001', 'journey',
            '30000000-0000-4000-8000-000000000002',
            'c0000000-0000-4000-8000-000000000001')$$,
  'a favourite cannot name both a journey and a collection');

select pg_temp.act_as('a0000000-0000-4000-8000-000000000002');
select pg_temp.assert(
  (select count(*) from public.favorites) = 0,
  'reader B CANNOT see reader A''s favourites');

-- ===========================================================================
-- 8. PRIVATE TEXT MUST NOT APPEAR IN NON-PRIVATE TABLES
-- ===========================================================================
select pg_temp.act_as_setup();

select pg_temp.assert(
  (select count(*) from public.activity_events
    where metadata::text like '%CONFIDENTIAL%') = 0,
  'no reflection or prayer text leaked into activity_events');

select pg_temp.assert(
  (select count(*) from public.user_milestones
    where context::text like '%CONFIDENTIAL%') = 0,
  'no private text leaked into milestone context');

select pg_temp.assert(
  (select count(*) from public.journey_step_progress
    where metadata::text like '%CONFIDENTIAL%') = 0,
  'no private text leaked into step metadata');

select pg_temp.assert(
  (select count(*) from public.content_audit_logs
    where coalesce(summary,'') || coalesce(metadata::text,'') like '%CONFIDENTIAL%') = 0,
  'no private text leaked into content audit logs');

rollback;

-- Nothing is persisted: the suite runs inside a transaction that is rolled
-- back, so it can be re-run against the same database indefinitely.
