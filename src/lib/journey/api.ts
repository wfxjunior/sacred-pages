import type { DifficultyLevel } from "@/lib/content/types";
import type { ConsistencySummary } from "./consistency";
import { progressErrors } from "./errors";
import { buildShareSafeCompletion, type ShareSafeCompletion } from "./schemas";
import {
  consistencyService,
  favoritesService,
  historyService,
  milestoneService,
  privateResponseService,
  journeySessionService,
  type JourneyState,
  type LocalizedMilestone,
} from "./services";
import type {
  FavoriteRow,
  JourneyProgressRow,
  JourneySessionRow,
  UserCollectionProgressRow,
  UserMilestoneRow,
  UserPrayerRow,
  UserReflectionRow,
} from "./rows";
import type { HistoryQuery } from "./schemas";
import type { JourneyStepType, StepDefinition } from "./state";

// The progress API — the surface React components consume.
//
// Components pass a `userId` because this layer stays free of React and of the
// auth session hook; the caller has the session, this module has the rules.

type Locale = "en" | "pt" | "es";

/**
 * TanStack Query keys for the progress domain.
 *
 * Every key starts with the user id so that signing out and back in as someone
 * else can never serve a cached reflection or milestone from the previous
 * session.
 */
export const journeyQueryKeys = {
  all: (userId: string) => ["journey", userId] as const,
  state: (userId: string, journeyId: string) => ["journey", userId, "state", journeyId] as const,
  resumable: (userId: string) => ["journey", userId, "resumable"] as const,
  reflection: (userId: string, journeyId: string) =>
    ["journey", userId, "reflection", journeyId] as const,
  prayer: (userId: string, journeyId: string) => ["journey", userId, "prayer", journeyId] as const,
  favorites: (userId: string) => ["journey", userId, "favorites"] as const,
  consistency: (userId: string) => ["journey", userId, "consistency"] as const,
  milestones: (userId: string, locale: string) =>
    ["journey", userId, "milestones", locale] as const,
  unseenMilestones: (userId: string) => ["journey", userId, "milestones", "unseen"] as const,
  history: (userId: string, query: Partial<HistoryQuery>) =>
    ["journey", userId, "history", query] as const,
  collectionProgress: (userId: string) => ["journey", userId, "collections"] as const,
} as const;

export const journeyApi = {
  // -------------------------------------------------------------------------
  // Reading a journey
  // -------------------------------------------------------------------------

  async startJourney(input: {
    userId: string;
    journeyId: string;
    collectionId?: string;
    languageCode: Locale;
    difficulty?: DifficultyLevel;
    assignedDate?: string;
    steps?: readonly StepDefinition[];
  }): Promise<{ state: JourneyState; resumed: boolean }> {
    return journeySessionService.startOrResume(input);
  },

  async loadJourneyState(input: {
    userId: string;
    journeyId: string;
    steps?: readonly StepDefinition[];
  }): Promise<JourneyState | null> {
    return journeySessionService.load(input.userId, input.journeyId, input.steps);
  },

  async completeStep(input: {
    userId: string;
    sessionId: string;
    stepType: JourneyStepType;
    timeSpentMs?: number;
    metadata?: Record<string, string | number | boolean>;
    steps?: readonly StepDefinition[];
  }): Promise<JourneyState> {
    return journeySessionService.completeStep(input);
  },

  async completeJourney(input: {
    userId: string;
    sessionId: string;
    elapsedMs: number;
    steps?: readonly StepDefinition[];
  }): Promise<{ state: JourneyState; milestonesAwarded: number }> {
    return journeySessionService.complete(input);
  },

  async abandonJourney(userId: string, sessionId: string): Promise<JourneySessionRow> {
    return journeySessionService.abandon(userId, sessionId);
  },

  async listResumable(userId: string, limit?: number): Promise<JourneySessionRow[]> {
    return journeySessionService.listResumable(userId, limit);
  },

  // -------------------------------------------------------------------------
  // Private responses
  // -------------------------------------------------------------------------

  async getReflection(userId: string, journeyId: string): Promise<UserReflectionRow | null> {
    return privateResponseService.getReflection(userId, journeyId);
  },

  async saveReflection(input: {
    userId: string;
    journeyId: string;
    sessionId?: string;
    languageCode: Locale;
    body: string;
    promptVersion?: number;
  }): Promise<UserReflectionRow> {
    return privateResponseService.saveReflection(input);
  },

  async deleteReflection(userId: string, journeyId: string): Promise<void> {
    return privateResponseService.deleteReflection(userId, journeyId);
  },

  async getPrayer(userId: string, journeyId: string): Promise<UserPrayerRow | null> {
    return privateResponseService.getPrayer(userId, journeyId);
  },

  async savePrayer(input: {
    userId: string;
    journeyId: string;
    sessionId?: string;
    languageCode: Locale;
    acknowledged?: boolean;
    body?: string;
  }): Promise<UserPrayerRow> {
    return privateResponseService.savePrayer(input);
  },

  async deletePrayer(userId: string, journeyId: string): Promise<void> {
    return privateResponseService.deletePrayer(userId, journeyId);
  },

  // -------------------------------------------------------------------------
  // Favorites
  // -------------------------------------------------------------------------

  async listFavorites(userId: string): Promise<FavoriteRow[]> {
    return favoritesService.list(userId);
  },

  async toggleFavorite(input: {
    userId: string;
    entityType: "journey" | "collection";
    entityId: string;
  }): Promise<{ favorited: boolean }> {
    return favoritesService.toggle(input);
  },

  // -------------------------------------------------------------------------
  // Consistency and milestones
  // -------------------------------------------------------------------------

  async consistency(userId: string): Promise<ConsistencySummary> {
    return consistencyService.summary(userId);
  },

  async consistencyWindow(
    userId: string,
    days?: number,
  ): Promise<{ date: string; active: boolean }[]> {
    return consistencyService.window(userId, days);
  },

  async setTimeZone(userId: string, timeZone: string): Promise<void> {
    return consistencyService.setTimeZone(userId, timeZone);
  },

  async milestones(userId: string, languageCode: Locale): Promise<LocalizedMilestone[]> {
    return milestoneService.list(userId, languageCode);
  },

  async unseenMilestones(userId: string): Promise<UserMilestoneRow[]> {
    return milestoneService.unseen(userId);
  },

  async markMilestonesSeen(userId: string, milestoneIds: readonly string[]): Promise<void> {
    return milestoneService.markSeen(userId, milestoneIds);
  },

  // -------------------------------------------------------------------------
  // History
  // -------------------------------------------------------------------------

  async history(userId: string, query?: Partial<HistoryQuery>): Promise<JourneySessionRow[]> {
    return historyService.list(userId, query);
  },

  async journeyProgress(userId: string, journeyId: string): Promise<JourneyProgressRow | null> {
    return historyService.journeyProgress(userId, journeyId);
  },

  async collectionProgress(userId: string): Promise<UserCollectionProgressRow[]> {
    return historyService.collectionProgress(userId);
  },

  // -------------------------------------------------------------------------
  // Sharing
  // -------------------------------------------------------------------------

  /**
   * The only sanctioned way to turn a completion into shareable content.
   *
   * Nothing here reads from the database. The caller assembles a payload from
   * what is already on screen and this rejects anything private — which is why
   * it takes `unknown` rather than a session row: passing a whole row must fail
   * validation, not be quietly trimmed.
   */
  buildShareCard(input: unknown): ShareSafeCompletion {
    const result = buildShareSafeCompletion(input);
    if (!result.ok) throw progressErrors.sharePayloadRejected(result.issues);
    return result.payload;
  },
};
