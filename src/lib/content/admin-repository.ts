import { getSupabaseClient } from "@/lib/supabase/client";
import { contentErrors, fromPostgrestError } from "./errors";
import { canTransition, type ContentCapability } from "./status";
import { normalizeWord } from "./normalize";
import {
  collectionCreateSchema,
  collectionTranslationSchema,
  dailyJourneyAssignmentSchema,
  journeyCreateSchema,
  journeyTranslationSchema,
  journeyWordTranslationSchema,
  publicationScheduleSchema,
  reviewSubmissionSchema,
  scriptureReferenceSchema,
  type CollectionCreateInput,
  type CollectionTranslationInput,
  type DailyJourneyAssignmentInput,
  type JourneyCreateInput,
  type JourneyTranslationInput,
  type JourneyWordTranslationInput,
  type ReviewSubmissionInput,
  type ScriptureReferenceInput,
} from "./schemas";
import type { PuzzleTemplateRow } from "@/lib/puzzle/rows";
import type {
  CollectionRow,
  CollectionTranslationRow,
  ContentAuditLogRow,
  ContentReviewLogRow,
  ContentVersionRow,
  JourneyRow,
  JourneyTranslationRow,
  JourneyWordRow,
  JourneyWordTranslationRow,
  ScriptureReferenceRow,
} from "./rows";
import type { ContentStatus, DifficultyLevel } from "./types";
import { z } from "zod";

// Admin write layer.
//
// Authorization is NOT implemented here — it lives in RLS policies and the
// workflow triggers (supabase/migrations/0004). These functions validate input,
// shape payloads, and translate database failures into domain errors. A caller
// who bypasses this module still cannot exceed their database permissions.

function client() {
  return getSupabaseClient();
}

/** Validates with Zod and throws a domain error listing every issue. */
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
// Collections
// ---------------------------------------------------------------------------

export type AdminCollectionListItem = Pick<
  CollectionRow,
  | "id"
  | "internal_name"
  | "slug"
  | "status"
  | "access_level"
  | "is_featured"
  | "display_order"
  | "updated_at"
  | "published_at"
> & {
  collection_translations: Pick<CollectionTranslationRow, "language_code" | "status" | "title">[];
};

