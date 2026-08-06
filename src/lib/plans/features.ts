import type { GameMode } from "@/lib/games";

// What Free and Premium actually include — one typed catalogue, so the pricing
// page, settings, the entitlement gate and any future paywall all read the
// same truth instead of drifting apart in hardcoded lists.
//
// The product stance encoded here:
//
//   * The daily habit is free, whole. Today's journey, every game mode, the
//     Daily Challenge, the reader's rhythm and their three languages cost
//     nothing — a habit you have to pay for is not a habit.
//   * Premium buys BREADTH and COMPANY: the full library, walking with
//     someone, deeper history, and what comes next.
//   * Difficulty is never sold. Gating "expert" would price effort.

export type PlanId = "free" | "premium";

/** Availability of one capability on one plan. */
export type PlanAvailability = "included" | "excluded" | "soon";

export type PlanFeatureGroup =
  "daily" | "games" | "library" | "together" | "personalization" | "horizon";

export interface PlanFeature {
  /** Stable key — also the entitlement name code checks against. */
  id: string;
  group: PlanFeatureGroup;
  /** i18n key for the label. Never display text. */
  labelKey: string;
  free: PlanAvailability;
  premium: PlanAvailability;
}

export const PLAN_FEATURES: readonly PlanFeature[] = [
  // The daily habit — free, whole.
  {
    id: "daily_journey",
    group: "daily",
    labelKey: "plan.f.dailyJourney",
    free: "included",
    premium: "included",
  },
  {
    id: "devotional",
    group: "daily",
    labelKey: "plan.f.devotional",
    free: "included",
    premium: "included",
  },
  {
    id: "reflection",
    group: "daily",
    labelKey: "plan.f.reflection",
    free: "included",
    premium: "included",
  },
  {
    id: "prayer",
    group: "daily",
    labelKey: "plan.f.prayer",
    free: "included",
    premium: "included",
  },
  {
    id: "streak",
    group: "daily",
    labelKey: "plan.f.streak",
    free: "included",
    premium: "included",
  },

  // Every game mode, every difficulty.
  {
    id: "word_search",
    group: "games",
    labelKey: "plan.f.wordSearch",
    free: "included",
    premium: "included",
  },
  {
    id: "word_guess",
    group: "games",
    labelKey: "plan.f.wordGuess",
    free: "included",
    premium: "included",
  },
  {
    id: "who_am_i",
    group: "games",
    labelKey: "plan.f.whoAmI",
    free: "included",
    premium: "included",
  },
  {
    id: "finish_the_verse",
    group: "games",
    labelKey: "plan.f.finishTheVerse",
    free: "included",
    premium: "included",
  },
  {
    id: "unscramble",
    group: "games",
    labelKey: "plan.f.unscramble",
    free: "included",
    premium: "included",
  },
  {
    id: "daily_challenge",
    group: "games",
    labelKey: "plan.f.dailyChallenge",
    free: "included",
    premium: "included",
  },
  {
    id: "all_difficulties",
    group: "games",
    labelKey: "plan.f.allDifficulties",
    free: "included",
    premium: "included",
  },

  // Library — breadth is what Premium buys.
  {
    id: "selected_collections",
    group: "library",
    labelKey: "plan.f.selectedCollections",
    free: "included",
    premium: "included",
  },
  {
    id: "unlimited_collections",
    group: "library",
    labelKey: "plan.f.unlimitedCollections",
    free: "excluded",
    premium: "included",
  },
  {
    id: "favorites",
    group: "library",
    labelKey: "plan.f.favorites",
    free: "included",
    premium: "included",
  },
  {
    id: "milestones",
    group: "library",
    labelKey: "plan.f.milestones",
    free: "included",
    premium: "included",
  },
  {
    id: "exclusive_series",
    group: "library",
    labelKey: "plan.f.exclusiveSeries",
    free: "excluded",
    premium: "included",
  },
  {
    id: "full_history",
    group: "library",
    labelKey: "plan.f.fullHistory",
    free: "excluded",
    premium: "included",
  },

  // Company.
  {
    id: "journey_together",
    group: "together",
    labelKey: "plan.f.journeyTogether",
    free: "excluded",
    premium: "included",
  },
  {
    id: "family_mode",
    group: "together",
    labelKey: "plan.f.familyMode",
    free: "excluded",
    premium: "soon",
  },
  {
    id: "group_mode",
    group: "together",
    labelKey: "plan.f.groupMode",
    free: "excluded",
    premium: "soon",
  },

  // Personalization — the calm settings are everyone's.
  {
    id: "languages",
    group: "personalization",
    labelKey: "plan.f.languages",
    free: "included",
    premium: "included",
  },
  {
    id: "themes",
    group: "personalization",
    labelKey: "plan.f.themes",
    free: "included",
    premium: "included",
  },
  {
    id: "accessibility",
    group: "personalization",
    labelKey: "plan.f.accessibility",
    free: "included",
    premium: "included",
  },
  {
    id: "reminders",
    group: "personalization",
    labelKey: "plan.f.reminders",
    free: "included",
    premium: "included",
  },

  // What is coming.
  { id: "offline", group: "horizon", labelKey: "plan.f.offline", free: "soon", premium: "soon" },
  { id: "audio", group: "horizon", labelKey: "plan.f.audio", free: "excluded", premium: "soon" },
  {
    id: "ai_reflection",
    group: "horizon",
    labelKey: "plan.f.aiReflection",
    free: "excluded",
    premium: "soon",
  },
  {
    id: "priority_support",
    group: "horizon",
    labelKey: "plan.f.prioritySupport",
    free: "excluded",
    premium: "included",
  },
  {
    id: "early_access",
    group: "horizon",
    labelKey: "plan.f.earlyAccess",
    free: "excluded",
    premium: "included",
  },
];

export const PLAN_FEATURE_GROUPS: readonly PlanFeatureGroup[] = [
  "daily",
  "games",
  "library",
  "together",
  "personalization",
  "horizon",
];

export const PLAN_GROUP_LABEL_KEYS: Record<PlanFeatureGroup, string> = {
  daily: "plan.group.daily",
  games: "plan.group.games",
  library: "plan.group.library",
  together: "plan.group.together",
  personalization: "plan.group.personalization",
  horizon: "plan.group.horizon",
};

export function featuresForGroup(group: PlanFeatureGroup): PlanFeature[] {
  return PLAN_FEATURES.filter((feature) => feature.group === group);
}

/** What a plan includes today (never "soon" — a promise is not access). */
export function includedFeatures(plan: PlanId): PlanFeature[] {
  return PLAN_FEATURES.filter((feature) => feature[plan] === "included");
}

/** The headline list a plan card shows: what this plan adds over the other. */
export function planHighlights(plan: PlanId): PlanFeature[] {
  return plan === "free"
    ? includedFeatures("free").filter((feature) =>
        [
          "daily_journey",
          "word_search",
          "daily_challenge",
          "streak",
          "languages",
          "themes",
        ].includes(feature.id),
      )
    : PLAN_FEATURES.filter(
        (feature) => feature.premium !== "excluded" && feature.free !== "included",
      );
}

/** The one question the app asks at a gate. */
export function planIncludes(plan: PlanId, featureId: string): boolean {
  return PLAN_FEATURES.find((feature) => feature.id === featureId)?.[plan] === "included";
}

/** Games are free on every plan; this keeps that promise checkable. */
export function gameRequiresPremium(mode: GameMode): boolean {
  const feature = PLAN_FEATURES.find((entry) => entry.id === mode);
  return feature ? feature.free !== "included" : false;
}
