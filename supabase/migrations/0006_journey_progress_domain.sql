-- 0006_journey_progress_domain.sql
-- Phase 4: journey sessions, steps, private responses, favorites, history,
-- consistency and milestones.
--
-- Two rules shape this whole migration:
--   1. Private spiritual content (reflections, prayers) is readable ONLY by its
--      author. No admin role gets casual access.
--   2. Progress is server-authoritative. Completion, active days and milestones
--      are computed by triggers, never accepted from the client.
--
-- Docs: docs/engineering/progress-and-milestones.md

-- ===========================================================================
-- ENUMS
-- ===========================================================================

create type public.journey_session_status as enum (
  'not_started',
  'in_progress',
  'puzzle_completed',
  'completed',
  'abandoned'
);

create type public.journey_step_type as enum (
  'scripture',
  'devotional',
  'puzzle',
  'reflection',
  'prayer',
  'completion'
);

create type public.favorite_entity as enum ('collection', 'journey');

create type public.milestone_category as enum (
  'journey',
  'puzzle',
  'consistency',
  'collection',
  'reflection',
  'prayer',
  'discovery'
);

create type public.milestone_criteria as enum (
  'first_occurrence',
  'cumulative_count',
  'consistency_days',
  'collection_completed',
  'difficulty_reached'
);

create type public.activity_event_type as enum (
  'journey_started',
  'journey_resumed',
  'journey_step_completed',
  'puzzle_started',
  'puzzle_completed',
  'reflection_saved',
  'prayer_saved',
  'journey_completed',
  'collection_completed',
  'favorite_added',
  'favorite_removed',
  'active_day_recorded',
  'milestone_earned'
);

-- ===========================================================================
-- TIME ZONE HELPER
-- The single definition of "what local day did this happen on".
-- Storing timestamps in UTC and deriving the date here is what lets a reader in
-- Sao Paulo finishing at 22:00 be credited to today rather than tomorrow.
-- ===========================================================================

create or replace function public.user_local_date(uid uuid, moment timestamptz default now())
returns date
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  zone text;
begin
  select nullif(timezone, '') into zone from public.user_preferences where user_id = uid;
  -- UTC is the documented fallback when a reader has not chosen a time zone.
  return (moment at time zone coalesce(zone, 'UTC'))::date;
exception when others then
  -- An invalid IANA name must not break progress recording.
  return (moment at time zone 'UTC')::date;
end;
$$;

-- ===========================================================================
-- JOURNEY SESSIONS
-- One sitting through one journey.
-- ===========================================================================

create table public.journey_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  collection_id uuid references public.collections (id) on delete set null,
  puzzle_instance_id uuid references public.puzzle_instances (id) on delete set null,

  status public.journey_session_status not null default 'in_progress',
  language_code text not null references public.languages (code) on delete restrict,
  difficulty public.difficulty_level not null default 'gentle',

  -- The step the reader should land on when resuming.
  current_step public.journey_step_type not null default 'scripture',
  completion_percent int not null default 0 check (completion_percent between 0 and 100),
  elapsed_ms int not null default 0 check (elapsed_ms >= 0),

  -- True for a replay of an already-completed journey. Replays never re-award
  -- first-completion milestones.
  is_replay boolean not null default false,
  -- The date the reader was assigned this journey (Daily Journey), in their zone.
  assigned_date date,

  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  completed_at timestamptz,
  abandoned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint journey_sessions_completed_state check (
    (status = 'completed') = (completed_at is not null)
  ),
  constraint journey_sessions_abandoned_state check (
    (status = 'abandoned') = (abandoned_at is not null)
  )
);

-- One live session per user per journey: resuming reuses it rather than forking.
create unique index journey_sessions_one_active_idx
  on public.journey_sessions (user_id, journey_id)
  where status in ('not_started', 'in_progress', 'puzzle_completed');

create index journey_sessions_user_idx on public.journey_sessions (user_id, last_active_at desc);
create index journey_sessions_history_idx
  on public.journey_sessions (user_id, completed_at desc)
  where status = 'completed';
