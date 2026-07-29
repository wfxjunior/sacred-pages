// Milestone criteria as a registry of pure functions.
//
// Two rules the shape of this module enforces:
//
//   * No giant nested conditional. Each criteria type is one small function
//     registered by key, so adding a milestone kind means adding a function.
//   * Criteria are PURE — they take a snapshot of counters and return a
//     boolean. That makes every rule unit-testable without a database, and it
//     keeps awarding server-side (the database trigger is the only writer).
//
// Naming rule for definitions: a milestone describes an ACTION the reader took,
// never spiritual standing. "Seven Days in the Word", not "Faithful Servant".

export const MILESTONE_CATEGORIES = [
  "journey",
  "puzzle",
  "consistency",
  "collection",
  "reflection",
  "prayer",
  "discovery",
] as const;
export type MilestoneCategory = (typeof MILESTONE_CATEGORIES)[number];

export const MILESTONE_CRITERIA = [
  "first_occurrence",
  "cumulative_count",
  "consistency_days",
  "collection_completed",
  "difficulty_reached",
] as const;
export type MilestoneCriteria = (typeof MILESTONE_CRITERIA)[number];

export type MilestoneDefinition = {
  readonly id: string;
  readonly key: string;
  readonly category: MilestoneCategory;
  readonly criteria: MilestoneCriteria;
  readonly threshold: number;
  readonly qualifier?: string | null;
  readonly isActive: boolean;
  readonly isHidden: boolean;
  readonly version: number;
  readonly displayOrder: number;
};

/**
 * Everything the criteria functions may read.
 *
 * Deliberately only counters — no reflection or prayer TEXT, so milestone
 * evaluation can never touch private content.
 */
export type ProgressSnapshot = {
  readonly journeysCompleted: number;
  readonly puzzlesCompleted: number;
  readonly reflectionsSaved: number;
  readonly prayersSaved: number;
  readonly wordsFound: number;
  readonly activeDays: number;
  readonly collectionsCompleted: number;
  readonly favoritesAdded: number;
  /** Difficulties at which the reader has completed at least one journey. */
  readonly difficultiesCompleted: readonly string[];
};

export const EMPTY_SNAPSHOT: ProgressSnapshot = {
  journeysCompleted: 0,
  puzzlesCompleted: 0,
  reflectionsSaved: 0,
  prayersSaved: 0,
  wordsFound: 0,
  activeDays: 0,
  collectionsCompleted: 0,
  favoritesAdded: 0,
  difficultiesCompleted: [],
};

/** Maps a category to the counter it measures. */
function counterFor(category: MilestoneCategory, snapshot: ProgressSnapshot): number {
  switch (category) {
    case "journey":
      return snapshot.journeysCompleted;
    case "puzzle":
      return snapshot.puzzlesCompleted;
    case "reflection":
      return snapshot.reflectionsSaved;
    case "prayer":
      return snapshot.prayersSaved;
    case "discovery":
      return snapshot.wordsFound;
    case "consistency":
      return snapshot.activeDays;
    case "collection":
      return snapshot.collectionsCompleted;
  }
}

type CriteriaEvaluator = (
  definition: MilestoneDefinition,
  snapshot: ProgressSnapshot,
) => { earned: boolean; value: number };

/**
 * The registry. Each entry is a small pure function; there is no switch
 * statement spanning every milestone in the product.
 */
export const CRITERIA_REGISTRY: Readonly<Record<MilestoneCriteria, CriteriaEvaluator>> = {
  first_occurrence: (definition, snapshot) => {
    const value = counterFor(definition.category, snapshot);
    return { earned: value >= 1, value };
  },

  cumulative_count: (definition, snapshot) => {
    const value = counterFor(definition.category, snapshot);
    return { earned: value >= definition.threshold, value };
  },

  consistency_days: (definition, snapshot) => ({
    earned: snapshot.activeDays >= definition.threshold,
    value: snapshot.activeDays,
  }),

  collection_completed: (definition, snapshot) => ({
    earned: snapshot.collectionsCompleted >= definition.threshold,
    value: snapshot.collectionsCompleted,
  }),

  difficulty_reached: (definition, snapshot) => {
    const required = definition.qualifier ?? "expert";
    const value = snapshot.difficultiesCompleted.includes(required) ? 1 : 0;
    return { earned: value >= 1, value };
  },
};

export type MilestoneEvaluation = {
  readonly definition: MilestoneDefinition;
  readonly earned: boolean;
  readonly value: number;
  readonly threshold: number;
  /** 0-100 progress toward the threshold, for "almost there" display. */
  readonly progressPercent: number;
};

export function evaluateMilestone(
  definition: MilestoneDefinition,
  snapshot: ProgressSnapshot,
): MilestoneEvaluation {
  const evaluator = CRITERIA_REGISTRY[definition.criteria];
  const { earned, value } = evaluator(definition, snapshot);
  const threshold = Math.max(definition.threshold, 1);

  return {
    definition,
    earned,
    value,
    threshold,
    progressPercent: Math.min(100, Math.round((value / threshold) * 100)),
  };
}

/**
 * Evaluates every active definition and returns those newly earned.
 *
 * `alreadyEarned` is what makes this idempotent at the application layer; the
 * database primary key on (user_id, milestone_id) is the real guarantee.
 */
export function evaluateNewMilestones(input: {
  definitions: readonly MilestoneDefinition[];
  snapshot: ProgressSnapshot;
  alreadyEarned: readonly string[];
}): MilestoneEvaluation[] {
  const earned = new Set(input.alreadyEarned);

  return input.definitions
    .filter((definition) => definition.isActive && !earned.has(definition.id))
    .map((definition) => evaluateMilestone(definition, input.snapshot))
    .filter((evaluation) => evaluation.earned)
    .sort((a, b) => a.definition.displayOrder - b.definition.displayOrder);
}

/**
 * Definitions to show on the milestones page.
 *
 * Hidden milestones stay invisible until earned — a pleasant surprise rather
 * than a checklist. Everything else shows with its progress.
 */
export function visibleMilestones(input: {
  definitions: readonly MilestoneDefinition[];
  snapshot: ProgressSnapshot;
  earnedIds: readonly string[];
}): MilestoneEvaluation[] {
  const earned = new Set(input.earnedIds);

  return input.definitions
    .filter((definition) => definition.isActive)
    .filter((definition) => !definition.isHidden || earned.has(definition.id))
    .map((definition) => ({
      ...evaluateMilestone(definition, input.snapshot),
      earned: earned.has(definition.id),
    }))
    .sort((a, b) => a.definition.displayOrder - b.definition.displayOrder);
}

/** i18n keys — milestone copy is never hardcoded in English in components. */
export function milestoneTitleKey(key: string): string {
  return `milestone.${key}.title`;
}

export function milestoneDescriptionKey(key: string): string {
  return `milestone.${key}.description`;
}
