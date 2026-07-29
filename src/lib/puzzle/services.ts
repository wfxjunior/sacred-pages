import { z } from "zod";
import { contentErrors } from "@/lib/content/errors";
import type { DifficultyLevel } from "@/lib/content/types";

import { logger } from "@/lib/logger";
import { puzzleCache, cacheKeys, CACHE_TTL } from "./cache-service";
import {
  ENGINE_VERSION,
  contentHash,
  reproducibilityKeyOf,
  seedFor,
  type GenerationInput,
  type PuzzleEngine,
} from "./engine";
import { wordSearchEngine } from "./engine/index";
import { dedupeEvents, puzzleEvents, type PuzzleEvent } from "./events";
import { fromRows, placementCells, type Grid, type Placement, type PuzzleWord } from "./grid";
import { puzzleRepository, type PuzzleRepository } from "./repository";
import type { PuzzleInstanceRow, PuzzleSessionRow, PuzzleTemplateRow } from "./rows";
import {
  generationRequestSchema,
  placementSchema,
  progressUpdateSchema,
  puzzleTemplateSchema,
  sessionStartSchema,
  sessionUpdateSchema,
  type GenerationRequestInput,
  type ProgressUpdateInput,
  type PuzzleTemplateInput,
  type SessionUpdateInput,
} from "./schemas";
import { completionPercent } from "./validation-service";

// Service layer. All puzzle business logic lives here — React components call
// these and render the result. Nothing below imports React.

