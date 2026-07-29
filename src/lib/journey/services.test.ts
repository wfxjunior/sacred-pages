import { beforeEach, describe, expect, it } from "vitest";
import { isAppError } from "@/lib/errors";
import {
  ConsistencyService,
  FavoritesService,
  HistoryService,
  JourneySessionService,
  MilestoneService,
  PrivateResponseService,
} from "./services";
import type { JourneyRepository } from "./repository";
import type {
  ActivityEventType,
  ConsistencyDayRow,
  ConsistencySummaryRow,
  FavoriteRow,
  JourneyProgressRow,
  JourneySessionRow,
  JourneyStepProgressRow,
  MilestoneDefinitionRow,
  MilestoneTranslationRow,
  UserCollectionProgressRow,
  UserMilestoneRow,
  UserPrayerRow,
  UserReflectionRow,
} from "./rows";
import { buildSteps } from "./state";

const USER = "11111111-1111-4111-8111-111111111111";
const JOURNEY = "22222222-2222-4222-8222-222222222222";
const COLLECTION = "33333333-3333-4333-8333-333333333333";

type AppendedEvent = {
  type: ActivityEventType;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
};

/**
 * In-memory stand-in for the repository.
 *
 * It reproduces the constraints that matter to the service rules — the
 * idempotency key on events, upsert-by-key on steps and responses — so a test
 * that passes here would not be relying on behaviour the database refuses.
 */
