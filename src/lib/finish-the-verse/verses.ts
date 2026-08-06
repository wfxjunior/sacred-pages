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
    explanation:
      "God's love is not a mood but a gift with a name: he gave his Son. Believing is not managing to feel enough — it is receiving what was already given.",
    prayer:
      "So loved, Father, that you gave. I receive your Son today and hold on to life that does not perish.",
  },
  {
    reference: "Psalm 23:1",
    text: "Yahweh is my shepherd; I shall lack nothing.",
    explanation:
      "A shepherd walks ahead of the flock, not behind it. If the Lord is yours, lack loses its last word — not because you have everything, but because you are led.",
    prayer: "Shepherd of my life, because you lead me I shall not want. Walk ahead of me today.",
  },
  {
    reference: "Proverbs 3:5",
    text: "Trust in Yahweh with all your heart, and don't lean on your own understanding.",
    explanation:
      "Leaning is a whole-body posture: whatever you lean on carries your weight. This verse asks where your weight actually rests when understanding runs out.",
    prayer: "Lord, I trust you with all my heart. Where my understanding ends, hold my weight.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
    explanation:
      "Paul wrote this from prison, about contentment — plenty or hunger, either way. The strength promised here is not for every ambition but for every circumstance.",
    prayer: "Christ my strength, teach me both abundance and need. In you I can face all things.",
  },
  {
    reference: "Psalm 119:105",
    text: "Your word is a lamp to my feet, and a light for my path.",
    explanation:
      "A lamp for the feet lights the next step, not the whole road. Scripture rarely shows the distant future; it reliably shows where to put your foot today.",
    prayer:
      "Let your word be the lamp at my feet today. I do not need the whole road — light my next step.",
  },
  {
    reference: "Romans 8:28",
    text: "We know that all things work together for good for those who love God, for those who are called according to his purpose.",
    explanation:
      "All things work together — not all things are good. The promise is not that nothing will hurt, but that nothing is wasted in the hands of the one who loves you.",
    prayer:
      "God who wastes nothing, work even this together for good. I love you and rest in your purpose.",
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first God's Kingdom and his righteousness; and all these things will be given to you as well.",
    explanation:
      "Seek first — the verse does not abolish your needs, it orders them. What you put first quietly organizes everything behind it.",
    prayer:
      "Lord, I put your kingdom first today. Order everything else behind it, and I will not be anxious.",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God.",
    explanation:
      "Be still is not a relaxation technique; it is surrender on a battlefield. You stop striving because someone stronger holds the field.",
    prayer: "Still my striving, God. Be exalted while I let go — the battle is yours.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Don't be afraid. Don't be dismayed, for Yahweh your God is with you wherever you go.",
    explanation:
      "The command to be strong comes with its reason attached: the Lord goes with you. Courage here is not a temperament — it is a consequence of company.",
    prayer: "Lord my God, you are with me wherever I go. Make me strong and very courageous today.",
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint.",
    explanation:
      "Waiting on the Lord is not passivity; it is where strength gets exchanged. Yours runs out — his renews, like wings where there was exhaustion.",
    prayer: "Renew my strength as I wait on you, Lord. Lift me on wings like the eagle's.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
    explanation:
      "The invitation is addressed precisely to the tired — not to the sorted-out. Rest is not the reward for finishing; it is the gift for coming.",
    prayer: "Jesus, I come to you weary and carrying much. Give me the rest you promised.",
  },
  {
    reference: "Psalm 27:1",
    text: "Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?",
    explanation:
      "Light, salvation, stronghold — three names, one Lord, and the fear question asked twice. Fear shrinks when you say out loud who yours is.",
    prayer: "Lord, my light and my salvation, of whom shall I be afraid? Shine ahead of me today.",
  },
  {
    reference: "Isaiah 41:10",
    text: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God. I will strengthen you. Yes, I will help you.",
    explanation:
      "Fear not — because I am with you. Every command in this verse leans on a presence, and the grip described is his hand holding yours, not yours holding his.",
    prayer: "Hold me with your righteous right hand, my God. I will not fear, for you are with me.",
  },
  {
    reference: "John 14:6",
    text: "Jesus said to him, I am the way, the truth, and the life. No one comes to the Father, except through me.",
    explanation:
      "Jesus does not say he shows a way; he says he is one. The claim is exclusive, but the door is open: no one comes except through him — and anyone may come through him.",
    prayer:
      "Jesus, way, truth and life — I come to the Father through you. Keep me on you, not merely near you.",
  },
  {
    reference: "Romans 12:2",
    text: "Don't be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God.",
    explanation:
      "Conformity happens by default; transformation takes a renewed mind. The world presses from outside — the Spirit renews from inside, and only one of them asks permission.",
    prayer:
      "Renew my mind, Lord, until I can test and approve your will. Unshape what the world pressed into me.",
  },
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new.",
    explanation:
      "New creation is a verdict, not a feeling: the old passed, the new has come. You do not build the new self — you step into it.",
    prayer:
      "Maker of new things, I am in Christ — let the old keep passing. I step into what you have made new.",
  },
  {
    reference: "Ephesians 2:8",
    text: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God.",
    explanation:
      "Grace means the decisive gift moves from God to you, not the reverse. Even the faith that receives it arrives as a present, so no one can boast.",
    prayer:
      "By grace I am saved, through faith — and none of it my doing. Thank you for the gift I could never earn.",
  },
  {
    reference: "Hebrews 11:1",
    text: "Now faith is assurance of things hoped for, proof of things not seen.",
    explanation:
      "Faith is not certainty about everything; it is assurance about someone. It treats what God promised as solid ground before the eyes catch up.",
    prayer:
      "Author of my faith, make your promises solid ground under me. I will walk on what I cannot yet see.",
  },
  {
    reference: "Lamentations 3:22-23",
    text: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail. They are new every morning. Great is your faithfulness.",
    explanation:
      "These lines were written in the ruins of a burned city. Mercies new every morning is not naivety — it is what a survivor found still standing.",
    prayer:
      "Faithful God, your mercies are new this very morning. Because of them, I am not consumed.",
  },
  {
    reference: "Psalm 118:24",
    text: "This is the day that Yahweh has made. We will rejoice and be glad in it!",
    explanation:
      "This is the day — this ordinary one, not the one you are waiting for. Rejoicing is named as a decision made at sunrise, before the day proves anything.",
    prayer:
      "This is the day you have made, Lord. I choose to rejoice in it before it proves itself.",
  },
];

