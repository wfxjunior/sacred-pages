-- 0007_fix_daily_journey_audit.sql
-- Corrective migration. Non-destructive: replaces one function body, touches
-- no data, adds and drops nothing.
--
-- BUG (found by executing migrations 0001-0006 against PostgreSQL 17 for the
-- first time, then running supabase/tests/rls-content.test.sql):
--
--   log_content_audit() reads new.id / old.id, but daily_journeys is keyed by
--   (journey_date, language_code) and has no id column. Every insert, update
--   or delete on daily_journeys therefore aborted with
--
--       ERROR: record "new" has no field "id"
--
--   PL/pgSQL resolves field references at execution time, not at CREATE
--   FUNCTION time, which is why the trigger installed cleanly in 0004 and only
--   failed when a Daily Journey was actually assigned. Assigning a Daily
--   Journey is the single most routine editorial action in the product, so
--   this would have surfaced on day one of content operations.
--
-- FIX: resolve the audited entity through to_jsonb() instead of a hardcoded
-- field. Tables with an id keep logging it; daily_journeys falls back to
-- journey_id, which is the meaningful reference for that row anyway.
-- content_audit_logs.entity_id is nullable, so the final coalesce to NULL is
-- valid for any future table with neither column.
--
-- This is a corrective migration rather than an edit to 0004 because 0004 may
-- already have been applied to an environment not visible from here; replacing
-- the function is idempotent and safe either way.

create or replace function public.log_content_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  entity public.content_entity_type := tg_argv[0]::public.content_entity_type;
  action_name text;
  target_id uuid;
  record_json jsonb;
begin
  if tg_op = 'DELETE' then
    action_name := 'deleted';
    record_json := to_jsonb(old);
  else
    action_name := case when tg_op = 'INSERT' then 'created' else 'updated' end;
    record_json := to_jsonb(new);
  end if;

  -- Field-agnostic: works for id-keyed tables and for composite-keyed ones.
  target_id := nullif(
    coalesce(record_json ->> 'id', record_json ->> 'journey_id'),
    ''
  )::uuid;

  insert into public.content_audit_logs (actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), action_name, entity, target_id, format('%s %s', entity, action_name));

  return coalesce(new, old);
end;
$$;
