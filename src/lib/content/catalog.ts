import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { publicContent, type PublicCollection, type PublicJourney } from "./public-repository";
import type { Collection } from "@/lib/mock-data";

import colJesus from "@/assets/col-jesus.jpg";
import colPsalms from "@/assets/col-psalms.jpg";
import colFamily from "@/assets/col-family.jpg";
import colProverbs from "@/assets/col-proverbs.jpg";
import colFaith from "@/assets/col-faith.jpg";
import colWomen from "@/assets/col-women.jpg";
import colMen from "@/assets/col-men.jpg";
import colPrayer from "@/assets/col-prayer.jpg";
import colPurpose from "@/assets/col-purpose.jpg";

// Presentation adapter: turns published database content into the exact shape
// the existing cards and pages already render, so real data arrives without
// touching the visual identity.

const IMAGE_RULES: [RegExp, string][] = [
  [/jesus|christ|gospel/, colJesus],
  [/psalm/, colPsalms],
  [/proverb|wisdom/, colProverbs],
  [/family|home|marriage|parent/, colFamily],
  [/faith|trust|courage/, colFaith],
  [/women|woman/, colWomen],
  [/men|man/, colMen],
  [/pray/, colPrayer],
  [/purpose|calling/, colPurpose],
];

const FALLBACK_IMAGES = [colFaith, colPurpose, colPrayer, colFamily];

const HUES = [
  "oklch(0.55 0.06 250)",
  "oklch(0.6 0.05 130)",
  "oklch(0.635 0.115 70)",
  "oklch(0.45 0.05 45)",
  "oklch(0.6 0.06 210)",
  "oklch(0.62 0.09 90)",
];

function hash(text: string) {
  return text.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
}

function imageFor(slug: string, title: string) {
  const haystack = `${slug} ${title}`.toLowerCase();
  for (const [pattern, image] of IMAGE_RULES) {
    if (pattern.test(haystack)) return image;
  }
  return FALLBACK_IMAGES[hash(slug) % FALLBACK_IMAGES.length];
}

const LANGUAGE_LABELS: Record<string, Collection["languages"] extends (infer T)[] | undefined ? T : never> = {
  en: "English",
  pt: "Português",
  es: "Español",
};

function difficultyLabel(value: string | null): Collection["difficulty"] {
  switch (value) {
    case "gentle":
      return "Gentle";
    case "challenging":
    case "expert":
      return "Challenging";
    default:
      return "Balanced";
  }
}

export type CatalogCollection = Collection & { id: string };

export function toUiCollection(
  source: PublicCollection,
  extras: { count: number; languages: string[] },
): CatalogCollection {
  return {
    id: source.id,
    slug: source.slug,
    title: source.title,
    description: source.shortDescription ?? source.fullDescription ?? "",
    count: extras.count,
    hue: HUES[hash(source.slug) % HUES.length],
    image: imageFor(source.slug, source.title),
    difficulty: difficultyLabel(source.difficultyMin),
    access: source.accessLevel === "premium" ? "Premium" : "Free",
    languages: extras.languages
      .map((code) => LANGUAGE_LABELS[code])
      .filter((label): label is NonNullable<typeof label> => Boolean(label)),
  };
}

/** Journey counts and translated languages, fetched once for the whole grid. */
async function fetchCatalogExtras(): Promise<{
  counts: Record<string, number>;
  languages: Record<string, string[]>;
}> {
  const client = getSupabaseClient();
  const [journeys, translations] = await Promise.all([
    client
      .from("journeys")
      .select("id, primary_collection_id")
      .eq("status", "published")
      .is("archived_at", null),
    client
      .from("collection_translations")
      .select("collection_id, language_code")
      .eq("status", "published"),
  ]);

  const counts: Record<string, number> = {};
  for (const row of (journeys.data ?? []) as { primary_collection_id: string }[]) {
    counts[row.primary_collection_id] = (counts[row.primary_collection_id] ?? 0) + 1;
  }

  const languages: Record<string, string[]> = {};
  for (const row of (translations.data ?? []) as {
    collection_id: string;
    language_code: string;
  }[]) {
    (languages[row.collection_id] ??= []).push(row.language_code);
  }

  return { counts, languages };
}

export function useCatalogCollections() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ["catalog", "collections", locale],
    enabled: isSupabaseConfigured(),
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<CatalogCollection[]> => {
      const [collections, extras] = await Promise.all([
        publicContent.getCollections(locale),
        fetchCatalogExtras(),
      ]);
      return collections.map((c) =>
        toUiCollection(c, {
          count: extras.counts[c.id] ?? 0,
          languages: extras.languages[c.id] ?? [],
        }),
      );
    },
  });
}

export type CatalogCollectionDetail = {
  collection: CatalogCollection;
  journeys: PublicJourney[];
};

export function useCatalogCollection(slug: string) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ["catalog", "collection", slug, locale],
    enabled: isSupabaseConfigured() && Boolean(slug),
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async (): Promise<CatalogCollectionDetail> => {
      const collection = await publicContent.getCollectionBySlug(slug, locale);
      const journeys = await publicContent.getJourneysForCollection(collection.id, locale);
      const extras = await fetchCatalogExtras();
      return {
        collection: toUiCollection(collection, {
          count: journeys.length || (extras.counts[collection.id] ?? 0),
          languages: extras.languages[collection.id] ?? [],
        }),
        journeys,
      };
    },
  });
}

export function useDailyJourney() {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ["catalog", "daily", locale],
    enabled: isSupabaseConfigured(),
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: () => publicContent.getDailyJourney(locale),
  });
}

/** A specific published journey, when the reader picked one from the library. */
export function useJourneyBySlug(slug?: string) {
  const { locale } = useI18n();
  return useQuery({
    queryKey: ["catalog", "journey", slug ?? "", locale],
    enabled: isSupabaseConfigured() && Boolean(slug),
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: () => publicContent.getJourneyBySlug(slug as string, locale),
  });
}