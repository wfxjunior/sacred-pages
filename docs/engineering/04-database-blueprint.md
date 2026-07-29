# Database Blueprint

Date: 2026-07-28
Conventions (apply to every table unless stated):

- PK `id uuid primary key default gen_random_uuid()`.
- `created_at timestamptz not null default now()`; `updated_at timestamptz not null default now()` maintained by a shared `set_updated_at()` trigger.
- FKs `on delete` behavior stated explicitly per table.
- RLS **enabled on every table**; policies stated per table. `service_role` bypasses RLS by design (server-only code paths).
- Soft delete only where justified (user-authored content that may need undo/moderation); otherwise hard delete + cascades.
- JSONB only where flexibility is genuinely required (noted with justification).
- Enums implemented as Postgres enum types when closed sets, lookup tables when editable by admins.
- Helper: `public.has_role(uid uuid, r app_role) returns boolean` — `security definer`, `stable`, used inside policies to avoid recursive RLS.

Phase tags mark when each table is created by migration. **Phase 1 tables exist now** (migration `0001_identity_foundation.sql`); later tables are design targets and may be refined in their phase.

---

## A. Identity & access (Phase 1 — implemented)

### profiles

- **Purpose:** public-safe profile row per auth user; the app never reads `auth.users` directly.
- **Columns:** `id uuid PK` (= `auth.users.id`, FK on delete cascade), `display_name text null` (check: 1–80 chars when present), `avatar_url text null`, `onboarded_at timestamptz null`, `created_at`, `updated_at`.
- **Unique:** PK only. **Indexes:** PK.
- **Ownership:** the user. **Creation:** `handle_new_user()` trigger on `auth.users` insert (`security definer`).
- **RLS:** select/update where `auth.uid() = id`; no client insert/delete (trigger/service only).
- **Retention:** deleted with account (cascade from auth.users).

### app_role (enum)

`'free_user' | 'premium_user' | 'content_editor' | 'content_reviewer' | 'support_admin' | 'super_admin'` — `guest` is the absence of a session, never stored.

### user_roles

- **Purpose:** many-to-many user↔role; **the** authorization source of truth.
- **Columns:** `id uuid PK`, `user_id uuid not null` FK→auth.users on delete cascade, `role app_role not null`, `granted_by uuid null` FK→auth.users on delete set null, `created_at`.
- **Unique:** `(user_id, role)`. **Indexes:** unique composite; `user_id`.
- **RLS:** select where `auth.uid() = user_id` or `has_role(auth.uid(),'super_admin')`; insert/update/delete only `super_admin` (bootstrap grant via service role). Default `free_user` granted by signup trigger.
- **Retention:** cascade with account.

### user_preferences

- **Purpose:** cross-device UI/product preferences (mirrors current localStorage prototype so later sync is lossless).
- **Columns:** `user_id uuid PK` FK→auth.users cascade, `locale text not null default 'en'` (check in `('en','pt','es')` — widened when languages table arrives), `theme text not null default 'system'` (check `('light','dark','system')`), `selection_color text not null default 'gold'`, `preferred_difficulty text not null default 'gentle'` (check `('gentle','balanced','challenging','expert')`), `font_size text not null default 'medium'` (check), `sound_enabled boolean not null default true`, `email_reminders boolean not null default false`, `timezone text null`, `created_at`, `updated_at`.
- **RLS:** select/insert/update where `auth.uid() = user_id`; no delete (cascades with account).
- **Retention:** cascade with account.

## B. Localization (Phase 2)

### languages

- **Purpose:** supported content languages; adding a row (plus a UI locale file) adds a language.
- **Columns:** `code text PK` (BCP-47 short, e.g. 'en'), `english_name text not null`, `native_name text not null`, `is_active boolean not null default false`, `is_default boolean not null default false`, timestamps.
- **Check:** single default enforced by partial unique index `unique (is_default) where is_default`.
- **RLS:** public select where `is_active`; write: `content_editor`+.

