# Content Platform — Implementation Notes

Date: 2026-07-28
Phase: 2
Companion document: `docs/product/content-platform-blueprint.md` (product rules)

---

## 1. Implemented architecture

```
Admin UI (React)                     Public UI (React)
   │  useAdminSession() → roles         │
   │  adminRepository                   │  publicRepository
   ▼                                    ▼
supabase-js  ── anon key + user JWT ──────────────┐
                                                  ▼
                          PostgreSQL + Row Level Security
                            ├── RLS policies      (who may touch a row)
                            ├── workflow triggers (which transitions are legal)
                            ├── audit triggers    (tamper-evident history)
                            └── CHECK constraints (data integrity)
```

**The central decision: no privileged server layer.** Admin writes go through the browser with the *user's own* JWT, and PostgreSQL decides what is allowed. A service-role server layer would have to re-implement every rule that RLS already enforces, and would bypass RLS by definition. The service-role client (`supabase/server.server.ts`) stays reserved for the scheduled-publication worker and future webhooks.

Consequence worth stating plainly: **bypassing the admin UI grants nothing.** Calling the REST API directly, forging `useAdminSession` state, or unhiding a route all produce the same result — the database refuses.

## 2. Routes

| Route | Purpose |
|---|---|
| `/admin` | Dashboard: pipeline counts, recent edits, upcoming Daily Journeys, translation gaps |
| `/admin/collections` | Collection list with status and translation coverage |
| `/admin/collections/new` | Create collection + primary translation |
| `/admin/collections/$collectionId` | Edit collection, workflow actions |
| `/admin/journeys` | Journey list, status filter (URL-persisted), search, pagination |
| `/admin/journeys/new` | Create journey + primary translation + default puzzle settings |
| `/admin/journeys/$journeyId` | Tabbed editor: Content · Words · Puzzle · Settings · History |
| `/admin/review` | Review queue, oldest first |
| `/admin/calendar` | Daily Journey assignment, 21 days ahead, per locale |
| `/admin/translations` | EN source vs target locale coverage |
| `/admin/media` | Media constraints; uploads await a Storage bucket |
| `/admin/audit` | Paginated audit log |

Every admin route sets `robots: noindex, nofollow`.

## 3. Services

| Module | Responsibility |
|---|---|
| `lib/content/types.ts` | Enums mirroring the database |
| `lib/content/normalize.ts` | Display ↔ matching word forms (accent folding, Ñ preserved) |
| `lib/content/slug.ts` | Slug generation, validation, uniqueness |
| `lib/content/status.ts` | Transition state machine + capability rules (mirrors SQL) |
| `lib/content/errors.ts` | Domain errors + PostgREST error translation |
| `lib/content/schemas.ts` | Zod schemas for every entity |
| `lib/content/word-list.ts` | Word-list validation and bulk parsing |
| `lib/content/translation.ts` | Locale fallback, completeness, coverage |
| `lib/content/rows.ts` | Hand-written row types (replace with generated types once a project is linked) |
| `lib/content/public-repository.ts` | Published-only reads with locale fallback |
| `lib/content/admin-repository.ts` | Validated CRUD, workflow, Daily Journey, dashboard, audit |
| `lib/auth/roles.ts` | Role fetch + capability mapping |
| `lib/auth/useAdminSession.ts` | Session + roles hook |

## 4. Database tables (migrations 0003 + 0004)

**Reference:** `languages`, `scripture_sources`, `content_tags`, `content_tag_translations`, `media_assets`
**Content:** `collections`, `collection_translations`, `journeys`, `journey_translations`, `scripture_references`, `journey_words`, `journey_word_translations`, `journey_puzzle_settings`, `journey_tags`, `collection_tags`
**Scheduling:** `daily_journeys`
**Editorial:** `content_versions`, `content_review_logs`, `content_status_history`, `content_audit_logs`, `content_preview_tokens`

Enums: `content_status`, `translation_status`, `access_level`, `difficulty_level`, `scripture_strategy`, `content_entity_type`, `review_decision`; plus `publication_admin` added to `app_role` in migration 0002.

**Migration 0002 is isolated on purpose.** PostgreSQL refuses to use an enum value added by `ALTER TYPE ... ADD VALUE` inside the transaction that adds it, and migration 0004 references `'publication_admin'` in policies. Rolling back an enum value requires recreating the type — there is no `DROP VALUE`.

## 5. RLS policies

Roughly 40 policies across 21 tables. Shape:

- **Public read** — via `collection_is_public()` / `journey_is_public()`: published, not archived, `published_at <= now()`, access level free/premium.
- **Staff read** — `is_content_staff()` sees everything.
- **Editor write** — `can_edit_content()`, restricted to `draft`/`changes_requested`/`in_review`.
- **Reviewer/publisher** — `can_review_content()` / `can_publish_content()`.
- **Audit tables** — SELECT only; **no INSERT/UPDATE/DELETE policy exists for anyone**, so only SECURITY DEFINER triggers write them and nobody can edit them.
- **Preview tokens** — never publicly readable; resolution is server-side.

