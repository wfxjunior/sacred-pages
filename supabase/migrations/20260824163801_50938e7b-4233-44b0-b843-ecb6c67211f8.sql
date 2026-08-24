with v(slug, lang, display, txt) as (values
('deborah-under-the-palm','pt','Juízes 4:4-5','E Débora, mulher profetisa, julgava a Israel naquele tempo. Ela habitava debaixo da palmeira de Débora, e os filhos de Israel subiam a ela a juízo.'),
('deborah-under-the-palm','es','Jueces 4:4-5','Gobernaba en aquel tiempo a Israel una mujer, Débora, profetisa. Ella habitaba debajo de la palmera de Débora, y los hijos de Israel subían a ella a juicio.'),
('esther-for-such-a-time','pt','Ester 4:14','Quem sabe se para tal tempo como este não chegaste ao reino?'),
('esther-for-such-a-time','es','Ester 4:14','¿Quién sabe si para esta hora has llegado al reino?'),
('hannah-poured-out','pt','1 Samuel 1:27','Por este menino orava eu; e o Senhor me concedeu a petição que eu lhe tinha pedido.'),
('hannah-poured-out','es','1 Samuel 1:27','Por este niño oraba, y Jehová me dio lo que le pedí.'),
('john-10-good-shepherd','pt','João 10:11','Eu sou o bom Pastor; o bom Pastor dá a sua vida pelas ovelhas.'),
('john-10-good-shepherd','es','Juan 10:11','Yo soy el buen pastor; el buen pastor su vida da por las ovejas.'),
('john-6-bread-of-life','pt','João 6:35','Jesus lhes disse: Eu sou o pão da vida; aquele que vem a mim não terá fome, e quem crê em mim nunca terá sede.'),
('john-6-bread-of-life','es','Juan 6:35','Jesús les dijo: Yo soy el pan de vida; el que a mí viene, nunca tendrá hambre; y el que en mí cree, no tendrá sed jamás.'),
('lydia-an-open-home','pt','Atos 16:14-15','O Senhor lhe abriu o coração para estar atenta ao que Paulo dizia. E rogou-nos, dizendo: Entrai em minha casa e ficai.'),
('lydia-an-open-home','es','Hechos 16:14-15','El Señor le abrió el corazón para que estuviese atenta a lo que Pablo decía. Y nos rogó, diciendo: Entrad en mi casa, y posad.'),
('magdalene-in-the-garden','pt','João 20:16','Disse-lhe Jesus: Maria! Ela, voltando-se, disse-lhe: Raboni! (que quer dizer Mestre).'),
('magdalene-in-the-garden','es','Juan 20:16','Jesús le dijo: ¡María! Volviéndose ella, le dijo: ¡Raboni! (que quiere decir, Maestro).'),
('mary-let-it-be','pt','Lucas 1:38','Disse Maria: Eis aqui a serva do Senhor; cumpra-se em mim segundo a tua palavra.'),
('mary-let-it-be','es','Lucas 1:38','Entonces María dijo: He aquí la sierva del Señor; hágase conmigo conforme a tu palabra.'),
('matthew-5-beatitudes','pt','Mateus 5:3-6','Bem-aventurados os pobres de espírito, porque deles é o Reino dos céus. Bem-aventurados os que choram, porque eles serão consolados. Bem-aventurados os mansos, porque eles herdarão a terra. Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos.'),
('matthew-5-beatitudes','es','Mateo 5:3-6','Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos. Bienaventurados los que lloran, porque ellos recibirán consolación. Bienaventurados los mansos, porque ellos recibirán la tierra por heredad. Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados.'),
('proverbs-10-fewer-words','pt','Provérbios 10:19','Na multidão de palavras não falta transgressão, mas o que guarda os seus lábios é prudente.'),
('proverbs-10-fewer-words','es','Proverbios 10:19','En las muchas palabras no falta pecado; mas el que refrena sus labios es prudente.'),
('proverbs-11-honest-scales','pt','Provérbios 11:3','A integridade dos retos os guiará, mas a perversidade dos pérfidos os destruirá.'),
('proverbs-11-honest-scales','es','Proverbios 11:3','La integridad de los rectos los encaminará; pero la perversidad de los pecadores los destruirá.'),
('proverbs-13-the-company','pt','Provérbios 13:20','O que anda com os sábios torna-se sábio, mas o companheiro dos insensatos sofrerá o mal.'),
('proverbs-13-the-company','es','Proverbios 13:20','El que anda con sabios, sabio será; mas el que se junta con necios, será quebrantado.'),
('proverbs-15-words-that-heal','pt','Provérbios 15:1','A resposta branda desvia o furor, mas a palavra dura suscita a ira.'),
('proverbs-15-words-that-heal','es','Proverbios 15:1','La blanda respuesta quita la ira; mas la palabra áspera hace subir el furor.'),
('proverbs-16-diligent-hand','pt','Provérbios 16:3','Confia ao Senhor as tuas obras, e os teus pensamentos serão estabelecidos.'),
('proverbs-16-diligent-hand','es','Proverbios 16:3','Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.'),
('proverbs-17-a-friend-loves','pt','Provérbios 17:17','O amigo ama em todo o tempo, e o irmão nasce para a angústia.'),
('proverbs-17-a-friend-loves','es','Proverbios 17:17','En todo tiempo ama el amigo; y el hermano nace para el tiempo de angustia.'),
('proverbs-22-train-a-child','pt','Provérbios 22:6','Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele.'),
('proverbs-22-train-a-child','es','Proverbios 22:6','Instruye al niño en su camino; y aun cuando fuere viejo no se apartará de él.'),
('proverbs-27-iron-sharpens','pt','Provérbios 27:17','Como o ferro afia o ferro, assim o homem afia o rosto do seu amigo.'),
('proverbs-27-iron-sharpens','es','Proverbios 27:17','Hierro con hierro se aguza; y el hombre aguza el rostro de su amigo.'),
('proverbs-3-trust-lean-not','pt','Provérbios 3:5-6','Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.'),
('proverbs-3-trust-lean-not','es','Proverbios 3:5-6','Fíate de Jehová de todo tu corazón, y no estribes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.'),
('proverbs-4-guard-your-heart','pt','Provérbios 4:23','Sobre tudo o que se deve guardar, guarda o teu coração, porque dele procede a vida.'),
('proverbs-4-guard-your-heart','es','Proverbios 4:23','Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.'),
('psalm-121-lifting-my-eyes','pt','Salmo 121:1-2','Elevo os meus olhos para os montes; de onde me vem o socorro? O meu socorro vem do Senhor, que fez o céu e a terra.'),
('psalm-121-lifting-my-eyes','es','Salmo 121:1-2','Alzaré mis ojos a los montes, ¿de dónde vendrá mi socorro? Mi socorro viene de Jehová, que hizo los cielos y la tierra.'),
('psalm-23-the-shepherd','pt','Salmo 23:1-3','O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma.'),
('psalm-23-the-shepherd','es','Salmo 23:1-3','Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará. Confortará mi alma.'),
('psalm-46-present-help','pt','Salmo 46:1','Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.'),
('psalm-46-present-help','es','Salmo 46:1','Dios es nuestro amparo y fortaleza; nuestro pronto auxilio en las tribulaciones.'),
('ruth-where-you-go','pt','Rute 1:16','Onde tu fores, irei eu; e onde pousares, ali pousarei; o teu povo é o meu povo, e o teu Deus é o meu Deus.'),
('ruth-where-you-go','es','Rut 1:16','A dondequiera que tú fueres, iré yo; y dondequiera que vivieres, viviré. Tu pueblo será mi pueblo, y tu Dios mi Dios.')
)
insert into public.scripture_references
  (journey_id, source_id, book_code, chapter, verse_start, verse_end, display_reference, stored_text, position)
select en.journey_id, src.id, en.book_code, en.chapter, en.verse_start, en.verse_end, v.display, v.txt, en.position
from v
join public.journeys j on j.slug = v.slug
join public.scripture_references en
  on en.journey_id = j.id
 and en.source_id = (select id from public.scripture_sources where language_code = 'en' limit 1)
join public.scripture_sources src on src.language_code = v.lang
where not exists (
  select 1 from public.scripture_references x
  where x.journey_id = j.id and x.source_id = src.id
);