Translation tables (below) follow one pattern: FK to parent cascade, `language_code` FK→languages, `unique(parent_id, language_code)`, per-row `review_status` enum `('draft','in_review','approved','published')`, public select only `published` (parents also published), writes editor/reviewer per §I.

## C. Content (Phase 2)

### collections

- **Purpose:** curated journey groupings (language-neutral core).
- **Columns:** `id`, `slug text not null unique` (check: kebab-case), `cover_image_path text null`, `difficulty text not null` (check gentle/balanced/challenging), `is_premium boolean not null default false`, `sort_order int not null default 0`, `status content_status not null default 'draft'` (`draft|scheduled|published|archived`), `published_at timestamptz null`, `scheduled_for timestamptz null`, timestamps.
- **Indexes:** slug (unique), `(status, sort_order)`.
- **RLS:** public select where `status='published'`; editor select all; writes via editorial policies.
- **Retention:** archive, don't delete (journeys reference them).

### collection_translations

- `id`, `collection_id` FK cascade, `language_code` FK, `title text not null`, `description text not null`, `seo_title text null`, `seo_description text null`, `review_status`, timestamps. Unique `(collection_id, language_code)`.

### journeys

- **Purpose:** one daily unit inside a collection.
- **Columns:** `id`, `collection_id` FK→collections on delete restrict, `slug text not null`, `position int not null`, `estimated_minutes int not null default 7` (check 1–60), `status content_status`, `published_at`, `scheduled_for`, timestamps.
- **Unique:** `(collection_id, slug)`, `(collection_id, position)`. **Indexes:** collection_id.
- **RLS:** as collections.

### journey_translations

- `journey_id` FK cascade, `language_code`, `title`, `devotional_body text not null`, `reflection_prompt text not null`, `prayer_body text not null`, `review_status`, timestamps. Unique `(journey_id, language_code)`.
- Note: devotional/reflection/prayer live here (1:1 per journey per language) rather than separate tables — separate `devotionals`/`reflections`/`prayers` tables become necessary only if a journey ever has multiples; revisit in Phase 2 review. This is the single deliberate deviation from the table list in the project brief, documented here.

### scripture_references

- **Purpose:** structured verse ranges per journey; never stores copyrighted text.
- **Columns:** `id`, `journey_id` FK cascade, `book text not null` (USFM/OSIS book code), `chapter int not null`, `verse_start int not null`, `verse_end int null` (check `>= verse_start`), `position int not null default 0`, timestamps.
- **RLS:** follows journey visibility.

### scripture_sources (Phase 2, licensing-driven)

- **Purpose:** per-translation sourcing strategy: `stored` (public-domain/licensed text in `scripture_texts`), `api` (fetch at read time), `reference_only`.
- **Columns:** `id`, `translation_code text unique` (e.g. 'WEB', 'ARC'), `language_code` FK, `strategy text check in ('stored','api','reference_only')`, `license_note text not null`, `api_provider text null`, timestamps.
- `scripture_texts`: `(source_id, book, chapter, verse) unique` + `text` — only for `stored` strategy.

### journey_words

- **Purpose:** word list per journey per language for the puzzle.
- **Columns:** `id`, `journey_id` FK cascade, `language_code` FK, `display_word text not null`, `normalized_word text not null` (uppercased, accent-folded — engine matching form), `position int not null default 0`, timestamps.
- **Unique:** `(journey_id, language_code, normalized_word)`. **Check:** `char_length(normalized_word) between 2 and 20`.

### content_tags / journey_tags

- `content_tags`: `id`, `slug unique`, per-language names in `content_tag_translations`. `journey_tags`: `(journey_id, tag_id)` PK composite, both FKs cascade.

### content_versions

- **Purpose:** editorial history snapshots.
- **Columns:** `id`, `entity_type text` (check enum), `entity_id uuid`, `version int`, `snapshot jsonb not null` (justified: heterogeneous entity payloads), `created_by` FK→auth.users set null, `created_at`.
- **Unique:** `(entity_type, entity_id, version)`. **RLS:** editors+ only. **Retention:** keep ≥ 24 months.

## D. Puzzle (Phase 3)

### puzzle_templates

