import { z } from "zod";
import type { DifficultyLevel } from "@/lib/content/types";
import {
  activityWindow,
  DEFAULT_TIME_ZONE,
  isValidTimeZone,
  localDateFor,
  summarizeConsistency,
  type ConsistencySummary,
} from "./consistency";
import { progressErrors } from "./errors";
import {
  evaluateMilestone,
  visibleMilestones,
  type MilestoneDefinition,
  type MilestoneEvaluation,
  type ProgressSnapshot,
} from "./milestones";
import { journeyRepository, type JourneyRepository } from "./repository";
import type {
  FavoriteRow,
  JourneyProgressRow,
  JourneySessionRow,
  JourneyStepProgressRow,
  MilestoneDefinitionRow,
  UserCollectionProgressRow,
  UserMilestoneRow,
  UserPrayerRow,
  UserReflectionRow,
} from "./rows";
import {
  completeJourneySchema,
  completeStepSchema,
  historyQuerySchema,
  savePrayerSchema,
  saveReflectionSchema,
  startJourneySchema,
  timeZoneSchema,
  toggleFavoriteSchema,
  type HistoryQuery,
} from "./schemas";
import {
  buildSteps,
  canAccessStep,
  canTransitionSession,
  completionPercent,
  isJourneyComplete,
  resolveCurrentStep,
  type JourneyStepType,
  type StepDefinition,
  type StepState,
} from "./state";

// Service layer for user progress. All progress business logic lives here;
// React components call these and render the result. Nothing below imports
// React, and nothing below talks to supabase-js directly.
//
// The division of labour with the database is fixed and worth stating once:
//
//   TypeScript decides what the reader may DO      (transitions, step access)
//   PostgreSQL decides what the reader HAS DONE    (progress, days, milestones)
//
// So a client that lies about being finished still writes only to
// journey_sessions; journey_progress, consistency_days, user_collection_progress
// and user_milestones have no client write policy at all. The checks in this
// file exist to give a correct, immediate answer — not to be the last line.

function parseOrThrow<S extends z.ZodTypeAny>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw progressErrors.validationFailed(
      result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    );
  }
  return result.data;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Step rows → the state shape the pure functions in `state.ts` consume. */
function toStepStates(rows: readonly JourneyStepProgressRow[]): StepState[] {
  return rows.map((row) => ({ type: row.step_type, completed: row.completed_at !== null }));
}

// ---------------------------------------------------------------------------
// JourneySessionService
// ---------------------------------------------------------------------------

export type JourneyState = {
  readonly session: JourneySessionRow;
  readonly steps: readonly StepDefinition[];
  readonly stepStates: readonly StepState[];
  readonly currentStep: JourneyStepType;
  readonly completionPercent: number;
  readonly complete: boolean;
};

export class JourneySessionService {
  constructor(private readonly repo: JourneyRepository = journeyRepository) {}

  /**
   * Resumes the reader's live session for a journey, or starts a new one.
   *
   * A completed session is never reopened: replaying starts a fresh session
   * flagged `is_replay`, which is what keeps a first-completion date and its
   * milestone from being rewritten by someone reading the same passage again.
   */
  async startOrResume(input: {
    userId: string;
    journeyId: string;
    collectionId?: string;
    languageCode: "en" | "pt" | "es";
    difficulty?: DifficultyLevel;
    assignedDate?: string;
    steps?: readonly StepDefinition[];
  }): Promise<{ state: JourneyState; resumed: boolean }> {
    const values = parseOrThrow(startJourneySchema, {
      journeyId: input.journeyId,
      collectionId: input.collectionId,
      languageCode: input.languageCode,
      difficulty: input.difficulty ?? "gentle",
      assignedDate: input.assignedDate,
    });

    const steps = input.steps ?? buildSteps();
    const existing = await this.repo.getActiveSession(input.userId, values.journeyId);

    if (existing) {
      const session = await this.repo.updateSession(existing.id, { last_active_at: nowIso() });
      await this.repo.appendEvents(input.userId, [
        {
          type: "journey_resumed",
          entityType: "journey",
          entityId: values.journeyId,
          metadata: { sessionId: session.id },
          // One resume event per session: a reader who opens the app six times
          // has not done six things worth recording.
          idempotencyKey: `journey_resumed:${session.id}`,
        },
      ]);
      return { state: await this.buildState(session, steps), resumed: true };
    }

    const previous = await this.repo.getJourneyProgress(input.userId, values.journeyId);

    const session = await this.repo.insertSession({
      user_id: input.userId,
      journey_id: values.journeyId,
      collection_id: values.collectionId ?? null,
      language_code: values.languageCode,
      difficulty: values.difficulty,
      status: "in_progress",
      current_step: resolveCurrentStep(steps, []),
      is_replay: (previous?.completion_count ?? 0) > 0,
      assigned_date: values.assignedDate ?? null,
    });

    await this.repo.appendEvents(input.userId, [
      {
        type: "journey_started",
        entityType: "journey",
        entityId: values.journeyId,
        metadata: {
          sessionId: session.id,
          difficulty: values.difficulty,
          languageCode: values.languageCode,
          isReplay: session.is_replay,
        },
        idempotencyKey: `journey_started:${session.id}`,
      },
    ]);

    return { state: await this.buildState(session, steps), resumed: false };
  }