create index journey_sessions_journey_idx on public.journey_sessions (journey_id);

create trigger journey_sessions_set_updated_at
  before update on public.journey_sessions
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- JOURNEY STEP PROGRESS
-- One row per step per session. Adding a new step type (audio, quiz) needs no
-- schema change.
-- ===========================================================================

create table public.journey_step_progress (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.journey_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  step_type public.journey_step_type not null,
  step_order int not null default 0,
  is_required boolean not null default true,

  started_at timestamptz,
  completed_at timestamptz,
  time_spent_ms int not null default 0 check (time_spent_ms >= 0),
  -- Safe metadata only: never reflection or prayer text.
  metadata jsonb not null default '{}'::jsonb,
  content_version int,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (session_id, step_type)
);

create index journey_step_progress_session_idx
  on public.journey_step_progress (session_id, step_order);

create trigger journey_step_progress_set_updated_at
  before update on public.journey_step_progress
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- JOURNEY PROGRESS
-- Durable per-user-per-journey record that OUTLIVES any session.
-- ===========================================================================

create table public.journey_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  collection_id uuid references public.collections (id) on delete set null,

  first_completed_at timestamptz,
  last_completed_at timestamptz,
  completion_count int not null default 0 check (completion_count >= 0),
  best_duration_ms int check (best_duration_ms is null or best_duration_ms > 0),
  total_words_found int not null default 0 check (total_words_found >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, journey_id)
);

create index journey_progress_user_idx on public.journey_progress (user_id, last_completed_at desc);
create index journey_progress_collection_idx on public.journey_progress (user_id, collection_id);

create trigger journey_progress_set_updated_at
  before update on public.journey_progress
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- PRIVATE RESPONSES
-- The most sensitive data in the product. Owner-only, never logged, never
-- shared, never visible to any admin role.
-- ===========================================================================

create table public.user_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  session_id uuid references public.journey_sessions (id) on delete set null,
  language_code text not null references public.languages (code) on delete restrict,
  prompt_version int,
  body text not null check (char_length(body) <= 10000),
  -- Soft delete so a reader can undo; purged by a retention job after 30 days.
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One reflection per journey per reader; editing updates it.
  unique (user_id, journey_id)
);

create index user_reflections_user_idx on public.user_reflections (user_id, updated_at desc)
  where deleted_at is null;

create trigger user_reflections_set_updated_at
  before update on public.user_reflections
  for each row execute function public.set_updated_at();

create table public.user_prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  session_id uuid references public.journey_sessions (id) on delete set null,
  language_code text not null references public.languages (code) on delete restrict,
  -- A reader may simply acknowledge the prayer without writing anything.
  acknowledged boolean not null default false,
  body text check (body is null or char_length(body) <= 10000),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, journey_id)
);

create index user_prayers_user_idx on public.user_prayers (user_id, updated_at desc)
  where deleted_at is null;

create trigger user_prayers_set_updated_at
  before update on public.user_prayers
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- FAVORITES
-- Polymorphic but constrained: a CHECK keeps exactly one FK populated, so the
-- model stays type-safe and joinable without a table per entity.
-- ===========================================================================

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entity_type public.favorite_entity not null,
  journey_id uuid references public.journeys (id) on delete cascade,
  collection_id uuid references public.collections (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint favorites_exactly_one_entity check (
    (entity_type = 'journey' and journey_id is not null and collection_id is null)
    or (entity_type = 'collection' and collection_id is not null and journey_id is null)
  )
);

-- Duplicate favourites are impossible rather than merely discouraged.
create unique index favorites_unique_journey_idx
  on public.favorites (user_id, journey_id) where journey_id is not null;
create unique index favorites_unique_collection_idx
  on public.favorites (user_id, collection_id) where collection_id is not null;
create index favorites_user_idx on public.favorites (user_id, created_at desc);

