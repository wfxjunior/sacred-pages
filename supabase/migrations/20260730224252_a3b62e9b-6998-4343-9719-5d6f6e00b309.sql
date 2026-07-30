-- Public read policies must not call staff-check functions: EXECUTE on those
-- functions is (correctly) revoked from anon, so PostgREST returns 401 for
-- every anonymous read. Split each policy: a role-free public predicate plus a
-- staff predicate restricted to authenticated users.

drop policy if exists "public reads current daily journey" on public.daily_journeys;
create policy "public reads current daily journey"
  on public.daily_journeys for select
  using (journey_date <= current_date);
create policy "staff reads all daily journeys"
  on public.daily_journeys for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "anyone reads active tags" on public.content_tags;
create policy "anyone reads active tags"
  on public.content_tags for select
  using (is_active);
create policy "staff reads all tags"
  on public.content_tags for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "public reads journey tags" on public.journey_tags;
create policy "public reads journey tags"
  on public.journey_tags for select
  using (exists (
    select 1 from public.journeys j
    where j.id = journey_tags.journey_id and public.journey_is_public(j.*)
  ));
create policy "staff reads all journey tags"
  on public.journey_tags for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "public reads collection tags" on public.collection_tags;
create policy "public reads collection tags"
  on public.collection_tags for select
  using (exists (
    select 1 from public.collections c
    where c.id = collection_tags.collection_id and public.collection_is_public(c.*)
  ));
create policy "staff reads all collection tags"
  on public.collection_tags for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "public reads active templates" on public.puzzle_templates;
create policy "public reads active templates"
  on public.puzzle_templates for select
  using (
    status = 'active'::public.puzzle_template_status
    and exists (
      select 1 from public.journeys j
      where j.id = puzzle_templates.journey_id and public.journey_is_public(j.*)
    )
  );
create policy "staff reads all templates"
  on public.puzzle_templates for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "public reads instances of published journeys" on public.puzzle_instances;
create policy "public reads instances of published journeys"
  on public.puzzle_instances for select
  using (exists (
    select 1 from public.puzzle_templates t
    join public.journeys j on j.id = t.journey_id
    where t.id = puzzle_instances.template_id and public.journey_is_public(j.*)
  ));
create policy "staff reads all instances"
  on public.puzzle_instances for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "anyone reads puzzle statistics" on public.puzzle_statistics;
create policy "anyone reads puzzle statistics"
  on public.puzzle_statistics for select
  using (exists (
    select 1 from public.puzzle_instances i
    join public.puzzle_templates t on t.id = i.template_id
    join public.journeys j on j.id = t.journey_id
    where i.id = puzzle_statistics.puzzle_instance_id and public.journey_is_public(j.*)
  ));
create policy "staff reads all puzzle statistics"
  on public.puzzle_statistics for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "anyone reads active milestone definitions" on public.milestone_definitions;
create policy "anyone reads active milestone definitions"
  on public.milestone_definitions for select
  using (is_active);
create policy "admins read all milestone definitions"
  on public.milestone_definitions for select to authenticated
  using (public.has_role(auth.uid(), 'super_admin'::public.app_role));