  /**
   * Marks one step finished and moves the session forward.
   *
   * `completion_percent` and `current_step` are recomputed from the step rows
   * rather than accepted from the caller: a client can report what it did, not
   * how far along that leaves it.
   */
  async completeStep(input: {
    userId: string;
    sessionId: string;
    stepType: JourneyStepType;
    timeSpentMs?: number;
    metadata?: Record<string, string | number | boolean>;
    steps?: readonly StepDefinition[];
  }): Promise<JourneyState> {
    const values = parseOrThrow(completeStepSchema, {
      sessionId: input.sessionId,
      stepType: input.stepType,
      timeSpentMs: input.timeSpentMs,
      metadata: input.metadata,
    });

    const session = await this.requireSession(values.sessionId);
    if (session.status === "completed") throw progressErrors.alreadyCompleted(session.id);

    const steps = input.steps ?? buildSteps();
    const existingRows = await this.repo.listSteps(session.id);
    const before = toStepStates(existingRows);

    if (!canAccessStep({ target: values.stepType, steps, states: before })) {
      throw progressErrors.stepLocked(values.stepType);
    }

    const definition = steps.find((step) => step.type === values.stepType);
    await this.repo.upsertStep({
      session_id: session.id,
      user_id: input.userId,
      step_type: values.stepType,
      step_order: definition?.order ?? 0,
      is_required: definition?.required ?? false,
      completed_at: nowIso(),
      time_spent_ms: values.timeSpentMs ?? 0,
      // Safe metadata only. Reflection and prayer bodies are stored in their own
      // owner-only tables and must never be copied into this JSONB column.
      metadata: values.metadata ?? {},
    });

    const after: StepState[] = [
      ...before.filter((state) => state.type !== values.stepType),
      { type: values.stepType, completed: true },
    ];

    const percent = completionPercent(steps, after);
    // `puzzle_completed` says the puzzle is finished — not that the journey is.
    // The journey only becomes `completed` when complete() runs, so this holds
    // whether or not a required reflection still remains.
    const nextStatus =
      values.stepType === "puzzle" && session.status === "in_progress"
        ? "puzzle_completed"
        : session.status;

    const updated = await this.repo.updateSession(session.id, {
      current_step: resolveCurrentStep(steps, after),
      completion_percent: percent,
      status: nextStatus,
      last_active_at: nowIso(),
    });

    await this.repo.appendEvents(input.userId, [
      {
        type: "journey_step_completed",
        entityType: "journey",
        entityId: session.journey_id,
        metadata: { sessionId: session.id, step: values.stepType, completionPercent: percent },
        idempotencyKey: `journey_step_completed:${session.id}:${values.stepType}`,
      },
    ]);

    return this.buildState(updated, steps);
  }

