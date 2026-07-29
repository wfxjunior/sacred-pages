# Word-Search Engine Specification

Date: 2026-07-28
Implementation phase: 3. This spec is binding; deviations must be documented here.

---

## 1. Goals & constraints

- Independent, reusable, **pure TypeScript** module at `src/lib/engine/` — zero imports from React, routes, components, or Supabase.
- Deterministic: same input + seed ⇒ byte-identical output, across server and browser (no `Math.random`; seeded PRNG only — the existing `mulberry32` is acceptable).
- Unicode-correct for EN/PT/ES (ã, ç, é, ñ, ü…), architecture open to more languages.
- Never regenerates on re-render: generation happens once per persisted `puzzle_instance` (seed stored); the React layer only renders engine output and validates selections.
- Replaces `src/lib/word-search.ts` (prototype: fixed seed 42, 4 directions, no reversal, no normalization, silent word drops).

## 2. Module layout

```
src/lib/engine/
  index.ts          # public API surface
  types.ts          # all shared types
  normalize.ts      # Unicode normalization / display↔match mapping
  rng.ts            # seeded PRNG (mulberry32 or xoshiro; documented choice)
  generate.ts       # placement algorithm
  validate.ts       # selection validation (pure)
  hints.ts          # hint derivations from a solution map
  difficulty.ts     # difficulty presets (data, overridable by DB templates)
```

## 3. Public API

```ts
generatePuzzle(input: PuzzleInput): PuzzleResult
validateSelection(puzzle: PuzzleResult, sel: Selection): ValidationResult
getHint(puzzle, state, kind: HintKind): Hint
normalizeWord(word: string, language: LanguageCode): NormalizedWord
```

### 3.1 Inputs (`PuzzleInput`)

| Field            | Type                                                  | Notes                                                                                   |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `words`          | `{ display: string }[]`                               | original display forms; engine derives normalized forms                                 |
| `language`       | `'en' \| 'pt' \| 'es'` (open union)                   | drives normalization + filler alphabet                                                  |
| `difficulty`     | `'gentle' \| 'balanced' \| 'challenging' \| 'expert'` | selects preset unless overridden                                                        |
| `gridSize`       | `number`                                              | preset default, overridable (check 6–20)                                                |
| `directions`     | `Direction[]`                                         | subset of 8 (`E,S,SE,NE,W,N,NW,SW`)                                                     |
| `allowReversed`  | `boolean`                                             | reversed = word written back-to-front along a direction                                 |
| `allowDiagonal`  | `boolean`                                             | convenience gate over direction set                                                     |
| `overlap`        | `'none' \| 'allowed' \| 'encouraged'`                 | `encouraged` scores candidate placements by shared letters                              |
| `seed`           | `number` (uint32)                                     | **required**; caller persists it                                                        |
| `maxAttempts`    | `number`                                              | per-word placement attempts (default 200)                                               |
| `fillerStrategy` | `'uniform' \| 'weighted' \| 'wordLetters'`            | weighted = language letter frequencies; wordLetters = sample from puzzle words (harder) |

### 3.2 Outputs (`PuzzleResult`)

| Field            | Notes                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| `grid`           | display characters (what users see — accents preserved: "FÉ" shows É)                          |
| `normalizedGrid` | matching characters (accent-folded, uppercase)                                                 |
| `placedWords[]`  | per word: `display`, `normalized`, `start {row,col}`, `end {row,col}`, `direction`, `reversed` |
| `failedWords[]`  | words that could not be placed (display forms) — **never silently dropped**                    |
| `seed`           | echo of generation seed                                                                        |
| `meta`           | `{ attempts, durationMs, fillerStrategy, gridSize, difficulty }`                               |
| `solution`       | map word→cell list (derivable from placedWords; provided for renderer/hints convenience)       |

## 4. Difficulty presets (defaults; DB `puzzle_templates` may override)

|            | Gentle  | Balanced       | Challenging | Expert      |
| ---------- | ------- | -------------- | ----------- | ----------- |
| Grid       | 10×10   | 12×12          | 14×14       | 16×16       |
| Max words  | 6       | 8              | 10          | 12+         |
| Directions | E, S    | E, S, SE, NE   | all 8       | all 8       |
| Reversed   | no      | ≤ 25% of words | yes         | yes         |
| Overlap    | allowed | allowed        | encouraged  | encouraged  |
| Filler     | uniform | weighted       | weighted    | wordLetters |

