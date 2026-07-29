-- 0004_content_rls_and_workflow.sql
-- Phase 2: authorization helpers, workflow triggers and RLS policies.
--
-- Design: RLS decides WHO may touch a row at all; triggers decide WHICH status
-- transitions are legal and who may perform them. Audit rows are written by
-- SECURITY DEFINER triggers and have no client INSERT/UPDATE/DELETE policies,
-- so editors can neither forge nor skip them.

-- ===========================================================================
-- AUTHORIZATION HELPERS
-- All are SECURITY DEFINER + STABLE so they can be used inside policies
-- without recursive RLS evaluation.
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

-- Any staff member who may see unpublished content.
create or replace function public.is_content_staff(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(uid, 'content_editor')
      or public.has_role(uid, 'content_reviewer')
      or public.has_role(uid, 'publication_admin')
      or public.has_role(uid, 'support_admin')
      or public.has_role(uid, 'super_admin');
$$;

-- True when the statement runs with the service-role key (server-side jobs,
-- e.g. the scheduled-publication worker). Never true for browser sessions.
create or replace function public.is_service_context()
returns boolean language plpgsql stable as $$
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

-- ===========================================================================
-- DATA-INTEGRITY TRIGGERS
-- ===========================================================================

-- journey_word_translations.journey_id is denormalized purely to support the
-- per-journey unique-normalized-value index. It is derived here, never trusted
-- from the client payload.
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

create trigger journey_word_translations_sync_journey
  before insert or update of journey_word_id on public.journey_word_translations
  for each row execute function public.sync_word_translation_journey_id();

-- Verse text may only be stored for sources that permit it. This is the
-- database-level backstop for the licensing rules in
-- docs/legal-and-content/01-bible-content-licensing-notes.md.
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

create trigger scripture_references_enforce_storage
  before insert or update on public.scripture_references
  for each row execute function public.enforce_scripture_text_storage();

-- A Daily Journey may only point at content that is published or approved.
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

create trigger daily_journeys_enforce_target
  before insert or update on public.daily_journeys
  for each row execute function public.enforce_daily_journey_target();

-- ===========================================================================
-- STATUS TRANSITION ENGINE
-- Single source of truth for the editorial workflow. Mirrored in TypeScript at
-- src/lib/content/status.ts for client-side UX; the database is authoritative.
-- ===========================================================================

create or replace function public.is_valid_status_transition(
  from_status public.content_status,
  to_status public.content_status
)
returns boolean language sql immutable as $$
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

-- Enforces legality of the transition, the role required for it, the
-- no-self-approval rule, and keeps published_at/archived_at honest.
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

  -- Service-role callers (scheduled publication worker) skip role checks;
  -- everything else must be an authenticated staff member.
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
        -- An author may not approve their own work. super_admin is the
        -- documented emergency override.
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
        -- Restoring archived content is a super_admin action.
        if old.status = 'archived' and not public.has_role(uid, 'super_admin') then
          raise exception 'only a super admin may restore archived content'
            using errcode = 'insufficient_privilege';
        end if;
    end case;
  end if;

  -- Keep timestamps consistent with the new state.
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

create trigger collections_enforce_workflow
  before update of status on public.collections
  for each row execute function public.enforce_content_workflow('collection');

create trigger journeys_enforce_workflow
  before update of status on public.journeys
  for each row execute function public.enforce_content_workflow('journey');

-- ===========================================================================
-- VERSIONING
-- Snapshots the PREVIOUS state so history shows what the content was before
-- each significant change.
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

create trigger journeys_snapshot_version
  before update on public.journeys
  for each row execute function public.snapshot_journey_version();

-- Translation bodies are the substance of a journey, so they are versioned too.
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

create trigger journey_translations_snapshot_version
  before update on public.journey_translations
  for each row execute function public.snapshot_journey_translation_version();

-- ===========================================================================
-- GENERIC AUDIT LOGGING
-- ===========================================================================

create or replace function public.log_content_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  entity public.content_entity_type := tg_argv[0]::public.content_entity_type;
  action_name text;
  target_id uuid;
begin
  if tg_op = 'INSERT' then
    action_name := 'created';
    target_id := new.id;
  elsif tg_op = 'UPDATE' then
    action_name := 'updated';
    target_id := new.id;
  else
    action_name := 'deleted';
    target_id := old.id;
  end if;

  insert into public.content_audit_logs (actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), action_name, entity, target_id, format('%s %s', entity, action_name));

  return coalesce(new, old);
end;
$$;

create trigger collections_audit
  after insert or delete on public.collections
  for each row execute function public.log_content_audit('collection');

create trigger journeys_audit
  after insert or delete on public.journeys
  for each row execute function public.log_content_audit('journey');

create trigger journey_translations_audit
  after insert or delete on public.journey_translations
  for each row execute function public.log_content_audit('journey_translation');

create trigger media_assets_audit
  after insert or delete on public.media_assets
  for each row execute function public.log_content_audit('media_asset');

