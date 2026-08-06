-- Two curated seven-day collections: Women of Faith, and Proverbs for the
-- Everyday Man. Trilingual (en/pt/es), Scripture from the World English
-- Bible (public domain), published and ready for the Daily Journey calendar.
--
-- Idempotent: every insert is ON CONFLICT DO NOTHING, so running it twice is
-- safe. Apply with the Supabase SQL editor or `supabase db execute`.

begin;

-- ===== Women of Faith =====
insert into public.collections
  (id, internal_name, slug, primary_language_code, status, access_level, topic, audience,
   difficulty_min, difficulty_max, estimated_total_minutes, display_order, is_featured, published_at)
values
  ('c0000000-0000-4000-8000-000000000101', 'Women of Faith', 'women-of-faith', 'en', 'published', 'free', 'People', 'Women',
   'gentle', 'challenging', 49, 3, true, now())
on conflict (id) do nothing;

insert into public.collection_translations
  (collection_id, language_code, status, title, short_description, full_description)
values
  ('c0000000-0000-4000-8000-000000000101', 'en', 'published', 'Women of Faith', 'Seven days with the women whose courage shaped Scripture.', 'A seven-day plan through the lives of Ruth, Esther, Hannah, Mary, Deborah, Mary Magdalene and Lydia — one quiet journey a day.'),
  ('c0000000-0000-4000-8000-000000000101', 'pt', 'published', 'Mulheres de Fé', 'Sete dias com as mulheres cuja coragem moldou a Escritura.', 'Um plano de sete dias pelas vidas de Rute, Ester, Ana, Maria, Débora, Maria Madalena e Lídia — uma jornada tranquila por dia.'),
  ('c0000000-0000-4000-8000-000000000101', 'es', 'published', 'Mujeres de Fe', 'Siete días con las mujeres cuyo valor marcó la Escritura.', 'Un plan de siete días por las vidas de Rut, Ester, Ana, María, Débora, María Magdalena y Lidia — una jornada serena al día.')
on conflict (collection_id, language_code) do nothing;

insert into public.journeys
  (id, internal_title, slug, primary_collection_id, position, primary_language_code, status,
   access_level, difficulty, theme, estimated_minutes, daily_eligible, published_at)
values
  ('41000000-0000-4000-8000-000000000101', 'Where You Go', 'ruth-where-you-go', 'c0000000-0000-4000-8000-000000000101', 0, 'en', 'published',
   'free', 'gentle', 'Loyalty', 7, true, now()),
  ('41000000-0000-4000-8000-000000000102', 'For Such a Time', 'esther-for-such-a-time', 'c0000000-0000-4000-8000-000000000101', 1, 'en', 'published',
   'free', 'balanced', 'Courage', 7, true, now()),
  ('41000000-0000-4000-8000-000000000103', 'Poured Out', 'hannah-poured-out', 'c0000000-0000-4000-8000-000000000101', 2, 'en', 'published',
   'free', 'gentle', 'Prayer', 7, true, now()),
  ('41000000-0000-4000-8000-000000000104', 'Let It Be', 'mary-let-it-be', 'c0000000-0000-4000-8000-000000000101', 3, 'en', 'published',
   'free', 'gentle', 'Surrender', 7, true, now()),
  ('41000000-0000-4000-8000-000000000105', 'Under the Palm', 'deborah-under-the-palm', 'c0000000-0000-4000-8000-000000000101', 4, 'en', 'published',
   'free', 'balanced', 'Leadership', 7, true, now()),
  ('41000000-0000-4000-8000-000000000106', 'He Said Her Name', 'magdalene-in-the-garden', 'c0000000-0000-4000-8000-000000000101', 5, 'en', 'published',
   'free', 'balanced', 'Devotion', 7, true, now()),
  ('41000000-0000-4000-8000-000000000107', 'An Open Home', 'lydia-an-open-home', 'c0000000-0000-4000-8000-000000000101', 6, 'en', 'published',
   'free', 'challenging', 'Hospitality', 7, true, now())
on conflict (id) do nothing;

insert into public.journey_translations
  (journey_id, language_code, status, public_title, devotional_body, reflection_prompt, prayer_body, completion_message)
values
  ('41000000-0000-4000-8000-000000000101', 'en', 'published', 'Where You Go',
   'Ruth had every reason to turn back, and one reason to stay: love that had become conviction. Loyalty is rarely dramatic; it is a decision repeated at a crossroads.',
   'Who has walked with you when leaving would have been easier?',
   'God of Ruth, make me faithful in small crossings. Amen.',
   'You walked a day with Ruth.'),
  ('41000000-0000-4000-8000-000000000101', 'pt', 'published', 'Aonde Fores',
   'Rute tinha todos os motivos para voltar, e um só para ficar: um amor que virou convicção. Lealdade raramente é dramática; é uma decisão repetida numa encruzilhada.',
   'Quem caminhou com você quando partir teria sido mais fácil?',
   'Deus de Rute, faze-me fiel nas travessias pequenas. Amém.',
   'Você caminhou um dia com Rute.'),
  ('41000000-0000-4000-8000-000000000101', 'es', 'published', 'A Donde Vayas',
   'Rut tenía todas las razones para volver, y una sola para quedarse: un amor que se hizo convicción. La lealtad rara vez es dramática; es una decisión repetida en una encrucijada.',
   '¿Quién caminó contigo cuando irse habría sido más fácil?',
   'Dios de Rut, hazme fiel en los cruces pequeños. Amén.',
   'Caminaste un día con Rut.'),
  ('41000000-0000-4000-8000-000000000102', 'en', 'published', 'For Such a Time',
   'Esther''s courage began with three days of fasting, not with a speech. Bravery that lasts is usually prayed into being before it is seen.',
   'What has been placed in your hands for this season?',
   'Give me courage that begins on my knees. Amen.',
   'You walked a day with Esther.'),
  ('41000000-0000-4000-8000-000000000102', 'pt', 'published', 'Para Um Tempo Como Este',
   'A coragem de Ester começou com três dias de jejum, não com um discurso. A bravura que dura costuma nascer em oração antes de ser vista.',
   'O que foi colocado em suas mãos nesta estação?',
   'Dá-me coragem que começa de joelhos. Amém.',
   'Você caminhou um dia com Ester.'),
  ('41000000-0000-4000-8000-000000000102', 'es', 'published', 'Para Esta Hora',
   'El valor de Ester empezó con tres días de ayuno, no con un discurso. La valentía que dura suele orarse antes de verse.',
   '¿Qué ha sido puesto en tus manos en esta temporada?',
   'Dame valor que comience de rodillas. Amén.',
   'Caminaste un día con Ester.'),
  ('41000000-0000-4000-8000-000000000103', 'en', 'published', 'Poured Out',
   'Hannah prayed with moving lips and no voice, and was misread as drunk. God read her rightly — prayer does not need to be eloquent to be heard.',
   'What have you stopped asking for?',
   'Hear the prayers I cannot say aloud. Amen.',
   'You walked a day with Hannah.'),
  ('41000000-0000-4000-8000-000000000103', 'pt', 'published', 'Derramada',
   'Ana orava com os lábios se movendo e sem voz, e foi lida como embriagada. Deus a leu corretamente — a oração não precisa ser eloquente para ser ouvida.',
   'O que você deixou de pedir?',
   'Ouve as orações que não consigo dizer em voz alta. Amém.',
   'Você caminhou um dia com Ana.'),
  ('41000000-0000-4000-8000-000000000103', 'es', 'published', 'Derramada',
   'Ana oraba moviendo los labios sin voz, y la creyeron ebria. Dios la leyó bien: la oración no necesita ser elocuente para ser oída.',
   '¿Qué dejaste de pedir?',
   'Escucha las oraciones que no logro decir en voz alta. Amén.',
   'Caminaste un día con Ana.'),
  ('41000000-0000-4000-8000-000000000104', 'en', 'published', 'Let It Be',
   'Mary asked one honest question and then said yes to a life she could not picture. Surrender is not the absence of questions; it is trust that outlasts them.',
   'Where are you being asked to say yes before you can see?',
   'Let it be to me according to your word. Amen.',
   'You walked a day with Mary.'),
  ('41000000-0000-4000-8000-000000000104', 'pt', 'published', 'Faça-se em Mim',
   'Maria fez uma pergunta honesta e depois disse sim a uma vida que não conseguia imaginar. Entrega não é ausência de perguntas; é confiança que dura mais que elas.',
   'Onde você está sendo convidado a dizer sim antes de enxergar?',
   'Faça-se em mim segundo a tua palavra. Amém.',
   'Você caminhou um dia com Maria.'),
  ('41000000-0000-4000-8000-000000000104', 'es', 'published', 'Hágase en Mí',
   'María hizo una pregunta honesta y luego dijo sí a una vida que no podía imaginar. Entregarse no es no tener preguntas; es confiar más allá de ellas.',
   '¿Dónde se te pide decir sí antes de poder ver?',
   'Hágase en mí conforme a tu palabra. Amén.',
   'Caminaste un día con María.'),
  ('41000000-0000-4000-8000-000000000105', 'en', 'published', 'Under the Palm',
   'Deborah judged in the open, under a tree anyone could find. Leadership that heals is available, unhurried, and not impressed with itself.',
   'Who needs you to be findable this week?',
   'Make me steady enough to be sought. Amen.',
   'You walked a day with Deborah.'),
  ('41000000-0000-4000-8000-000000000105', 'pt', 'published', 'Debaixo da Palmeira',
   'Débora julgava a céu aberto, sob uma árvore que qualquer um encontrava. A liderança que cura é acessível, sem pressa e sem se admirar de si mesma.',
   'Quem precisa que você esteja encontrável nesta semana?',
   'Faze-me firme o bastante para ser procurado. Amém.',
   'Você caminhou um dia com Débora.'),
  ('41000000-0000-4000-8000-000000000105', 'es', 'published', 'Bajo la Palmera',
   'Débora juzgaba a cielo abierto, bajo un árbol que cualquiera podía hallar. El liderazgo que sana es accesible, sin prisa y sin admirarse de sí mismo.',
   '¿Quién necesita encontrarte esta semana?',
   'Hazme firme para ser buscado. Amén.',
   'Caminaste un día con Débora.'),
  ('41000000-0000-4000-8000-000000000106', 'en', 'published', 'He Said Her Name',
   'Mary Magdalene stayed at the tomb after everyone else went home. She was not recognised by an argument but by her name, spoken.',
   'Where are you staying, waiting, still?',
   'Speak my name when I cannot see you. Amen.',
   'You walked a day with Mary Magdalene.'),
  ('41000000-0000-4000-8000-000000000106', 'pt', 'published', 'Ele Disse Seu Nome',
   'Maria Madalena ficou no túmulo depois que todos foram embora. Ela não foi convencida por um argumento, mas pelo seu nome, dito em voz alta.',
   'Onde você está permanecendo, esperando, ainda?',
   'Diz o meu nome quando eu não te enxergo. Amém.',
   'Você caminhou um dia com Maria Madalena.'),
  ('41000000-0000-4000-8000-000000000106', 'es', 'published', 'Dijo Su Nombre',
   'María Magdalena se quedó junto al sepulcro cuando los demás se fueron. No la convenció un argumento, sino su nombre, pronunciado.',
   '¿Dónde estás permaneciendo, esperando, todavía?',
   'Di mi nombre cuando no logro verte. Amén.',
   'Caminaste un día con María Magdalena.'),
  ('41000000-0000-4000-8000-000000000107', 'en', 'published', 'An Open Home',
   'Lydia''s heart was opened first, and her door opened next. Hospitality is what an opened heart does with a house.',
   'What would it cost you to open one door this week?',
   'Open my heart, and then my home. Amen.',
   'You finished Women of Faith.'),
  ('41000000-0000-4000-8000-000000000107', 'pt', 'published', 'Uma Casa Aberta',
   'O coração de Lídia foi aberto primeiro, e a porta depois. Hospitalidade é o que um coração aberto faz com uma casa.',
   'O que custaria a você abrir uma porta nesta semana?',
   'Abre meu coração e depois minha casa. Amém.',
   'Você concluiu Mulheres de Fé.'),
  ('41000000-0000-4000-8000-000000000107', 'es', 'published', 'Una Casa Abierta',
   'El corazón de Lidia fue abierto primero, y luego su puerta. La hospitalidad es lo que un corazón abierto hace con una casa.',
   '¿Qué te costaría abrir una puerta esta semana?',
   'Abre mi corazón y después mi casa. Amén.',
   'Terminaste Mujeres de Fe.')
