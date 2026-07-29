# Content Platform Blueprint

Date: 2026-07-28
Phase: 2 — Content platform and admin content management
Status: implemented (schema + admin UI). Migrations written but not yet applied — no Supabase project exists.

---

## 1. Purpose

The content platform is the editorial system behind every journey a reader sees. It exists to let a small editorial team produce, translate, review and schedule Scripture-based daily journeys in three languages — without engineering involvement, and without any possibility of unfinished or unlicensed material reaching readers.

Three non-negotiables shape every decision below:

1. **Unpublished content is invisible.** Not "hidden by the UI" — unreadable at the database level.
2. **Nothing goes live without a second pair of eyes.** Authors cannot approve their own work.
3. **Scripture licensing is enforced by the database**, not by editorial discipline alone.

## 2. Content hierarchy

```
Collection                     (a curated grouping: Psalms, Prayer, Family)
  └── Journey                  (one daily unit)
        ├── Scripture reference(s)   → scripture_sources (licensing strategy)
        ├── Journey translation      (devotional + reflection + prayer + SEO, per locale)
        ├── Journey words            → word translations (display + normalized, per locale)
        ├── Puzzle settings          (configuration for the Phase 3 engine)
        ├── Tags                     (secondary categorisation)
        └── Media                    (hero, social card)
```

A journey belongs to **exactly one primary collection** (`primary_collection_id`, NOT NULL) and may carry any number of tags. A journey appearing in several themes is tagged, never duplicated.

## 3. Collection structure

Internal name (staff-facing) is separate from the public title (translated). A collection carries slug, primary language, status, access level, topic, audience, difficulty range, estimated duration, cover/thumbnail media, featured flag with date range, display order, publication and archive dates, plus `created_by`/`updated_by`.

Categories such as "The Life of Jesus" or "Women of the Bible" are **rows, not code**. No collection name appears in a React component.

## 4. Journey structure

Internal title, public title (translated), slug (globally unique so `/journeys/:slug` works), primary collection, position, language, status, access level, difficulty, theme, audience, estimated minutes, featured flag, Daily-Journey eligibility, hero/social media, publication dates, `current_version`, author, reviewer.

- **Difficulty:** `gentle` · `balanced` · `challenging` · `expert`
- **Access:** `free` · `premium` · `preview` · `internal`

Access levels are content metadata only. They never name a subscription plan; entitlement resolution arrives centrally in Phase 5, and `preview`/`internal` are never publicly listed.

## 5. Localization model

English is the default and the fallback. Content is language-neutral at its core, with all display text in `*_translations` rows keyed by `language_code`.

**Translation status:** `missing` → `draft` → `in_review` → `approved` → `published`

- Public queries accept **only `published`** translations; anything else falls back to English and the response flags `isFallbackTranslation` so admin screens can label it.
- A journey may go live in English while other locales are still drafts — this is expected, not an error.
- Completeness is computed from the required fields (title, devotional, reflection prompt, prayer) and surfaced as a percentage per locale, with a `Translation gaps` panel on the dashboard.
- Machine translation is never auto-published; every locale requires human review.

## 6. Editorial workflow and content statuses

`draft` · `in_review` · `changes_requested` · `approved` · `scheduled` · `published` · `unpublished` · `archived`

```
draft ──► in_review ──► approved ──► scheduled ──► published ──► unpublished
  ▲           │             │            │                          │
  │           ▼             │            │                          ├──► draft
  │   changes_requested ────┘            │                          └──► archived
  └───────────┴──────────────────────────┘                                │
                       archived ──► draft (super_admin only) ◄─────────────┘
```

Transitions are defined once in `public.is_valid_status_transition()` and mirrored in `src/lib/content/status.ts` for UI affordances. Anything not listed is rejected.

| Transition | Who |
|---|---|
| → `in_review`, → `draft` | editor, reviewer, publication admin |
| → `approved`, → `changes_requested` | **reviewer** (never the author) |
| → `scheduled`, `published`, `unpublished`, `archived` | **publication admin** |
| `archived` → `draft` | **super admin** only |

