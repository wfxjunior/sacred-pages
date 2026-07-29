# Supabase Foundation

Date: 2026-07-29
Scope: audit, validation and stabilization of the Supabase foundation before monetization work.
Status: migrations **validated but not yet applied to the live project**. See §4 and §18.

---

## 1. Supabase project connection

One project, connected through Lovable's native integration. There is no second
or obsolete project referenced anywhere in the repository.

| | |
|---|---|
| Project ref | `iykebiqmegganyftejek` (`supabase/config.toml`) |
| API URL | `VITE_SUPABASE_URL` |
| Public key | `VITE_SUPABASE_PUBLISHABLE_KEY` (new-style `sb_publishable_…`) |
| Live `public` schema | **empty** — 0 tables, verified against the REST API |
| Auth providers enabled | Google only. Email/password is **disabled** |
| Signups | open; `mailer_autoconfirm` off |

### Client topology

```
                    src/integrations/supabase/client.ts      ← Lovable-generated, DO NOT EDIT
                              (lazy Proxy, typed by types.ts)
                                        ▲
                                        │  re-exported, never re-created
                    src/lib/supabase/client.ts               ← our thin adapter
                                        ▲
        ┌───────────────┬───────────────┼────────────────┬─────────────────┐
   auth/service   auth/roles    content/*-repository   puzzle/*      journey/repository
```

There is exactly **one** browser client. `src/lib/supabase/client.ts` exists so
the repositories have a stable import while Lovable is free to regenerate its
own file; it re-exports the generated proxy rather than constructing a second
client.

`src/integrations/supabase/client.server.ts` holds the service-role client. It
is server-only and currently has **no callers**. Our earlier duplicate
(`src/lib/supabase/server.server.ts`) was deleted rather than maintained
alongside it.

## 2. Required environment variables

Never commit real values. `.env.example` is the only env file that should be
tracked.

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | browser + server | project API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser | public key; access is enforced by RLS |
| `VITE_SUPABASE_ANON_KEY` | browser | legacy name for the same thing; still accepted |
| `SUPABASE_URL` | server | SSR fallback |
| `SUPABASE_PUBLISHABLE_KEY` | server | SSR fallback |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS. Never `VITE_`-prefixed, never logged, never in docs |
| `VITE_SITE_URL` | browser | canonical origin for SEO and share links |

`src/lib/config/env.ts` validates the browser-safe set with Zod and accepts
either key name. `isSupabaseConfigured()` gates Supabase-backed features so the
app still renders with no configuration at all.

## 3. Local development setup

```bash
npm install
cp .env.example .env      # fill in from Supabase → Settings → API
npm run dev
```

The app runs without any Supabase configuration — Supabase-backed features
simply stay off. That is deliberate: visual work never requires credentials.

## 4. Migration execution

**The live `public` schema is empty**, so this is a first application, not a
reconciliation. Nothing will be overwritten and no data can be lost.

