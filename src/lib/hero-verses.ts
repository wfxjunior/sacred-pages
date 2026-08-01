/**
 * Hero verse rotation.
 *
 * The landing verse changes every two days. The index is derived from the UTC
 * day number so server render and client hydration always agree (a local-time
 * or random pick would mismatch across timezones and cause hydration warnings).
 */
export type Locale = "en" | "pt" | "es";

type Verse = {
  ref: Record<Locale, string>;
  text: Record<Locale, string>;
};

export const HERO_VERSES: Verse[] = [
  {
    ref: { en: "Psalm 119:105", pt: "Salmos 119:105", es: "Salmos 119:105" },
    text: {
      en: "Your word is a lamp for my feet, a light on my path.",
      pt: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
      es: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
    },
  },
  {
    ref: { en: "Isaiah 40:31", pt: "Isaías 40:31", es: "Isaías 40:31" },
    text: {
      en: "Those who hope in the Lord will renew their strength.",
      pt: "Os que esperam no Senhor renovarão as suas forças.",
      es: "Los que esperan en el Señor renovarán sus fuerzas.",
    },
  },
  {
    ref: { en: "Matthew 11:28", pt: "Mateus 11:28", es: "Mateo 11:28" },
    text: {
      en: "Come to me, all you who are weary, and I will give you rest.",
      pt: "Vinde a mim todos os que estais cansados, e eu vos aliviarei.",
      es: "Venid a mí todos los que estáis cansados, y yo os haré descansar.",
    },
  },
  {
    ref: { en: "Proverbs 3:5", pt: "Provérbios 3:5", es: "Proverbios 3:5" },
    text: {
      en: "Trust in the Lord with all your heart, and lean not on your own understanding.",
      pt: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",
      es: "Confía en el Señor de todo tu corazón, y no te apoyes en tu propia prudencia.",
    },
  },
  {
    ref: { en: "Joshua 1:9", pt: "Josué 1:9", es: "Josué 1:9" },
    text: {
      en: "Be strong and courageous; the Lord your God is with you wherever you go.",
      pt: "Sê forte e corajoso; o Senhor, teu Deus, é contigo por onde quer que andares.",
      es: "Esfuérzate y sé valiente; el Señor tu Dios estará contigo dondequiera que vayas.",
    },
  },
  {
    ref: { en: "Psalm 46:10", pt: "Salmos 46:10", es: "Salmos 46:10" },
    text: {
      en: "Be still, and know that I am God.",
      pt: "Aquietai-vos e sabei que eu sou Deus.",
      es: "Estad quietos, y conoced que yo soy Dios.",
    },
  },
  {
    ref: { en: "Lamentations 3:23", pt: "Lamentações 3:23", es: "Lamentaciones 3:23" },
    text: {
      en: "His mercies are new every morning; great is your faithfulness.",
      pt: "As suas misericórdias se renovam cada manhã; grande é a tua fidelidade.",
      es: "Nuevas son cada mañana sus misericordias; grande es tu fidelidad.",
    },
  },
  {
    ref: { en: "Philippians 4:6", pt: "Filipenses 4:6", es: "Filipenses 4:6" },
    text: {
      en: "Do not be anxious about anything, but in every situation present your requests to God.",
      pt: "Não andeis ansiosos por coisa alguma; em tudo apresentai os vossos pedidos a Deus.",
      es: "Por nada estéis afanosos; presentad vuestras peticiones delante de Dios.",
    },
  },
];

/** Index of the verse for a given moment, advancing once every two UTC days. */
export function heroVerseIndex(now: Date = new Date()): number {
  const utcDay = Math.floor(now.getTime() / 86_400_000);
  return Math.floor(utcDay / 2) % HERO_VERSES.length;
}

export function getHeroVerse(locale: string, now?: Date) {
  const l: Locale = locale === "pt" || locale === "es" ? locale : "en";
  const v = HERO_VERSES[heroVerseIndex(now)]!;
  return { ref: v.ref[l], text: v.text[l] };
}