function fakeRepo() {
  const state = {
    sessions: [] as JourneySessionRow[],
    steps: [] as JourneyStepProgressRow[],
    progress: [] as JourneyProgressRow[],
    collectionProgress: [] as UserCollectionProgressRow[],
    reflections: [] as UserReflectionRow[],
    prayers: [] as UserPrayerRow[],
    favorites: [] as FavoriteRow[],
    days: [] as ConsistencyDayRow[],
    definitions: [] as MilestoneDefinitionRow[],
    translations: [] as MilestoneTranslationRow[],
    userMilestones: [] as UserMilestoneRow[],
    events: [] as AppendedEvent[],
    summary: null as ConsistencySummaryRow | null,
    timeZone: null as string | null,
    evaluateCalls: [] as { triggerEvent?: ActivityEventType | null }[],
    milestonesToAward: 0,
    counts: { reflections: 0, prayers: 0, puzzles: 0 },
    difficulties: [] as string[],
    historyCalls: [] as Record<string, unknown>[],
  };

  let sequence = 0;
  // Real uuids, because the schemas validate ids and a fake that hands out
  // "id-1" would let a broken service pass here and fail against Postgres.
  const nextId = () => `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`;
  const now = () => new Date().toISOString();

  const repo: JourneyRepository = {
    async getActiveSession(userId, journeyId) {
      return (
        state.sessions.find(
          (session) =>
            session.user_id === userId &&
            session.journey_id === journeyId &&
            ["not_started", "in_progress", "puzzle_completed"].includes(session.status),
        ) ?? null
      );
    },

    async getSession(id) {
      return state.sessions.find((session) => session.id === id) ?? null;
    },

    async insertSession(payload) {
      const row = {
        id: nextId(),
        collection_id: null,
        puzzle_instance_id: null,
        status: "in_progress",
        completion_percent: 0,
        elapsed_ms: 0,
        is_replay: false,
        assigned_date: null,
        current_step: "scripture",
        started_at: now(),
        last_active_at: now(),
        completed_at: null,
        abandoned_at: null,
        created_at: now(),
        updated_at: now(),
        ...payload,
      } as JourneySessionRow;
      state.sessions.push(row);
      return row;
    },

    async updateSession(id, payload) {
      const index = state.sessions.findIndex((session) => session.id === id);
      if (index < 0) throw new Error("no such session");
      state.sessions[index] = { ...state.sessions[index], ...payload } as JourneySessionRow;
      return state.sessions[index];
    },

    async listHistorySessions(input) {
      state.historyCalls.push({ ...input, statuses: [...input.statuses] });
      return state.sessions.filter(
        (session) =>
          session.user_id === input.userId &&
          input.statuses.includes(session.status) &&
          (input.collectionId ? session.collection_id === input.collectionId : true),
      );
    },

    async listResumableSessions(userId, limit = 10) {
      return state.sessions
        .filter(
          (session) =>
            session.user_id === userId &&
            ["not_started", "in_progress", "puzzle_completed"].includes(session.status),
        )
        .slice(0, limit);
    },

    async listSteps(sessionId) {
      return state.steps.filter((step) => step.session_id === sessionId);
    },

    async upsertStep(payload) {
      const row = {
        id: nextId(),
        started_at: null,
        completed_at: null,
        time_spent_ms: 0,
        metadata: {},
        content_version: null,
        step_order: 0,
        is_required: true,
        created_at: now(),
        updated_at: now(),
        ...payload,
      } as JourneyStepProgressRow;

      // Mirrors unique (session_id, step_type).
      const index = state.steps.findIndex(
        (step) => step.session_id === row.session_id && step.step_type === row.step_type,
      );
      if (index >= 0) state.steps[index] = { ...state.steps[index], ...row };
      else state.steps.push(row);

      return row;
    },

    async getJourneyProgress(userId, journeyId) {
      return (
        state.progress.find((row) => row.user_id === userId && row.journey_id === journeyId) ?? null
      );
    },

    async listJourneyProgress(userId) {
      return state.progress.filter((row) => row.user_id === userId);
    },

    async listCompletedDifficulties() {
      return state.difficulties;
    },

    async listCollectionProgress(userId) {
      return state.collectionProgress.filter((row) => row.user_id === userId);
    },

    async getReflection(userId, journeyId) {
      return (
        state.reflections.find(
          (row) => row.user_id === userId && row.journey_id === journeyId && !row.deleted_at,
        ) ?? null
      );
    },

    async upsertReflection(payload) {
      const row = {
        id: nextId(),
        session_id: null,
        prompt_version: null,
        deleted_at: null,
        created_at: now(),
        updated_at: now(),
        ...payload,
      } as UserReflectionRow;

      const index = state.reflections.findIndex(
        (existing) => existing.user_id === row.user_id && existing.journey_id === row.journey_id,
      );
      if (index >= 0) state.reflections[index] = { ...state.reflections[index], ...row };
      else state.reflections.push(row);

      return row;
    },

    async softDeleteReflection(userId, journeyId) {
      for (const row of state.reflections) {
        if (row.user_id === userId && row.journey_id === journeyId) row.deleted_at = now();
      }
    },

    async listReflections(userId) {
      return state.reflections.filter((row) => row.user_id === userId && !row.deleted_at);
    },

    async countReflections() {
      return state.counts.reflections;
    },

    async getPrayer(userId, journeyId) {
      return (
        state.prayers.find(
          (row) => row.user_id === userId && row.journey_id === journeyId && !row.deleted_at,
        ) ?? null
      );
    },

    async upsertPrayer(payload) {
      const row = {
        id: nextId(),
        session_id: null,
        acknowledged: false,
        body: null,
        deleted_at: null,
        created_at: now(),
        updated_at: now(),
        ...payload,
      } as UserPrayerRow;

      const index = state.prayers.findIndex(
        (existing) => existing.user_id === row.user_id && existing.journey_id === row.journey_id,
      );
      if (index >= 0) state.prayers[index] = { ...state.prayers[index], ...row };
      else state.prayers.push(row);

      return row;
    },

    async softDeletePrayer(userId, journeyId) {
      for (const row of state.prayers) {
        if (row.user_id === userId && row.journey_id === journeyId) row.deleted_at = now();
      }
    },

    async countPrayers() {
      return state.counts.prayers;
    },

    async countCompletedPuzzleSessions() {
      return state.counts.puzzles;
    },

    async listFavorites(userId) {
      return state.favorites.filter((row) => row.user_id === userId);
    },

    async findFavorite(input) {
      const column = input.entityType === "journey" ? "journey_id" : "collection_id";
      return (
        state.favorites.find(
          (row) => row.user_id === input.userId && row[column] === input.entityId,
        ) ?? null
      );
    },

    async insertFavorite(payload) {
      const row = {
        id: nextId(),
        journey_id: null,
        collection_id: null,
        created_at: now(),
        ...payload,
      } as FavoriteRow;
      state.favorites.push(row);
      return row;
    },

    async deleteFavorite(id) {
      state.favorites = state.favorites.filter((row) => row.id !== id);
    },

    async listConsistencyDays(input) {
      return state.days.filter(
        (row) =>
          row.user_id === input.userId &&
          row.activity_date >= input.from &&
          row.activity_date <= input.to,
      );
    },

    async listAllConsistencyDates(userId) {
      return state.days.filter((row) => row.user_id === userId).map((row) => row.activity_date);
    },

    async consistencySummary() {
      return state.summary;
    },

    async listMilestoneDefinitions() {
      return state.definitions;
    },

    async listMilestoneTranslations(languageCode) {
      return state.translations.filter((row) => row.language_code === languageCode);
    },

    async listUserMilestones(userId) {
      return state.userMilestones.filter((row) => row.user_id === userId);
    },

    async listUnseenMilestones(userId) {
      return state.userMilestones.filter((row) => row.user_id === userId && !row.seen_at);
    },

    async markMilestonesSeen(userId, milestoneIds) {
      for (const row of state.userMilestones) {
        if (row.user_id === userId && milestoneIds.includes(row.milestone_id)) {
          row.seen_at = now();
        }
      }
    },

    async evaluateMilestones(input) {
      state.evaluateCalls.push({ triggerEvent: input.triggerEvent });
      return state.milestonesToAward;
    },

    async appendEvents(_userId, events) {
      for (const event of events) {
        // Mirrors unique (user_id, idempotency_key) with ignoreDuplicates.
        if (state.events.some((existing) => existing.idempotencyKey === event.idempotencyKey)) {
          continue;
        }
        state.events.push(event as AppendedEvent);
      }
    },

    async listEvents() {
      return [];
    },

    async getTimeZone() {
      return state.timeZone;
    },

    async setTimeZone(_userId, timeZone) {
      state.timeZone = timeZone;
    },
  };

  return { repo, state };
}

