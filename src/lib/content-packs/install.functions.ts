import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONTENT_PACKS } from "./data";

// Installs the authored content packs into the live database. Exists because
// migrations pushed from outside the Lovable editor are not executed on
// publish — the SQL file shipped, the content did not. This runs the same
// inserts through the server's privileged client, behind the same staff check
// every Content Studio function uses, and is idempotent: everything upserts
// with ignoreDuplicates, so clicking twice changes nothing.

export interface InstallReport {
  alreadyPresent: string[];
  installed: string[];
}

export const installContentPacks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InstallReport> => {
    const { data: isStaff, error: roleError } = await context.supabase.rpc("is_content_staff", {
      uid: context.userId,
    });
    if (roleError || !isStaff) throw new Error("Not authorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    const { data: webSource, error: sourceError } = await supabaseAdmin
      .from("scripture_sources")
      .select("id")
      .eq("translation_code", "WEB")
      .single();
    if (sourceError || !webSource) throw new Error("WEB scripture source missing");

    const report: InstallReport = { alreadyPresent: [], installed: [] };

    for (const pack of CONTENT_PACKS) {
      const { data: existing } = await supabaseAdmin
        .from("collections")
        .select("id")
        .eq("id", pack.id)
        .maybeSingle();
      if (existing) {
        report.alreadyPresent.push(pack.internalName);
        continue;
      }

      const { error: collectionError } = await supabaseAdmin.from("collections").upsert(
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

      const { error: ctError } = await supabaseAdmin.from("collection_translations").upsert(
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

      const { error: journeyError } = await supabaseAdmin.from("journeys").upsert(
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

      const { error: jtError } = await supabaseAdmin.from("journey_translations").upsert(
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

      const { error: srError } = await supabaseAdmin.from("scripture_references").insert(
        pack.journeys.map((journey) => ({
          journey_id: journey.id,
          source_id: webSource.id,
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

      const { error: wordsError } = await supabaseAdmin.from("journey_words").upsert(
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

      const { error: wtError } = await supabaseAdmin.from("journey_word_translations").upsert(
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
  });
