import type { GameLocale } from "@/lib/games";
import type { VersePassage } from "./types";

// The curated memorization set — World English Bible, public domain, the same
// translation the journeys use ("Yahweh" and all). The day's real journey
// verse joins this pool at the front when one is available; these keep the
// mode rich when it is not. Per-locale slots mirror the other modes and fall
// back to English until translated sets ship.

const EN_VERSES: readonly VersePassage[] = [
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
  },
  {
    reference: "Psalm 23:1",
    text: "Yahweh is my shepherd; I shall lack nothing.",
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
  },
  {
    reference: "Psalm 119:105",
    text: "Your word is a lamp to my feet, and a light for my path.",
  },
  {
    reference: "Romans 8:28",
    text: "We know that all things work together for good for those who love God, for those who are called according to his purpose.",
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first God's Kingdom and his righteousness; and all these things will be given to you as well.",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
  },
  {
    reference: "Psalm 27:1",
    text: "Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?",
  },
  {
    reference: "Isaiah 41:10",
    text: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God. I will strengthen you. Yes, I will help you.",
  },
  {
    reference: "John 14:6",
    text: "Jesus said to him, I am the way, the truth, and the life. No one comes to the Father, except through me.",
  },
  {
    reference: "Romans 12:2",
    text: "Don't be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God.",
  },
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.",
  },
  {
    reference: "Ephesians 2:8",
    text: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God.",
  },
  {
    reference: "Hebrews 11:1",
    text: "Now faith is assurance of things hoped for, proof of things not seen.",
  },
  {
    reference: "Lamentations 3:22-23",
    text: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail. They are new every morning. Great is your faithfulness.",
  },
  {
    reference: "Psalm 118:24",
    text: "This is the day that Yahweh has made. We will rejoice and be glad in it!",
  },
];

// Portuguese: João Ferreira de Almeida (public domain).
const PT_VERSES: readonly VersePassage[] = [
  {
    reference: "João 3:16",
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
  },
  { reference: "Salmos 23:1", text: "O Senhor é o meu pastor; nada me faltará." },
  {
    reference: "Provérbios 3:5",
    text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.",
  },
  { reference: "Filipenses 4:13", text: "Posso todas as coisas em Cristo que me fortalece." },
  {
    reference: "Salmos 119:105",
    text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
  },
  {
    reference: "Romanos 8:28",
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
  },
  {
    reference: "Mateus 6:33",
    text: "Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
  },
  { reference: "Salmos 46:10", text: "Aquietai-vos, e sabei que eu sou Deus." },
  {
    reference: "Josué 1:9",
    text: "Esforça-te, e tem bom ânimo; não temas, nem te espantes, porque o Senhor teu Deus é contigo, por onde quer que andares.",
  },
  {
    reference: "Isaías 40:31",
    text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.",
  },
  {
    reference: "Mateus 11:28",
    text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
  },
  {
    reference: "Salmos 27:1",
    text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?",
  },
  {
    reference: "Isaías 41:10",
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
  },
  {
    reference: "João 14:6",
    text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida; ninguém vem ao Pai, senão por mim.",
  },
  {
    reference: "Romanos 12:2",
    text: "E não vos conformeis com este mundo, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.",
  },
  {
    reference: "2 Coríntios 5:17",
    text: "Assim que, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.",
  },
  {
    reference: "Efésios 2:8",
    text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.",
  },
  {
    reference: "Hebreus 11:1",
    text: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.",
  },
  {
    reference: "Lamentações 3:22-23",
    text: "As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.",
  },
  {
    reference: "Salmos 118:24",
    text: "Este é o dia que fez o Senhor; regozijemo-nos, e alegremo-nos nele.",
  },
];

// Spanish: Reina-Valera 1909 (public domain).
const ES_VERSES: readonly VersePassage[] = [
  {
    reference: "Juan 3:16",
    text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
  },
  { reference: "Salmos 23:1", text: "Jehová es mi pastor; nada me faltará." },
  {
    reference: "Proverbios 3:5",
    text: "Fíate de Jehová de todo tu corazón, y no estribes en tu propia prudencia.",
  },
  { reference: "Filipenses 4:13", text: "Todo lo puedo en Cristo que me fortalece." },
  {
    reference: "Salmos 119:105",
    text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
  },
  {
    reference: "Romanos 8:28",
    text: "Y sabemos que a los que a Dios aman, todas las cosas les ayudan a bien, es a saber, a los que conforme al propósito son llamados.",
  },
  {
    reference: "Mateo 6:33",
    text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
  },
  { reference: "Salmos 46:10", text: "Estad quietos, y conoced que yo soy Dios." },
  {
    reference: "Josué 1:9",
    text: "Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios será contigo en dondequiera que anduvieres.",
  },
  {
    reference: "Isaías 40:31",
    text: "Mas los que esperan a Jehová tendrán nuevas fuerzas; levantarán las alas como águilas, correrán, y no se cansarán, caminarán, y no se fatigarán.",
  },
  {
    reference: "Mateo 11:28",
    text: "Venid a mí todos los que estáis trabajados y cargados, que yo os haré descansar.",
  },
  {
    reference: "Salmos 118:24",
    text: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.",
  },
  {
    reference: "Salmos 27:1",
    text: "Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?",
  },
  {
    reference: "Juan 14:6",
    text: "Jesús le dice: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.",
  },
  {
    reference: "Romanos 12:2",
    text: "Y no os conforméis a este siglo; mas reformaos por la renovación de vuestro entendimiento, para que experimentéis cuál sea la buena voluntad de Dios, agradable y perfecta.",
  },
  {
    reference: "2 Corintios 5:17",
    text: "De modo que si alguno está en Cristo, nueva criatura es: las cosas viejas pasaron; he aquí todas son hechas nuevas.",
  },
  {
    reference: "Efesios 2:8",
    text: "Porque por gracia sois salvos por la fe; y esto no de vosotros, pues es don de Dios.",
  },
  {
    reference: "Hebreos 11:1",
    text: "Es pues la fe la sustancia de las cosas que se esperan, la demostración de las cosas que no se ven.",
  },
  {
    reference: "Lamentaciones 3:22-23",
    text: "Es por la misericordia de Jehová que no somos consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.",
  },
  {
    reference: "Isaías 41:10",
    text: "No temas, que yo soy contigo; no desmayes, que yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.",
  },
];

const VERSES_BY_LOCALE: Record<GameLocale, readonly VersePassage[]> = {
  en: EN_VERSES,
  pt: PT_VERSES,
  es: ES_VERSES,
};

export function finishVersePassagesForLocale(locale: GameLocale): readonly VersePassage[] {
  const set = VERSES_BY_LOCALE[locale];
  return set.length > 0 ? set : VERSES_BY_LOCALE.en;
}