// Portuguese: João Ferreira de Almeida (public domain).
const PT_VERSES: readonly VersePassage[] = [
  {
    reference: "João 3:16",
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    explanation:
      "O amor de Deus não é um humor, é um presente com nome: ele deu o seu Filho. Crer não é conseguir sentir o bastante — é receber o que já foi dado.",
    prayer:
      "Amaste tanto, Pai, que deste. Recebo hoje o teu Filho e me firmo na vida que não perece.",
  },
  {
    reference: "Salmos 23:1",
    text: "O Senhor é o meu pastor; nada me faltará.",
    explanation:
      "O pastor caminha à frente do rebanho, não atrás. Se o Senhor é teu, a falta perde a última palavra — não porque tens tudo, mas porque és conduzido.",
    prayer: "Pastor da minha vida, porque me guias, nada me faltará. Caminha à minha frente hoje.",
  },
  {
    reference: "Provérbios 3:5",
    text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.",
    explanation:
      "Encostar-se é postura do corpo inteiro: aquilo em que você se apoia carrega o seu peso. Este verso pergunta onde seu peso descansa quando o entendimento acaba.",
    prayer:
      "Senhor, confio em ti de todo o coração. Onde meu entendimento termina, sustenta meu peso.",
  },
  {
    reference: "Filipenses 4:13",
    text: "Posso todas as coisas em Cristo que me fortalece.",
    explanation:
      "Paulo escreveu isto da prisão, falando de contentamento — fartura ou fome, tanto faz. A força prometida aqui não é para toda ambição, é para toda circunstância.",
    prayer:
      "Cristo, minha força, ensina-me a fartura e a necessidade. Em ti posso todas as coisas.",
  },
  {
    reference: "Salmos 119:105",
    text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.",
    explanation:
      "Lâmpada para os pés ilumina o próximo passo, não a estrada inteira. A Escritura raramente mostra o futuro distante; mostra, com fidelidade, onde pisar hoje.",
    prayer:
      "Que tua palavra seja lâmpada para os meus pés hoje. Não preciso da estrada inteira — ilumina meu próximo passo.",
  },
  {
    reference: "Romanos 8:28",
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    explanation:
      "Todas as coisas cooperam — não que todas as coisas sejam boas. A promessa não é que nada vai doer, mas que nada se perde nas mãos de quem te ama.",
    prayer:
      "Deus que nada desperdiça, faze até isto cooperar para o bem. Eu te amo e descanso no teu propósito.",
  },
  {
    reference: "Mateus 6:33",
    text: "Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    explanation:
      "Buscai primeiro — o verso não elimina as tuas necessidades, ele as ordena. O que você põe em primeiro lugar organiza, em silêncio, tudo o que vem atrás.",
    prayer:
      "Senhor, ponho teu reino em primeiro lugar hoje. Ordena todo o resto atrás dele, e não andarei ansioso.",
  },
  {
    reference: "Salmos 46:10",
    text: "Aquietai-vos, e sabei que eu sou Deus.",
    explanation:
      "Aquietai-vos não é técnica de relaxamento; é rendição em campo de batalha. Você para de lutar porque alguém mais forte domina o campo.",
    prayer: "Aquieta minha luta, ó Deus. Sê exaltado enquanto eu solto — a batalha é tua.",
  },
  {
    reference: "Josué 1:9",
    text: "Esforça-te, e tem bom ânimo; não temas, nem te espantes, porque o Senhor teu Deus é contigo, por onde quer que andares.",
    explanation:
      "A ordem de ser forte vem com o motivo grudado nela: o Senhor vai contigo. Coragem aqui não é temperamento — é consequência de companhia.",
    prayer:
      "Senhor meu Deus, tu estás comigo por onde eu andar. Faze-me forte e mui corajoso hoje.",
  },
  {
    reference: "Isaías 40:31",
    text: "Mas os que esperam no Senhor renovarão as suas forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.",
    explanation:
      "Esperar no Senhor não é passividade; é onde a força é trocada. A tua acaba — a dele renova, como asas onde havia exaustão.",
    prayer:
      "Renova minhas forças enquanto espero em ti, Senhor. Levanta-me sobre asas como as da águia.",
  },
  {
    reference: "Mateus 11:28",
    text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    explanation:
      "O convite é endereçado exatamente aos cansados — não aos resolvidos. O descanso não é prêmio por terminar; é presente por vir.",
    prayer: "Jesus, venho a ti cansado e carregando muito. Dá-me o descanso que prometeste.",
  },
  {
    reference: "Salmos 27:1",
    text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?",
    explanation:
      "Luz, salvação, fortaleza — três nomes, um Senhor, e a pergunta do medo feita duas vezes. O medo encolhe quando você diz em voz alta de quem você é.",
    prayer: "Senhor, minha luz e minha salvação, a quem temerei? Brilha à minha frente hoje.",
  },
  {
    reference: "Isaías 41:10",
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.",
    explanation:
      "Não temas — porque eu sou contigo. Cada ordem deste verso se apoia numa presença, e o aperto descrito é a mão dele segurando a tua, não a tua segurando a dele.",
    prayer: "Sustenta-me com a tua destra fiel, meu Deus. Não temerei, porque tu és comigo.",
  },
  {
    reference: "João 14:6",
    text: "Disse-lhe Jesus: Eu sou o caminho, e a verdade, e a vida; ninguém vem ao Pai, senão por mim.",
    explanation:
      "Jesus não diz que mostra um caminho; diz que é o caminho. A afirmação é exclusiva, mas a porta está aberta: ninguém vem senão por ele — e qualquer um pode vir por ele.",
    prayer:
      "Jesus, caminho, verdade e vida — venho ao Pai por ti. Guarda-me em ti, não apenas perto de ti.",
  },
  {
    reference: "Romanos 12:2",
    text: "E não vos conformeis com este mundo, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.",
    explanation:
      "A conformação acontece por padrão; a transformação exige mente renovada. O mundo pressiona de fora — o Espírito renova de dentro, e só um dos dois pede licença.",
    prayer:
      "Renova minha mente, Senhor, até que eu experimente a tua boa vontade. Desfaz o que o mundo moldou em mim.",
  },
  {
    reference: "2 Coríntios 5:17",
    text: "Assim que, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.",
    explanation:
      "Nova criatura é veredito, não sentimento: o velho passou, o novo chegou. Você não constrói o novo eu — você entra nele.",
    prayer:
      "Criador do novo, estou em Cristo — que o velho continue passando. Entro no que fizeste novo.",
  },
  {
    reference: "Efésios 2:8",
    text: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós, é dom de Deus.",
    explanation:
      "Graça significa que o presente decisivo vai de Deus para você, não o contrário. Até a fé que o recebe chega como presente, para que ninguém se glorie.",
    prayer:
      "Pela graça sou salvo, mediante a fé — e nada disso vem de mim. Obrigado pelo dom que eu jamais poderia merecer.",
  },
  {
    reference: "Hebreus 11:1",
    text: "Ora, a fé é o firme fundamento das coisas que se esperam, e a prova das coisas que se não veem.",
    explanation:
      "Fé não é certeza sobre tudo; é firmeza sobre alguém. Ela trata o que Deus prometeu como chão firme antes que os olhos alcancem.",
    prayer:
      "Autor da minha fé, faze das tuas promessas chão firme sob mim. Andarei sobre o que ainda não vejo.",
  },
  {
    reference: "Lamentações 3:22-23",
    text: "As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; novas são cada manhã; grande é a tua fidelidade.",
    explanation:
      "Estas linhas foram escritas nas ruínas de uma cidade queimada. Misericórdias novas a cada manhã não é ingenuidade — é o que um sobrevivente encontrou de pé.",
    prayer:
      "Deus fiel, tuas misericórdias são novas nesta manhã. Por causa delas, não sou consumido.",
  },
  {
    reference: "Salmos 118:24",
    text: "Este é o dia que fez o Senhor; regozijemo-nos, e alegremo-nos nele.",
    explanation:
      "Este é o dia — este comum, não aquele que você espera. Alegrar-se aparece como decisão tomada ao nascer do sol, antes que o dia prove qualquer coisa.",
    prayer:
      "Este é o dia que tu fizeste, Senhor. Escolho alegrar-me nele antes que ele prove qualquer coisa.",
  },
];

