import type { SupabaseClient } from "@supabase/supabase-js";
import { CONTENT_PACKS } from "./data";

// The install itself, callable from the staff button in Content Studio and
// from the self-heal endpoint. Idempotent by construction: a pack whose
// collection row already exists is skipped whole; everything else upserts
// with ignoreDuplicates. Content only — fixed authored rows, no caller input
// reaches any query.

export interface InstallReport {
  alreadyPresent: string[];
  installed: string[];
}

// The privileged client is created per-call by the server-only importers of
// this module; typing stays loose because the generated Database type does
// not know these content tables' insert shapes end to end.
type AdminClient = SupabaseClient<never, never, never>;

export async function installContentPacksCore(admin: AdminClient): Promise<InstallReport> {
  const db = admin as unknown as SupabaseClient;
  const now = new Date().toISOString();

  const { data: webSource, error: sourceError } = await db
    .from("scripture_sources")
    .select("id")
    .eq("translation_code", "WEB")
    .single();
  if (sourceError || !webSource) throw new Error("WEB scripture source missing");

  const report: InstallReport = { alreadyPresent: [], installed: [] };

  for (const pack of CONTENT_PACKS) {
    const { data: existing } = await db
      .from("collections")
      .select("id")
      .eq("id", pack.id)
      .maybeSingle();
    if (existing) {
      report.alreadyPresent.push(pack.internalName);
      continue;
    }

    const { error: collectionError } = await db.from("collections").upsert(
      {
        id: pack.id,
        internal_name: pack.internalName,
        slug: pack.slug,
        primary_language_code: "en",
        status: "published",
        access_level: "free",
        topic: pack.topic,
        audience: pack.audience,
        difficulty_min: "gentle",
        difficulty_max: "challenging",
        estimated_total_minutes: pack.journeys.length * 7,
        display_order: pack.displayOrder,
        is_featured: true,
        published_at: now,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (collectionError) throw new Error(`collections: ${collectionError.message}`);

    const { error: ctError } = await db.from("collection_translations").upsert(
      Object.entries(pack.translations).map(([language, translation]) => ({
        collection_id: pack.id,
        language_code: language,
        status: "published",
        title: translation.title,
        short_description: translation.short,
        full_description: translation.full,
      })),
      { onConflict: "collection_id,language_code", ignoreDuplicates: true },
    );
    if (ctError) throw new Error(`collection_translations: ${ctError.message}`);

    const { error: journeyError } = await db.from("journeys").upsert(
      pack.journeys.map((journey) => ({
        id: journey.id,
        internal_title: journey.internalTitle,
        slug: journey.slug,
        primary_collection_id: pack.id,
        position: journey.position,
        primary_language_code: "en",
        status: "published",
        access_level: "free",
        difficulty: journey.difficulty,
        theme: journey.theme,
        estimated_minutes: 7,
        daily_eligible: true,
        published_at: now,
      })),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (journeyError) throw new Error(`journeys: ${journeyError.message}`);

    const { error: jtError } = await db.from("journey_translations").upsert(
      pack.journeys.flatMap((journey) =>
        Object.entries(journey.translations).map(([language, translation]) => ({
          journey_id: journey.id,
          language_code: language,
          status: "published",
          public_title: translation.title,
          devotional_body: translation.devotional,
          reflection_prompt: translation.reflection,
          prayer_body: translation.prayer,
          completion_message: translation.completion,
        })),
      ),
      { onConflict: "journey_id,language_code", ignoreDuplicates: true },
    );
    if (jtError) throw new Error(`journey_translations: ${jtError.message}`);

    const { error: srError } = await db.from("scripture_references").insert(
      pack.journeys.map((journey) => ({
        journey_id: journey.id,
        source_id: (webSource as { id: string }).id,
        book_code: journey.scripture.bookCode,
        chapter: journey.scripture.chapter,
        verse_start: journey.scripture.verseStart,
        verse_end: journey.scripture.verseEnd,
        display_reference: journey.scripture.displayReference,
        stored_text: journey.scripture.storedText,
        position: 0,
      })),
    );
    if (srError) throw new Error(`scripture_references: ${srError.message}`);

    const { error: wordsError } = await db.from("journey_words").upsert(
      pack.journeys.flatMap((journey) =>
        journey.words.map((word) => ({
          id: word.id,
          journey_id: journey.id,
          position: word.position,
          is_required: true,
          min_difficulty: word.minDifficulty,
        })),
      ),
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (wordsError) throw new Error(`journey_words: ${wordsError.message}`);

    const { error: wtError } = await db.from("journey_word_translations").upsert(
      pack.journeys.flatMap((journey) =>
        journey.words.flatMap((word) =>
          Object.entries(word.translations).map(([language, translation]) => ({
            journey_word_id: word.id,
            journey_id: journey.id,
            language_code: language,
            status: "published",
            display_value: translation.display,
            normalized_value: translation.normalized,
          })),
        ),
      ),
      { onConflict: "journey_word_id,language_code", ignoreDuplicates: true },
    );
    if (wtError) throw new Error(`journey_word_translations: ${wtError.message}`);

    report.installed.push(pack.internalName);
  }

  return report;
}
