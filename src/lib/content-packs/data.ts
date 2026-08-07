// The two authored content packs — Women of Faith and Proverbs for the
// Everyday Man — as data, so the staff-gated installer can create them in
// whichever environment it runs against. Same content as the SQL migration;
// this is the path that works when migrations from outside the Lovable editor
// are not executed on publish.

export interface PackWordTranslation {
  display: string;
  normalized: string;
}

export interface PackWord {
  id: string;
  position: number;
  minDifficulty: "gentle" | "balanced" | "challenging" | "expert";
  translations: Record<string, PackWordTranslation>;
}

export interface PackJourney {
  id: string;
  slug: string;
  position: number;
  difficulty: "gentle" | "balanced" | "challenging" | "expert";
  theme: string;
  internalTitle: string;
  scripture: {
    bookCode: string;
    chapter: number;
    verseStart: number;
    verseEnd: number;
    displayReference: string;
    storedText: string;
  };
  translations: Record<
    string,
    { title: string; devotional: string; reflection: string; prayer: string; completion: string }
  >;
  words: PackWord[];
}

export interface ContentPack {
  id: string;
  internalName: string;
  slug: string;
  topic: string;
  audience: string;
  displayOrder: number;
  translations: Record<string, { title: string; short: string; full: string }>;
  journeys: PackJourney[];
}

