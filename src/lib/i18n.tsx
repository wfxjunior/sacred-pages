import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "pt" | "es";

type Dict = Record<string, string>;

const en: Dict = {
  "brand.name": "Lumen Verse",
  "brand.tagline": "Your daily journey through God's Word.",
  "nav.home": "Home",
  "nav.today": "Today's Journey",
  "nav.collections": "Collections",
  "nav.progress": "My Progress",
  "nav.favorites": "Favorites",
  "nav.about": "About",
  "nav.pricing": "Pricing",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.help": "Help",
  "nav.myJourney": "My Journey",
  "cta.signin": "Sign In",
  "cta.startFree": "Start Free",
  "cta.startJourney": "Start Your Journey",
  "cta.exploreToday": "Explore Today's Journey",
  "cta.begin": "Begin Journey",
  "hero.title": "Make Scripture part of your everyday life.",
  "hero.sub": "Daily devotionals, interactive Bible word searches, reflections, and meaningful journeys designed to help you grow in God's Word.",
  "intro.title": "Every day, a small ritual with God's Word.",
  "intro.sub": "Each journey brings together everything you need for a quiet, meaningful moment with Scripture.",
  "intro.scripture": "A Scripture passage",
  "intro.devotional": "A short devotional",
  "intro.wordsearch": "An interactive word search",
  "intro.reflection": "A personal reflection",
  "intro.prayer": "A guided prayer",
  "intro.progress": "Your personal progress",
  "today.title": "Today's Journey",
  "today.name": "Gratitude That Transforms",
  "today.reference": "Philippians 4:6–7",
  "today.duration": "About 7 minutes",
  "today.difficulty": "Gentle",
  "how.title": "How your journey unfolds",
  "how.read": "Read",
  "how.readDesc": "Begin with a short, thoughtful devotional grounded in Scripture.",
  "how.discover": "Discover",
  "how.discoverDesc": "Find the key words hidden inside a calm, interactive grid.",
  "how.reflect": "Reflect",
  "how.reflectDesc": "Close with a personal reflection and a quiet prayer.",
  "collections.title": "A living Scripture library",
  "collections.sub": "Curated journeys, organized around the people, books, and themes you love most.",
  "personalize.title": "Made to feel like yours",
  "personalize.sub": "Adjust the reading experience with quiet, thoughtful controls.",
  "progress.title": "A calm view of your consistency",
  "progress.sub": "No leaderboards. Just gentle encouragement to stay in the Word.",
  "pricing.title": "Simple, honest membership",
  "pricing.free": "Free",
  "pricing.premium": "Premium",
  "pricing.month": "/month",
  "pricing.freePrice": "$0",
  "pricing.premiumPrice": "$6",
  "final.title": "Begin with a few meaningful minutes today.",
  "footer.rights": "All rights reserved.",
  "auth.signin": "Sign in to your journey",
  "auth.signup": "Create your account",
  "auth.forgot": "Reset your password",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Full name",
  "auth.continue": "Continue",
  "auth.noAccount": "New here?",
  "auth.haveAccount": "Already have an account?",
  "auth.forgotLink": "Forgot password?",
  "app.greeting.morning": "Good morning",
  "app.greeting.sub": "Take a few quiet minutes for today's journey.",
  "app.streak": "Current streak",
  "app.days": "days",
  "app.week": "This week",
  "app.continue": "Continue a collection",
  "app.recommended": "Recommended for you",
  "app.milestones": "Recent milestones",
  "journey.scripture": "Scripture",
  "journey.devotional": "Devotional",
  "journey.reflection": "Reflection",
  "journey.prayer": "Prayer",
  "journey.wordList": "Word list",
  "journey.help": "Help",
  "journey.settings": "Settings",
  "journey.selectionColor": "Selection color",
  "journey.difficulty": "Difficulty",
  "help.revealLetter": "Reveal first letter",
  "help.showDirection": "Show direction",
  "help.revealWord": "Reveal one word",
  "help.viewSolution": "View full solution",
  "help.confirmTitle": "Reveal the full solution?",
  "help.confirmBody": "Would you like to reveal the full solution? Your journey will remain saved and marked as completed with help.",
  "help.cancel": "Not yet",
  "help.confirm": "Reveal solution",
  "complete.title": "Today's journey is complete.",
  "complete.sub": "You spent a meaningful moment in Scripture.",
  "complete.favorite": "Save to Favorites",
  "complete.share": "Share Journey",
  "complete.home": "Return Home",
  "complete.another": "Explore Another Collection",
  "diff.gentle": "Gentle",
  "diff.balanced": "Balanced",
  "diff.challenging": "Challenging",
  "diff.expert": "Expert",
  "diff.gentleDesc": "Smaller grid, fewer words, horizontal and vertical.",
  "diff.balancedDesc": "Medium grid with diagonals.",
  "diff.challengingDesc": "Larger grid with reversed and diagonal words.",
  "diff.expertDesc": "Dense grid, more words, all directions and reversed.",
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.color": "Selection color",
  "settings.difficulty": "Difficulty preference",
  "settings.fontSize": "Font size",
  "settings.theme": "Reading mode",
  "settings.sound": "Sound effects",
  "settings.reminders": "Email reminders",
  "settings.profile": "Profile information",
  "settings.light": "Light",
  "settings.dark": "Dark",
  "settings.small": "Small",
  "settings.medium": "Medium",
  "settings.large": "Large",
};

