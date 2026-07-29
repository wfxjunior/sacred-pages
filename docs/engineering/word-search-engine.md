# Word-Search Engine

Date: 2026-07-29
Phase: 4 — production word-search engine
Engine version: **1.0.0**
Status: implemented; 289 tests passing (67 new).

---

## 1. Purpose

Turns a journey's word list into a solvable, attractive, **reproducible** word-search grid — and provides the selection validation, hints, solution handling and quality scoring that surround it.

The one property everything else rests on: the same seed, template version, locale, word list and engine version always produce the **identical** puzzle. That is what lets a reader close the app mid-puzzle and find the same grid tomorrow, and what lets the platform store a puzzle once and replay it forever.

## 2. Architecture

```
                      generatePuzzle(input)
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
  prepareWords          resolveDirections       resolveAlphabet
  (normalize,           (apply reverse /        (locale letters,
   dedupe, reject)       diagonal rules)         accents included)
       │                      │                      │
       └──────────┬───────────┘                      │
                  ▼                                  │
            placeWords  ──► backtracking search      │
                  │         └► greedy fallback       │
                  ▼                                  ▼
             validateGrid  ◄──────────────────  fillGrid
                  │
                  ▼
             scorePuzzle ──► EngineResult
```

Two streams of randomness, never shared: `seed→"placement"` and `seed→"filler"`. Adding a word therefore changes placement without scrambling every filler letter in the grid — which matters enormously when diagnosing a generation problem.

The engine is **pure**: no database, no clock (injectable), no DOM, no `Math.random`, no mutation of inputs.

## 3. Modules

| Module | Responsibility |
|---|---|
| `types.ts` | Internal types: `MutableCell`, `Candidate`, `FailedWord`, metrics |
| `constants.ts` | Version, limits, scoring weights, quality thresholds |
| `alphabet.ts` | Locale filler alphabets with frequency weights |
| `rng.ts` | Seeded RNG, shuffle, weighted pick, sub-seeds |
| `mutable-grid.ts` | create / clone / canPlace / place / remove / fill / validate |
| `candidates.ts` | Candidate enumeration, scoring, direction and word ordering |
| `backtracking.ts` | DFS search with bounded backtracking + greedy fallback |
| `quality.ts` | 0–100 quality score across five factors |
| `generate.ts` | Orchestration → `EngineResult` |
| `hints.ts` | Four hint kinds, policy enforcement, escalating ladder |
| `solution.ts` | Server-side completion verification, replay, stored-puzzle checks |
| `index.ts` | Public surface, `PuzzleEngine` implementation, serialization |

## 4. Input and output model

Input is the Phase 3 `GenerationInput`, unchanged. Output is `EngineResult`, which **extends** `GenerationOutput` with `success`, `qualityScore`, `quality`, `failedWords` and `metrics` — additive, so every Phase 3 caller still compiles.

Two optional fields were added to `PuzzleWord`: `required` (default `true`) and `weight` (default `0`). Both are optional, so nothing breaks.

## 5. Seed algorithm and RNG

- **PRNG:** mulberry32 — small, fast, and identical across JS runtimes. Explicitly **not** cryptographic; never use it for tokens.
- **Seed derivation:** FNV-1a over the strategy's parts. `per_journey` hashes template + version; `per_day` adds the date; `per_user` adds the user id.
- **Sub-seeds:** `subSeed(seed, "placement")` and `subSeed(seed, "filler")` give independent streams.
- **Consumption order is part of the contract.** Candidate shuffling draws per word; filling draws exactly once per empty cell, row-major. Any refactor that changes draw order changes output and must bump `ENGINE_VERSION`.

## 6. Word normalization

Reuses `lib/content/normalize.ts` — the same folding the content platform and database already use.

- Display form keeps accents: **ORAÇÃO**
- Matching form folds them: **ORACAO**
- Ñ never folds (Spanish distinct letter): **AÑO** ≠ **ANO**

The normalized form is **recomputed** from the display spelling rather than trusted from the input, so a stale stored value cannot desynchronise matching from display.

## 7. Direction model

Eight compass vectors: `E W N S NE NW SE SW`. `resolveDirections` filters the template's list by `allowDiagonal` and `allowReversed`; "reversed" means any direction a reader traces right-to-left or bottom-to-top (`W`, `N`, `NW`, `SW`).

The six-category editor model (horizontal / vertical / diagonal + reverses) is a **view** over these vectors via `toDirections` / `toCategories`, never a second source of truth.

## 8. Placement strategy

**Word order — longest first.** A long word has the fewest legal positions, so placing it into an empty grid succeeds far more often than squeezing it in last. Required words precede optional; `weight` then length then normalized value break ties, keeping the order total.

**Candidate scoring** (higher is better):