function errorCode(error: unknown): string {
  return isAppError(error) ? error.code : "not-an-app-error";
}

async function codeOf(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
    return "no-error";
  } catch (error) {
    return errorCode(error);
  }
}

// ---------------------------------------------------------------------------

describe("JourneySessionService.startOrResume", () => {
  let fake: ReturnType<typeof fakeRepo>;
  let service: JourneySessionService;

  beforeEach(() => {
    fake = fakeRepo();
    service = new JourneySessionService(fake.repo);
  });

  it("starts a new session at the first step", async () => {
    const { state, resumed } = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      collectionId: COLLECTION,
      languageCode: "en",
    });

    expect(resumed).toBe(false);
    expect(state.session.status).toBe("in_progress");
    expect(state.currentStep).toBe("scripture");
    expect(state.completionPercent).toBe(0);
    expect(fake.state.events.map((event) => event.type)).toEqual(["journey_started"]);
  });

  it("resumes the live session instead of forking a second one", async () => {
    const first = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
    });
    const second = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
    });

    expect(second.resumed).toBe(true);
    expect(second.state.session.id).toBe(first.state.session.id);
    expect(fake.state.sessions).toHaveLength(1);
  });

  it("records one resume event however many times the reader returns", async () => {
    await service.startOrResume({ userId: USER, journeyId: JOURNEY, languageCode: "en" });
    await service.startOrResume({ userId: USER, journeyId: JOURNEY, languageCode: "en" });
    await service.startOrResume({ userId: USER, journeyId: JOURNEY, languageCode: "en" });

    expect(fake.state.events.filter((event) => event.type === "journey_resumed")).toHaveLength(1);
  });

  it("flags a replay when the journey was completed before", async () => {
    fake.state.progress.push({
      user_id: USER,
      journey_id: JOURNEY,
      collection_id: null,
      first_completed_at: "2026-07-01T00:00:00Z",
      last_completed_at: "2026-07-01T00:00:00Z",
      completion_count: 1,
      best_duration_ms: 1000,
      total_words_found: 8,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    const { state } = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
    });

    expect(state.session.is_replay).toBe(true);
  });

  it("rejects an unsupported locale before touching the repository", async () => {
    const code = await codeOf(() =>
      service.startOrResume({
        userId: USER,
        journeyId: JOURNEY,
        languageCode: "fr" as "en",
      }),
    );

    expect(code).toBe("progress/validation-failed");
    expect(fake.state.sessions).toHaveLength(0);
  });
});

