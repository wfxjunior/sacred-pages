import type { DifficultyLevel } from "@/lib/content/types";
import type { MilestoneCategory, MilestoneCriteria } from "./milestones";
import type { JourneySessionStatus, JourneyStepType } from "./state";

// Row shapes for the progress-domain tables (migration 0006).
// TODO(phase-5): replace with `supabase gen types typescript` once a project is linked.

export const ACTIVITY_EVENT_TYPES = [
  "journey_started",
  "journey_resumed",
  "journey_step_completed",
  "puzzle_started",
  "puzzle_completed",
  "reflection_saved",
  "prayer_saved",
  "journey_completed",
  "collection_completed",
  "favorite_added",
  "favorite_removed",
  "active_day_recorded",
  "milestone_earned",
] as const;
export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export type JourneySessionRow = {
  id: string;
  user_id: string;
  journey_id: string;
  collection_id: string | null;
  puzzle_instance_id: string | null;
  status: JourneySessionStatus;
  language_code: string;
  difficulty: DifficultyLevel;
  current_step: JourneyStepType;
  completion_percent: number;
  elapsed_ms: number;
  is_replay: boolean;
  assigned_date: string | null;
  started_at: string;
  last_active_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
  created_at: string;
  updated_at: string;
};

export type JourneyStepProgressRow = {
  id: string;
  session_id: string;
  user_id: string;
  step_type: JourneyStepType;
  step_order: number;
  is_required: boolean;
  started_at: string | null;
  completed_at: string | null;
  time_spent_ms: number;
  metadata: Record<string, unknown>;
  content_version: number | null;
  created_at: string;
  updated_at: string;
};

export type JourneyProgressRow = {
  user_id: string;
  journey_id: string;
  collection_id: string | null;
  first_completed_at: string | null;
  last_completed_at: string | null;
  completion_count: number;
  best_duration_ms: number | null;
  total_words_found: number;
  created_at: string;
  updated_at: string;
};

/**
 * A private reflection. `body` is the single most sensitive column in the
 * product — it must never be logged, shared, or sent to any analytics sink.
 */
export type UserReflectionRow = {
  id: string;
  user_id: string;
  journey_id: string;
  session_id: string | null;
  language_code: string;
  prompt_version: number | null;
  body: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

/** A private prayer. Same handling rules as `UserReflectionRow`. */
export type UserPrayerRow = {
  id: string;
  user_id: string;
  journey_id: string;
  session_id: string | null;
  language_code: string;
  acknowledged: boolean;
  body: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FavoriteRow = {
  id: string;
  user_id: string;
  entity_type: "collection" | "journey";
  journey_id: string | null;
  collection_id: string | null;
  created_at: string;
};

export type ConsistencyDayRow = {
  user_id: string;
  activity_date: string;
  timezone: string;
  journeys_completed: number;
  puzzles_completed: number;
  first_activity_at: string;
  last_activity_at: string;
  created_at: string;
};

export type MilestoneDefinitionRow = {
  id: string;
  key: string;
  category: MilestoneCategory;
  criteria: MilestoneCriteria;
  threshold: number;
  qualifier: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  is_hidden: boolean;
  is_repeatable: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};

export type MilestoneTranslationRow = {
  id: string;
  milestone_id: string;
  language_code: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type UserMilestoneRow = {
  user_id: string;
  milestone_id: string;
  earned_at: string;
  milestone_version: number;
  source_event_type: ActivityEventType | null;
  source_entity_id: string | null;
  context: Record<string, unknown>;
  seen_at: string | null;
  created_at: string;
};

export type ActivityEventRow = {
  id: string;
  user_id: string;
  type: ActivityEventType;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  idempotency_key: string;
  version: number;
  occurred_at: string;
  created_at: string;
};

export type UserCollectionProgressRow = {
  user_id: string;
  collection_id: string;
  journeys_completed: number;
  journeys_available: number;
  completion_percent: number;
  completed_at: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Shape returned by the `consistency_summary(uid)` SQL function. */
export type ConsistencySummaryRow = {
  active_days: number;
  current_run: number;
  longest_run: number;
  last_active: string | null;
};