create trigger daily_journeys_audit
  after insert or update or delete on public.daily_journeys
  for each row execute function public.log_content_audit('daily_journey');

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================

alter table public.languages enable row level security;
alter table public.media_assets enable row level security;
alter table public.scripture_sources enable row level security;
alter table public.collections enable row level security;
alter table public.collection_translations enable row level security;
alter table public.journeys enable row level security;
alter table public.journey_translations enable row level security;
alter table public.scripture_references enable row level security;
alter table public.journey_words enable row level security;
alter table public.journey_word_translations enable row level security;
alter table public.journey_puzzle_settings enable row level security;
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

-- ---------------------------------------------------------------------------
-- Visibility predicates
-- ---------------------------------------------------------------------------

-- A collection is publicly visible when published, not archived, past its
-- publication date, and not internal/preview-only.
create or replace function public.collection_is_public(c public.collections)
returns boolean language sql stable as $$
  select c.status = 'published'
     and c.archived_at is null
     and (c.published_at is null or c.published_at <= now())
     and c.access_level in ('free', 'premium');
$$;

create or replace function public.journey_is_public(j public.journeys)
returns boolean language sql stable as $$
  select j.status = 'published'
     and j.archived_at is null
     and (j.published_at is null or j.published_at <= now())
     and j.access_level in ('free', 'premium');
$$;

-- ---------------------------------------------------------------------------
-- Reference data
-- ---------------------------------------------------------------------------

create policy "anyone reads active languages"
  on public.languages for select using (is_active or public.is_content_staff(auth.uid()));

create policy "super admins manage languages"
  on public.languages for all
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "anyone reads active scripture sources"
  on public.scripture_sources for select
  using (is_active or public.is_content_staff(auth.uid()));

create policy "super admins manage scripture sources"
  on public.scripture_sources for all
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "anyone reads active tags"
  on public.content_tags for select
  using (is_active or public.is_content_staff(auth.uid()));

create policy "editors manage tags"
  on public.content_tags for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "anyone reads tag names"
  on public.content_tag_translations for select using (true);

create policy "editors manage tag names"
  on public.content_tag_translations for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

-- ---------------------------------------------------------------------------
-- Media
-- ---------------------------------------------------------------------------

-- Media is readable when it is attached to publicly visible content; staff see
-- everything. Unattached uploads stay private to staff.
create policy "public reads media on published content"
  on public.media_assets for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.collections c
      where (c.cover_media_id = media_assets.id or c.thumbnail_media_id = media_assets.id)
        and public.collection_is_public(c)
    )
    or exists (
      select 1 from public.journeys j
      where (j.hero_media_id = media_assets.id or j.social_media_id = media_assets.id)
        and public.journey_is_public(j)
    )
  );

create policy "editors upload media"
  on public.media_assets for insert
  with check (public.can_edit_content(auth.uid()));

create policy "editors update media"
  on public.media_assets for update
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "publication admins delete media"
  on public.media_assets for delete
  using (public.can_publish_content(auth.uid()));

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------

create policy "public reads published collections"
  on public.collections for select
  using (public.collection_is_public(collections) or public.is_content_staff(auth.uid()));

create policy "editors create collections"
  on public.collections for insert
  with check (public.can_edit_content(auth.uid()));

-- Editors may edit unpublished content; live content may only be edited by
-- publication admins. The workflow trigger governs status changes separately.
create policy "staff update collections"
  on public.collections for update
  using (
    (public.can_edit_content(auth.uid()) and status in ('draft', 'changes_requested', 'in_review'))
    or public.can_review_content(auth.uid())
    or public.can_publish_content(auth.uid())
  )
  with check (
    public.can_edit_content(auth.uid())
    or public.can_review_content(auth.uid())
    or public.can_publish_content(auth.uid())
  );

create policy "super admins delete collections"
  on public.collections for delete
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "public reads published collection translations"
  on public.collection_translations for select
  using (
    public.is_content_staff(auth.uid())
    or (
      status = 'published'
      and exists (
        select 1 from public.collections c
        where c.id = collection_translations.collection_id and public.collection_is_public(c)
      )
    )
  );

create policy "editors manage collection translations"
  on public.collection_translations for all
  using (public.can_edit_content(auth.uid()) or public.can_review_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()) or public.can_review_content(auth.uid()));

-- ---------------------------------------------------------------------------
-- Journeys
-- ---------------------------------------------------------------------------

create policy "public reads published journeys"
  on public.journeys for select
  using (public.journey_is_public(journeys) or public.is_content_staff(auth.uid()));

create policy "editors create journeys"
  on public.journeys for insert
  with check (public.can_edit_content(auth.uid()));

create policy "staff update journeys"
  on public.journeys for update
  using (
    (public.can_edit_content(auth.uid()) and status in ('draft', 'changes_requested', 'in_review'))
    or public.can_review_content(auth.uid())
    or public.can_publish_content(auth.uid())
  )
  with check (
    public.can_edit_content(auth.uid())
    or public.can_review_content(auth.uid())
    or public.can_publish_content(auth.uid())
  );

