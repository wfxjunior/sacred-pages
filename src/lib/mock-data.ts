export type Collection = {
  slug: string;
  title: string;
  description: string;
  count: number;
  hue: string; // css color
  progress?: number;
};

export const COLLECTIONS: Collection[] = [
  { slug: "life-of-jesus", title: "The Life of Jesus", description: "Walk through the ministry and miracles of Christ.", count: 24, hue: "oklch(0.55 0.06 250)", progress: 0.35 },
  { slug: "psalms", title: "Psalms", description: "Ancient songs of trust, lament, and praise.", count: 30, hue: "oklch(0.6 0.05 130)", progress: 0.6 },
  { slug: "proverbs", title: "Proverbs", description: "Everyday wisdom for a thoughtful life.", count: 18, hue: "oklch(0.635 0.115 70)", progress: 0.1 },
  { slug: "faith", title: "Faith", description: "Journeys about trust, courage, and belief.", count: 12, hue: "oklch(0.45 0.05 45)" },
  { slug: "family", title: "Family", description: "Scripture for marriage, parenting, and home.", count: 14, hue: "oklch(0.58 0.06 250)" },
  { slug: "women", title: "Women of the Bible", description: "Stories of courage, wisdom, and faith.", count: 16, hue: "oklch(0.55 0.07 20)" },
  { slug: "men", title: "Men of the Bible", description: "Lives that still shape ours today.", count: 16, hue: "oklch(0.48 0.05 60)" },
  { slug: "prayer", title: "Prayer", description: "Learning to speak and listen to God.", count: 10, hue: "oklch(0.6 0.06 210)" },
  { slug: "purpose", title: "Purpose", description: "Discovering the good works prepared for you.", count: 8, hue: "oklch(0.62 0.09 90)" },
];

export const TODAY = {
  title: "Gratitude That Transforms",
  reference: "Philippians 4:6–7",
  scripture:
    "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
  devotional:
    "Gratitude is not a denial of what is hard. It is a quiet decision to see God's presence in the middle of it. When Paul wrote these words, he was in prison. And yet he spoke of peace. Today, let thanksgiving be your first language, even before your requests.",
  reflection:
    "Where in your life today can you replace anxiety with a simple, honest 'thank you'? Name one specific thing you are grateful for right now.",
  prayer:
    "Father, quiet my heart. Teach me to bring my worries to You with open hands and a grateful voice. Guard my mind with Your peace today. Amen.",
  words: ["GRACE", "FAITH", "PEACE", "PRAYER", "HOPE", "GRATITUDE"],
};

export const MILESTONES = [
  { label: "7-day streak", date: "Yesterday" },
  { label: "Completed: Psalms of Trust", date: "3 days ago" },
  { label: "20 journeys explored", date: "Last week" },
];

export const SELECTION_COLORS = [
  { key: "gold", label: "Gold", value: "oklch(0.635 0.115 70)" },
  { key: "blue", label: "Blue", value: "oklch(0.58 0.09 250)" },
  { key: "sage", label: "Sage", value: "oklch(0.6 0.08 130)" },
  { key: "purple", label: "Purple", value: "oklch(0.55 0.1 300)" },
  { key: "amber", label: "Amber", value: "oklch(0.72 0.13 65)" },
  { key: "teal", label: "Teal", value: "oklch(0.6 0.08 200)" },
];