| Factor | Weight | Rationale |
|---|---|---|
| Overlap | 10 | Intersections are what make a puzzle feel woven rather than scattered |
| Direction variety | 3 | Prevents an all-horizontal grid |
| Centrality | 2 | Border-hugging words are easy to spot and leave the middle bare |
| Edge avoidance | 1 | Same, at cell granularity |

Candidates are shuffled with the seeded RNG (so equal scores vary between seeds) then sorted with a **total** comparator — score, then row, column, direction. No two distinct candidates ever compare equal, so ordering never depends on sort stability.

Candidates are capped at 256 per word: a 32×32 grid in 8 directions yields thousands, and the best few hundred are ample.

## 9. Backtracking strategy

Depth-first search: place word *n*, recurse to *n+1*, and on failure undo and try the next candidate. Bounded by `maxAttempts` (candidates per word, default 200) and `maxBacktracks` (undos per run, default 500), so it always terminates.

When the budget is exhausted, a **greedy fallback** places what it can in one pass and reports the rest. That fallback is what makes the engine *total*: a puzzle with nine of ten words is publishable with a warning; a generator that throws is not.

Words longer than the grid are rejected before the search — no amount of backtracking fits a 15-letter word into a 10-cell grid.

## 10. Collision and overlap rules

A cell may be reused **only when it already holds the same normalized letter** — that is precisely what an intersection is. Any differing letter is a hard conflict.

`overlapStrategy: "none"` rejects reuse outright, producing a grid with zero intersections (and a quality warning). `allowed` and `encouraged` both permit it; `encouraged` differs in that the scoring weight makes overlapping candidates win.

Correct undo depends on `placementIds` per cell: removing a word clears a cell **only when no other placement still claims it**. Without that bookkeeping, undoing an overlapping word would punch a hole through a word that is still placed — a bug that would surface as an unsolvable puzzle much later.

## 11. Grid filling

Empty cells are filled row-major, one RNG draw each, from a locale alphabet.

**Fillers include accented characters**, and this is not cosmetic. If the words contain "ORAÇÃO" but every filler is plain A–Z, then every accented cell in the grid is guaranteed to belong to a word — the puzzle gives itself away at a glance. Because matching runs on the normalized form, a filler "Ç" simply behaves as a "C" and can never create a false match.

