import { getSupabaseClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import { contentErrors, fromPostgrestError } from "./errors";
import { resolveTranslation } from "./translation";
import type {
  CollectionRow,
  CollectionTranslationRow,
  DailyJourneyRow,
  JourneyRow,
  JourneyTranslationRow,
  JourneyWordTranslationRow,
  ScriptureReferenceRow,
} from "./rows";
import type { PuzzleTemplateRow } from "@/lib/puzzle/rows";
import type { AccessLevel, DifficultyLevel } from "./types";

// Public read layer. RLS already restricts these tables to published content;
// every filter here is defence in depth so a policy regression cannot silently
// leak drafts, and so the intent is readable at the call site.
//
// Administrative columns (internal_name, created_by, review state) are never
// selected — the public frontend cannot render what it never receives.

const PUBLIC_COLLECTION_COLUMNS =
  "id, slug, access_level, topic, audience, difficulty_min, difficulty_max, " +
  "estimated_total_minutes, cover_media_id, thumbnail_media_id, is_featured, " +
  "display_order, published_at";

const PUBLIC_JOURNEY_COLUMNS =
  "id, slug, primary_collection_id, position, access_level, difficulty, theme, " +
  "audience, estimated_minutes, is_featured, hero_media_id, social_media_id, published_at";

const PUBLIC_TRANSLATION_STATUSES = ["published"] as const;

export type PublicCollection = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  fullDescription: string | null;
  accessLevel: AccessLevel;
  topic: string | null;
  audience: string | null;
  difficultyMin: DifficultyLevel | null;
  difficultyMax: DifficultyLevel | null;
  estimatedTotalMinutes: number | null;
  coverMediaId: string | null;
  isFeatured: boolean;
  displayOrder: number;
  /** True when the requested locale was unavailable and English was served. */
  isFallbackTranslation: boolean;
};

export type PublicJourney = {
  id: string;
  slug: string;
  collectionId: string;
  title: string;
  subtitle: string | null;
  devotionalBody: string | null;
  reflectionPrompt: string | null;
  prayerBody: string | null;
  completionMessage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  accessLevel: AccessLevel;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  theme: string | null;
  heroMediaId: string | null;
  isFallbackTranslation: boolean;
};

export type PublicJourneyDetail = PublicJourney & {
  scripture: ScriptureReferenceRow[];
  words: { display: string; normalized: string; explanation: string | null }[];
  puzzleTemplate: PuzzleTemplateRow | null;
};

type CollectionWithTranslations = Pick<
  CollectionRow,
  | "id"
  | "slug"
  | "access_level"
  | "topic"
  | "audience"
  | "difficulty_min"
  | "difficulty_max"
  | "estimated_total_minutes"
  | "cover_media_id"
  | "thumbnail_media_id"
  | "is_featured"
  | "display_order"
  | "published_at"
> & { collection_translations: CollectionTranslationRow[] };

type JourneyWithTranslations = Pick<
  JourneyRow,
  | "id"
  | "slug"
  | "primary_collection_id"
  | "position"
  | "access_level"
  | "difficulty"
  | "theme"
  | "audience"
  | "estimated_minutes"
  | "is_featured"
  | "hero_media_id"
  | "social_media_id"
  | "published_at"
> & { journey_translations: JourneyTranslationRow[] };

function mapCollection(row: CollectionWithTranslations, locale: Locale): PublicCollection | null {
  const resolved = resolveTranslation(
    row.collection_translations.map((t) => ({ ...t, languageCode: t.language_code })),
    locale,
    PUBLIC_TRANSLATION_STATUSES,
  );
  if (!resolved) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: resolved.translation.title,
    shortDescription: resolved.translation.short_description,
    fullDescription: resolved.translation.full_description,
    accessLevel: row.access_level,
    topic: row.topic,
    audience: row.audience,
    difficultyMin: row.difficulty_min,
    difficultyMax: row.difficulty_max,
    estimatedTotalMinutes: row.estimated_total_minutes,
    coverMediaId: row.cover_media_id,
    isFeatured: row.is_featured,
    displayOrder: row.display_order,
    isFallbackTranslation: resolved.isFallback,
  };
}

