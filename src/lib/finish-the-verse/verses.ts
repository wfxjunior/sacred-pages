import type { GameLocale } from "@/lib/games";
import type { VersePassage } from "./types";

// The curated memorization set — World English Bible, public domain, the same
// translation the journeys use ("Yahweh" and all). The day's real journey
// verse joins this pool at the front when one is available; these keep the
// mode rich when it is not. Per-locale slots mirror the other modes and fall
// back to English until translated sets ship.

const EN_VERSES: readonly VersePassage[] = [
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
  },
  {
    reference: "Psalm 23:1",
    text: "Yahweh is my shepherd; I shall lack nothing.",
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
  },
  {
    reference: "Psalm 119:105",
    text: "Your word is a lamp to my feet, and a light for my path.",
  },
  {
    reference: "Romans 8:28",
    text: "We know that all things work together for good for those who love God, for those who are called according to his purpose.",
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first God's Kingdom and his righteousness; and all these things will be given to you as well.",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
  },
  {
    reference: "Psalm 118:24",
    text: "This is the day that Yahweh has made. We will rejoice and be glad in it!",
  },
];

const VERSES_BY_LOCALE: Record<GameLocale, readonly VersePassage[]> = {
  en: EN_VERSES,
  pt: [],
  es: [],
};

export function finishVersePassagesForLocale(locale: GameLocale): readonly VersePassage[] {
  const set = VERSES_BY_LOCALE[locale];
  return set.length > 0 ? set : VERSES_BY_LOCALE.en;
}
