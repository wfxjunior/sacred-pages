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
];