  /**
   * Completes the journey.
   *
   * The write here is small on purpose — status and timestamps. The
   * `handle_journey_completion` trigger then records durable progress, the
   * active day, collection progress and the completion event, so a client that
   * closes the tab immediately still ends up with correct data.
   */
  async complete(input: {
    userId: string;
    sessionId: string;
    elapsedMs: number;
    steps?: readonly StepDefinition[];
  }): Promise<{ state: JourneyState; milestonesAwarded: number }> {
    const values = parseOrThrow(completeJourneySchema, {
      sessionId: input.sessionId,
      elapsedMs: input.elapsedMs,
    });

    const session = await this.requireSession(values.sessionId);
    if (session.status === "completed") throw progressErrors.alreadyCompleted(session.id);

    const steps = input.steps ?? buildSteps();
    const stepStates = toStepStates(await this.repo.listSteps(session.id));

    const check = canTransitionSession({
      from: session.status,
      to: "completed",
      steps,
      stepStates,
    });
    if (!check.allowed) {
      throw check.reason === "invalid_transition"
        ? progressErrors.invalidTransition(session.status, "completed")
        : progressErrors.requiredStepIncomplete(
            steps
              .filter((step) => step.required && step.type !== "completion")
              .filter((step) => !stepStates.some((s) => s.type === step.type && s.completed))
              .map((step) => step.type),
          );
    }

    const completedAt = nowIso();
    const updated = await this.repo.updateSession(session.id, {
      status: "completed",
      completed_at: completedAt,
      // The CHECK constraint pairs status with the timestamp, so both move
      // together or the write is rejected.
      current_step: "completion",
      completion_percent: completionPercent(steps, stepStates),
      elapsed_ms: values.elapsedMs,
      last_active_at: completedAt,
    });

    // Awarding is a database function; the client asks for evaluation but can
    // never decide the outcome — user_milestones has no INSERT policy.
    const milestonesAwarded = await this.repo.evaluateMilestones({
      userId: input.userId,
      triggerEvent: "journey_completed",
      sourceEntityId: session.journey_id,
    });

    return { state: await this.buildState(updated, steps), milestonesAwarded };
  }

  /** Sets a session aside. Nothing is deleted; the reader can return to it. */
  async abandon(userId: string, sessionId: string): Promise<JourneySessionRow> {
    const session = await this.requireSession(sessionId);
    const check = canTransitionSession({
      from: session.status,
      to: "abandoned",
      steps: buildSteps(),
      stepStates: [],
    });
    if (!check.allowed) throw progressErrors.invalidTransition(session.status, "abandoned");

    const abandonedAt = nowIso();
    return this.repo.updateSession(session.id, {
      status: "abandoned",
      abandoned_at: abandonedAt,
      last_active_at: abandonedAt,
    });
  }

  /** The reader's current state for a journey, or null if never started. */
  async load(
    userId: string,
    journeyId: string,
    steps: readonly StepDefinition[] = buildSteps(),
  ): Promise<JourneyState | null> {
    const session = await this.repo.getActiveSession(userId, journeyId);
    return session ? this.buildState(session, steps) : null;
  }

  async listResumable(userId: string, limit = 10): Promise<JourneySessionRow[]> {
    return this.repo.listResumableSessions(userId, limit);
  }

  private async requireSession(sessionId: string): Promise<JourneySessionRow> {
    // RLS narrows this to the caller's own rows, so a session belonging to
    // someone else is indistinguishable from one that does not exist — which is
    // the correct thing to tell the caller either way.
    const session = await this.repo.getSession(sessionId);
    if (!session) throw progressErrors.sessionNotFound(sessionId);
    return session;
  }

  private async buildState(
    session: JourneySessionRow,
    steps: readonly StepDefinition[],
  ): Promise<JourneyState> {
    const stepStates = toStepStates(await this.repo.listSteps(session.id));
    return {
      session,
      steps,
      stepStates,
      currentStep: resolveCurrentStep(steps, stepStates),
      completionPercent: completionPercent(steps, stepStates),
      complete: isJourneyComplete(steps, stepStates),
    };
  }
}

// ---------------------------------------------------------------------------
// PrivateResponseService — reflections and prayers
// ---------------------------------------------------------------------------

export class PrivateResponseService {
  constructor(private readonly repo: JourneyRepository = journeyRepository) {}

  async getReflection(userId: string, journeyId: string): Promise<UserReflectionRow | null> {
    return this.repo.getReflection(userId, journeyId);
  }

