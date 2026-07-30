-- ===========================================================================
-- MISSING CONTENT TABLES (from 0003)
-- ===========================================================================

create table if not exists public.content_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind text not null default 'topic' check (kind in ('topic', 'audience', 'season', 'book')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists content_tags_set_updated_at on public.content_tags;
create trigger content_tags_set_updated_at
  before update on public.content_tags
  for each row execute function public.set_updated_at();

create table if not exists public.content_tag_translations (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.content_tags (id) on delete cascade,
  language_code text not null references public.languages (code) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tag_id, language_code)
);

drop trigger if exists content_tag_translations_set_updated_at on public.content_tag_translations;
create trigger content_tag_translations_set_updated_at
  before update on public.content_tag_translations
  for each row execute function public.set_updated_at();

create table if not exists public.journey_tags (
  journey_id uuid not null references public.journeys (id) on delete cascade,
  tag_id uuid not null references public.content_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (journey_id, tag_id)
);

create index if not exists journey_tags_tag_idx on public.journey_tags (tag_id);

create table if not exists public.collection_tags (
  collection_id uuid not null references public.collections (id) on delete cascade,
  tag_id uuid not null references public.content_tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, tag_id)
);

create index if not exists collection_tags_tag_idx on public.collection_tags (tag_id);

create table if not exists public.daily_journeys (
  journey_date date not null,
  language_code text not null references public.languages (code) on delete restrict,
  journey_id uuid not null references public.journeys (id) on delete restrict,
  is_fallback boolean not null default false,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (journey_date, language_code)
);

create index if not exists daily_journeys_journey_idx on public.daily_journeys (journey_id);
create index if not exists daily_journeys_upcoming_idx on public.daily_journeys (journey_date desc);

drop trigger if exists daily_journeys_set_updated_at on public.daily_journeys;
create trigger daily_journeys_set_updated_at
  before update on public.daily_journeys
  for each row execute function public.set_updated_at();

drop trigger if exists daily_journeys_set_audit_user on public.daily_journeys;
create trigger daily_journeys_set_audit_user
  before insert or update on public.daily_journeys
  for each row execute function public.set_audit_user();

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  version int not null check (version >= 1),
  snapshot jsonb not null,
  change_summary text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, version)
);

create index if not exists content_versions_entity_idx
  on public.content_versions (entity_type, entity_id, version desc);

create table if not exists public.content_review_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  decision public.review_decision not null,
  notes text,
  previous_status public.content_status,
  new_status public.content_status,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_review_logs_entity_idx
  on public.content_review_logs (entity_type, entity_id, created_at desc);

