import type { DifficultyLevel } from "@/lib/content/types";
import type { PuzzleEventType } from "./events";

// Row shapes for the puzzle-domain tables (migration 0005).
// TODO(phase-5): replace with `supabase gen types typescript` once a project is linked.

export type PuzzleTemplateRow = {
  id: string;
  journey_id: string;
  language_code: string;
  difficulty: DifficultyLevel;
  version: number;
  status: "draft" | "active" | "archived";
  min_grid_size: number;
  max_grid_size: number;
  target_word_count: number;
  allowed_directions: string[];
  allow_reversed: boolean;
  allow_diagonal: boolean;
  overlap_strategy: "none" | "allowed" | "encouraged";
  seed_strategy: "per_journey" | "per_user" | "per_day";
  max_attempts: number;
  filler_strategy: "uniform" | "weighted" | "word_letters";
  custom_alphabet: string | null;
  hint_policy: "none" | "limited" | "unlimited";
  max_hints: number;
  full_solution_enabled: boolean;
  expected_duration_seconds: number | null;
  min_engine_version: string;
  created_by: string | null;
  updated_by: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PuzzleInstanceRow = {
  id: string;
  template_id: string;
  template_version: number;
  seed: number;
  language_code: string;
  difficulty: DifficultyLevel;
  grid_size: number;
  grid_rows: string[];
  normalized_grid_rows: string[];
  placements: unknown;
  unplaced_words: unknown;
  engine_version: string;
  generation_metadata: Record<string, unknown>;
  content_hash: string;
  created_at: string;
};

export type PuzzleGenerationRequestRow = {
  id: string;
  requested_by: string | null;
  journey_id: string;
  template_id: string | null;
  language_code: string;
  difficulty: DifficultyLevel;
  seed: number | null;
  engine_version: string;
  status: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  result_instance_id: string | null;
  duration_ms: number | null;
  error_code: string | null;
  error_detail: string | null;
  attempt_count: number;
  idempotency_key: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type PuzzleSessionRow = {
  id: string;
  user_id: string;
  puzzle_instance_id: string;
  journey_id: string;
  status: "in_progress" | "paused" | "completed" | "abandoned";
  started_at: string;
  paused_at: string | null;
  completed_at: string | null;
  last_activity_at: string;
  elapsed_ms: number;
  completion_percent: number;
  hints_used: number;
  revealed_solution: boolean;
  created_at: string;
  updated_at: string;
};

export type PuzzleProgressRow = {
  user_id: string;
  puzzle_instance_id: string;
  found_words: string[];
  completion_percent: number;
  attempts_count: number;
  best_time_ms: number | null;
  first_completed_at: string | null;
  last_played_at: string;
  created_at: string;
  updated_at: string;
};

export type PuzzleEventRow = {
  id: string;
  session_id: string;
  user_id: string;
  type: PuzzleEventType;
  payload: Record<string, unknown>;
  idempotency_key: string;
  occurred_at: string;
  created_at: string;
};

export type PuzzleAttemptRow = {
  id: string;
  session_id: string;
  user_id: string;
  start_row: number;
  start_col: number;
  end_row: number;
  end_col: number;
  selected_text: string | null;
  matched_word: string | null;
  is_correct: boolean;
  created_at: string;
};

export type PuzzleStatisticsRow = {
  puzzle_instance_id: string;
  total_sessions: number;
  completed_sessions: number;
  abandoned_sessions: number;
  total_hints_used: number;
  solution_reveals: number;
  avg_completion_ms: number | null;
  fastest_completion_ms: number | null;
  updated_at: string;
};
