# Puzzle Domain

Date: 2026-07-29
Phase: 3 — infrastructure for the word-search engine
Status: infrastructure complete. **The generation algorithm is deliberately not implemented** — it is Phase 4.

---

## 1. Purpose

Everything a word-search engine needs in order to generate, validate, persist, replay and audit puzzles — with the algorithm itself left as a single, well-defined hole.

The goal is that Phase 4 writes one function (`PuzzleEngine.generate`) and nothing else has to change. Schema, services, caching, events, accessibility and admin tooling are already in place around that seam.

## 2. Architecture

```
   React renderer  ──────────────► puzzleApi (typed surface)
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
 PuzzleTemplateService        PuzzleInstanceService          PuzzleSessionService
 (recipes, versions)          (generate / replay)            (play state, events)
        │                               │                               │
        └──────────────┬────────────────┴───────────────┬───────────────┘
                       ▼                                ▼
              PuzzleCacheService                 PuzzleRepository
              (TTL, Redis-ready)                 (the ONLY Supabase caller)
                                                        │
                                                        ▼
                                          PostgreSQL + RLS + triggers

              PuzzleEngine  ◄── injected into PuzzleInstanceService
              (Phase 4; pure, deterministic, no I/O)
```

Two rules hold this together:

1. **The engine is pure.** No database, no clock, no React, no randomness except a seed. That is what makes puzzles reproducible and the algorithm testable in isolation.
2. **The repository is the only Supabase caller.** No service, component or route issues a query directly.

## 3. Domain model

| Concept | Meaning |
|---|---|
| **Template** | The recipe: journey + locale + difficulty + **version**, plus grid, direction, overlap, seed and hint rules |
| **Instance** | One generated puzzle: grid, placements, seed, engine version, content hash |
| **Generation request** | An audited attempt to generate — who, what, how long, and what failed |
| **Session** | One sitting: lifecycle and timing |
| **Progress** | Durable per-user-per-puzzle state that outlives any session |
| **Event** | An append-only, idempotent record of something that happened |
| **Attempt** | One committed selection, right or wrong |
| **Statistics** | Per-instance aggregates, trigger-maintained |

Session and progress are separate on purpose: a reader may play the same puzzle across several sittings, and best time / completion must survive each one ending.

## 4. Flow

**Play**

```
journey + locale + difficulty
   → active template            (PuzzleTemplateService, cached)
   → seed = f(strategy, template, version, user?, date?)
   → instance already exists?   → yes: load it (replay)
                                → no:  engine.generate() → persist
   → session started or resumed (one live session per user per puzzle)
   → selections validated client-side, progress saved, events appended
   → completion → triggers update progress + statistics
```

**Author**

```
editor edits puzzle rules
   → template has instances? → yes: create a NEW VERSION
                             → no:  edit in place
   → activate → previous active template stands down → caches invalidated
```

## 5. Database (migration 0005)

Eight tables: `puzzle_templates`, `puzzle_instances`, `puzzle_generation_requests`, `puzzle_sessions`, `puzzle_progress`, `puzzle_events`, `puzzle_attempts`, `puzzle_statistics`. All UUID-keyed with timestamps, foreign keys, indexes and RLS.

**Migration 0005 replaces `journey_puzzle_settings`** (Phase 2) with `puzzle_templates`. That table was 1:1 with a journey and could not express locale, difficulty or version — and version is what makes replay possible. Keeping both would have been a duplicate content model, so existing rows are migrated and the old table dropped. This is flagged `-- DESTRUCTIVE:` in the file.

Constraints that carry real weight:

- `unique (template_id, template_version, seed, engine_version)` on instances — **the reproducibility key, enforced by the database**, not merely by convention.
- `unique (session_id, idempotency_key)` on events — makes idempotency structural.
- Partial unique index: one **active** template per journey+locale+difficulty; one **live** session per user per puzzle.
- `puzzle_instances` has no UPDATE or DELETE policy: a generated puzzle is immutable. Regenerating produces a new instance.

