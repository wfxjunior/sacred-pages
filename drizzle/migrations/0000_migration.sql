CREATE TABLE public.journey_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  journey_title text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT 'steady',
  progress int NOT NULL DEFAULT 0,
  notes text NOT NULL,
  reflection text,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_log_entries TO authenticated;
GRANT ALL ON public.journey_log_entries TO service_role;
ALTER TABLE public.journey_log_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.journey_log_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.journey_log_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.journey_log_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.journey_log_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX journey_log_entries_user_idx ON public.journey_log_entries (user_id, created_at DESC);