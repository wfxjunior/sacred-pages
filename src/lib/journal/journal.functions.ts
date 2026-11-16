import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const JOURNAL_STATES = ["joyful", "steady", "seeking", "weary", "struggling"] as const;

const entrySchema = z.object({
  journeyTitle: z.string().trim().max(120).default(""),
  state: z.enum(JOURNAL_STATES),
  progress: z.number().int().min(0).max(100),
  notes: z.string().trim().min(3).max(4000),
  locale: z.enum(["en", "pt", "es"]).default("en"),
});

const LANG = { en: "English", pt: "Brazilian Portuguese", es: "Spanish" } as const;

// Bible edition per app language — the same public-domain editions the app uses for journey verses.
export const BIBLE_EDITION = {
  en: { name: "World English Bible", abbr: "WEB", sample: "Psalm 23:1" },
  pt: { name: "Almeida Revista e Corrigida", abbr: "ARC", sample: "Salmo 23:1" },
  es: { name: "Reina-Valera 1909", abbr: "RVR1909", sample: "Salmo 23:1" },
} as const;

export const listJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("journey_log_entries")
      .select("id, journey_title, state, progress, notes, reflection, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Could not load your journal.");
    return data ?? [];
  });

export const createJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => entrySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    let reflection: string | null = null;
    let aiError: string | null = null;
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions:
          "You are a gentle, mature Christian devotional companion inside Lumena, a daily Scripture app. " +
          "Read the reader's journey notes and write a short personalized reflection (90-160 words): " +
          "acknowledge their state honestly, connect it to one fitting Bible passage (cite the reference), " +
          "and close with one practical next step for tomorrow and a one-line prayer. " +
          "No clichés, no medical or clinical advice; if they mention self-harm, gently encourage reaching out to a trusted person or local crisis line. " +
          `Write entirely in ${LANG[data.locale]}, including the prayer. ` +
          `Quote the verse word-for-word from the ${BIBLE_EDITION[data.locale].name} and cite it with book names in ${LANG[data.locale]} ` +
          `followed by the edition abbreviation (e.g. "${BIBLE_EDITION[data.locale].sample} (${BIBLE_EDITION[data.locale].abbr})"). ` +
          "Never mix languages or editions. Plain text, no markdown headings.",
        input: `Journey: ${data.journeyTitle || "(not specified)"}\nState: ${data.state}\nProgress: ${data.progress}%\nNotes:\n${data.notes}`,
      });
      const r = res as { output_text?: string; output?: Array<{ content?: Array<{ type: string; text?: string }> }> };
      reflection =
        r.output_text ??
        (r.output ?? [])
          .flatMap((o) => o.content ?? [])
          .filter((c) => c.type === "output_text")
          .map((c) => c.text ?? "")
          .join("")
          .trim();
      if (!reflection) reflection = null;
    } catch (e) {
      console.error("journal reflection failed", e instanceof GatewayError ? e.code : e);
      aiError = "reflection_unavailable";
    }

    const { data: row, error } = await context.supabase
      .from("journey_log_entries")
      .insert({
        user_id: context.userId,
        journey_title: data.journeyTitle,
        state: data.state,
        progress: data.progress,
        notes: data.notes,
        reflection,
        locale: data.locale,
      })
      .select("id, journey_title, state, progress, notes, reflection, created_at")
      .single();
    if (error) throw new Error("Could not save your entry.");
    return { entry: row, aiError };
  });

export const deleteJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("journey_log_entries").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete entry.");
    return { ok: true };
  });