function mapJourney(row: JourneyWithTranslations, locale: Locale): PublicJourney | null {
  const resolved = resolveTranslation(
    row.journey_translations.map((t) => ({ ...t, languageCode: t.language_code })),
    locale,
    PUBLIC_TRANSLATION_STATUSES,
  );
  if (!resolved) return null;

  const t = resolved.translation;
  return {
    id: row.id,
    slug: row.slug,
    collectionId: row.primary_collection_id,
    title: t.public_title,
    subtitle: t.subtitle,
    devotionalBody: t.devotional_body,
    reflectionPrompt: t.reflection_prompt,
    prayerBody: t.prayer_body,
    completionMessage: t.completion_message,
    seoTitle: t.seo_title,
    seoDescription: t.seo_description,
    accessLevel: row.access_level,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    theme: row.theme,
    heroMediaId: row.hero_media_id,
    isFallbackTranslation: resolved.isFallback,
  };
}

// The published/visible predicate shared by every public query. Written once
// per entity so TypeScript infers the concrete PostgREST builder type instead
// of recursing through a generic self-referential constraint.
function publishedCollections(select: string, options?: { count: "exact" }) {
  return getSupabaseClient()
    .from("collections")
    .select(select, options)
    .eq("status", "published")
    .is("archived_at", null)
    .lte("published_at", new Date().toISOString())
    .in("access_level", ["free", "premium"]);
}

function publishedJourneys(select: string, options?: { count: "exact" }) {
  return getSupabaseClient()
    .from("journeys")
    .select(select, options)
    .eq("status", "published")
    .is("archived_at", null)
    .lte("published_at", new Date().toISOString())
    .in("access_level", ["free", "premium"]);
}