describe("JourneySessionService.completeStep", () => {
  let fake: ReturnType<typeof fakeRepo>;
  let service: JourneySessionService;
  let sessionId: string;

  beforeEach(async () => {
    fake = fakeRepo();
    service = new JourneySessionService(fake.repo);
    const started = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
    });
    sessionId = started.state.session.id;
  });

  it("advances the current step and recomputes completion", async () => {
    const state = await service.completeStep({
      userId: USER,
      sessionId,
      stepType: "scripture",
    });

    expect(state.currentStep).toBe("devotional");
    expect(state.completionPercent).toBe(20);
    expect(state.session.completion_percent).toBe(20);
  });

  it("refuses a step gated behind an unfinished required step", async () => {
    const code = await codeOf(() =>
      service.completeStep({ userId: USER, sessionId, stepType: "puzzle" }),
    );

    expect(code).toBe("progress/step-locked");
    expect(fake.state.steps).toHaveLength(0);
  });

  it("moves the session to puzzle_completed without completing the journey", async () => {
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture" });
    await service.completeStep({ userId: USER, sessionId, stepType: "devotional" });
    const state = await service.completeStep({ userId: USER, sessionId, stepType: "puzzle" });

    expect(state.session.status).toBe("puzzle_completed");
    expect(state.complete).toBe(true);
    expect(state.session.completed_at).toBeNull();
  });

  it("treats a repeated step as a correction, not a second row", async () => {
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture" });
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture" });

    expect(fake.state.steps).toHaveLength(1);
    expect(
      fake.state.events.filter((event) => event.type === "journey_step_completed"),
    ).toHaveLength(1);
  });

  it("refuses to record steps against a completed session", async () => {
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture" });
    await service.completeStep({ userId: USER, sessionId, stepType: "devotional" });
    await service.completeStep({ userId: USER, sessionId, stepType: "puzzle" });
    await service.complete({ userId: USER, sessionId, elapsedMs: 1000 });

    const code = await codeOf(() =>
      service.completeStep({ userId: USER, sessionId, stepType: "reflection" }),
    );
    expect(code).toBe("progress/already-completed");
  });

  it("reports a missing session rather than creating one", async () => {
    const code = await codeOf(() =>
      service.completeStep({
        userId: USER,
        sessionId: "44444444-4444-4444-8444-444444444444",
        stepType: "scripture",
      }),
    );
    expect(code).toBe("progress/session-not-found");
  });

  it("keeps step metadata to safe scalars", async () => {
    await service.completeStep({
      userId: USER,
      sessionId,
      stepType: "scripture",
      metadata: { scrolledToEnd: true },
    });

    const [event] = fake.state.events.filter((e) => e.type === "journey_step_completed");
    expect(Object.keys(event.metadata ?? {})).toEqual(["sessionId", "step", "completionPercent"]);
  });
});

describe("JourneySessionService.complete", () => {
  let fake: ReturnType<typeof fakeRepo>;
  let service: JourneySessionService;
  let sessionId: string;

  beforeEach(async () => {
    fake = fakeRepo();
    service = new JourneySessionService(fake.repo);
    const started = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
    });
    sessionId = started.state.session.id;
  });

  async function finishRequiredSteps() {
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture" });
    await service.completeStep({ userId: USER, sessionId, stepType: "devotional" });
    await service.completeStep({ userId: USER, sessionId, stepType: "puzzle" });
  }

  it("refuses completion while a required step is unfinished", async () => {
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture" });

    const code = await codeOf(() => service.complete({ userId: USER, sessionId, elapsedMs: 500 }));
    expect(code).toBe("progress/required-step-incomplete");
    expect(fake.state.sessions[0].status).toBe("in_progress");
  });

  it("sets status and completed_at together, as the CHECK constraint requires", async () => {
    await finishRequiredSteps();
    const { state } = await service.complete({ userId: USER, sessionId, elapsedMs: 421_000 });

    expect(state.session.status).toBe("completed");
    expect(state.session.completed_at).not.toBeNull();
    expect(state.session.current_step).toBe("completion");
    expect(state.session.elapsed_ms).toBe(421_000);
  });

  it("asks the database to evaluate milestones after completing", async () => {
    fake.state.milestonesToAward = 2;
    await finishRequiredSteps();
    const { milestonesAwarded } = await service.complete({
      userId: USER,
      sessionId,
      elapsedMs: 1000,
    });

    expect(milestonesAwarded).toBe(2);
    expect(fake.state.evaluateCalls).toEqual([{ triggerEvent: "journey_completed" }]);
  });

  it("never writes progress, days or milestones itself", async () => {
    await finishRequiredSteps();
    await service.complete({ userId: USER, sessionId, elapsedMs: 1000 });

    // Those tables are trigger-owned; a passing client path must leave them be.
    expect(fake.state.progress).toHaveLength(0);
    expect(fake.state.days).toHaveLength(0);
    expect(fake.state.userMilestones).toHaveLength(0);
  });

  it("refuses to complete twice", async () => {
    await finishRequiredSteps();
    await service.complete({ userId: USER, sessionId, elapsedMs: 1000 });

    const code = await codeOf(() => service.complete({ userId: USER, sessionId, elapsedMs: 1000 }));
    expect(code).toBe("progress/already-completed");
    expect(fake.state.evaluateCalls).toHaveLength(1);
  });

  it("waits for a required reflection when the journey demands one", async () => {
    const steps = buildSteps({ requireReflection: true });
    await service.completeStep({ userId: USER, sessionId, stepType: "scripture", steps });
    await service.completeStep({ userId: USER, sessionId, stepType: "devotional", steps });
    await service.completeStep({ userId: USER, sessionId, stepType: "puzzle", steps });

    const code = await codeOf(() =>
      service.complete({ userId: USER, sessionId, elapsedMs: 1000, steps }),
    );
    expect(code).toBe("progress/required-step-incomplete");

    await service.completeStep({ userId: USER, sessionId, stepType: "reflection", steps });
    const { state } = await service.complete({ userId: USER, sessionId, elapsedMs: 1000, steps });
    expect(state.session.status).toBe("completed");
  });

  it("rejects an implausible elapsed time", async () => {
    await finishRequiredSteps();
    const code = await codeOf(() =>
      service.complete({ userId: USER, sessionId, elapsedMs: 48 * 60 * 60 * 1000 }),
    );
    expect(code).toBe("progress/validation-failed");
  });
});

