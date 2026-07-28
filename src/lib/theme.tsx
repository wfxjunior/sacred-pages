import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// TODO: Persist user theme preference to backend (currently localStorage only).

export type ThemeMode = "light" | "dark" | "system";

type Ctx = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "jornadas.theme";

function readStored(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

function systemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initial = readStored();
    setModeState(initial);
  }, []);

  useEffect(() => {
    const compute = () => (mode === "system" ? (systemDark() ? "dark" : "light") : mode);
    const r = compute();
    setResolved(r);
    apply(r);
    if (mode !== "system") return;
    const mm = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r2 = systemDark() ? "dark" : "light";
      setResolved(r2);
      apply(r2);
    };
    mm.addEventListener("change", handler);
    return () => mm.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(STORAGE_KEY, m);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}