```bash
supabase login                          # needs a personal access token
supabase link --project-ref iykebiqmegganyftejek
supabase db push                        # applies 0001 → 0009 in order
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

`supabase db push` requires the database password (Supabase → Settings →
Database). Neither that nor an access token was available in the environment
where this audit ran, which is why the migrations are validated but unapplied.

### Verifying before pushing

Migrations were executed end-to-end against PostgreSQL 17 using a shim that
supplies the only two Supabase objects they reference (`auth.users`,
`auth.uid()`):

```bash
supabase/tests/local/verify-migrations.sh          # applies shim + 0001-0009
psql -v ON_ERROR_STOP=1 -d lumena_migration_check -f supabase/tests/rls-content.test.sql
psql -v ON_ERROR_STOP=1 -d lumena_migration_check -f supabase/tests/rls-progress.test.sql
```

This needs only a local PostgreSQL server — no Docker, no Supabase account. Run
it before every push.

## 5. Migration ordering

| File | Contents | Notes |
|---|---|---|
| `0001_identity_foundation` | profiles, `app_role`, user_roles, user_preferences, RLS, signup trigger | |
| `0002_publication_admin_role` | adds one enum value | **must stay alone** — PostgreSQL cannot use an enum value in the same transaction that adds it |
| `0003_content_platform` | collections, journeys, translations, words, scheduling, editorial tables | |
| `0004_content_rls_and_workflow` | ~40 policies, workflow/audit/version triggers | references the 0002 enum value |
| `0005_puzzle_domain` | templates, instances, sessions, progress, events | |
| `0006_journey_progress_domain` | sessions, steps, reflections, prayers, favorites, consistency, milestones | |
| `0007_fix_daily_journey_audit` | **corrective** — see §11 | |
| `0008_foreign_key_indexes` | **corrective** — 23 indexes on delete paths | additive only |
| `0009_profile_from_oauth_metadata` | **corrective** — profile naming under Google OAuth | |

Ordering is strict: 0004 depends on 0002's enum value and on 0003's tables;
0006 reads `puzzle_progress` from 0005.

## 6. Database schema overview

After applying 0001–0009: **43 tables, 28 functions, 50 triggers, 100 RLS
policies, 19 enums, 150 indexes.**

Domains: identity (0001), content and editorial workflow (0003–0004), puzzles
(0005), reader progress (0006).

## 7. RLS architecture

RLS is enabled on every table reachable by a client. Four shapes:

1. **Public content** — readable only when published, not archived,
   `published_at <= now()`, and access level free/premium, via
   `collection_is_public()` / `journey_is_public()`.
2. **Editorial** — `can_edit_content()` / `can_review_content()` /
   `can_publish_content()` / `is_content_staff()`, all resolved from
   `user_roles` in the database. Roles are never read from client-supplied
   metadata.
3. **User-owned** — `auth.uid() = user_id`, on both `using` and `with check`.
4. **Trigger-owned** — no client write policy at all.

No `using (true)` appears on any administrative table.

### Trigger-owned tables

These accept **no** direct client writes. A client can never award itself
progress:

| Table | Written only by |
|---|---|
| `journey_progress` | `handle_journey_completion()` |
| `consistency_days` | `record_active_day()` |
| `user_collection_progress` | `recalculate_collection_progress()` |
| `user_milestones` | `evaluate_milestones()` — no INSERT policy exists |
| `content_audit_logs`, `content_status_history` | SECURITY DEFINER triggers; no write policy for anyone |
| `activity_events` | client may INSERT only; no UPDATE/DELETE policy — append-only |

`user_milestones.seen_at` is the single exception: a reader may mark their own
milestone seen, and nothing else.

## 8. Authentication flow

Google OAuth via `lovable.auth.signInWithOAuth("google")`. Email/password is
disabled on the project, and the sign-in screen says so ("No password
required").

On any insert into `auth.users`, `handle_new_user()` creates in one
transaction: a `profiles` row, a `user_roles` row (`free_user`), and a
`user_preferences` row. It is SECURITY DEFINER with a fixed `search_path`.

Identity always comes from `auth.uid()`. No table trusts a client-supplied user
id — `set_audit_user()` overwrites `created_by`/`updated_by` from `auth.uid()`
rather than accepting the payload.

## 9. User-data ownership model

Every user-owned table carries `user_id` referencing `auth.users` with
`ON DELETE CASCADE`. Deleting an account removes that reader's sessions,
progress, reflections, prayers, favorites, milestones and events.

Content tables reference `auth.users` through `created_by`/`updated_by` with
`ON DELETE SET NULL`, so **deleting a staff account never deletes published
content**. This was verified explicitly: no content table cascades from
`auth.users`.

## 10. Private-data protection

Reflections and prayers are the only genuinely private text in the product.

- **No admin policy exists for them.** Not for editors, not for super admins.
  This is deliberate: personal reflections are not administrable content.
- Milestone evaluation reads **counts only** (`countReflections()`,
  `countPrayers()` issue HEAD requests), so no body crosses the wire.
- The activity log records journey and locale only — no excerpt, no character
  count.
- Deletes are soft, so an accidental delete is recoverable.
- Zod validation messages do not echo the input value, so a too-long reflection
  cannot reach error telemetry through a validation error.
- `reportLovableError` is called from exactly one place, passing only a
  boundary label.
- The share payload is `.strict()` with an explicit forbidden-key scan.

All of the above is asserted by tests; §12 says which.

## 11. SQL functions and triggers

28 functions. Every SECURITY DEFINER function sets `search_path = public`
explicitly, which is what stops a caller-controlled search path from resolving
its table references somewhere else.

Behaviour proven by the suites in §12: workflow transition legality,
self-approval blocking, audit immutability, version snapshots, the scripture
licensing backstop, journey completion, active-day de-duplication, collection
progress, and milestone idempotency.

### Two bugs found by executing the SQL for the first time

**`log_content_audit()` — `record "new" has no field "id"` (fixed in 0007).**
The function read `new.id`, but `daily_journeys` is keyed by
`(journey_date, language_code)` and has no `id` column. PL/pgSQL resolves field
references at execution time, so the trigger installed cleanly in 0004 and only
failed when a Daily Journey was actually assigned — the single most routine
editorial action in the product. Fixed by resolving the entity through
`to_jsonb()`, falling back to `journey_id`.

**`handle_new_user()` — nameless profiles (fixed in 0009).** It read only
`raw_user_meta_data ->> 'display_name'`. Google sends `full_name`, `name` and
`picture`, so every account — Google being the only sign-in method — landed
with a NULL display name and avatar. Fixed by reading the keys providers
actually send, falling back to the email local part, plus a backfill that never
overwrites a non-null value.

## 12. Test execution

```bash
npm run test                                                    # 458 application tests
supabase/tests/local/verify-migrations.sh                       # applies 0001-0009
psql -v ON_ERROR_STOP=1 -d lumena_migration_check -f supabase/tests/rls-content.test.sql
psql -v ON_ERROR_STOP=1 -d lumena_migration_check -f supabase/tests/rls-progress.test.sql
```

| Suite | Assertions | Covers |
|---|---|---|
| Application (Vitest) | 458 | domain logic, state machines, schemas, service orchestration, privacy of the share payload |
| `rls-content.test.sql` | 35 | anonymous/public access, editor limits, self-approval, publisher rights, audit immutability, licensing, Daily Journey conflicts |
| `rls-progress.test.sql` | 52 | cross-user isolation, admin exclusion from private text, trigger-owned tables, journey completion, consistency, milestone idempotency, favorites, leakage checks |

**All 545 pass.** They ran against PostgreSQL 17 with RLS genuinely enforced —
the shim grants the `anon`/`authenticated` roles the same privileges Supabase
does, so a policy denial is a real denial and not a missing GRANT.

### A correctness bug in the test helper itself

`assert_rejected` treated only a raised exception as denial. RLS denies in two
ways: `WITH CHECK` raises, but `USING` **silently filters rows**, so a properly
blocked `UPDATE` "succeeds" having changed nothing. Ten of the sixteen
assertions were `UPDATE`/`DELETE`. The helper now passes on an exception **or**
zero affected rows, and fails if any row changed — otherwise the suite would
have reported false failures and, worse, could have been "fixed" by relaxing a
policy.

### Not executed

- Nothing against the **live** project. Every result above comes from a local
  PostgreSQL instance with a Supabase shim. The shim reproduces `auth.uid()`
  and `auth.users` faithfully, but it is not Supabase.
- End-to-end browser tests (real signup → journey → completion).
- `supabase gen types` — requires Docker, which is unavailable here.

## 13. Type generation

```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

