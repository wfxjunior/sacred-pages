create type public.puzzle_template_status as enum ('draft', 'active', 'archived');
create type public.generation_status as enum ('pending', 'running', 'succeeded', 'failed', 'cancelled');
create type public.puzzle_session_status as enum ('in_progress', 'paused', 'completed', 'abandoned');
create type public.puzzle_event_type as enum (
  'puzzle_started','puzzle_paused','puzzle_resumed','puzzle_completed',
  'word_found','hint_used','puzzle_reset','puzzle_regenerated'
);
create type public.hint_policy as enum ('none', 'limited', 'unlimited');

-- ============================ PUZZLE TEMPLATES ============================
create table public.puzzle_templates (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  difficulty public.difficulty_level not null,
  version int not null default 1 check (version >= 1),
  status public.puzzle_template_status not null default 'draft',
  min_grid_size int not null default 10 check (min_grid_size between 6 and 32),
  max_grid_size int not null default 16 check (max_grid_size between 6 and 32),
  target_word_count int not null default 8 check (target_word_count between 3 and 40),
  allowed_directions text[] not null default array['E', 'S', 'SE', 'NE'],
  allow_reversed boolean not null default false,
  allow_diagonal boolean not null default true,
  overlap_strategy text not null default 'allowed'
    check (overlap_strategy in ('none', 'allowed', 'encouraged')),
  seed_strategy text not null default 'per_journey'
    check (seed_strategy in ('per_journey', 'per_user', 'per_day')),
  max_attempts int not null default 200 check (max_attempts between 10 and 5000),
  filler_strategy text not null default 'weighted'
    check (filler_strategy in ('uniform', 'weighted', 'word_letters')),
  custom_alphabet text check (custom_alphabet is null or char_length(custom_alphabet) between 10 and 64),
  hint_policy public.hint_policy not null default 'limited',
  max_hints int not null default 3 check (max_hints >= 0),
  full_solution_enabled boolean not null default true,
  expected_duration_seconds int check (expected_duration_seconds is null or expected_duration_seconds > 0),
  min_engine_version text not null default '0.0.0',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_id, language_code, difficulty, version),
  constraint puzzle_templates_grid_range check (max_grid_size >= min_grid_size),
  constraint puzzle_templates_directions_valid check (
    allowed_directions <@ array['E','W','N','S','NE','NW','SE','SW']::text[]
    and array_length(allowed_directions, 1) >= 1
  ),
  constraint puzzle_templates_archived_state check ((archived_at is null) or status = 'archived')
);

create unique index puzzle_templates_one_active_idx
  on public.puzzle_templates (journey_id, language_code, difficulty)
  where status = 'active';
create index puzzle_templates_journey_idx on public.puzzle_templates (journey_id, language_code, difficulty);
create index puzzle_templates_status_idx on public.puzzle_templates (status);

create trigger puzzle_templates_set_updated_at
  before update on public.puzzle_templates
  for each row execute function public.set_updated_at();
create trigger puzzle_templates_set_audit_user
  before insert or update on public.puzzle_templates
  for each row execute function public.set_audit_user();

insert into public.puzzle_templates (
  journey_id, language_code, difficulty, version, status,
  min_grid_size, max_grid_size, target_word_count,
  allowed_directions, allow_reversed, allow_diagonal, overlap_strategy,
  seed_strategy, filler_strategy, custom_alphabet,
  full_solution_enabled, hint_policy, expected_duration_seconds
)
select
  s.journey_id, j.primary_language_code, s.default_difficulty, 1,
  case when j.status = 'published' then 'active' else 'draft' end::public.puzzle_template_status,
  s.min_grid_size, s.max_grid_size, s.target_word_count,
  s.allowed_directions, s.allow_reversed, s.allow_diagonal, s.overlap_preference,
  s.seed_strategy, s.filler_strategy, s.custom_alphabet,
  s.full_solution_enabled,
  case when s.hints_enabled then 'limited' else 'none' end::public.hint_policy,
  s.estimated_completion_seconds
from public.journey_puzzle_settings s
join public.journeys j on j.id = s.journey_id
on conflict do nothing;

drop table if exists public.journey_puzzle_settings;

