// TODO: Implement gamification rules and unlock logic on backend.
// Refined, calm milestone system — no coins, no leaderboards.

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Award,
  Sparkles,
  Feather,
  Sun,
  Users,
  Heart,
  BookOpen,
  Compass,
} from "lucide-react";

export type Milestone = {
  id: string;
  title: string;
  description: string;
  category: "Consistency" | "Journey Progress" | "Shared Journey" | "Personal Growth";
  icon: LucideIcon;
  accent: string;
  achieved: boolean;
  date?: string;
};

export const MILESTONE_LIST: Milestone[] = [
  { id: "streak-7", title: "Seven days in the Word", description: "A week of quiet, meaningful minutes.", category: "Consistency", icon: Flame, accent: "#B88A3B", achieved: true, date: "Jul 21, 2026" },
  { id: "streak-30", title: "Thirty days of rhythm", description: "A month becomes a habit.", category: "Consistency", icon: Sun, accent: "#B88A3B", achieved: false },
  { id: "streak-100", title: "One hundred days", description: "A season of walking with Scripture.", category: "Consistency", icon: Award, accent: "#B88A3B", achieved: false },
  { id: "first-collection", title: "First collection completed", description: "Psalms of Peace — 8 journeys.", category: "Journey Progress", icon: BookOpen, accent: "#78866B", achieved: true, date: "Jul 10, 2026" },
  { id: "first-reflection", title: "First reflection written", description: "You put words to what you heard.", category: "Personal Growth", icon: Feather, accent: "#5E7FA3", achieved: true, date: "Jul 1, 2026" },
  { id: "first-prayer", title: "First prayer saved", description: "A prayer you wanted to return to.", category: "Personal Growth", icon: Heart, accent: "#5E7FA3", achieved: true, date: "Jul 3, 2026" },
  { id: "first-shared", title: "First shared journey", description: "You walked a passage with someone.", category: "Shared Journey", icon: Users, accent: "#78866B", achieved: true, date: "Jul 14, 2026" },
  { id: "first-invited", title: "First companion invited", description: "A quiet invitation to walk together.", category: "Shared Journey", icon: Sparkles, accent: "#B88A3B", achieved: true, date: "Jul 12, 2026" },
  { id: "year-consistency", title: "Yearly consistency", description: "365 days in the Word.", category: "Consistency", icon: Compass, accent: "#B88A3B", achieved: false },
  { id: "advent-2026", title: "Advent 2026 — seasonal journey", description: "A special series for the season.", category: "Journey Progress", icon: Sparkles, accent: "#5E7FA3", achieved: false },
];