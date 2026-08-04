import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Reader preferences that outlive a page view.
//
// These are device preferences (how the app looks and plays), not account data,
// so localStorage is the right home: they apply instantly, work signed out, and
// never need a round trip. Anything that must follow the account — display
// name, membership — lives in the database instead.

export type FontSize = "small" | "medium" | "large";
export type Difficulty = "gentle" | "balanced" | "challenging" | "expert";

export type Preferences = {
  selectionColor: string;
  fontSize: FontSize;
  difficulty: Difficulty;
  rhythmMinutes: 5 | 10 | 20;
  autoAdvance: boolean;
  sound: boolean;
  privateReflections: boolean;
  shareCompletion: boolean;
  analytics: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  dyslexiaFont: boolean;
  screenReaderHints: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  selectionColor: "gold",
  fontSize: "medium",
  difficulty: "gentle",
  rhythmMinutes: 10,
  autoAdvance: true,
  sound: true,
  privateReflections: true,
  shareCompletion: true,
  analytics: false,
  reduceMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  screenReaderHints: true,
};

const STORAGE_KEY = "lumena.preferences.v1";

const FONT_SCALE: Record<FontSize, string> = {
  small: "15px",
  medium: "16px",
  large: "18px",
};

function load(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/** Reflects the preferences that change how the document itself renders. */
function apply(prefs: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.fontSize = FONT_SCALE[prefs.fontSize];
  root.classList.toggle("reduce-motion", prefs.reduceMotion);
  root.classList.toggle("high-contrast", prefs.highContrast);
  root.classList.toggle("dyslexia-friendly", prefs.dyslexiaFont);
}

type Ctx = {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  reset: () => void;
};

const PreferencesContext = createContext<Ctx | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Starts at defaults so SSR and the first client render agree; the stored
  // values land in the effect right after mount.
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = load();
    setPrefs(stored);
    apply(stored);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = load();
      setPrefs(next);
      apply(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPref = useCallback<Ctx["setPref"]>((key, value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      apply(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — the choice simply is not remembered */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFERENCES);
    apply(DEFAULT_PREFERENCES);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ prefs, setPref, reset }), [prefs, setPref, reset]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Ctx {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}