on conflict (journey_id, language_code) do nothing;

insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000101', s.id, 'RUT', 1, 16, 16, 'Ruth 1:16',
  'Where you go, I will go; and where you stay, I will stay. Your people will be my people, and your God my God.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000102', s.id, 'EST', 4, 14, 14, 'Esther 4:14',
  'Who knows if you haven''t come to the kingdom for such a time as this?', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000103', s.id, '1SA', 1, 27, 27, '1 Samuel 1:27',
  'For this child I prayed; and Yahweh has given me my petition which I asked of him.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000104', s.id, 'LUK', 1, 38, 38, 'Luke 1:38',
  'Mary said, Behold, the servant of the Lord; let it be done to me according to your word.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000105', s.id, 'JDG', 4, 4, 5, 'Judges 4:4-5',
  'Now Deborah, a prophetess, was judging Israel at that time. She lived under Deborah''s palm tree, and the children of Israel came up to her for judgment.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000106', s.id, 'JHN', 20, 16, 16, 'John 20:16',
  'Jesus said to her, Mary. She turned and said to him, Rabboni! which is to say, Teacher!', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '41000000-0000-4000-8000-000000000107', s.id, 'ACT', 16, 14, 15, 'Acts 16:14-15',
  'The Lord opened her heart to listen to the things which were spoken by Paul. She urged us, saying, Come into my house and stay.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;