Triggers: `enforce_template_immutability` (freezes rules once puzzles exist), `refresh_puzzle_statistics`, `sync_puzzle_progress` (mirrors completions into durable progress).

## 6. Services

| Service | Responsibility |
|---|---|
| `PuzzleTemplateService` | List, create, version-aware update, duplicate, activate, archive |
| `PuzzleInstanceService` | `getOrGenerate` (replay-first), `generate`, row ↔ domain mapping |
| `PuzzleSessionService` | Start/resume, pause, complete, save progress, record events |
| `PuzzleValidationService` | Selection validation, completion maths, placement verification |
| `PuzzleCacheService` | TTL cache with namespaced keys |
| `GenerationQueueService` | Enqueue with idempotency, mark running/succeeded/failed |
| `PuzzleRepository` | Every database call in the domain |
| `puzzleApi` | The typed surface React consumes |

## 7. Validation

Zod schemas for template, generation request, session update, progress update, event, attempt, coordinate, selection, placement and grid metadata — in `schemas.ts`, mirroring the CHECK constraints in 0005.

Two validations worth calling out:

- **Grid metadata rejects ragged grids.** A row of the wrong length would silently corrupt every coordinate lookup downstream.
- **`completionPercent` is recomputed server-side** from the word list. A client cannot declare itself finished.

## 8. Caching

Cache-aside with namespaced keys and per-kind TTLs:

| Data | TTL | Why |
|---|---|---|
| Instance | 24 h | Immutable by construction |
| Template | 10 min | Changes only when an editor activates a version |
| Word metadata | 15 min | Published lists change rarely |
| Daily Journey | 30 min | Fixed once assigned |
| Statistics | 5 min | Aggregates tolerate lag |

`null` results are never cached, so a missing row cannot be pinned as absent. **Session and progress are never cached** — they change constantly and a stale read would show the wrong state.

The interface is async and string-keyed although the implementation is a `Map`. That makes Redis a configuration change: every caller already awaits, and nothing depends on `Map`.

## 9. Replay

Replay is a lookup, not a recomputation. `getOrGenerate` derives the seed, looks for an instance with that reproducibility key, and only calls the engine on a miss. Loading yesterday's puzzle re-reads the stored grid — it never re-runs the algorithm, so an engine change cannot alter a puzzle a reader has already seen.

## 10. Deterministic generation

Four values must match for two puzzles to be identical:

```
templateId : templateVersion : seed : engineVersion
```

- **Seeded PRNG only** (`createRng`, mulberry32). No `Math.random`, no `Date.now`, no iteration over unordered collections.
- **Seed strategies:** `per_journey` (everyone shares one puzzle), `per_user` (stable per reader), `per_day` (stable within a date). All derived by FNV-1a hashing — never random.
- **`contentHash`** digests grid + placements, sorted so placement *order* cannot change the hash. A mismatch between two runs is a determinism regression, which is exactly what the Phase 4 suite must assert.
- **Bumping the engine version produces new instances rather than mutating old ones** — old puzzles keep replaying under the old version.

## 11. Accessibility

`navigation.ts` is a pure reducer shared by keyboard, mouse and touch. That sharing is deliberate: when pointer and keyboard paths diverge, the keyboard path rots. Here both produce identical state.

- Arrows, Home/End, PageUp/PageDown; Space **and** Enter both toggle selection; Escape cancels.
- Movement **clamps** at edges rather than wrapping — wrapping is disorienting without sight.
- Roving tabindex: exactly one cell is tabbable.
- Labels speak position as "row 3, column 5" and state as a word, so "found" is never colour-only.
- `keyToAction` returns `null` for keys it does not own, so the host does not swallow them.
- Reduced motion returns duration **0**, not a shorter animation — vestibular triggers are about movement existing at all.

## 12. Testing

**117 new tests; 222 passing overall.**