create policy "super admins delete journeys"
  on public.journeys for delete
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "public reads published journey translations"
  on public.journey_translations for select
  using (
    public.is_content_staff(auth.uid())
    or (
      status = 'published'
      and exists (
        select 1 from public.journeys j
        where j.id = journey_translations.journey_id and public.journey_is_public(j)
      )
    )
  );

create policy "editors manage journey translations"
  on public.journey_translations for all
  using (public.can_edit_content(auth.uid()) or public.can_review_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()) or public.can_review_content(auth.uid()));

-- ---------------------------------------------------------------------------
-- Journey children (scripture, words, puzzle settings, tags)
-- All follow parent-journey visibility.
-- ---------------------------------------------------------------------------

create policy "public reads scripture of published journeys"
  on public.scripture_references for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.journeys j
      where j.id = scripture_references.journey_id and public.journey_is_public(j)
    )
  );

create policy "editors manage scripture references"
  on public.scripture_references for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "public reads words of published journeys"
  on public.journey_words for select
  using (
    public.is_content_staff(auth.uid())
    or (
      is_active and exists (
        select 1 from public.journeys j
        where j.id = journey_words.journey_id and public.journey_is_public(j)
      )
    )
  );

create policy "editors manage journey words"
  on public.journey_words for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "public reads word translations of published journeys"
  on public.journey_word_translations for select
  using (
    public.is_content_staff(auth.uid())
    or (
      status = 'published' and exists (
        select 1 from public.journeys j
        where j.id = journey_word_translations.journey_id and public.journey_is_public(j)
      )
    )
  );

create policy "editors manage word translations"
  on public.journey_word_translations for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "public reads puzzle settings of published journeys"
  on public.journey_puzzle_settings for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.journeys j
      where j.id = journey_puzzle_settings.journey_id and public.journey_is_public(j)
    )
  );

create policy "editors manage puzzle settings"
  on public.journey_puzzle_settings for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "public reads journey tags"
  on public.journey_tags for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.journeys j
      where j.id = journey_tags.journey_id and public.journey_is_public(j)
    )
  );

create policy "editors manage journey tags"
  on public.journey_tags for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

create policy "public reads collection tags"
  on public.collection_tags for select
  using (
    public.is_content_staff(auth.uid())
    or exists (
      select 1 from public.collections c
      where c.id = collection_tags.collection_id and public.collection_is_public(c)
    )
  );

create policy "editors manage collection tags"
  on public.collection_tags for all
  using (public.can_edit_content(auth.uid()))
  with check (public.can_edit_content(auth.uid()));

-- ---------------------------------------------------------------------------
-- Daily Journey
-- Today's and past assignments are public; future assignments are staff-only
-- so tomorrow's journey cannot be scraped early.
-- ---------------------------------------------------------------------------

create policy "public reads current daily journey"
  on public.daily_journeys for select
  using (journey_date <= current_date or public.is_content_staff(auth.uid()));

create policy "publication admins manage daily journeys"
  on public.daily_journeys for all
  using (public.can_publish_content(auth.uid()))
  with check (public.can_publish_content(auth.uid()));

-- ---------------------------------------------------------------------------
-- Editorial records
-- content_status_history and content_audit_logs have NO write policies at all:
-- only the SECURITY DEFINER triggers (and service_role) may insert, and nobody
-- may update or delete. This makes the audit trail tamper-evident.
-- ---------------------------------------------------------------------------

create policy "staff read content versions"
  on public.content_versions for select using (public.is_content_staff(auth.uid()));

create policy "staff read review logs"
  on public.content_review_logs for select using (public.is_content_staff(auth.uid()));

create policy "reviewers write review logs"
  on public.content_review_logs for insert
  with check (
    actor_id = auth.uid()
    and (public.can_review_content(auth.uid())
         or public.can_edit_content(auth.uid())
         or public.can_publish_content(auth.uid()))
  );

create policy "staff read status history"
  on public.content_status_history for select using (public.is_content_staff(auth.uid()));

create policy "publication admins read audit logs"
  on public.content_audit_logs for select
  using (public.can_publish_content(auth.uid()) or public.has_role(auth.uid(), 'support_admin'));

-- ---------------------------------------------------------------------------
-- Preview tokens
-- Never readable by the public: unpublished content is resolved server-side
-- with the service-role key after validating the token.
-- ---------------------------------------------------------------------------

create policy "staff read preview tokens"
  on public.content_preview_tokens for select using (public.is_content_staff(auth.uid()));

create policy "staff create preview tokens"
  on public.content_preview_tokens for insert
  with check (public.is_content_staff(auth.uid()) and created_by = auth.uid());

create policy "staff revoke preview tokens"
  on public.content_preview_tokens for update
  using (public.is_content_staff(auth.uid()))
  with check (public.is_content_staff(auth.uid()));
