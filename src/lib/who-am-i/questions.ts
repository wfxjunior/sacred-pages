import type { GameLocale } from "@/lib/games";
import type { WhoAmIQuestion } from "./types";

// Development content only — typed, local, deliberately not wired to Supabase.
// Same per-locale structure as Word Guess: pt/es slots exist and fall back to
// English until translated sets ship. Clues run vaguest → most revealing.

const EN_QUESTIONS: readonly WhoAmIQuestion[] = [
  {
    id: "wai-en-moses",
    locale: "en",
    clues: [
      "I was hidden in a basket as a baby.",
      "I grew up in a palace that was not my people's.",
      "I saw a bush that burned without burning up.",
      "I raised my staff and the sea opened before Israel.",
    ],
    answer: "MOSES",
    distractors: ["AARON", "JOSHUA", "ABRAHAM", "JACOB", "SAMUEL"],
    scriptureReference: "Exodus 3:1–12",
    explanation:
      "Moses was drawn from the Nile, called at the burning bush, and led Israel out of Egypt.",
    difficulty: "gentle",
    category: "people",
  },
  {
    id: "wai-en-noah",
    locale: "en",
    clues: [
      "People laughed while I worked for years.",
      "I built something enormous far from any sea.",
      "Animals came to me two by two.",
      "A dove brought me an olive leaf.",
    ],
    answer: "NOAH",
    distractors: ["ADAM", "ENOCH", "ABRAHAM", "LOT", "SETH"],
    scriptureReference: "Genesis 6–9",
    explanation: "Noah built the ark in faith and carried his family through the flood.",
    difficulty: "gentle",
    category: "people",
  },
  {
    id: "wai-en-david",
    locale: "en",
    clues: [
      "I was the youngest of eight brothers.",
      "I wrote songs while watching sheep.",
      "A king threw a spear at me while I played the harp.",
      "I felled a giant with a single stone.",
    ],
    answer: "DAVID",
    distractors: ["SAUL", "SOLOMON", "JONATHAN", "SAMSON", "GIDEON"],
    scriptureReference: "1 Samuel 17",
    explanation: "David, the shepherd of Bethlehem, became Israel's psalmist king.",
    difficulty: "gentle",
    category: "people",
  },
  {
    id: "wai-en-mary",
    locale: "en",
    clues: [
      "An angel called me highly favoured.",
      "I treasured certain things quietly in my heart.",
      "I laid my firstborn in a manger.",
      "I stood near the cross when most had fled.",
    ],
    answer: "MARY",
    distractors: ["ELIZABETH", "MARTHA", "RUTH", "HANNAH", "SARAH"],
    scriptureReference: "Luke 1:26–38",
    explanation:
      "Mary of Nazareth received the angel's word with faith and became the mother of Jesus.",
    difficulty: "gentle",
    category: "people",
  },
  {
    id: "wai-en-peter",
    locale: "en",
    clues: [
      "I worked with nets before I was called.",
      "I once walked on water — briefly.",
      "A rooster's crow broke my heart.",
      "Jesus asked me three times if I loved him.",
    ],
    answer: "PETER",
    acceptedAnswers: ["SIMON", "SIMON PETER", "CEPHAS"],
    distractors: ["ANDREW", "JAMES", "JOHN", "THOMAS", "PHILIP"],
    scriptureReference: "John 21:15–19",
    explanation:
      "Simon Peter, the fisherman, denied his Lord three times and was restored three times.",
    difficulty: "balanced",
    category: "people",
  },
  {
    id: "wai-en-jonah",
    locale: "en",
    clues: [
      "I bought a ticket in the opposite direction.",
      "A storm stopped because I went overboard.",
      "I prayed from a very unusual place for three days.",
      "A plant withered and I learned about mercy.",
    ],
    answer: "JONAH",
    distractors: ["ELIJAH", "ELISHA", "AMOS", "HOSEA", "MICAH"],
    scriptureReference: "Jonah 2",
    explanation:
      "Jonah ran from Nineveh, prayed from the fish's belly, and learned how wide God's compassion is.",
    difficulty: "balanced",
    category: "people",
  },
  {
    id: "wai-en-esther",
    locale: "en",
    clues: [
      "I had two names, one hidden with my past.",
      "I won a contest I never asked to enter.",
      "I fasted three days before breaking a law.",
      '"For such a time as this" was said of me.',
    ],
    answer: "ESTHER",
    acceptedAnswers: ["HADASSAH"],
    distractors: ["RUTH", "DEBORAH", "ABIGAIL", "MIRIAM", "NAOMI"],
    scriptureReference: "Esther 4:14",
    explanation: "Esther risked her life before the king and her people were saved.",
    difficulty: "balanced",
    category: "people",
  },
  {
    id: "wai-en-paul",
    locale: "en",
    clues: [
      "I guarded coats while a good man died.",
      "A light on a road changed everything.",
      "I made tents so no one would pay my way.",
      "I wrote letters from prison that still travel the world.",
    ],
    answer: "PAUL",
    acceptedAnswers: ["SAUL", "SAUL OF TARSUS"],
    distractors: ["BARNABAS", "SILAS", "TIMOTHY", "APOLLOS", "STEPHEN"],
    scriptureReference: "Acts 9:1–19",
    explanation:
      "Saul of Tarsus met the risen Christ on the Damascus road and became Paul, apostle to the nations.",
    difficulty: "balanced",
    category: "people",
  },
  {
    id: "wai-en-elijah",
    locale: "en",
    clues: [
      "Ravens brought me bread.",
      "I mocked prophets who shouted all day at nothing.",
      "Fire fell on a soaked altar when I prayed.",
      "I left in a chariot of fire.",
    ],
    answer: "ELIJAH",
    distractors: ["ELISHA", "ISAIAH", "JEREMIAH", "SAMUEL", "NATHAN"],
    scriptureReference: "1 Kings 18:30–39",
    explanation: "Elijah stood alone on Carmel, and the fire of the Lord answered.",
    difficulty: "challenging",
    category: "people",
  },
  {
    id: "wai-en-ruth",
    locale: "en",
    clues: [
      "I was not born among the people I chose.",
      '"Where you go, I will go", I said.',
      "I gleaned leftover grain to feed two widows.",
      "My great-grandson would be a famous king.",
    ],
    answer: "RUTH",
    distractors: ["NAOMI", "ORPAH", "ESTHER", "RACHEL", "TAMAR"],
    scriptureReference: "Ruth 1:16",
    explanation: "Ruth the Moabite chose Naomi's God and became great-grandmother of David.",
    difficulty: "challenging",
    category: "people",
  },
  {
    id: "wai-en-daniel",
    locale: "en",
    clues: [
      "I ate vegetables while others feasted.",
      "I read writing on a wall no one else could.",
      "I kept my window open toward Jerusalem, three times a day.",
      "Hungry lions kept me company for a night.",
    ],
    answer: "DANIEL",
    distractors: ["SHADRACH", "MESHACH", "ABEDNEGO", "EZEKIEL", "NEHEMIAH"],
    scriptureReference: "Daniel 6",
    explanation: "Daniel prayed as he always had, and God shut the lions' mouths.",
    difficulty: "challenging",
    category: "people",
  },
  {
    id: "wai-en-deborah",
    locale: "en",
    clues: [
      "I held court beneath a palm tree.",
      "I was a prophet and a judge in days when few listened.",
      "A general refused to go to battle without me.",
      "I sang of a victory sealed by a tent peg.",
    ],
    answer: "DEBORAH",
    distractors: ["JAEL", "MIRIAM", "HULDAH", "HANNAH", "ABIGAIL"],
    scriptureReference: "Judges 4–5",
    explanation: "Deborah judged Israel under her palm and led Barak to victory.",
    difficulty: "challenging",
    category: "people",
  },
  {
    id: "wai-en-john-baptist",
    locale: "en",
    clues: [
      "My food and clothes were nobody's envy.",
      "I preached where there were no pulpits.",
      "I said someone coming after me was greater.",
      "I baptized my own cousin in a river.",
    ],
    answer: "JOHN THE BAPTIST",
    acceptedAnswers: ["JOHN"],
    distractors: ["ELIJAH", "PETER", "ANDREW", "JAMES"],
    scriptureReference: "Matthew 3:1–17",
    explanation: "John prepared the way in the wilderness and baptized Jesus in the Jordan.",
    difficulty: "expert",
    category: "people",
  },
  {
    id: "wai-en-abraham",
    locale: "en",
    clues: [
      "I left home without knowing where I was going.",
      "I was promised descendants like the stars.",
      "I laughed, and so did my wife — then we named our son for it.",
      "I climbed a mountain with wood, fire, and a heavy heart.",
    ],
    answer: "ABRAHAM",
    acceptedAnswers: ["ABRAM"],
    distractors: ["ISAAC", "JACOB", "LOT", "NOAH"],
    scriptureReference: "Genesis 22:1–14",
    explanation: "Abraham trusted the God who provides, and on the mountain a ram was given.",
    difficulty: "expert",
    category: "people",
  },
];

const QUESTIONS_BY_LOCALE: Record<GameLocale, readonly WhoAmIQuestion[]> = {
  en: EN_QUESTIONS,
  // Future Portuguese and Spanish sets slot in here, mirroring t()'s fallback.
  pt: [],
  es: [],
};

export function whoAmIQuestionsForLocale(locale: GameLocale): readonly WhoAmIQuestion[] {
  const set = QUESTIONS_BY_LOCALE[locale];
  return set.length > 0 ? set : QUESTIONS_BY_LOCALE.en;
}