-- ===========================================================================
-- CONSISTENCY
-- "Days in the Word". One qualifying activity grants one active day; further
-- activity the same LOCAL day changes nothing.
-- ===========================================================================

create table public.consistency_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_date date not null,
  -- The zone used to derive the date, kept for auditability when a reader
  -- travels or changes their preference.
  timezone text not null default 'UTC',
  journeys_completed int not null default 1 check (journeys_completed >= 0),
  puzzles_completed int not null default 0 check (puzzles_completed >= 0),
  first_activity_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  primary key (user_id, activity_date)
);

create index consistency_days_user_idx on public.consistency_days (user_id, activity_date desc);

-- ===========================================================================
-- MILESTONES
-- Definitions are data, not code, so new milestones need no deploy.
-- ===========================================================================

create table public.milestone_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9]+(_[a-z0-9]+)*$'),
  category public.milestone_category not null,
  criteria public.milestone_criteria not null,
  -- Interpreted per criteria: a count, a number of days, a difficulty rank.
  threshold int not null default 1 check (threshold >= 1),
  -- Optional qualifier, e.g. 'expert' for difficulty_reached.
  qualifier text,
  icon text,
  display_order int not null default 0,
  is_active boolean not null default true,
  -- Hidden milestones are revealed only once earned.
  is_hidden boolean not null default false,
  is_repeatable boolean not null default false,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index milestone_definitions_active_idx
  on public.milestone_definitions (display_order) where is_active;

create trigger milestone_definitions_set_updated_at
  before update on public.milestone_definitions
  for each row execute function public.set_updated_at();

create table public.milestone_translations (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestone_definitions (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (milestone_id, language_code)
);

create trigger milestone_translations_set_updated_at
  before update on public.milestone_translations
  for each row execute function public.set_updated_at();

create table public.user_milestones (
  user_id uuid not null references auth.users (id) on delete cascade,
  milestone_id uuid not null references public.milestone_definitions (id) on delete cascade,
  earned_at timestamptz not null default now(),
  -- The definition version in force when earned, so later retuning of a
  -- threshold cannot rewrite history.
  milestone_version int not null default 1,
  source_event_type public.activity_event_type,
  source_entity_id uuid,
  -- Safe context only (counts, difficulty). Never private text.
  context jsonb not null default '{}'::jsonb,
  -- Cleared once shown, so a milestone is celebrated exactly once.
  seen_at timestamptz,
  created_at timestamptz not null default now(),

  -- The duplicate-award guarantee.
  primary key (user_id, milestone_id)
);

create index user_milestones_user_idx on public.user_milestones (user_id, earned_at desc);
create index user_milestones_unseen_idx on public.user_milestones (user_id) where seen_at is null;

-- ===========================================================================
-- ACTIVITY EVENTS
-- Append-only, idempotent record of what a reader did. Also serves as the
-- completion-event log, so no separate table is needed.
-- ===========================================================================

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.activity_event_type not null,
  entity_type text,
  entity_id uuid,
  -- Safe metadata ONLY. Reflection and prayer text must never appear here.
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  version int not null default 1,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  unique (user_id, idempotency_key)
);

create index activity_events_user_idx on public.activity_events (user_id, occurred_at desc);
create index activity_events_type_idx on public.activity_events (user_id, type, occurred_at desc);

-- ===========================================================================
-- COLLECTION PROGRESS
-- A cached aggregate. Recalculated by recalculate_collection_progress(), which
-- is the documented repair path if it ever drifts.
-- ===========================================================================

create table public.user_collection_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  journeys_completed int not null default 0 check (journeys_completed >= 0),
  journeys_available int not null default 0 check (journeys_available >= 0),
  completion_percent int not null default 0 check (completion_percent between 0 and 100),
  -- Set the first time the collection reached 100%. Deliberately NOT cleared
  -- when new journeys are added later: the achievement happened.
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, collection_id)
);

create index user_collection_progress_user_idx
  on public.user_collection_progress (user_id, last_activity_at desc);