describe("JourneySessionService.abandon", () => {
  it("sets a session aside without deleting anything", async () => {
    const fake = fakeRepo();
    const service = new JourneySessionService(fake.repo);
    const { state } = await service.startOrResume({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
    });

    const abandoned = await service.abandon(USER, state.session.id);
    expect(abandoned.status).toBe("abandoned");
    expect(abandoned.abandoned_at).not.toBeNull();
    expect(fake.state.sessions).toHaveLength(1);
  });
});

describe("PrivateResponseService", () => {
  let fake: ReturnType<typeof fakeRepo>;
  let service: PrivateResponseService;

  beforeEach(() => {
    fake = fakeRepo();
    service = new PrivateResponseService(fake.repo);
  });

  it("saves a reflection and evaluates milestones", async () => {
    const row = await service.saveReflection({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
      body: "  Today I noticed how often anxiety asks me to rehearse the future.  ",
    });

    expect(row.body).toBe("Today I noticed how often anxiety asks me to rehearse the future.");
    expect(fake.state.evaluateCalls).toEqual([{ triggerEvent: "reflection_saved" }]);
  });

  it("never puts reflection text in the activity log", async () => {
    const secret = "A private thing I would not want shared.";
    await service.saveReflection({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
      body: secret,
    });

    const serialized = JSON.stringify(fake.state.events);
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain("private thing");
    expect(fake.state.events[0].metadata).toEqual({ languageCode: "en" });
  });

  it("treats editing as one saved reflection, not a second", async () => {
    await service.saveReflection({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
      body: "First thought.",
    });
    await service.saveReflection({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
      body: "Second thought.",
    });

    expect(fake.state.reflections).toHaveLength(1);
    expect(fake.state.reflections[0].body).toBe("Second thought.");
    expect(fake.state.events.filter((e) => e.type === "reflection_saved")).toHaveLength(1);
  });

  it("rejects an empty reflection", async () => {
    const code = await codeOf(() =>
      service.saveReflection({
        userId: USER,
        journeyId: JOURNEY,
        languageCode: "en",
        body: "   ",
      }),
    );
    expect(code).toBe("progress/validation-failed");
    expect(fake.state.reflections).toHaveLength(0);
  });

  it("accepts a prayer that is only acknowledged", async () => {
    const row = await service.savePrayer({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "pt",
      acknowledged: true,
    });

    expect(row.acknowledged).toBe(true);
    expect(row.body).toBeNull();
  });

  it("rejects a prayer that is neither acknowledged nor written", async () => {
    const code = await codeOf(() =>
      service.savePrayer({ userId: USER, journeyId: JOURNEY, languageCode: "en" }),
    );
    expect(code).toBe("progress/validation-failed");
  });

  it("soft-deletes so a reflection can be recovered", async () => {
    await service.saveReflection({
      userId: USER,
      journeyId: JOURNEY,
      languageCode: "en",
      body: "Something.",
    });
    await service.deleteReflection(USER, JOURNEY);

    expect(await service.getReflection(USER, JOURNEY)).toBeNull();
    expect(fake.state.reflections).toHaveLength(1);
    expect(fake.state.reflections[0].deleted_at).not.toBeNull();
  });
});