### Review workflow

Submitting, approving and requesting changes each write a `content_review_logs` row capturing actor, decision, notes, previous and new status. Requesting changes requires a note — the author needs to know what to fix.

**Self-approval is blocked in the database.** `enforce_content_workflow()` refuses `approved` when `auth.uid() = created_by`, regardless of the actor's roles. Only `super_admin` overrides this, and the override is audited like everything else.

## 7. Versioning strategy

`content_versions` stores a JSONB snapshot of the **previous** state whenever a significant field changes — journey title, slug, access level, difficulty, status, collection; and for translations: title, devotional, reflection, prayer, status.

Snapshots are written by a trigger, so a published journey can never be silently overwritten, even by a direct SQL update. `journeys.current_version` increments alongside. A visual diff UI is deferred; the history is preserved and listed in the journey editor's History tab.

## 8. Publication scheduling

- `scheduled_publish_at` / `scheduled_unpublish_at` are stored on the entity in **UTC** and displayed in the admin user's locale.
- Public queries filter `published_at <= now()`, so **scheduled content cannot appear early even if a worker never runs**. This is the important property: correctness does not depend on a cron job.
- **Not yet implemented:** the worker that flips `scheduled` → `published`. Required mechanism documented in §16 below.

## 9. Daily Journey

`daily_journeys` is keyed on `(journey_date, language_code)` — a composite primary key that makes conflicting assignments structurally impossible. Resolution asks for the reader's locale and falls back to `en`; a "global" Daily Journey is simply the same journey assigned across locales.

A trigger enforces that the target journey is `approved`/`scheduled`/`published` **and** flagged `daily_eligible`. RLS hides future-dated assignments from the public, so tomorrow's journey cannot be scraped ahead of time.

## 10. Premium access metadata

`access_level` on collections and journeys. Free readers see premium **metadata** (title, description, difficulty) in listings — that is how a paywall communicates value — while the body content is gated by entitlements in Phase 5. `internal` and `preview` never appear in public listings at all.

## 11. Scripture content strategy

Four strategies per translation, recorded in `scripture_sources`:

| Strategy | Meaning |
|---|---|
| `reference_only` | Show book/chapter/verse; the reader opens their own Bible. Always legal. |
| `public_domain` | Text may be stored and redistributed (WEB, Almeida RC 1898, RVR 1909). |
| `licensed` | Stored under a signed agreement, with attribution recorded. |
| `api` | Fetched from an approved provider under its terms. |

`allows_text_storage` is a separate column, constrained so it can only be true for `public_domain` or `licensed`. A trigger rejects any `scripture_references.stored_text` whose source does not permit storage. **An editor pasting NIV text into a reference-only source gets a database error, not a lawsuit.**

Seed data uses WEB only.

## 12. Word-list strategy

`journey_words` holds the language-neutral slot (position, required flag, difficulty band, optional Scripture link). `journey_word_translations` holds the per-locale forms:

- `display_value` — what the reader sees, accents intact: **ORAÇÃO**
- `normalized_value` — what the engine matches: **ORACAO**

Normalization folds Portuguese and Spanish diacritics but **preserves Ñ**, because in Spanish it is a distinct letter — `AÑO` (year) must never collide with `ANO`. The normalized form is derived server-side in the repository, never accepted from the client, so the two forms cannot drift apart.

A unique index on `(journey_id, language_code, normalized_value)` rejects two words that would be indistinguishable inside the grid.

## 13. Puzzle configuration strategy

`journey_puzzle_settings` (1:1 with journey) uses **real columns, not JSONB**, because the settings are a stable, known set: default and allowed difficulties, min/max grid size, target word count, allowed directions, reversed/diagonal permission, overlap preference, seed strategy, hint and solution availability, filler strategy, custom alphabet, estimated completion time.

