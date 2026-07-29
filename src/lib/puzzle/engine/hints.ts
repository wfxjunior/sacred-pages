import { DIRECTION_VECTORS, type Coordinate, type Direction, type Placement } from "../grid";

// Hint generation.
//
// Hints are pure derivations over the solution the engine already produced —
// they never re-run generation. Which hint you get is deterministic (the first
// unfound word in placement order), so a reader who asks twice gets a
// consistent answer rather than a different word each time.

export const HINT_KINDS = ["first_letter", "direction", "reveal_word", "full_solution"] as const;

export type HintKind = (typeof HINT_KINDS)[number];

export type Hint =
  | {
      readonly kind: "first_letter";
      readonly word: string;
      readonly coordinate: Coordinate;
    }
  | {
      readonly kind: "direction";
      readonly word: string;
      readonly coordinate: Coordinate;
      readonly direction: Direction;
      readonly vector: { readonly dr: number; readonly dc: number };
    }
  | {
      readonly kind: "reveal_word";
      readonly word: string;
      readonly path: readonly Coordinate[];
    }
  | {
      readonly kind: "full_solution";
      readonly words: readonly { word: string; path: readonly Coordinate[] }[];
    };

export type HintRefusal = {
  readonly reason:
    "no_unfound_words" | "hints_disabled" | "hint_limit_reached" | "solution_disabled";
  readonly detail: string;
};

export type HintResult =
  { readonly ok: true; readonly hint: Hint } | ({ readonly ok: false } & HintRefusal);

export type HintPolicy = {
  readonly policy: "none" | "limited" | "unlimited";
  readonly maxHints: number;
  readonly hintsUsed: number;
  readonly fullSolutionEnabled: boolean;
};

/**
 * The next word to hint at: the first unfound word in placement order.
 * Stable, so repeated requests point at the same word until it is found.
 */
function nextUnfound(
  placements: readonly Placement[],
  foundWords: readonly string[],
): Placement | null {
  const found = new Set(foundWords);
  return placements.find((placement) => !found.has(placement.normalized)) ?? null;
}

export function generateHint(input: {
  kind: HintKind;
  placements: readonly Placement[];
  foundWords: readonly string[];
  policy: HintPolicy;
}): HintResult {
  const { kind, placements, foundWords, policy } = input;

  if (kind === "full_solution") {
    if (!policy.fullSolutionEnabled) {
      return {
        ok: false,
        reason: "solution_disabled",
        detail: "This journey does not offer the full solution",
      };
    }
  } else {
    if (policy.policy === "none") {
      return {
        ok: false,
        reason: "hints_disabled",
        detail: "Hints are turned off for this journey",
      };
    }
    if (policy.policy === "limited" && policy.hintsUsed >= policy.maxHints) {
      return {
        ok: false,
        reason: "hint_limit_reached",
        detail: `All ${policy.maxHints} hints have been used`,
      };
    }
  }

  if (kind === "full_solution") {
    const found = new Set(foundWords);
    const remaining = placements.filter((p) => !found.has(p.normalized));
    if (remaining.length === 0) {
      return { ok: false, reason: "no_unfound_words", detail: "Every word has been found" };
    }
    return {
      ok: true,
      hint: {
        kind: "full_solution",
        words: remaining.map((p) => ({ word: p.normalized, path: p.path })),
      },
    };
  }

  const target = nextUnfound(placements, foundWords);
  if (!target) {
    return { ok: false, reason: "no_unfound_words", detail: "Every word has been found" };
  }

  switch (kind) {
    case "first_letter":
      return {
        ok: true,
        hint: { kind: "first_letter", word: target.normalized, coordinate: target.start },
      };
    case "direction":
      return {
        ok: true,
        hint: {
          kind: "direction",
          word: target.normalized,
          coordinate: target.start,
          direction: target.direction,
          vector: DIRECTION_VECTORS[target.direction],
        },
      };
    case "reveal_word":
      return {
        ok: true,
        hint: { kind: "reveal_word", word: target.normalized, path: target.path },
      };
  }
}

/** How many hints remain, or null when unlimited. */
export function hintsRemaining(policy: HintPolicy): number | null {
  if (policy.policy === "none") return 0;
  if (policy.policy === "unlimited") return null;
  return Math.max(0, policy.maxHints - policy.hintsUsed);
}

/**
 * Escalating hint ladder: the cheapest hint that has not been used yet for the
 * current word. Keeps a reader from jumping straight to the answer.
 */
export function nextHintKind(usedKinds: readonly HintKind[]): HintKind {
  const ladder: HintKind[] = ["first_letter", "direction", "reveal_word"];
  return ladder.find((kind) => !usedKinds.includes(kind)) ?? "reveal_word";
}
