# User Progress — Implementation Notes

Date: 2026-07-29
Phase: 4 (roadmap `03-implementation-roadmap.md`)
Migration: `supabase/migrations/0006_journey_progress_domain.sql`

---

## 1. The division of labour

```
TypeScript decides what the reader may DO      transitions, step access, validation
PostgreSQL decides what the reader HAS DONE    progress, active days, milestones
```

Everything in `src/lib/journey/` above the repository is advisory: it gives a
correct, immediate answer so the UI does not have to wait for a round trip. The
database is what makes the answer true.

Concretely, a client can only ever write to five tables — `journey_sessions`,
`journey_step_progress`, `user_reflections`, `user_prayers`, `favorites`. The
tables that constitute *achievement* have no client write policy at all:

| Table | Written by |
|---|---|
| `journey_progress` | `handle_journey_completion()` trigger |
| `consistency_days` | `record_active_day()` |
| `user_collection_progress` | `recalculate_collection_progress()` |
| `user_milestones` | `evaluate_milestones()` — **no INSERT policy exists** |
| `activity_events` | client may INSERT; no UPDATE or DELETE policy — append-only |

So a forged request cannot award itself a milestone or a streak. The worst it
can do is claim to have finished a journey, which is the one thing a reader
could also do by simply clicking through — and the trigger recomputes the
consequences from source rows either way.

## 2. Modules

| Module | Responsibility |
|---|---|
| `journey/state.ts` | Session state machine, step model, completion maths |
| `journey/consistency.ts` | "Days in the Word" — local dates, runs, week strip |
| `journey/milestones.ts` | Criteria registry (pure functions), evaluation, visibility |
| `journey/schemas.ts` | Zod schemas, including the share-safe payload |
| `journey/errors.ts` | `progress/*` error codes + i18n keys |
| `journey/rows.ts` | Hand-written row types for migration 0006 |
| `journey/repository.ts` | The only module that touches supabase-js |
| `journey/services.ts` | Session, private-response, favorites, consistency, milestone and history services |
| `journey/api.ts` | The surface React consumes, plus TanStack Query keys |

## 3. Three completion concepts, never conflated

* **Puzzle completion** — every word found. One step.
* **Journey completion** — every *required* step complete.
* **Collection completion** — every published journey in a collection completed.

`puzzle_completed` is its own session status because the first can happen
without the second. It means *the puzzle is finished*, not *the journey is
nearly finished* — the service sets it whenever the puzzle step completes,
whether or not a required reflection still remains.

`completed` is terminal. Replaying a journey opens a **new** session flagged
`is_replay`, which is what stops a second reading from moving the first
completion date or re-awarding a first-completion milestone.

## 4. Step access is deliberately permissive

Only steps sitting behind an unfinished **required** step are gated. Earlier
steps stay open so a reader can go back and re-read the passage, and an
unfinished *optional* reflection never blocks anything. Trapping people in a
linear flow makes a devotional feel like a form.

## 5. Time zones and "Days in the Word"

The reader's local date is derived through `Intl.DateTimeFormat` (TypeScript)
and `moment at time zone` (SQL), never by offset arithmetic — only the ICU/IANA
database knows when São Paulo shifted or exactly when New York changes. A reader
finishing at 22:00 in São Paulo is credited to that day, not to tomorrow's UTC
date.

Product rules encoded in `consistency.ts` rather than left to UI copy:

* One qualifying activity grants one active day. Three journeys is still one day
  — this is a rhythm, not a score.
* A run stays "current" through **yesterday**, so someone who has not opened the
  app yet today is never told their rhythm ended.
* `longestRun` is permanent. Missing a day never erases history.
* There is no "you broke your streak" state. `encouragementKey()` has four
  outcomes and all of them are neutral or warm.

An invalid stored time zone falls back to UTC in both languages rather than
throwing — a bad preference must never block recording that someone read today.

## 6. Milestones

Definitions are **data**, not code: adding a milestone is an INSERT, not a
deploy. `milestones.ts` holds a registry of small pure functions keyed by
criteria, so a new criteria type is a new function rather than another branch in
a growing conditional.

`user_milestones` stores `milestone_version` — the definition version in force
when it was earned — so retuning a threshold later cannot rewrite history.
`visibleMilestones()` trusts the earned list over recomputed criteria for the
same reason.

Hidden milestones stay invisible until earned: a pleasant surprise rather than a
checklist.

Names describe an **action the reader took**, never spiritual standing: "Seven
Days in the Word", not "Faithful Servant".

Idempotency has three layers: the primary key `(user_id, milestone_id)`, the
`on conflict do nothing` in `evaluate_milestones()`, and `alreadyEarned` in
`evaluateNewMilestones()`. Only the first is a guarantee.

## 7. Privacy of reflections and prayers

These are the only genuinely private text in the product, and the design treats
them that way:

* **No admin policy exists.** Migration 0006 deliberately grants no content
  staff, support or super-admin read access. Personal reflections are not
  administrable content.
* **Milestone evaluation never reads a body.** `MilestoneService.snapshot()`
  uses `countReflections()` / `countPrayers()` — HEAD counts, so the text never
  crosses the wire. A test asserts a seeded body cannot appear in a snapshot.
* **The activity log carries no text.** `reflection_saved` records only the
  journey and locale; not a character count, not an excerpt. A test asserts the
  body cannot be found anywhere in the appended events.