Validated by `puzzleSettingsSchema` (Zod) *and* CHECK constraints. The Phase 3 engine is not built yet; this is the content side, so journeys are ready the day it ships.

## 14. Admin roles

| Role | Can |
|---|---|
| `content_editor` | Create and edit unpublished content, manage words and translations, submit for review |
| `content_reviewer` | Approve or request changes (never on their own authorship) |
| `publication_admin` | Schedule, publish, unpublish, archive, manage Daily Journey |
| `support_admin` | Read-only visibility incl. audit log |
| `super_admin` | Everything, including role grants and archived-content restoration |

## 15. User-facing retrieval rules

Every public query enforces, in the query *and* in RLS:

- `status = 'published'`
- `archived_at is null`
- `published_at <= now()`
- `access_level in ('free','premium')`
- translation `status = 'published'`, else English fallback

Public queries select an explicit column list — `internal_name`, `created_by`, review state and scheduling fields are never transmitted. The public frontend cannot render what it never receives.

## 16. Archival, deletion and retention

- **Archive over delete.** `archived` + `archived_at`; journeys reference collections with `on delete restrict`, so a collection in use cannot be removed.
- **Deletion** is `super_admin`-only and expected to be rare (mistaken drafts).
- **Audit and version history are never deleted** by application code. `content_audit_logs` and `content_status_history` have no UPDATE or DELETE policy for anyone.
- Retention: audit ≥ 24 months (Phase 10 sets the purge job).

## 17. Audit requirements

Written by SECURITY DEFINER triggers, not application code — editors can neither forge nor skip them:

- Create/delete on collections, journeys, translations, media, daily journeys
- Every status change, with previous → new status and actor
- Review decisions with notes

Audit rows carry metadata only. Full content bodies, private notes and secrets are never copied into logs.

## 18. Future extensibility

- **New language:** insert a `languages` row + add a UI locale file. No schema change.
- **New content type:** add a table plus a `content_entity_type` enum value; versioning, audit and review tables already accept any entity type.
- **Separate devotional/reflection/prayer records:** if a journey ever needs several of each, they split out of `journey_translations` into their own tables. See §19.
- **Scheduled publication worker:** see below.
- **Rich text:** bodies are plain text today. If a rich editor is introduced, output must be sanitized server-side before storage (stored-XSS risk).

## 19. Model deviations from the original table list

Documented rather than silently applied, per the project rules:

| Brief suggested | Implemented as | Why |
|---|---|---|
| `devotional_content`, `reflection_content`, `prayer_content` | Columns on `journey_translations` | Strictly 1:1 per journey per locale. Three extra tables would add three joins for zero flexibility. Splitting them later is a mechanical migration. |
| `journey_media` + `collection_media` | One `media_assets` table | Identical columns; linkage is expressed by FKs on the consumers. |
| `publication_schedules` | Columns on collections/journeys | Scheduling is 1:1 with the entity. A join table would complicate the visibility predicate that every public query depends on. |
| `content_editor_assignments` | Not implemented | No assignment workflow is in scope for Phase 2; `author_id`/`reviewer_id` cover attribution. Add when editorial volume needs it. |

## 20. Required follow-up: scheduled publication worker

Not implemented in Phase 2. Public correctness does not depend on it (see §8), but `scheduled` content will not flip to `published` on its own until it exists.

**Required mechanism:** a Supabase Edge Function on a cron schedule (or `pg_cron`), running with the service-role key, executing roughly:

```sql
update public.journeys
   set status = 'published'
 where status = 'scheduled'
   and scheduled_publish_at <= now();

update public.journeys
   set status = 'unpublished'
 where status = 'published'
   and scheduled_unpublish_at is not null
   and scheduled_unpublish_at <= now();
```

`enforce_content_workflow()` already recognises the service-role context (`is_service_context()`) and permits these transitions without an authenticated staff user, writing status history and audit rows exactly as a human action would.
