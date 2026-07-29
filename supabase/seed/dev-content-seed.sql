-- dev-content-seed.sql
--
-- DEVELOPMENT SEED DATA — DO NOT RUN IN PRODUCTION.
--
-- Apply manually against a local or staging project only:
--   psql "$DEV_DATABASE_URL" -f supabase/seed/dev-content-seed.sql
--
-- It is deliberately NOT in supabase/migrations/, so `supabase db push` will
-- never insert it into a production database.
--
-- Scripture: World English Bible (WEB) only — public domain, safe to store and
-- redistribute. See docs/legal-and-content/01-bible-content-licensing-notes.md.
-- No NIV/ESV/NVI text appears anywhere in this file.

begin;

-- Guard: refuse to run if real published content already exists, so this can
-- never quietly overwrite a live library.
do $$
begin
  if exists (select 1 from public.collections where status = 'published') then
    raise exception 'Refusing to seed: published collections already exist. This script is development-only.';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
insert into public.content_tags (id, slug, kind) values
  ('a0000000-0000-4000-8000-000000000001', 'gratitude', 'topic'),
  ('a0000000-0000-4000-8000-000000000002', 'peace', 'topic'),
  ('a0000000-0000-4000-8000-000000000003', 'wisdom', 'topic')
on conflict (slug) do nothing;

insert into public.content_tag_translations (tag_id, language_code, name) values
  ('a0000000-0000-4000-8000-000000000001', 'en', 'Gratitude'),
  ('a0000000-0000-4000-8000-000000000001', 'pt', 'Gratidão'),
  ('a0000000-0000-4000-8000-000000000001', 'es', 'Gratitud'),
  ('a0000000-0000-4000-8000-000000000002', 'en', 'Peace'),
  ('a0000000-0000-4000-8000-000000000003', 'en', 'Wisdom')
on conflict (tag_id, language_code) do nothing;

-- ---------------------------------------------------------------------------
-- Collections: one published, one draft, one premium
-- ---------------------------------------------------------------------------
insert into public.collections
  (id, internal_name, slug, primary_language_code, status, access_level, topic, audience,
   difficulty_min, difficulty_max, estimated_total_minutes, display_order, is_featured, published_at)
values
  ('c0000000-0000-4000-8000-000000000001', 'Psalms of Trust', 'psalms-of-trust', 'en',
   'published', 'free', 'Psalms', 'Everyone', 'gentle', 'balanced', 210, 0, true, now() - interval '7 days'),
  ('c0000000-0000-4000-8000-000000000002', 'Proverbs for Daily Life', 'proverbs-daily-life', 'en',
   'draft', 'free', 'Proverbs', 'Everyone', 'balanced', 'challenging', 180, 1, false, null),
  ('c0000000-0000-4000-8000-000000000003', 'Deep Waters (Premium)', 'deep-waters', 'en',
   'published', 'premium', 'Faith', 'Long-time readers', 'challenging', 'expert', 300, 2, false, now() - interval '2 days')
on conflict (id) do nothing;

insert into public.collection_translations
  (collection_id, language_code, status, title, short_description, full_description)
values
  -- Fully translated
  ('c0000000-0000-4000-8000-000000000001', 'en', 'published', 'Psalms of Trust',
   'Ancient songs of confidence in God, for ordinary days.',
   'Seven quiet journeys through psalms that speak of trust when life is uncertain.'),
  ('c0000000-0000-4000-8000-000000000001', 'pt', 'published', 'Salmos de Confiança',
   'Cânticos antigos de confiança em Deus, para os dias comuns.',
   'Sete jornadas tranquilas por salmos que falam de confiança quando a vida é incerta.'),
  ('c0000000-0000-4000-8000-000000000001', 'es', 'published', 'Salmos de Confianza',
   'Cánticos antiguos de confianza en Dios, para los días corrientes.',
   'Siete jornadas serenas por salmos que hablan de confianza cuando la vida es incierta.'),
  -- Draft, English only
  ('c0000000-0000-4000-8000-000000000002', 'en', 'draft', 'Proverbs for Daily Life',
   'Everyday wisdom for work, family and speech.', null),
  -- Published in English, Portuguese still in review (exercises the fallback path)
  ('c0000000-0000-4000-8000-000000000003', 'en', 'published', 'Deep Waters',
   'Longer journeys for readers who want to go further.', null),
  ('c0000000-0000-4000-8000-000000000003', 'pt', 'in_review', 'Águas Profundas',
   'Jornadas mais longas para quem quer ir além.', null)