// Spanish: Reina-Valera 1909 (public domain).
const ES_VERSES: readonly VersePassage[] = [
  {
    reference: "Juan 3:16",
    text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
    explanation:
      "El amor de Dios no es un estado de ánimo sino un regalo con nombre: dio a su Hijo. Creer no es lograr sentir lo suficiente — es recibir lo que ya fue dado.",
    prayer:
      "Amaste tanto, Padre, que diste. Recibo hoy a tu Hijo y me afirmo en la vida que no perece.",
  },
  {
    reference: "Salmos 23:1",
    text: "Jehová es mi pastor; nada me faltará.",
    explanation:
      "El pastor camina delante del rebaño, no detrás. Si el Señor es tuyo, la carencia pierde la última palabra — no porque lo tengas todo, sino porque eres guiado.",
    prayer: "Pastor de mi vida, porque me guías, nada me faltará. Camina delante de mí hoy.",
  },
  {
    reference: "Proverbios 3:5",
    text: "Fíate de Jehová de todo tu corazón, y no estribes en tu propia prudencia.",
    explanation:
      "Apoyarse es postura de todo el cuerpo: aquello en lo que te apoyas carga tu peso. Este verso pregunta dónde descansa tu peso cuando el entendimiento se acaba.",
    prayer:
      "Señor, confío en ti con todo mi corazón. Donde termina mi entendimiento, sostén mi peso.",
  },
  {
    reference: "Filipenses 4:13",
    text: "Todo lo puedo en Cristo que me fortalece.",
    explanation:
      "Pablo escribió esto desde la cárcel, hablando de contentamiento — abundancia o hambre, da igual. La fuerza prometida aquí no es para toda ambición sino para toda circunstancia.",
    prayer:
      "Cristo, mi fuerza, enséñame la abundancia y la necesidad. En ti puedo enfrentarlo todo.",
  },
  {
    reference: "Salmos 119:105",
    text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
    explanation:
      "Una lámpara a los pies alumbra el siguiente paso, no todo el camino. La Escritura rara vez muestra el futuro lejano; muestra, con fidelidad, dónde pisar hoy.",
    prayer:
      "Que tu palabra sea lámpara a mis pies hoy. No necesito todo el camino — alumbra mi siguiente paso.",
  },
  {
    reference: "Romanos 8:28",
    text: "Y sabemos que a los que a Dios aman, todas las cosas les ayudan a bien, es a saber, a los que conforme al propósito son llamados.",
    explanation:
      "Todas las cosas cooperan — no que todas las cosas sean buenas. La promesa no es que nada dolerá, sino que nada se pierde en las manos de quien te ama.",
    prayer:
      "Dios que nada desperdicia, haz que aun esto coopere para bien. Te amo y descanso en tu propósito.",
  },
  {
    reference: "Mateo 6:33",
    text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.",
    explanation:
      "Buscad primero — el verso no elimina tus necesidades, las ordena. Lo que pones primero organiza, en silencio, todo lo que viene detrás.",
    prayer:
      "Señor, pongo tu reino primero hoy. Ordena todo lo demás detrás de él, y no andaré ansioso.",
  },
  {
    reference: "Salmos 46:10",
    text: "Estad quietos, y conoced que yo soy Dios.",
    explanation:
      "Estad quietos no es una técnica de relajación; es rendición en un campo de batalla. Dejas de esforzarte porque alguien más fuerte domina el campo.",
    prayer: "Aquieta mi lucha, oh Dios. Sé exaltado mientras suelto — la batalla es tuya.",
  },
  {
    reference: "Josué 1:9",
    text: "Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios será contigo en dondequiera que anduvieres.",
    explanation:
      "La orden de ser fuerte trae pegada su razón: el Señor va contigo. El valor aquí no es temperamento — es consecuencia de compañía.",
    prayer: "Señor mi Dios, tú estás conmigo dondequiera que voy. Hazme fuerte y muy valiente hoy.",
  },
  {
    reference: "Isaías 40:31",
    text: "Mas los que esperan a Jehová tendrán nuevas fuerzas; levantarán las alas como águilas, correrán, y no se cansarán, caminarán, y no se fatigarán.",
    explanation:
      "Esperar en el Señor no es pasividad; es donde se intercambia la fuerza. La tuya se acaba — la suya renueva, como alas donde había agotamiento.",
    prayer:
      "Renueva mis fuerzas mientras espero en ti, Señor. Levántame sobre alas como las del águila.",
  },
  {
    reference: "Mateo 11:28",
    text: "Venid a mí todos los que estáis trabajados y cargados, que yo os haré descansar.",
    explanation:
      "La invitación va dirigida precisamente a los cansados — no a los resueltos. El descanso no es premio por terminar; es regalo por venir.",
    prayer: "Jesús, vengo a ti cansado y cargado. Dame el descanso que prometiste.",
  },
  {
    reference: "Salmos 118:24",
    text: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.",
    explanation:
      "Este es el día — este ordinario, no el que esperas. Alegrarse aparece como una decisión tomada al amanecer, antes de que el día demuestre nada.",
    prayer: "Este es el día que hiciste, Señor. Elijo alegrarme en él antes de que demuestre nada.",
  },
  {
    reference: "Salmos 27:1",
    text: "Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?",
    explanation:
      "Luz, salvación, fortaleza — tres nombres, un Señor, y la pregunta del miedo hecha dos veces. El miedo se encoge cuando dices en voz alta de quién eres.",
    prayer: "Señor, mi luz y mi salvación, ¿a quién temeré? Brilla delante de mí hoy.",
  },
  {
    reference: "Juan 14:6",
    text: "Jesús le dice: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.",
    explanation:
      "Jesús no dice que muestra un camino; dice que es el camino. La afirmación es exclusiva, pero la puerta está abierta: nadie viene sino por él — y cualquiera puede venir por él.",
    prayer:
      "Jesús, camino, verdad y vida — vengo al Padre por ti. Guárdame en ti, no solo cerca de ti.",
  },
  {
    reference: "Romanos 12:2",
    text: "Y no os conforméis a este siglo; mas reformaos por la renovación de vuestro entendimiento, para que experimentéis cuál sea la buena voluntad de Dios, agradable y perfecta.",
    explanation:
      "La conformidad ocurre por defecto; la transformación exige una mente renovada. El mundo presiona desde fuera — el Espíritu renueva desde dentro, y solo uno de los dos pide permiso.",
    prayer:
      "Renueva mi mente, Señor, hasta que compruebe tu buena voluntad. Deshaz lo que el mundo moldeó en mí.",
  },
  {
    reference: "2 Corintios 5:17",
    text: "De modo que si alguno está en Cristo, nueva criatura es: las cosas viejas pasaron; he aquí todas son hechas nuevas.",
    explanation:
      "Nueva criatura es un veredicto, no un sentimiento: lo viejo pasó, lo nuevo llegó. No construyes el nuevo yo — entras en él.",
    prayer:
      "Hacedor de lo nuevo, estoy en Cristo — que lo viejo siga pasando. Entro en lo que hiciste nuevo.",
  },
  {
    reference: "Efesios 2:8",
    text: "Porque por gracia sois salvos por la fe; y esto no de vosotros, pues es don de Dios.",
    explanation:
      "Gracia significa que el regalo decisivo va de Dios hacia ti, no al revés. Hasta la fe que lo recibe llega como regalo, para que nadie se gloríe.",
    prayer:
      "Por gracia soy salvo, por medio de la fe — y nada de esto viene de mí. Gracias por el don que jamás podría ganar.",
  },
  {
    reference: "Hebreos 11:1",
    text: "Es pues la fe la sustancia de las cosas que se esperan, la demostración de las cosas que no se ven.",
    explanation:
      "La fe no es certeza sobre todo; es firmeza sobre alguien. Trata lo que Dios prometió como suelo firme antes de que los ojos lo alcancen.",
    prayer:
      "Autor de mi fe, haz de tus promesas suelo firme bajo mis pies. Caminaré sobre lo que aún no veo.",
  },
  {
    reference: "Lamentaciones 3:22-23",
    text: "Es por la misericordia de Jehová que no somos consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.",
    explanation:
      "Estas líneas fueron escritas en las ruinas de una ciudad quemada. Misericordias nuevas cada mañana no es ingenuidad — es lo que un sobreviviente halló en pie.",
    prayer:
      "Dios fiel, tus misericordias son nuevas esta misma mañana. Por ellas no soy consumido.",
  },
  {
    reference: "Isaías 41:10",
    text: "No temas, que yo soy contigo; no desmayes, que yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.",
    explanation:
      "No temas — porque yo estoy contigo. Cada orden de este verso se apoya en una presencia, y el agarre descrito es su mano sosteniendo la tuya, no la tuya sosteniendo la suya.",
    prayer: "Sostenme con tu diestra justiciera, Dios mío. No temeré, porque tú estás conmigo.",
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
