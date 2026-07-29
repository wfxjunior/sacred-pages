import { getSupabaseClient } from "@/lib/supabase/client";
import { fromPostgrestError } from "@/lib/content/errors";
import type { DifficultyLevel } from "@/lib/content/types";
import type { PuzzleEvent } from "./events";
import type {
  PuzzleAttemptRow,
  PuzzleEventRow,
  PuzzleGenerationRequestRow,
  PuzzleInstanceRow,
  PuzzleProgressRow,
  PuzzleSessionRow,
  PuzzleStatisticsRow,
  PuzzleTemplateRow,
} from "./rows";

// PuzzleRepository — the ONLY module in the puzzle domain that talks to
// Supabase. Services depend on this interface, never on supabase-js, so the
// storage layer can be swapped or mocked without touching business logic.
//
// Authorization is not implemented here: RLS in migration 0005 restricts every
// table to its owner (sessions, progress, events, attempts) or to content staff
// (templates, instances). These methods cannot exceed the caller's rights.

function db() {
  return getSupabaseClient();
}

const TEMPLATE_COLUMNS = "*";

export const puzzleRepository = {
  // -------------------------------------------------------------------------
  // Templates
  // -------------------------------------------------------------------------

  async listTemplates(journeyId: string): Promise<PuzzleTemplateRow[]> {
    const { data, error } = await db()
      .from("puzzle_templates")
      .select(TEMPLATE_COLUMNS)
      .eq("journey_id", journeyId)
      .order("language_code", { ascending: true })
      .order("difficulty", { ascending: true })
      .order("version", { ascending: false });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as PuzzleTemplateRow[];
  },

  async getTemplate(id: string): Promise<PuzzleTemplateRow | null> {
    const { data, error } = await db()
      .from("puzzle_templates")
      .select(TEMPLATE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleTemplateRow) ?? null;
  },

  /** The single active template for a journey + locale + difficulty. */
  async getActiveTemplate(input: {
    journeyId: string;
    languageCode: string;
    difficulty: DifficultyLevel;
  }): Promise<PuzzleTemplateRow | null> {
    const { data, error } = await db()
      .from("puzzle_templates")
      .select(TEMPLATE_COLUMNS)
      .eq("journey_id", input.journeyId)
      .eq("language_code", input.languageCode)
      .eq("difficulty", input.difficulty)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleTemplateRow) ?? null;
  },

  async insertTemplate(payload: Record<string, unknown>): Promise<PuzzleTemplateRow> {
    const { data, error } = await db().from("puzzle_templates").insert(payload).select().single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleTemplateRow;
  },

  async updateTemplate(id: string, payload: Record<string, unknown>): Promise<PuzzleTemplateRow> {
    const { data, error } = await db()
      .from("puzzle_templates")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleTemplateRow;
  },

  /** Highest existing version for a template's identity triple. */
  async maxTemplateVersion(input: {
    journeyId: string;
    languageCode: string;
    difficulty: DifficultyLevel;
  }): Promise<number> {
    const { data, error } = await db()
      .from("puzzle_templates")
      .select("version")
      .eq("journey_id", input.journeyId)
      .eq("language_code", input.languageCode)
      .eq("difficulty", input.difficulty)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as { version: number } | null)?.version ?? 0;
  },

  async countInstancesForTemplate(templateId: string): Promise<number> {
    const { count, error } = await db()
      .from("puzzle_instances")
      .select("id", { count: "exact", head: true })
      .eq("template_id", templateId);

    if (error) throw fromPostgrestError(error);
    return count ?? 0;
  },

  // -------------------------------------------------------------------------
  // Instances
  // -------------------------------------------------------------------------

  async getInstance(id: string): Promise<PuzzleInstanceRow | null> {
    const { data, error } = await db()
      .from("puzzle_instances")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleInstanceRow) ?? null;
  },

  /**
   * Looks up an instance by its reproducibility key. This is what makes replay
   * cheap: an already-generated puzzle is fetched rather than regenerated.
   */
  async findInstanceByKey(input: {
    templateId: string;
    templateVersion: number;
    seed: number;
    engineVersion: string;
  }): Promise<PuzzleInstanceRow | null> {
    const { data, error } = await db()
      .from("puzzle_instances")
      .select("*")
      .eq("template_id", input.templateId)
      .eq("template_version", input.templateVersion)
      .eq("seed", input.seed)
      .eq("engine_version", input.engineVersion)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleInstanceRow) ?? null;
  },

  async insertInstance(payload: Record<string, unknown>): Promise<PuzzleInstanceRow> {
    const { data, error } = await db().from("puzzle_instances").insert(payload).select().single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleInstanceRow;
  },

  // -------------------------------------------------------------------------
  // Generation requests
  // -------------------------------------------------------------------------

  async createGenerationRequest(
    payload: Record<string, unknown>,
  ): Promise<PuzzleGenerationRequestRow> {
    const { data, error } = await db()
      .from("puzzle_generation_requests")
      .insert(payload)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleGenerationRequestRow;
  },

  async updateGenerationRequest(
    id: string,
    payload: Record<string, unknown>,
  ): Promise<PuzzleGenerationRequestRow> {
    const { data, error } = await db()
      .from("puzzle_generation_requests")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleGenerationRequestRow;
  },

  async findGenerationRequestByIdempotencyKey(
    key: string,
  ): Promise<PuzzleGenerationRequestRow | null> {
    const { data, error } = await db()
      .from("puzzle_generation_requests")
      .select("*")
      .eq("idempotency_key", key)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleGenerationRequestRow) ?? null;
  },

  async listPendingGenerationRequests(limit = 20): Promise<PuzzleGenerationRequestRow[]> {
    const { data, error } = await db()
      .from("puzzle_generation_requests")
      .select("*")
      .in("status", ["pending", "running"])
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as PuzzleGenerationRequestRow[];
  },

  // -------------------------------------------------------------------------
  // Sessions
  // -------------------------------------------------------------------------

  async getActiveSession(
    userId: string,
    puzzleInstanceId: string,
  ): Promise<PuzzleSessionRow | null> {
    const { data, error } = await db()
      .from("puzzle_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("puzzle_instance_id", puzzleInstanceId)
      .in("status", ["in_progress", "paused"])
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleSessionRow) ?? null;
  },

  async getSession(id: string): Promise<PuzzleSessionRow | null> {
    const { data, error } = await db()
      .from("puzzle_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleSessionRow) ?? null;
  },

  async insertSession(payload: Record<string, unknown>): Promise<PuzzleSessionRow> {
    const { data, error } = await db().from("puzzle_sessions").insert(payload).select().single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleSessionRow;
  },

  async updateSession(id: string, payload: Record<string, unknown>): Promise<PuzzleSessionRow> {
    const { data, error } = await db()
      .from("puzzle_sessions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleSessionRow;
  },

  // -------------------------------------------------------------------------
  // Progress
  // -------------------------------------------------------------------------

  async getProgress(userId: string, puzzleInstanceId: string): Promise<PuzzleProgressRow | null> {
    const { data, error } = await db()
      .from("puzzle_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("puzzle_instance_id", puzzleInstanceId)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleProgressRow) ?? null;
  },

  async upsertProgress(payload: Record<string, unknown>): Promise<PuzzleProgressRow> {
    const { data, error } = await db()
      .from("puzzle_progress")
      .upsert(payload, { onConflict: "user_id,puzzle_instance_id" })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleProgressRow;
  },

  // -------------------------------------------------------------------------
  // Events and attempts (append-only)
  // -------------------------------------------------------------------------

  /**
   * Appends events, ignoring any whose idempotency key already exists.
   * `ignoreDuplicates` is what turns the unique constraint into a silent no-op
   * instead of an error the caller has to interpret.
   */
  async appendEvents(userId: string, events: readonly PuzzleEvent[]): Promise<void> {
    if (events.length === 0) return;

    const { error } = await db()
      .from("puzzle_events")
      .upsert(
        events.map((event) => ({
          session_id: event.sessionId,
          user_id: userId,
          type: event.type,
          payload: event.payload,
          idempotency_key: event.idempotencyKey,
          occurred_at: event.occurredAt,
        })),
        { onConflict: "session_id,idempotency_key", ignoreDuplicates: true },
      );

    if (error) throw fromPostgrestError(error);
  },

  async listEvents(sessionId: string): Promise<PuzzleEventRow[]> {
    const { data, error } = await db()
      .from("puzzle_events")
      .select("*")
      .eq("session_id", sessionId)
      .order("occurred_at", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as PuzzleEventRow[];
  },

  async appendAttempt(payload: Record<string, unknown>): Promise<PuzzleAttemptRow> {
    const { data, error } = await db().from("puzzle_attempts").insert(payload).select().single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleAttemptRow;
  },

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  async getStatistics(puzzleInstanceId: string): Promise<PuzzleStatisticsRow | null> {
    const { data, error } = await db()
      .from("puzzle_statistics")
      .select("*")
      .eq("puzzle_instance_id", puzzleInstanceId)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as PuzzleStatisticsRow) ?? null;
  },
};

export type PuzzleRepository = typeof puzzleRepository;