-- ============================ PUZZLE INSTANCES ============================
create table public.puzzle_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.puzzle_templates (id) on delete restrict,
  template_version int not null,
  seed bigint not null,
  language_code text not null references public.languages (code) on delete restrict,
  difficulty public.difficulty_level not null,
  grid_size int not null check (grid_size between 6 and 32),
  grid_rows text[] not null,
  normalized_grid_rows text[] not null,
  placements jsonb not null default '[]'::jsonb,
  unplaced_words jsonb not null default '[]'::jsonb,
  engine_version text not null,
  generation_metadata jsonb not null default '{}'::jsonb,
  content_hash text not null,
  created_at timestamptz not null default now(),
  constraint puzzle_instances_grid_shape check (
    array_length(grid_rows, 1) = grid_size
    and array_length(normalized_grid_rows, 1) = grid_size
  ),
  unique (template_id, template_version, seed, engine_version)
);

create index puzzle_instances_template_idx on public.puzzle_instances (template_id);
create index puzzle_instances_lookup_idx on public.puzzle_instances (template_id, language_code, difficulty);

-- ======================== GENERATION REQUESTS =============================
create table public.puzzle_generation_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references auth.users (id) on delete set null,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  template_id uuid references public.puzzle_templates (id) on delete set null,
  language_code text not null references public.languages (code) on delete restrict,
  difficulty public.difficulty_level not null,
  seed bigint,
  engine_version text not null,
  status public.generation_status not null default 'pending',
  result_instance_id uuid references public.puzzle_instances (id) on delete set null,
  duration_ms int check (duration_ms is null or duration_ms >= 0),
  error_code text,
  error_detail text,
  attempt_count int not null default 0,
  idempotency_key text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint generation_requests_terminal_state check (
    (status in ('succeeded', 'failed', 'cancelled')) = (completed_at is not null)
  ),
  constraint generation_requests_success_has_result check (
    status <> 'succeeded' or result_instance_id is not null
  )
);

create unique index generation_requests_idempotency_idx
  on public.puzzle_generation_requests (idempotency_key) where idempotency_key is not null;
create index generation_requests_status_idx
  on public.puzzle_generation_requests (status, created_at) where status in ('pending', 'running');
create index generation_requests_journey_idx
  on public.puzzle_generation_requests (journey_id, created_at desc);

-- ============================ SESSIONS ====================================
create table public.puzzle_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_instance_id uuid not null references public.puzzle_instances (id) on delete cascade,
  journey_id uuid not null references public.journeys (id) on delete cascade,
  status public.puzzle_session_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  elapsed_ms int not null default 0 check (elapsed_ms >= 0),
  completion_percent int not null default 0 check (completion_percent between 0 and 100),
  hints_used int not null default 0 check (hints_used >= 0),
  revealed_solution boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint puzzle_sessions_completed_state check ((status = 'completed') = (completed_at is not null)),
  constraint puzzle_sessions_paused_state check (status <> 'paused' or paused_at is not null)
);

create unique index puzzle_sessions_one_active_idx
  on public.puzzle_sessions (user_id, puzzle_instance_id)
  where status in ('in_progress', 'paused');
create index puzzle_sessions_user_idx on public.puzzle_sessions (user_id, started_at desc);
create index puzzle_sessions_instance_idx on public.puzzle_sessions (puzzle_instance_id);

create trigger puzzle_sessions_set_updated_at
  before update on public.puzzle_sessions
  for each row execute function public.set_updated_at();

-- ============================ PROGRESS ====================================
create table public.puzzle_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_instance_id uuid not null references public.puzzle_instances (id) on delete cascade,
  found_words text[] not null default '{}',
  completion_percent int not null default 0 check (completion_percent between 0 and 100),
  attempts_count int not null default 0 check (attempts_count >= 0),
  best_time_ms int check (best_time_ms is null or best_time_ms > 0),
  first_completed_at timestamptz,
  last_played_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, puzzle_instance_id)
);

create index puzzle_progress_user_idx on public.puzzle_progress (user_id, last_played_at desc);

create trigger puzzle_progress_set_updated_at
  before update on public.puzzle_progress
  for each row execute function public.set_updated_at();

-- ============================ EVENTS / ATTEMPTS ===========================
create table public.puzzle_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.puzzle_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type public.puzzle_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (session_id, idempotency_key)
);

create index puzzle_events_session_idx on public.puzzle_events (session_id, occurred_at);
create index puzzle_events_user_idx on public.puzzle_events (user_id, occurred_at desc);