const pt: Dict = {
  ...en,
  "brand.tagline": "Sua jornada diária pela Palavra de Deus.",
  "nav.home": "Início",
  "nav.today": "Jornada de Hoje",
  "nav.collections": "Coleções",
  "nav.progress": "Meu Progresso",
  "nav.favorites": "Favoritos",
  "nav.about": "Sobre",
  "nav.pricing": "Planos",
  "nav.profile": "Perfil",
  "nav.settings": "Ajustes",
  "nav.help": "Ajuda",
  "nav.myJourney": "Minha Jornada",
  "cta.signin": "Entrar",
  "cta.startFree": "Começar Grátis",
  "cta.startJourney": "Começar sua Jornada",
  "cta.exploreToday": "Explorar Jornada de Hoje",
  "cta.begin": "Iniciar Jornada",
  "hero.title": "Faça das Escrituras parte do seu dia.",
  "hero.sub": "Devocionais diários, caça-palavras bíblicos interativos, reflexões e jornadas significativas para crescer na Palavra.",
  "today.name": "Gratidão que Transforma",
  "today.duration": "Cerca de 7 minutos",
  "today.difficulty": "Suave",
  "final.title": "Comece com alguns minutos significativos hoje.",
  "diff.gentle": "Suave",
  "diff.balanced": "Equilibrada",
  "diff.challenging": "Desafiadora",
  "diff.expert": "Avançada",
};

const es: Dict = {
  ...en,
  "brand.tagline": "Tu jornada diaria por la Palabra de Dios.",
  "nav.home": "Inicio",
  "nav.today": "Jornada de Hoy",
  "nav.collections": "Colecciones",
  "nav.progress": "Mi Progreso",
  "nav.favorites": "Favoritos",
  "nav.about": "Acerca",
  "nav.pricing": "Planes",
  "nav.myJourney": "Mi Jornada",
  "cta.signin": "Entrar",
  "cta.startFree": "Comenzar Gratis",
  "cta.startJourney": "Comienza tu Jornada",
  "cta.exploreToday": "Explorar Jornada de Hoy",
  "cta.begin": "Comenzar Jornada",
  "hero.title": "Haz de las Escrituras parte de tu día.",
  "hero.sub": "Devocionales diarios, sopa de letras bíblica interactiva, reflexiones y jornadas significativas para crecer en la Palabra.",
  "today.name": "Gratitud que Transforma",
  "today.duration": "Unos 7 minutos",
  "today.difficulty": "Suave",
  "final.title": "Comienza con unos minutos significativos hoy.",
  "diff.gentle": "Suave",
  "diff.balanced": "Equilibrada",
  "diff.challenging": "Desafiante",
  "diff.expert": "Avanzada",
};

const dictionaries: Record<Locale, Dict> = { en, pt, es };

export const LOCALES: { code: Locale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "es", label: "Español", short: "ES" },
];

type I18nCtx = { locale: Locale; setLocale: (l: Locale) => void; t: (k: string) => string };

const Ctx = createContext<I18nCtx | null>(null);

function detect(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem("locale") as Locale | null;
  if (stored && stored in dictionaries) return stored;
  const nav = window.navigator?.language?.slice(0, 2).toLowerCase();
  if (nav === "pt") return "pt";
  if (nav === "es") return "es";
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    setLocaleState(detect());
  }, []);
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("locale", l);
  };
  const value = useMemo<I18nCtx>(
    () => ({
      locale,
      setLocale,
      t: (k) => dictionaries[locale][k] ?? dictionaries.en[k] ?? k,
    }),
    [locale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}