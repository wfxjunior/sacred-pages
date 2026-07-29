# Word-Search Engine — Engineering Decisions

Date: 2026-07-29
Phase: 4

Each entry records what was decided, what was rejected, and why. Where the Phase 4 brief proposed something different from what shipped, that is stated explicitly rather than quietly diverged from.

---

## D1. Reuse the existing type vocabulary instead of the brief's

**Decided:** keep `Coordinate {row, col}`, compass `Direction` (`'E'`), numeric seeds, and `Grid`/`Placement` from `lib/puzzle/grid.ts`.

**The brief proposed:** `{row, column}`, `DirectionId` (`'east'`), `seed: string`, and a `GridCell` with `displayCharacter` / `normalizedCharacter` / `placementIds` / `isFiller`.

**Rejected because** those names are already load-bearing across the system: the `puzzle_instances.placements` JSONB, the `allowed_directions` CHECK constraint (`'E','W','N',…`), `placementSchema`, the repository, the navigation reducer and 222 existing tests. Renaming would have meant a data migration plus a rewrite of code that has no defect, in exchange for longer identifiers. The brief itself says *"Adapt to the current repository conventions"* and *"Do not create duplicate domain folders if a good structure already exists"*.

**What was adopted from the proposal:** the *ideas*. `placementIds` per cell became `MutableCell.placementIds` (and it turned out to be essential — see D4). `isFiller` is the existing `isWordCell`, inverted. Required/weighted words became optional `PuzzleWord` fields.

## D2. `src/lib/puzzle/engine/` rather than `src/domain/puzzle/engine/`

**Decided:** extend the existing `src/lib/puzzle/` tree.

**Rejected:** creating `src/domain/`. The repository has no `domain/` directory; introducing one for a single feature would leave two competing conventions and split the puzzle code across both.

## D3. Extend `GenerationOutput`, do not replace it

**Decided:** `EngineResult = GenerationOutput & { success, qualityScore, quality, failedWords, metrics }`.

**Rejected:** a new result type. Extension keeps every Phase 3 caller — `PuzzleInstanceService`, the repository mapping, the API layer — compiling untouched, while giving the admin preview everything it needs. **No breaking change was required in this phase.**

The one intentional behavioural change: `notImplementedEngine.version` is now `"0.0.0-not-implemented"` instead of tracking `ENGINE_VERSION`, so the placeholder can never be mistaken for the real engine. One Phase 3 test asserted the old equality and was updated.

## D4. Track placement ids per cell

**Decided:** every `MutableCell` records which placements occupy it.

**Why it is not optional:** with overlaps, undoing a placement must clear a cell **only if no other word still needs that letter**. A naive `removeWord` that blanks every cell on the path punches a hole through a word that is still placed. The grid then passes casual inspection but is unsolvable, and the bug surfaces far from its cause. Reference counting makes the undo exact.

## D5. Bounded backtracking with a greedy fallback

**Decided:** DFS bounded by attempts-per-word and total backtracks; on exhaustion, a single greedy pass that reports what it could not place.

**Rejected — exhaustive backtracking:** worst case is exponential. A dense grid could run for minutes, which is unacceptable in a request path.

**Rejected — greedy only:** measurably worse placement rates on tight grids, and it never recovers from an early bad choice.

**Rejected — throwing on failure:** violates totality. A puzzle with nine of ten words is publishable with a warning; a generator that throws leaves the editor with nothing.

## D6. Ship solutions with the puzzle

**Decided:** placements travel with the instance rather than being withheld until completion.

**Considered:** a separate `puzzle_placements` table with RLS permitting reads only after completion, so the solution never reaches an unfinished client.

**Rejected for this product.** It is the right design for a competitive game. This app has no scores, no leaderboards, no rankings — by explicit product rule. There is nothing to gain by cheating, so the cost (a server round-trip for every hint, and a hint that fails offline) buys nothing. Documented in the engine doc so it can be revisited if stakes ever appear; only the repository would change.

## D7. Accented filler letters

**Decided:** locale alphabets include accented characters, so fillers can be accented too.

**Rejected — plain A–Z fillers:** if the words contain "ORAÇÃO" and no filler is ever accented, every accented cell in the grid is guaranteed to belong to a word. The puzzle would give itself away at a glance in Portuguese and Spanish — a correctness-of-experience bug, not a cosmetic one.

Safe because matching runs on the normalized form: a filler "Ç" behaves as "C" and cannot create a false match. Verified by test.

## D8. Separate RNG streams for placement and filling

**Decided:** `subSeed(seed, "placement")` and `subSeed(seed, "filler")`.

**Rejected — one shared stream:** placing one extra word would shift every subsequent draw and re-randomise the entire filler grid. Diffing two generations to understand a change would become impossible, and a small content edit would look like a total redesign.

## D9. Total comparators everywhere

**Decided:** every sort comparator resolves ties down to a unique key (coordinates, direction, normalized value).

**Rejected — relying on sort stability.** `Array.prototype.sort` is specified as stable since ES2019, but stability only preserves *input* order, and input order here comes from a shuffle. Making comparators total means the result cannot depend on the engine, the platform, or the input ordering — which is the determinism guarantee, not an approximation of it.

## D10. Recompute normalized forms rather than trust them

**Decided:** `prepareWords` recomputes the normalized value from the display spelling, ignoring any supplied `normalized`.

**Why:** the field is denormalized in three places (word translations table, `PuzzleWord`, engine input). Trusting it means one stale row silently desynchronises matching from display, producing a word the reader can see but cannot select. Recomputing costs microseconds.

## D11. Quality scoring weights

**Decided:** placement 50, overlap 20, direction diversity 15, distribution 10, density 5.

**Rationale:** placement dominates because a puzzle missing words is broken regardless of how elegant the rest is. Diversity uses normalized Shannon **entropy** rather than a distinct-direction count — eight directions used once each is genuinely better than seven used once and one used thirty times, and a count cannot tell them apart.

**Known softness:** the weights are judgement, not measurement. They are centralised in `constants.ts` so they can be tuned once editors have looked at real puzzles.

## D12. Cap candidates at 256 per word

**Decided:** score all legal candidates, keep the best 256.

**Rejected — keeping all:** a 32×32 grid in 8 directions produces thousands per word, and the backtracking search multiplies that. **Rejected — a small fixed sample (e.g. 20):** measurably worse on tight grids, where the good positions are scarce and specific.

256 was chosen as comfortably above the number of *good* positions in any realistic grid; the 32×32/40-word benchmark still completes in ~187 ms.

## D13. Loose performance budgets in tests

**Decided:** committed budgets are roughly 10× the measured medians (e.g. 200 ms for a case that takes 2.1 ms).

**Rejected — tight budgets:** CI hardware varies wildly, and a performance test that fails randomly gets ignored, then disabled, then deleted. These budgets catch order-of-magnitude regressions — an accidental O(n³) — which is what actually matters. Real measurements live in the engine doc, where they can be compared over time.

## D14. Leave `WordSearch.tsx` untouched

**Decided:** ship the engine; do not refactor the renderer in this phase.

**Rationale:** the renderer swap changes approved visuals and interaction code, and bundling it with a new algorithm would make a regression impossible to attribute — a bug could be in generation, in rendering, or in the seam. The engine, `navigation.ts` and `validation-service.ts` are all ready. This is stated as a known limitation rather than quietly omitted.