export const CONTENT_PACKS: readonly ContentPack[] = [
  {
    id: "c0000000-0000-4000-8000-000000000101",
    internalName: "Women of Faith",
    slug: "women-of-faith",
    topic: "People",
    audience: "Women",
    displayOrder: 3,
    translations: {
      en: {
        title: "Women of Faith",
        short: "Seven days with the women whose courage shaped Scripture.",
        full: "A seven-day plan through the lives of Ruth, Esther, Hannah, Mary, Deborah, Mary Magdalene and Lydia — one quiet journey a day.",
      },
      pt: {
        title: "Mulheres de Fé",
        short: "Sete dias com as mulheres cuja coragem moldou a Escritura.",
        full: "Um plano de sete dias pelas vidas de Rute, Ester, Ana, Maria, Débora, Maria Madalena e Lídia — uma jornada tranquila por dia.",
      },
      es: {
        title: "Mujeres de Fe",
        short: "Siete días con las mujeres cuyo valor marcó la Escritura.",
        full: "Un plan de siete días por las vidas de Rut, Ester, Ana, María, Débora, María Magdalena y Lidia — una jornada serena al día.",
      },
    },
    journeys: [
      {
        id: "41000000-0000-4000-8000-000000000101",
        slug: "ruth-where-you-go",
        position: 0,
        difficulty: "gentle",
        theme: "Loyalty",
        internalTitle: "Where You Go",
        scripture: {
          bookCode: "RUT",
          chapter: 1,
          verseStart: 16,
          verseEnd: 16,
          displayReference: "Ruth 1:16",
          storedText:
            "Where you go, I will go; and where you stay, I will stay. Your people will be my people, and your God my God.",
        },
        translations: {
          en: {
            title: "Where You Go",
            devotional:
              "Ruth had every reason to turn back, and one reason to stay: love that had become conviction. Loyalty is rarely dramatic; it is a decision repeated at a crossroads.",
            reflection: "Who has walked with you when leaving would have been easier?",
            prayer: "God of Ruth, make me faithful in small crossings. Amen.",
            completion: "You walked a day with Ruth.",
          },
          pt: {
            title: "Aonde Fores",
            devotional:
              "Rute tinha todos os motivos para voltar, e um só para ficar: um amor que virou convicção. Lealdade raramente é dramática; é uma decisão repetida numa encruzilhada.",
            reflection: "Quem caminhou com você quando partir teria sido mais fácil?",
            prayer: "Deus de Rute, faze-me fiel nas travessias pequenas. Amém.",
            completion: "Você caminhou um dia com Rute.",
          },
          es: {
            title: "A Donde Vayas",
            devotional:
              "Rut tenía todas las razones para volver, y una sola para quedarse: un amor que se hizo convicción. La lealtad rara vez es dramática; es una decisión repetida en una encrucijada.",
            reflection: "¿Quién caminó contigo cuando irse habría sido más fácil?",
            prayer: "Dios de Rut, hazme fiel en los cruces pequeños. Amén.",
            completion: "Caminaste un día con Rut.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-010100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "RUTH",
                normalized: "RUTH",
              },
              pt: {
                display: "RUTE",
                normalized: "RUTE",
              },
              es: {
                display: "RUT",
                normalized: "RUT",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-010200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "LOYAL",
                normalized: "LOYAL",
              },
              pt: {
                display: "LEAL",
                normalized: "LEAL",
              },
              es: {
                display: "LEAL",
                normalized: "LEAL",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-010300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "GLEAN",
                normalized: "GLEAN",
              },
              pt: {
                display: "COLHER",
                normalized: "COLHER",
              },
              es: {
                display: "ESPIGAR",
                normalized: "ESPIGAR",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-010400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "KINDNESS",
                normalized: "KINDNESS",
              },
              pt: {
                display: "BONDADE",
                normalized: "BONDADE",
              },
              es: {
                display: "BONDAD",
                normalized: "BONDAD",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-010500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "HARVEST",
                normalized: "HARVEST",
              },
              pt: {
                display: "COLHEITA",
                normalized: "COLHEITA",
              },
              es: {
                display: "COSECHA",
                normalized: "COSECHA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-010600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "RETURN",
                normalized: "RETURN",
              },
              pt: {
                display: "VOLTAR",
                normalized: "VOLTAR",
              },
              es: {
                display: "VOLVER",
                normalized: "VOLVER",
              },
            },
          },
        ],
      },
      {
        id: "41000000-0000-4000-8000-000000000102",
        slug: "esther-for-such-a-time",
        position: 1,
        difficulty: "balanced",
        theme: "Courage",
        internalTitle: "For Such a Time",
        scripture: {
          bookCode: "EST",
          chapter: 4,
          verseStart: 14,
          verseEnd: 14,
          displayReference: "Esther 4:14",
          storedText: "Who knows if you haven't come to the kingdom for such a time as this?",
        },
        translations: {
          en: {
            title: "For Such a Time",
            devotional:
              "Esther's courage began with three days of fasting, not with a speech. Bravery that lasts is usually prayed into being before it is seen.",
            reflection: "What has been placed in your hands for this season?",
            prayer: "Give me courage that begins on my knees. Amen.",
            completion: "You walked a day with Esther.",
          },
          pt: {
            title: "Para Um Tempo Como Este",
            devotional:
              "A coragem de Ester começou com três dias de jejum, não com um discurso. A bravura que dura costuma nascer em oração antes de ser vista.",
            reflection: "O que foi colocado em suas mãos nesta estação?",
            prayer: "Dá-me coragem que começa de joelhos. Amém.",
            completion: "Você caminhou um dia com Ester.",
          },
          es: {
            title: "Para Esta Hora",
            devotional:
              "El valor de Ester empezó con tres días de ayuno, no con un discurso. La valentía que dura suele orarse antes de verse.",
            reflection: "¿Qué ha sido puesto en tus manos en esta temporada?",
            prayer: "Dame valor que comience de rodillas. Amén.",
            completion: "Caminaste un día con Ester.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-020100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "ESTHER",
                normalized: "ESTHER",
              },
              pt: {
                display: "ESTER",
                normalized: "ESTER",
              },
              es: {
                display: "ESTER",
                normalized: "ESTER",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-020200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "COURAGE",
                normalized: "COURAGE",
              },
              pt: {
                display: "CORAGEM",
                normalized: "CORAGEM",
              },
              es: {
                display: "VALOR",
                normalized: "VALOR",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-020300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "QUEEN",
                normalized: "QUEEN",
              },
              pt: {
                display: "RAINHA",
                normalized: "RAINHA",
              },
              es: {
                display: "REINA",
                normalized: "REINA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-020400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FASTING",
                normalized: "FASTING",
              },
              pt: {
                display: "JEJUM",
                normalized: "JEJUM",
              },
              es: {
                display: "AYUNO",
                normalized: "AYUNO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-020500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "PEOPLE",
                normalized: "PEOPLE",
              },
              pt: {
                display: "POVO",
                normalized: "POVO",
              },
              es: {
                display: "PUEBLO",
                normalized: "PUEBLO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-020600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "TIMING",
                normalized: "TIMING",
              },
              pt: {
                display: "TEMPO",
                normalized: "TEMPO",
              },
              es: {
                display: "TIEMPO",
                normalized: "TIEMPO",
              },
            },
          },
        ],
      },
      {
        id: "41000000-0000-4000-8000-000000000103",
        slug: "hannah-poured-out",
        position: 2,
        difficulty: "gentle",
        theme: "Prayer",
        internalTitle: "Poured Out",
        scripture: {
          bookCode: "1SA",
          chapter: 1,
          verseStart: 27,
          verseEnd: 27,
          displayReference: "1 Samuel 1:27",
          storedText:
            "For this child I prayed; and Yahweh has given me my petition which I asked of him.",
        },
        translations: {
          en: {
            title: "Poured Out",
            devotional:
              "Hannah prayed with moving lips and no voice, and was misread as drunk. God read her rightly — prayer does not need to be eloquent to be heard.",
            reflection: "What have you stopped asking for?",
            prayer: "Hear the prayers I cannot say aloud. Amen.",
            completion: "You walked a day with Hannah.",
          },
          pt: {
            title: "Derramada",
            devotional:
              "Ana orava com os lábios se movendo e sem voz, e foi lida como embriagada. Deus a leu corretamente — a oração não precisa ser eloquente para ser ouvida.",
            reflection: "O que você deixou de pedir?",
            prayer: "Ouve as orações que não consigo dizer em voz alta. Amém.",
            completion: "Você caminhou um dia com Ana.",
          },
          es: {
            title: "Derramada",
            devotional:
              "Ana oraba moviendo los labios sin voz, y la creyeron ebria. Dios la leyó bien: la oración no necesita ser elocuente para ser oída.",
            reflection: "¿Qué dejaste de pedir?",
            prayer: "Escucha las oraciones que no logro decir en voz alta. Amén.",
            completion: "Caminaste un día con Ana.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-030100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "HANNAH",
                normalized: "HANNAH",
              },
              pt: {
                display: "ANA",
                normalized: "ANA",
              },
              es: {
                display: "ANA",
                normalized: "ANA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-030200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "PRAYER",
                normalized: "PRAYER",
              },
              pt: {
                display: "ORAÇÃO",
                normalized: "ORACAO",
              },
              es: {
                display: "ORACIÓN",
                normalized: "ORACION",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-030300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "TEMPLE",
                normalized: "TEMPLE",
              },
              pt: {
                display: "TEMPLO",
                normalized: "TEMPLO",
              },
              es: {
                display: "TEMPLO",
                normalized: "TEMPLO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-030400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SILENT",
                normalized: "SILENT",
              },
              pt: {
                display: "SILÊNCIO",
                normalized: "SILENCIO",
              },
              es: {
                display: "SILENCIO",
                normalized: "SILENCIO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-030500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "ANSWER",
                normalized: "ANSWER",
              },
              pt: {
                display: "RESPOSTA",
                normalized: "RESPOSTA",
              },
              es: {
                display: "RESPUESTA",
                normalized: "RESPUESTA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-030600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "VOW",
                normalized: "VOW",
              },
              pt: {
                display: "VOTO",
                normalized: "VOTO",
              },
              es: {
                display: "VOTO",
                normalized: "VOTO",
              },
            },
          },
        ],
      },
      {
        id: "41000000-0000-4000-8000-000000000104",
        slug: "mary-let-it-be",
        position: 3,
        difficulty: "gentle",
        theme: "Surrender",
        internalTitle: "Let It Be",
        scripture: {
          bookCode: "LUK",
          chapter: 1,
          verseStart: 38,
          verseEnd: 38,
          displayReference: "Luke 1:38",
          storedText:
            "Mary said, Behold, the servant of the Lord; let it be done to me according to your word.",
        },
        translations: {
          en: {
            title: "Let It Be",
            devotional:
              "Mary asked one honest question and then said yes to a life she could not picture. Surrender is not the absence of questions; it is trust that outlasts them.",
            reflection: "Where are you being asked to say yes before you can see?",
            prayer: "Let it be to me according to your word. Amen.",
            completion: "You walked a day with Mary.",
          },
          pt: {
            title: "Faça-se em Mim",
            devotional:
              "Maria fez uma pergunta honesta e depois disse sim a uma vida que não conseguia imaginar. Entrega não é ausência de perguntas; é confiança que dura mais que elas.",
            reflection: "Onde você está sendo convidado a dizer sim antes de enxergar?",
            prayer: "Faça-se em mim segundo a tua palavra. Amém.",
            completion: "Você caminhou um dia com Maria.",
          },
          es: {
            title: "Hágase en Mí",
            devotional:
              "María hizo una pregunta honesta y luego dijo sí a una vida que no podía imaginar. Entregarse no es no tener preguntas; es confiar más allá de ellas.",
            reflection: "¿Dónde se te pide decir sí antes de poder ver?",
            prayer: "Hágase en mí conforme a tu palabra. Amén.",
            completion: "Caminaste un día con María.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-040100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "MARY",
                normalized: "MARY",
              },
              pt: {
                display: "MARIA",
                normalized: "MARIA",
              },
              es: {
                display: "MARÍA",
                normalized: "MARIA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-040200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SERVANT",
                normalized: "SERVANT",
              },
              pt: {
                display: "SERVA",
                normalized: "SERVA",
              },
              es: {
                display: "SIERVA",
                normalized: "SIERVA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-040300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "ANGEL",
                normalized: "ANGEL",
              },
              pt: {
                display: "ANJO",
                normalized: "ANJO",
              },
              es: {
                display: "ÁNGEL",
                normalized: "ANGEL",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-040400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FAVOR",
                normalized: "FAVOR",
              },
              pt: {
                display: "GRAÇA",
                normalized: "GRACA",
              },
              es: {
                display: "FAVOR",
                normalized: "FAVOR",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-040500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "WORD",
                normalized: "WORD",
              },
              pt: {
                display: "PALAVRA",
                normalized: "PALAVRA",
              },
              es: {
                display: "PALABRA",
                normalized: "PALABRA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-040600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "TREASURE",
                normalized: "TREASURE",
              },
              pt: {
                display: "GUARDAR",
                normalized: "GUARDAR",
              },
              es: {
                display: "GUARDAR",
                normalized: "GUARDAR",
              },
            },
          },
        ],
      },
      {
        id: "41000000-0000-4000-8000-000000000105",
        slug: "deborah-under-the-palm",
        position: 4,
        difficulty: "balanced",
        theme: "Leadership",
        internalTitle: "Under the Palm",
        scripture: {
          bookCode: "JDG",
          chapter: 4,
          verseStart: 4,
          verseEnd: 5,
          displayReference: "Judges 4:4-5",
          storedText:
            "Now Deborah, a prophetess, was judging Israel at that time. She lived under Deborah's palm tree, and the children of Israel came up to her for judgment.",
        },
        translations: {
          en: {
            title: "Under the Palm",
            devotional:
              "Deborah judged in the open, under a tree anyone could find. Leadership that heals is available, unhurried, and not impressed with itself.",
            reflection: "Who needs you to be findable this week?",
            prayer: "Make me steady enough to be sought. Amen.",
            completion: "You walked a day with Deborah.",
          },
          pt: {
            title: "Debaixo da Palmeira",
            devotional:
              "Débora julgava a céu aberto, sob uma árvore que qualquer um encontrava. A liderança que cura é acessível, sem pressa e sem se admirar de si mesma.",
            reflection: "Quem precisa que você esteja encontrável nesta semana?",
            prayer: "Faze-me firme o bastante para ser procurado. Amém.",
            completion: "Você caminhou um dia com Débora.",
          },
          es: {
            title: "Bajo la Palmera",
            devotional:
              "Débora juzgaba a cielo abierto, bajo un árbol que cualquiera podía hallar. El liderazgo que sana es accesible, sin prisa y sin admirarse de sí mismo.",
            reflection: "¿Quién necesita encontrarte esta semana?",
            prayer: "Hazme firme para ser buscado. Amén.",
            completion: "Caminaste un día con Débora.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-050100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "DEBORAH",
                normalized: "DEBORAH",
              },
              pt: {
                display: "DÉBORA",
                normalized: "DEBORA",
              },
              es: {
                display: "DÉBORA",
                normalized: "DEBORA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-050200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "PALM",
                normalized: "PALM",
              },
              pt: {
                display: "PALMEIRA",
                normalized: "PALMEIRA",
              },
              es: {
                display: "PALMERA",
                normalized: "PALMERA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-050300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "JUDGE",
                normalized: "JUDGE",
              },
              pt: {
                display: "JUÍZA",
                normalized: "JUIZA",
              },
              es: {
                display: "JUEZA",
                normalized: "JUEZA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-050400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SONG",
                normalized: "SONG",
              },
              pt: {
                display: "CÂNTICO",
                normalized: "CANTICO",
              },
              es: {
                display: "CÁNTICO",
                normalized: "CANTICO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-050500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "VICTORY",
                normalized: "VICTORY",
              },
              pt: {
                display: "VITÓRIA",
                normalized: "VITORIA",
              },
              es: {
                display: "VICTORIA",
                normalized: "VICTORIA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-050600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "COUNSEL",
                normalized: "COUNSEL",
              },
              pt: {
                display: "CONSELHO",
                normalized: "CONSELHO",
              },
              es: {
                display: "CONSEJO",
                normalized: "CONSEJO",
              },
            },
          },
        ],
      },
      {
        id: "41000000-0000-4000-8000-000000000106",
        slug: "magdalene-in-the-garden",
        position: 5,
        difficulty: "balanced",
        theme: "Devotion",
        internalTitle: "He Said Her Name",
        scripture: {
          bookCode: "JHN",
          chapter: 20,
          verseStart: 16,
          verseEnd: 16,
          displayReference: "John 20:16",
          storedText:
            "Jesus said to her, Mary. She turned and said to him, Rabboni! which is to say, Teacher!",
        },
        translations: {
          en: {
            title: "He Said Her Name",
            devotional:
              "Mary Magdalene stayed at the tomb after everyone else went home. She was not recognised by an argument but by her name, spoken.",
            reflection: "Where are you staying, waiting, still?",
            prayer: "Speak my name when I cannot see you. Amen.",
            completion: "You walked a day with Mary Magdalene.",
          },
          pt: {
            title: "Ele Disse Seu Nome",
            devotional:
              "Maria Madalena ficou no túmulo depois que todos foram embora. Ela não foi convencida por um argumento, mas pelo seu nome, dito em voz alta.",
            reflection: "Onde você está permanecendo, esperando, ainda?",
            prayer: "Diz o meu nome quando eu não te enxergo. Amém.",
            completion: "Você caminhou um dia com Maria Madalena.",
          },
          es: {
            title: "Dijo Su Nombre",
            devotional:
              "María Magdalena se quedó junto al sepulcro cuando los demás se fueron. No la convenció un argumento, sino su nombre, pronunciado.",
            reflection: "¿Dónde estás permaneciendo, esperando, todavía?",
            prayer: "Di mi nombre cuando no logro verte. Amén.",
            completion: "Caminaste un día con María Magdalena.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-060100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "GARDEN",
                normalized: "GARDEN",
              },
              pt: {
                display: "JARDIM",
                normalized: "JARDIM",
              },
              es: {
                display: "HUERTO",
                normalized: "HUERTO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-060200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "TEACHER",
                normalized: "TEACHER",
              },
              pt: {
                display: "MESTRE",
                normalized: "MESTRE",
              },
              es: {
                display: "MAESTRO",
                normalized: "MAESTRO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-060300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "MORNING",
                normalized: "MORNING",
              },
              pt: {
                display: "MANHÃ",
                normalized: "MANHA",
              },
              es: {
                display: "MAÑANA",
                normalized: "MAÑANA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-060400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SEEKING",
                normalized: "SEEKING",
              },
              pt: {
                display: "BUSCAR",
                normalized: "BUSCAR",
              },
              es: {
                display: "BUSCAR",
                normalized: "BUSCAR",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-060500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "RISEN",
                normalized: "RISEN",
              },
              pt: {
                display: "RESSURGIU",
                normalized: "RESSURGIU",
              },
              es: {
                display: "RESUCITÓ",
                normalized: "RESUCITO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-060600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "NAME",
                normalized: "NAME",
              },
              pt: {
                display: "NOME",
                normalized: "NOME",
              },
              es: {
                display: "NOMBRE",
                normalized: "NOMBRE",
              },
            },
          },
        ],
      },
      {
        id: "41000000-0000-4000-8000-000000000107",
        slug: "lydia-an-open-home",
        position: 6,
        difficulty: "challenging",
        theme: "Hospitality",
        internalTitle: "An Open Home",
        scripture: {
          bookCode: "ACT",
          chapter: 16,
          verseStart: 14,
          verseEnd: 15,
          displayReference: "Acts 16:14-15",
          storedText:
            "The Lord opened her heart to listen to the things which were spoken by Paul. She urged us, saying, Come into my house and stay.",
        },
        translations: {
          en: {
            title: "An Open Home",
            devotional:
              "Lydia's heart was opened first, and her door opened next. Hospitality is what an opened heart does with a house.",
            reflection: "What would it cost you to open one door this week?",
            prayer: "Open my heart, and then my home. Amen.",
            completion: "You finished Women of Faith.",
          },
          pt: {
            title: "Uma Casa Aberta",
            devotional:
              "O coração de Lídia foi aberto primeiro, e a porta depois. Hospitalidade é o que um coração aberto faz com uma casa.",
            reflection: "O que custaria a você abrir uma porta nesta semana?",
            prayer: "Abre meu coração e depois minha casa. Amém.",
            completion: "Você concluiu Mulheres de Fé.",
          },
          es: {
            title: "Una Casa Abierta",
            devotional:
              "El corazón de Lidia fue abierto primero, y luego su puerta. La hospitalidad es lo que un corazón abierto hace con una casa.",
            reflection: "¿Qué te costaría abrir una puerta esta semana?",
            prayer: "Abre mi corazón y después mi casa. Amén.",
            completion: "Terminaste Mujeres de Fe.",
          },
        },
        words: [
          {
            id: "41000000-0000-4000-8000-070100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "LYDIA",
                normalized: "LYDIA",
              },
              pt: {
                display: "LÍDIA",
                normalized: "LIDIA",
              },
              es: {
                display: "LIDIA",
                normalized: "LIDIA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-070200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "PURPLE",
                normalized: "PURPLE",
              },
              pt: {
                display: "PÚRPURA",
                normalized: "PURPURA",
              },
              es: {
                display: "PÚRPURA",
                normalized: "PURPURA",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-070300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "RIVER",
                normalized: "RIVER",
              },
              pt: {
                display: "RIO",
                normalized: "RIO",
              },
              es: {
                display: "RÍO",
                normalized: "RIO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-070400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "LISTEN",
                normalized: "LISTEN",
              },
              pt: {
                display: "ESCUTAR",
                normalized: "ESCUTAR",
              },
              es: {
                display: "ESCUCHAR",
                normalized: "ESCUCHAR",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-070500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "OPENED",
                normalized: "OPENED",
              },
              pt: {
                display: "ABERTO",
                normalized: "ABERTO",
              },
              es: {
                display: "ABIERTO",
                normalized: "ABIERTO",
              },
            },
          },
          {
            id: "41000000-0000-4000-8000-070600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "WELCOME",
                normalized: "WELCOME",
              },
              pt: {
                display: "ACOLHER",
                normalized: "ACOLHER",
              },
              es: {
                display: "ACOGER",
                normalized: "ACOGER",
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "c0000000-0000-4000-8000-000000000102",
    internalName: "Proverbs for the Everyday Man",
    slug: "proverbs-everyday-man",
    topic: "Proverbs",
    audience: "Men",
    displayOrder: 4,
    translations: {
      en: {
        title: "Proverbs for the Everyday Man",
        short: "Seven days in Proverbs, for work, words, friendship and fatherhood.",
        full: "A seven-day plan through Proverbs on the things a man carries daily: his heart, his speech, his work, his friends and his children.",
      },
      pt: {
        title: "Provérbios para o Homem Comum",
        short: "Sete dias em Provérbios: trabalho, palavras, amizade e paternidade.",
        full: "Um plano de sete dias por Provérbios sobre o que um homem carrega todo dia: seu coração, sua fala, seu trabalho, seus amigos e seus filhos.",
      },
      es: {
        title: "Proverbios para el Hombre de Cada Día",
        short: "Siete días en Proverbios: trabajo, palabras, amistad y paternidad.",
        full: "Un plan de siete días por Proverbios sobre lo que un hombre lleva a diario: su corazón, su habla, su trabajo, sus amigos y sus hijos.",
      },
    },
    journeys: [
      {
        id: "42000000-0000-4000-8000-000000000201",
        slug: "proverbs-4-guard-your-heart",
        position: 0,
        difficulty: "gentle",
        theme: "Integrity",
        internalTitle: "Guard Your Heart",
        scripture: {
          bookCode: "PRO",
          chapter: 4,
          verseStart: 23,
          verseEnd: 23,
          displayReference: "Proverbs 4:23",
          storedText:
            "Keep your heart with all diligence, for out of it is the wellspring of life.",
        },
        translations: {
          en: {
            title: "Guard Your Heart",
            devotional:
              "The heart here is not sentiment; it is the control room where decisions are made before anyone sees them. A man guards it the way he would guard a well his family drinks from.",
            reflection: "What are you letting in without noticing?",
            prayer: "Keep my heart today, before the day keeps it. Amen.",
            completion: "Day one of Proverbs for the Everyday Man.",
          },
          pt: {
            title: "Guarda o Teu Coração",
            devotional:
              "O coração aqui não é sentimento; é a sala de comando onde as decisões nascem antes de alguém ver. O homem o guarda como guardaria o poço de onde sua família bebe.",
            reflection: "O que você tem deixado entrar sem perceber?",
            prayer: "Guarda o meu coração hoje, antes que o dia o tome. Amém.",
            completion: "Dia um de Provérbios para o Homem Comum.",
          },
          es: {
            title: "Guarda Tu Corazón",
            devotional:
              "El corazón aquí no es sentimiento; es la sala de mando donde nacen las decisiones antes de que alguien las vea. Un hombre lo guarda como guardaría el pozo del que bebe su familia.",
            reflection: "¿Qué estás dejando entrar sin notarlo?",
            prayer: "Guarda mi corazón hoy, antes de que el día lo tome. Amén.",
            completion: "Día uno de Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-010100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "GUARD",
                normalized: "GUARD",
              },
              pt: {
                display: "GUARDAR",
                normalized: "GUARDAR",
              },
              es: {
                display: "GUARDAR",
                normalized: "GUARDAR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-010200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "HEART",
                normalized: "HEART",
              },
              pt: {
                display: "CORAÇÃO",
                normalized: "CORACAO",
              },
              es: {
                display: "CORAZÓN",
                normalized: "CORAZON",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-010300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SPRING",
                normalized: "SPRING",
              },
              pt: {
                display: "FONTE",
                normalized: "FONTE",
              },
              es: {
                display: "FUENTE",
                normalized: "FUENTE",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-010400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "PATH",
                normalized: "PATH",
              },
              pt: {
                display: "CAMINHO",
                normalized: "CAMINHO",
              },
              es: {
                display: "SENDA",
                normalized: "SENDA",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-010500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "STRAIGHT",
                normalized: "STRAIGHT",
              },
              pt: {
                display: "RETO",
                normalized: "RETO",
              },
              es: {
                display: "RECTO",
                normalized: "RECTO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-010600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "KEEP",
                normalized: "KEEP",
              },
              pt: {
                display: "MANTER",
                normalized: "MANTER",
              },
              es: {
                display: "MANTENER",
                normalized: "MANTENER",
              },
            },
          },
        ],
      },
      {
        id: "42000000-0000-4000-8000-000000000202",
        slug: "proverbs-10-fewer-words",
        position: 1,
        difficulty: "gentle",
        theme: "Speech",
        internalTitle: "Fewer Words",
        scripture: {
          bookCode: "PRO",
          chapter: 10,
          verseStart: 19,
          verseEnd: 19,
          displayReference: "Proverbs 10:19",
          storedText:
            "In the multitude of words there is no lack of disobedience, but he who restrains his lips does wisely.",
        },
        translations: {
          en: {
            title: "Fewer Words",
            devotional:
              "Most damage between people is done by one sentence too many. Restraint is not weakness; it is a man deciding that being right is worth less than being kind.",
            reflection: "Which conversation this week needed one sentence fewer?",
            prayer: "Set a guard over my mouth today. Amen.",
            completion: "Day two of Proverbs for the Everyday Man.",
          },
          pt: {
            title: "Menos Palavras",
            devotional:
              "A maior parte do estrago entre pessoas vem de uma frase a mais. Conter-se não é fraqueza; é um homem decidindo que ter razão vale menos do que ser gentil.",
            reflection: "Qual conversa desta semana pedia uma frase a menos?",
            prayer: "Põe uma guarda à minha boca hoje. Amém.",
            completion: "Dia dois de Provérbios para o Homem Comum.",
          },
          es: {
            title: "Menos Palabras",
            devotional:
              "Casi todo el daño entre personas viene de una frase de más. Contenerse no es debilidad; es un hombre decidiendo que tener razón vale menos que ser amable.",
            reflection: "¿Qué conversación de esta semana pedía una frase menos?",
            prayer: "Pon guarda a mi boca hoy. Amén.",
            completion: "Día dos de Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-020100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "WORDS",
                normalized: "WORDS",
              },
              pt: {
                display: "PALAVRAS",
                normalized: "PALAVRAS",
              },
              es: {
                display: "PALABRAS",
                normalized: "PALABRAS",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-020200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SILENCE",
                normalized: "SILENCE",
              },
              pt: {
                display: "SILÊNCIO",
                normalized: "SILENCIO",
              },
              es: {
                display: "SILENCIO",
                normalized: "SILENCIO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-020300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "TONGUE",
                normalized: "TONGUE",
              },
              pt: {
                display: "LÍNGUA",
                normalized: "LINGUA",
              },
              es: {
                display: "LENGUA",
                normalized: "LENGUA",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-020400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "WISE",
                normalized: "WISE",
              },
              pt: {
                display: "SÁBIO",
                normalized: "SABIO",
              },
              es: {
                display: "SABIO",
                normalized: "SABIO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-020500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "LISTEN",
                normalized: "LISTEN",
              },
              pt: {
                display: "OUVIR",
                normalized: "OUVIR",
              },
              es: {
                display: "ESCUCHAR",
                normalized: "ESCUCHAR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-020600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "RESTRAIN",
                normalized: "RESTRAIN",
              },
              pt: {
                display: "CONTER",
                normalized: "CONTER",
              },
              es: {
                display: "REFRENAR",
                normalized: "REFRENAR",
              },
            },
          },
        ],
      },
      {
        id: "42000000-0000-4000-8000-000000000203",
        slug: "proverbs-11-honest-scales",
        position: 2,
        difficulty: "balanced",
        theme: "Work",
        internalTitle: "Honest Scales",
        scripture: {
          bookCode: "PRO",
          chapter: 11,
          verseStart: 3,
          verseEnd: 3,
          displayReference: "Proverbs 11:3",
          storedText:
            "The integrity of the upright shall guide them, but the perverseness of the treacherous shall destroy them.",
        },
        translations: {
          en: {
            title: "Honest Scales",
            devotional:
              "Integrity is not a speech; it is what your hands do when the invoice could be rounded up. It guides — meaning it decides for you on the days you are tired.",
            reflection: "Where is the temptation to round up in your work?",
            prayer: "Make my hands honest when no one checks. Amen.",
            completion: "Day three of Proverbs for the Everyday Man.",
          },
          pt: {
            title: "Balanças Honestas",
            devotional:
              "Integridade não é discurso; é o que suas mãos fazem quando a nota poderia ser arredondada. Ela guia — ou seja, decide por você nos dias em que você está cansado.",
            reflection: "Onde está a tentação de arredondar no seu trabalho?",
            prayer: "Faze minhas mãos honestas quando ninguém confere. Amém.",
            completion: "Dia três de Provérbios para o Homem Comum.",
          },
          es: {
            title: "Balanzas Honestas",
            devotional:
              "La integridad no es un discurso; es lo que hacen tus manos cuando la factura podría redondearse. Ella guía: decide por ti los días en que estás cansado.",
            reflection: "¿Dónde está la tentación de redondear en tu trabajo?",
            prayer: "Haz honestas mis manos cuando nadie revisa. Amén.",
            completion: "Día tres de Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-030100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "INTEGRITY",
                normalized: "INTEGRITY",
              },
              pt: {
                display: "INTEGRIDADE",
                normalized: "INTEGRIDADE",
              },
              es: {
                display: "INTEGRIDAD",
                normalized: "INTEGRIDAD",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-030200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "HONEST",
                normalized: "HONEST",
              },
              pt: {
                display: "HONESTO",
                normalized: "HONESTO",
              },
              es: {
                display: "HONESTO",
                normalized: "HONESTO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-030300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SCALES",
                normalized: "SCALES",
              },
              pt: {
                display: "BALANÇA",
                normalized: "BALANCA",
              },
              es: {
                display: "BALANZA",
                normalized: "BALANZA",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-030400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "GUIDE",
                normalized: "GUIDE",
              },
              pt: {
                display: "GUIAR",
                normalized: "GUIAR",
              },
              es: {
                display: "GUIAR",
                normalized: "GUIAR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-030500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "UPRIGHT",
                normalized: "UPRIGHT",
              },
              pt: {
                display: "RETO",
                normalized: "RETO",
              },
              es: {
                display: "RECTO",
                normalized: "RECTO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-030600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "WORK",
                normalized: "WORK",
              },
              pt: {
                display: "TRABALHO",
                normalized: "TRABALHO",
              },
              es: {
                display: "TRABAJO",
                normalized: "TRABAJO",
              },
            },
          },
        ],
      },
      {
        id: "42000000-0000-4000-8000-000000000204",
        slug: "proverbs-13-the-company",
        position: 3,
        difficulty: "balanced",
        theme: "Friendship",
        internalTitle: "The Company You Keep",
        scripture: {
          bookCode: "PRO",
          chapter: 13,
          verseStart: 20,
          verseEnd: 20,
          displayReference: "Proverbs 13:20",
          storedText:
            "One who walks with wise men grows wise, but a companion of fools suffers harm.",
        },
        translations: {
          en: {
            title: "The Company You Keep",
            devotional:
              "No one decides to become foolish; they decide who to spend Friday with. You will end up sounding like the men you listen to most.",
            reflection: "Who are the three voices you hear most often?",
            prayer: "Give me wise company, and make me wise company. Amen.",
            completion: "Day four of Proverbs for the Everyday Man.",
          },
          pt: {
            title: "A Companhia que Você Mantém",
            devotional:
              "Ninguém decide ficar tolo; decide com quem passa a sexta-feira. Você vai acabar falando como os homens que mais escuta.",
            reflection: "Quais são as três vozes que você mais ouve?",
            prayer: "Dá-me companhia sábia, e faze de mim companhia sábia. Amém.",
            completion: "Dia quatro de Provérbios para o Homem Comum.",
          },
          es: {
            title: "La Compañía que Llevas",
            devotional:
              "Nadie decide volverse necio; decide con quién pasa el viernes. Terminarás sonando como los hombres que más escuchas.",
            reflection: "¿Cuáles son las tres voces que más oyes?",
            prayer: "Dame compañía sabia, y hazme compañía sabia. Amén.",
            completion: "Día cuatro de Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-040100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "COMPANION",
                normalized: "COMPANION",
              },
              pt: {
                display: "COMPANHIA",
                normalized: "COMPANHIA",
              },
              es: {
                display: "COMPAÑÍA",
                normalized: "COMPAÑIA",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-040200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "WISE",
                normalized: "WISE",
              },
              pt: {
                display: "SÁBIO",
                normalized: "SABIO",
              },
              es: {
                display: "SABIO",
                normalized: "SABIO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-040300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "WALK",
                normalized: "WALK",
              },
              pt: {
                display: "ANDAR",
                normalized: "ANDAR",
              },
              es: {
                display: "ANDAR",
                normalized: "ANDAR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-040400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FRIEND",
                normalized: "FRIEND",
              },
              pt: {
                display: "AMIGO",
                normalized: "AMIGO",
              },
              es: {
                display: "AMIGO",
                normalized: "AMIGO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-040500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "GROW",
                normalized: "GROW",
              },
              pt: {
                display: "CRESCER",
                normalized: "CRESCER",
              },
              es: {
                display: "CRECER",
                normalized: "CRECER",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-040600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "CHOOSE",
                normalized: "CHOOSE",
              },
              pt: {
                display: "ESCOLHER",
                normalized: "ESCOLHER",
              },
              es: {
                display: "ELEGIR",
                normalized: "ELEGIR",
              },
            },
          },
        ],
      },
      {
        id: "42000000-0000-4000-8000-000000000205",
        slug: "proverbs-17-a-friend-loves",
        position: 4,
        difficulty: "balanced",
        theme: "Brotherhood",
        internalTitle: "Born for Adversity",
        scripture: {
          bookCode: "PRO",
          chapter: 17,
          verseStart: 17,
          verseEnd: 17,
          displayReference: "Proverbs 17:17",
          storedText: "A friend loves at all times; and a brother is born for adversity.",
        },
        translations: {
          en: {
            title: "Born for Adversity",
            devotional:
              "Anyone can be present at a celebration. The brother in this proverb is the one who appears on the worst Tuesday of your year, without being asked.",
            reflection: "Whose worst week could you show up for?",
            prayer: "Make me the friend I would want. Amen.",
            completion: "Day five of Proverbs for the Everyday Man.",
          },
          pt: {
            title: "Nascido para a Adversidade",
            devotional:
              "Qualquer um comparece a uma celebração. O irmão deste provérbio é o que aparece na pior terça-feira do seu ano, sem ser chamado.",
            reflection: "Na pior semana de quem você poderia aparecer?",
            prayer: "Faze de mim o amigo que eu gostaria de ter. Amém.",
            completion: "Dia cinco de Provérbios para o Homem Comum.",
          },
          es: {
            title: "Nacido para la Adversidad",
            devotional:
              "Cualquiera asiste a una celebración. El hermano de este proverbio es el que aparece el peor martes de tu año, sin que lo llamen.",
            reflection: "¿En la peor semana de quién podrías presentarte?",
            prayer: "Hazme el amigo que yo querría tener. Amén.",
            completion: "Día cinco de Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-050100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FRIEND",
                normalized: "FRIEND",
              },
              pt: {
                display: "AMIGO",
                normalized: "AMIGO",
              },
              es: {
                display: "AMIGO",
                normalized: "AMIGO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-050200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "BROTHER",
                normalized: "BROTHER",
              },
              pt: {
                display: "IRMÃO",
                normalized: "IRMAO",
              },
              es: {
                display: "HERMANO",
                normalized: "HERMANO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-050300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "LOVES",
                normalized: "LOVES",
              },
              pt: {
                display: "AMA",
                normalized: "AMA",
              },
              es: {
                display: "AMA",
                normalized: "AMA",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-050400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "TIMES",
                normalized: "TIMES",
              },
              pt: {
                display: "TEMPOS",
                normalized: "TEMPOS",
              },
              es: {
                display: "TIEMPOS",
                normalized: "TIEMPOS",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-050500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "BORN",
                normalized: "BORN",
              },
              pt: {
                display: "NASCEU",
                normalized: "NASCEU",
              },
              es: {
                display: "NACIÓ",
                normalized: "NACIO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-050600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "STAND",
                normalized: "STAND",
              },
              pt: {
                display: "FIRMAR",
                normalized: "FIRMAR",
              },
              es: {
                display: "SOSTENER",
                normalized: "SOSTENER",
              },
            },
          },
        ],
      },
      {
        id: "42000000-0000-4000-8000-000000000206",
        slug: "proverbs-22-train-a-child",
        position: 5,
        difficulty: "challenging",
        theme: "Fatherhood",
        internalTitle: "The Way He Should Go",
        scripture: {
          bookCode: "PRO",
          chapter: 22,
          verseStart: 6,
          verseEnd: 6,
          displayReference: "Proverbs 22:6",
          storedText:
            "Train up a child in the way he should go, and when he is old he will not depart from it.",
        },
        translations: {
          en: {
            title: "The Way He Should Go",
            devotional:
              "The verse says his way, not your way — training reads the child in front of you rather than the one you imagined. Fathering is long, quiet attention.",
            reflection: "What have you noticed about the person your child actually is?",
            prayer: "Give me patience longer than my plans. Amen.",
            completion: "Day six of Proverbs for the Everyday Man.",
          },
          pt: {
            title: "No Caminho em que Deve Andar",
            devotional:
              "O texto diz o caminho dele, não o seu — instruir é ler a criança que está diante de você, não a que você imaginou. Ser pai é atenção longa e silenciosa.",
            reflection: "O que você tem notado sobre quem seu filho realmente é?",
            prayer: "Dá-me paciência maior que os meus planos. Amém.",
            completion: "Dia seis de Provérbios para o Homem Comum.",
          },
          es: {
            title: "En Su Camino",
            devotional:
              "El texto dice su camino, no el tuyo: instruir es leer al hijo que tienes delante, no al que imaginaste. Ser padre es atención larga y callada.",
            reflection: "¿Qué has notado sobre quién es realmente tu hijo?",
            prayer: "Dame paciencia más larga que mis planes. Amén.",
            completion: "Día seis de Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-060100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "TRAIN",
                normalized: "TRAIN",
              },
              pt: {
                display: "INSTRUIR",
                normalized: "INSTRUIR",
              },
              es: {
                display: "INSTRUIR",
                normalized: "INSTRUIR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-060200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "CHILD",
                normalized: "CHILD",
              },
              pt: {
                display: "FILHO",
                normalized: "FILHO",
              },
              es: {
                display: "HIJO",
                normalized: "HIJO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-060300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "WAY",
                normalized: "WAY",
              },
              pt: {
                display: "CAMINHO",
                normalized: "CAMINHO",
              },
              es: {
                display: "CAMINO",
                normalized: "CAMINO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-060400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "DEPART",
                normalized: "DEPART",
              },
              pt: {
                display: "DESVIAR",
                normalized: "DESVIAR",
              },
              es: {
                display: "APARTAR",
                normalized: "APARTAR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-060500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "FATHER",
                normalized: "FATHER",
              },
              pt: {
                display: "PAI",
                normalized: "PAI",
              },
              es: {
                display: "PADRE",
                normalized: "PADRE",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-060600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "PATIENCE",
                normalized: "PATIENCE",
              },
              pt: {
                display: "PACIÊNCIA",
                normalized: "PACIENCIA",
              },
              es: {
                display: "PACIENCIA",
                normalized: "PACIENCIA",
              },
            },
          },
        ],
      },
      {
        id: "42000000-0000-4000-8000-000000000207",
        slug: "proverbs-27-iron-sharpens",
        position: 6,
        difficulty: "challenging",
        theme: "Growth",
        internalTitle: "Iron Sharpens Iron",
        scripture: {
          bookCode: "PRO",
          chapter: 27,
          verseStart: 17,
          verseEnd: 17,
          displayReference: "Proverbs 27:17",
          storedText: "Iron sharpens iron; so a man sharpens his friend's countenance.",
        },
        translations: {
          en: {
            title: "Iron Sharpens Iron",
            devotional:
              "Sharpening makes a sound, and it removes something. A friendship that never costs you a comfortable opinion has never sharpened anything.",
            reflection: "Who is allowed to tell you the truth?",
            prayer: "Give me one friend who will not flatter me. Amen.",
            completion: "You finished Proverbs for the Everyday Man.",
          },
          pt: {
            title: "Ferro com Ferro",
            devotional:
              "Afiar faz barulho, e tira alguma coisa. Uma amizade que nunca lhe custou uma opinião confortável nunca afiou nada.",
            reflection: "Quem tem permissão para lhe dizer a verdade?",
            prayer: "Dá-me um amigo que não me lisonjeie. Amém.",
            completion: "Você concluiu Provérbios para o Homem Comum.",
          },
          es: {
            title: "Hierro con Hierro",
            devotional:
              "Afilar hace ruido, y quita algo. Una amistad que nunca te ha costado una opinión cómoda nunca ha afilado nada.",
            reflection: "¿Quién tiene permiso para decirte la verdad?",
            prayer: "Dame un amigo que no me adule. Amén.",
            completion: "Terminaste Proverbios para el Hombre de Cada Día.",
          },
        },
        words: [
          {
            id: "42000000-0000-4000-8000-070100000000",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "IRON",
                normalized: "IRON",
              },
              pt: {
                display: "FERRO",
                normalized: "FERRO",
              },
              es: {
                display: "HIERRO",
                normalized: "HIERRO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-070200000000",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SHARPEN",
                normalized: "SHARPEN",
              },
              pt: {
                display: "AFIAR",
                normalized: "AFIAR",
              },
              es: {
                display: "AFILAR",
                normalized: "AFILAR",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-070300000000",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FRIEND",
                normalized: "FRIEND",
              },
              pt: {
                display: "AMIGO",
                normalized: "AMIGO",
              },
              es: {
                display: "AMIGO",
                normalized: "AMIGO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-070400000000",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "EDGE",
                normalized: "EDGE",
              },
              pt: {
                display: "FIO",
                normalized: "FIO",
              },
              es: {
                display: "FILO",
                normalized: "FILO",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-070500000000",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "TRUTH",
                normalized: "TRUTH",
              },
              pt: {
                display: "VERDADE",
                normalized: "VERDADE",
              },
              es: {
                display: "VERDAD",
                normalized: "VERDAD",
              },
            },
          },
          {
            id: "42000000-0000-4000-8000-070600000000",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "GROW",
                normalized: "GROW",
              },
              pt: {
                display: "CRESCER",
                normalized: "CRESCER",
              },
              es: {
                display: "CRECER",
                normalized: "CRECER",
              },
            },
          },
        ],
      },
    ],
  },
  {
    id: "33e5125e-4f6a-51d8-ab33-0d6069e23568",
    internalName: "Parables of Jesus",
    slug: "parables-of-jesus",
    topic: "Teachings",
    audience: "Everyone",
    displayOrder: 5,
    translations: {
      en: {
        title: "Parables of Jesus",
        short: "Seven days inside the stories Jesus told, and what they still ask of us.",
        full: "A seven-day plan through seven parables — the sower, the lost sheep, the mustard seed, the good Samaritan, the prodigal son, the talents, and the wise and foolish builders — one story, one question a day.",
      },
      pt: {
        title: "Parábolas de Jesus",
        short:
          "Sete dias dentro das histórias que Jesus contou, e o que elas ainda perguntam a nós.",
        full: "Um plano de sete dias por sete parábolas — o semeador, a ovelha perdida, o grão de mostarda, o bom samaritano, o filho pródigo, os talentos e os dois alicerces — uma história, uma pergunta por dia.",
      },
      es: {
        title: "Parábolas de Jesús",
        short:
          "Siete días dentro de las historias que Jesús contó, y lo que todavía nos preguntan.",
        full: "Un plan de siete días por siete parábolas — el sembrador, la oveja perdida, el grano de mostaza, el buen samaritano, el hijo pródigo, los talentos y los dos constructores — una historia, una pregunta al día.",
      },
    },
    journeys: [
      {
        id: "595137c6-24cf-5d94-970e-29478ac86b3d",
        slug: "sower-good-soil",
        position: 0,
        difficulty: "gentle",
        theme: "Receptivity",
        internalTitle: "Good Soil",
        scripture: {
          bookCode: "MAT",
          chapter: 13,
          verseStart: 3,
          verseEnd: 3,
          displayReference: "Matthew 13:3",
          storedText: "Behold, a farmer went out to sow.",
        },
        translations: {
          en: {
            title: "Good Soil",
            devotional:
              "The same seed yields different results depending only on the soil it lands in. This parable does not blame the sower — it asks about the ground.",
            reflection: "What condition is the soil of your heart in today?",
            prayer:
              "Sower of the Word, make my heart good soil. Let what you plant take root and bear fruit.",
            completion: "Day one of Parables of Jesus.",
          },
          pt: {
            title: "Terra Boa",
            devotional:
              "A mesma semente rende resultados diferentes dependendo apenas da terra em que cai. A parábola não culpa o semeador — ela pergunta sobre o solo.",
            reflection: "Em que condição está a terra do seu coração hoje?",
            prayer:
              "Semeador da Palavra, faze do meu coração boa terra. Que o que plantas crie raiz e dê fruto.",
            completion: "Dia um de Parábolas de Jesus.",
          },
          es: {
            title: "Tierra Buena",
            devotional:
              "La misma semilla rinde resultados distintos según la tierra donde cae. La parábola no culpa al sembrador — pregunta por el suelo.",
            reflection: "¿En qué condición está la tierra de tu corazón hoy?",
            prayer:
              "Sembrador de la Palabra, haz de mi corazón buena tierra. Que lo que siembras eche raíz y dé fruto.",
            completion: "Día uno de Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "edb77dd5-176b-5655-9e1d-5ae496476fc3",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SOWER",
                normalized: "SOWER",
              },
              pt: {
                display: "SEMEADOR",
                normalized: "SEMEADOR",
              },
              es: {
                display: "SEMBRADOR",
                normalized: "SEMBRADOR",
              },
            },
          },
          {
            id: "2629807e-6927-56ee-bf65-13a968912166",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SEED",
                normalized: "SEED",
              },
              pt: {
                display: "SEMENTE",
                normalized: "SEMENTE",
              },
              es: {
                display: "SEMILLA",
                normalized: "SEMILLA",
              },
            },
          },
          {
            id: "0523208c-d67b-54ac-8d77-2b39889d0882",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SOIL",
                normalized: "SOIL",
              },
              pt: {
                display: "TERRA",
                normalized: "TERRA",
              },
              es: {
                display: "TIERRA",
                normalized: "TIERRA",
              },
            },
          },
          {
            id: "5b8a80d7-8d9c-5207-a6e5-1d3f9a0e54f6",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FRUIT",
                normalized: "FRUIT",
              },
              pt: {
                display: "FRUTO",
                normalized: "FRUTO",
              },
              es: {
                display: "FRUTO",
                normalized: "FRUTO",
              },
            },
          },
          {
            id: "e071b39d-3889-5710-bfd9-0c06c9da51e0",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "GROUND",
                normalized: "GROUND",
              },
              pt: {
                display: "SOLO",
                normalized: "SOLO",
              },
              es: {
                display: "SUELO",
                normalized: "SUELO",
              },
            },
          },
          {
            id: "58cec989-36ee-551e-8973-cb43b8a64494",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "HARVEST",
                normalized: "HARVEST",
              },
              pt: {
                display: "COLHEITA",
                normalized: "COLHEITA",
              },
              es: {
                display: "COSECHA",
                normalized: "COSECHA",
              },
            },
          },
        ],
      },
      {
        id: "46cc9ba4-9a26-51cf-a7b8-cdbd7ff47484",
        slug: "the-one-lost-sheep",
        position: 1,
        difficulty: "gentle",
        theme: "Being Sought",
        internalTitle: "The One",
        scripture: {
          bookCode: "LUK",
          chapter: 15,
          verseStart: 4,
          verseEnd: 4,
          displayReference: "Luke 15:4",
          storedText:
            "What man of you, having one hundred sheep, if he loses one of them, doesn't leave the ninety-nine in the wilderness, and go after the one that is lost, until he finds it?",
        },
        translations: {
          en: {
            title: "The One",
            devotional:
              "Value here is not majority math. The shepherd leaves ninety-nine safe sheep for one — because being found is not about the count, it is about being wanted.",
            reflection: "Where do you need to know you are worth seeking?",
            prayer:
              "Shepherd who leaves the ninety-nine, come and find me. Carry me home on your shoulders.",
            completion: "Day two of Parables of Jesus.",
          },
          pt: {
            title: "A Única",
            devotional:
              "Valor aqui não é matemática de maioria. O pastor deixa noventa e nove ovelhas seguras por uma só — porque ser buscado não é sobre número, é sobre ser querido.",
            reflection: "Onde você precisa saber que vale a pena ser buscado?",
            prayer:
              "Pastor que deixa as noventa e nove, vem me buscar. Carrega-me nos ombros de volta para casa.",
            completion: "Dia dois de Parábolas de Jesus.",
          },
          es: {
            title: "La Única",
            devotional:
              "El valor aquí no es matemática de mayoría. El pastor deja noventa y nueve ovejas seguras por una sola — porque ser hallado no depende del número, sino de ser querido.",
            reflection: "¿Dónde necesitas saber que vale la pena buscarte?",
            prayer:
              "Pastor que deja las noventa y nueve, ven a buscarme. Llévame a casa sobre tus hombros.",
            completion: "Día dos de Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "748053ff-579c-5009-8ccc-335b06947bdd",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SHEPHERD",
                normalized: "SHEPHERD",
              },
              pt: {
                display: "PASTOR",
                normalized: "PASTOR",
              },
              es: {
                display: "PASTOR",
                normalized: "PASTOR",
              },
            },
          },
          {
            id: "f8d5b2bf-6cb2-536b-a339-8c543fa2321e",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "LOST",
                normalized: "LOST",
              },
              pt: {
                display: "PERDIDA",
                normalized: "PERDIDA",
              },
              es: {
                display: "PERDIDA",
                normalized: "PERDIDA",
              },
            },
          },
          {
            id: "eb9ed0d9-64ba-531f-9c15-77baf5405fd5",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FOUND",
                normalized: "FOUND",
              },
              pt: {
                display: "ACHADA",
                normalized: "ACHADA",
              },
              es: {
                display: "HALLADA",
                normalized: "HALLADA",
              },
            },
          },
          {
            id: "b681f689-d3ea-50ae-97d4-6f5052a34082",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SHEEP",
                normalized: "SHEEP",
              },
              pt: {
                display: "OVELHA",
                normalized: "OVELHA",
              },
              es: {
                display: "OVEJA",
                normalized: "OVEJA",
              },
            },
          },
          {
            id: "cb52792b-ee41-5a0f-a59b-7240cf15a480",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "CARRY",
                normalized: "CARRY",
              },
              pt: {
                display: "CARREGAR",
                normalized: "CARREGAR",
              },
              es: {
                display: "LLEVAR",
                normalized: "LLEVAR",
              },
            },
          },
          {
            id: "1dc8f78d-00ac-5f2d-bb7f-686f8dacaf2a",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "REJOICE",
                normalized: "REJOICE",
              },
              pt: {
                display: "ALEGRIA",
                normalized: "ALEGRIA",
              },
              es: {
                display: "ALEGRÍA",
                normalized: "ALEGRIA",
              },
            },
          },
        ],
      },
      {
        id: "10ae068e-9e21-53cd-9cc5-75ddc2213ea9",
        slug: "mustard-seed-kingdom",
        position: 2,
        difficulty: "gentle",
        theme: "Small Beginnings",
        internalTitle: "The Smallest Seed",
        scripture: {
          bookCode: "MAT",
          chapter: 13,
          verseStart: 31,
          verseEnd: 31,
          displayReference: "Matthew 13:31",
          storedText:
            "The Kingdom of Heaven is like a grain of mustard seed, which a man took, and sowed in his field.",
        },
        translations: {
          en: {
            title: "The Smallest Seed",
            devotional:
              "The kingdom starts small and nearly invisible, then grows past every expectation. This is encouragement for the faithful act too small for anyone else to notice.",
            reflection: "What small seed have you been tempted to dismiss?",
            prayer:
              "God of small beginnings, grow what I planted in weakness. Make the smallest seed enough.",
            completion: "Day three of Parables of Jesus.",
          },
          pt: {
            title: "A Menor das Sementes",
            devotional:
              "O reino começa pequeno, quase invisível, e cresce além de toda expectativa. É um encorajamento para o ato fiel pequeno demais para qualquer outro notar.",
            reflection: "Que semente pequena você tem sentido tentação de descartar?",
            prayer:
              "Deus dos pequenos começos, faze crescer o que plantei em fraqueza. Torna a menor semente suficiente.",
            completion: "Dia três de Parábolas de Jesus.",
          },
          es: {
            title: "La Semilla Más Pequeña",
            devotional:
              "El reino comienza pequeño, casi invisible, y crece más allá de toda expectativa. Es aliento para el acto fiel demasiado pequeño para que alguien más lo note.",
            reflection: "¿Qué semilla pequeña has sentido la tentación de descartar?",
            prayer:
              "Dios de los comienzos pequeños, haz crecer lo que sembré en debilidad. Haz que la semilla más pequeña baste.",
            completion: "Día tres de Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "236bcc02-d13b-5ed1-8d18-5ebaae7da0e7",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "MUSTARD",
                normalized: "MUSTARD",
              },
              pt: {
                display: "MOSTARDA",
                normalized: "MOSTARDA",
              },
              es: {
                display: "MOSTAZA",
                normalized: "MOSTAZA",
              },
            },
          },
          {
            id: "2075bc32-3605-5102-a0f1-6d6fd273bbab",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SEED",
                normalized: "SEED",
              },
              pt: {
                display: "SEMENTE",
                normalized: "SEMENTE",
              },
              es: {
                display: "SEMILLA",
                normalized: "SEMILLA",
              },
            },
          },
          {
            id: "b993d1fa-0a32-5bef-9933-63797ceb5288",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "GROWTH",
                normalized: "GROWTH",
              },
              pt: {
                display: "CRESCIMENTO",
                normalized: "CRESCIMENTO",
              },
              es: {
                display: "CRECIMIENTO",
                normalized: "CRECIMIENTO",
              },
            },
          },
          {
            id: "04b92b89-d1f9-5dec-b2e5-324d779f819d",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "BRANCH",
                normalized: "BRANCH",
              },
              pt: {
                display: "RAMO",
                normalized: "RAMO",
              },
              es: {
                display: "RAMA",
                normalized: "RAMA",
              },
            },
          },
          {
            id: "ca43eaab-7047-55be-8a63-afc8335d871c",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "SMALLEST",
                normalized: "SMALLEST",
              },
              pt: {
                display: "MENOR",
                normalized: "MENOR",
              },
              es: {
                display: "MENOR",
                normalized: "MENOR",
              },
            },
          },
          {
            id: "65ba4d10-79a5-5eeb-a1aa-3e6a8e0b9ba2",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "KINGDOM",
                normalized: "KINGDOM",
              },
              pt: {
                display: "REINO",
                normalized: "REINO",
              },
              es: {
                display: "REINO",
                normalized: "REINO",
              },
            },
          },
        ],
      },
      {
        id: "f4763c41-5a18-566e-a943-ac687aba9114",
        slug: "good-samaritan-mercy",
        position: 3,
        difficulty: "balanced",
        theme: "Mercy",
        internalTitle: "Moved with Compassion",
        scripture: {
          bookCode: "LUK",
          chapter: 10,
          verseStart: 33,
          verseEnd: 33,
          displayReference: "Luke 10:33",
          storedText:
            "But a certain Samaritan, as he traveled, came where he was. When he saw him, he was moved with compassion,",
        },
        translations: {
          en: {
            title: "Moved with Compassion",
            devotional:
              "The people expected to stop passed by. The outsider stopped instead. Mercy in this story crosses the road, and crosses every category that was supposed to excuse someone from crossing it.",
            reflection: "Who have you crossed to the other side of the road to avoid?",
            prayer:
              "Compassionate God, make me the one who stops. Teach me to be a neighbor, not just to have one.",
            completion: "Day four of Parables of Jesus.",
          },
          pt: {
            title: "Compadecido",
            devotional:
              "Quem deveria parar passou longe. Foi o estrangeiro que parou. A misericórdia nesta história atravessa a estrada, e atravessa toda categoria que deveria justificar não atravessá-la.",
            reflection: "De quem você tem atravessado a estrada para evitar?",
            prayer:
              "Deus compassivo, faze de mim aquele que para. Ensina-me a ser próximo, não apenas a ter um.",
            completion: "Dia quatro de Parábolas de Jesus.",
          },
          es: {
            title: "Movido a Compasión",
            devotional:
              "Quienes debían detenerse pasaron de largo. Fue el forastero quien se detuvo. La misericordia en esta historia cruza el camino, y cruza toda categoría que debía justificar no cruzarlo.",
            reflection: "¿De quién has cruzado el camino para evitarlo?",
            prayer:
              "Dios compasivo, hazme el que se detiene. Enséñame a ser prójimo, no solo a tener uno.",
            completion: "Día cuatro de Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "6fd1db57-537a-5c3d-8a5f-85ae6f057204",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "SAMARITAN",
                normalized: "SAMARITAN",
              },
              pt: {
                display: "SAMARITANO",
                normalized: "SAMARITANO",
              },
              es: {
                display: "SAMARITANO",
                normalized: "SAMARITANO",
              },
            },
          },
          {
            id: "f54577cf-4aa5-5fea-9c28-1fc352b135c6",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "COMPASSION",
                normalized: "COMPASSION",
              },
              pt: {
                display: "COMPAIXÃO",
                normalized: "COMPAIXAO",
              },
              es: {
                display: "COMPASIÓN",
                normalized: "COMPASION",
              },
            },
          },
          {
            id: "010578f2-c93e-5f19-bd9c-1183f0450c90",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "NEIGHBOR",
                normalized: "NEIGHBOR",
              },
              pt: {
                display: "PRÓXIMO",
                normalized: "PROXIMO",
              },
              es: {
                display: "PRÓJIMO",
                normalized: "PROJIMO",
              },
            },
          },
          {
            id: "709e28b8-9ebe-52ca-a2cd-b867fbfd952d",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "WOUNDED",
                normalized: "WOUNDED",
              },
              pt: {
                display: "FERIDO",
                normalized: "FERIDO",
              },
              es: {
                display: "HERIDO",
                normalized: "HERIDO",
              },
            },
          },
          {
            id: "9fc9fba6-415a-5199-b5d7-be6881fb4a1a",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "MERCY",
                normalized: "MERCY",
              },
              pt: {
                display: "MISERICÓRDIA",
                normalized: "MISERICORDIA",
              },
              es: {
                display: "MISERICORDIA",
                normalized: "MISERICORDIA",
              },
            },
          },
          {
            id: "8acb23a8-7529-5674-b768-02e5fee712b5",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "ROAD",
                normalized: "ROAD",
              },
              pt: {
                display: "ESTRADA",
                normalized: "ESTRADA",
              },
              es: {
                display: "CAMINO",
                normalized: "CAMINO",
              },
            },
          },
        ],
      },
      {
        id: "67e21f2b-546f-52a9-9025-f31a9bf07a37",
        slug: "prodigal-son-still-far-off",
        position: 4,
        difficulty: "balanced",
        theme: "Grace",
        internalTitle: "While He Was Yet Far Off",
        scripture: {
          bookCode: "LUK",
          chapter: 15,
          verseStart: 20,
          verseEnd: 20,
          displayReference: "Luke 15:20",
          storedText:
            "He arose, and came to his father. But while he was yet far off, his father saw him, and was moved with compassion, and ran, and fell on his neck, and kissed him.",
        },
        translations: {
          en: {
            title: "While He Was Yet Far Off",
            devotional:
              "The father runs before the apology is finished. Grace in this story does not wait to hear the explanation — it moves while the son is still too far away to have said anything at all.",
            reflection: "What would it feel like to be run to, before you finished explaining?",
            prayer:
              "Father who runs, meet me while I am still far off. Let grace reach me before my excuses do.",
            completion: "Day five of Parables of Jesus.",
          },
          pt: {
            title: "Ainda Longe",
            devotional:
              "O pai corre antes que o pedido de desculpas termine. A graça nesta história não espera ouvir a explicação — ela se move enquanto o filho ainda está longe demais para ter dito qualquer coisa.",
            reflection: "Como seria ser recebido correndo, antes de terminar de se explicar?",
            prayer:
              "Pai que corre, vem ao meu encontro enquanto ainda estou longe. Que a graça me alcance antes das minhas desculpas.",
            completion: "Dia cinco de Parábolas de Jesus.",
          },
          es: {
            title: "Aún Lejos",
            devotional:
              "El padre corre antes de que termine la disculpa. La gracia en esta historia no espera oír la explicación — se mueve mientras el hijo aún está demasiado lejos para haber dicho nada.",
            reflection:
              "¿Cómo sería que corrieran a recibirte antes de que terminaras de explicarte?",
            prayer:
              "Padre que corre, sal a mi encuentro mientras aún estoy lejos. Que la gracia me alcance antes que mis excusas.",
            completion: "Día cinco de Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "e3b3a982-9a2e-554c-8f74-b2802b0dc3a1",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FATHER",
                normalized: "FATHER",
              },
              pt: {
                display: "PAI",
                normalized: "PAI",
              },
              es: {
                display: "PADRE",
                normalized: "PADRE",
              },
            },
          },
          {
            id: "7dd1e5b1-c0fb-5834-8262-ff65ac544014",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "DISTANT",
                normalized: "DISTANT",
              },
              pt: {
                display: "DISTANTE",
                normalized: "DISTANTE",
              },
              es: {
                display: "DISTANTE",
                normalized: "DISTANTE",
              },
            },
          },
          {
            id: "e4f27404-4a9d-512b-94bf-1334d2d68b49",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "COMPASSION",
                normalized: "COMPASSION",
              },
              pt: {
                display: "COMPAIXÃO",
                normalized: "COMPAIXAO",
              },
              es: {
                display: "COMPASIÓN",
                normalized: "COMPASION",
              },
            },
          },
          {
            id: "74ea109d-f85a-558d-a337-cbee342b5ab5",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "EMBRACE",
                normalized: "EMBRACE",
              },
              pt: {
                display: "ABRAÇO",
                normalized: "ABRACO",
              },
              es: {
                display: "ABRAZO",
                normalized: "ABRAZO",
              },
            },
          },
          {
            id: "aa83e9f9-8ae6-51a7-9521-5c4cefda641e",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "RETURN",
                normalized: "RETURN",
              },
              pt: {
                display: "VOLTA",
                normalized: "VOLTA",
              },
              es: {
                display: "REGRESO",
                normalized: "REGRESO",
              },
            },
          },
          {
            id: "8e0b93f2-fc78-56e4-aad7-b1e7a7ef4fa3",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "WELCOME",
                normalized: "WELCOME",
              },
              pt: {
                display: "ACOLHIDA",
                normalized: "ACOLHIDA",
              },
              es: {
                display: "BIENVENIDA",
                normalized: "BIENVENIDA",
              },
            },
          },
        ],
      },
      {
        id: "2a60d533-2f00-5526-bd6d-964d9182b9c9",
        slug: "talents-well-done",
        position: 5,
        difficulty: "challenging",
        theme: "Stewardship",
        internalTitle: "Well Done",
        scripture: {
          bookCode: "MAT",
          chapter: 25,
          verseStart: 21,
          verseEnd: 21,
          displayReference: "Matthew 25:21",
          storedText:
            "His lord said to him, 'Well done, good and faithful servant. You have been faithful over a few things, I will set you over many things. Enter into the joy of your lord.'",
        },
        translations: {
          en: {
            title: "Well Done",
            devotional:
              'The servants were entrusted with different amounts, and faithfulness was measured by use, not size. "Well done" was never said to whoever had the most — it was said to whoever was faithful with what they had.',
            reflection: "What has been entrusted to you that you have buried instead of used?",
            prayer:
              "Master who entrusts, make me faithful with what you gave me, however small it looks beside what you gave another.",
            completion: "Day six of Parables of Jesus.",
          },
          pt: {
            title: "Bem Feito",
            devotional:
              'Os servos foram confiados com quantias diferentes, e a fidelidade foi medida pelo uso, não pelo tamanho. "Bem feito" nunca foi dito a quem tinha mais — foi dito a quem foi fiel com o que tinha.',
            reflection: "O que foi confiado a você que ficou enterrado em vez de usado?",
            prayer:
              "Senhor que confia, faze-me fiel com o que me deste, por menor que pareça perto do que deste a outro.",
            completion: "Dia seis de Parábolas de Jesus.",
          },
          es: {
            title: "Bien Hecho",
            devotional:
              'Los siervos fueron confiados con cantidades distintas, y la fidelidad se midió por el uso, no por el tamaño. "Bien hecho" nunca se dijo a quien tenía más — se dijo a quien fue fiel con lo que tenía.',
            reflection: "¿Qué se te ha confiado que enterraste en vez de usar?",
            prayer:
              "Señor que confía, hazme fiel con lo que me diste, por pequeño que parezca junto a lo que diste a otro.",
            completion: "Día seis de Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "160bb3e3-32a9-5e9c-b507-cf82c12b030c",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "TALENTS",
                normalized: "TALENTS",
              },
              pt: {
                display: "TALENTOS",
                normalized: "TALENTOS",
              },
              es: {
                display: "TALENTOS",
                normalized: "TALENTOS",
              },
            },
          },
          {
            id: "3476e66f-19f4-557f-9dc1-0583d124c647",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "ENTRUSTED",
                normalized: "ENTRUSTED",
              },
              pt: {
                display: "CONFIADO",
                normalized: "CONFIADO",
              },
              es: {
                display: "CONFIADO",
                normalized: "CONFIADO",
              },
            },
          },
          {
            id: "de8ea664-ea7c-586e-8c50-9d97934f67be",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FAITHFUL",
                normalized: "FAITHFUL",
              },
              pt: {
                display: "FIEL",
                normalized: "FIEL",
              },
              es: {
                display: "FIEL",
                normalized: "FIEL",
              },
            },
          },
          {
            id: "85b16f0c-1e80-5f45-87a9-8ef2665549d2",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "BURIED",
                normalized: "BURIED",
              },
              pt: {
                display: "ENTERRADO",
                normalized: "ENTERRADO",
              },
              es: {
                display: "ENTERRADO",
                normalized: "ENTERRADO",
              },
            },
          },
          {
            id: "c54ee19f-ded8-5a36-8e38-6b815d56a536",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "INVESTED",
                normalized: "INVESTED",
              },
              pt: {
                display: "INVESTIDO",
                normalized: "INVESTIDO",
              },
              es: {
                display: "INVERTIDO",
                normalized: "INVERTIDO",
              },
            },
          },
          {
            id: "52747787-b6b6-594c-9bc6-cbacb37e836a",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "MASTER",
                normalized: "MASTER",
              },
              pt: {
                display: "SENHOR",
                normalized: "SENHOR",
              },
              es: {
                display: "SEÑOR",
                normalized: "SEÑOR",
              },
            },
          },
        ],
      },
      {
        id: "c667c66a-c6bf-5468-8282-ce5faf4a44f2",
        slug: "wise-foolish-builders",
        position: 6,
        difficulty: "challenging",
        theme: "Foundation",
        internalTitle: "Built on the Rock",
        scripture: {
          bookCode: "MAT",
          chapter: 7,
          verseStart: 24,
          verseEnd: 24,
          displayReference: "Matthew 7:24",
          storedText:
            "Everyone therefore who hears these words of mine, and does them, I will liken him to a wise man, who built his house on a rock.",
        },
        translations: {
          en: {
            title: "Built on the Rock",
            devotional:
              "Both builders hear the same words. Both face the same storm. The only difference between them is what they did with what they heard before the rain came.",
            reflection: "What are you building that has never been tested by a storm?",
            prayer:
              "Rock of my foundation, let me not only hear your words but build my life on them.",
            completion: "You finished Parables of Jesus.",
          },
          pt: {
            title: "Edificado sobre a Rocha",
            devotional:
              "Os dois construtores ouvem as mesmas palavras. Os dois enfrentam a mesma tempestade. A única diferença entre eles é o que fizeram com o que ouviram antes da chuva chegar.",
            reflection: "O que você está construindo que nunca foi testado por uma tempestade?",
            prayer:
              "Rocha do meu fundamento, que eu não apenas ouça tuas palavras, mas construa minha vida sobre elas.",
            completion: "Você concluiu Parábolas de Jesus.",
          },
          es: {
            title: "Edificado sobre la Roca",
            devotional:
              "Ambos constructores oyen las mismas palabras. Ambos enfrentan la misma tormenta. La única diferencia entre ellos es lo que hicieron con lo que oyeron antes de que llegara la lluvia.",
            reflection: "¿Qué estás construyendo que nunca ha sido probado por una tormenta?",
            prayer:
              "Roca de mi cimiento, que no solo oiga tus palabras, sino que construya mi vida sobre ellas.",
            completion: "Terminaste Parábolas de Jesús.",
          },
        },
        words: [
          {
            id: "be669d30-6a00-5072-ab10-355a8781d9cf",
            position: 0,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "FOUNDATION",
                normalized: "FOUNDATION",
              },
              pt: {
                display: "FUNDAÇÃO",
                normalized: "FUNDACAO",
              },
              es: {
                display: "FUNDAMENTO",
                normalized: "FUNDAMENTO",
              },
            },
          },
          {
            id: "bba108a9-ed4c-5149-a689-41eb72e6fed3",
            position: 1,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "ROCK",
                normalized: "ROCK",
              },
              pt: {
                display: "ROCHA",
                normalized: "ROCHA",
              },
              es: {
                display: "ROCA",
                normalized: "ROCA",
              },
            },
          },
          {
            id: "2fbb9c69-6235-579e-9cbb-8970fd01cc00",
            position: 2,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "STORM",
                normalized: "STORM",
              },
              pt: {
                display: "TEMPESTADE",
                normalized: "TEMPESTADE",
              },
              es: {
                display: "TORMENTA",
                normalized: "TORMENTA",
              },
            },
          },
          {
            id: "1d0a9ea0-9caa-5919-b01c-40a0d38d0c2f",
            position: 3,
            minDifficulty: "gentle",
            translations: {
              en: {
                display: "BUILDER",
                normalized: "BUILDER",
              },
              pt: {
                display: "CONSTRUTOR",
                normalized: "CONSTRUTOR",
              },
              es: {
                display: "CONSTRUCTOR",
                normalized: "CONSTRUCTOR",
              },
            },
          },
          {
            id: "755bd583-3c5a-540f-b630-7d9cff7d36e6",
            position: 4,
            minDifficulty: "balanced",
            translations: {
              en: {
                display: "OBEY",
                normalized: "OBEY",
              },
              pt: {
                display: "OBEDECER",
                normalized: "OBEDECER",
              },
              es: {
                display: "OBEDECER",
                normalized: "OBEDECER",
              },
            },
          },
          {
            id: "c5dd46eb-aa43-5e56-a62f-ccd1e05361b2",
            position: 5,
            minDifficulty: "challenging",
            translations: {
              en: {
                display: "STAND",
                normalized: "STAND",
              },
              pt: {
                display: "FIRME",
                normalized: "FIRME",
              },
              es: {
                display: "FIRME",
                normalized: "FIRME",
              },
            },
          },
        ],
      },
    ],
  },
];