create table public.puzzle_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.puzzle_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  start_row int not null check (start_row >= 0),
  start_col int not null check (start_col >= 0),
  end_row int not null check (end_row >= 0),
  end_col int not null check (end_col >= 0),
  selected_text text,
  matched_word text,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index puzzle_attempts_session_idx on public.puzzle_attempts (session_id, created_at);

-- ============================ STATISTICS ==================================
create table public.puzzle_statistics (
  puzzle_instance_id uuid primary key references public.puzzle_instances (id) on delete cascade,
  total_sessions int not null default 0 check (total_sessions >= 0),
  completed_sessions int not null default 0 check (completed_sessions >= 0),
  abandoned_sessions int not null default 0 check (abandoned_sessions >= 0),
  total_hints_used int not null default 0 check (total_hints_used >= 0),
  solution_reveals int not null default 0 check (solution_reveals >= 0),
  avg_completion_ms int check (avg_completion_ms is null or avg_completion_ms >= 0),
  fastest_completion_ms int check (fastest_completion_ms is null or fastest_completion_ms > 0),
  updated_at timestamptz not null default now(),
  constraint puzzle_statistics_completed_lte_total check (completed_sessions <= total_sessions)
);

-- ============================ TRIGGERS ====================================
create or replace function public.enforce_template_immutability()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.puzzle_instances where template_id = old.id) then
    return new;
  end if;

  if (new.min_grid_size, new.max_grid_size, new.target_word_count,
      new.allowed_directions, new.allow_reversed, new.allow_diagonal,
      new.overlap_strategy, new.seed_strategy, new.max_attempts,
      new.filler_strategy, new.custom_alphabet, new.version)
     is distinct from
     (old.min_grid_size, old.max_grid_size, old.target_word_count,
      old.allowed_directions, old.allow_reversed, old.allow_diagonal,
      old.overlap_strategy, old.seed_strategy, old.max_attempts,
      old.filler_strategy, old.custom_alphabet, old.version)
  then
    raise exception
      'template % has generated puzzles and its generation rules are frozen; create a new version instead',
      old.id using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger puzzle_templates_enforce_immutability
  before update on public.puzzle_templates
  for each row execute function public.enforce_template_immutability();

create or replace function public.refresh_puzzle_statistics()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target uuid := coalesce(new.puzzle_instance_id, old.puzzle_instance_id);
begin
  insert into public.puzzle_statistics (puzzle_instance_id) values (target)
  on conflict (puzzle_instance_id) do nothing;

  update public.puzzle_statistics s set
    total_sessions      = agg.total,
    completed_sessions  = agg.completed,
    abandoned_sessions  = agg.abandoned,
    total_hints_used    = agg.hints,
    solution_reveals    = agg.reveals,
    avg_completion_ms   = agg.avg_ms,
    fastest_completion_ms = agg.min_ms,
    updated_at          = now()
  from (
    select
      count(*)::int as total,
      count(*) filter (where status = 'completed')::int as completed,
      count(*) filter (where status = 'abandoned')::int as abandoned,
      coalesce(sum(hints_used), 0)::int as hints,
      count(*) filter (where revealed_solution)::int as reveals,
      avg(elapsed_ms) filter (where status = 'completed')::int as avg_ms,
      min(elapsed_ms) filter (where status = 'completed' and elapsed_ms > 0)::int as min_ms
    from public.puzzle_sessions
    where puzzle_instance_id = target
  ) agg
  where s.puzzle_instance_id = target;

  return coalesce(new, old);
end;
$$;

create trigger puzzle_sessions_refresh_statistics
  after insert or update or delete on public.puzzle_sessions
  for each row execute function public.refresh_puzzle_statistics();

create or replace function public.sync_puzzle_progress()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'completed' or (tg_op = 'UPDATE' and old.status = 'completed') then
    return new;
  end if;

  insert into public.puzzle_progress as p
    (user_id, puzzle_instance_id, completion_percent, attempts_count,
     best_time_ms, first_completed_at, last_played_at)
  values
    (new.user_id, new.puzzle_instance_id, 100, 1,
     nullif(new.elapsed_ms, 0), now(), now())
  on conflict (user_id, puzzle_instance_id) do update set
    completion_percent = 100,
    attempts_count     = p.attempts_count + 1,
    best_time_ms       = least(
                           coalesce(p.best_time_ms, nullif(new.elapsed_ms, 0)),
                           coalesce(nullif(new.elapsed_ms, 0), p.best_time_ms)
                         ),
    first_completed_at = coalesce(p.first_completed_at, now()),
    last_played_at     = now();

  return new;