Strategies: `uniform` (equal weights), `weighted` (language letter frequencies — the default), `word_letters` (letters drawn from the puzzle's own words; hardest, because every filler is a letter the reader is hunting).

## 12. Difficulty behaviour

Presets in `grid.ts` (`DIFFICULTY_PRESETS`), applied via the template:

| | Gentle | Balanced | Challenging | Expert |
|---|---|---|---|---|
| Grid | 10×10 | 12×12 | 14×14 | 16×16 |
| Words | 6 | 8 | 10 | 12 |
| Directions | E, S | E, S, SE, NE | all 8 | all 8 |
| Reversed | no | no | yes | yes |

## 13. Quality scoring

0–100 across five weighted factors:

| Factor | Weight | Measures |
|---|---|---|
| Placement | 50 | Fraction of words placed — a puzzle missing words is broken regardless of elegance |
| Overlap | 20 | Intersections, targeting ~1 per word |
| Direction diversity | 15 | Normalized Shannon **entropy**, not a count — eight directions used once each beats one used thirty times |
| Distribution | 10 | Quadrant balance; clustering scores poorly |
| Density | 5 | Word-cell occupancy, peaking near 45% |

Bands: `unacceptable` <40, `poor` <60, `acceptable` <75, `good` <90, `excellent` ≥90. `isPublishable` requires ≥60. Warnings are emitted for unplaced words, zero intersections, low diversity, clustering and excessive density.

## 14. Failure behaviour

**Throws** (`PuzzleEngineError`) only for structurally invalid input: empty word list, grid outside 6–32, no usable directions, more than 40 words, or a grid that fails its own structural validation (an engine bug, which must be loud).

**Never throws** for content problems. Every word that cannot be placed is returned in `failedWords` with a reason (`too_long_for_grid`, `no_valid_candidates`, `attempts_exhausted`, `backtracks_exhausted`, `invalid_word`) and a human-readable detail for the admin preview.

## 15. Selection validation

`validation-service.ts` (Phase 3, unchanged). A word matches whether traced **forwards or backwards**, regardless of how it was placed — dragging right-to-left over a left-to-right word is a match, because that is what readers expect.

## 16. Hint system

Four kinds — `first_letter`, `direction`, `reveal_word`, `full_solution` — derived purely from the stored solution, never by re-running generation.

The chosen word is the **first unfound word in placement order**, so asking twice gives a consistent answer rather than a different word each time. `nextHintKind` provides an escalating ladder so a reader does not jump straight to the answer.

Policy is enforced in `generateHint`: `none` refuses, `limited` enforces `maxHints`, `unlimited` allows all. The full solution is a separate affordance — it is allowed even when the incremental hint budget is spent, and gated only by `fullSolutionEnabled`.

## 17. Solution system

- `verifyClaimedSolution` — re-derives completion from the stored placements. De-duplicates first, so repeating a word cannot inflate progress.
- `replaySelections` — stronger: checks that the reader's **coordinates** actually spell the words.
- `verifyStoredPuzzle` — confirms a persisted grid and its placements still agree, for instances generated by older engine versions.

## 18. Security

- **A client's claim of completion is evidence, not proof.** Trusting it would let anyone finish every journey by posting a list of strings, corrupting progress, statistics and later milestones. `verifyClaimedSolution` exists for exactly this.
- The PRNG is **not** cryptographic and must never be used for tokens, seeds of secrets, or share links.
- Solutions ship with the puzzle. For a competitive game that would be a cheating vector; for a meditative Bible app with no scores or leaderboards it buys nothing, and costs a round-trip per hint. Revisit if stakes ever appear — see decision D6.

## 19. Performance

**Measured** on the development machine (Node 26, Apple Silicon), median of 21 runs across distinct seeds:

| Configuration | Median | p95 | Quality | Words placed |
|---|---|---|---|---|
| Gentle 10×10, 6 words | 0.8 ms | 1.2 ms | 86 | 100% |
| Balanced 12×12, 8 words | 2.1 ms | 2.5 ms | 91 | 100% |
| Challenging 14×14, 10 words | 6.9 ms | 7.6 ms | 89 | 100% |
| Expert 16×16, 12 words | 11.0 ms | 11.9 ms | 90 | 100% |
| Maximum 32×32, 40 words | 187 ms | 195 ms | 95 | 100% |
| Deliberately tight 10×10, 20 words | 76 ms | 79 ms | 79 | 85% |

Every realistic puzzle generates in **single-digit milliseconds**. Even the pathological case — twenty words crammed into a 10×10 grid, where the search must exhaust its budget and fall back to greedy — returns in under 80 ms.

**Methodology:** `performance.now()` around `generate`, median of N runs with distinct seeds to avoid caching a single lucky layout; p95 reported to expose tail latency. The committed budgets in `benchmark.test.ts` are deliberately ~10× looser than measured values, because a flaky performance test is worse than none — they exist to catch order-of-magnitude regressions, not to police milliseconds.

## 20. Testing

67 new tests (289 total):

| Suite | Covers |
|---|---|
| `generate.test.ts` | Determinism (incl. word-order independence, no input mutation), placement correctness, direction and reversal rules, overlap modes, accented locales, failure reporting, structural errors, quality, metrics |
| `hints.test.ts` | All four hint kinds against the real grid, stability, policy enforcement, solution verification, replay, serialization round-trip and corruption detection |
| `benchmark.test.ts` | Performance budgets per difficulty, 60-seed structural validity sweep, determinism across presets, all locale × filler × overlap combinations, graceful degradation |

## 21. Known limitations

1. **Square grids only.** The database stores a single `grid_size`, and templates expose min/max as one integer. Rectangular grids would need a migration; the engine's geometry is already rectangle-ready.
2. **No cross-word dictionary check.** The engine does not verify that filler letters avoid accidentally spelling *other* target words elsewhere in the grid. A reader could occasionally find a valid word in an unintended position; validation accepts it, since it genuinely reads correctly.
3. **`word_letters` filler can be very hard.** It is exposed but not used by any default preset.
4. **Backtracking is bounded, not exhaustive.** A theoretically placeable arrangement can be missed under extreme density. The greedy fallback then reports the leftovers rather than failing.
5. **`WordSearch.tsx` has not been refactored.** The renderer still uses the Phase 0 prototype (`lib/word-search.ts`, fixed seed 42). The engine, `navigation.ts` and `validation-service.ts` are ready for it; doing the swap touches approved visuals and is best done as its own reviewed change.
6. **Not benchmarked on low-end mobile.** Numbers above are desktop. Generation normally happens server-side or once per instance, so this is low risk.

## 22. Future extensibility

- **Rectangular grids:** widen `gridSize` to `{rows, columns}` and migrate `puzzle_instances.grid_size`.
- **Shaped grids** (blocked cells): `MutableCell` already supports a "cannot place here" concept via a sentinel placement id.
- **Word themes / clue modes:** `PuzzleWord.explanation` is already carried through.
- **Server-side generation:** the engine is pure, so moving it into an Edge Function requires no call-site changes.
- **New engine versions:** bump `ENGINE_VERSION`; existing instances keep replaying under their stored version, because the reproducibility key includes it.