on conflict (collection_id, language_code) do nothing;

insert into public.collection_tags (collection_id, tag_id) values
  ('c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'),
  ('c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Journeys covering several workflow states
-- ---------------------------------------------------------------------------
insert into public.journeys
  (id, internal_title, slug, primary_collection_id, position, primary_language_code, status,
   access_level, difficulty, theme, estimated_minutes, daily_eligible, published_at, scheduled_publish_at)
values
  -- Published, fully translated
  ('40000000-0000-4000-8000-000000000001', 'Psalm 23 — The Shepherd', 'psalm-23-the-shepherd',
   'c0000000-0000-4000-8000-000000000001', 0, 'en', 'published', 'free', 'gentle',
   'Trust', 7, true, now() - interval '5 days', null),
  -- Published, English + Spanish only (Portuguese missing on purpose)
  ('40000000-0000-4000-8000-000000000002', 'Psalm 121 — Lifting My Eyes', 'psalm-121-lifting-my-eyes',
   'c0000000-0000-4000-8000-000000000001', 1, 'en', 'published', 'free', 'gentle',
   'Confidence', 7, true, now() - interval '3 days', null),
  -- Awaiting review
  ('40000000-0000-4000-8000-000000000003', 'Psalm 46 — A Very Present Help', 'psalm-46-present-help',
   'c0000000-0000-4000-8000-000000000001', 2, 'en', 'in_review', 'free', 'balanced',
   'Peace', 8, true, null, null),
  -- Draft
  ('40000000-0000-4000-8000-000000000004', 'Proverbs 3 — Trust and Lean Not', 'proverbs-3-trust-lean-not',
   'c0000000-0000-4000-8000-000000000002', 0, 'en', 'draft', 'free', 'balanced',
   'Wisdom', 7, true, null, null),
  -- Scheduled for the future — must NOT be publicly visible yet
  ('40000000-0000-4000-8000-000000000005', 'Psalm 1 — The Planted Tree', 'psalm-1-planted-tree',
   'c0000000-0000-4000-8000-000000000001', 3, 'en', 'scheduled', 'free', 'gentle',
   'Rootedness', 7, true, null, now() + interval '3 days'),
  -- Premium
  ('40000000-0000-4000-8000-000000000006', 'Psalm 139 — Searched and Known', 'psalm-139-searched-known',
   'c0000000-0000-4000-8000-000000000003', 0, 'en', 'published', 'premium', 'challenging',
   'Being known', 12, false, now() - interval '1 day', null)
on conflict (id) do nothing;

insert into public.journey_translations
  (journey_id, language_code, status, public_title, devotional_body, reflection_prompt, prayer_body, completion_message)
values
  ('40000000-0000-4000-8000-000000000001', 'en', 'published', 'The Shepherd',
   'A shepherd in the ancient world walked ahead of the flock, not behind it. The psalm does not promise a life without valleys — it promises company through them.',
   'Where do you most need to be led rather than driven today?',
   'Shepherd of my life, lead me today. Teach me to follow without hurry. Amen.',
   'You spent a quiet moment with Psalm 23.'),
  ('40000000-0000-4000-8000-000000000001', 'pt', 'published', 'O Pastor',
   'No mundo antigo, o pastor caminhava à frente do rebanho, não atrás. O salmo não promete uma vida sem vales — promete companhia através deles.',
   'Onde você mais precisa ser conduzido, e não empurrado, hoje?',
   'Pastor da minha vida, conduza-me hoje. Ensina-me a seguir sem pressa. Amém.',
   'Você viveu um momento tranquilo com o Salmo 23.'),
  ('40000000-0000-4000-8000-000000000001', 'es', 'published', 'El Pastor',
   'En el mundo antiguo, el pastor caminaba delante del rebaño, no detrás. El salmo no promete una vida sin valles: promete compañía a través de ellos.',
   '¿Dónde necesitas más ser guiado, y no empujado, hoy?',
   'Pastor de mi vida, guíame hoy. Enséñame a seguir sin prisa. Amén.',
   'Viviste un momento sereno con el Salmo 23.'),

  ('40000000-0000-4000-8000-000000000002', 'en', 'published', 'Lifting My Eyes',
   'The question opens the psalm honestly: where does help come from? The answer is not a technique but a person.',
   'What are you lifting your eyes toward this week?',
   'Keeper of my going out and coming in, watch over me. Amen.',
   'You finished Psalm 121.'),
  ('40000000-0000-4000-8000-000000000002', 'es', 'published', 'Levanto Mis Ojos',
   'La pregunta abre el salmo con honestidad: ¿de dónde viene el auxilio? La respuesta no es una técnica sino una persona.',
   '¿Hacia dónde levantas los ojos esta semana?',
   'Guardián de mi salida y mi entrada, cuídame. Amén.',
   'Terminaste el Salmo 121.'),
  -- Portuguese deliberately absent: exercises the English fallback path.

  ('40000000-0000-4000-8000-000000000003', 'en', 'draft', 'A Very Present Help',
   'Stillness is not the absence of noise but the presence of trust.',
   'What would it look like to be still for five minutes today?',
   'God of Jacob, be my refuge. Amen.', null),

  ('40000000-0000-4000-8000-000000000004', 'en', 'draft', 'Trust and Lean Not',
   'Leaning is a posture of the whole body. So is trust.',
   'What are you leaning on that cannot hold your weight?',
   'Teach me to trust with all my heart. Amen.', null),

  ('40000000-0000-4000-8000-000000000005', 'en', 'approved', 'The Planted Tree',
   'A tree planted by streams does not hurry, and it does not move.',
   'What would being planted look like in this season?',
   'Root me near your streams. Amen.', null),

  ('40000000-0000-4000-8000-000000000006', 'en', 'published', 'Searched and Known',
   'To be fully known and still fully welcomed is the deepest human longing.',
   'What part of your life would you rather keep unsearched?',
   'Search me and know me. Lead me in the way everlasting. Amen.',
   'You finished a longer journey.')
on conflict (journey_id, language_code) do nothing;

-- ---------------------------------------------------------------------------
-- Scripture references (WEB — public domain, storage permitted)
-- ---------------------------------------------------------------------------
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select
  '40000000-0000-4000-8000-000000000001', s.id, 'PSA', 23, 1, 3, 'Psalm 23:1-3',
  'Yahweh is my shepherd: I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.',
  0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;

insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select
  '40000000-0000-4000-8000-000000000002', s.id, 'PSA', 121, 1, 2, 'Psalm 121:1-2',
  'I will lift up my eyes to the hills. Where does my help come from? My help comes from Yahweh, who made heaven and earth.',
  0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Puzzle settings
-- ---------------------------------------------------------------------------
insert into public.journey_puzzle_settings
  (journey_id, default_difficulty, min_grid_size, max_grid_size, target_word_count,
   allowed_directions, allow_reversed, allow_diagonal)
values
  ('40000000-0000-4000-8000-000000000001', 'gentle', 10, 12, 6, array['E','S'], false, false),
  ('40000000-0000-4000-8000-000000000002', 'gentle', 10, 12, 6, array['E','S'], false, false),
  ('40000000-0000-4000-8000-000000000003', 'balanced', 12, 14, 8, array['E','S','SE','NE'], false, true),
  ('40000000-0000-4000-8000-000000000004', 'balanced', 12, 14, 8, array['E','S','SE','NE'], false, true),
  ('40000000-0000-4000-8000-000000000005', 'gentle', 10, 12, 6, array['E','S'], false, false),
  ('40000000-0000-4000-8000-000000000006', 'challenging', 14, 16, 10, array['E','W','N','S','NE','NW','SE','SW'], true, true)
on conflict (journey_id) do nothing;

-- ---------------------------------------------------------------------------
-- Word lists.
-- Portuguese and Spanish entries include accents so the normalization rules are
-- exercised by real data: GRAÇA -> GRACA, ORAÇÃO -> ORACAO, but AÑO stays AÑO.
-- ---------------------------------------------------------------------------
insert into public.journey_words (id, journey_id, position, is_required, min_difficulty) values
  ('40000000-0000-4000-8000-0000000000a1', '40000000-0000-4000-8000-000000000001', 0, true, 'gentle'),
  ('40000000-0000-4000-8000-0000000000a2', '40000000-0000-4000-8000-000000000001', 1, true, 'gentle'),
  ('40000000-0000-4000-8000-0000000000a3', '40000000-0000-4000-8000-000000000001', 2, true, 'gentle'),
  ('40000000-0000-4000-8000-0000000000a4', '40000000-0000-4000-8000-000000000001', 3, true, 'gentle'),
  ('40000000-0000-4000-8000-0000000000a5', '40000000-0000-4000-8000-000000000001', 4, true, 'gentle')
on conflict (id) do nothing;

-- journey_id is populated by the sync trigger; supplying it here keeps the
-- insert explicit and is overwritten with the same value.
insert into public.journey_word_translations
  (journey_word_id, journey_id, language_code, status, display_value, normalized_value)
values
  ('40000000-0000-4000-8000-0000000000a1', '40000000-0000-4000-8000-000000000001', 'en', 'published', 'SHEPHERD', 'SHEPHERD'),
  ('40000000-0000-4000-8000-0000000000a2', '40000000-0000-4000-8000-000000000001', 'en', 'published', 'GREEN', 'GREEN'),
  ('40000000-0000-4000-8000-0000000000a3', '40000000-0000-4000-8000-000000000001', 'en', 'published', 'WATERS', 'WATERS'),
  ('40000000-0000-4000-8000-0000000000a4', '40000000-0000-4000-8000-000000000001', 'en', 'published', 'SOUL', 'SOUL'),
  ('40000000-0000-4000-8000-0000000000a5', '40000000-0000-4000-8000-000000000001', 'en', 'published', 'LEADS', 'LEADS'),

  ('40000000-0000-4000-8000-0000000000a1', '40000000-0000-4000-8000-000000000001', 'pt', 'published', 'PASTOR', 'PASTOR'),
  ('40000000-0000-4000-8000-0000000000a2', '40000000-0000-4000-8000-000000000001', 'pt', 'published', 'VERDES', 'VERDES'),
  ('40000000-0000-4000-8000-0000000000a3', '40000000-0000-4000-8000-000000000001', 'pt', 'published', 'ÁGUAS', 'AGUAS'),
  ('40000000-0000-4000-8000-0000000000a4', '40000000-0000-4000-8000-000000000001', 'pt', 'published', 'ALMA', 'ALMA'),
  ('40000000-0000-4000-8000-0000000000a5', '40000000-0000-4000-8000-000000000001', 'pt', 'published', 'ORAÇÃO', 'ORACAO'),

  ('40000000-0000-4000-8000-0000000000a1', '40000000-0000-4000-8000-000000000001', 'es', 'published', 'PASTOR', 'PASTOR'),
  ('40000000-0000-4000-8000-0000000000a2', '40000000-0000-4000-8000-000000000001', 'es', 'published', 'VERDES', 'VERDES'),
  ('40000000-0000-4000-8000-0000000000a3', '40000000-0000-4000-8000-000000000001', 'es', 'published', 'AGUAS', 'AGUAS'),
  ('40000000-0000-4000-8000-0000000000a4', '40000000-0000-4000-8000-000000000001', 'es', 'published', 'ALMA', 'ALMA'),
  ('40000000-0000-4000-8000-0000000000a5', '40000000-0000-4000-8000-000000000001', 'es', 'published', 'AÑO', 'AÑO')
on conflict (journey_word_id, language_code) do nothing;

-- ---------------------------------------------------------------------------
-- Daily Journey assignments
-- ---------------------------------------------------------------------------
insert into public.daily_journeys (journey_date, language_code, journey_id) values
  (current_date, 'en', '40000000-0000-4000-8000-000000000001'),
  (current_date, 'pt', '40000000-0000-4000-8000-000000000001'),
  (current_date, 'es', '40000000-0000-4000-8000-000000000001'),
  (current_date + 1, 'en', '40000000-0000-4000-8000-000000000002')
on conflict (journey_date, language_code) do nothing;

commit;

-- Expected state after seeding:
--   * 3 collections (2 published, 1 draft; 1 premium)
--   * 6 journeys spanning published / in_review / draft / scheduled / premium
--   * Psalm 23 fully translated in EN, PT, ES with accented word lists
--   * Psalm 121 missing its PT translation, so the public query falls back to EN
--   * Psalm 1 scheduled 3 days out and therefore invisible to the public