- **Purpose:** difficulty rulesets (grid size, directions, reversed allowance, overlap policy, word count caps).
- **Columns:** `id`, `difficulty text unique` (gentle/balanced/challenging/expert), `grid_size int`, `directions text[] not null`, `allow_reversed boolean`, `max_words int`, `overlap_policy text`, timestamps. Editable by admins → lookup table, not enum.
- **RLS:** public select; admin write.

### puzzle_instances

- **Purpose:** a concrete generated puzzle (deterministic seed) for journey+language+difficulty.
- **Columns:** `id`, `journey_id` FK cascade, `language_code`, `difficulty`, `seed bigint not null`, `grid_size int not null`, `grid text[] not null` (row strings of display chars), `generation_meta jsonb` (attempt counts, failed words — diagnostic, justified), timestamps.
- **Unique:** `(journey_id, language_code, difficulty, seed)`. **Indexes:** `(journey_id, language_code, difficulty)`.
- **RLS:** readable where the journey is readable. Solution coordinates live in `puzzle_words`.

### puzzle_words

- `id`, `puzzle_instance_id` FK cascade, `journey_word_id` FK restrict, `row_start int`, `col_start int`, `row_end int`, `col_end int`, `direction text`, `is_reversed boolean`, `placed boolean not null` (false = generation failed for this word). Unique `(puzzle_instance_id, journey_word_id)`.
- **RLS:** as instance. (If solution-hiding ever matters, split coordinates into a service-only table; decided in Phase 3.)

## E. User activity (Phase 4)

### journey_sessions

- **Purpose:** one user's run through one journey.
- **Columns:** `id`, `user_id` FK cascade, `journey_id` FK restrict, `puzzle_instance_id` FK set null, `status text check in ('in_progress','completed','abandoned')`, `started_at`, `completed_at null`, `used_help boolean default false`, timestamps.
- **Unique:** partial `unique (user_id, journey_id) where status='in_progress'` (one active run). **Indexes:** `(user_id, status)`, `(user_id, completed_at)`.
- **RLS:** owner-only all ops.
- **Retention:** cascade with account.

### puzzle_sessions / puzzle_selections

- `puzzle_sessions`: `id`, `journey_session_id` FK cascade unique, `found_words uuid[] default '{}'` (refs puzzle_words; array justified: append-only small set, no per-row queries needed), `hints_used int default 0`, `revealed_solution boolean default false`, timestamps.
- `puzzle_selections` (optional analytics, Phase 4 decision): selection events; if kept: `id`, `puzzle_session_id` FK cascade, `path int[]`, `matched boolean`, `created_at`. Owner-only RLS; 90-day retention job.

### journey_progress / user_collection_progress

- `journey_progress`: materialized per-user-per-journey completion: `(user_id, journey_id)` PK, `completed_at`, `times_completed int default 1`. Owner-only RLS.
- `user_collection_progress`: `(user_id, collection_id)` PK, `journeys_completed int`, `completed_at null`. Maintained by trigger/server on journey completion.

### favorites

- `(user_id, entity_type, entity_id)` PK composite (entity_type check: journey/collection/verse), `created_at`. Owner-only RLS. Cascade with account.

### user_reflections / user_prayers

- **Purpose:** the user's private written responses. **Private by default, always.**
- **Columns:** `id`, `user_id` FK cascade, `journey_id` FK restrict, `body text not null` (check length ≤ 5000), `deleted_at timestamptz null` (**soft delete justified:** user undo + abuse review), timestamps.
- **Indexes:** `(user_id, journey_id)`.
- **RLS:** owner-only; sharing happens exclusively through Phase 7 permission tables — never a policy widening here.
- **Retention:** hard-purge soft-deleted rows after 30 days (scheduled job); cascade with account.

### consistency_days

- **Purpose:** streak source of truth ("Days in the Word").
- **Columns:** `(user_id, activity_date date)` PK composite, `journeys_completed int not null default 1`, `created_at`. `activity_date` computed in the user's timezone at write time (server-side).
- **RLS:** owner-only. Streaks are computed, never stored as a mutable counter.

