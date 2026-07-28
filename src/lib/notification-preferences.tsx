// TODO: Persist notification preferences to backend user profile.
// Design-only prototype — stored in-memory + localStorage so the header
// dropdown and the preferences page stay visually in sync.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NotificationKind } from "@/lib/mock/notifications";

export type Channel = "inApp" | "email" | "push";

export type CategoryPref = {
  enabled: boolean;
  channels: Record<Channel, boolean>;
};

export type NotificationPrefs = {
  categories: Record<NotificationKind, CategoryPref>;
  quietHours: {
    enabled: boolean;
    from: string;
    to: string;
    /** 0 = Sunday … 6 = Saturday. Days on which quiet hours apply. */
    days: number[];
    /** IANA timezone id, e.g. "America/Sao_Paulo". */
    timezone: string;
  };
  weeklyDigest: boolean;
  sound: boolean;
  pauseAll: boolean;
};

export const CATEGORY_META: {
  key: NotificationKind;
  label: string;
  hint: string;
  accent: string;
}[] = [
  { key: "daily",      label: "Daily journey",     hint: "A gentle nudge when today's reading is ready.", accent: "#B88A3B" },
  { key: "companion",  label: "Companion updates", hint: "When someone you walk with reaches a milestone.", accent: "#78866B" },
  { key: "milestone",  label: "Your milestones",   hint: "Streaks, chapters completed, quiet celebrations.", accent: "#B88A3B" },
  { key: "collection", label: "New collections",   hint: "When curated journeys are released.", accent: "#5E7FA3" },
  { key: "invitation", label: "Invitations",       hint: "Shared journey invites and responses.", accent: "#78866B" },
  { key: "premium",    label: "Membership",        hint: "Trial, renewal, and billing notes only.", accent: "#B88A3B" },
];

const DEFAULTS: NotificationPrefs = {
  categories: Object.fromEntries(
    CATEGORY_META.map((c) => [
      c.key,
      {
        enabled: c.key !== "premium",
        channels: {
          inApp: true,
          email: c.key === "milestone" || c.key === "invitation",
          push: c.key === "daily" || c.key === "companion",
        },
      },
    ])
  ) as NotificationPrefs["categories"],
  quietHours: {
    enabled: true,
    from: "21:30",
    to: "07:00",
    days: [0, 1, 2, 3, 4, 5, 6],
    timezone:
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat().resolvedOptions().timeZone) ||
      "UTC",
  },
  weeklyDigest: true,
  sound: true,
  pauseAll: false,
};

const STORAGE_KEY = "jornadas.notif.prefs.v1";

type Ctx = {
  prefs: NotificationPrefs;
  setCategory: (k: NotificationKind, patch: Partial<CategoryPref>) => void;
  setChannel: (k: NotificationKind, ch: Channel, on: boolean) => void;
  update: (patch: Partial<NotificationPrefs>) => void;
  reset: () => void;
};

const NotifPrefsContext = createContext<Ctx | null>(null);

function load(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      categories: { ...DEFAULTS.categories, ...(parsed?.categories ?? {}) },
      quietHours: { ...DEFAULTS.quietHours, ...(parsed?.quietHours ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

export function NotifPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULTS);

  useEffect(() => {
    setPrefs(load());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPrefs(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  const setCategory = useCallback((k: NotificationKind, patch: Partial<CategoryPref>) => {
    setPrefs((p) => ({
      ...p,
      categories: { ...p.categories, [k]: { ...p.categories[k], ...patch } },
    }));
  }, []);

  const setChannel = useCallback((k: NotificationKind, ch: Channel, on: boolean) => {
    setPrefs((p) => ({
      ...p,
      categories: {
        ...p.categories,
        [k]: { ...p.categories[k], channels: { ...p.categories[k].channels, [ch]: on } },
      },
    }));
  }, []);

  const update = useCallback((patch: Partial<NotificationPrefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const reset = useCallback(() => setPrefs(DEFAULTS), []);

  const value = useMemo(
    () => ({ prefs, setCategory, setChannel, update, reset }),
    [prefs, setCategory, setChannel, update, reset]
  );

  return <NotifPrefsContext.Provider value={value}>{children}</NotifPrefsContext.Provider>;
}

export function useNotifPrefs() {
  const ctx = useContext(NotifPrefsContext);
  if (!ctx) throw new Error("useNotifPrefs must be used inside NotifPrefsProvider");
  return ctx;
}

/** Category is visible when not paused and the category is enabled with in-app channel on. */
export function isCategoryVisible(prefs: NotificationPrefs, kind: NotificationKind) {
  if (prefs.pauseAll) return false;
  const c = prefs.categories[kind];
  return c?.enabled && c.channels.inApp;
}