describe("FavoritesService", () => {
  it("adds then removes, reporting the resulting state", async () => {
    const fake = fakeRepo();
    const service = new FavoritesService(fake.repo);

    const added = await service.toggle({
      userId: USER,
      entityType: "journey",
      entityId: JOURNEY,
    });
    expect(added).toEqual({ favorited: true });
    expect(fake.state.favorites).toHaveLength(1);

    const removed = await service.toggle({
      userId: USER,
      entityType: "journey",
      entityId: JOURNEY,
    });
    expect(removed).toEqual({ favorited: false });
    expect(fake.state.favorites).toHaveLength(0);
    expect(fake.state.events.map((event) => event.type)).toEqual([
      "favorite_added",
      "favorite_removed",
    ]);
  });

  it("populates only the column matching the entity type", async () => {
    const fake = fakeRepo();
    const service = new FavoritesService(fake.repo);

    await service.toggle({ userId: USER, entityType: "collection", entityId: COLLECTION });
    expect(fake.state.favorites[0].collection_id).toBe(COLLECTION);
    expect(fake.state.favorites[0].journey_id).toBeNull();
  });

  it("rejects a non-uuid entity id", async () => {
    const fake = fakeRepo();
    const service = new FavoritesService(fake.repo);

    const code = await codeOf(() =>
      service.toggle({ userId: USER, entityType: "journey", entityId: "not-a-uuid" }),
    );
    expect(code).toBe("progress/validation-failed");
  });
});

describe("ConsistencyService", () => {
  it("prefers the database summary", async () => {
    const fake = fakeRepo();
    fake.state.summary = {
      active_days: 12,
      current_run: 3,
      longest_run: 9,
      last_active: "2026-07-29",
    };
    const service = new ConsistencyService(fake.repo);

    const summary = await service.summary(USER, new Date("2026-07-29T12:00:00Z"));
    expect(summary).toEqual({
      activeDays: 12,
      currentRun: 3,
      longestRun: 9,
      lastActiveDate: "2026-07-29",
      activeToday: true,
    });
  });

  it("computes locally when the database has nothing to say", async () => {
    const fake = fakeRepo();
    for (const date of ["2026-07-27", "2026-07-28"]) {
      fake.state.days.push({
        user_id: USER,
        activity_date: date,
        timezone: "UTC",
        journeys_completed: 1,
        puzzles_completed: 0,
        first_activity_at: `${date}T10:00:00Z`,
        last_activity_at: `${date}T10:00:00Z`,
        created_at: `${date}T10:00:00Z`,
      });
    }
    const service = new ConsistencyService(fake.repo);

    const summary = await service.summary(USER, new Date("2026-07-29T12:00:00Z"));
    expect(summary.activeDays).toBe(2);
    expect(summary.currentRun).toBe(2);
    expect(summary.activeToday).toBe(false);
  });

  it("resolves the reader's day in their own time zone", async () => {
    const fake = fakeRepo();
    fake.state.timeZone = "America/Sao_Paulo";
    fake.state.summary = {
      active_days: 1,
      current_run: 1,
      longest_run: 1,
      last_active: "2026-03-09",
    };
    const service = new ConsistencyService(fake.repo);

    // 02:30 UTC on the 10th is still the 9th in Sao Paulo.
    const summary = await service.summary(USER, new Date("2026-03-10T02:30:00Z"));
    expect(summary.activeToday).toBe(true);
  });

  it("falls back to UTC when the stored zone is not a real one", async () => {
    const fake = fakeRepo();
    fake.state.timeZone = "Mars/Olympus";
    const service = new ConsistencyService(fake.repo);

    expect(await service.timeZoneFor(USER)).toBe("UTC");
  });

  it("stores a valid time zone and refuses an offset", async () => {
    const fake = fakeRepo();
    const service = new ConsistencyService(fake.repo);

    await service.setTimeZone(USER, "America/Sao_Paulo");
    expect(fake.state.timeZone).toBe("America/Sao_Paulo");

    const code = await codeOf(() => service.setTimeZone(USER, "-03:00"));
    expect(code).toBe("progress/validation-failed");
    expect(fake.state.timeZone).toBe("America/Sao_Paulo");
  });

  it("returns a seven-day strip ending on the reader's today", async () => {
    const fake = fakeRepo();
    fake.state.days.push({
      user_id: USER,
      activity_date: "2026-07-28",
      timezone: "UTC",
      journeys_completed: 1,
      puzzles_completed: 0,
      first_activity_at: "2026-07-28T10:00:00Z",
      last_activity_at: "2026-07-28T10:00:00Z",
      created_at: "2026-07-28T10:00:00Z",
    });
    const service = new ConsistencyService(fake.repo);

    const window = await service.window(USER, 7, new Date("2026-07-29T12:00:00Z"));
    expect(window).toHaveLength(7);
    expect(window[window.length - 1]).toEqual({ date: "2026-07-29", active: false });
    expect(window[window.length - 2]).toEqual({ date: "2026-07-28", active: true });
  });
});