### milestones / user_milestones

- `milestones`: `id`, `key text unique` (e.g. 'first_journey','seven_days','thirty_days','hundred_days','first_collection','first_reflection','first_prayer','first_shared_journey','first_referral','seasonal_*'), `threshold int null`, `is_active boolean`, translations table for names. Admin-managed.
- `user_milestones`: `(user_id, milestone_id)` PK composite, `awarded_at`, `context jsonb null` (justified: heterogeneous award context). **Composite PK = idempotent awards.** Owner select; awards written by server/trigger only (no client insert policy).

## F. Membership (Phase 5)

### plans / plan_entitlements

- `plans`: `id`, `key text unique` ('free','premium'), `stripe_product_id text null`, `is_active boolean`, timestamps. Prices come from Stripe price IDs in env/config, not DB amounts.
- `plan_entitlements`: `(plan_id, entitlement_key text)` PK composite; `entitlement_key` checked against the typed key list (daily_journey_access, selected_collections, full_library, advanced_difficulty, complete_personalization, advanced_progress, favorites, journey_together, family_features, group_features, exclusive_series, future_audio, future_offline, priority_support). Public select; admin write.

### billing_customers

- `user_id` PK FK cascade, `stripe_customer_id text unique not null`, timestamps. **RLS: no client access** (server-only). Retention: retain per financial-record obligations even after account deletion (anonymize user link → set null + keep stripe id; FK therefore `on delete set null` with surrogate `id` PK — final call in Phase 5).

### subscriptions

- `id`, `user_id` FK cascade, `stripe_subscription_id text unique`, `plan_id` FK restrict, `status text check in ('trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid','paused')`, `current_period_end timestamptz`, `cancel_at_period_end boolean`, `grace_until timestamptz null`, timestamps.
- **Indexes:** `(user_id, status)`. **RLS:** owner select only; all writes via webhook server path.

### webhook_events

- `id`, `stripe_event_id text unique not null` (**idempotency guard**), `type text`, `payload jsonb not null` (justified: Stripe event mirror), `processed_at timestamptz null`, `error text null`, `created_at`.
- **RLS:** no client access. **Retention:** 24 months then archive/purge.

### billing_events / access_overrides

- `billing_events`: normalized audit of billing state changes: `id`, `user_id`, `kind`, `detail jsonb`, `created_at`. Server-only.
- `access_overrides`: manual grants: `id`, `user_id` FK cascade, `entitlement_key`, `expires_at null`, `granted_by`, `reason text not null`, timestamps. Owner select; super_admin write. All grants audited.

## G. Sharing & referrals (Phase 6)

### share_links