end;
$$;

create trigger puzzle_sessions_sync_progress
  after insert or update of status on public.puzzle_sessions
  for each row execute function public.sync_puzzle_progress();

-- ============================ GRANTS ======================================
grant select on public.puzzle_templates to anon, authenticated;
grant insert, update, delete on public.puzzle_templates to authenticated;
grant select on public.puzzle_instances to anon, authenticated;
grant insert on public.puzzle_instances to authenticated;
grant select, insert, update on public.puzzle_generation_requests to authenticated;
grant select, insert, update, delete on public.puzzle_sessions to authenticated;
grant select, insert, update on public.puzzle_progress to authenticated;
grant select, insert on public.puzzle_events to authenticated;
grant select, insert on public.puzzle_attempts to authenticated;
grant select on public.puzzle_statistics to anon, authenticated;

grant all on public.puzzle_templates, public.puzzle_instances,
  public.puzzle_generation_requests, public.puzzle_sessions, public.puzzle_progress,
  public.puzzle_events, public.puzzle_attempts, public.puzzle_statistics
  to service_role;

-- ============================ RLS =========================================
alter table public.puzzle_templates enable row level security;
alter table public.puzzle_instances enable row level security;
alter table public.puzzle_generation_requests enable row level security;
alter table public.puzzle_sessions enable row level security;
alter table public.puzzle_progress enable row level security;
alter table public.puzzle_events enable row level security;
alter table public.puzzle_attempts enable row level security;
alter table public.puzzle_statistics enable row level security;

create policy "public reads active templates"
  on public.puzzle_templates for select
  using (
    public.is_content_staff(auth.uid())
    or (
      status = 'active'
      and exists (
        select 1 from public.journeys j
        where j.id = puzzle_templates.journey_id and public.journey_is_public(j)
      )
    )
  );

create policy "editors manage templates"
  on public.puzzle_templates for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "public reads instances of published journeys"
  on public.puzzle_instances for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1
      from public.puzzle_templates t
      join public.journeys j on j.id = t.journey_id
      where t.id = puzzle_instances.template_id and public.journey_is_public(j)
    )
  );

create policy "editors create instances"
  on public.puzzle_instances for insert to authenticated
  with check (public.can_edit_content(auth.uid()));

create policy "staff read generation requests"
  on public.puzzle_generation_requests for select to authenticated
  using (public.is_content_staff(auth.uid()) or requested_by = auth.uid());

create policy "editors create generation requests"
  on public.puzzle_generation_requests for insert to authenticated
  with check (public.can_edit_content(auth.uid()) and requested_by = auth.uid());

create policy "editors update own generation requests"
  on public.puzzle_generation_requests for update to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "users read own sessions"
  on public.puzzle_sessions for select to authenticated using (auth.uid() = user_id);
create policy "users create own sessions"
  on public.puzzle_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own sessions"
  on public.puzzle_sessions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own sessions"
  on public.puzzle_sessions for delete to authenticated using (auth.uid() = user_id);

create policy "users read own progress"
  on public.puzzle_progress for select to authenticated using (auth.uid() = user_id);
create policy "users create own progress"
  on public.puzzle_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own progress"
  on public.puzzle_progress for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users read own events"
  on public.puzzle_events for select to authenticated using (auth.uid() = user_id);
create policy "users append own events"
  on public.puzzle_events for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.puzzle_sessions s
      where s.id = puzzle_events.session_id and s.user_id = auth.uid()
    )
  );

create policy "users read own attempts"
  on public.puzzle_attempts for select to authenticated using (auth.uid() = user_id);
create policy "users append own attempts"
  on public.puzzle_attempts for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.puzzle_sessions s
      where s.id = puzzle_attempts.session_id and s.user_id = auth.uid()
    )
  );

create policy "anyone reads puzzle statistics"
  on public.puzzle_statistics for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1
      from public.puzzle_instances i
      join public.puzzle_templates t on t.id = i.template_id
      join public.journeys j on j.id = t.journey_id
      where i.id = puzzle_statistics.puzzle_instance_id and public.journey_is_public(j)
    )
  );