* **Deletes are soft**, so an accidental delete can be recovered, with a
  documented 30-day retention purge.
* `logger.ts` already forbids logging private prayers and reflections.

## 8. The share-safe payload

`shareSafeCompletionSchema` is `.strict()`, which is the entire point: an
unknown key **fails** rather than being silently forwarded. If someone later
spreads a session object into a share call, it throws instead of leaking.

Two layers run in `buildShareSafeCompletion()`:

1. An explicit forbidden-key scan (`reflection`, `prayer`, `body`, `email`,
   `userId`, `sessionId`, `journeyId`, `id`, …) giving a precise error —
   *"reflection is private and can never be shared"*.
2. `.strict()` parsing, which catches everything the first layer did not name.

Only a date is shareable, never a precise timestamp: the exact minute someone
finished reading is behavioural data, not an achievement.

`journeyApi.buildShareCard()` takes `unknown` on purpose — passing a whole row
must fail validation, not be quietly trimmed to the safe fields.

## 9. Idempotency of activity events

Every event carries an idempotency key, unique per `(user_id, idempotency_key)`,
appended with `ignoreDuplicates` so a repeat is a silent no-op:

| Event | Key | Effect |
|---|---|---|
| `journey_started` | `journey_started:<sessionId>` | once per session |
| `journey_resumed` | `journey_resumed:<sessionId>` | once per session, however many times the reader returns |
| `journey_step_completed` | `…:<sessionId>:<stepType>` | redoing a step is a correction |
| `reflection_saved` | `reflection_saved:<journeyId>` | editing ten times is one thing the reader did |
| `journey_completed` | `journey_completed:<sessionId>` | written by the trigger, not the client |

## 10. Testing

### Executed — 174 unit tests

| Suite | Covers |
|---|---|
| `state.test.ts` | Every transition, terminal `completed`, required vs optional steps, completion percent, step gating, navigation |
| `consistency.test.ts` | São Paulo/Tokyo/New York local dates, a US DST boundary, leap day, run continuity through yesterday, permanence of `longestRun`, week strip |
| `milestones.test.ts` | Registry coverage of every criteria and category, threshold edges, hidden reveal, idempotent re-evaluation, retuned-threshold safety |
| `schemas.test.ts` | Every entity schema; the share payload gets a case per forbidden key, plus "reject a whole session row" |
| `services.test.ts` | Orchestration against an in-memory repository that reproduces the real unique constraints |

The fake repository issues real UUIDs, because one that handed out `"id-1"`
would let a service pass here and fail against PostgreSQL.

### Written but NOT executed

Nothing new. The Phase 2 RLS suite (`supabase/tests/rls-content.test.sql`)
remains unrun.

### Not implemented

* An RLS suite for migration 0006. **The privacy claims in §7 are unverified
  against a live database.** This is the highest-value thing to write next: the
  assertions that matter are (a) one reader cannot select another's reflection,
  (b) no admin role can either, (c) `user_milestones` refuses a direct INSERT,
  (d) `journey_progress` refuses a direct UPDATE.
* Integration and E2E (signup → journey → completion → milestone), which need a
  live database.

## 11. Known limitations

1. **Migration 0006 has never been executed.** No Supabase project exists. As
   with 0003–0005, syntax errors would surface on first `supabase db push`.
2. **Step requirements are not a content field.** `buildSteps({requireReflection,
   requirePrayer})` accepts them, but `journeys` has no column for them, so
   callers pass them explicitly and the default is optional-both. Add columns in
   Phase 9 if editors need per-journey control.
3. **History search is unverified.** `listHistorySessions()` filters on an
   embedded `journey_translations.title` via PostgREST `!inner`. The syntax
   needs checking against a live database; filtering in the browser instead
   would silently drop matches beyond the first page, so it was not done that
   way.
4. **`elapsed_ms` is client-reported.** It is bounded to 24 hours by schema and
   CHECK constraint, but it is telemetry, not an authoritative measurement.
   Completion itself does not depend on it.
5. **Favourite toggling is read-then-write.** Two rapid taps could race; the
   partial unique indexes make the loser fail rather than create a duplicate, so
   the worst case is an error, never a double row.
6. **`consistency_summary()` is preferred over local computation**, with the
   local path used only when the RPC returns nothing. Both are tested; only the
   local one has been *run*.
7. **No UI is wired yet.** `/my-journey`, `/progress`, `/favorites` still read
   mock data — see `mock-data-migration-status.md`. Nothing was deleted.
8. **Row types are hand-written** (`rows.ts`), same as the content domain.
   Replace with `supabase gen types typescript` once a project is linked.
9. **Retention purge not implemented.** Soft-deleted reflections and prayers are
   documented as purged after 30 days; the job does not exist.

## 12. Next steps

1. Create a Supabase project, apply migrations 0001–0006, run the Phase 2 RLS
   suite, and write the 0006 RLS suite described in §10.
2. Wire `/my-journey`, `/progress` and `/favorites` to `journeyApi` with
   TanStack Query, adding loading/empty/error states inside the approved visual
   language.
3. Migrate the localStorage preference prototype (theme, locale, difficulty,
   selection colour) into `user_preferences`, including time zone.
4. Milestone celebration UI driven by `unseenMilestones()` / `markMilestonesSeen()`.