  /**
   * Saves or edits a reflection.
   *
   * The event written alongside carries the journey and locale and nothing
   * else. Putting a character count or an excerpt in `metadata` would leak
   * private writing into a table that is not owner-only in spirit — the body
   * lives in exactly one place.
   */
  async saveReflection(input: {
    userId: string;
    journeyId: string;
    sessionId?: string;
    languageCode: "en" | "pt" | "es";
    body: string;
    promptVersion?: number;
  }): Promise<UserReflectionRow> {
    const values = parseOrThrow(saveReflectionSchema, {
      journeyId: input.journeyId,
      sessionId: input.sessionId,
      languageCode: input.languageCode,
      body: input.body,
      promptVersion: input.promptVersion,
    });

    const row = await this.repo.upsertReflection({
      user_id: input.userId,
      journey_id: values.journeyId,
      session_id: values.sessionId ?? null,
      language_code: values.languageCode,
      prompt_version: values.promptVersion ?? null,
      body: values.body,
      deleted_at: null,
    });

    await this.repo.appendEvents(input.userId, [
      {
        type: "reflection_saved",
        entityType: "journey",
        entityId: values.journeyId,
        metadata: { languageCode: values.languageCode },
        // Keyed by journey, not by save: editing a reflection ten times is one
        // thing the reader did, and the log is not an edit history.
        idempotencyKey: `reflection_saved:${values.journeyId}`,
      },
    ]);

    await this.repo.evaluateMilestones({
      userId: input.userId,
      triggerEvent: "reflection_saved",
      sourceEntityId: values.journeyId,
    });

    return row;
  }

  async deleteReflection(userId: string, journeyId: string): Promise<void> {
    await this.repo.softDeleteReflection(userId, journeyId);
  }

  async getPrayer(userId: string, journeyId: string): Promise<UserPrayerRow | null> {
    return this.repo.getPrayer(userId, journeyId);
  }

  async savePrayer(input: {
    userId: string;
    journeyId: string;
    sessionId?: string;
    languageCode: "en" | "pt" | "es";
    acknowledged?: boolean;
    body?: string;
  }): Promise<UserPrayerRow> {
    const values = parseOrThrow(savePrayerSchema, {
      journeyId: input.journeyId,
      sessionId: input.sessionId,
      languageCode: input.languageCode,
      acknowledged: input.acknowledged ?? false,
      body: input.body,
    });

    const row = await this.repo.upsertPrayer({
      user_id: input.userId,
      journey_id: values.journeyId,
      session_id: values.sessionId ?? null,
      language_code: values.languageCode,
      acknowledged: values.acknowledged,
      body: values.body ?? null,
      deleted_at: null,
    });

    await this.repo.appendEvents(input.userId, [
      {
        type: "prayer_saved",
        entityType: "journey",
        entityId: values.journeyId,
        metadata: { languageCode: values.languageCode },
        idempotencyKey: `prayer_saved:${values.journeyId}`,
      },
    ]);

    await this.repo.evaluateMilestones({
      userId: input.userId,
      triggerEvent: "prayer_saved",
      sourceEntityId: values.journeyId,
    });

    return row;
  }

  async deletePrayer(userId: string, journeyId: string): Promise<void> {
    await this.repo.softDeletePrayer(userId, journeyId);
  }

  /** The reader's own reflections, newest first. Owner-only by RLS. */
  async listReflections(userId: string, limit = 50): Promise<UserReflectionRow[]> {
    return this.repo.listReflections(userId, limit);
  }
}

// ---------------------------------------------------------------------------
// FavoritesService
// ---------------------------------------------------------------------------

export class FavoritesService {
  constructor(private readonly repo: JourneyRepository = journeyRepository) {}

  async list(userId: string): Promise<FavoriteRow[]> {
    return this.repo.listFavorites(userId);
  }

  /**
   * Adds or removes a favourite and reports the resulting state.
   *
   * Read-then-write is a race in principle: two rapid taps could both see "not
   * favourited". The partial unique indexes make the loser fail rather than
   * create a duplicate, so the worst case is an error, never a double row.
   */
  async toggle(input: {
    userId: string;
    entityType: "journey" | "collection";
    entityId: string;
  }): Promise<{ favorited: boolean }> {
    const values = parseOrThrow(toggleFavoriteSchema, {
      entityType: input.entityType,
      journeyId: input.entityType === "journey" ? input.entityId : undefined,
      collectionId: input.entityType === "collection" ? input.entityId : undefined,
    });

    const existing = await this.repo.findFavorite({
      userId: input.userId,
      entityType: values.entityType,
      entityId: input.entityId,
    });

    if (existing) {
      await this.repo.deleteFavorite(existing.id);
      await this.repo.appendEvents(input.userId, [
        {
          type: "favorite_removed",
          entityType: values.entityType,
          entityId: input.entityId,
          idempotencyKey: `favorite_removed:${input.entityId}:${existing.id}`,
        },
      ]);
      return { favorited: false };
    }

    const row = await this.repo.insertFavorite({
      user_id: input.userId,
      entity_type: values.entityType,
      journey_id: values.journeyId ?? null,
      collection_id: values.collectionId ?? null,
    });

    await this.repo.appendEvents(input.userId, [
      {
        type: "favorite_added",
        entityType: values.entityType,
        entityId: input.entityId,
        idempotencyKey: `favorite_added:${input.entityId}:${row.id}`,
      },
    ]);

    return { favorited: true };
  }