- `id`, `token text unique not null` (opaque, ≥128-bit random, base62), `owner_id` FK cascade, `entity_type text check` (journey/collection/verse_card/milestone/completion), `entity_id uuid`, `payload jsonb not null` (**safe-share snapshot validated by Zod before insert** — justified: denormalized public snapshot so later content edits don't leak), `revoked_at timestamptz null`, `expires_at timestamptz null`, timestamps.
- **Indexes:** token unique. **RLS:** owner CRUD; public resolution via server endpoint only (no anon select policy — resolution endpoint uses service role + returns payload only when not revoked/expired).

### share_events

- `id`, `share_link_id` FK cascade, `kind text check ('view','signup')`, `created_at`. No IP/PII stored. Server-insert only. 12-month retention.

### referral_codes / referral_attributions / referral_rewards

- `referral_codes`: `id`, `user_id` FK cascade unique, `code text unique` (human-friendly, 8 chars), `is_active boolean`, timestamps.
- `referral_attributions`: `id`, `referral_code_id` FK restrict, `referred_user_id` FK cascade **unique** (a user is attributed once, ever), `created_at`. Server-insert at signup only.
- `referral_rewards`: `id`, `attribution_id` FK cascade unique per reward kind (`unique(attribution_id, kind)`), `kind text`, `granted_at null`, `revoked_at null`. Idempotent by unique constraint. Anti-abuse rules in threat model (self-referral, disposable emails, activation threshold before reward).

## H. Journey Together (Phase 7)

### companion_invitations

- `id`, `inviter_id` FK cascade, `token text unique` (opaque, revocable), `relationship_kind text check ('spouse','friend','family','mentor','parent','child')`, `invitee_email text null` (nullable — link-only invites), `status text check ('pending','accepted','declined','canceled','expired')`, `expires_at not null`, `responded_at null`, timestamps.
- **RLS:** inviter CRUD own; acceptance via server boundary (token, not RLS).

### companion_relationships

- `id`, `user_a uuid`, `user_b uuid` (both FK cascade; check `user_a < user_b` for canonical ordering), `kind text`, `established_at`, `ended_at null`. Unique `(user_a, user_b)`.
- **RLS:** select where `auth.uid() in (user_a, user_b)`; end (update `ended_at`) by either party; no third-party visibility.

### shared_journeys / shared_journey_members / shared_journey_progress

- `shared_journeys`: `id`, `creator_id` FK set null, `collection_id`/`journey_id` FK restrict, `status`, timestamps.
- `shared_journey_members`: `(shared_journey_id, user_id)` PK, `role text check ('owner','member')`, `joined_at`, `left_at null`, `share_completion boolean not null default true`, `share_reflections boolean not null default false` (**private default**).
- `shared_journey_progress`: `(shared_journey_id, user_id, journey_id)` PK, `completed_at`. Members-only select via membership subquery policy.

### encouragements

- `id`, `shared_journey_id` FK cascade, `from_user` FK cascade, `to_user` FK cascade, `kind text check ('amen','encourage')`, `journey_id null`, `created_at`. Unique `(shared_journey_id, from_user, to_user, journey_id, kind)` — idempotent. Members-only RLS.

### shared_reflection_permissions

- `(reflection_id, shared_journey_id)` PK — explicit opt-in per reflection per group. Reflection remains owner-only unless a row exists here; group members gain select via join policy. Revocation = row delete.

## I. Editorial workflow & administration (Phases 2/9)

### content_review_logs

- `id`, `entity_type`, `entity_id`, `action text check ('submitted','approved','rejected','published','unpublished','archived')`, `actor_id` FK set null, `note text null`, `created_at`. Editors/reviewers select; server-side insert.

### admin_audit_logs

- `id`, `actor_id` FK set null, `action text not null`, `entity_type`, `entity_id`, `detail jsonb null`, `created_at`. **Insert-only** (no update/delete policies for anyone; service path writes). super_admin select. Retention ≥ 24 months.

### support_notes (Phase 9, if needed)

- `id`, `user_id` FK cascade, `author_id` FK set null, `body text`, timestamps. support_admin+ only. Never visible to the user-facing app.

## J. Notifications (Phase 8)

### notifications

- `id`, `user_id` FK cascade, `kind text check ('daily','companion','milestone','collection','invitation','premium')` (mirrors existing UI prototype kinds), `title_key text`, `body_key text`, `params jsonb null` (justified: i18n interpolation params), `read_at null`, `created_at`.
- **Indexes:** `(user_id, read_at)`. Owner select/update(read_at); server insert. 6-month retention job.

### notification_preferences

- `user_id` PK FK cascade, `categories jsonb not null` (justified: mirrors shipped localStorage shape `Record<kind,{enabled,channels}>` — relational explosion not warranted for a per-user settings blob), `quiet_hours jsonb`, `weekly_digest boolean`, `sound boolean`, `pause_all boolean`, timestamps. Owner-only RLS.

### notification_deliveries

- `id`, `notification_id` FK cascade, `channel text check ('email','push')`, `status text check ('queued','sent','failed','suppressed')`, `provider_message_id text null`, `created_at`, `sent_at null`. Server-only. 12-month retention.

---

## Migration policy

- Ordered files `supabase/migrations/NNNN_description.sql`; each idempotent-safe to review, applied via Supabase CLI; destructive statements require an explicit `-- DESTRUCTIVE:` header and reviewer sign-off; reversibility noted in-file where feasible.
- Current migrations: `0001_identity_foundation.sql` (section A).