No `using (true)` appears on any administrative table.

## 6. Server operations (triggers)

| Trigger function | Guarantees |
|---|---|
| `set_audit_user()` | `created_by`/`updated_by` come from `auth.uid()`, never the payload |
| `enforce_content_workflow()` | Transition legality, role requirement, **self-approval block**, timestamp consistency, status history + audit write |
| `snapshot_journey_version()` | Previous state preserved before significant edits |
| `snapshot_journey_translation_version()` | Same for translation bodies |
| `log_content_audit()` | Create/delete audit rows |
| `sync_word_translation_journey_id()` | Denormalized `journey_id` derived, not trusted |
| `enforce_scripture_text_storage()` | Verse text rejected unless the source permits storage |
| `enforce_daily_journey_target()` | Daily Journey must be approved+ and daily-eligible |

## 7. Validation schemas

`collectionCreateSchema`, `collectionTranslationSchema`, `journeyCreateSchema`, `journeyTranslationSchema`, `publishableJourneyTranslationSchema` (blocks approving/publishing an empty translation), `scriptureReferenceSchema`, `journeyWordSchema`, `journeyWordTranslationSchema`, `puzzleSettingsSchema`, `reviewSubmissionSchema`, `publicationScheduleSchema`, `dailyJourneyAssignmentSchema`, `mediaMetadataSchema`.

Validation runs in three places: the form (immediate feedback), the repository (`parseOrThrow` before any write), and the database (CHECK constraints and triggers). Frontend validation is never trusted alone.

## 8. Admin components

`AdminShell`, `AdminGate`, `StatusBadge` / `TranslationStatusBadge`, `SaveState` + `useUnsavedChangesWarning`, `FormField` + `FormErrorSummary`, `CollectionForm`, `WordListEditor`, `WorkflowActions`.

Accessibility choices worth noting:

- Word reordering has explicit **Move up / Move down buttons**, so the list is fully keyboard-operable rather than drag-only.
- Status is conveyed by **text first**; color is a secondary cue (color-blind safe).
- Save state and word-list validity use `aria-live`, so screen-reader users learn of a completed save or a blocking error.
- Errors are wired via `aria-describedby` with a focusable error summary at the top of each form.

Uses the existing design tokens (`--gold`, `--walnut`, `--sage`, `border`, `card`) and shadcn components. **No approved visual component was modified or replaced.**

## 9. Testing strategy

### Executed this phase — 105 unit tests passing

| Suite | Covers |
|---|---|
| `normalize.test.ts` | Accent folding, Ñ preservation, punctuation stripping, idempotency, NFC/NFD equivalence |
| `slug.test.ts` | Generation, validation, uniqueness, length limits |
| `status.test.ts` | Every transition, role requirements, self-approval, archived restore |
| `word-list.test.ts` | Duplicates, normalized collisions, grid fit, bulk parsing, translation gaps |
| `translation.test.ts` | Locale fallback, draft exclusion, completeness, coverage |
| `schemas.test.ts` | All entity schemas incl. puzzle config and media restrictions |

### Written but NOT executed

`supabase/tests/rls-content.test.sql` — 11 sections of authorization assertions (anonymous access, editor limits, self-approval, publisher rights, audit immutability, licensing backstop, word collisions, Daily Journey conflicts). **These have never been run**, because no Supabase project exists. Run them before trusting the policies.

### Not implemented

Integration and E2E tests (create → review → approve → publish → public read) require a live database. Specified in the roadmap; the RLS suite is the first thing to run once a project exists.

## 10. Known limitations

1. **Migrations unapplied and unverified.** No Supabase project. The SQL has not been executed even once — syntax errors are possible and would surface on first `supabase db push`.
2. **Scheduled publication worker not implemented.** Mechanism documented in the blueprint §20. Public queries already refuse to show future-dated content, so this is a completeness gap, not a correctness hole.
3. **Media uploads not wired.** Table, schema and policies exist; the Storage bucket and upload flow do not.
4. **Preview tokens: table only.** `content_preview_tokens` exists with policies; the server route that resolves a token for an unauthenticated previewer is not built. Staff can already preview via their own credentials.
5. **No visual diff** between versions — history is preserved and listed.
6. **Row types are hand-written** (`rows.ts`). Replace with `supabase gen types typescript` once a project is linked.
7. **Public pages still use mock data** — see `mock-data-migration-status.md`. Nothing was deleted.
8. **`adminWords.reorder` issues one update per row.** Fine for ~10 words; convert to a single RPC if lists grow.
9. **Scripture text is plain text.** If rich text is introduced, add server-side sanitization before storage.

## 11. Future work

- Apply migrations; run the RLS suite; fix whatever it finds.
- Scheduled publication worker (Edge Function + cron).
- Storage bucket, upload flow, image processing.
- Preview-token resolution route.
- Generated database types.
- Migrate public pages off mock data, domain by domain.
- Integration + E2E suites against a test database.
- Full-text search (`tsvector`) if `ilike` proves insufficient at scale.
