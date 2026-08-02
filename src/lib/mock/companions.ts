// TODO: Implement real Journey Together invitations, permissions and companion state.
// Mock data only — displayed in Journey Together frontend prototype.

export type CompanionStatus = "active" | "pending" | "archived" | "declined";

export type Companion = {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  since?: string;
  status: CompanionStatus;
  invitedOn?: string;
  journey?: string;
  reference?: string;
  yourProgress: number;
  theirProgress: number;
  lastActivity?: string;
  completedToday?: {
    devotional: boolean;
    puzzle: boolean;
    reflection: boolean;
    prayer: boolean;
  };
  color: string;
};


export const RELATIONSHIPS = [
  "Spouse",
  "Friend",
  "Family Member",
  "Parent",
  "Child",
  "Mentor",
  "Small Group",
  "Other",
] as const;

export const COMPANIONS: Companion[] = [
  {
    id: "c1",
    name: "Sarah Reid",
    relationship: "Spouse",
    email: "sarah@example.com",
    since: "Mar 2026",
    status: "active",
    journey: "Gratitude That Transforms",
    reference: "Philippians 4:6–7",
    yourProgress: 100,
    theirProgress: 60,
    lastActivity: "Reading now",
    completedToday: { devotional: true, puzzle: true, reflection: true, prayer: true },
    color: "#B88A3B",
  },
  {
    id: "c2",
    name: "Lucas Fernandes",
    relationship: "Friend",
    email: "lucas@example.com",
    since: "Jan 2026",
    status: "active",
    journey: "Psalms of Peace",
    reference: "Psalm 23",
    yourProgress: 40,
    theirProgress: 100,
    lastActivity: "Completed today at 8:12 AM",
    completedToday: { devotional: true, puzzle: true, reflection: false, prayer: true },
    color: "#78866B",
  },
  {
    id: "c3",
    name: "Miguel Alves",
    relationship: "Mentor",
    email: "miguel@example.com",
    since: "Dec 2025",
    status: "active",
    journey: "Proverbs Daily",
    reference: "Proverbs 3:5–6",
    yourProgress: 75,
    theirProgress: 80,
    lastActivity: "Left a reflection yesterday",
    completedToday: { devotional: true, puzzle: false, reflection: false, prayer: false },
    color: "#5E7FA3",
  },
  {
    id: "c4",
    name: "Isabela P.",
    relationship: "Friend",
    email: "isabela@example.com",
    status: "pending",
    invitedOn: "3 days ago",
    yourProgress: 0,
    theirProgress: 0,
    color: "#B76E79",
  },
  {
    id: "c5",
    name: "David L.",
    relationship: "Small Group",
    email: "david@example.com",
    status: "pending",
    invitedOn: "yesterday",
    yourProgress: 0,
    theirProgress: 0,
    color: "#6E5847",
  },
  {
    id: "c6",
    name: "Rachel M.",
    relationship: "Family Member",
    status: "archived",
    journey: "The Life of Jesus (2025)",
    yourProgress: 100,
    theirProgress: 100,
    lastActivity: "Completed together in Nov 2025",
    color: "#6E5847",
  },
];

export const ENCOURAGE_OPTIONS = [
  "Thinking of you",
  "Keep going",
  "Praying for you",
  "Beautiful progress",
  "Amen",
] as const;

export const REFLECTION_VISIBILITY = [
  { key: "private", label: "Keep reflection private", hint: "Default — only you can see it." },
  { key: "sentence", label: "Share one sentence", hint: "Share a short excerpt with your companion." },
  { key: "status", label: "Share only completion status", hint: "They'll see you reflected — not the text." },
] as const;