Run this **after** `db push`. Today `types.ts` correctly declares an empty
schema, because the live database is empty; it must be regenerated the moment
migrations are applied, or the typed client will contradict the database.

Until then, hand-written row types remain the interim contract:
`src/lib/content/rows.ts`, `src/lib/puzzle/rows.ts`, `src/lib/journey/rows.ts`,
each marked `TODO(phase-5)`.

## 14. Deployment requirements

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting
  environment (Lovable Cloud sets these automatically).
- Set `SUPABASE_SERVICE_ROLE_KEY` **only** as a server-side secret. It must
  never appear in a `VITE_`-prefixed variable, since those are inlined into the
  browser bundle at build time.
- Apply migrations before the first deploy that reads real data.
- Configure the Google OAuth redirect URL for the production origin.

## 15. Troubleshooting

| Symptom | Cause |
|---|---|
| "Missing Supabase environment variable(s)" | `.env` absent or not `VITE_`-prefixed. Vite inlines at build time — restart the dev server after editing |
| Every query returns `[]` for a signed-in user | RLS denying, not an empty table. Check the policy with `set local role authenticated` and a JWT claim |
| `permission denied for table X` | a missing GRANT, not RLS. Supabase grants `anon`/`authenticated` by default |
| "Database error saving new user" | `handle_new_user()` raised. It is SECURITY DEFINER — check `profiles`, `user_roles`, `user_preferences` constraints |
| `record "new" has no field "id"` | the 0007 bug; confirm 0007 was applied |
| Sign-in does nothing | email/password is disabled on this project; only Google is enabled |