function parseOrThrow<S extends z.ZodTypeAny>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw contentErrors.validationFailed(
      result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// PuzzleTemplateService
// ---------------------------------------------------------------------------

export class PuzzleTemplateService {
  constructor(
    private readonly repo: PuzzleRepository = puzzleRepository,
    private readonly cache = puzzleCache,
  ) {}

  async listForJourney(journeyId: string): Promise<PuzzleTemplateRow[]> {
    return this.repo.listTemplates(journeyId);
  }

  async get(id: string): Promise<PuzzleTemplateRow | null> {
    return this.cache.remember(cacheKeys.template(id), CACHE_TTL.template, () =>
      this.repo.getTemplate(id),
    );
  }

  async getActive(input: {
    journeyId: string;
    languageCode: string;
    difficulty: DifficultyLevel;
  }): Promise<PuzzleTemplateRow | null> {
    return this.cache.remember(
      cacheKeys.activeTemplate(input.journeyId, input.languageCode, input.difficulty),
      CACHE_TTL.template,
      () => this.repo.getActiveTemplate(input),
    );
  }

  async create(input: PuzzleTemplateInput): Promise<PuzzleTemplateRow> {
    const values = parseOrThrow(puzzleTemplateSchema, input);
    const nextVersion =
      (await this.repo.maxTemplateVersion({
        journeyId: values.journeyId,
        languageCode: values.languageCode,
        difficulty: values.difficulty,
      })) + 1;

    return this.repo.insertTemplate(this.toRow({ ...values, version: nextVersion }));
  }

  /**
   * Edits a template. Once a template has produced puzzles its generation rules
   * are frozen (enforced by trigger), so this creates a NEW VERSION instead of
   * mutating in place — otherwise every previously generated puzzle would stop
   * reproducing.
   */
  async update(id: string, input: PuzzleTemplateInput): Promise<PuzzleTemplateRow> {
    const existing = await this.repo.getTemplate(id);
    if (!existing) throw contentErrors.notFound("Puzzle template", id);

    const values = parseOrThrow(puzzleTemplateSchema, input);
    const instanceCount = await this.repo.countInstancesForTemplate(id);

    if (instanceCount > 0) {
      logger.info("template has instances; creating a new version instead of editing", {
        templateId: id,
        instanceCount,
      });
      return this.create(input);
    }

    const updated = await this.repo.updateTemplate(id, this.toRow(values));
    await this.cache.invalidateTemplate({
      templateId: id,
      journeyId: existing.journey_id,
      languageCode: existing.language_code,
      difficulty: existing.difficulty,
    });
    return updated;
  }

  /** Copies a template as a fresh draft version — the "duplicate" admin action. */
  async duplicate(id: string): Promise<PuzzleTemplateRow> {
    const source = await this.repo.getTemplate(id);
    if (!source) throw contentErrors.notFound("Puzzle template", id);

    return this.create({
      ...this.fromRow(source),
      status: "draft",
    });
  }

  /**
   * Makes a template the active one. The database allows only one active
   * template per journey+locale+difficulty, so the previous one is stood down
   * first — otherwise the unique index would reject this.
   */
  async activate(id: string): Promise<PuzzleTemplateRow> {
    const template = await this.repo.getTemplate(id);
    if (!template) throw contentErrors.notFound("Puzzle template", id);

    const current = await this.repo.getActiveTemplate({
      journeyId: template.journey_id,
      languageCode: template.language_code,
      difficulty: template.difficulty,
    });

    if (current && current.id !== id) {
      await this.repo.updateTemplate(current.id, { status: "draft" });
    }

    const activated = await this.repo.updateTemplate(id, { status: "active" });
    await this.cache.invalidateTemplate({
      templateId: id,
      journeyId: template.journey_id,
      languageCode: template.language_code,
      difficulty: template.difficulty,
    });
    return activated;
  }

  async archive(id: string): Promise<PuzzleTemplateRow> {
    const template = await this.repo.getTemplate(id);
    if (!template) throw contentErrors.notFound("Puzzle template", id);

    const archived = await this.repo.updateTemplate(id, {
      status: "archived",
      archived_at: new Date().toISOString(),
    });
    await this.cache.invalidateTemplate({
      templateId: id,
      journeyId: template.journey_id,
      languageCode: template.language_code,
      difficulty: template.difficulty,
    });
    return archived;
  }

  private toRow(values: z.output<typeof puzzleTemplateSchema>): Record<string, unknown> {
    return {
      journey_id: values.journeyId,
      language_code: values.languageCode,
      difficulty: values.difficulty,
      version: values.version,
      status: values.status,
      min_grid_size: values.minGridSize,
      max_grid_size: values.maxGridSize,
      target_word_count: values.targetWordCount,
      allowed_directions: values.allowedDirections,
      allow_reversed: values.allowReversed,
      allow_diagonal: values.allowDiagonal,
      overlap_strategy: values.overlapStrategy,
      seed_strategy: values.seedStrategy,
      max_attempts: values.maxAttempts,
      filler_strategy: values.fillerStrategy,
      custom_alphabet: values.customAlphabet ?? null,
      hint_policy: values.hintPolicy,
      max_hints: values.maxHints,
      full_solution_enabled: values.fullSolutionEnabled,
      expected_duration_seconds: values.expectedDurationSeconds ?? null,
      min_engine_version: values.minEngineVersion,
    };
  }

  private fromRow(row: PuzzleTemplateRow): PuzzleTemplateInput {
    return {
      journeyId: row.journey_id,
      languageCode: row.language_code as "en" | "pt" | "es",
      difficulty: row.difficulty,
      status: row.status,
      minGridSize: row.min_grid_size,
      maxGridSize: row.max_grid_size,
      targetWordCount: row.target_word_count,
      allowedDirections: row.allowed_directions as PuzzleTemplateInput["allowedDirections"],
      allowReversed: row.allow_reversed,
      allowDiagonal: row.allow_diagonal,
      overlapStrategy: row.overlap_strategy,
      seedStrategy: row.seed_strategy,
      maxAttempts: row.max_attempts,
      fillerStrategy: row.filler_strategy,
      customAlphabet: row.custom_alphabet ?? undefined,
      hintPolicy: row.hint_policy,
      maxHints: row.max_hints,
      fullSolutionEnabled: row.full_solution_enabled,
      expectedDurationSeconds: row.expected_duration_seconds ?? undefined,
      minEngineVersion: row.min_engine_version,
    };
  }
}

// ---------------------------------------------------------------------------
// PuzzleInstanceService
// ---------------------------------------------------------------------------

export type ResolvedPuzzle = {
  readonly instanceId: string;
  readonly grid: Grid;
  readonly placements: readonly Placement[];
  readonly seed: number;
  readonly engineVersion: string;
  readonly templateId: string;
  readonly templateVersion: number;
};

export class PuzzleInstanceService {
  constructor(
    private readonly repo: PuzzleRepository = puzzleRepository,
    private readonly cache = puzzleCache,
    private readonly engine: PuzzleEngine = wordSearchEngine,
  ) {}

  async getById(id: string): Promise<ResolvedPuzzle | null> {
    const row = await this.cache.remember(cacheKeys.instance(id), CACHE_TTL.instance, () =>
      this.repo.getInstance(id),
    );
    return row ? this.toResolved(row) : null;
  }

  /**
   * Returns the puzzle for a template + seed, generating it only if it does not
   * already exist. This is the replay guarantee in one method: the same inputs
   * always yield the same puzzle, fetched rather than recomputed.
   */
  async getOrGenerate(input: {
    template: PuzzleTemplateRow;
    words: readonly PuzzleWord[];
    userId?: string | null;
    date?: string | null;
  }): Promise<ResolvedPuzzle> {
    const { template, words } = input;

    const seed = seedFor({
      strategy: template.seed_strategy,
      templateId: template.id,
      templateVersion: template.version,
      userId: input.userId,
      date: input.date,
    });

    const key = {
      templateId: template.id,
      templateVersion: template.version,
      seed,
      engineVersion: this.engine.version,
    };

    const existing = await this.cache.remember(
      cacheKeys.instanceByKey(key.templateId, key.templateVersion, key.seed, key.engineVersion),
      CACHE_TTL.instance,
      () => this.repo.findInstanceByKey(key),
    );
    if (existing) return this.toResolved(existing);

    logger.debug("generating puzzle instance", { key: reproducibilityKeyOf(key) });
    return this.generate({ template, words, seed });
  }

  /**
   * Runs the engine and persists the result.
   *
   * Words the engine could not place are recorded on the instance rather than
   * dropped, so an authoring problem is visible in the admin preview.
   */
  async generate(input: {
    template: PuzzleTemplateRow;
    words: readonly PuzzleWord[];
    seed: number;
  }): Promise<ResolvedPuzzle> {
    const { template, words, seed } = input;

    const generationInput: GenerationInput = {
      words,
      languageCode: template.language_code,
      difficulty: template.difficulty,
      gridSize: template.min_grid_size,
      directions: template.allowed_directions as GenerationInput["directions"],
      allowReversed: template.allow_reversed,
      allowDiagonal: template.allow_diagonal,
      overlapStrategy: template.overlap_strategy,
      fillerStrategy: template.filler_strategy,
      customAlphabet: template.custom_alphabet,
      maxAttempts: template.max_attempts,
      seed,
    };

    const output = this.engine.generate(generationInput);

    // Placements are stored as JSONB, so validate before they become opaque.
    for (const placement of output.placements) {
      parseOrThrow(placementSchema, placement);
    }

    const row = await this.repo.insertInstance({
      template_id: template.id,
      template_version: template.version,
      seed: output.seed,
      language_code: template.language_code,
      difficulty: template.difficulty,
      grid_size: output.grid.size,
      grid_rows: output.grid.cells.map((r) => r.map((c) => c.display).join("")),
      normalized_grid_rows: output.grid.cells.map((r) => r.map((c) => c.normalized).join("")),
      placements: output.placements,
      unplaced_words: output.unplacedWords,
      engine_version: output.engineVersion,
      generation_metadata: output.metadata,
      content_hash: contentHash(output.grid, output.placements),
    });

    return this.toResolved(row);
  }

  private toResolved(row: PuzzleInstanceRow): ResolvedPuzzle {
    const placements = (Array.isArray(row.placements) ? row.placements : []) as Placement[];
    return {
      instanceId: row.id,
      grid: fromRows(row.grid_rows, row.normalized_grid_rows, placementCells(placements)),
      placements,
      seed: row.seed,
      engineVersion: row.engine_version,
      templateId: row.template_id,
      templateVersion: row.template_version,
    };
  }
}

// ---------------------------------------------------------------------------
// PuzzleSessionService
// ---------------------------------------------------------------------------

export class PuzzleSessionService {
  constructor(private readonly repo: PuzzleRepository = puzzleRepository) {}

  /** Resumes the live session for this puzzle, or starts a new one. */
  async startOrResume(input: {
    userId: string;
    puzzleInstanceId: string;
    journeyId: string;
  }): Promise<{ session: PuzzleSessionRow; resumed: boolean }> {
    parseOrThrow(sessionStartSchema, {
      puzzleInstanceId: input.puzzleInstanceId,
      journeyId: input.journeyId,
    });

    const existing = await this.repo.getActiveSession(input.userId, input.puzzleInstanceId);
    if (existing) {
      const session =
        existing.status === "paused"
          ? await this.repo.updateSession(existing.id, {
              status: "in_progress",
              paused_at: null,
              last_activity_at: new Date().toISOString(),
            })
          : existing;
      return { session, resumed: true };
    }

    const session = await this.repo.insertSession({
      user_id: input.userId,
      puzzle_instance_id: input.puzzleInstanceId,
      journey_id: input.journeyId,
      status: "in_progress",
    });

    await this.recordEvents(input.userId, [
      puzzleEvents.started(session.id, input.puzzleInstanceId),
    ]);

    return { session, resumed: false };
  }

  async update(userId: string, input: SessionUpdateInput): Promise<PuzzleSessionRow> {
    const values = parseOrThrow(sessionUpdateSchema, input);

    const payload: Record<string, unknown> = { last_activity_at: new Date().toISOString() };
    if (values.status !== undefined) payload.status = values.status;
    if (values.elapsedMs !== undefined) payload.elapsed_ms = values.elapsedMs;
    if (values.completionPercent !== undefined)
      payload.completion_percent = values.completionPercent;
    if (values.hintsUsed !== undefined) payload.hints_used = values.hintsUsed;
    if (values.revealedSolution !== undefined) payload.revealed_solution = values.revealedSolution;
    if (values.status === "paused") payload.paused_at = new Date().toISOString();
    if (values.status === "completed") payload.completed_at = new Date().toISOString();

    return this.repo.updateSession(values.sessionId, payload);
  }

  async pause(userId: string, sessionId: string, elapsedMs: number): Promise<PuzzleSessionRow> {
    const session = await this.update(userId, { sessionId, status: "paused", elapsedMs });
    await this.recordEvents(userId, [puzzleEvents.paused(sessionId, elapsedMs)]);
    return session;
  }

  async complete(
    userId: string,
    input: { sessionId: string; elapsedMs: number; hintsUsed: number; revealedSolution: boolean },
  ): Promise<PuzzleSessionRow> {
    const session = await this.update(userId, {
      sessionId: input.sessionId,
      status: "completed",
      elapsedMs: input.elapsedMs,
      completionPercent: 100,
      hintsUsed: input.hintsUsed,
      revealedSolution: input.revealedSolution,
    });

    // Durable progress and statistics are updated by database triggers, so a
    // completion is recorded even if the client disconnects here.
    await this.recordEvents(userId, [
      puzzleEvents.completed(input.sessionId, {
        elapsedMs: input.elapsedMs,
        hintsUsed: input.hintsUsed,
        revealedSolution: input.revealedSolution,
      }),
    ]);

    return session;
  }

  async saveProgress(userId: string, input: ProgressUpdateInput): Promise<void> {
    const values = parseOrThrow(progressUpdateSchema, input);
    await this.repo.upsertProgress({
      user_id: userId,
      puzzle_instance_id: values.puzzleInstanceId,
      found_words: values.foundWords,
      completion_percent: values.completionPercent,
      last_played_at: new Date().toISOString(),
    });
  }

  async getProgress(userId: string, puzzleInstanceId: string) {
    return this.repo.getProgress(userId, puzzleInstanceId);
  }

  /** Appends events, de-duplicated locally before the database also de-duplicates. */
  async recordEvents(userId: string, events: readonly PuzzleEvent[]): Promise<void> {
    await this.repo.appendEvents(userId, dedupeEvents(events));
  }

  /** Recomputes completion from the found words rather than trusting a client number. */
  computeCompletion(found: readonly string[], targets: readonly string[]): number {
    return completionPercent(found, targets);
  }
}

// ---------------------------------------------------------------------------
// GenerationQueueService
// ---------------------------------------------------------------------------

export class GenerationQueueService {
  constructor(private readonly repo: PuzzleRepository = puzzleRepository) {}

  /**
   * Enqueues a generation request. An idempotency key makes a retried enqueue
   * return the original request instead of creating a duplicate job.
   */
  async enqueue(
    input: GenerationRequestInput & { requestedBy: string },
  ): Promise<{ requestId: string; deduplicated: boolean }> {
    const values = parseOrThrow(generationRequestSchema, input);

    if (values.idempotencyKey) {
      const existing = await this.repo.findGenerationRequestByIdempotencyKey(values.idempotencyKey);
      if (existing) return { requestId: existing.id, deduplicated: true };
    }

    const request = await this.repo.createGenerationRequest({
      requested_by: input.requestedBy,
      journey_id: values.journeyId,
      template_id: values.templateId ?? null,
      language_code: values.languageCode,
      difficulty: values.difficulty,
      seed: values.seed ?? null,
      engine_version: values.engineVersion,
      idempotency_key: values.idempotencyKey ?? null,
      status: "pending",
    });

    return { requestId: request.id, deduplicated: false };
  }

  async markRunning(requestId: string): Promise<void> {
    await this.repo.updateGenerationRequest(requestId, {
      status: "running",
      started_at: new Date().toISOString(),
    });
  }

  async markSucceeded(requestId: string, instanceId: string, durationMs: number): Promise<void> {
    await this.repo.updateGenerationRequest(requestId, {
      status: "succeeded",
      result_instance_id: instanceId,
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    });
  }

  async markFailed(requestId: string, errorCode: string, errorDetail: string): Promise<void> {
    await this.repo.updateGenerationRequest(requestId, {
      status: "failed",
      error_code: errorCode.slice(0, 80),
      error_detail: errorDetail.slice(0, 2000),
      completed_at: new Date().toISOString(),
    });
  }

  async pending(limit = 20) {
    return this.repo.listPendingGenerationRequests(limit);
  }
}

// ---------------------------------------------------------------------------
// Shared instances
// ---------------------------------------------------------------------------

export const puzzleTemplateService = new PuzzleTemplateService();
export const puzzleInstanceService = new PuzzleInstanceService();
export const puzzleSessionService = new PuzzleSessionService();
export const generationQueueService = new GenerationQueueService();

/** Reports which engine build is active — surfaced in diagnostics. */
export function activeEngineVersion(): string {
  return ENGINE_VERSION;
}
