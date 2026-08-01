CREATE TABLE public.word_search_best_times (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_key text NOT NULL,
  best_time_ms integer NOT NULL CHECK (best_time_ms > 0),
  last_time_ms integer,
  completions integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, puzzle_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.word_search_best_times TO authenticated;
GRANT ALL ON public.word_search_best_times TO service_role;

ALTER TABLE public.word_search_best_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own best times select" ON public.word_search_best_times
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own best times insert" ON public.word_search_best_times
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own best times update" ON public.word_search_best_times
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own best times delete" ON public.word_search_best_times
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER word_search_best_times_updated_at
  BEFORE UPDATE ON public.word_search_best_times
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();