create table if not exists public.content_status_history (
  id uuid primary key default gen_random_uuid(),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  previous_status public.content_status,
  new_status public.content_status not null,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_status_history_entity_idx
  on public.content_status_history (entity_type, entity_id, created_at desc);

create table if not exists public.content_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type public.content_entity_type not null,
  entity_id uuid,
  summary text,
  previous_status public.content_status,
  new_status public.content_status,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_audit_logs_entity_idx
  on public.content_audit_logs (entity_type, entity_id, created_at desc);
create index if not exists content_audit_logs_actor_idx on public.content_audit_logs (actor_id, created_at desc);

create table if not exists public.content_preview_tokens (
  id uuid primary key default gen_random_uuid(),
  token text not null unique check (char_length(token) >= 32),
  entity_type public.content_entity_type not null,
  entity_id uuid not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_preview_tokens_entity_idx
  on public.content_preview_tokens (entity_type, entity_id);

-- ===========================================================================
-- AUTHORIZATION HELPERS (from 0004)
-- ===========================================================================

create or replace function public.can_edit_content(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(uid, 'content_editor') or public.has_role(uid, 'super_admin');
$$;

create or replace function public.can_review_content(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(uid, 'content_reviewer') or public.has_role(uid, 'super_admin');
$$;

create or replace function public.can_publish_content(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(uid, 'publication_admin') or public.has_role(uid, 'super_admin');
$$;

create or replace function public.is_service_context()
returns boolean language plpgsql stable set search_path = public as $$
declare
  claims jsonb;
begin
  begin
    claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  exception when others then
    return false;
  end;
  return coalesce(claims ->> 'role', '') = 'service_role';
end;
$$;

create or replace function public.collection_is_public(c public.collections)
returns boolean language sql stable set search_path = public as $$
  select c.status = 'published'
     and c.archived_at is null
     and (c.published_at is null or c.published_at <= now())
     and c.access_level in ('free', 'premium');
$$;

create or replace function public.journey_is_public(j public.journeys)
returns boolean language sql stable set search_path = public as $$
  select j.status = 'published'
     and j.archived_at is null
     and (j.published_at is null or j.published_at <= now())
     and j.access_level in ('free', 'premium');
$$;

revoke execute on function public.can_edit_content(uuid) from public;
revoke execute on function public.can_review_content(uuid) from public;
revoke execute on function public.can_publish_content(uuid) from public;
grant execute on function public.can_edit_content(uuid) to authenticated, service_role;
grant execute on function public.can_review_content(uuid) to authenticated, service_role;
grant execute on function public.can_publish_content(uuid) to authenticated, service_role;

-- ===========================================================================
-- DATA-INTEGRITY TRIGGERS
-- ===========================================================================

create or replace function public.sync_word_translation_journey_id()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select w.journey_id into new.journey_id
  from public.journey_words w
  where w.id = new.journey_word_id;

  if new.journey_id is null then
    raise exception 'journey_word % does not exist', new.journey_word_id
      using errcode = 'foreign_key_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists journey_word_translations_sync_journey on public.journey_word_translations;
create trigger journey_word_translations_sync_journey
  before insert or update of journey_word_id on public.journey_word_translations
  for each row execute function public.sync_word_translation_journey_id();

create or replace function public.enforce_scripture_text_storage()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  permitted boolean;
begin
  if new.stored_text is null or new.stored_text = '' then
    return new;
  end if;

  select allows_text_storage into permitted
  from public.scripture_sources
  where id = new.source_id;

  if not coalesce(permitted, false) then
    raise exception
      'scripture source % does not permit storing verse text (licensing)', new.source_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists scripture_references_enforce_storage on public.scripture_references;
create trigger scripture_references_enforce_storage
  before insert or update on public.scripture_references
  for each row execute function public.enforce_scripture_text_storage();

create or replace function public.enforce_daily_journey_target()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_status public.content_status;
  eligible boolean;
begin
  select status, daily_eligible into target_status, eligible
  from public.journeys where id = new.journey_id;

  if target_status is null then
    raise exception 'journey % does not exist', new.journey_id
      using errcode = 'foreign_key_violation';
  end if;

  if target_status not in ('approved', 'scheduled', 'published') then
    raise exception
      'journey % must be approved, scheduled or published to be a Daily Journey (is %)',
      new.journey_id, target_status
      using errcode = 'check_violation';
  end if;

  if not coalesce(eligible, false) then
    raise exception 'journey % is not marked daily_eligible', new.journey_id
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists daily_journeys_enforce_target on public.daily_journeys;
create trigger daily_journeys_enforce_target
  before insert or update on public.daily_journeys
  for each row execute function public.enforce_daily_journey_target();

-- ===========================================================================
-- STATUS TRANSITION ENGINE
-- ===========================================================================

create or replace function public.is_valid_status_transition(
  from_status public.content_status,
  to_status public.content_status
)
returns boolean language sql immutable set search_path = public as $$
  select (from_status, to_status) in (
    ('draft', 'in_review'),
    ('draft', 'archived'),
    ('in_review', 'approved'),
    ('in_review', 'changes_requested'),
    ('in_review', 'draft'),
    ('changes_requested', 'draft'),
    ('changes_requested', 'in_review'),
    ('approved', 'scheduled'),
    ('approved', 'published'),
    ('approved', 'draft'),
    ('scheduled', 'published'),
    ('scheduled', 'approved'),
    ('scheduled', 'draft'),
    ('published', 'unpublished'),
    ('unpublished', 'published'),
    ('unpublished', 'draft'),
    ('unpublished', 'archived'),
    ('archived', 'draft')
  );
$$;

create or replace function public.enforce_content_workflow()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  service boolean := public.is_service_context();
  entity public.content_entity_type := tg_argv[0]::public.content_entity_type;
begin
  if new.status = old.status then
    return new;
  end if;

  if not public.is_valid_status_transition(old.status, new.status) then
    raise exception 'invalid content status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if not service then
    if uid is null then
      raise exception 'authentication required to change content status'
        using errcode = 'insufficient_privilege';
    end if;

    case new.status
      when 'in_review' then
        if not (public.can_edit_content(uid) or public.can_review_content(uid)
                or public.can_publish_content(uid)) then
          raise exception 'only content staff may submit content for review'
            using errcode = 'insufficient_privilege';
        end if;

      when 'approved', 'changes_requested' then
        if not public.can_review_content(uid) then
          raise exception 'only reviewers may approve or request changes'
            using errcode = 'insufficient_privilege';
        end if;
        if new.status = 'approved'
           and not public.has_role(uid, 'super_admin')
           and uid is not distinct from old.created_by then
          raise exception 'self-approval is not allowed; another reviewer must approve'
            using errcode = 'insufficient_privilege';
        end if;

      when 'scheduled', 'published', 'unpublished', 'archived' then
        if not public.can_publish_content(uid) then
          raise exception 'only publication admins may schedule, publish, unpublish or archive'
            using errcode = 'insufficient_privilege';
        end if;

      when 'draft' then
        if not (public.can_edit_content(uid) or public.can_review_content(uid)
                or public.can_publish_content(uid)) then
          raise exception 'only content staff may return content to draft'
            using errcode = 'insufficient_privilege';
        end if;
        if old.status = 'archived' and not public.has_role(uid, 'super_admin') then
          raise exception 'only a super admin may restore archived content'
            using errcode = 'insufficient_privilege';
        end if;
      else
        null;
    end case;
  end if;

  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if new.status = 'archived' and new.archived_at is null then
    new.archived_at := now();
  end if;
  if new.status <> 'archived' then
    new.archived_at := null;
  end if;

  insert into public.content_status_history
    (entity_type, entity_id, previous_status, new_status, actor_id)
  values (entity, new.id, old.status, new.status, uid);

  insert into public.content_audit_logs
    (actor_id, action, entity_type, entity_id, summary, previous_status, new_status)
  values (uid, 'status_changed', entity, new.id,
          format('%s: %s -> %s', entity, old.status, new.status), old.status, new.status);

  return new;
end;
$$;

drop trigger if exists collections_enforce_workflow on public.collections;
create trigger collections_enforce_workflow
  before update of status on public.collections
  for each row execute function public.enforce_content_workflow('collection');

drop trigger if exists journeys_enforce_workflow on public.journeys;
create trigger journeys_enforce_workflow
  before update of status on public.journeys
  for each row execute function public.enforce_content_workflow('journey');

-- ===========================================================================
-- VERSIONING
-- ===========================================================================

create or replace function public.snapshot_journey_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.internal_title is not distinct from new.internal_title
     and old.slug is not distinct from new.slug
     and old.access_level is not distinct from new.access_level
     and old.difficulty is not distinct from new.difficulty
     and old.status is not distinct from new.status
     and old.primary_collection_id is not distinct from new.primary_collection_id then
    return new;
  end if;

  insert into public.content_versions
    (entity_type, entity_id, version, snapshot, change_summary, created_by)
  values (
    'journey', old.id, old.current_version,
    to_jsonb(old) - 'created_at' - 'updated_at',
    format('Journey updated (v%s -> v%s)', old.current_version, old.current_version + 1),
    auth.uid()
  );

  new.current_version := old.current_version + 1;
  return new;
end;
$$;

drop trigger if exists journeys_snapshot_version on public.journeys;
create trigger journeys_snapshot_version
  before update on public.journeys
  for each row execute function public.snapshot_journey_version();

create or replace function public.snapshot_journey_translation_version()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  next_version int;
begin
  if old.public_title is not distinct from new.public_title
     and old.devotional_body is not distinct from new.devotional_body
     and old.reflection_prompt is not distinct from new.reflection_prompt
     and old.prayer_body is not distinct from new.prayer_body
     and old.status is not distinct from new.status then
    return new;
  end if;

  select coalesce(max(version), 0) + 1 into next_version
  from public.content_versions
  where entity_type = 'journey_translation' and entity_id = old.id;

  insert into public.content_versions
    (entity_type, entity_id, version, snapshot, change_summary, created_by)
  values (
    'journey_translation', old.id, next_version,
    to_jsonb(old) - 'created_at' - 'updated_at',
    format('Translation (%s) updated', old.language_code),
    auth.uid()
  );
  return new;
end;
$$;

drop trigger if exists journey_translations_snapshot_version on public.journey_translations;
create trigger journey_translations_snapshot_version
  before update on public.journey_translations
  for each row execute function public.snapshot_journey_translation_version();

-- ===========================================================================
-- GENERIC AUDIT LOGGING (includes the 0007 composite-key fix)
-- ===========================================================================

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

  target_id := nullif(
    coalesce(record_json ->> 'id', record_json ->> 'journey_id'),
    ''
  )::uuid;

  insert into public.content_audit_logs (actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), action_name, entity, target_id, format('%s %s', entity, action_name));

  return coalesce(new, old);
end;
$$;

drop trigger if exists collections_audit on public.collections;
create trigger collections_audit
  after insert or delete on public.collections
  for each row execute function public.log_content_audit('collection');

drop trigger if exists journeys_audit on public.journeys;
create trigger journeys_audit
  after insert or delete on public.journeys
  for each row execute function public.log_content_audit('journey');

drop trigger if exists journey_translations_audit on public.journey_translations;
create trigger journey_translations_audit
  after insert or delete on public.journey_translations
  for each row execute function public.log_content_audit('journey_translation');

drop trigger if exists media_assets_audit on public.media_assets;
create trigger media_assets_audit
  after insert or delete on public.media_assets
  for each row execute function public.log_content_audit('media_asset');

drop trigger if exists daily_journeys_audit on public.daily_journeys;
create trigger daily_journeys_audit
  after insert or update or delete on public.daily_journeys
  for each row execute function public.log_content_audit('daily_journey');

-- ===========================================================================
-- GRANTS (nothing was granted before — the Data API could not reach any table)
-- ===========================================================================

grant select on public.languages to anon, authenticated;
grant select on public.scripture_sources to anon, authenticated;
grant select on public.media_assets to anon, authenticated;
grant select on public.collections to anon, authenticated;
grant select on public.collection_translations to anon, authenticated;
grant select on public.journeys to anon, authenticated;
grant select on public.journey_translations to anon, authenticated;
grant select on public.journey_words to anon, authenticated;
grant select on public.journey_word_translations to anon, authenticated;
grant select on public.scripture_references to anon, authenticated;
grant select on public.journey_puzzle_settings to anon, authenticated;
grant select on public.content_tags to anon, authenticated;
grant select on public.content_tag_translations to anon, authenticated;
grant select on public.journey_tags to anon, authenticated;
grant select on public.collection_tags to anon, authenticated;
grant select on public.daily_journeys to anon, authenticated;

grant insert, update, delete on public.languages to authenticated;
grant insert, update, delete on public.scripture_sources to authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant insert, update, delete on public.collections to authenticated;
grant insert, update, delete on public.collection_translations to authenticated;
grant insert, update, delete on public.journeys to authenticated;
grant insert, update, delete on public.journey_translations to authenticated;
grant insert, update, delete on public.journey_words to authenticated;
grant insert, update, delete on public.journey_word_translations to authenticated;
grant insert, update, delete on public.scripture_references to authenticated;
grant insert, update, delete on public.journey_puzzle_settings to authenticated;
grant insert, update, delete on public.content_tags to authenticated;
grant insert, update, delete on public.content_tag_translations to authenticated;
grant insert, update, delete on public.journey_tags to authenticated;
grant insert, update, delete on public.collection_tags to authenticated;
grant insert, update, delete on public.daily_journeys to authenticated;

grant select on public.content_versions to authenticated;
grant select, insert on public.content_review_logs to authenticated;
grant select on public.content_status_history to authenticated;
grant select on public.content_audit_logs to authenticated;
grant select, insert, update on public.content_preview_tokens to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, delete on public.user_roles to authenticated;

grant all on public.languages, public.scripture_sources, public.media_assets,
  public.collections, public.collection_translations, public.journeys,
  public.journey_translations, public.journey_words, public.journey_word_translations,
  public.scripture_references, public.journey_puzzle_settings, public.content_tags,
  public.content_tag_translations, public.journey_tags, public.collection_tags,
  public.daily_journeys, public.content_versions, public.content_review_logs,
  public.content_status_history, public.content_audit_logs, public.content_preview_tokens,
  public.profiles, public.user_preferences, public.user_roles
  to service_role;

-- ===========================================================================
-- RLS ON THE NEW TABLES
-- ===========================================================================

alter table public.content_tags enable row level security;
alter table public.content_tag_translations enable row level security;
alter table public.journey_tags enable row level security;
alter table public.collection_tags enable row level security;
alter table public.daily_journeys enable row level security;
alter table public.content_versions enable row level security;
alter table public.content_review_logs enable row level security;
alter table public.content_status_history enable row level security;
alter table public.content_audit_logs enable row level security;
alter table public.content_preview_tokens enable row level security;

drop policy if exists "anyone reads active tags" on public.content_tags;
create policy "anyone reads active tags"
  on public.content_tags for select
  using (is_active or public.is_content_staff(auth.uid()));

drop policy if exists "editors manage tags" on public.content_tags;
create policy "editors manage tags"
  on public.content_tags for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

drop policy if exists "anyone reads tag names" on public.content_tag_translations;
create policy "anyone reads tag names"
  on public.content_tag_translations for select using (true);

drop policy if exists "editors manage tag names" on public.content_tag_translations;
create policy "editors manage tag names"
  on public.content_tag_translations for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

drop policy if exists "public reads journey tags" on public.journey_tags;
create policy "public reads journey tags"
  on public.journey_tags for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.journeys j
      where j.id = journey_tags.journey_id and public.journey_is_public(j)
    )
  );

drop policy if exists "editors manage journey tags" on public.journey_tags;
create policy "editors manage journey tags"
  on public.journey_tags for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

drop policy if exists "public reads collection tags" on public.collection_tags;
create policy "public reads collection tags"
  on public.collection_tags for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.collections c
      where c.id = collection_tags.collection_id and public.collection_is_public(c)
    )
  );

