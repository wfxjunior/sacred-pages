WITH eligible AS (
  SELECT id, row_number() OVER (ORDER BY position, slug) - 1 AS idx,
         count(*) OVER () AS total
  FROM public.journeys
  WHERE status = 'published' AND daily_eligible AND archived_at IS NULL
),
days AS (
  SELECT d::date AS journey_date, (d::date - CURRENT_DATE) AS offset_days
  FROM generate_series(CURRENT_DATE - 7, CURRENT_DATE + 120, interval '1 day') AS d
),
langs AS (SELECT code FROM public.languages WHERE is_active)
INSERT INTO public.daily_journeys (journey_date, language_code, journey_id, is_fallback, notes)
SELECT dd.journey_date, l.code, e.id, false, 'Auto-scheduled rotation'
FROM days dd
CROSS JOIN langs l
JOIN eligible e
  ON e.idx = ((dd.offset_days % e.total) + e.total) % e.total
ON CONFLICT (journey_date, language_code) DO NOTHING;