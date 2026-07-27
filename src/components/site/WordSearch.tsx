import { useEffect, useMemo, useRef, useState } from "react";
import { buildGrid } from "@/lib/word-search";
import { SELECTION_COLORS } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { Check, Trophy } from "lucide-react";

type Cell = { r: number; c: number };

export function WordSearch({
  words,
  size = 12,
  fullBleed = false,
}: {
  words: string[];
  size?: number;
  fullBleed?: boolean;
}) {
  const { t } = useI18n();
  const { grid, placements } = useMemo(() => buildGrid(words, size), [words, size]);

  const [colorKey, setColorKey] = useState("gold");
  const selectionColor = SELECTION_COLORS.find((c) => c.key === colorKey)!.value;

  const [start, setStart] = useState<Cell | null>(null);
  const [end, setEnd] = useState<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [recentlyFound, setRecentlyFound] = useState<string[]>([]);
  const [toast, setToast] = useState<{ word: string; all: boolean } | null>(null);
  const prevFoundRef = useRef<string[]>([]);

  const wordColor = useMemo(() => {
    const map = new Map<string, string>();
    words.forEach((w, i) => {
      map.set(w.toUpperCase(), SELECTION_COLORS[i % SELECTION_COLORS.length].value);
    });
    return map;
  }, [words]);

  const foundColor = useMemo(() => {
    const map = new Map<string, string>();
    found.forEach((w) => map.set(w, wordColor.get(w) ?? selectionColor));
    return map;
  }, [found, wordColor, selectionColor]);

  useEffect(() => {
    const prev = prevFoundRef.current;
    const next = found.filter((w) => !prev.includes(w));
    if (next.length) {
      setRecentlyFound(next);
      setToast({ word: next[0], all: found.length === words.length });
      const timer = setTimeout(() => setRecentlyFound([]), 500);
      const toastTimer = setTimeout(() => setToast(null), 2200);
      prevFoundRef.current = found;
      return () => {
        clearTimeout(timer);
        clearTimeout(toastTimer);
      };
    }
    prevFoundRef.current = found;
  }, [found, words.length]);

  const progress = words.length ? found.length / words.length : 0;

  function cellsBetween(a: Cell, b: Cell): Cell[] {
    const dr = Math.sign(b.r - a.r);
    const dc = Math.sign(b.c - a.c);
    const len = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c)) + 1;
    const straight = a.r === b.r || a.c === b.c || Math.abs(b.r - a.r) === Math.abs(b.c - a.c);
    if (!straight) return [];
    return Array.from({ length: len }, (_, i) => ({ r: a.r + dr * i, c: a.c + dc * i }));
  }

  const active = start && end ? cellsBetween(start, end) : [];

  const foundCells = new Map<string, string>();
  placements
    .filter((p) => found.includes(p.word))
    .forEach((p) => {
      const color = foundColor.get(p.word) ?? selectionColor;
      for (let i = 0; i < p.word.length; i++) {
        const key = `${p.row + p.dr * i},${p.col + p.dc * i}`;
        foundCells.set(key, color);
      }
    });

  const foundCellSet = new Set(foundCells.keys());
  const activeFound = active.filter((a) => foundCellSet.has(`${a.r},${a.c}`));

  function commit() {
    if (!start || !end) return;
    const cells = cellsBetween(start, end);
    if (cells.length) {
      const word = cells.map((c) => grid[c.r][c.c]).join("");
      const reversed = word.split("").reverse().join("");
      const match = words.find((w) => w.toUpperCase() === word || w.toUpperCase() === reversed);
      if (match && !found.includes(match.toUpperCase())) {
        setFound((f) => [...f, match.toUpperCase()]);
      }
    }
    setStart(null);
    setEnd(null);
  }

  function begin(r: number, c: number) {
    setSelecting(true);
    setStart({ r, c });
    setEnd({ r, c });
  }

  function move(r: number, c: number) {
    if (!selecting || !start) return;
    setEnd({ r, c });
  }

  function endSelection() {
    setSelecting(false);
    commit();
  }

  return (
    <div className={`relative flex flex-col ${fullBleed ? "h-full min-h-0" : "space-y-6"}`}>
      {fullBleed && (
        <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2">
          {toast && (
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg"
              style={{
                background: "var(--ink)",
                color: "var(--ivory)",
                animation: "toast-in 0.25s ease-out",
                boxShadow: "0 12px 32px -10px rgba(43,43,43,0.35)",
              }}
              role="status"
              aria-live="polite"
            >
              {toast.all ? <Trophy className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {toast.all ? t("wordsearch.foundAll") : `${toast.word} — ${t("wordsearch.found")}`}
            </div>
          )}
        </div>
      )}

      <div
        className={`grid select-none gap-1 rounded-lg border border-border bg-card ${
          fullBleed ? "h-full w-full p-2" : "p-3"
        }`}
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        onMouseLeave={() => {
          setStart(null);
          setEnd(null);
        }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const inActive = active.some((a) => a.r === r && a.c === c);
            const isFound = foundCells.has(`${r},${c}`);
            const foundColorValue = isFound ? foundCells.get(`${r},${c}`) : null;
            const recently = recentlyFound.some((word) => {
              const p = placements.find((p) => p.word === word);
              if (!p) return false;
              return Array.from({ length: p.word.length }, (_, i) => ({
                r: p.row + p.dr * i,
                c: p.col + p.dc * i,
              })).some((cell) => cell.r === r && cell.c === c);
            });
            return (
              <button
                key={`${r}-${c}`}
                onMouseDown={() => begin(r, c)}
                onMouseEnter={() => move(r, c)}
                onMouseUp={endSelection}
                onTouchStart={(e) => {
                  e.preventDefault();
                  begin(r, c);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const target = document.elementFromPoint(touch.clientX, touch.clientY);
                  const btn = target?.closest("button[data-r]");
                  if (btn) {
                    const rr = Number(btn.getAttribute("data-r"));
                    const cc = Number(btn.getAttribute("data-c"));
                    move(rr, cc);
                  }
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  endSelection();
                }}
                data-r={r}
                data-c={c}
                className={`aspect-square rounded-sm font-medium uppercase transition-colors duration-200 ${
                  fullBleed ? "text-[10px] xs:text-xs sm:text-sm" : "text-xs sm:text-sm"
                } ${recently ? "animate-[cell-pop_0.4s_ease-out]" : ""}`}
                style={{
                  background: isFound
                    ? `color-mix(in oklab, ${foundColorValue} 22%, transparent)`
                    : inActive && activeFound.length > 0
                      ? `color-mix(in oklab, ${foundColorValue} 50%, transparent)`
                      : inActive
                        ? `color-mix(in oklab, ${selectionColor} 32%, transparent)`
                        : "transparent",
                  outline: isFound
                    ? `1px solid color-mix(in oklab, ${foundColorValue} 55%, transparent)`
                    : "none",
                }}
              >
                {letter}
              </button>
            );
          })
        )}
      </div>

      {!fullBleed && (
        <div className="space-y-4">
          {toast && (
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm"
              style={{
                background: "var(--ink)",
                color: "var(--ivory)",
                animation: "toast-in 0.25s ease-out",
              }}
              role="status"
              aria-live="polite"
            >
              {toast.all ? <Trophy className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              {toast.all ? t("wordsearch.foundAll") : `${toast.word} — ${t("wordsearch.found")}`}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">{t("wordsearch.words")}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
              />
            </div>
            <span className="font-medium tabular-nums">
              {found.length}/{words.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("journey.selectionColor")}</span>
              <div className="flex items-center gap-1.5">
                {SELECTION_COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColorKey(c.key)}
                    aria-label={c.label}
                    className="h-5 w-5 rounded-full border-2 transition"
                    style={{
                      background: c.value,
                      borderColor: colorKey === c.key ? "var(--foreground)" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {words.map((w) => {
                const done = found.includes(w.toUpperCase());
                const color = done ? wordColor.get(w.toUpperCase()) : undefined;
                return (
                  <span
                    key={w}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition ${
                      done ? "border-transparent line-through" : "border-border text-muted-foreground"
                    } ${done ? "animate-[chip-bounce_0.45s_ease-out]" : ""}`}
                    style={{
                      color: done ? "var(--ink)" : undefined,
                      background: done ? `color-mix(in oklab, ${color} 18%, transparent)` : undefined,
                      textDecorationColor: done ? color : undefined,
                    }}
                  >
                    {done && (
                      <Check className="h-3 w-3 shrink-0" style={{ color }} />
                    )}
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {fullBleed && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-2 text-[10px] uppercase tracking-wider backdrop-blur-sm">
            <span className="text-muted-foreground">{t("wordsearch.words")}</span>
            <span className="font-medium tabular-nums">
              {found.length}/{words.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {words.map((w) => {
              const done = found.includes(w.toUpperCase());
              const color = done ? wordColor.get(w.toUpperCase()) : undefined;
              return (
                <span
                  key={w}
                  className={`pointer-events-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider transition ${
                    done ? "border-transparent" : "border-border/60 text-muted-foreground"
                  } ${done ? "animate-[chip-bounce_0.45s_ease-out]" : ""}`}
                  style={{
                    color: done ? "var(--ink)" : undefined,
                    background: done ? `color-mix(in oklab, ${color} 18%, transparent)` : undefined,
                  }}
                >
                  {done && <Check className="h-2.5 w-2.5 shrink-0" style={{ color }} />}
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