insert into public.journey_words (id, journey_id, position, is_required, min_difficulty) values
  ('41000000-0000-4000-8000-010100000000', '41000000-0000-4000-8000-000000000101', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-010200000000', '41000000-0000-4000-8000-000000000101', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-010300000000', '41000000-0000-4000-8000-000000000101', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-010400000000', '41000000-0000-4000-8000-000000000101', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-010500000000', '41000000-0000-4000-8000-000000000101', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-010600000000', '41000000-0000-4000-8000-000000000101', 5, true, 'challenging'),
  ('41000000-0000-4000-8000-020100000000', '41000000-0000-4000-8000-000000000102', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-020200000000', '41000000-0000-4000-8000-000000000102', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-020300000000', '41000000-0000-4000-8000-000000000102', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-020400000000', '41000000-0000-4000-8000-000000000102', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-020500000000', '41000000-0000-4000-8000-000000000102', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-020600000000', '41000000-0000-4000-8000-000000000102', 5, true, 'challenging'),
  ('41000000-0000-4000-8000-030100000000', '41000000-0000-4000-8000-000000000103', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-030200000000', '41000000-0000-4000-8000-000000000103', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-030300000000', '41000000-0000-4000-8000-000000000103', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-030400000000', '41000000-0000-4000-8000-000000000103', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-030500000000', '41000000-0000-4000-8000-000000000103', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-030600000000', '41000000-0000-4000-8000-000000000103', 5, true, 'challenging'),
  ('41000000-0000-4000-8000-040100000000', '41000000-0000-4000-8000-000000000104', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-040200000000', '41000000-0000-4000-8000-000000000104', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-040300000000', '41000000-0000-4000-8000-000000000104', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-040400000000', '41000000-0000-4000-8000-000000000104', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-040500000000', '41000000-0000-4000-8000-000000000104', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-040600000000', '41000000-0000-4000-8000-000000000104', 5, true, 'challenging'),
  ('41000000-0000-4000-8000-050100000000', '41000000-0000-4000-8000-000000000105', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-050200000000', '41000000-0000-4000-8000-000000000105', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-050300000000', '41000000-0000-4000-8000-000000000105', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-050400000000', '41000000-0000-4000-8000-000000000105', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-050500000000', '41000000-0000-4000-8000-000000000105', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-050600000000', '41000000-0000-4000-8000-000000000105', 5, true, 'challenging'),
  ('41000000-0000-4000-8000-060100000000', '41000000-0000-4000-8000-000000000106', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-060200000000', '41000000-0000-4000-8000-000000000106', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-060300000000', '41000000-0000-4000-8000-000000000106', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-060400000000', '41000000-0000-4000-8000-000000000106', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-060500000000', '41000000-0000-4000-8000-000000000106', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-060600000000', '41000000-0000-4000-8000-000000000106', 5, true, 'challenging'),
  ('41000000-0000-4000-8000-070100000000', '41000000-0000-4000-8000-000000000107', 0, true, 'gentle'),
  ('41000000-0000-4000-8000-070200000000', '41000000-0000-4000-8000-000000000107', 1, true, 'gentle'),
  ('41000000-0000-4000-8000-070300000000', '41000000-0000-4000-8000-000000000107', 2, true, 'gentle'),
  ('41000000-0000-4000-8000-070400000000', '41000000-0000-4000-8000-000000000107', 3, true, 'gentle'),
  ('41000000-0000-4000-8000-070500000000', '41000000-0000-4000-8000-000000000107', 4, true, 'balanced'),
  ('41000000-0000-4000-8000-070600000000', '41000000-0000-4000-8000-000000000107', 5, true, 'challenging')
on conflict (id) do nothing;

insert into public.journey_word_translations
  (journey_word_id, journey_id, language_code, status, display_value, normalized_value)
values
  ('41000000-0000-4000-8000-010100000000', '41000000-0000-4000-8000-000000000101', 'en', 'published', 'RUTH', 'RUTH'),
  ('41000000-0000-4000-8000-010100000000', '41000000-0000-4000-8000-000000000101', 'pt', 'published', 'RUTE', 'RUTE'),
  ('41000000-0000-4000-8000-010100000000', '41000000-0000-4000-8000-000000000101', 'es', 'published', 'RUT', 'RUT'),
  ('41000000-0000-4000-8000-010200000000', '41000000-0000-4000-8000-000000000101', 'en', 'published', 'LOYAL', 'LOYAL'),
  ('41000000-0000-4000-8000-010200000000', '41000000-0000-4000-8000-000000000101', 'pt', 'published', 'LEAL', 'LEAL'),
  ('41000000-0000-4000-8000-010200000000', '41000000-0000-4000-8000-000000000101', 'es', 'published', 'LEAL', 'LEAL'),
  ('41000000-0000-4000-8000-010300000000', '41000000-0000-4000-8000-000000000101', 'en', 'published', 'GLEAN', 'GLEAN'),
  ('41000000-0000-4000-8000-010300000000', '41000000-0000-4000-8000-000000000101', 'pt', 'published', 'COLHER', 'COLHER'),
  ('41000000-0000-4000-8000-010300000000', '41000000-0000-4000-8000-000000000101', 'es', 'published', 'ESPIGAR', 'ESPIGAR'),
  ('41000000-0000-4000-8000-010400000000', '41000000-0000-4000-8000-000000000101', 'en', 'published', 'KINDNESS', 'KINDNESS'),
  ('41000000-0000-4000-8000-010400000000', '41000000-0000-4000-8000-000000000101', 'pt', 'published', 'BONDADE', 'BONDADE'),
  ('41000000-0000-4000-8000-010400000000', '41000000-0000-4000-8000-000000000101', 'es', 'published', 'BONDAD', 'BONDAD'),
  ('41000000-0000-4000-8000-010500000000', '41000000-0000-4000-8000-000000000101', 'en', 'published', 'HARVEST', 'HARVEST'),
  ('41000000-0000-4000-8000-010500000000', '41000000-0000-4000-8000-000000000101', 'pt', 'published', 'COLHEITA', 'COLHEITA'),
  ('41000000-0000-4000-8000-010500000000', '41000000-0000-4000-8000-000000000101', 'es', 'published', 'COSECHA', 'COSECHA'),
  ('41000000-0000-4000-8000-010600000000', '41000000-0000-4000-8000-000000000101', 'en', 'published', 'RETURN', 'RETURN'),
  ('41000000-0000-4000-8000-010600000000', '41000000-0000-4000-8000-000000000101', 'pt', 'published', 'VOLTAR', 'VOLTAR'),
  ('41000000-0000-4000-8000-010600000000', '41000000-0000-4000-8000-000000000101', 'es', 'published', 'VOLVER', 'VOLVER'),
  ('41000000-0000-4000-8000-020100000000', '41000000-0000-4000-8000-000000000102', 'en', 'published', 'ESTHER', 'ESTHER'),
  ('41000000-0000-4000-8000-020100000000', '41000000-0000-4000-8000-000000000102', 'pt', 'published', 'ESTER', 'ESTER'),
  ('41000000-0000-4000-8000-020100000000', '41000000-0000-4000-8000-000000000102', 'es', 'published', 'ESTER', 'ESTER'),
  ('41000000-0000-4000-8000-020200000000', '41000000-0000-4000-8000-000000000102', 'en', 'published', 'COURAGE', 'COURAGE'),
  ('41000000-0000-4000-8000-020200000000', '41000000-0000-4000-8000-000000000102', 'pt', 'published', 'CORAGEM', 'CORAGEM'),
  ('41000000-0000-4000-8000-020200000000', '41000000-0000-4000-8000-000000000102', 'es', 'published', 'VALOR', 'VALOR'),
  ('41000000-0000-4000-8000-020300000000', '41000000-0000-4000-8000-000000000102', 'en', 'published', 'QUEEN', 'QUEEN'),
  ('41000000-0000-4000-8000-020300000000', '41000000-0000-4000-8000-000000000102', 'pt', 'published', 'RAINHA', 'RAINHA'),
  ('41000000-0000-4000-8000-020300000000', '41000000-0000-4000-8000-000000000102', 'es', 'published', 'REINA', 'REINA'),
  ('41000000-0000-4000-8000-020400000000', '41000000-0000-4000-8000-000000000102', 'en', 'published', 'FASTING', 'FASTING'),
  ('41000000-0000-4000-8000-020400000000', '41000000-0000-4000-8000-000000000102', 'pt', 'published', 'JEJUM', 'JEJUM'),
  ('41000000-0000-4000-8000-020400000000', '41000000-0000-4000-8000-000000000102', 'es', 'published', 'AYUNO', 'AYUNO'),
  ('41000000-0000-4000-8000-020500000000', '41000000-0000-4000-8000-000000000102', 'en', 'published', 'PEOPLE', 'PEOPLE'),
  ('41000000-0000-4000-8000-020500000000', '41000000-0000-4000-8000-000000000102', 'pt', 'published', 'POVO', 'POVO'),
  ('41000000-0000-4000-8000-020500000000', '41000000-0000-4000-8000-000000000102', 'es', 'published', 'PUEBLO', 'PUEBLO'),
  ('41000000-0000-4000-8000-020600000000', '41000000-0000-4000-8000-000000000102', 'en', 'published', 'TIMING', 'TIMING'),
  ('41000000-0000-4000-8000-020600000000', '41000000-0000-4000-8000-000000000102', 'pt', 'published', 'TEMPO', 'TEMPO'),
  ('41000000-0000-4000-8000-020600000000', '41000000-0000-4000-8000-000000000102', 'es', 'published', 'TIEMPO', 'TIEMPO'),
  ('41000000-0000-4000-8000-030100000000', '41000000-0000-4000-8000-000000000103', 'en', 'published', 'HANNAH', 'HANNAH'),
  ('41000000-0000-4000-8000-030100000000', '41000000-0000-4000-8000-000000000103', 'pt', 'published', 'ANA', 'ANA'),
  ('41000000-0000-4000-8000-030100000000', '41000000-0000-4000-8000-000000000103', 'es', 'published', 'ANA', 'ANA'),
  ('41000000-0000-4000-8000-030200000000', '41000000-0000-4000-8000-000000000103', 'en', 'published', 'PRAYER', 'PRAYER'),
  ('41000000-0000-4000-8000-030200000000', '41000000-0000-4000-8000-000000000103', 'pt', 'published', 'ORAÇÃO', 'ORACAO'),
  ('41000000-0000-4000-8000-030200000000', '41000000-0000-4000-8000-000000000103', 'es', 'published', 'ORACIÓN', 'ORACION'),
  ('41000000-0000-4000-8000-030300000000', '41000000-0000-4000-8000-000000000103', 'en', 'published', 'TEMPLE', 'TEMPLE'),
  ('41000000-0000-4000-8000-030300000000', '41000000-0000-4000-8000-000000000103', 'pt', 'published', 'TEMPLO', 'TEMPLO'),
  ('41000000-0000-4000-8000-030300000000', '41000000-0000-4000-8000-000000000103', 'es', 'published', 'TEMPLO', 'TEMPLO'),
  ('41000000-0000-4000-8000-030400000000', '41000000-0000-4000-8000-000000000103', 'en', 'published', 'SILENT', 'SILENT'),
  ('41000000-0000-4000-8000-030400000000', '41000000-0000-4000-8000-000000000103', 'pt', 'published', 'SILÊNCIO', 'SILENCIO'),
  ('41000000-0000-4000-8000-030400000000', '41000000-0000-4000-8000-000000000103', 'es', 'published', 'SILENCIO', 'SILENCIO'),
  ('41000000-0000-4000-8000-030500000000', '41000000-0000-4000-8000-000000000103', 'en', 'published', 'ANSWER', 'ANSWER'),
  ('41000000-0000-4000-8000-030500000000', '41000000-0000-4000-8000-000000000103', 'pt', 'published', 'RESPOSTA', 'RESPOSTA'),
  ('41000000-0000-4000-8000-030500000000', '41000000-0000-4000-8000-000000000103', 'es', 'published', 'RESPUESTA', 'RESPUESTA'),
  ('41000000-0000-4000-8000-030600000000', '41000000-0000-4000-8000-000000000103', 'en', 'published', 'VOW', 'VOW'),
  ('41000000-0000-4000-8000-030600000000', '41000000-0000-4000-8000-000000000103', 'pt', 'published', 'VOTO', 'VOTO'),
  ('41000000-0000-4000-8000-030600000000', '41000000-0000-4000-8000-000000000103', 'es', 'published', 'VOTO', 'VOTO'),
  ('41000000-0000-4000-8000-040100000000', '41000000-0000-4000-8000-000000000104', 'en', 'published', 'MARY', 'MARY'),
  ('41000000-0000-4000-8000-040100000000', '41000000-0000-4000-8000-000000000104', 'pt', 'published', 'MARIA', 'MARIA'),
  ('41000000-0000-4000-8000-040100000000', '41000000-0000-4000-8000-000000000104', 'es', 'published', 'MARÍA', 'MARIA'),
  ('41000000-0000-4000-8000-040200000000', '41000000-0000-4000-8000-000000000104', 'en', 'published', 'SERVANT', 'SERVANT'),
  ('41000000-0000-4000-8000-040200000000', '41000000-0000-4000-8000-000000000104', 'pt', 'published', 'SERVA', 'SERVA'),
  ('41000000-0000-4000-8000-040200000000', '41000000-0000-4000-8000-000000000104', 'es', 'published', 'SIERVA', 'SIERVA'),
  ('41000000-0000-4000-8000-040300000000', '41000000-0000-4000-8000-000000000104', 'en', 'published', 'ANGEL', 'ANGEL'),
  ('41000000-0000-4000-8000-040300000000', '41000000-0000-4000-8000-000000000104', 'pt', 'published', 'ANJO', 'ANJO'),
  ('41000000-0000-4000-8000-040300000000', '41000000-0000-4000-8000-000000000104', 'es', 'published', 'ÁNGEL', 'ANGEL'),
  ('41000000-0000-4000-8000-040400000000', '41000000-0000-4000-8000-000000000104', 'en', 'published', 'FAVOR', 'FAVOR'),
  ('41000000-0000-4000-8000-040400000000', '41000000-0000-4000-8000-000000000104', 'pt', 'published', 'GRAÇA', 'GRACA'),
  ('41000000-0000-4000-8000-040400000000', '41000000-0000-4000-8000-000000000104', 'es', 'published', 'FAVOR', 'FAVOR'),
  ('41000000-0000-4000-8000-040500000000', '41000000-0000-4000-8000-000000000104', 'en', 'published', 'WORD', 'WORD'),
  ('41000000-0000-4000-8000-040500000000', '41000000-0000-4000-8000-000000000104', 'pt', 'published', 'PALAVRA', 'PALAVRA'),
  ('41000000-0000-4000-8000-040500000000', '41000000-0000-4000-8000-000000000104', 'es', 'published', 'PALABRA', 'PALABRA'),
  ('41000000-0000-4000-8000-040600000000', '41000000-0000-4000-8000-000000000104', 'en', 'published', 'TREASURE', 'TREASURE'),
  ('41000000-0000-4000-8000-040600000000', '41000000-0000-4000-8000-000000000104', 'pt', 'published', 'GUARDAR', 'GUARDAR'),
  ('41000000-0000-4000-8000-040600000000', '41000000-0000-4000-8000-000000000104', 'es', 'published', 'GUARDAR', 'GUARDAR'),
  ('41000000-0000-4000-8000-050100000000', '41000000-0000-4000-8000-000000000105', 'en', 'published', 'DEBORAH', 'DEBORAH'),
  ('41000000-0000-4000-8000-050100000000', '41000000-0000-4000-8000-000000000105', 'pt', 'published', 'DÉBORA', 'DEBORA'),
  ('41000000-0000-4000-8000-050100000000', '41000000-0000-4000-8000-000000000105', 'es', 'published', 'DÉBORA', 'DEBORA'),
  ('41000000-0000-4000-8000-050200000000', '41000000-0000-4000-8000-000000000105', 'en', 'published', 'PALM', 'PALM'),
  ('41000000-0000-4000-8000-050200000000', '41000000-0000-4000-8000-000000000105', 'pt', 'published', 'PALMEIRA', 'PALMEIRA'),
  ('41000000-0000-4000-8000-050200000000', '41000000-0000-4000-8000-000000000105', 'es', 'published', 'PALMERA', 'PALMERA'),
  ('41000000-0000-4000-8000-050300000000', '41000000-0000-4000-8000-000000000105', 'en', 'published', 'JUDGE', 'JUDGE'),
  ('41000000-0000-4000-8000-050300000000', '41000000-0000-4000-8000-000000000105', 'pt', 'published', 'JUÍZA', 'JUIZA'),
  ('41000000-0000-4000-8000-050300000000', '41000000-0000-4000-8000-000000000105', 'es', 'published', 'JUEZA', 'JUEZA'),
  ('41000000-0000-4000-8000-050400000000', '41000000-0000-4000-8000-000000000105', 'en', 'published', 'SONG', 'SONG'),
  ('41000000-0000-4000-8000-050400000000', '41000000-0000-4000-8000-000000000105', 'pt', 'published', 'CÂNTICO', 'CANTICO'),
  ('41000000-0000-4000-8000-050400000000', '41000000-0000-4000-8000-000000000105', 'es', 'published', 'CÁNTICO', 'CANTICO'),
  ('41000000-0000-4000-8000-050500000000', '41000000-0000-4000-8000-000000000105', 'en', 'published', 'VICTORY', 'VICTORY'),
  ('41000000-0000-4000-8000-050500000000', '41000000-0000-4000-8000-000000000105', 'pt', 'published', 'VITÓRIA', 'VITORIA'),
  ('41000000-0000-4000-8000-050500000000', '41000000-0000-4000-8000-000000000105', 'es', 'published', 'VICTORIA', 'VICTORIA'),
  ('41000000-0000-4000-8000-050600000000', '41000000-0000-4000-8000-000000000105', 'en', 'published', 'COUNSEL', 'COUNSEL'),
  ('41000000-0000-4000-8000-050600000000', '41000000-0000-4000-8000-000000000105', 'pt', 'published', 'CONSELHO', 'CONSELHO'),
  ('41000000-0000-4000-8000-050600000000', '41000000-0000-4000-8000-000000000105', 'es', 'published', 'CONSEJO', 'CONSEJO'),
  ('41000000-0000-4000-8000-060100000000', '41000000-0000-4000-8000-000000000106', 'en', 'published', 'GARDEN', 'GARDEN'),
  ('41000000-0000-4000-8000-060100000000', '41000000-0000-4000-8000-000000000106', 'pt', 'published', 'JARDIM', 'JARDIM'),
  ('41000000-0000-4000-8000-060100000000', '41000000-0000-4000-8000-000000000106', 'es', 'published', 'HUERTO', 'HUERTO'),
  ('41000000-0000-4000-8000-060200000000', '41000000-0000-4000-8000-000000000106', 'en', 'published', 'TEACHER', 'TEACHER'),
  ('41000000-0000-4000-8000-060200000000', '41000000-0000-4000-8000-000000000106', 'pt', 'published', 'MESTRE', 'MESTRE'),
  ('41000000-0000-4000-8000-060200000000', '41000000-0000-4000-8000-000000000106', 'es', 'published', 'MAESTRO', 'MAESTRO'),
  ('41000000-0000-4000-8000-060300000000', '41000000-0000-4000-8000-000000000106', 'en', 'published', 'MORNING', 'MORNING'),
  ('41000000-0000-4000-8000-060300000000', '41000000-0000-4000-8000-000000000106', 'pt', 'published', 'MANHÃ', 'MANHA'),
  ('41000000-0000-4000-8000-060300000000', '41000000-0000-4000-8000-000000000106', 'es', 'published', 'MAÑANA', 'MAÑANA'),
  ('41000000-0000-4000-8000-060400000000', '41000000-0000-4000-8000-000000000106', 'en', 'published', 'SEEKING', 'SEEKING'),
  ('41000000-0000-4000-8000-060400000000', '41000000-0000-4000-8000-000000000106', 'pt', 'published', 'BUSCAR', 'BUSCAR'),
  ('41000000-0000-4000-8000-060400000000', '41000000-0000-4000-8000-000000000106', 'es', 'published', 'BUSCAR', 'BUSCAR'),
  ('41000000-0000-4000-8000-060500000000', '41000000-0000-4000-8000-000000000106', 'en', 'published', 'RISEN', 'RISEN'),
  ('41000000-0000-4000-8000-060500000000', '41000000-0000-4000-8000-000000000106', 'pt', 'published', 'RESSURGIU', 'RESSURGIU'),
  ('41000000-0000-4000-8000-060500000000', '41000000-0000-4000-8000-000000000106', 'es', 'published', 'RESUCITÓ', 'RESUCITO'),
  ('41000000-0000-4000-8000-060600000000', '41000000-0000-4000-8000-000000000106', 'en', 'published', 'NAME', 'NAME'),
  ('41000000-0000-4000-8000-060600000000', '41000000-0000-4000-8000-000000000106', 'pt', 'published', 'NOME', 'NOME'),
  ('41000000-0000-4000-8000-060600000000', '41000000-0000-4000-8000-000000000106', 'es', 'published', 'NOMBRE', 'NOMBRE'),
  ('41000000-0000-4000-8000-070100000000', '41000000-0000-4000-8000-000000000107', 'en', 'published', 'LYDIA', 'LYDIA'),
  ('41000000-0000-4000-8000-070100000000', '41000000-0000-4000-8000-000000000107', 'pt', 'published', 'LÍDIA', 'LIDIA'),
  ('41000000-0000-4000-8000-070100000000', '41000000-0000-4000-8000-000000000107', 'es', 'published', 'LIDIA', 'LIDIA'),
  ('41000000-0000-4000-8000-070200000000', '41000000-0000-4000-8000-000000000107', 'en', 'published', 'PURPLE', 'PURPLE'),
  ('41000000-0000-4000-8000-070200000000', '41000000-0000-4000-8000-000000000107', 'pt', 'published', 'PÚRPURA', 'PURPURA'),
  ('41000000-0000-4000-8000-070200000000', '41000000-0000-4000-8000-000000000107', 'es', 'published', 'PÚRPURA', 'PURPURA'),
  ('41000000-0000-4000-8000-070300000000', '41000000-0000-4000-8000-000000000107', 'en', 'published', 'RIVER', 'RIVER'),
  ('41000000-0000-4000-8000-070300000000', '41000000-0000-4000-8000-000000000107', 'pt', 'published', 'RIO', 'RIO'),
  ('41000000-0000-4000-8000-070300000000', '41000000-0000-4000-8000-000000000107', 'es', 'published', 'RÍO', 'RIO'),
  ('41000000-0000-4000-8000-070400000000', '41000000-0000-4000-8000-000000000107', 'en', 'published', 'LISTEN', 'LISTEN'),
  ('41000000-0000-4000-8000-070400000000', '41000000-0000-4000-8000-000000000107', 'pt', 'published', 'ESCUTAR', 'ESCUTAR'),
  ('41000000-0000-4000-8000-070400000000', '41000000-0000-4000-8000-000000000107', 'es', 'published', 'ESCUCHAR', 'ESCUCHAR'),
  ('41000000-0000-4000-8000-070500000000', '41000000-0000-4000-8000-000000000107', 'en', 'published', 'OPENED', 'OPENED'),
  ('41000000-0000-4000-8000-070500000000', '41000000-0000-4000-8000-000000000107', 'pt', 'published', 'ABERTO', 'ABERTO'),
  ('41000000-0000-4000-8000-070500000000', '41000000-0000-4000-8000-000000000107', 'es', 'published', 'ABIERTO', 'ABIERTO'),
  ('41000000-0000-4000-8000-070600000000', '41000000-0000-4000-8000-000000000107', 'en', 'published', 'WELCOME', 'WELCOME'),
  ('41000000-0000-4000-8000-070600000000', '41000000-0000-4000-8000-000000000107', 'pt', 'published', 'ACOLHER', 'ACOLHER'),
  ('41000000-0000-4000-8000-070600000000', '41000000-0000-4000-8000-000000000107', 'es', 'published', 'ACOGER', 'ACOGER')
on conflict (journey_word_id, language_code) do nothing;

-- ===== Proverbs for the Everyday Man =====
insert into public.collections
  (id, internal_name, slug, primary_language_code, status, access_level, topic, audience,
   difficulty_min, difficulty_max, estimated_total_minutes, display_order, is_featured, published_at)
values
  ('c0000000-0000-4000-8000-000000000102', 'Proverbs for the Everyday Man', 'proverbs-everyday-man', 'en', 'published', 'free', 'Proverbs', 'Men',
   'gentle', 'challenging', 49, 4, true, now())
on conflict (id) do nothing;

insert into public.collection_translations
  (collection_id, language_code, status, title, short_description, full_description)
values
  ('c0000000-0000-4000-8000-000000000102', 'en', 'published', 'Proverbs for the Everyday Man', 'Seven days in Proverbs, for work, words, friendship and fatherhood.', 'A seven-day plan through Proverbs on the things a man carries daily: his heart, his speech, his work, his friends and his children.'),
  ('c0000000-0000-4000-8000-000000000102', 'pt', 'published', 'Provérbios para o Homem Comum', 'Sete dias em Provérbios: trabalho, palavras, amizade e paternidade.', 'Um plano de sete dias por Provérbios sobre o que um homem carrega todo dia: seu coração, sua fala, seu trabalho, seus amigos e seus filhos.'),
  ('c0000000-0000-4000-8000-000000000102', 'es', 'published', 'Proverbios para el Hombre de Cada Día', 'Siete días en Proverbios: trabajo, palabras, amistad y paternidad.', 'Un plan de siete días por Proverbios sobre lo que un hombre lleva a diario: su corazón, su habla, su trabajo, sus amigos y sus hijos.')
on conflict (collection_id, language_code) do nothing;

insert into public.journeys
  (id, internal_title, slug, primary_collection_id, position, primary_language_code, status,
   access_level, difficulty, theme, estimated_minutes, daily_eligible, published_at)
values
  ('42000000-0000-4000-8000-000000000201', 'Guard Your Heart', 'proverbs-4-guard-your-heart', 'c0000000-0000-4000-8000-000000000102', 0, 'en', 'published',
   'free', 'gentle', 'Integrity', 7, true, now()),
  ('42000000-0000-4000-8000-000000000202', 'Fewer Words', 'proverbs-10-fewer-words', 'c0000000-0000-4000-8000-000000000102', 1, 'en', 'published',
   'free', 'gentle', 'Speech', 7, true, now()),
  ('42000000-0000-4000-8000-000000000203', 'Honest Scales', 'proverbs-11-honest-scales', 'c0000000-0000-4000-8000-000000000102', 2, 'en', 'published',
   'free', 'balanced', 'Work', 7, true, now()),
  ('42000000-0000-4000-8000-000000000204', 'The Company You Keep', 'proverbs-13-the-company', 'c0000000-0000-4000-8000-000000000102', 3, 'en', 'published',
   'free', 'balanced', 'Friendship', 7, true, now()),
  ('42000000-0000-4000-8000-000000000205', 'Born for Adversity', 'proverbs-17-a-friend-loves', 'c0000000-0000-4000-8000-000000000102', 4, 'en', 'published',
   'free', 'balanced', 'Brotherhood', 7, true, now()),
  ('42000000-0000-4000-8000-000000000206', 'The Way He Should Go', 'proverbs-22-train-a-child', 'c0000000-0000-4000-8000-000000000102', 5, 'en', 'published',
   'free', 'challenging', 'Fatherhood', 7, true, now()),
  ('42000000-0000-4000-8000-000000000207', 'Iron Sharpens Iron', 'proverbs-27-iron-sharpens', 'c0000000-0000-4000-8000-000000000102', 6, 'en', 'published',
   'free', 'challenging', 'Growth', 7, true, now())
on conflict (id) do nothing;

insert into public.journey_translations
  (journey_id, language_code, status, public_title, devotional_body, reflection_prompt, prayer_body, completion_message)
values
  ('42000000-0000-4000-8000-000000000201', 'en', 'published', 'Guard Your Heart',
   'The heart here is not sentiment; it is the control room where decisions are made before anyone sees them. A man guards it the way he would guard a well his family drinks from.',
   'What are you letting in without noticing?',
   'Keep my heart today, before the day keeps it. Amen.',
   'Day one of Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000201', 'pt', 'published', 'Guarda o Teu Coração',
   'O coração aqui não é sentimento; é a sala de comando onde as decisões nascem antes de alguém ver. O homem o guarda como guardaria o poço de onde sua família bebe.',
   'O que você tem deixado entrar sem perceber?',
   'Guarda o meu coração hoje, antes que o dia o tome. Amém.',
   'Dia um de Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000201', 'es', 'published', 'Guarda Tu Corazón',
   'El corazón aquí no es sentimiento; es la sala de mando donde nacen las decisiones antes de que alguien las vea. Un hombre lo guarda como guardaría el pozo del que bebe su familia.',
   '¿Qué estás dejando entrar sin notarlo?',
   'Guarda mi corazón hoy, antes de que el día lo tome. Amén.',
   'Día uno de Proverbios para el Hombre de Cada Día.'),
  ('42000000-0000-4000-8000-000000000202', 'en', 'published', 'Fewer Words',
   'Most damage between people is done by one sentence too many. Restraint is not weakness; it is a man deciding that being right is worth less than being kind.',
   'Which conversation this week needed one sentence fewer?',
   'Set a guard over my mouth today. Amen.',
   'Day two of Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000202', 'pt', 'published', 'Menos Palavras',
   'A maior parte do estrago entre pessoas vem de uma frase a mais. Conter-se não é fraqueza; é um homem decidindo que ter razão vale menos do que ser gentil.',
   'Qual conversa desta semana pedia uma frase a menos?',
   'Põe uma guarda à minha boca hoje. Amém.',
   'Dia dois de Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000202', 'es', 'published', 'Menos Palabras',
   'Casi todo el daño entre personas viene de una frase de más. Contenerse no es debilidad; es un hombre decidiendo que tener razón vale menos que ser amable.',
   '¿Qué conversación de esta semana pedía una frase menos?',
   'Pon guarda a mi boca hoy. Amén.',
   'Día dos de Proverbios para el Hombre de Cada Día.'),
  ('42000000-0000-4000-8000-000000000203', 'en', 'published', 'Honest Scales',
   'Integrity is not a speech; it is what your hands do when the invoice could be rounded up. It guides — meaning it decides for you on the days you are tired.',
   'Where is the temptation to round up in your work?',
   'Make my hands honest when no one checks. Amen.',
   'Day three of Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000203', 'pt', 'published', 'Balanças Honestas',
   'Integridade não é discurso; é o que suas mãos fazem quando a nota poderia ser arredondada. Ela guia — ou seja, decide por você nos dias em que você está cansado.',
   'Onde está a tentação de arredondar no seu trabalho?',
   'Faze minhas mãos honestas quando ninguém confere. Amém.',
   'Dia três de Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000203', 'es', 'published', 'Balanzas Honestas',
   'La integridad no es un discurso; es lo que hacen tus manos cuando la factura podría redondearse. Ella guía: decide por ti los días en que estás cansado.',
   '¿Dónde está la tentación de redondear en tu trabajo?',
   'Haz honestas mis manos cuando nadie revisa. Amén.',
   'Día tres de Proverbios para el Hombre de Cada Día.'),
  ('42000000-0000-4000-8000-000000000204', 'en', 'published', 'The Company You Keep',
   'No one decides to become foolish; they decide who to spend Friday with. You will end up sounding like the men you listen to most.',
   'Who are the three voices you hear most often?',
   'Give me wise company, and make me wise company. Amen.',
   'Day four of Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000204', 'pt', 'published', 'A Companhia que Você Mantém',
   'Ninguém decide ficar tolo; decide com quem passa a sexta-feira. Você vai acabar falando como os homens que mais escuta.',
   'Quais são as três vozes que você mais ouve?',
   'Dá-me companhia sábia, e faze de mim companhia sábia. Amém.',
   'Dia quatro de Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000204', 'es', 'published', 'La Compañía que Llevas',
   'Nadie decide volverse necio; decide con quién pasa el viernes. Terminarás sonando como los hombres que más escuchas.',
   '¿Cuáles son las tres voces que más oyes?',
   'Dame compañía sabia, y hazme compañía sabia. Amén.',
   'Día cuatro de Proverbios para el Hombre de Cada Día.'),
  ('42000000-0000-4000-8000-000000000205', 'en', 'published', 'Born for Adversity',
   'Anyone can be present at a celebration. The brother in this proverb is the one who appears on the worst Tuesday of your year, without being asked.',
   'Whose worst week could you show up for?',
   'Make me the friend I would want. Amen.',
   'Day five of Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000205', 'pt', 'published', 'Nascido para a Adversidade',
   'Qualquer um comparece a uma celebração. O irmão deste provérbio é o que aparece na pior terça-feira do seu ano, sem ser chamado.',
   'Na pior semana de quem você poderia aparecer?',
   'Faze de mim o amigo que eu gostaria de ter. Amém.',
   'Dia cinco de Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000205', 'es', 'published', 'Nacido para la Adversidad',
   'Cualquiera asiste a una celebración. El hermano de este proverbio es el que aparece el peor martes de tu año, sin que lo llamen.',
   '¿En la peor semana de quién podrías presentarte?',
   'Hazme el amigo que yo querría tener. Amén.',
   'Día cinco de Proverbios para el Hombre de Cada Día.'),
  ('42000000-0000-4000-8000-000000000206', 'en', 'published', 'The Way He Should Go',
   'The verse says his way, not your way — training reads the child in front of you rather than the one you imagined. Fathering is long, quiet attention.',
   'What have you noticed about the person your child actually is?',
   'Give me patience longer than my plans. Amen.',
   'Day six of Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000206', 'pt', 'published', 'No Caminho em que Deve Andar',
   'O texto diz o caminho dele, não o seu — instruir é ler a criança que está diante de você, não a que você imaginou. Ser pai é atenção longa e silenciosa.',
   'O que você tem notado sobre quem seu filho realmente é?',
   'Dá-me paciência maior que os meus planos. Amém.',
   'Dia seis de Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000206', 'es', 'published', 'En Su Camino',
   'El texto dice su camino, no el tuyo: instruir es leer al hijo que tienes delante, no al que imaginaste. Ser padre es atención larga y callada.',
   '¿Qué has notado sobre quién es realmente tu hijo?',
   'Dame paciencia más larga que mis planes. Amén.',
   'Día seis de Proverbios para el Hombre de Cada Día.'),
  ('42000000-0000-4000-8000-000000000207', 'en', 'published', 'Iron Sharpens Iron',
   'Sharpening makes a sound, and it removes something. A friendship that never costs you a comfortable opinion has never sharpened anything.',
   'Who is allowed to tell you the truth?',
   'Give me one friend who will not flatter me. Amen.',
   'You finished Proverbs for the Everyday Man.'),
  ('42000000-0000-4000-8000-000000000207', 'pt', 'published', 'Ferro com Ferro',
   'Afiar faz barulho, e tira alguma coisa. Uma amizade que nunca lhe custou uma opinião confortável nunca afiou nada.',
   'Quem tem permissão para lhe dizer a verdade?',
   'Dá-me um amigo que não me lisonjeie. Amém.',
   'Você concluiu Provérbios para o Homem Comum.'),
  ('42000000-0000-4000-8000-000000000207', 'es', 'published', 'Hierro con Hierro',
   'Afilar hace ruido, y quita algo. Una amistad que nunca te ha costado una opinión cómoda nunca ha afilado nada.',
   '¿Quién tiene permiso para decirte la verdad?',
   'Dame un amigo que no me adule. Amén.',
   'Terminaste Proverbios para el Hombre de Cada Día.')
on conflict (journey_id, language_code) do nothing;

insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000201', s.id, 'PRO', 4, 23, 23, 'Proverbs 4:23',
  'Keep your heart with all diligence, for out of it is the wellspring of life.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000202', s.id, 'PRO', 10, 19, 19, 'Proverbs 10:19',
  'In the multitude of words there is no lack of disobedience, but he who restrains his lips does wisely.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000203', s.id, 'PRO', 11, 3, 3, 'Proverbs 11:3',
  'The integrity of the upright shall guide them, but the perverseness of the treacherous shall destroy them.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000204', s.id, 'PRO', 13, 20, 20, 'Proverbs 13:20',
  'One who walks with wise men grows wise, but a companion of fools suffers harm.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000205', s.id, 'PRO', 17, 17, 17, 'Proverbs 17:17',
  'A friend loves at all times; and a brother is born for adversity.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000206', s.id, 'PRO', 22, 6, 6, 'Proverbs 22:6',
  'Train up a child in the way he should go, and when he is old he will not depart from it.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select '42000000-0000-4000-8000-000000000207', s.id, 'PRO', 27, 17, 17, 'Proverbs 27:17',
  'Iron sharpens iron; so a man sharpens his friend''s countenance.', 0
from public.scripture_sources s where s.translation_code = 'WEB'
on conflict do nothing;

insert into public.journey_words (id, journey_id, position, is_required, min_difficulty) values
  ('42000000-0000-4000-8000-010100000000', '42000000-0000-4000-8000-000000000201', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-010200000000', '42000000-0000-4000-8000-000000000201', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-010300000000', '42000000-0000-4000-8000-000000000201', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-010400000000', '42000000-0000-4000-8000-000000000201', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-010500000000', '42000000-0000-4000-8000-000000000201', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-010600000000', '42000000-0000-4000-8000-000000000201', 5, true, 'challenging'),
  ('42000000-0000-4000-8000-020100000000', '42000000-0000-4000-8000-000000000202', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-020200000000', '42000000-0000-4000-8000-000000000202', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-020300000000', '42000000-0000-4000-8000-000000000202', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-020400000000', '42000000-0000-4000-8000-000000000202', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-020500000000', '42000000-0000-4000-8000-000000000202', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-020600000000', '42000000-0000-4000-8000-000000000202', 5, true, 'challenging'),
  ('42000000-0000-4000-8000-030100000000', '42000000-0000-4000-8000-000000000203', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-030200000000', '42000000-0000-4000-8000-000000000203', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-030300000000', '42000000-0000-4000-8000-000000000203', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-030400000000', '42000000-0000-4000-8000-000000000203', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-030500000000', '42000000-0000-4000-8000-000000000203', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-030600000000', '42000000-0000-4000-8000-000000000203', 5, true, 'challenging'),
  ('42000000-0000-4000-8000-040100000000', '42000000-0000-4000-8000-000000000204', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-040200000000', '42000000-0000-4000-8000-000000000204', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-040300000000', '42000000-0000-4000-8000-000000000204', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-040400000000', '42000000-0000-4000-8000-000000000204', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-040500000000', '42000000-0000-4000-8000-000000000204', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-040600000000', '42000000-0000-4000-8000-000000000204', 5, true, 'challenging'),
  ('42000000-0000-4000-8000-050100000000', '42000000-0000-4000-8000-000000000205', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-050200000000', '42000000-0000-4000-8000-000000000205', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-050300000000', '42000000-0000-4000-8000-000000000205', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-050400000000', '42000000-0000-4000-8000-000000000205', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-050500000000', '42000000-0000-4000-8000-000000000205', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-050600000000', '42000000-0000-4000-8000-000000000205', 5, true, 'challenging'),
  ('42000000-0000-4000-8000-060100000000', '42000000-0000-4000-8000-000000000206', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-060200000000', '42000000-0000-4000-8000-000000000206', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-060300000000', '42000000-0000-4000-8000-000000000206', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-060400000000', '42000000-0000-4000-8000-000000000206', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-060500000000', '42000000-0000-4000-8000-000000000206', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-060600000000', '42000000-0000-4000-8000-000000000206', 5, true, 'challenging'),
  ('42000000-0000-4000-8000-070100000000', '42000000-0000-4000-8000-000000000207', 0, true, 'gentle'),
  ('42000000-0000-4000-8000-070200000000', '42000000-0000-4000-8000-000000000207', 1, true, 'gentle'),
  ('42000000-0000-4000-8000-070300000000', '42000000-0000-4000-8000-000000000207', 2, true, 'gentle'),
  ('42000000-0000-4000-8000-070400000000', '42000000-0000-4000-8000-000000000207', 3, true, 'gentle'),
  ('42000000-0000-4000-8000-070500000000', '42000000-0000-4000-8000-000000000207', 4, true, 'balanced'),
  ('42000000-0000-4000-8000-070600000000', '42000000-0000-4000-8000-000000000207', 5, true, 'challenging')
on conflict (id) do nothing;

insert into public.journey_word_translations
  (journey_word_id, journey_id, language_code, status, display_value, normalized_value)
values
  ('42000000-0000-4000-8000-010100000000', '42000000-0000-4000-8000-000000000201', 'en', 'published', 'GUARD', 'GUARD'),
  ('42000000-0000-4000-8000-010100000000', '42000000-0000-4000-8000-000000000201', 'pt', 'published', 'GUARDAR', 'GUARDAR'),
  ('42000000-0000-4000-8000-010100000000', '42000000-0000-4000-8000-000000000201', 'es', 'published', 'GUARDAR', 'GUARDAR'),
  ('42000000-0000-4000-8000-010200000000', '42000000-0000-4000-8000-000000000201', 'en', 'published', 'HEART', 'HEART'),
  ('42000000-0000-4000-8000-010200000000', '42000000-0000-4000-8000-000000000201', 'pt', 'published', 'CORAÇÃO', 'CORACAO'),
  ('42000000-0000-4000-8000-010200000000', '42000000-0000-4000-8000-000000000201', 'es', 'published', 'CORAZÓN', 'CORAZON'),
  ('42000000-0000-4000-8000-010300000000', '42000000-0000-4000-8000-000000000201', 'en', 'published', 'SPRING', 'SPRING'),
  ('42000000-0000-4000-8000-010300000000', '42000000-0000-4000-8000-000000000201', 'pt', 'published', 'FONTE', 'FONTE'),
  ('42000000-0000-4000-8000-010300000000', '42000000-0000-4000-8000-000000000201', 'es', 'published', 'FUENTE', 'FUENTE'),
  ('42000000-0000-4000-8000-010400000000', '42000000-0000-4000-8000-000000000201', 'en', 'published', 'PATH', 'PATH'),
  ('42000000-0000-4000-8000-010400000000', '42000000-0000-4000-8000-000000000201', 'pt', 'published', 'CAMINHO', 'CAMINHO'),
  ('42000000-0000-4000-8000-010400000000', '42000000-0000-4000-8000-000000000201', 'es', 'published', 'SENDA', 'SENDA'),
  ('42000000-0000-4000-8000-010500000000', '42000000-0000-4000-8000-000000000201', 'en', 'published', 'STRAIGHT', 'STRAIGHT'),
  ('42000000-0000-4000-8000-010500000000', '42000000-0000-4000-8000-000000000201', 'pt', 'published', 'RETO', 'RETO'),
  ('42000000-0000-4000-8000-010500000000', '42000000-0000-4000-8000-000000000201', 'es', 'published', 'RECTO', 'RECTO'),
  ('42000000-0000-4000-8000-010600000000', '42000000-0000-4000-8000-000000000201', 'en', 'published', 'KEEP', 'KEEP'),
  ('42000000-0000-4000-8000-010600000000', '42000000-0000-4000-8000-000000000201', 'pt', 'published', 'MANTER', 'MANTER'),
  ('42000000-0000-4000-8000-010600000000', '42000000-0000-4000-8000-000000000201', 'es', 'published', 'MANTENER', 'MANTENER'),
  ('42000000-0000-4000-8000-020100000000', '42000000-0000-4000-8000-000000000202', 'en', 'published', 'WORDS', 'WORDS'),
  ('42000000-0000-4000-8000-020100000000', '42000000-0000-4000-8000-000000000202', 'pt', 'published', 'PALAVRAS', 'PALAVRAS'),
  ('42000000-0000-4000-8000-020100000000', '42000000-0000-4000-8000-000000000202', 'es', 'published', 'PALABRAS', 'PALABRAS'),
  ('42000000-0000-4000-8000-020200000000', '42000000-0000-4000-8000-000000000202', 'en', 'published', 'SILENCE', 'SILENCE'),
  ('42000000-0000-4000-8000-020200000000', '42000000-0000-4000-8000-000000000202', 'pt', 'published', 'SILÊNCIO', 'SILENCIO'),
  ('42000000-0000-4000-8000-020200000000', '42000000-0000-4000-8000-000000000202', 'es', 'published', 'SILENCIO', 'SILENCIO'),
  ('42000000-0000-4000-8000-020300000000', '42000000-0000-4000-8000-000000000202', 'en', 'published', 'TONGUE', 'TONGUE'),
  ('42000000-0000-4000-8000-020300000000', '42000000-0000-4000-8000-000000000202', 'pt', 'published', 'LÍNGUA', 'LINGUA'),
  ('42000000-0000-4000-8000-020300000000', '42000000-0000-4000-8000-000000000202', 'es', 'published', 'LENGUA', 'LENGUA'),
  ('42000000-0000-4000-8000-020400000000', '42000000-0000-4000-8000-000000000202', 'en', 'published', 'WISE', 'WISE'),
  ('42000000-0000-4000-8000-020400000000', '42000000-0000-4000-8000-000000000202', 'pt', 'published', 'SÁBIO', 'SABIO'),
  ('42000000-0000-4000-8000-020400000000', '42000000-0000-4000-8000-000000000202', 'es', 'published', 'SABIO', 'SABIO'),
  ('42000000-0000-4000-8000-020500000000', '42000000-0000-4000-8000-000000000202', 'en', 'published', 'LISTEN', 'LISTEN'),
  ('42000000-0000-4000-8000-020500000000', '42000000-0000-4000-8000-000000000202', 'pt', 'published', 'OUVIR', 'OUVIR'),
  ('42000000-0000-4000-8000-020500000000', '42000000-0000-4000-8000-000000000202', 'es', 'published', 'ESCUCHAR', 'ESCUCHAR'),
  ('42000000-0000-4000-8000-020600000000', '42000000-0000-4000-8000-000000000202', 'en', 'published', 'RESTRAIN', 'RESTRAIN'),
  ('42000000-0000-4000-8000-020600000000', '42000000-0000-4000-8000-000000000202', 'pt', 'published', 'CONTER', 'CONTER'),
  ('42000000-0000-4000-8000-020600000000', '42000000-0000-4000-8000-000000000202', 'es', 'published', 'REFRENAR', 'REFRENAR'),
  ('42000000-0000-4000-8000-030100000000', '42000000-0000-4000-8000-000000000203', 'en', 'published', 'INTEGRITY', 'INTEGRITY'),
  ('42000000-0000-4000-8000-030100000000', '42000000-0000-4000-8000-000000000203', 'pt', 'published', 'INTEGRIDADE', 'INTEGRIDADE'),
  ('42000000-0000-4000-8000-030100000000', '42000000-0000-4000-8000-000000000203', 'es', 'published', 'INTEGRIDAD', 'INTEGRIDAD'),
  ('42000000-0000-4000-8000-030200000000', '42000000-0000-4000-8000-000000000203', 'en', 'published', 'HONEST', 'HONEST'),
  ('42000000-0000-4000-8000-030200000000', '42000000-0000-4000-8000-000000000203', 'pt', 'published', 'HONESTO', 'HONESTO'),
  ('42000000-0000-4000-8000-030200000000', '42000000-0000-4000-8000-000000000203', 'es', 'published', 'HONESTO', 'HONESTO'),
  ('42000000-0000-4000-8000-030300000000', '42000000-0000-4000-8000-000000000203', 'en', 'published', 'SCALES', 'SCALES'),
  ('42000000-0000-4000-8000-030300000000', '42000000-0000-4000-8000-000000000203', 'pt', 'published', 'BALANÇA', 'BALANCA'),
  ('42000000-0000-4000-8000-030300000000', '42000000-0000-4000-8000-000000000203', 'es', 'published', 'BALANZA', 'BALANZA'),
  ('42000000-0000-4000-8000-030400000000', '42000000-0000-4000-8000-000000000203', 'en', 'published', 'GUIDE', 'GUIDE'),
  ('42000000-0000-4000-8000-030400000000', '42000000-0000-4000-8000-000000000203', 'pt', 'published', 'GUIAR', 'GUIAR'),
  ('42000000-0000-4000-8000-030400000000', '42000000-0000-4000-8000-000000000203', 'es', 'published', 'GUIAR', 'GUIAR'),
  ('42000000-0000-4000-8000-030500000000', '42000000-0000-4000-8000-000000000203', 'en', 'published', 'UPRIGHT', 'UPRIGHT'),
  ('42000000-0000-4000-8000-030500000000', '42000000-0000-4000-8000-000000000203', 'pt', 'published', 'RETO', 'RETO'),
  ('42000000-0000-4000-8000-030500000000', '42000000-0000-4000-8000-000000000203', 'es', 'published', 'RECTO', 'RECTO'),
  ('42000000-0000-4000-8000-030600000000', '42000000-0000-4000-8000-000000000203', 'en', 'published', 'WORK', 'WORK'),
  ('42000000-0000-4000-8000-030600000000', '42000000-0000-4000-8000-000000000203', 'pt', 'published', 'TRABALHO', 'TRABALHO'),
  ('42000000-0000-4000-8000-030600000000', '42000000-0000-4000-8000-000000000203', 'es', 'published', 'TRABAJO', 'TRABAJO'),
  ('42000000-0000-4000-8000-040100000000', '42000000-0000-4000-8000-000000000204', 'en', 'published', 'COMPANION', 'COMPANION'),
  ('42000000-0000-4000-8000-040100000000', '42000000-0000-4000-8000-000000000204', 'pt', 'published', 'COMPANHIA', 'COMPANHIA'),
  ('42000000-0000-4000-8000-040100000000', '42000000-0000-4000-8000-000000000204', 'es', 'published', 'COMPAÑÍA', 'COMPAÑIA'),
  ('42000000-0000-4000-8000-040200000000', '42000000-0000-4000-8000-000000000204', 'en', 'published', 'WISE', 'WISE'),
  ('42000000-0000-4000-8000-040200000000', '42000000-0000-4000-8000-000000000204', 'pt', 'published', 'SÁBIO', 'SABIO'),
  ('42000000-0000-4000-8000-040200000000', '42000000-0000-4000-8000-000000000204', 'es', 'published', 'SABIO', 'SABIO'),
  ('42000000-0000-4000-8000-040300000000', '42000000-0000-4000-8000-000000000204', 'en', 'published', 'WALK', 'WALK'),
  ('42000000-0000-4000-8000-040300000000', '42000000-0000-4000-8000-000000000204', 'pt', 'published', 'ANDAR', 'ANDAR'),
  ('42000000-0000-4000-8000-040300000000', '42000000-0000-4000-8000-000000000204', 'es', 'published', 'ANDAR', 'ANDAR'),
  ('42000000-0000-4000-8000-040400000000', '42000000-0000-4000-8000-000000000204', 'en', 'published', 'FRIEND', 'FRIEND'),
  ('42000000-0000-4000-8000-040400000000', '42000000-0000-4000-8000-000000000204', 'pt', 'published', 'AMIGO', 'AMIGO'),
  ('42000000-0000-4000-8000-040400000000', '42000000-0000-4000-8000-000000000204', 'es', 'published', 'AMIGO', 'AMIGO'),
  ('42000000-0000-4000-8000-040500000000', '42000000-0000-4000-8000-000000000204', 'en', 'published', 'GROW', 'GROW'),
  ('42000000-0000-4000-8000-040500000000', '42000000-0000-4000-8000-000000000204', 'pt', 'published', 'CRESCER', 'CRESCER'),
  ('42000000-0000-4000-8000-040500000000', '42000000-0000-4000-8000-000000000204', 'es', 'published', 'CRECER', 'CRECER'),
  ('42000000-0000-4000-8000-040600000000', '42000000-0000-4000-8000-000000000204', 'en', 'published', 'CHOOSE', 'CHOOSE'),
  ('42000000-0000-4000-8000-040600000000', '42000000-0000-4000-8000-000000000204', 'pt', 'published', 'ESCOLHER', 'ESCOLHER'),
  ('42000000-0000-4000-8000-040600000000', '42000000-0000-4000-8000-000000000204', 'es', 'published', 'ELEGIR', 'ELEGIR'),
  ('42000000-0000-4000-8000-050100000000', '42000000-0000-4000-8000-000000000205', 'en', 'published', 'FRIEND', 'FRIEND'),
  ('42000000-0000-4000-8000-050100000000', '42000000-0000-4000-8000-000000000205', 'pt', 'published', 'AMIGO', 'AMIGO'),
  ('42000000-0000-4000-8000-050100000000', '42000000-0000-4000-8000-000000000205', 'es', 'published', 'AMIGO', 'AMIGO'),
  ('42000000-0000-4000-8000-050200000000', '42000000-0000-4000-8000-000000000205', 'en', 'published', 'BROTHER', 'BROTHER'),
  ('42000000-0000-4000-8000-050200000000', '42000000-0000-4000-8000-000000000205', 'pt', 'published', 'IRMÃO', 'IRMAO'),
  ('42000000-0000-4000-8000-050200000000', '42000000-0000-4000-8000-000000000205', 'es', 'published', 'HERMANO', 'HERMANO'),
  ('42000000-0000-4000-8000-050300000000', '42000000-0000-4000-8000-000000000205', 'en', 'published', 'LOVES', 'LOVES'),
  ('42000000-0000-4000-8000-050300000000', '42000000-0000-4000-8000-000000000205', 'pt', 'published', 'AMA', 'AMA'),
  ('42000000-0000-4000-8000-050300000000', '42000000-0000-4000-8000-000000000205', 'es', 'published', 'AMA', 'AMA'),
  ('42000000-0000-4000-8000-050400000000', '42000000-0000-4000-8000-000000000205', 'en', 'published', 'TIMES', 'TIMES'),
  ('42000000-0000-4000-8000-050400000000', '42000000-0000-4000-8000-000000000205', 'pt', 'published', 'TEMPOS', 'TEMPOS'),
  ('42000000-0000-4000-8000-050400000000', '42000000-0000-4000-8000-000000000205', 'es', 'published', 'TIEMPOS', 'TIEMPOS'),
  ('42000000-0000-4000-8000-050500000000', '42000000-0000-4000-8000-000000000205', 'en', 'published', 'BORN', 'BORN'),
  ('42000000-0000-4000-8000-050500000000', '42000000-0000-4000-8000-000000000205', 'pt', 'published', 'NASCEU', 'NASCEU'),
  ('42000000-0000-4000-8000-050500000000', '42000000-0000-4000-8000-000000000205', 'es', 'published', 'NACIÓ', 'NACIO'),
  ('42000000-0000-4000-8000-050600000000', '42000000-0000-4000-8000-000000000205', 'en', 'published', 'STAND', 'STAND'),
  ('42000000-0000-4000-8000-050600000000', '42000000-0000-4000-8000-000000000205', 'pt', 'published', 'FIRMAR', 'FIRMAR'),
  ('42000000-0000-4000-8000-050600000000', '42000000-0000-4000-8000-000000000205', 'es', 'published', 'SOSTENER', 'SOSTENER'),
  ('42000000-0000-4000-8000-060100000000', '42000000-0000-4000-8000-000000000206', 'en', 'published', 'TRAIN', 'TRAIN'),
  ('42000000-0000-4000-8000-060100000000', '42000000-0000-4000-8000-000000000206', 'pt', 'published', 'INSTRUIR', 'INSTRUIR'),
  ('42000000-0000-4000-8000-060100000000', '42000000-0000-4000-8000-000000000206', 'es', 'published', 'INSTRUIR', 'INSTRUIR'),
  ('42000000-0000-4000-8000-060200000000', '42000000-0000-4000-8000-000000000206', 'en', 'published', 'CHILD', 'CHILD'),
  ('42000000-0000-4000-8000-060200000000', '42000000-0000-4000-8000-000000000206', 'pt', 'published', 'FILHO', 'FILHO'),
  ('42000000-0000-4000-8000-060200000000', '42000000-0000-4000-8000-000000000206', 'es', 'published', 'HIJO', 'HIJO'),
  ('42000000-0000-4000-8000-060300000000', '42000000-0000-4000-8000-000000000206', 'en', 'published', 'WAY', 'WAY'),
  ('42000000-0000-4000-8000-060300000000', '42000000-0000-4000-8000-000000000206', 'pt', 'published', 'CAMINHO', 'CAMINHO'),
  ('42000000-0000-4000-8000-060300000000', '42000000-0000-4000-8000-000000000206', 'es', 'published', 'CAMINO', 'CAMINO'),
  ('42000000-0000-4000-8000-060400000000', '42000000-0000-4000-8000-000000000206', 'en', 'published', 'DEPART', 'DEPART'),
  ('42000000-0000-4000-8000-060400000000', '42000000-0000-4000-8000-000000000206', 'pt', 'published', 'DESVIAR', 'DESVIAR'),
  ('42000000-0000-4000-8000-060400000000', '42000000-0000-4000-8000-000000000206', 'es', 'published', 'APARTAR', 'APARTAR'),
  ('42000000-0000-4000-8000-060500000000', '42000000-0000-4000-8000-000000000206', 'en', 'published', 'FATHER', 'FATHER'),
  ('42000000-0000-4000-8000-060500000000', '42000000-0000-4000-8000-000000000206', 'pt', 'published', 'PAI', 'PAI'),
  ('42000000-0000-4000-8000-060500000000', '42000000-0000-4000-8000-000000000206', 'es', 'published', 'PADRE', 'PADRE'),
  ('42000000-0000-4000-8000-060600000000', '42000000-0000-4000-8000-000000000206', 'en', 'published', 'PATIENCE', 'PATIENCE'),
  ('42000000-0000-4000-8000-060600000000', '42000000-0000-4000-8000-000000000206', 'pt', 'published', 'PACIÊNCIA', 'PACIENCIA'),
  ('42000000-0000-4000-8000-060600000000', '42000000-0000-4000-8000-000000000206', 'es', 'published', 'PACIENCIA', 'PACIENCIA'),
  ('42000000-0000-4000-8000-070100000000', '42000000-0000-4000-8000-000000000207', 'en', 'published', 'IRON', 'IRON'),
  ('42000000-0000-4000-8000-070100000000', '42000000-0000-4000-8000-000000000207', 'pt', 'published', 'FERRO', 'FERRO'),
  ('42000000-0000-4000-8000-070100000000', '42000000-0000-4000-8000-000000000207', 'es', 'published', 'HIERRO', 'HIERRO'),
  ('42000000-0000-4000-8000-070200000000', '42000000-0000-4000-8000-000000000207', 'en', 'published', 'SHARPEN', 'SHARPEN'),
  ('42000000-0000-4000-8000-070200000000', '42000000-0000-4000-8000-000000000207', 'pt', 'published', 'AFIAR', 'AFIAR'),
  ('42000000-0000-4000-8000-070200000000', '42000000-0000-4000-8000-000000000207', 'es', 'published', 'AFILAR', 'AFILAR'),
  ('42000000-0000-4000-8000-070300000000', '42000000-0000-4000-8000-000000000207', 'en', 'published', 'FRIEND', 'FRIEND'),
  ('42000000-0000-4000-8000-070300000000', '42000000-0000-4000-8000-000000000207', 'pt', 'published', 'AMIGO', 'AMIGO'),
  ('42000000-0000-4000-8000-070300000000', '42000000-0000-4000-8000-000000000207', 'es', 'published', 'AMIGO', 'AMIGO'),
  ('42000000-0000-4000-8000-070400000000', '42000000-0000-4000-8000-000000000207', 'en', 'published', 'EDGE', 'EDGE'),
  ('42000000-0000-4000-8000-070400000000', '42000000-0000-4000-8000-000000000207', 'pt', 'published', 'FIO', 'FIO'),
  ('42000000-0000-4000-8000-070400000000', '42000000-0000-4000-8000-000000000207', 'es', 'published', 'FILO', 'FILO'),
  ('42000000-0000-4000-8000-070500000000', '42000000-0000-4000-8000-000000000207', 'en', 'published', 'TRUTH', 'TRUTH'),
  ('42000000-0000-4000-8000-070500000000', '42000000-0000-4000-8000-000000000207', 'pt', 'published', 'VERDADE', 'VERDADE'),
  ('42000000-0000-4000-8000-070500000000', '42000000-0000-4000-8000-000000000207', 'es', 'published', 'VERDAD', 'VERDAD'),
  ('42000000-0000-4000-8000-070600000000', '42000000-0000-4000-8000-000000000207', 'en', 'published', 'GROW', 'GROW'),
  ('42000000-0000-4000-8000-070600000000', '42000000-0000-4000-8000-000000000207', 'pt', 'published', 'CRESCER', 'CRESCER'),
  ('42000000-0000-4000-8000-070600000000', '42000000-0000-4000-8000-000000000207', 'es', 'published', 'CRECER', 'CRECER')
on conflict (journey_word_id, language_code) do nothing;

commit;