export const publicContent = {
  async getCollections(locale: Locale): Promise<PublicCollection[]> {
    const { data, error } = await publishedCollections(
      `${PUBLIC_COLLECTION_COLUMNS}, collection_translations(*)`,
    ).order("display_order", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return ((data ?? []) as unknown as CollectionWithTranslations[])
      .map((row) => mapCollection(row, locale))
      .filter((c): c is PublicCollection => c !== null);
  },

  async getFeaturedCollections(locale: Locale, limit = 6): Promise<PublicCollection[]> {
    const now = new Date().toISOString();
    const { data, error } = await publishedCollections(
      `${PUBLIC_COLLECTION_COLUMNS}, collection_translations(*)`,
    )
      .eq("is_featured", true)
      .or(`featured_from.is.null,featured_from.lte.${now}`)
      .or(`featured_until.is.null,featured_until.gte.${now}`)
      .order("display_order", { ascending: true })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return ((data ?? []) as unknown as CollectionWithTranslations[])
      .map((row) => mapCollection(row, locale))
      .filter((c): c is PublicCollection => c !== null);
  },

  async getCollectionBySlug(slug: string, locale: Locale): Promise<PublicCollection> {
    const { data, error } = await publishedCollections(
      `${PUBLIC_COLLECTION_COLUMNS}, collection_translations(*)`,
    )
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    if (!data) throw contentErrors.notFound("Collection", slug);

    const mapped = mapCollection(data as unknown as CollectionWithTranslations, locale);
    if (!mapped) throw contentErrors.translationMissing(locale);
    return mapped;
  },

  async getJourneysForCollection(collectionId: string, locale: Locale): Promise<PublicJourney[]> {
    const { data, error } = await publishedJourneys(
      `${PUBLIC_JOURNEY_COLUMNS}, journey_translations(*)`,
    )
      .eq("primary_collection_id", collectionId)
      .order("position", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return ((data ?? []) as unknown as JourneyWithTranslations[])
      .map((row) => mapJourney(row, locale))
      .filter((j): j is PublicJourney => j !== null);
  },

  async getJourneyBySlug(slug: string, locale: Locale): Promise<PublicJourneyDetail> {
    const client = getSupabaseClient();
    const { data, error } = await publishedJourneys(
      `${PUBLIC_JOURNEY_COLUMNS}, journey_translations(*), ` +
        `scripture_references(*), puzzle_templates(*)`,
    )
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw fromPostgrestError(error);
    if (!data) throw contentErrors.notFound("Journey", slug);

    const row = data as unknown as JourneyWithTranslations & {
      scripture_references: ScriptureReferenceRow[];
      puzzle_templates: PuzzleTemplateRow[] | null;
    };

    const mapped = mapJourney(row, locale);
    if (!mapped) throw contentErrors.translationMissing(locale);

    // Word list is fetched separately: it is filtered by locale, and the public
    // policy only exposes published word translations.
    const { data: wordRows, error: wordError } = await client
      .from("journey_word_translations")
      .select("display_value, normalized_value, explanation, journey_word_id")
      .eq("journey_id", row.id)
      .eq("language_code", mapped.isFallbackTranslation ? "en" : locale)
      .eq("status", "published");

    if (wordError) throw fromPostgrestError(wordError);

    // Only the active template is a valid recipe for a public puzzle.
    const puzzleTemplate =
      (row.puzzle_templates ?? []).find((t) => t.status === "active") ?? null;

    return {
      ...mapped,
      scripture: (row.scripture_references ?? []).sort((a, b) => a.position - b.position),
      words: (
        (wordRows ?? []) as Pick<
          JourneyWordTranslationRow,
          "display_value" | "normalized_value" | "explanation"
        >[]
      ).map((w) => ({
        display: w.display_value,
        normalized: w.normalized_value,
        explanation: w.explanation,
      })),
      puzzleTemplate,
    };
  },

  /**
   * Resolves the Daily Journey for a date, falling back to the default locale's
   * assignment. Future dates are invisible to the public via RLS, so a request
   * for tomorrow returns nothing rather than leaking upcoming content.
   */
  async getDailyJourney(locale: Locale, date = new Date()): Promise<PublicJourneyDetail | null> {
    const client = getSupabaseClient();
    const isoDate = date.toISOString().slice(0, 10);

    const { data, error } = await client
      .from("daily_journeys")
      .select("journey_date, language_code, journey_id, is_fallback, notes")
      .eq("journey_date", isoDate)
      .in("language_code", [locale, "en"]);

    if (error) throw fromPostgrestError(error);

    const rows = (data ?? []) as DailyJourneyRow[];
    const assignment =
      rows.find((r) => r.language_code === locale) ?? rows.find((r) => r.language_code === "en");
    if (!assignment) return null;

    const { data: journeyRow, error: journeyError } = await publishedJourneys(
      `${PUBLIC_JOURNEY_COLUMNS}, journey_translations(*)`,
    )
      .eq("id", assignment.journey_id)
      .maybeSingle();

    if (journeyError) throw fromPostgrestError(journeyError);
    if (!journeyRow) return null;

    const mapped = mapJourney(journeyRow as unknown as JourneyWithTranslations, locale);
    if (!mapped) return null;

    return this.getJourneyBySlug(mapped.slug, locale);
  },

  async getRelatedJourneys(
    journeyId: string,
    collectionId: string,
    locale: Locale,
    limit = 3,
  ): Promise<PublicJourney[]> {
    const { data, error } = await publishedJourneys(
      `${PUBLIC_JOURNEY_COLUMNS}, journey_translations(*)`,
    )
      .eq("primary_collection_id", collectionId)
      .neq("id", journeyId)
      .order("position", { ascending: true })
      .limit(limit);

    if (error) throw fromPostgrestError(error);
    return ((data ?? []) as unknown as JourneyWithTranslations[])
      .map((row) => mapJourney(row, locale))
      .filter((j): j is PublicJourney => j !== null);
  },

  /**
   * Server-side search across translated titles and descriptions. Filtering
   * happens in PostgreSQL, never by downloading the whole catalogue.
   */
  async searchJourneys(
    input: {
      query?: string;
      collectionId?: string;
      difficulty?: DifficultyLevel;
      accessLevel?: AccessLevel;
      maxMinutes?: number;
      limit?: number;
      offset?: number;
    },
    locale: Locale,
  ): Promise<{ items: PublicJourney[]; total: number }> {
    const { limit = 24, offset = 0 } = input;
    let query = publishedJourneys(`${PUBLIC_JOURNEY_COLUMNS}, journey_translations!inner(*)`, {
      count: "exact",
    }).eq("journey_translations.status", "published");

    if (input.collectionId) query = query.eq("primary_collection_id", input.collectionId);
    if (input.difficulty) query = query.eq("difficulty", input.difficulty);
    if (input.accessLevel) query = query.eq("access_level", input.accessLevel);
    if (input.maxMinutes) query = query.lte("estimated_minutes", input.maxMinutes);
    if (input.query?.trim()) {
      const term = input.query.trim().replace(/[%,()]/g, "");
      query = query.or(`public_title.ilike.%${term}%,subtitle.ilike.%${term}%`, {
        referencedTable: "journey_translations",
      });
    }

    const { data, error, count } = await query
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw fromPostgrestError(error);

    return {
      items: ((data ?? []) as unknown as JourneyWithTranslations[])
        .map((row) => mapJourney(row, locale))
        .filter((j): j is PublicJourney => j !== null),
      total: count ?? 0,
    };
  },

  async getAvailableLocales(): Promise<{ code: string; nativeName: string }[]> {
    const { data, error } = await getSupabaseClient()
      .from("languages")
      .select("code, native_name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw fromPostgrestError(error);
    return ((data ?? []) as { code: string; native_name: string }[]).map((l) => ({
      code: l.code,
      nativeName: l.native_name,
    }));
  },
};