| Suite | Covers |
|---|---|
| `grid.test.ts` | Direction vectors and inverses, category mapping, path geometry, bounds, serialization, accent separation |
| `engine.test.ts` | PRNG determinism, seed strategies, reproducibility keys, content hashing, placeholder engine failure |
| `events.test.ts` | Idempotency-key derivation, once-per-session events, batch dedup |
| `validation-service.test.ts` | Forward/reverse matching, invalid lines, bounds, completion, placement verification |
| `navigation.test.ts` | Movement, clamping, selection lifecycle, keyboard/pointer parity, labels, reduced motion |
| `schemas.test.ts` | Template rules, ragged grids, coordinate bounds, event keys, request validation |

Three genuine test bugs surfaced while writing these, worth recording: `Object.is(0, -0)` is `false` (negating a zero vector component fails a strict comparison); grids are square, so a 1×3 fixture is invalid; and the schema's 6-cell minimum rejects small toy fixtures.

**Not tested:** the repository and services against a real database — no Supabase project exists, so migration 0005 has never been executed.

## 13. Performance

- **Replay-first**: an existing puzzle is a single indexed lookup.
- **Statistics are trigger-maintained**, so reads never scan sessions.
- **Indexes** on every query path: template lookup, pending queue, user sessions, session events.
- `puzzle_progress.found_words` is an array, not a row per word — small, append-only, always read whole.
- The engine is pure, so it can move to a server function or worker in Phase 4 with no call-site changes.
- Grid state is plain data; the renderer can memoize per cell to avoid re-rendering the whole grid on each selection.

## 14. Security

- **Sessions, progress, events and attempts are strictly owner-scoped** by RLS (`auth.uid() = user_id`). A reader can never see or modify another reader's play state.
- Event and attempt inserts additionally verify the **session belongs to the caller**, so a forged `session_id` cannot attach rows to someone else's session.
- Events and attempts are **append-only** — no UPDATE or DELETE policy.
- Templates and instances are staff-write, public-read only for published journeys.
- Statistics are safe to expose because rows contain counts, never identities.
- `createRng` is explicitly **not** cryptographic and must never be used for tokens.

**Solution visibility — a deliberate decision.** Placements ship with the puzzle rather than being withheld until completion. For a competitive game that would be a cheating vector; for a meditative Bible app with no leaderboards, no scores and no stakes, the cost (a server round-trip per hint) buys nothing. If stakes ever appear, split `placements` into a separate table with its own RLS; the repository is the only thing that would change.

## 15. What Phase 4 must do

1. Implement `PuzzleEngine.generate` satisfying the contract in `engine.ts`: deterministic, total (unplaceable words go in `unplacedWords` rather than throwing), pure.
2. Inject it: `new PuzzleInstanceService(repo, cache, realEngine)`.
3. Assert determinism — same seed twice, deep-equal output and identical `contentHash`.
4. Assert `verifyPlacements` passes on generated output (catches off-by-one and direction-sign bugs).
5. Refactor `WordSearch.tsx` onto `navigation.ts` and `validation-service.ts`, preserving the approved visuals and interaction model.
6. Implement hints from placements (`hint_policy`, `max_hints` are already stored).

## 16. Known limitations

1. **Migration 0005 has never been executed** — no Supabase project. Syntax errors are possible on first `db push`.
2. **The engine is a placeholder that throws.** Any code path reaching generation fails loudly — by design, so a missing algorithm cannot masquerade as an empty puzzle.
3. **`GenerationQueueService` records state but has no worker.** Enqueue and status transitions exist; nothing drains the queue yet.
4. **The cache is per-process.** Correct, but not shared between server instances until a Redis store is configured.
5. **Row types are hand-written** (`rows.ts`), pending `supabase gen types typescript`.
6. **No integration or RLS tests executed** for the puzzle tables. The Phase 2 RLS suite is the pattern to follow.
7. **`WordSearch.tsx` still uses the Phase 0 prototype** (`lib/word-search.ts`, fixed seed 42). Untouched deliberately — replacing it is Phase 4 work and would change approved visuals.
