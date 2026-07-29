-- 0008_foreign_key_indexes.sql
-- Corrective migration. Purely additive: creates indexes only. No data is
-- read, moved or deleted, and nothing is dropped.
--
-- FINDING (from inspecting the schema after applying 0001-0007 to PostgreSQL 17):
-- 62 foreign keys had no supporting index. PostgreSQL indexes the REFERENCED
-- side of a foreign key automatically but never the REFERENCING side, so every
-- delete on a parent row must sequentially scan each child table to enforce the
-- constraint.
--
-- This migration indexes 23 of those 62, chosen deliberately rather than
-- exhaustively — every index is paid for on each insert and update, so blanket
-- indexing would tax the hot write paths (puzzle attempts, step progress) to
-- speed up operations that never happen.
--
-- Indexed here:
--   * every ON DELETE CASCADE / SET NULL path, where the parent delete is a
--     real operation: deleting a user (account deletion), a journey, a
--     collection, a puzzle instance, a media asset or a milestone definition.
--   * the two user-owned tables that cascade from auth.users and grow without
--     bound — account deletion must not degrade as a reader uses the product.
--
-- Deliberately NOT indexed: created_by / updated_by / translator_id /
-- reviewer_id → auth.users on the content tables. Those are ON DELETE SET NULL
-- and only scan when a STAFF account is deleted, which is rare and
-- administrative. Paying an index write on every content edit to speed that up
-- is the wrong trade. Revisit if staff-account deletion ever becomes routine.
--
-- On a populated database, prefer CREATE INDEX CONCURRENTLY (outside a
-- transaction) to avoid holding a write lock. Plain CREATE INDEX is used here
-- because these tables are empty at first apply and `supabase db push` wraps
-- each migration in a transaction, which CONCURRENTLY forbids.

-- --- User-owned tables that cascade from auth.users -------------------------
-- Account deletion walks these; both grow with every session a reader plays.
create index if not exists journey_step_progress_user_idx
  on public.journey_step_progress (user_id);
create index if not exists puzzle_attempts_user_idx
  on public.puzzle_attempts (user_id);

-- --- Deleting a journey ----------------------------------------------------
create index if not exists favorites_journey_fk_idx
  on public.favorites (journey_id);
create index if not exists journey_progress_journey_fk_idx
  on public.journey_progress (journey_id);
create index if not exists puzzle_sessions_journey_fk_idx
  on public.puzzle_sessions (journey_id);
create index if not exists user_reflections_journey_fk_idx
  on public.user_reflections (journey_id);
create index if not exists user_prayers_journey_fk_idx
  on public.user_prayers (journey_id);

-- --- Deleting a collection --------------------------------------------------
create index if not exists favorites_collection_fk_idx
  on public.favorites (collection_id);
create index if not exists journey_progress_collection_fk_idx
  on public.journey_progress (collection_id);
create index if not exists journey_sessions_collection_fk_idx
  on public.journey_sessions (collection_id);
create index if not exists user_collection_progress_collection_fk_idx
  on public.user_collection_progress (collection_id);

-- --- Deleting a journey session (reflections/prayers keep their text) -------
create index if not exists user_reflections_session_fk_idx
  on public.user_reflections (session_id);
create index if not exists user_prayers_session_fk_idx
  on public.user_prayers (session_id);

-- --- Deleting a puzzle instance or template ---------------------------------
create index if not exists journey_sessions_puzzle_instance_fk_idx
  on public.journey_sessions (puzzle_instance_id);
create index if not exists puzzle_progress_instance_fk_idx
  on public.puzzle_progress (puzzle_instance_id);
create index if not exists puzzle_generation_requests_result_fk_idx
  on public.puzzle_generation_requests (result_instance_id);
create index if not exists puzzle_generation_requests_template_fk_idx
  on public.puzzle_generation_requests (template_id);

-- --- Deleting a media asset -------------------------------------------------
create index if not exists collections_cover_media_fk_idx
  on public.collections (cover_media_id);
create index if not exists collections_thumbnail_media_fk_idx
  on public.collections (thumbnail_media_id);
create index if not exists journeys_hero_media_fk_idx
  on public.journeys (hero_media_id);
create index if not exists journeys_social_media_fk_idx
  on public.journeys (social_media_id);

-- --- Deleting a milestone definition or scripture reference -----------------
create index if not exists user_milestones_milestone_fk_idx
  on public.user_milestones (milestone_id);
create index if not exists journey_words_scripture_reference_fk_idx
  on public.journey_words (scripture_reference_id);