drop policy if exists "editors manage collection tags" on public.collection_tags;
create policy "editors manage collection tags"
  on public.collection_tags for all to authenticated
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

drop policy if exists "public reads current daily journey" on public.daily_journeys;
create policy "public reads current daily journey"
  on public.daily_journeys for select
  using (journey_date <= current_date or public.is_content_staff(auth.uid()));

drop policy if exists "publication admins manage daily journeys" on public.daily_journeys;
create policy "publication admins manage daily journeys"
  on public.daily_journeys for all to authenticated
  using (public.can_publish_content(auth.uid()))
  with check (public.can_publish_content(auth.uid()));

drop policy if exists "staff read content versions" on public.content_versions;
create policy "staff read content versions"
  on public.content_versions for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "staff read review logs" on public.content_review_logs;
create policy "staff read review logs"
  on public.content_review_logs for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "reviewers write review logs" on public.content_review_logs;
create policy "reviewers write review logs"
  on public.content_review_logs for insert to authenticated
  with check (
    actor_id = auth.uid()
    and (public.can_review_content(auth.uid())
         or public.can_edit_content(auth.uid())
         or public.can_publish_content(auth.uid()))
  );

drop policy if exists "staff read status history" on public.content_status_history;
create policy "staff read status history"
  on public.content_status_history for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "publication admins read audit logs" on public.content_audit_logs;
create policy "publication admins read audit logs"
  on public.content_audit_logs for select to authenticated
  using (public.can_publish_content(auth.uid()) or public.has_role(auth.uid(), 'support_admin'));

drop policy if exists "staff read preview tokens" on public.content_preview_tokens;
create policy "staff read preview tokens"
  on public.content_preview_tokens for select to authenticated
  using (public.is_content_staff(auth.uid()));

drop policy if exists "staff create preview tokens" on public.content_preview_tokens;
create policy "staff create preview tokens"
  on public.content_preview_tokens for insert to authenticated
  with check (public.is_content_staff(auth.uid()) and created_by = auth.uid());

drop policy if exists "staff revoke preview tokens" on public.content_preview_tokens;
create policy "staff revoke preview tokens"
  on public.content_preview_tokens for update to authenticated
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));