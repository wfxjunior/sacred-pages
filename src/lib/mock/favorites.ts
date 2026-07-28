// TODO: Persist favorites to backend (currently mock data only).

export type FavoriteKind = "journey" | "verse" | "devotional" | "collection" | "reflection" | "prayer";

export type Favorite = {
  id: string;
  kind: FavoriteKind;
  title: string;
  reference?: string;
  excerpt: string;
  savedOn: string;
};

export const FAVORITES: Favorite[] = [
  { id: "f1", kind: "journey", title: "Gratitude That Transforms", reference: "Philippians 4:6–7", excerpt: "Do not be anxious about anything, but in every situation…", savedOn: "Jul 21, 2026" },
  { id: "f2", kind: "verse", title: "The Lord is my shepherd", reference: "Psalm 23:1", excerpt: "The Lord is my shepherd; I lack nothing.", savedOn: "Jul 18, 2026" },
  { id: "f3", kind: "devotional", title: "A quiet place to begin", reference: "Matthew 6:6", excerpt: "When you pray, go into your room and close the door.", savedOn: "Jul 15, 2026" },
  { id: "f4", kind: "collection", title: "Psalms of Peace", excerpt: "8 short journeys for quiet mornings.", savedOn: "Jul 10, 2026" },
  { id: "f5", kind: "reflection", title: "What am I carrying today?", excerpt: "Held privately · 142 words.", savedOn: "Jul 9, 2026" },
  { id: "f6", kind: "prayer", title: "For a peaceful heart", excerpt: "Father, thank you for the peace that guards my heart today.", savedOn: "Jul 5, 2026" },
  { id: "f7", kind: "verse", title: "Trust in the Lord", reference: "Proverbs 3:5–6", excerpt: "Trust in the Lord with all your heart and lean not on your own understanding.", savedOn: "Jun 28, 2026" },
  { id: "f8", kind: "journey", title: "Fruit of the Spirit", reference: "Galatians 5:22–23", excerpt: "But the fruit of the Spirit is love, joy, peace…", savedOn: "Jun 24, 2026" },
];

export const FAVORITE_KINDS: { key: FavoriteKind | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "journey", label: "Journeys" },
  { key: "verse", label: "Verses" },
  { key: "devotional", label: "Devotionals" },
  { key: "collection", label: "Collections" },
  { key: "reflection", label: "Reflections" },
  { key: "prayer", label: "Prayers" },
];