describe("MilestoneService", () => {
  function seedDefinitions(fake: ReturnType<typeof fakeRepo>) {
    fake.state.definitions.push(
      {
        id: "m-first",
        key: "first_journey",
        category: "journey",
        criteria: "first_occurrence",
        threshold: 1,
        qualifier: null,
        icon: "sparkles",
        display_order: 10,
        is_active: true,
        is_hidden: false,
        is_repeatable: false,
        version: 1,
        created_at: "2026-07-01T00:00:00Z",
        updated_at: "2026-07-01T00:00:00Z",
      },
      {
        id: "m-hidden",
        key: "one_thousand_words",
        category: "discovery",
        criteria: "cumulative_count",
        threshold: 1000,
        qualifier: null,
        icon: "search",
        display_order: 140,
        is_active: true,
        is_hidden: true,
        is_repeatable: false,
        version: 1,
        created_at: "2026-07-01T00:00:00Z",
        updated_at: "2026-07-01T00:00:00Z",
      },
    );
  }

  it("builds a snapshot from counters only", async () => {
    const fake = fakeRepo();
    fake.state.counts = { reflections: 3, prayers: 2, puzzles: 5 };
    fake.state.difficulties = ["gentle", "expert"];
    fake.state.summary = {
      active_days: 8,
      current_run: 2,
      longest_run: 8,
      last_active: "2026-07-29",
    };
    fake.state.progress.push({
      user_id: USER,
      journey_id: JOURNEY,
      collection_id: COLLECTION,
      first_completed_at: "2026-07-01T00:00:00Z",
      last_completed_at: "2026-07-28T00:00:00Z",
      completion_count: 4,
      best_duration_ms: 400,
      total_words_found: 32,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-28T00:00:00Z",
    });
    fake.state.collectionProgress.push({
      user_id: USER,
      collection_id: COLLECTION,
      journeys_completed: 4,
      journeys_available: 4,
      completion_percent: 100,
      completed_at: "2026-07-28T00:00:00Z",
      last_activity_at: "2026-07-28T00:00:00Z",
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-28T00:00:00Z",
    });

    const snapshot = await new MilestoneService(fake.repo).snapshot(USER);

    expect(snapshot).toEqual({
      journeysCompleted: 4,
      puzzlesCompleted: 5,
      reflectionsSaved: 3,
      prayersSaved: 2,
      wordsFound: 32,
      activeDays: 8,
      collectionsCompleted: 1,
      favoritesAdded: 0,
      difficultiesCompleted: ["gentle", "expert"],
    });
  });

  it("builds a snapshot without ever reading a reflection body", async () => {
    const fake = fakeRepo();
    fake.state.counts.reflections = 1;
    fake.state.reflections.push({
      id: "r-1",
      user_id: USER,
      journey_id: JOURNEY,
      session_id: null,
      language_code: "en",
      prompt_version: null,
      body: "SECRET-TEXT-THAT-MUST-NOT-LEAK",
      deleted_at: null,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    const snapshot = await new MilestoneService(fake.repo).snapshot(USER);
    expect(JSON.stringify(snapshot)).not.toContain("SECRET-TEXT");
    expect(snapshot.reflectionsSaved).toBe(1);
  });

  it("hides an unearned hidden milestone and localizes the rest", async () => {
    const fake = fakeRepo();
    seedDefinitions(fake);
    fake.state.translations.push({
      id: "t-1",
      milestone_id: "m-first",
      language_code: "pt",
      title: "Primeira Jornada",
      description: "Você concluiu sua primeira jornada.",
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    const list = await new MilestoneService(fake.repo).list(USER, "pt");

    expect(list).toHaveLength(1);
    expect(list[0].title).toBe("Primeira Jornada");
    expect(list[0].icon).toBe("sparkles");
    expect(list[0].earned).toBe(false);
    expect(list[0].earnedAt).toBeNull();
  });

  it("reveals a hidden milestone once earned and marks when", async () => {
    const fake = fakeRepo();
    seedDefinitions(fake);
    fake.state.userMilestones.push({
      user_id: USER,
      milestone_id: "m-hidden",
      earned_at: "2026-07-20T00:00:00Z",
      milestone_version: 1,
      source_event_type: "journey_completed",
      source_entity_id: JOURNEY,
      context: {},
      seen_at: null,
      created_at: "2026-07-20T00:00:00Z",
    });

    const list = await new MilestoneService(fake.repo).list(USER, "en");
    const hidden = list.find((item) => item.definition.id === "m-hidden");

    expect(hidden?.earned).toBe(true);
    expect(hidden?.earnedAt).toBe("2026-07-20T00:00:00Z");
  });

  it("falls back to the key rather than English when a translation is missing", async () => {
    const fake = fakeRepo();
    seedDefinitions(fake);

    const list = await new MilestoneService(fake.repo).list(USER, "es");
    expect(list[0].title).toBe("first_journey");
    expect(list[0].description).toBe("");
  });

  it("reports progress toward one milestone", async () => {
    const fake = fakeRepo();
    seedDefinitions(fake);
    fake.state.progress.push({
      user_id: USER,
      journey_id: JOURNEY,
      collection_id: null,
      first_completed_at: null,
      last_completed_at: null,
      completion_count: 0,
      best_duration_ms: null,
      total_words_found: 250,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    const progress = await new MilestoneService(fake.repo).progressToward(
      USER,
      "one_thousand_words",
    );
    expect(progress?.value).toBe(250);
    expect(progress?.progressPercent).toBe(25);
    expect(progress?.earned).toBe(false);
  });

  it("returns null for an unknown milestone key", async () => {
    const fake = fakeRepo();
    seedDefinitions(fake);
    expect(await new MilestoneService(fake.repo).progressToward(USER, "nope")).toBeNull();
  });

  it("marks milestones as seen so each is celebrated once", async () => {
    const fake = fakeRepo();
    fake.state.userMilestones.push({
      user_id: USER,
      milestone_id: "m-first",
      earned_at: "2026-07-20T00:00:00Z",
      milestone_version: 1,
      source_event_type: null,
      source_entity_id: null,
      context: {},
      seen_at: null,
      created_at: "2026-07-20T00:00:00Z",
    });
    const service = new MilestoneService(fake.repo);

    expect(await service.unseen(USER)).toHaveLength(1);
    await service.markSeen(USER, ["m-first"]);
    expect(await service.unseen(USER)).toHaveLength(0);
  });
});

describe("HistoryService", () => {
  it("maps each status filter to the session statuses it means", async () => {
    const fake = fakeRepo();
    const service = new HistoryService(fake.repo);

    await service.list(USER, { status: "completed" });
    await service.list(USER, { status: "in_progress" });
    await service.list(USER, {});

    expect(fake.state.historyCalls[0].statuses).toEqual(["completed"]);
    expect(fake.state.historyCalls[1].statuses).toEqual([
      "in_progress",
      "puzzle_completed",
      "not_started",
    ]);
    expect(fake.state.historyCalls[2].statuses).toHaveLength(5);
  });

  it("passes the locale alongside a search term", async () => {
    const fake = fakeRepo();
    await new HistoryService(fake.repo).list(USER, { search: "grace", languageCode: "pt" });

    expect(fake.state.historyCalls[0]).toMatchObject({ search: "grace", languageCode: "pt" });
  });

  it("sends no search term when the box is empty", async () => {
    const fake = fakeRepo();
    await new HistoryService(fake.repo).list(USER, { search: "   " });

    expect(fake.state.historyCalls[0].search).toBeUndefined();
  });

  it("rejects an oversized page rather than silently truncating", async () => {
    const fake = fakeRepo();
    const code = await codeOf(() => new HistoryService(fake.repo).list(USER, { limit: 500 }));
    expect(code).toBe("progress/validation-failed");
  });
});
