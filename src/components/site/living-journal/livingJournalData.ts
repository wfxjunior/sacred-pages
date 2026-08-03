import type { LivingJournalEntry, LivingJournalMoment } from "./livingJournal.types";

/**
 * Demonstration content for The Living Journal.
 *
 * These are placeholder entries written to show the experience — they are not
 * real reader submissions, and the section says so on screen. Nothing here
 * reaches a database, and there is no submission path yet.
 *
 * Tone rules these follow, and any future copy should too: short, humble,
 * specific, believable. No marketing claims, no superlatives, no implied
 * endorsement. A person noticing something small about their own morning is
 * more moving than a testimonial, and it is also honest about what it is.
 */
export const LIVING_JOURNAL_ENTRIES: readonly LivingJournalEntry[] = [
  {
    id: "lj-1",
    firstName: "John",
    location: "Austin, USA",
    countryCode: "US",
    language: "en",
    message: "I finally finished the Gospel of Luke.",
    dateLabel: "July 29",
    journeyLabel: "Luke · complete",
    featured: true,
  },
  {
    id: "lj-2",
    firstName: "Ana",
    location: "São Paulo, Brazil",
    countryCode: "BR",
    language: "en",
    message: "My mornings feel different now.",
    dateLabel: "July 29",
    journeyLabel: "Day 12",
  },
  {
    id: "lj-3",
    firstName: "Sofia",
    location: "Mexico City, Mexico",
    countryCode: "MX",
    language: "en",
    message: "I prayed before checking social media today.",
    dateLabel: "July 28",
  },
  {
    id: "lj-4",
    firstName: "Olivia",
    location: "Toronto, Canada",
    countryCode: "CA",
    language: "en",
    message: "My daughter asked if we could read together tomorrow.",
    dateLabel: "July 28",
    journeyLabel: "Family",
  },
  {
    id: "lj-5",
    firstName: "Markus",
    location: "Berlin, Germany",
    countryCode: "DE",
    language: "en",
    message: "I did not expect a simple word search to become part of my prayer life.",
    dateLabel: "July 27",
    // A longer thought, given a little more room to breathe.
    displayDuration: 5200,
  },
  {
    id: "lj-6",
    firstName: "Ethan",
    location: "Sydney, Australia",
    countryCode: "AU",
    language: "en",
    message: "I opened Lumena for five minutes and stayed for thirty.",
    dateLabel: "July 27",
  },
  {
    id: "lj-7",
    firstName: "Grace",
    location: "Nairobi, Kenya",
    countryCode: "KE",
    language: "en",
    message: "This has become the quietest and most meaningful part of my day.",
    dateLabel: "July 26",
    journeyLabel: "Day 34",
  },
  {
    id: "lj-8",
    firstName: "Daniel",
    location: "Manila, Philippines",
    countryCode: "PH",
    language: "en",
    message: "I am learning that consistency matters more than perfection.",
    dateLabel: "July 26",
  },
  {
    id: "lj-9",
    firstName: "Marie",
    location: "Lyon, France",
    countryCode: "FR",
    language: "en",
    message: "My children now remind me when it is Lumena time.",
    dateLabel: "July 25",
  },
  {
    id: "lj-10",
    firstName: "Tobias",
    location: "Oslo, Norway",
    countryCode: "NO",
    language: "en",
    message: "For the first time, I feel excited to open the Bible every morning.",
    dateLabel: "July 25",
    journeyLabel: "Day 7",
  },
];

/**
 * Anonymous global moments.
 *
 * Phrased as journal lines, never as notifications: "Someone in Brazil
 * completed Luke", not "New activity!". No counts, no timestamps, no urgency.
 */
export const LIVING_JOURNAL_MOMENTS: readonly LivingJournalMoment[] = [
  { id: "m-1", text: "Someone in Brazil completed Luke.", countryCode: "BR", journeyLabel: "Luke" },
  { id: "m-2", text: "Someone in Canada began Psalms.", countryCode: "CA", journeyLabel: "Psalms" },
  { id: "m-3", text: "Someone in Australia finished a 21-day journey.", countryCode: "AU", journeyLabel: "21-Day Journey" },
  { id: "m-4", text: "Someone in Mexico saved a reflection.", countryCode: "MX", journeyLabel: "Reflections" },
  { id: "m-5", text: "Someone in Germany returned for their seventh day.", countryCode: "DE", journeyLabel: "Day 7" },
  { id: "m-6", text: "Someone in Kenya read before sunrise.", countryCode: "KE", journeyLabel: "Sunrise" },
  { id: "m-7", text: "Someone in Portugal finished Proverbs.", countryCode: "PT", journeyLabel: "Proverbs" },
  { id: "m-8", text: "Someone in Japan started their first journey.", countryCode: "JP", journeyLabel: "First Journey" },
];



/** Default typing pace, in milliseconds per character. */
export const DEFAULT_TYPING_SPEED_MS = 55;

/** Default rest after an entry is complete, before the next one begins. */
export const DEFAULT_DISPLAY_DURATION_MS = 4200;