export const adminCollections = {
  async list(
    input: { status?: ContentStatus; search?: string; limit?: number; offset?: number } = {},
  ) {
    const { limit = 50, offset = 0 } = input;
    let query = client()
      .from("collections")
      .select(
        "id, internal_name, slug, status, access_level, is_featured, display_order, updated_at, published_at, " +
          "collection_translations(language_code, status, title)",
        { count: "exact" },
      );

    if (input.status) query = query.eq("status", input.status);
    if (input.search?.trim()) {
      const term = input.search.trim().replace(/[%,()]/g, "");
      query = query.or(`internal_name.ilike.%${term}%,slug.ilike.%${term}%`);
    }

    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw fromPostgrestError(error);
    return { items: (data ?? []) as unknown as AdminCollectionListItem[], total: count ?? 0 };
  },

  async getById(id: string) {
    const { data, error } = await client()
      .from("collections")
      .select("*, collection_translations(*), collection_tags(tag_id)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    if (!data) throw contentErrors.notFound("Collection", id);
    return data as unknown as CollectionRow & {
      collection_translations: CollectionTranslationRow[];
      collection_tags: { tag_id: string }[];
    };
  },

  async create(input: CollectionCreateInput) {
    const parsed = parseOrThrow(collectionCreateSchema, input);
    const { data, error } = await client()
      .from("collections")
      .insert({
        internal_name: parsed.internalName,
        slug: parsed.slug,
        primary_language_code: parsed.primaryLanguageCode,
        access_level: parsed.accessLevel,
        topic: parsed.topic ?? null,
        audience: parsed.audience ?? null,
        difficulty_min: parsed.difficultyMin ?? null,
        difficulty_max: parsed.difficultyMax ?? null,
        estimated_total_minutes: parsed.estimatedTotalMinutes ?? null,
        cover_media_id: parsed.coverMediaId ?? null,
        thumbnail_media_id: parsed.thumbnailMediaId ?? null,
        is_featured: parsed.isFeatured,
        featured_from: parsed.featuredFrom ?? null,
        featured_until: parsed.featuredUntil ?? null,
        display_order: parsed.displayOrder,
      })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as CollectionRow;
  },

  async update(id: string, input: Partial<CollectionCreateInput>) {
    const parsed = parseOrThrow(collectionCreateSchema.partial(), input);
    const payload: Record<string, unknown> = {};
    if (parsed.internalName !== undefined) payload.internal_name = parsed.internalName;
    if (parsed.slug !== undefined) payload.slug = parsed.slug;
    if (parsed.accessLevel !== undefined) payload.access_level = parsed.accessLevel;
    if (parsed.topic !== undefined) payload.topic = parsed.topic;
    if (parsed.audience !== undefined) payload.audience = parsed.audience;
    if (parsed.difficultyMin !== undefined) payload.difficulty_min = parsed.difficultyMin;
    if (parsed.difficultyMax !== undefined) payload.difficulty_max = parsed.difficultyMax;
    if (parsed.estimatedTotalMinutes !== undefined)
      payload.estimated_total_minutes = parsed.estimatedTotalMinutes;
    if (parsed.coverMediaId !== undefined) payload.cover_media_id = parsed.coverMediaId;
    if (parsed.thumbnailMediaId !== undefined) payload.thumbnail_media_id = parsed.thumbnailMediaId;
    if (parsed.isFeatured !== undefined) payload.is_featured = parsed.isFeatured;
    if (parsed.featuredFrom !== undefined) payload.featured_from = parsed.featuredFrom;
    if (parsed.featuredUntil !== undefined) payload.featured_until = parsed.featuredUntil;
    if (parsed.displayOrder !== undefined) payload.display_order = parsed.displayOrder;

    const { data, error } = await client()
      .from("collections")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as CollectionRow;
  },

  async upsertTranslation(input: CollectionTranslationInput) {
    const parsed = parseOrThrow(collectionTranslationSchema, input);
    const { data, error } = await client()
      .from("collection_translations")
      .upsert(
        {
          collection_id: parsed.collectionId,
          language_code: parsed.languageCode,
          status: parsed.status,
          title: parsed.title,
          short_description: parsed.shortDescription ?? null,
          full_description: parsed.fullDescription ?? null,
          seo_title: parsed.seoTitle ?? null,
          seo_description: parsed.seoDescription ?? null,
        },
        { onConflict: "collection_id,language_code" },
      )
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as CollectionTranslationRow;
  },
};

// ---------------------------------------------------------------------------
// Journeys
// ---------------------------------------------------------------------------

export type AdminJourneyListItem = Pick<
  JourneyRow,
  | "id"
  | "internal_title"
  | "slug"
  | "status"
  | "access_level"
  | "difficulty"
  | "primary_collection_id"
  | "position"
  | "updated_at"
  | "published_at"
  | "created_by"
  | "current_version"
> & {
  journey_translations: Pick<JourneyTranslationRow, "language_code" | "status" | "public_title">[];
};

export const adminJourneys = {
  async list(
    input: {
      status?: ContentStatus;
      collectionId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const { limit = 50, offset = 0 } = input;
    let query = client()
      .from("journeys")
      .select(
        "id, internal_title, slug, status, access_level, difficulty, primary_collection_id, " +
          "position, updated_at, published_at, created_by, current_version, " +
          "journey_translations(language_code, status, public_title)",
        { count: "exact" },
      );

    if (input.status) query = query.eq("status", input.status);
    if (input.collectionId) query = query.eq("primary_collection_id", input.collectionId);
    if (input.search?.trim()) {
      const term = input.search.trim().replace(/[%,()]/g, "");
      query = query.or(`internal_title.ilike.%${term}%,slug.ilike.%${term}%`);
    }

    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw fromPostgrestError(error);
    return { items: (data ?? []) as unknown as AdminJourneyListItem[], total: count ?? 0 };
  },

  async getById(id: string) {
    const { data, error } = await client()
      .from("journeys")
      .select(
        "*, journey_translations(*), scripture_references(*), " +
          "puzzle_templates(*), journey_tags(tag_id)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    if (!data) throw contentErrors.notFound("Journey", id);

    const row = data as unknown as JourneyRow & {
      journey_translations: JourneyTranslationRow[];
      scripture_references: ScriptureReferenceRow[];
      puzzle_templates: PuzzleTemplateRow[] | null;
      journey_tags: { tag_id: string }[];
    };

    return {
      ...row,
      // Phase 3: puzzle configuration moved to puzzle_templates (versioned,
      // per locale + difficulty). The active template is the current recipe.
      puzzle_template:
        (row.puzzle_templates ?? []).find((t) => t.status === "active") ??
        (row.puzzle_templates ?? [])[0] ??
        null,
    };
  },

  async create(input: JourneyCreateInput) {
    const parsed = parseOrThrow(journeyCreateSchema, input);
    const { data, error } = await client()
      .from("journeys")
      .insert({
        internal_title: parsed.internalTitle,
        slug: parsed.slug,
        primary_collection_id: parsed.primaryCollectionId,
        primary_language_code: parsed.primaryLanguageCode,
        position: parsed.position,
        access_level: parsed.accessLevel,
        difficulty: parsed.difficulty,
        theme: parsed.theme ?? null,
        audience: parsed.audience ?? null,
        estimated_minutes: parsed.estimatedMinutes,
        is_featured: parsed.isFeatured,
        daily_eligible: parsed.dailyEligible,
        hero_media_id: parsed.heroMediaId ?? null,
        social_media_id: parsed.socialMediaId ?? null,
      })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneyRow;
  },

  async update(id: string, input: Partial<JourneyCreateInput>) {
    const parsed = parseOrThrow(journeyCreateSchema.partial(), input);
    const payload: Record<string, unknown> = {};
    if (parsed.internalTitle !== undefined) payload.internal_title = parsed.internalTitle;
    if (parsed.slug !== undefined) payload.slug = parsed.slug;
    if (parsed.primaryCollectionId !== undefined)
      payload.primary_collection_id = parsed.primaryCollectionId;
    if (parsed.position !== undefined) payload.position = parsed.position;
    if (parsed.accessLevel !== undefined) payload.access_level = parsed.accessLevel;
    if (parsed.difficulty !== undefined) payload.difficulty = parsed.difficulty;
    if (parsed.theme !== undefined) payload.theme = parsed.theme;
    if (parsed.audience !== undefined) payload.audience = parsed.audience;
    if (parsed.estimatedMinutes !== undefined) payload.estimated_minutes = parsed.estimatedMinutes;
    if (parsed.isFeatured !== undefined) payload.is_featured = parsed.isFeatured;
    if (parsed.dailyEligible !== undefined) payload.daily_eligible = parsed.dailyEligible;
    if (parsed.heroMediaId !== undefined) payload.hero_media_id = parsed.heroMediaId;
    if (parsed.socialMediaId !== undefined) payload.social_media_id = parsed.socialMediaId;

    const { data, error } = await client()
      .from("journeys")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneyRow;
  },

  async upsertTranslation(input: JourneyTranslationInput) {
    const parsed = parseOrThrow(journeyTranslationSchema, input);
    const { data, error } = await client()
      .from("journey_translations")
      .upsert(
        {
          journey_id: parsed.journeyId,
          language_code: parsed.languageCode,
          status: parsed.status,
          public_title: parsed.publicTitle,
          subtitle: parsed.subtitle ?? null,
          devotional_body: parsed.devotionalBody ?? null,
          reflection_prompt: parsed.reflectionPrompt ?? null,
          prayer_body: parsed.prayerBody ?? null,
          completion_message: parsed.completionMessage ?? null,
          seo_title: parsed.seoTitle ?? null,
          seo_description: parsed.seoDescription ?? null,
        },
        { onConflict: "journey_id,language_code" },
      )
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneyTranslationRow;
  },

  /**
   * Phase 3: puzzle configuration lives in puzzle_templates. Journey creation
   * seeds a default draft template; richer editing is in PuzzleTemplateService.
   */
  async createDefaultPuzzleTemplate(input: {
    journeyId: string;
    languageCode: string;
    difficulty: DifficultyLevel;
  }) {
    const { data, error } = await client()
      .from("puzzle_templates")
      .insert({
        journey_id: input.journeyId,
        language_code: input.languageCode,
        difficulty: input.difficulty,
        version: 1,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as PuzzleTemplateRow;
  },

  async upsertScriptureReference(input: ScriptureReferenceInput) {
    const parsed = parseOrThrow(scriptureReferenceSchema, input);
    const { data, error } = await client()
      .from("scripture_references")
      .insert({
        journey_id: parsed.journeyId,
        source_id: parsed.sourceId,
        book_code: parsed.bookCode,
        chapter: parsed.chapter,
        verse_start: parsed.verseStart,
        verse_end: parsed.verseEnd ?? null,
        display_reference: parsed.displayReference,
        stored_text: parsed.storedText ?? null,
        external_content_id: parsed.externalContentId ?? null,
        position: parsed.position,
      })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as ScriptureReferenceRow;
  },

  async deleteScriptureReference(id: string) {
    const { error } = await client().from("scripture_references").delete().eq("id", id);
    if (error) throw fromPostgrestError(error);
  },
};

// ---------------------------------------------------------------------------
// Word list
// ---------------------------------------------------------------------------

export const adminWords = {
  async listForJourney(journeyId: string) {
    const { data, error } = await client()
      .from("journey_words")
      .select("*, journey_word_translations(*)")
      .eq("journey_id", journeyId)
      .order("position", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as (JourneyWordRow & {
      journey_word_translations: JourneyWordTranslationRow[];
    })[];
  },

  async createWord(journeyId: string, position: number) {
    const { data, error } = await client()
      .from("journey_words")
      .insert({ journey_id: journeyId, position })
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneyWordRow;
  },

  async deleteWord(id: string) {
    const { error } = await client().from("journey_words").delete().eq("id", id);
    if (error) throw fromPostgrestError(error);
  },

  /** Persists a new ordering in one round trip. */
  async reorder(entries: readonly { id: string; position: number }[]) {
    const results = await Promise.all(
      entries.map((e) =>
        client().from("journey_words").update({ position: e.position }).eq("id", e.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw fromPostgrestError(failed.error);
  },

  /**
   * Upserts a word translation. The normalized form is derived here rather than
   * accepted from the caller, so display and matching forms can never drift.
   */
  async upsertTranslation(input: JourneyWordTranslationInput) {
    const parsed = parseOrThrow(journeyWordTranslationSchema, input);
    const { data, error } = await client()
      .from("journey_word_translations")
      .upsert(
        {
          journey_word_id: parsed.journeyWordId,
          language_code: parsed.languageCode,
          status: parsed.status,
          display_value: parsed.displayValue,
          normalized_value: normalizeWord(parsed.displayValue),
          explanation: parsed.explanation ?? null,
        },
        { onConflict: "journey_word_id,language_code" },
      )
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as JourneyWordTranslationRow;
  },
};

// ---------------------------------------------------------------------------
// Workflow: review, status transitions, scheduling
// ---------------------------------------------------------------------------

export const adminWorkflow = {
  /**
   * Changes content status. The client-side check gives an immediate, precise
   * message; the database trigger is the authority and will reject anything
   * this misses.
   */
  async transition(input: {
    entityType: "collection" | "journey";
    entityId: string;
    from: ContentStatus;
    to: ContentStatus;
    capabilities: readonly ContentCapability[];
    actorId?: string | null;
    contentCreatedBy?: string | null;
    scheduledPublishAt?: string;
  }) {
    const check = canTransition({
      from: input.from,
      to: input.to,
      capabilities: input.capabilities,
      actorId: input.actorId,
      contentCreatedBy: input.contentCreatedBy,
    });

    if (!check.allowed) {
      if (check.reason === "self_approval") throw contentErrors.selfApprovalNotAllowed();
      if (check.reason === "invalid_transition")
        throw contentErrors.invalidTransition(input.from, input.to);
      throw contentErrors.unauthorized(`move content to ${input.to}`);
    }

    const table = input.entityType === "collection" ? "collections" : "journeys";
    const payload: Record<string, unknown> = { status: input.to };
    if (input.to === "scheduled") {
      if (!input.scheduledPublishAt) {
        throw contentErrors.publicationConflict("A publication time is required to schedule");
      }
      payload.scheduled_publish_at = input.scheduledPublishAt;
    }

    const { data, error } = await client()
      .from(table)
      .update(payload)
      .eq("id", input.entityId)
      .select()
      .single();

    if (error) throw fromPostgrestError(error);
    return data as unknown as CollectionRow | JourneyRow;
  },

  async submitReview(input: ReviewSubmissionInput & { actorId: string }) {
    const parsed = parseOrThrow(reviewSubmissionSchema, input);
    const { error } = await client()
      .from("content_review_logs")
      .insert({
        entity_type: parsed.entityType,
        entity_id: parsed.entityId,
        decision: parsed.decision,
        notes: parsed.notes ?? null,
        actor_id: input.actorId,
      });

    if (error) throw fromPostgrestError(error);
  },

  async setSchedule(input: {
    entityType: "collection" | "journey";
    entityId: string;
    scheduledPublishAt?: string;
    scheduledUnpublishAt?: string;
  }) {
    const parsed = parseOrThrow(publicationScheduleSchema, input);
    const table = parsed.entityType === "collection" ? "collections" : "journeys";
    const { error } = await client()
      .from(table)
      .update({
        scheduled_publish_at: parsed.scheduledPublishAt ?? null,
        scheduled_unpublish_at: parsed.scheduledUnpublishAt ?? null,
      })
      .eq("id", parsed.entityId);

    if (error) throw fromPostgrestError(error);
  },

  async listReviewQueue() {
    const { data, error } = await client()
      .from("journeys")
      .select(
        "id, internal_title, slug, status, updated_at, created_by, " +
          "journey_translations(language_code, status, public_title)",
      )
      .in("status", ["in_review", "changes_requested"])
      .order("updated_at", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as AdminJourneyListItem[];
  },

  async getReviewHistory(entityType: string, entityId: string) {
    const { data, error } = await client()
      .from("content_review_logs")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as ContentReviewLogRow[];
  },

  async getVersions(entityType: string, entityId: string) {
    const { data, error } = await client()
      .from("content_versions")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("version", { ascending: false });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as ContentVersionRow[];
  },
};

// ---------------------------------------------------------------------------
// Daily Journey
// ---------------------------------------------------------------------------

export const adminDailyJourney = {
  async listRange(fromDate: string, toDate: string) {
    const { data, error } = await client()
      .from("daily_journeys")
      .select(
        "journey_date, language_code, journey_id, is_fallback, notes, journeys(internal_title, slug, status)",
      )
      .gte("journey_date", fromDate)
      .lte("journey_date", toDate)
      .order("journey_date", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as DailyJourneyWithTitle[];
  },

  async assign(input: DailyJourneyAssignmentInput) {
    const parsed = parseOrThrow(dailyJourneyAssignmentSchema, input);

    // Surface the conflict as a domain error rather than a raw unique violation.
    const { data: existing } = await client()
      .from("daily_journeys")
      .select("journey_id")
      .eq("journey_date", parsed.journeyDate)
      .eq("language_code", parsed.languageCode)
      .maybeSingle();

    if (existing && (existing as { journey_id: string }).journey_id !== parsed.journeyId) {
      throw contentErrors.scheduledPublicationConflict(parsed.journeyDate, parsed.languageCode);
    }

    const { error } = await client()
      .from("daily_journeys")
      .upsert(
        {
          journey_date: parsed.journeyDate,
          language_code: parsed.languageCode,
          journey_id: parsed.journeyId,
          is_fallback: parsed.isFallback,
          notes: parsed.notes ?? null,
        },
        { onConflict: "journey_date,language_code" },
      );

    if (error) throw fromPostgrestError(error);
  },

  async unassign(journeyDate: string, languageCode: string) {
    const { error } = await client()
      .from("daily_journeys")
      .delete()
      .eq("journey_date", journeyDate)
      .eq("language_code", languageCode);

    if (error) throw fromPostgrestError(error);
  },
};

export type DailyJourneyWithTitle = {
  journey_date: string;
  language_code: string;
  journey_id: string;
  is_fallback: boolean;
  notes: string | null;
  journeys: { internal_title: string; slug: string; status: ContentStatus } | null;
};

// ---------------------------------------------------------------------------
// Dashboard & audit
// ---------------------------------------------------------------------------

export type DashboardCounts = {
  draft: number;
  inReview: number;
  changesRequested: number;
  approved: number;
  scheduled: number;
  published: number;
};

export const adminDashboard = {
  /**
   * Real counts from the database — one HEAD request per status, no rows
   * transferred. Never invent numbers for a dashboard.
   */
  async getCounts(): Promise<DashboardCounts> {
    const statuses: { key: keyof DashboardCounts; status: ContentStatus }[] = [
      { key: "draft", status: "draft" },
      { key: "inReview", status: "in_review" },
      { key: "changesRequested", status: "changes_requested" },
      { key: "approved", status: "approved" },
      { key: "scheduled", status: "scheduled" },
      { key: "published", status: "published" },
    ];

    const results = await Promise.all(
      statuses.map(async ({ key, status }) => {
        const { count, error } = await client()
          .from("journeys")
          .select("id", { count: "exact", head: true })
          .eq("status", status);
        if (error) throw fromPostgrestError(error);
        return [key, count ?? 0] as const;
      }),
    );

    return Object.fromEntries(results) as DashboardCounts;
  },

  async getRecentlyEdited(limit = 8) {
    const { data, error } = await client()
      .from("journeys")
      .select("id, internal_title, slug, status, updated_at, updated_by")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as Pick<
      JourneyRow,
      "id" | "internal_title" | "slug" | "status" | "updated_at" | "updated_by"
    >[];
  },

  async getUpcomingDailyJourneys(limit = 7) {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await client()
      .from("daily_journeys")
      .select(
        "journey_date, language_code, journey_id, is_fallback, notes, journeys(internal_title, slug, status)",
      )
      .gte("journey_date", today)
      .order("journey_date", { ascending: true })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return (data ?? []) as unknown as DailyJourneyWithTitle[];
  },

  /** Journeys published without a complete translation in every active locale. */
  async getTranslationGaps(activeLocales: readonly string[]) {
    const { data, error } = await client()
      .from("journeys")
      .select("id, internal_title, slug, status, journey_translations(language_code, status)")
      .in("status", ["published", "approved", "scheduled"]);

    if (error) throw fromPostgrestError(error);

    return (
      (data ?? []) as unknown as (Pick<JourneyRow, "id" | "internal_title" | "slug" | "status"> & {
        journey_translations: Pick<JourneyTranslationRow, "language_code" | "status">[];
      })[]
    )
      .map((journey) => {
        const publishedLocales = journey.journey_translations
          .filter((t) => t.status === "published")
          .map((t) => t.language_code);
        const missing = activeLocales.filter((l) => !publishedLocales.includes(l));
        return { ...journey, missingLocales: missing };
      })
      .filter((j) => j.missingLocales.length > 0);
  },
};

export const adminAudit = {
  async list(input: { limit?: number; offset?: number; entityId?: string } = {}) {
    const { limit = 50, offset = 0 } = input;
    let query = client().from("content_audit_logs").select("*", { count: "exact" });
    if (input.entityId) query = query.eq("entity_id", input.entityId);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw fromPostgrestError(error);
    return { items: (data ?? []) as unknown as ContentAuditLogRow[], total: count ?? 0 };
  },
};
