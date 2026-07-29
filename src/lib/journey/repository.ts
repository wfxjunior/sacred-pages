import { fromPostgrestError } from "@/lib/content/errors";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { JourneySessionStatus } from "./state";
import type {
  ActivityEventRow,
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

// JourneyRepository — the ONLY module in the progress domain that talks to
// Supabase. Services depend on this interface, never on supabase-js, so every
// rule above it is testable with a fake and the storage layer stays swappable.
//
// Two things this layer deliberately does NOT do:
//
//   * Authorization. RLS in migration 0006 confines every table to its owner.
//     A method here cannot exceed the caller's rights, so re-checking user ids
//     in TypeScript would be theatre — the `userId` arguments narrow queries,
//     they do not grant anything.
//   * Progress computation. journey_progress, consistency_days,
//     user_collection_progress and user_milestones have no client write policy
//     at all; triggers own them. There are no insert methods for those tables
//     here, and their absence is the design.

function db() {
  return getSupabaseClient();
}

export const journeyRepository = {
  // -------------------------------------------------------------------------
  // Sessions
  // -------------------------------------------------------------------------

  /**
   * The reader's live session for a journey, if one exists.
   *
   * A partial unique index guarantees at most one row in these statuses, which
   * is what makes "resume" unambiguous rather than a pick-the-newest heuristic.
   */
  async getActiveSession(userId: string, journeyId: string): Promise<JourneySessionRow | null> {
    const { data, error } = await db()
      .from("journey_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("journey_id", journeyId)
      .in("status", ["not_started", "in_progress", "puzzle_completed"])
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as JourneySessionRow) ?? null;
  },

  async getSession(id: string): Promise<JourneySessionRow | null> {
    const { data, error } = await db()
      .from("journey_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as JourneySessionRow) ?? null;
  },

  async insertSession(payload: Record<string, unknown>): Promise<JourneySessionRow> {
    const { data, error } = await db().from("journey_sessions").insert(payload).select().single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneySessionRow;
  },

  async updateSession(id: string, payload: Record<string, unknown>): Promise<JourneySessionRow> {
    const { data, error } = await db()
      .from("journey_sessions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneySessionRow;
  },

  /**
   * History, newest first.
   *
   * Title search joins the localized translation rather than filtering in the
   * browser, because filtering after pagination would silently drop matches
   * beyond the first page.
   */
  async listHistorySessions(input: {
    userId: string;
    statuses: readonly JourneySessionStatus[];
    collectionId?: string;
    search?: string;
    languageCode: string;
    limit: number;
    offset: number;
  }): Promise<JourneySessionRow[]> {
    const selection = input.search
      ? "*, journeys!inner(journey_translations!inner(title, language_code))"
      : "*";

    let query = db()
      .from("journey_sessions")
      .select(selection)
      .eq("user_id", input.userId)
      .in("status", [...input.statuses])
      .order("last_active_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.collectionId) query = query.eq("collection_id", input.collectionId);

    if (input.search) {
      query = query
        .eq("journeys.journey_translations.language_code", input.languageCode)
        .ilike("journeys.journey_translations.title", `%${input.search}%`);
    }

    const { data, error } = await query;
    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as JourneySessionRow[];
  },

  /** Sessions a reader can pick back up, most recently touched first. */
  async listResumableSessions(userId: string, limit = 10): Promise<JourneySessionRow[]> {
    const { data, error } = await db()
      .from("journey_sessions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["not_started", "in_progress", "puzzle_completed"])
      .order("last_active_at", { ascending: false })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as JourneySessionRow[];
  },

  // -------------------------------------------------------------------------
  // Step progress
  // -------------------------------------------------------------------------

  async listSteps(sessionId: string): Promise<JourneyStepProgressRow[]> {
    const { data, error } = await db()
      .from("journey_step_progress")
      .select("*")
      .eq("session_id", sessionId)
      .order("step_order", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as JourneyStepProgressRow[];
  },

  /**
   * Records a step. Upsert on (session_id, step_type) so replaying a step is a
   * correction rather than a duplicate row.
   */
  async upsertStep(payload: Record<string, unknown>): Promise<JourneyStepProgressRow> {
    const { data, error } = await db()
      .from("journey_step_progress")
      .upsert(payload, { onConflict: "session_id,step_type" })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneyStepProgressRow;
  },

  // -------------------------------------------------------------------------
  // Durable progress (read-only from the client — triggers are the writer)
  // -------------------------------------------------------------------------

  async getJourneyProgress(userId: string, journeyId: string): Promise<JourneyProgressRow | null> {
    const { data, error } = await db()
      .from("journey_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("journey_id", journeyId)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as JourneyProgressRow) ?? null;
  },

  async listJourneyProgress(userId: string, limit = 200): Promise<JourneyProgressRow[]> {
    const { data, error } = await db()
      .from("journey_progress")
      .select("*")
      .eq("user_id", userId)
      .order("last_completed_at", { ascending: false })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as JourneyProgressRow[];
  },

  /**
   * Difficulties at which the reader has completed at least one journey.
   * Selects the single column rather than whole rows: this feeds milestone
   * evaluation, which has no business reading anything else.
   */
  async listCompletedDifficulties(userId: string): Promise<string[]> {
    const { data, error } = await db()
      .from("journey_sessions")
      .select("difficulty")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error) throw fromPostgrestError(error);
    const rows = (data ?? []) as { difficulty: string }[];
    return [...new Set(rows.map((row) => row.difficulty))];
  },

  async listCollectionProgress(userId: string): Promise<UserCollectionProgressRow[]> {
    const { data, error } = await db()
      .from("user_collection_progress")
      .select("*")
      .eq("user_id", userId)
      .order("last_activity_at", { ascending: false });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as UserCollectionProgressRow[];
  },

  // -------------------------------------------------------------------------
  // Private responses
  //
  // These four tables carry the only genuinely private text in the product.
  // No list-all-users method exists here, and none should: every query is
  // narrowed by user_id, and RLS refuses anything wider.
  // -------------------------------------------------------------------------

  async getReflection(userId: string, journeyId: string): Promise<UserReflectionRow | null> {
    const { data, error } = await db()
      .from("user_reflections")
      .select("*")
      .eq("user_id", userId)
      .eq("journey_id", journeyId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as UserReflectionRow) ?? null;
  },

  async upsertReflection(payload: Record<string, unknown>): Promise<UserReflectionRow> {
    const { data, error } = await db()
      .from("user_reflections")
      .upsert(payload, { onConflict: "user_id,journey_id" })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as UserReflectionRow;
  },

  /** Soft delete, so a reader who deletes by accident can be helped. */
  async softDeleteReflection(userId: string, journeyId: string): Promise<void> {
    const { error } = await db()
      .from("user_reflections")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("journey_id", journeyId);

    if (error) throw fromPostgrestError(error);
  },

  async listReflections(userId: string, limit = 50): Promise<UserReflectionRow[]> {
    const { data, error } = await db()
      .from("user_reflections")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as UserReflectionRow[];
  },

  /**
   * How many reflections exist — a HEAD count, so no body ever crosses the
   * wire. Milestone evaluation needs the number and must never see the text.
   */
  async countReflections(userId: string): Promise<number> {
    const { count, error } = await db()
      .from("user_reflections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null);

    if (error) throw fromPostgrestError(error);
    return count ?? 0;
  },

  async getPrayer(userId: string, journeyId: string): Promise<UserPrayerRow | null> {
    const { data, error } = await db()
      .from("user_prayers")
      .select("*")
      .eq("user_id", userId)
      .eq("journey_id", journeyId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as UserPrayerRow) ?? null;
  },

  async upsertPrayer(payload: Record<string, unknown>): Promise<UserPrayerRow> {
    const { data, error } = await db()
      .from("user_prayers")
      .upsert(payload, { onConflict: "user_id,journey_id" })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as UserPrayerRow;
  },

  async softDeletePrayer(userId: string, journeyId: string): Promise<void> {
    const { error } = await db()
      .from("user_prayers")
      .update({ deleted_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("journey_id", journeyId);

    if (error) throw fromPostgrestError(error);
  },

  /** Prayers that were acknowledged or written. Count only — never bodies. */
  async countPrayers(userId: string): Promise<number> {
    const { count, error } = await db()
      .from("user_prayers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("deleted_at", null)
      .or("acknowledged.eq.true,body.not.is.null");

    if (error) throw fromPostgrestError(error);
    return count ?? 0;
  },

  async countCompletedPuzzleSessions(userId: string): Promise<number> {
    const { count, error } = await db()
      .from("puzzle_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error) throw fromPostgrestError(error);
    return count ?? 0;
  },

  // -------------------------------------------------------------------------
  // Favorites
  // -------------------------------------------------------------------------

  async listFavorites(userId: string): Promise<FavoriteRow[]> {
    const { data, error } = await db()
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as FavoriteRow[];
  },

  async findFavorite(input: {
    userId: string;
    entityType: "journey" | "collection";
    entityId: string;
  }): Promise<FavoriteRow | null> {
    const column = input.entityType === "journey" ? "journey_id" : "collection_id";
    const { data, error } = await db()
      .from("favorites")
      .select("*")
      .eq("user_id", input.userId)
      .eq(column, input.entityId)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as unknown as FavoriteRow) ?? null;
  },

  async insertFavorite(payload: Record<string, unknown>): Promise<FavoriteRow> {
    const { data, error } = await db().from("favorites").insert(payload).select().single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as FavoriteRow;
  },

  async deleteFavorite(id: string): Promise<void> {
    const { error } = await db().from("favorites").delete().eq("id", id);
    if (error) throw fromPostgrestError(error);
  },

  // -------------------------------------------------------------------------
  // Consistency
  // -------------------------------------------------------------------------

  /** Active days within a date window, for the week strip and the summary. */
  async listConsistencyDays(input: {
    userId: string;
    from: string;
    to: string;
  }): Promise<ConsistencyDayRow[]> {
    const { data, error } = await db()
      .from("consistency_days")
      .select("*")
      .eq("user_id", input.userId)
      .gte("activity_date", input.from)
      .lte("activity_date", input.to)
      .order("activity_date", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as ConsistencyDayRow[];
  },

  async listAllConsistencyDates(userId: string): Promise<string[]> {
    const { data, error } = await db()
      .from("consistency_days")
      .select("activity_date")
      .eq("user_id", userId)
      .order("activity_date", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return ((data ?? []) as { activity_date: string }[]).map((row) => row.activity_date);
  },

  /**
   * The database's own summary. Preferred over computing in TypeScript because
   * it derives runs from the same rows the awarding trigger reads — one source
   * of truth for "how many days".
   */
  async consistencySummary(userId: string): Promise<ConsistencySummaryRow | null> {
    const { data, error } = await db().rpc("consistency_summary", { uid: userId });

    if (error) throw fromPostgrestError(error);
    const rows = (data ?? []) as ConsistencySummaryRow[];
    return rows[0] ?? null;
  },

  // -------------------------------------------------------------------------
  // Milestones
  // -------------------------------------------------------------------------

  async listMilestoneDefinitions(): Promise<MilestoneDefinitionRow[]> {
    const { data, error } = await db()
      .from("milestone_definitions")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as MilestoneDefinitionRow[];
  },

  async listMilestoneTranslations(languageCode: string): Promise<MilestoneTranslationRow[]> {
    const { data, error } = await db()
      .from("milestone_translations")
      .select("*")
      .eq("language_code", languageCode);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as MilestoneTranslationRow[];
  },

  async listUserMilestones(userId: string): Promise<UserMilestoneRow[]> {
    const { data, error } = await db()
      .from("user_milestones")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as UserMilestoneRow[];
  },

  async listUnseenMilestones(userId: string): Promise<UserMilestoneRow[]> {
    const { data, error } = await db()
      .from("user_milestones")
      .select("*")
      .eq("user_id", userId)
      .is("seen_at", null)
      .order("earned_at", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as UserMilestoneRow[];
  },

  /** `seen_at` is the only column a client may write on user_milestones. */
  async markMilestonesSeen(userId: string, milestoneIds: readonly string[]): Promise<void> {
    if (milestoneIds.length === 0) return;

    const { error } = await db()
      .from("user_milestones")
      .update({ seen_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("milestone_id", [...milestoneIds]);

    if (error) throw fromPostgrestError(error);
  },

  /**
   * Asks the database to evaluate and award milestones. Returns how many were
   * newly awarded. Idempotent by primary key, so calling it twice is harmless.
   */
  async evaluateMilestones(input: {
    userId: string;
    triggerEvent?: ActivityEventType | null;
    sourceEntityId?: string | null;
  }): Promise<number> {
    const { data, error } = await db().rpc("evaluate_milestones", {
      uid: input.userId,
      trigger_event: input.triggerEvent ?? null,
      source_entity: input.sourceEntityId ?? null,
    });

    if (error) throw fromPostgrestError(error);
    return typeof data === "number" ? data : 0;
  },

  // -------------------------------------------------------------------------
  // Activity events (append-only)
  // -------------------------------------------------------------------------

  /**
   * Appends events, ignoring any whose idempotency key already exists.
   * `ignoreDuplicates` turns the unique constraint into a silent no-op rather
   * than an error every caller would have to interpret.
   */
  async appendEvents(
    userId: string,
    events: readonly {
      type: ActivityEventType;
      entityType?: string | null;
      entityId?: string | null;
      metadata?: Record<string, unknown>;
      idempotencyKey: string;
      occurredAt?: string;
    }[],
  ): Promise<void> {
    if (events.length === 0) return;

    const { error } = await db()
      .from("activity_events")
      .upsert(
        events.map((event) => ({
          user_id: userId,
          type: event.type,
          entity_type: event.entityType ?? null,
          entity_id: event.entityId ?? null,
          metadata: event.metadata ?? {},
          idempotency_key: event.idempotencyKey,
          occurred_at: event.occurredAt ?? new Date().toISOString(),
        })),
        { onConflict: "user_id,idempotency_key", ignoreDuplicates: true },
      );

    if (error) throw fromPostgrestError(error);
  },

  async listEvents(userId: string, limit = 50): Promise<ActivityEventRow[]> {
    const { data, error } = await db()
      .from("activity_events")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as ActivityEventRow[];
  },

  // -------------------------------------------------------------------------
  // Preferences (time zone drives every local-date calculation)
  // -------------------------------------------------------------------------

  async getTimeZone(userId: string): Promise<string | null> {
    const { data, error } = await db()
      .from("user_preferences")
      .select("timezone")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    return (data as { timezone: string | null } | null)?.timezone ?? null;
  },

  async setTimeZone(userId: string, timeZone: string): Promise<void> {
    const { error } = await db()
      .from("user_preferences")
      .upsert({ user_id: userId, timezone: timeZone }, { onConflict: "user_id" });

    if (error) throw fromPostgrestError(error);
  },
};

export type JourneyRepository = typeof journeyRepository;
