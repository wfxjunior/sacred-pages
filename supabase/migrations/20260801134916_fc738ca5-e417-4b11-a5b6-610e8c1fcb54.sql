-- 1. Revoke direct API access to internal-only SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.record_active_day(uuid, timestamptz, boolean) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_collection_progress(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_local_date(uuid, timestamptz) FROM anon, authenticated;

-- 2. Self-scope the user-callable SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.consistency_summary(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.evaluate_milestones(uuid, public.activity_event_type, uuid) FROM anon;

CREATE OR REPLACE FUNCTION public.consistency_summary(uid uuid)
 RETURNS TABLE(active_days integer, current_run integer, longest_run integer, last_active date)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  today date;
begin
  if not public.is_service_context() and uid is distinct from auth.uid() then
    raise exception 'not authorized' using errcode = 'insufficient_privilege';
  end if;

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
      select len from runs where ends_on >= today - 1 order by ends_on desc limit 1
    ), 0),
    coalesce((select max(len) from runs), 0),
    (select max(activity_date) from public.consistency_days where user_id = uid);
end;
$function$;

CREATE OR REPLACE FUNCTION public.evaluate_milestones(uid uuid, trigger_event activity_event_type DEFAULT NULL::activity_event_type, source_entity uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  definition record;
  actual int;
  awarded int := 0;
begin
  if not public.is_service_context() and uid is distinct from auth.uid() then
    raise exception 'not authorized' using errcode = 'insufficient_privilege';
  end if;

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
$function$;

-- 3. Daily journeys: only expose schedule rows whose journey is actually public
DROP POLICY IF EXISTS "public reads current daily journey" ON public.daily_journeys;
CREATE POLICY "public reads current daily journey"
ON public.daily_journeys
FOR SELECT
USING (
  journey_date <= CURRENT_DATE
  AND EXISTS (
    SELECT 1 FROM public.journeys j
    WHERE j.id = daily_journeys.journey_id
      AND j.status = 'published'
      AND j.archived_at IS NULL
      AND (j.published_at IS NULL OR j.published_at <= now())
      AND j.access_level IN ('free', 'premium')
  )
);