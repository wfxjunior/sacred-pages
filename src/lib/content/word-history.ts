/**
 * Remembers which words a reader has already been shown today, per journey and
 * difficulty, so a reload or a shuffle draws a genuinely different list instead
 * of replaying the same one. Scoped to the calendar day: yesterday's entries
 * are ignored (and swept) rather than constraining today's draw.
 */
const PREFIX = "lumena:words:";
/** Keep enough history to cover several draws without starving the pool. */
const MAX_REMEMBERED = 48;

export function dateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function storageKey(seedKey: string, difficulty: string, day: string): string {
  return `${PREFIX}${day}:${seedKey}:${difficulty}`;
}

/** Drops history from previous days so storage never grows unbounded. */
function sweep(day: string): void {
  try {
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(PREFIX) && !key.startsWith(`${PREFIX}${day}:`)) stale.push(key);
    }
    stale.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    /* storage unavailable */
  }
}

export function recentWords(seedKey: string, difficulty: string, now: Date = new Date()): string[] {
  if (typeof window === "undefined") return [];
  const day = dateKey(now);
  sweep(day);
  try {
    const raw = window.localStorage.getItem(storageKey(seedKey, difficulty, day));
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((w): w is string => typeof w === "string") : [];
  } catch {
    return [];
  }
}

export function rememberWords(
  seedKey: string,
  difficulty: string,
  words: string[],
  now: Date = new Date(),
): void {
  if (typeof window === "undefined" || words.length === 0) return;
  const day = dateKey(now);
  const merged = [...recentWords(seedKey, difficulty, now), ...words];
  const unique = Array.from(new Set(merged)).slice(-MAX_REMEMBERED);
  try {
    window.localStorage.setItem(storageKey(seedKey, difficulty, day), JSON.stringify(unique));
  } catch {
    /* storage unavailable */
  }
}