create trigger user_collection_progress_set_updated_at
  before update on public.user_collection_progress
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- SERVER-AUTHORITATIVE PROGRESS TRIGGERS
-- ===========================================================================

/**
 * Recomputes a reader's progress for one collection from source rows.
 * Idempotent and safe to call at any time — this is the repair path.
 */
create or replace function public.recalculate_collection_progress(
  uid uuid,
  target_collection uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  available int;
  completed int;
  percent int;
begin
  if target_collection is null then return; end if;

  select count(*)::int into available
  from public.journeys j
  where j.primary_collection_id = target_collection
    and j.status = 'published'
    and j.archived_at is null;

  select count(*)::int into completed
  from public.journey_progress p
  join public.journeys j on j.id = p.journey_id
  where p.user_id = uid
    and j.primary_collection_id = target_collection
    and p.completion_count > 0
    and j.status = 'published'
    and j.archived_at is null;

  percent := case when available = 0 then 0
                  else least(100, round((completed::numeric / available) * 100)::int) end;

  insert into public.user_collection_progress as ucp
    (user_id, collection_id, journeys_completed, journeys_available,
     completion_percent, completed_at, last_activity_at)
  values
    (uid, target_collection, completed, available, percent,
     case when percent >= 100 then now() else null end, now())
  on conflict (user_id, collection_id) do update set
    journeys_completed = excluded.journeys_completed,
    journeys_available = excluded.journeys_available,
    completion_percent = excluded.completion_percent,
    -- Never cleared: reaching 100% once is a historical fact, even if new
    -- journeys are added to the collection afterwards.
    completed_at = coalesce(ucp.completed_at, excluded.completed_at),
    last_activity_at = now();
end;
$$;

/**
 * Records one active day in the reader's own time zone.
 * Repeat activity on the same local date updates counters but never creates a
 * second day — that is the whole point of the composite primary key.
 */
create or replace function public.record_active_day(
  uid uuid,
  moment timestamptz default now(),
  completed_journey boolean default true
)
returns date
language plpgsql
security definer
set search_path = public
as $$
declare
  local_date date;
  zone text;
begin
  select coalesce(nullif(timezone, ''), 'UTC') into zone
  from public.user_preferences where user_id = uid;
  zone := coalesce(zone, 'UTC');

  local_date := public.user_local_date(uid, moment);

  insert into public.consistency_days as cd
    (user_id, activity_date, timezone, journeys_completed, puzzles_completed,
     first_activity_at, last_activity_at)
  values
    (uid, local_date, zone,
     case when completed_journey then 1 else 0 end,
     case when completed_journey then 0 else 1 end,
     moment, moment)
  on conflict (user_id, activity_date) do update set
    journeys_completed = cd.journeys_completed + case when completed_journey then 1 else 0 end,
    puzzles_completed  = cd.puzzles_completed  + case when completed_journey then 0 else 1 end,
    last_activity_at = greatest(cd.last_activity_at, moment);

  return local_date;
end;
$$;

/**
 * Fires when a journey session is marked completed.
 *
 * Everything downstream of a completion happens here rather than in the client:
 * durable progress, the active day, collection progress and the completion
 * event. A client that never sends a follow-up request still gets correct data.
 */
create or replace function public.handle_journey_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  words_found int := 0;
begin
  if new.status <> 'completed' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'completed' then return new; end if;

  select coalesce(array_length(pp.found_words, 1), 0) into words_found
  from public.puzzle_progress pp
  where pp.user_id = new.user_id and pp.puzzle_instance_id = new.puzzle_instance_id;

  insert into public.journey_progress as jp
    (user_id, journey_id, collection_id, first_completed_at, last_completed_at,
     completion_count, best_duration_ms, total_words_found)
  values
    (new.user_id, new.journey_id, new.collection_id, now(), now(), 1,
     nullif(new.elapsed_ms, 0), coalesce(words_found, 0))
  on conflict (user_id, journey_id) do update set
    last_completed_at = now(),
    completion_count  = jp.completion_count + 1,
    best_duration_ms  = least(
                          coalesce(jp.best_duration_ms, nullif(new.elapsed_ms, 0)),
                          coalesce(nullif(new.elapsed_ms, 0), jp.best_duration_ms)
                        ),
    total_words_found = jp.total_words_found + coalesce(words_found, 0),
    -- Preserved: the first completion date never moves on a replay.
    first_completed_at = coalesce(jp.first_completed_at, now());

  perform public.record_active_day(new.user_id, now(), true);
  perform public.recalculate_collection_progress(new.user_id, new.collection_id);

  insert into public.activity_events
    (user_id, type, entity_type, entity_id, metadata, idempotency_key)
  values
    (new.user_id, 'journey_completed', 'journey', new.journey_id,
     jsonb_build_object(
       'sessionId', new.id,
       'elapsedMs', new.elapsed_ms,
       'isReplay', new.is_replay,
       'difficulty', new.difficulty,
       'languageCode', new.language_code
     ),
     'journey_completed:' || new.id::text)
  on conflict (user_id, idempotency_key) do nothing;

  return new;
end;
$$;

create trigger journey_sessions_handle_completion
  after insert or update of status on public.journey_sessions
  for each row execute function public.handle_journey_completion();

-- ===========================================================================
-- MILESTONE AWARDING
-- Server-side and idempotent. A client can never award itself a milestone:
-- user_milestones has no INSERT policy at all.
-- ===========================================================================

/**
 * Evaluates every active milestone for a reader and awards any newly earned.
 * Safe to call repeatedly — the composite primary key makes re-awards no-ops.
 */
create or replace function public.evaluate_milestones(
  uid uuid,
  trigger_event public.activity_event_type default null,
  source_entity uuid default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  definition record;
  actual int;
  awarded int := 0;
  longest_run int;
begin
  for definition in
    select * from public.milestone_definitions where is_active order by display_order
  loop
    actual := 0;

    case definition.criteria
      when 'first_occurrence', 'cumulative_count' then
        case definition.category
          when 'journey' then
            select coalesce(sum(completion_count), 0)::int into actual
            from public.journey_progress where user_id = uid;
          when 'puzzle' then
            select count(*)::int into actual
            from public.puzzle_sessions where user_id = uid and status = 'completed';
          when 'reflection' then
            select count(*)::int into actual
            from public.user_reflections where user_id = uid and deleted_at is null;
          when 'prayer' then
            select count(*)::int into actual
            from public.user_prayers
            where user_id = uid and deleted_at is null and (acknowledged or body is not null);
          when 'discovery' then
            -- Words found across every journey.
            select coalesce(sum(total_words_found), 0)::int into actual
            from public.journey_progress where user_id = uid;
          else actual := 0;
        end case;

      when 'consistency_days' then
        select count(*)::int into actual from public.consistency_days where user_id = uid;

      when 'collection_completed' then
        select count(*)::int into actual
        from public.user_collection_progress
        where user_id = uid and completed_at is not null;

      when 'difficulty_reached' then
        select count(*)::int into actual
        from public.journey_sessions
        where user_id = uid and status = 'completed'
          and difficulty::text = coalesce(definition.qualifier, 'expert');
    end case;

    if actual >= definition.threshold then
      insert into public.user_milestones
        (user_id, milestone_id, milestone_version, source_event_type, source_entity_id, context)
      values
        (uid, definition.id, definition.version, trigger_event, source_entity,
         jsonb_build_object('value', actual, 'threshold', definition.threshold))
      on conflict (user_id, milestone_id) do nothing;

      if found then awarded := awarded + 1; end if;
    end if;
  end loop;

  return awarded;
end;
$$;

-- Longest and current consistency runs, computed rather than stored so they can
-- never drift out of step with consistency_days.
create or replace function public.consistency_summary(uid uuid)
returns table (
  active_days int,
  current_run int,
  longest_run int,
  last_active date
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  today date;
begin
  today := public.user_local_date(uid, now());

  return query
  with days as (
    select activity_date,
           activity_date - (row_number() over (order by activity_date))::int as run_group
    from public.consistency_days
    where user_id = uid
  ),
  runs as (
    select run_group, count(*)::int as len, max(activity_date) as ends_on
    from days group by run_group
  )
  select
    (select count(*)::int from public.consistency_days where user_id = uid),
    coalesce((
      select len from runs
      -- A run counts as current when it reaches today or yesterday, so a reader
      -- who has not yet opened the app today is not told their run has ended.
      where ends_on >= today - 1
      order by ends_on desc limit 1
    ), 0),
    coalesce((select max(len) from runs), 0),
    (select max(activity_date) from public.consistency_days where user_id = uid);
end;
$$;

-- ===========================================================================
-- SEED: MILESTONE DEFINITIONS
-- Names deliberately describe an ACTION taken, never spiritual standing.
-- ===========================================================================

insert into public.milestone_definitions
  (key, category, criteria, threshold, qualifier, icon, display_order, is_hidden)
values
  ('first_journey',          'journey',     'first_occurrence',    1,   null,     'sparkles',  10, false),
  ('five_journeys',          'journey',     'cumulative_count',    5,   null,     'book-open', 20, false),
  ('twenty_five_journeys',   'journey',     'cumulative_count',    25,  null,     'book-open', 30, false),
  ('one_hundred_journeys',   'journey',     'cumulative_count',    100, null,     'book-open', 40, false),
  ('first_puzzle',           'puzzle',      'first_occurrence',    1,   null,     'grid',      50, false),
  ('first_expert_puzzle',    'puzzle',      'difficulty_reached',  1,   'expert', 'grid',      60, true),
  ('seven_active_days',      'consistency', 'consistency_days',    7,   null,     'calendar',  70, false),
  ('thirty_active_days',     'consistency', 'consistency_days',    30,  null,     'calendar',  80, false),
  ('one_hundred_active_days','consistency', 'consistency_days',    100, null,     'calendar',  90, false),
  ('first_collection',       'collection',  'collection_completed',1,   null,     'library',  100, false),
  ('first_reflection',       'reflection',  'first_occurrence',    1,   null,     'feather',  110, false),
  ('first_prayer',           'prayer',      'first_occurrence',    1,   null,     'heart',    120, false),
  ('one_hundred_words',      'discovery',   'cumulative_count',    100, null,     'search',   130, false),
  ('one_thousand_words',     'discovery',   'cumulative_count',    1000,null,     'search',   140, true)
on conflict (key) do nothing;

insert into public.milestone_translations (milestone_id, language_code, title, description)
select d.id, 'en', t.title, t.description
from public.milestone_definitions d
join (values
  ('first_journey', 'First Journey', 'You completed your first journey through Scripture.'),
  ('five_journeys', 'Five Journeys', 'You have completed five journeys.'),
  ('twenty_five_journeys', 'Twenty-Five Journeys', 'You have completed twenty-five journeys.'),
  ('one_hundred_journeys', 'One Hundred Journeys', 'You have completed one hundred journeys.'),
  ('first_puzzle', 'First Word Search', 'You completed your first word search.'),
  ('first_expert_puzzle', 'Expert Word Search', 'You completed a word search at expert difficulty.'),
  ('seven_active_days', 'Seven Days in the Word', 'You have spent seven days with Scripture.'),
  ('thirty_active_days', 'Thirty Days in the Word', 'You have spent thirty days with Scripture.'),
  ('one_hundred_active_days', 'One Hundred Days in the Word', 'You have spent one hundred days with Scripture.'),
  ('first_collection', 'First Collection', 'You completed every journey in a collection.'),
  ('first_reflection', 'First Reflection', 'You saved your first private reflection.'),
  ('first_prayer', 'First Prayer', 'You saved your first private prayer.'),
  ('one_hundred_words', 'One Hundred Words', 'You have found one hundred words.'),
  ('one_thousand_words', 'One Thousand Words', 'You have found one thousand words.')
) as t(key, title, description) on t.key = d.key
on conflict (milestone_id, language_code) do nothing;

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================

alter table public.journey_sessions enable row level security;
alter table public.journey_step_progress enable row level security;
alter table public.journey_progress enable row level security;
alter table public.user_reflections enable row level security;
alter table public.user_prayers enable row level security;
alter table public.favorites enable row level security;
alter table public.consistency_days enable row level security;
alter table public.milestone_definitions enable row level security;
alter table public.milestone_translations enable row level security;
alter table public.user_milestones enable row level security;
alter table public.activity_events enable row level security;
alter table public.user_collection_progress enable row level security;

-- --- Sessions and steps: owner-only ---------------------------------------

create policy "users read own journey sessions"
  on public.journey_sessions for select using (auth.uid() = user_id);
create policy "users create own journey sessions"
  on public.journey_sessions for insert with check (auth.uid() = user_id);
create policy "users update own journey sessions"
  on public.journey_sessions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own journey sessions"
  on public.journey_sessions for delete using (auth.uid() = user_id);

create policy "users read own step progress"
  on public.journey_step_progress for select using (auth.uid() = user_id);
-- Writing a step requires owning the SESSION too, so a forged session_id cannot
-- attach progress to someone else's journey.
create policy "users write own step progress"
  on public.journey_step_progress for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.journey_sessions s
      where s.id = journey_step_progress.session_id and s.user_id = auth.uid()
    )
  );
create policy "users update own step progress"
  on public.journey_step_progress for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users read own journey progress"
  on public.journey_progress for select using (auth.uid() = user_id);
-- No client write policies: journey_progress is maintained by trigger only.

-- --- Private responses: owner-only, no admin exception ---------------------
-- Deliberately absent: any policy granting content staff or support access.
-- Personal reflections and prayers are not administrable content.

create policy "users read own reflections"
  on public.user_reflections for select
  using (auth.uid() = user_id and deleted_at is null);
create policy "users create own reflections"
  on public.user_reflections for insert with check (auth.uid() = user_id);
create policy "users update own reflections"
  on public.user_reflections for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own reflections"
  on public.user_reflections for delete using (auth.uid() = user_id);

create policy "users read own prayers"
  on public.user_prayers for select
  using (auth.uid() = user_id and deleted_at is null);
create policy "users create own prayers"
  on public.user_prayers for insert with check (auth.uid() = user_id);
create policy "users update own prayers"
  on public.user_prayers for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own prayers"
  on public.user_prayers for delete using (auth.uid() = user_id);

-- --- Favorites -------------------------------------------------------------

create policy "users read own favorites"
  on public.favorites for select using (auth.uid() = user_id);
create policy "users add own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);
create policy "users remove own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- --- Consistency, milestones, events --------------------------------------

create policy "users read own consistency"
  on public.consistency_days for select using (auth.uid() = user_id);
-- No write policies: active days are recorded by record_active_day() only.

create policy "anyone reads active milestone definitions"
  on public.milestone_definitions for select
  using (is_active or public.has_role(auth.uid(), 'super_admin'));
create policy "super admins manage milestone definitions"
  on public.milestone_definitions for all
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "anyone reads milestone translations"
  on public.milestone_translations for select using (true);
create policy "super admins manage milestone translations"
  on public.milestone_translations for all
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "users read own milestones"
  on public.user_milestones for select using (auth.uid() = user_id);
-- Marking a milestone as seen is the ONLY client-writable field.
create policy "users mark own milestones seen"
  on public.user_milestones for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- No INSERT policy: a client can never award itself a milestone.

create policy "users read own activity events"
  on public.activity_events for select using (auth.uid() = user_id);
create policy "users append own activity events"
  on public.activity_events for insert with check (auth.uid() = user_id);
-- No update/delete: the activity log is append-only.

create policy "users read own collection progress"
  on public.user_collection_progress for select using (auth.uid() = user_id);
-- No client write policies: maintained by recalculate_collection_progress().