## 5. Normalization rules (`normalize.ts`)

- `NFD` decompose → strip combining marks → uppercase (locale-aware for `i/İ` safety; PT/ES/EN unaffected).
- Exception table per language for non-foldable letters: Spanish `Ñ` **remains Ñ** (distinct letter — "AÑO" ≠ "ANO"); `Ç → C` for PT matching (folded); documented per language and unit-tested.
- Display and match forms are kept as parallel arrays: grid cells store `{ display, match }`; selection matching always uses `match`, rendering always uses `display`.
- Words validated pre-generation: length 2..gridSize, letters-only after normalization (no spaces/hyphens in v1 — multi-word phrases rejected into `failedWords` with reason).

## 6. Generation algorithm (`generate.ts`)

1. Sort words longest-first (hardest to place first).
2. For each word: up to `maxAttempts` candidates `(direction, reversed?, row, col)` from the seeded PRNG; bounds-check; conflict-check against placed cells (`overlap` policy: same-letter cell crossing allowed/scored, differing letters never).
3. `encouraged` overlap: sample N candidates, choose highest shared-letter count (ties by first-sampled — determinism preserved).
4. Words that exhaust attempts go to `failedWords`; generation continues (caller decides: retry with `seed+1`, larger grid, or drop word — the engine itself never invents behavior).
5. Fill empty cells per `fillerStrategy` using the same PRNG stream.
6. **Determinism invariant:** the PRNG is consumed in a strictly defined order (word loop → candidate loop → filler row-major). Any refactor must preserve consumption order or bump an engine `ALGO_VERSION` constant persisted with instances.

## 7. Selection validation (`validate.ts`)

- A `Selection` is `{ start, end }` cells; must be a straight line (horizontal/vertical/45° diagonal), else `invalid_line`.
- The letters along the path (match forms) are compared to each unfound placed word forward **and** reverse — users may drag either way regardless of the placement's `reversed` flag.
- Result: `{ kind: 'match', word } | { kind: 'no_match' } | { kind: 'already_found', word } | { kind: 'invalid_line' }`. Pure function — no state; caller owns found-word state.

## 8. Hints (`hints.ts`)

| Kind                  | Behavior                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `reveal_first_letter` | returns the start cell of one unfound word (deterministic pick: first in placement order) |
| `reveal_direction`    | returns start cell + direction vector for one unfound word                                |
| `reveal_word`         | returns full cell path of one unfound word                                                |
| `full_solution`       | returns all unfound paths; caller marks session `used_help`                               |

All hints are derivations over `PuzzleResult` + a `foundWords` set — no engine mutation.

## 9. React integration (Phase 3 refactor, visuals unchanged)

- `WordSearch.tsx` receives a `PuzzleResult` (or fetches the persisted instance) — it stops calling `buildGrid` and stops implementing matching logic inline.
- Existing interaction model is preserved exactly: mouse drag, touch with `elementFromPoint`, keyboard grid navigation (arrows/Home/End/PageUp/PageDown/Space/Enter/Escape), `aria-live` announcements, reduced-motion, found-state shown with color + strikethrough + check icon (never color alone).
- Persistence: journey page loads/creates `puzzle_instances` row (seed included); found words live in `puzzle_sessions` (Phase 4).

## 10. Failure handling

- `generatePuzzle` never throws for placement failure (reports `failedWords`); it throws typed `EngineError` only for invalid inputs (bad grid size, empty word list, unknown language).
- Callers of daily-content generation must treat non-empty `failedWords` as a content-authoring error surfaced in the admin preview (Phase 9 admin shows regeneration with new seed).

## 11. Test plan (Phase 3, Vitest)

- Determinism: same input+seed twice ⇒ deep-equal results; differing seeds ⇒ different grids (statistical).
- Placement: every `placedWords` entry re-read from the grid equals its normalized word (all 8 directions × reversed).
- Normalization: PT ("ORAÇÃO"→"ORACAO"), ES ("AÑO" keeps Ñ; "ÉL"→"EL"), display forms preserved in `grid`.
- Difficulty presets honored (directions, reversal counts, sizes).
- Validation: forward + reverse drags, `invalid_line`, `already_found`.
- Hints: each kind returns coordinates consistent with the solution.
- Failure: impossible word (longer than grid) lands in `failedWords` with the run still succeeding.
- Property-based (fast-check optional): random word lists never produce grids with conflicting cells.