  async isFavorited(input: {
    userId: string;
    entityType: "journey" | "collection";
    entityId: string;
  }): Promise<boolean> {
    return (await this.repo.findFavorite(input)) !== null;
  }
}

// ---------------------------------------------------------------------------
// ConsistencyService — "Days in the Word"
// ---------------------------------------------------------------------------

export class ConsistencyService {
  constructor(private readonly repo: JourneyRepository = journeyRepository) {}

  /** The reader's stored time zone, falling back to UTC if unset or invalid. */
  async timeZoneFor(userId: string): Promise<string> {
    const stored = await this.repo.getTimeZone(userId);
    return stored && isValidTimeZone(stored) ? stored : DEFAULT_TIME_ZONE;
  }

  async setTimeZone(userId: string, timeZone: string): Promise<void> {
    const value = parseOrThrow(timeZoneSchema, timeZone);
    if (!isValidTimeZone(value)) {
      throw progressErrors.validationFailed([`"${value}" is not a known time zone`]);
    }
    await this.repo.setTimeZone(userId, value);
  }

  /**
   * Summarizes consistency.
   *
   * The database function is authoritative because it derives runs from the
   * same rows the milestone evaluator counts. The local computation is used
   * only when the RPC returns nothing, which keeps the dashboard truthful for
   * a reader whose first activity has not landed yet.
   */
  async summary(userId: string, now = new Date()): Promise<ConsistencySummary> {
    const timeZone = await this.timeZoneFor(userId);
    const today = localDateFor(now, timeZone);

    const rpc = await this.repo.consistencySummary(userId);
    if (rpc) {
      const gap = rpc.last_active
        ? Math.round(
            (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${rpc.last_active}T00:00:00Z`)) /
              86_400_000,
          )
        : null;

      return {
        activeDays: rpc.active_days,
        currentRun: rpc.current_run,
        longestRun: rpc.longest_run,
        lastActiveDate: rpc.last_active,
        activeToday: gap === 0,
      };
    }

    const dates = await this.repo.listAllConsistencyDates(userId);
    return summarizeConsistency(dates, today);
  }

  /** The last N local days marked active — the dashboard week strip. */
  async window(
    userId: string,
    days = 7,
    now = new Date(),
  ): Promise<{ date: string; active: boolean }[]> {
    const timeZone = await this.timeZoneFor(userId);
    const today = localDateFor(now, timeZone);
    const from = new Date(Date.parse(`${today}T00:00:00Z`) - (days - 1) * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const rows = await this.repo.listConsistencyDays({ userId, from, to: today });
    return activityWindow(
      rows.map((row) => row.activity_date),
      today,
      days,
    );
  }
}

// ---------------------------------------------------------------------------
// MilestoneService
// ---------------------------------------------------------------------------

export type LocalizedMilestone = MilestoneEvaluation & {
  readonly title: string;
  readonly description: string;
  readonly icon: string | null;
  readonly earnedAt: string | null;
};

function toDefinition(row: MilestoneDefinitionRow): MilestoneDefinition {
  return {
    id: row.id,
    key: row.key,
    category: row.category,
    criteria: row.criteria,
    threshold: row.threshold,
    qualifier: row.qualifier,
    isActive: row.is_active,
    isHidden: row.is_hidden,
    version: row.version,
    displayOrder: row.display_order,
  };
}

export class MilestoneService {
  constructor(private readonly repo: JourneyRepository = journeyRepository) {}

  /**
   * Counters for milestone evaluation.
   *
   * Every private-content figure here is a COUNT. This function must never be
   * changed to read reflection or prayer bodies: milestone display has no need
   * of the text, and a snapshot that carried it would end up in component
   * props, and from there in a crash report.
   */
  async snapshot(userId: string): Promise<ProgressSnapshot> {
    const [
      journeyProgress,
      collectionProgress,
      favorites,
      reflections,
      prayers,
      puzzles,
      difficulties,
      consistency,
    ] = await Promise.all([
      this.repo.listJourneyProgress(userId),
      this.repo.listCollectionProgress(userId),
      this.repo.listFavorites(userId),
      this.repo.countReflections(userId),
      this.repo.countPrayers(userId),
      this.repo.countCompletedPuzzleSessions(userId),
      this.repo.listCompletedDifficulties(userId),
      this.repo.consistencySummary(userId),
    ]);

    return {
      journeysCompleted: sum(journeyProgress, (row) => row.completion_count),
      puzzlesCompleted: puzzles,
      reflectionsSaved: reflections,
      prayersSaved: prayers,
      wordsFound: sum(journeyProgress, (row) => row.total_words_found),
      activeDays: consistency?.active_days ?? 0,
      collectionsCompleted: collectionProgress.filter((row) => row.completed_at !== null).length,
      favoritesAdded: favorites.length,
      difficultiesCompleted: difficulties,
    };
  }

  /** Milestones to render, localized, with progress toward each threshold. */
  async list(userId: string, languageCode: string): Promise<LocalizedMilestone[]> {
    const [definitionRows, translations, earned, snapshot] = await Promise.all([
      this.repo.listMilestoneDefinitions(),
      this.repo.listMilestoneTranslations(languageCode),
      this.repo.listUserMilestones(userId),
      this.snapshot(userId),
    ]);

    const definitions = definitionRows.map(toDefinition);
    const earnedAt = new Map(earned.map((row) => [row.milestone_id, row.earned_at]));
    const copy = new Map(translations.map((row) => [row.milestone_id, row]));
    const icons = new Map(definitionRows.map((row) => [row.id, row.icon]));

    return visibleMilestones({
      definitions,
      snapshot,
      earnedIds: [...earnedAt.keys()],
    }).map((evaluation) => {
      const text = copy.get(evaluation.definition.id);
      return {
        ...evaluation,
        // Falling back to the key rather than English keeps a missing
        // translation visible instead of quietly monolingual.
        title: text?.title ?? evaluation.definition.key,
        description: text?.description ?? "",
        icon: icons.get(evaluation.definition.id) ?? null,
        earnedAt: earnedAt.get(evaluation.definition.id) ?? null,
      };
    });
  }

  /** Milestones earned but not yet celebrated. */
  async unseen(userId: string): Promise<UserMilestoneRow[]> {
    return this.repo.listUnseenMilestones(userId);
  }

  async markSeen(userId: string, milestoneIds: readonly string[]): Promise<void> {
    await this.repo.markMilestonesSeen(userId, milestoneIds);
  }

  /** Progress toward one milestone — used by "almost there" hints. */
  async progressToward(userId: string, milestoneKey: string): Promise<MilestoneEvaluation | null> {
    const [definitions, snapshot] = await Promise.all([
      this.repo.listMilestoneDefinitions(),
      this.snapshot(userId),
    ]);

    const row = definitions.find((definition) => definition.key === milestoneKey);
    return row ? evaluateMilestone(toDefinition(row), snapshot) : null;
  }
}

function sum<T>(rows: readonly T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

// ---------------------------------------------------------------------------
// HistoryService
// ---------------------------------------------------------------------------

const STATUS_FILTERS = {
  all: ["completed", "in_progress", "puzzle_completed", "not_started", "abandoned"],
  completed: ["completed"],
  in_progress: ["in_progress", "puzzle_completed", "not_started"],
} as const;

export class HistoryService {
  constructor(private readonly repo: JourneyRepository = journeyRepository) {}

  async list(userId: string, query: Partial<HistoryQuery> = {}): Promise<JourneySessionRow[]> {
    const values = parseOrThrow(historyQuerySchema, query);

    return this.repo.listHistorySessions({
      userId,
      statuses: STATUS_FILTERS[values.status],
      collectionId: values.collectionId,
      search: values.search || undefined,
      languageCode: values.languageCode,
      limit: values.limit,
      offset: values.offset,
    });
  }

  async journeyProgress(userId: string, journeyId: string): Promise<JourneyProgressRow | null> {
    return this.repo.getJourneyProgress(userId, journeyId);
  }

  async collectionProgress(userId: string): Promise<UserCollectionProgressRow[]> {
    return this.repo.listCollectionProgress(userId);
  }
}

// ---------------------------------------------------------------------------
// Default instances
// ---------------------------------------------------------------------------

export const journeySessionService = new JourneySessionService();
export const privateResponseService = new PrivateResponseService();
export const favoritesService = new FavoritesService();
export const consistencyService = new ConsistencyService();
export const milestoneService = new MilestoneService();
export const historyService = new HistoryService();