## 16. Recovery from a failed migration

`supabase db push` applies each migration in its own transaction, so a failure
rolls that file back entirely — the database is left at the last fully-applied
migration, never half-way through one.

1. Read the error. Do not re-run blindly.
2. Reproduce locally: `supabase/tests/local/verify-migrations.sh`.
3. Fix forward with a new numbered migration. Do not rewrite an applied file —
   `supabase_migrations.schema_migrations` records what ran, and editing
   history makes environments unreproducible.
4. Re-run the local verification, then push.

Enum values cannot be dropped (`ALTER TYPE … DROP VALUE` does not exist);
reversing one means recreating the type. This is why 0002 is isolated.

## 17. Remaining mocks

Nothing was deleted. Full table in `mock-data-migration-status.md`.

| Module | Consumers | Classification |
|---|---|---|
| `mock-data.ts` | `/`, `/collections`, `/collections/$slug`, `/today`, `/my-journey`, `/progress`, `/settings`, `CollectionCard`, `WordSearch`, hero components | **Must be replaced before launch** — except the hero components, which are static illustrations |
| `mock/favorites.ts` | `/favorites` | Must be replaced; `journeyApi` is ready |
| `mock/milestones.ts` | `/profile`, `MilestoneCard` | Must be replaced; `journeyApi.milestones()` is ready |
| `mock/companions.ts` | `/together`, `/profile`, 4 components | **Can remain** — blocked by Phase 7 |
| `mock/groups.ts` | `/together` | **Can remain** — blocked by Phase 7 |
| `mock/notifications.ts` | `/notifications`, preferences, menu | **Can remain** — blocked by Phase 8 |
| `SELECTION_COLORS` | theming | **Safe permanently** — UI configuration, not content |

`mock-data.ts → TODAY.scripture` contains **NIV** wording, a licensed
translation. It must not reach production. Migrating `/today` to database
content resolves it automatically: the `enforce_scripture_text_storage()`
trigger permits stored verse text only from sources marked
`allows_text_storage`, and that backstop is tested.

localStorage remains the primary store for locale, theme and notification
preferences. `user_preferences` exists to receive them; the migration is not
written.

## 18. Readiness for Prompt 6

Blocking, in order:

1. `supabase link` + `supabase db push` — needs an access token and the
   database password.
2. Re-run both RLS suites against the live project.
3. Regenerate `types.ts`.

Non-blocking but worth deciding before billing work: email/password auth is
disabled while `src/lib/auth/service.ts` still implements it, so that module is
currently dead code — either enable the provider or retire the module.
