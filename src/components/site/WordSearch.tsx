import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildRenderablePuzzle } from "@/lib/puzzle/render";
import { validateSelection } from "@/lib/puzzle/validation-service";
import { SELECTION_COLORS, WORD_COLORS } from "@/lib/mock-data";
import { usePreferences } from "@/lib/preferences";
import { useI18n } from "@/lib/i18n";
import { GameDevotionalMoment } from "@/components/games/GameDevotionalMoment";
import { celebrateCompletion } from "@/lib/confetti";
import { getLocalBest, recordCompletion } from "@/lib/puzzle/best-times";
import {
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw,
  Shuffle,
  Timer,
  Trophy,
  X,
} from "lucide-react";

type Cell = { r: number; c: number };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setReduced(mq.matches || document.documentElement.classList.contains("reduce-motion"));
    update();
    mq.addEventListener?.("change", update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mq.removeEventListener?.("change", update);
      obs.disconnect();
    };
  }, []);
  return reduced;
}

/** Turns the session id into a layout seed so each session lays words out anew. */
function seedFromSession(sessionKey?: string): number {
  if (!sessionKey) return 0;
  let h = 2166136261;
  for (let i = 0; i < sessionKey.length; i += 1) {
    h ^= sessionKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (Math.abs(h) % 1_000_003) + 1;
}

export function WordSearch({
  words,
  size = 12,
  fullBleed = false,
  stacked = false,
  journeyLabel,
  onShuffleWords,
  onComplete,
  sessionKey,
  reference,
  devotional,
  prayer,
}: {
  words: string[];
  size?: number;
  fullBleed?: boolean;
  /** Desktop reading layout: large square grid with the words as chips beneath it. */
  stacked?: boolean;
  /** Title of the journey these words come from, so records group per theme. */
  journeyLabel?: string;
  /** Asked on shuffle so the parent can draw a fresh set of words, not just a new layout. */
  onShuffleWords?: () => void;
  /** Called once when the final word is found. */
  onComplete?: () => void;
  /** Changing this starts a clean session: saved progress is not reused. */
  sessionKey?: string;
  /** The day's passage reference, devotional and prayer — the quiet page the
   * completion banner ends with, same sequence as every other game. */
  reference?: string;
  devotional?: string;
  prayer?: string;
}) {
  const { t } = useI18n();
  // Deterministic: the same word list and size always yield the same grid, on
  // every device and across re-renders. `words` is a new array identity on each
  // parent render, so the memo keys on its content rather than the array.
  const wordsKey = words.join(" ");
  // A shuffle asks the engine for a different layout of the same words. The
  // starting seed is derived from the session, so a regenerated puzzle never
  // places the same word in the same cell as the previous one.
  const [shuffleNonce, setShuffleNonce] = useState(() => seedFromSession(sessionKey));
  const puzzle = useMemo(
    () => buildRenderablePuzzle({ words, size, ...(shuffleNonce ? { seed: shuffleNonce } : {}) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content, not identity
    [wordsKey, size, shuffleNonce],
  );
  const { grid, placements } = puzzle;

  /** normalized → display, so chips and toasts show the accented spelling. */
  const displayOf = useMemo(() => {
    const map = new Map<string, string>();
    puzzle.words.forEach((word) => map.set(word.normalized, word.display));
    return map;
  }, [puzzle]);

  // Words the engine could not fit have no path in the grid, so they can never
  // be found. Every chip, counter and the completion check work from the
  // placeable set — one unplaced word must not make finishing impossible.
  const playableWords = useMemo(
    () => puzzle.words.filter((word) => !puzzle.unplaced.includes(word.normalized)),
    [puzzle],
  );
  const targetWords = useMemo(() => playableWords.map((word) => word.normalized), [playableWords]);

  const reducedMotion = useReducedMotion();

  // The highlight colour is a reader preference, so Settings and the in-puzzle
  // picker are two views of one value rather than two independent states.
  const { prefs, setPref } = usePreferences();
  const colorKey = prefs.selectionColor;
  const selectionColor = (SELECTION_COLORS.find((c) => c.key === colorKey) ?? SELECTION_COLORS[0]!)
    .value;
  const setColorKey = (key: string) => setPref("selectionColor", key);

  const [start, setStart] = useState<Cell | null>(null);
  const [end, setEnd] = useState<Cell | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [recentlyFound, setRecentlyFound] = useState<string[]>([]);
  const [toast, setToast] = useState<{ word: string; all: boolean } | null>(null);
  const [focus, setFocus] = useState<Cell>({ r: 0, c: 0 });
  const [revealed, setRevealed] = useState(false);
  // Silent completion timer: never shown while playing, only once the last
  // word is found. `startedAt` is persisted so a reload keeps counting.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const expandedGridRef = useRef<HTMLDivElement | null>(null);
  const prevFoundRef = useRef<string[]>([]);
  const completionNotifiedRef = useRef(false);

  // React attaches touch listeners passively at the root, so preventDefault in
  // the JSX handlers cannot stop the page from scrolling mid-drag on mobile.
  // A non-passive native listener on the grid can.
  useEffect(() => {
    const nodes = [gridRef.current, expandedGridRef.current].filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;
    const block = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
    };
    nodes.forEach((node) => {
      node.addEventListener("touchstart", block, { passive: false });
      node.addEventListener("touchmove", block, { passive: false });
    });
    return () => {
      nodes.forEach((node) => {
        node.removeEventListener("touchstart", block);
        node.removeEventListener("touchmove", block);
      });
    };
  }, []);

  // Progress is remembered per word list + grid size, so leaving the page and
  // coming back restores what the reader already found.
  // Focus mode: the puzzle and its word list take over the whole screen.
  const storageKey = `lumena:ws:${size}:${sessionKey ? `${sessionKey}:` : ""}${wordsKey}`;
  // Gate saving on state (not a ref): a ref flips synchronously inside the
  // hydrate effect, so the save effect would run in the same commit with the
  // still-empty state and wipe what was just read back.
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!wordsKey) return;
    if (hydratedKey === storageKey) return;
    let saved: {
      nonce?: number;
      found?: string[];
      revealed?: boolean;
      elapsedMs?: number;
      startedAt?: number | null;
    } | null = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    } catch {
      saved = null;
    }
    const savedFound = Array.isArray(saved?.found) ? saved!.found! : [];
    prevFoundRef.current = savedFound;
    // Falls back to the session seed, never 0: a fresh session must lay the
    // words out differently, and 0 would replay the default layout.
    setShuffleNonce(typeof saved?.nonce === "number" ? saved!.nonce! : seedFromSession(sessionKey));
    setFound(savedFound);
    setRevealed(saved?.revealed === true);
    setElapsedMs(typeof saved?.elapsedMs === "number" ? saved.elapsedMs : 0);
    setStartedAt(typeof saved?.startedAt === "number" ? saved.startedAt : null);
    setBestTimeMs(getLocalBest(storageKey));
    setHydratedKey(storageKey);
  }, [storageKey, wordsKey, hydratedKey, sessionKey]);

  useEffect(() => {
    if (!wordsKey) return;
    if (hydratedKey !== storageKey) return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ nonce: shuffleNonce, found, revealed, elapsedMs, startedAt }),
      );
    } catch {
      /* storage unavailable — progress simply is not persisted */
    }
  }, [storageKey, wordsKey, hydratedKey, shuffleNonce, found, revealed, elapsedMs, startedAt]);

  const shuffleGrid = useCallback(() => {
    onShuffleWords?.();
    setShuffleNonce(Math.floor(Math.random() * 1_000_000_000) + 1);
    prevFoundRef.current = [];
    setFound([]);
    setRevealed(false);
    setStart(null);
    setEnd(null);
    setRecentlyFound([]);
    setElapsedMs(0);
    setStartedAt(null);
    completionNotifiedRef.current = false;
  }, [onShuffleWords]);

  // Keyed by the normalized form, which is what the engine and `found` use.
  const wordColor = useMemo(() => {
    const map = new Map<string, string>();
    // Never repeat a colour inside one puzzle: the palette is longer than any
    // word set, and if a puzzle ever exceeded it we shift the hue instead.
    puzzle.words.forEach((word, i) => {
      const base = WORD_COLORS[i % WORD_COLORS.length];
      const lap = Math.floor(i / WORD_COLORS.length);
      map.set(
        word.normalized,
        lap === 0
          ? base
          : base.replace(/([\d.]+)\)$/, (_m, h) => `${(Number(h) + lap * 17) % 360})`),
      );
    });
    return map;
  }, [puzzle]);

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
      const complete = found.length >= playableWords.length && playableWords.length > 0;
      if (complete) {
        setStartedAt((begin) => {
          if (begin != null) {
            const total = elapsedMs + (Date.now() - begin);
            setElapsedMs(total);
            // Saved quietly to the reader's profile: their own record only.
            void recordCompletion(storageKey, total, journeyLabel).then((best) =>
              setBestTimeMs(best),
            );
          }
          return null;
        });
        celebrateCompletion();
        if (!completionNotifiedRef.current) {
          completionNotifiedRef.current = true;
          window.setTimeout(() => onComplete?.(), 900);
        }
      } else {
        setStartedAt((begin) => begin ?? Date.now());
      }
      // `next` holds normalized forms; the reader is shown their own spelling.
      setToast({ word: displayOf.get(next[0]) ?? next[0], all: complete });
      const timer = setTimeout(() => setRecentlyFound([]), 500);
      const toastTimer = setTimeout(() => setToast(null), 2200);
      prevFoundRef.current = found;
      return () => {
        clearTimeout(timer);
        clearTimeout(toastTimer);
      };
    }
    prevFoundRef.current = found;
  }, [found, playableWords.length, displayOf, elapsedMs, journeyLabel, onComplete, storageKey]);

  // A new puzzle (different words or size) always starts hidden again.
  useEffect(() => {
    setRevealed(false);
  }, [wordsKey, size]);

  const progress = playableWords.length ? Math.min(1, found.length / playableWords.length) : 0;
  const isComplete = playableWords.length > 0 && found.length >= playableWords.length;
  const completedTime = (() => {
    const total = Math.max(0, Math.round(elapsedMs / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  })();
  const bestLabel =
    bestTimeMs != null
      ? `${Math.floor(Math.round(bestTimeMs / 1000) / 60)}:${String(Math.round(bestTimeMs / 1000) % 60).padStart(2, "0")}`
      : null;

  // A solved grid must never be a dead end: whether the reader just finished or
  // came back to a restored complete session, this offers the way to a fresh
  // puzzle (a new draw of words via onShuffleWords, plus a new layout).
  const completionBanner = (
    <div
      className="rounded-xl border p-4 text-center"
      style={{
        borderColor: "color-mix(in oklab, var(--gold) 45%, transparent)",
        background: "color-mix(in oklab, var(--gold) 10%, transparent)",
      }}
      role="status"
    >
      <p className="flex items-center justify-center gap-2 text-sm font-medium">
        <Trophy className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} aria-hidden="true" />
        {t("wordsearch.foundAll")}
      </p>
      <p className="mt-1 text-xs tabular-nums text-muted-foreground">
        {t("wordsearch.completedIn")} {completedTime}
        {bestLabel && bestLabel !== completedTime && ` · ${t("wordsearch.bestTime")} ${bestLabel}`}
      </p>
      <GameDevotionalMoment reference={reference} explanation={devotional} prayer={prayer} />
      <button
        type="button"
        onClick={shuffleGrid}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:h-9 text-[11px] font-semibold uppercase tracking-[0.14em] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        style={{ background: "var(--ink)", color: "var(--ivory)" }}
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0" />
        {t("wordsearch.regenerate")}
      </button>
    </div>
  );

  function cellsBetween(a: Cell, b: Cell): Cell[] {
    const dr = Math.sign(b.r - a.r);
    const dc = Math.sign(b.c - a.c);
    const len = Math.max(Math.abs(b.r - a.r), Math.abs(b.c - a.c)) + 1;
    const straight = a.r === b.r || a.c === b.c || Math.abs(b.r - a.r) === Math.abs(b.c - a.c);
    if (!straight) return [];
    return Array.from({ length: len }, (_, i) => ({ r: a.r + dr * i, c: a.c + dc * i }));
  }

  const active = start && end ? cellsBetween(start, end) : [];

  // The engine gives each placement its full path, so the highlight no longer
  // re-derives cells from a direction vector.
  const foundCells = new Map<string, string>();
  placements
    .filter((p) => found.includes(p.normalized))
    .forEach((p) => {
      const color = foundColor.get(p.normalized) ?? selectionColor;
      p.path.forEach((cell) => foundCells.set(`${cell.row},${cell.col}`, color));
    });

  // Answers overlay: every word still missing, drawn in its own colour but
  // dashed, so it never reads as "found".
  const revealCells = new Map<string, string>();
  if (revealed) {
    placements
      .filter((p) => !found.includes(p.normalized))
      .forEach((p) => {
        const color = wordColor.get(p.normalized) ?? selectionColor;
        p.path.forEach((cell) => revealCells.set(`${cell.row},${cell.col}`, color));
      });
  }

  function commit() {
    if (!start || !end) return;
    // The engine's validator reads the grid's normalized layer, so a word with
    // accents matches however the reader traced it — forwards or backwards —
    // without the component knowing anything about accent folding.
    const result = validateSelection({
      grid,
      selection: { start: { row: start.r, col: start.c }, end: { row: end.r, col: end.c } },
      targetWords,
      foundWords: found,
      placements,
    });
    if (result.kind === "match") {
      setFound((f) => [...f, result.word]);
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

  const focusCell = useCallback((r: number, c: number) => {
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[data-r="${r}"][data-c="${c}"]`,
    );
    btn?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { r, c } = focus;
    let nr = r;
    let nc = c;
    switch (e.key) {
      case "ArrowUp":
        nr = Math.max(0, r - 1);
        break;
      case "ArrowDown":
        nr = Math.min(size - 1, r + 1);
        break;
      case "ArrowLeft":
        nc = Math.max(0, c - 1);
        break;
      case "ArrowRight":
        nc = Math.min(size - 1, c + 1);
        break;
      case "Home":
        nc = 0;
        break;
      case "End":
        nc = size - 1;
        break;
      case "PageUp":
        nr = 0;
        break;
      case "PageDown":
        nr = size - 1;
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        if (!selecting) {
          setSelecting(true);
          setStart({ r, c });
          setEnd({ r, c });
          setAnnouncement(t("wordsearch.selectionStarted"));
        } else {
          endSelection();
        }
        return;
      case "Escape":
        if (selecting) {
          e.preventDefault();
          setSelecting(false);
          setStart(null);
          setEnd(null);
          setAnnouncement(t("wordsearch.selectionCleared"));
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocus({ r: nr, c: nc });
    if (selecting) setEnd({ r: nr, c: nc });
    focusCell(nr, nc);
  }

  // Focus mode: Esc leaves it, and the page behind must not scroll.
  useEffect(() => {
    if (!expanded || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  // In focus mode the full word panel is always shown, even on mobile.
  const compact = fullBleed && !expanded;

  const expandButtonClass =
    "inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-3 sm:h-8 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]";

  // Borderless, letters-only grid: the page itself is the frame, as in a
  // printed devotional notebook. Spacing (not rules) separates the cells.
  // content-start is load-bearing: inside the stacked layout the grid box is
  // stretched by its flex column, and without it align-content: stretch
  // inflates the row tracks — cells turn into tall ovals and the grid
  // overflows the height the wrapper computed for it. Gaps tighten on large
  // grids (16+ words) so expert boards stay in proportion.
  const gridBaseClass = `grid select-none content-start rounded-lg bg-transparent touch-none ${
    size >= 16 ? "gap-[3px] sm:gap-1 xl:gap-1.5" : "gap-1 sm:gap-1.5 xl:gap-2"
  }`;

  // Compact toolbar icon buttons: keep a comfortable 32px touch target on mobile.
  const compactIconButtonClass =
    "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card sm:h-8 sm:w-8 text-muted-foreground transition active:scale-95 hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]";

  const renderGrid = (ref: React.RefObject<HTMLDivElement | null>, mode: "normal" | "expanded") => {
    const isCompact = mode === "normal" && compact;
    const isExpanded = mode === "expanded";
    return (
      <div
        ref={ref}
        role="grid"
        aria-label={t("wordsearch.gridLabel")}
        aria-describedby="ws-instructions"
        aria-rowcount={size}
        aria-colcount={size}
        onKeyDown={handleKeyDown}
        className={`${gridBaseClass} ${isCompact ? "w-full flex-none content-start p-2" : "p-3"} ${
          isExpanded
            ? "mx-auto w-full max-w-[min(100%,68vh)] flex-none self-center lg:mx-0 lg:max-w-[min(56vw,calc(100dvh-7rem))]"
            : ""
        }`}
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          // In the stacked spread the grid box itself owns the square shape:
          // explicit 1fr rows plus an aspect ratio keep every track square
          // even when the flex column stretches the box or a cell's text
          // min-height would otherwise inflate its row (large expert grids).
          ...(stacked && !isCompact && !isExpanded
            ? {
                aspectRatio: `${grid.cells[0]?.length ?? 1} / ${Math.max(grid.cells.length, 1)}`,
                gridTemplateRows: `repeat(${Math.max(grid.cells.length, 1)}, minmax(0, 1fr))`,
              }
            : {}),
          touchAction: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          overscrollBehavior: "contain",
        }}
        onMouseLeave={() => {
          setStart(null);
          setEnd(null);
        }}
      >
        {grid.cells.map((row, r) =>
          row.map((cell, c) => {
            const letter = cell.display;
            const inActive = active.some((a) => a.r === r && a.c === c);
            const isFound = foundCells.has(`${r},${c}`);
            const foundColorValue = isFound ? foundCells.get(`${r},${c}`) : null;
            const revealColorValue = !isFound ? (revealCells.get(`${r},${c}`) ?? null) : null;
            const recently = recentlyFound.some((word) => {
              const p = placements.find((placement) => placement.normalized === word);
              return p?.path.some((coord) => coord.row === r && coord.col === c) ?? false;
            });
            const isFocus = focus.r === r && focus.c === c;
            const stateLabel = isFound
              ? `, ${t("wordsearch.cellFound")}`
              : inActive
                ? `, ${t("wordsearch.cellSelected")}`
                : "";
            return (
              <button
                key={`${mode}-${r}-${c}`}
                type="button"
                role="gridcell"
                tabIndex={isFocus ? 0 : -1}
                aria-selected={inActive || isFound}
                aria-label={`${letter}, ${t("wordsearch.gridLabel")} ${r + 1}·${c + 1}${stateLabel}`}
                onFocus={() => setFocus({ r, c })}
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
                className={`aspect-square min-h-0 rounded-sm font-serif font-medium uppercase leading-none tracking-[0.06em] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--card)] focus-visible:z-10 focus-visible:relative ${
                  isCompact
                    ? "text-[11px] xs:text-[13px] sm:text-[15px]"
                    : stacked && mode === "normal"
                      ? size >= 16
                        ? "text-[11px] sm:text-[12px] xl:text-[14px]"
                        : "text-[15px] sm:text-[14px] lg:text-[15px] xl:text-[19px]"
                      : "text-[13px] sm:text-[15px]"
                } ${recently && !reducedMotion ? "animate-[cell-pop_0.4s_ease-out]" : ""}`}
                style={{
                  touchAction: "none",
                  background: isFound
                    ? `color-mix(in oklab, ${foundColorValue} ${inActive ? 40 : 22}%, transparent)`
                    : inActive
                      ? `color-mix(in oklab, ${selectionColor} 32%, transparent)`
                      : revealColorValue
                        ? `color-mix(in oklab, ${revealColorValue} 10%, transparent)`
                        : "color-mix(in oklab, var(--card) 92%, white)",
                  outline: inActive
                    ? `2px solid color-mix(in oklab, ${selectionColor} 75%, transparent)`
                    : isFound
                      ? `1px solid color-mix(in oklab, ${foundColorValue} 55%, transparent)`
                      : revealColorValue
                        ? `1px dashed color-mix(in oklab, ${revealColorValue} 60%, transparent)`
                        : `1px solid color-mix(in oklab, var(--border) 60%, transparent)`,
                  outlineOffset: inActive ? "-1px" : undefined,
                }}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>
    );
  };

  /** Focus mode: only the essentials — progress, words, reveal. */
  const focusPanel = () => (
    <div className="space-y-3">
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
          {toast.all
            ? `${t("wordsearch.foundAll")} · ${t("wordsearch.completedIn")} ${completedTime}`
            : `${toast.word} — ${t("wordsearch.found")}`}
        </div>
      )}

      {isComplete && completionBanner}

      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("wordsearch.wordsToFind")}
        </p>
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {found.length}/{playableWords.length}
          {isComplete && ` · ${completedTime}`}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
        />
      </div>

      <ul
        className="grid grid-cols-2 gap-1.5 lg:grid-cols-1"
        aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${playableWords.length}`}
      >
        {playableWords.map(({ display: w, normalized }) => {
          const done = found.includes(normalized);
          const color = wordColor.get(normalized);
          return (
            <li
              key={w}
              aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
              className={`flex min-h-9 min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 font-serif text-sm uppercase tracking-[0.14em] transition ${
                done ? "line-through opacity-70" : "text-foreground"
              }`}
              style={{
                background: done ? `color-mix(in oklab, ${color} 14%, transparent)` : undefined,
                textDecorationColor: done ? color : undefined,
              }}
            >
              {done ? (
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />
              ) : (
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: `color-mix(in oklab, ${color} 55%, transparent)` }}
                />
              )}
              <span className="truncate">{w}</span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-pressed={revealed}
        className="mt-1 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 sm:h-9 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
      </button>
    </div>
  );

  const wordsPanel = (showToast: boolean) => (
    <div className="space-y-4">
      {showToast && toast && (
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
          {toast.all
            ? `${t("wordsearch.foundAll")} · ${t("wordsearch.completedIn")} ${completedTime}`
            : `${toast.word} — ${t("wordsearch.found")}`}
        </div>
      )}

      {isComplete && completionBanner}

      <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(43,41,38,0.04)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("wordsearch.wordsToFind")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {found.length}/{playableWords.length}
            </span>
            {isComplete && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground"
                title={t("wordsearch.completedIn")}
              >
                <Timer className="h-3.5 w-3.5" />
                {completedTime}
                {bestLabel && bestLabel !== completedTime && (
                  <span className="text-muted-foreground/70">
                    · {t("wordsearch.bestTime")} {bestLabel}
                  </span>
                )}
              </span>
            )}
            <button
              type="button"
              onClick={shuffleGrid}
              title={t("wordsearch.shuffleConfirm")}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-3 sm:h-8 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              <Shuffle className="h-3.5 w-3.5" />
              {t("wordsearch.shuffle")}
            </button>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-pressed={expanded}
              title={expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
              className={expandButtonClass}
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-pressed={revealed}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-3 sm:h-8 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
            </button>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
          />
        </div>

        <ul
          className="mt-4 grid grid-cols-2 items-stretch gap-2 sm:grid-cols-2"
          aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${playableWords.length}`}
        >
          {playableWords.map(({ display: w, normalized }) => {
            const done = found.includes(normalized);
            const color = wordColor.get(normalized);
            return (
              <li
                key={w}
                aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
                className={`flex h-full min-h-10 min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition sm:text-sm ${
                  done
                    ? "border border-transparent line-through"
                    : "border-2 border-border/80 bg-background/70 text-foreground shadow-[0_1px_2px_rgba(43,41,38,0.04)]"
                } ${done && !reducedMotion ? "animate-[chip-bounce_0.45s_ease-out]" : ""}`}
                style={{
                  color: done ? "var(--ink)" : undefined,
                  background: done ? `color-mix(in oklab, ${color} 16%, transparent)` : undefined,
                  textDecorationColor: done ? color : undefined,
                }}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />
                ) : (
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: `color-mix(in oklab, ${color} 55%, transparent)` }}
                  />
                )}
                <span className="truncate">{w}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3">
          <span className="text-xs text-muted-foreground">{t("journey.selectionColor")}</span>
          <div
            className="flex items-center gap-1.5"
            role="radiogroup"
            aria-label={t("journey.selectionColor")}
          >
            {SELECTION_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={colorKey === c.key}
                onClick={() => setColorKey(c.key)}
                aria-label={c.label}
                className="h-5 w-5 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                style={{
                  background: c.value,
                  borderColor: colorKey === c.key ? "var(--foreground)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const desktopWordsPanel = (showToast: boolean) => (
    <div className="flex flex-col gap-3">
      {showToast && toast && (
        <div
          className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium shadow-sm"
          style={{
            background: "var(--ink)",
            color: "var(--ivory)",
            animation: "toast-in 0.25s ease-out",
          }}
          role="status"
          aria-live="polite"
        >
          {toast.all ? <Trophy className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {toast.all
            ? `${t("wordsearch.foundAll")} · ${t("wordsearch.completedIn")} ${completedTime}`
            : `${toast.word} — ${t("wordsearch.found")}`}
        </div>
      )}

      {isComplete && completionBanner}

      <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(43,41,38,0.04)]">
        <div className="mb-3 border-b border-border/60 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("wordsearch.wordsToFind")}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {found.length}/{playableWords.length}
            </span>
            {isComplete && (
              <span
                className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground"
                title={t("wordsearch.completedIn")}
              >
                <Timer className="h-3.5 w-3.5" />
                {completedTime}
                {bestLabel && bestLabel !== completedTime && (
                  <span className="text-muted-foreground/70">
                    · {t("wordsearch.bestTime")} {bestLabel}
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
            />
          </div>
        </div>

        <ul
          className="flex max-h-[46vh] flex-col gap-1.5 overflow-y-auto pr-1"
          aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${playableWords.length}`}
        >
          {playableWords.map(({ display: w, normalized }) => {
            const done = found.includes(normalized);
            const color = wordColor.get(normalized);
            return (
              <li
                key={w}
                aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
                className={`flex min-h-8 min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition ${
                  done
                    ? "border-transparent bg-secondary/50 text-muted-foreground line-through"
                    : "border-border/70 bg-background/60 text-foreground"
                } ${done && !reducedMotion ? "animate-[chip-bounce_0.45s_ease-out]" : ""}`}
                style={{
                  textDecorationColor: done ? color : undefined,
                }}
              >
                {done ? (
                  <Check className="h-3 w-3 shrink-0" style={{ color }} aria-hidden="true" />
                ) : (
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: `color-mix(in oklab, ${color} 55%, transparent)` }}
                  />
                )}
                <span className="truncate">{w}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={shuffleGrid}
            title={t("wordsearch.shuffleConfirm")}
            aria-label={t("wordsearch.shuffle")}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 sm:h-9 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            <Shuffle className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden truncate xl:inline">{t("wordsearch.shuffle")}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-pressed={expanded}
            title={expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 sm:h-9 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="hidden truncate xl:inline">
              {expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-pressed={revealed}
            title={revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
            aria-label={revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
            className="col-span-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 sm:h-9 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            {revealed ? (
              <EyeOff className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Eye className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">
              {revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
            </span>
          </button>
        </div>

        <div className="mt-3 border-t border-border/60 pt-3">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("journey.selectionColor")}
          </span>
          <div
            className="mt-2 flex items-center gap-2"
            role="radiogroup"
            aria-label={t("journey.selectionColor")}
          >
            {SELECTION_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={colorKey === c.key}
                onClick={() => setColorKey(c.key)}
                aria-label={c.label}
                className="h-5 w-5 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                style={{
                  background: c.value,
                  borderColor: colorKey === c.key ? "var(--foreground)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /** Reading layout: the grid is the hero, the words sit in a calm rail beside it. */
  const stackedLayout = (
    <div className="flex h-auto w-full min-w-0 flex-col gap-4 md:h-full">
      <div className="flex w-full flex-none flex-col gap-4 md:min-h-0 md:flex-1 md:flex-row md:gap-5 lg:gap-6">
        <div className="flex min-w-0 flex-none flex-col md:min-h-0 md:flex-1">
          <div className="flex w-full flex-none justify-center md:min-h-0 md:flex-1">
            <div
              className="w-full [--ws-h:calc(100dvh-22rem)] md:[--ws-h:calc(100dvh-20rem)] lg:[--ws-h:calc(100dvh-22rem)] xl:[--ws-h:calc(100dvh-14rem)]"
              style={{
                maxWidth: `min(100%, calc(var(--ws-h) * ${
                  (grid.cells[0]?.length ?? 1) / Math.max(grid.cells.length, 1)
                }))`,
              }}
            >
              {renderGrid(gridRef, "normal")}
            </div>
          </div>
        </div>

        <aside className="flex w-full flex-none flex-col gap-4 self-stretch md:min-h-0 md:w-[164px] lg:w-[180px] xl:w-[220px]">
          {isComplete && completionBanner}
          <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(43,41,38,0.04)] md:min-h-0 md:flex-1 md:p-5">
            <div className="mb-3 border-b border-border/60 pb-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("wordsearch.wordsToFind")}
                </p>
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {found.length}/{playableWords.length}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
                />
              </div>
              {isComplete && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
                  <Timer className="h-3.5 w-3.5" />
                  {completedTime}
                  {bestLabel && bestLabel !== completedTime && (
                    <span className="text-muted-foreground/70">
                      · {t("wordsearch.bestTime")} {bestLabel}
                    </span>
                  )}
                </span>
              )}
            </div>

            <ul
              className="grid auto-rows-min grid-cols-2 gap-2 pr-1 sm:grid-cols-3 md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto"
              aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${playableWords.length}`}
            >
              {playableWords.map(({ display: w, normalized }) => {
                const done = found.includes(normalized);
                const color = wordColor.get(normalized);
                return (
                  <li
                    key={w}
                    aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
                    className={`flex min-h-10 min-w-0 items-center gap-2 rounded-lg border px-3 py-2 font-serif text-sm uppercase tracking-[0.14em] transition ${
                      done
                        ? "border-transparent line-through"
                        : "border-border/80 bg-background/70 text-foreground"
                    } ${done && !reducedMotion ? "animate-[chip-bounce_0.45s_ease-out]" : ""}`}
                    style={{
                      color: done ? "var(--ink)" : undefined,
                      background: done
                        ? `color-mix(in oklab, ${color} 16%, transparent)`
                        : undefined,
                      textDecorationColor: done ? color : undefined,
                    }}
                  >
                    {done ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color }}
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: `color-mix(in oklab, ${color} 55%, transparent)` }}
                      />
                    )}
                    <span className="truncate">{w}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
              <button
                type="button"
                onClick={shuffleGrid}
                title={t("wordsearch.shuffleConfirm")}
                aria-label={t("wordsearch.shuffle")}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 sm:h-9 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                <Shuffle className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden truncate xl:inline">{t("wordsearch.shuffle")}</span>
              </button>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-pressed={expanded}
                title={expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
                aria-label={expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 sm:h-9 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                {expanded ? (
                  <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="hidden truncate xl:inline">
                  {expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRevealed((v) => !v)}
                aria-pressed={revealed}
                title={revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
                aria-label={revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
                className="col-span-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border px-2 sm:h-9 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                {revealed ? (
                  <EyeOff className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">
                  {revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
                </span>
              </button>
            </div>

            <div className="mt-3 border-t border-border/60 pt-3">
              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("journey.selectionColor")}
              </span>
              <div
                className="mt-2 flex items-center gap-2"
                role="radiogroup"
                aria-label={t("journey.selectionColor")}
              >
                {SELECTION_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    role="radio"
                    aria-checked={colorKey === c.key}
                    onClick={() => setColorKey(c.key)}
                    aria-label={c.label}
                    className="h-5 w-5 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                    style={{
                      background: c.value,
                      borderColor: colorKey === c.key ? "var(--foreground)" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  const useStacked = stacked && !compact;

  return (
    <div
      className={`relative flex w-full min-w-0 flex-col ${
        useStacked ? "h-full min-h-0" : "lg:flex-row lg:gap-5"
      } ${fullBleed ? "h-full min-h-0 gap-2" : useStacked ? "" : "space-y-6 lg:space-y-0"}`}
    >
      <p id="ws-instructions" className="sr-only">
        {t("wordsearch.instructions")}
      </p>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>

      {compact && (
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
              {toast.all
                ? `${t("wordsearch.foundAll")} · ${t("wordsearch.completedIn")} ${completedTime}`
                : `${toast.word} — ${t("wordsearch.found")}`}
            </div>
          )}
        </div>
      )}

      {useStacked && stackedLayout}

      {!useStacked && (
        <div className="mx-auto flex w-full max-w-[min(460px,58vh)] min-w-0 justify-center lg:mx-0 lg:max-w-none lg:flex-1">
          <div className="w-full lg:max-w-[min(100%,calc(100dvh-13rem))]">
            {renderGrid(gridRef, "normal")}
          </div>
        </div>
      )}

      {!compact && !useStacked && (
        <div className="hidden lg:block lg:w-[280px] lg:flex-none lg:self-start">
          {desktopWordsPanel(true)}
        </div>
      )}
      {!compact && !useStacked && <div className="lg:hidden">{wordsPanel(true)}</div>}

      {compact && (
        <div className="flex w-full min-w-0 flex-none flex-col gap-2 overflow-visible pb-2">
          {isComplete && completionBanner}
          <div className="flex w-full min-w-0 items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-[10px] uppercase tracking-wider">
            <span className="shrink-0 text-muted-foreground">{t("wordsearch.words")}</span>
            <div className="h-1 min-w-6 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
              />
            </div>
            <span className="shrink-0 font-medium tabular-nums">
              {found.length}/{playableWords.length}
            </span>
            {isComplete && (
              <span className="inline-flex shrink-0 items-center gap-1 font-medium tabular-nums text-muted-foreground">
                <Timer className="h-3 w-3" />
                {completedTime}
              </span>
            )}
            <button
              type="button"
              onClick={shuffleGrid}
              aria-label={t("wordsearch.shuffle")}
              title={t("wordsearch.shuffle")}
              className={compactIconButtonClass}
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-pressed={revealed}
              aria-label={revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
              title={revealed ? t("wordsearch.hide") : t("wordsearch.reveal")}
              className={`${compactIconButtonClass} ${
                revealed ? "border-[color:var(--gold)] text-foreground" : ""
              }`}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={t("wordsearch.expand")}
              title={t("wordsearch.expand")}
              className={compactIconButtonClass}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul
            className="grid w-full grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-1.5"
            aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${playableWords.length}`}
          >
            {playableWords.map(({ display: w, normalized }) => {
              const done = found.includes(normalized);
              const color = done ? wordColor.get(normalized) : undefined;
              return (
                <li
                  key={w}
                  aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
                  className={`flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full border px-2 py-1.5 text-[10px] sm:min-h-0 font-medium uppercase tracking-wider transition ${
                    done
                      ? "border-transparent line-through"
                      : "border-border/60 bg-background/70 text-muted-foreground"
                  } ${done && !reducedMotion ? "animate-[chip-bounce_0.45s_ease-out]" : ""}`}
                  style={{
                    color: done ? "var(--ink)" : undefined,
                    background: done ? `color-mix(in oklab, ${color} 18%, transparent)` : undefined,
                    textDecorationColor: done ? color : undefined,
                  }}
                >
                  {done && (
                    <Check className="h-2.5 w-2.5 shrink-0" style={{ color }} aria-hidden="true" />
                  )}
                  <span className="truncate">{w}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Focus mode overlay — rendered in the DOM at all times so it can enter
          and leave with a smooth fade/scale transition instead of snapping. */}
      <div
        className={`fixed inset-0 z-[80] flex flex-col gap-3 overflow-y-auto bg-[var(--ivory)] p-3 pt-12 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-5 sm:pt-14 lg:flex-row lg:items-center lg:justify-center lg:gap-6 lg:overflow-hidden lg:p-6 lg:pt-14 ${
          expanded
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-[0.98] translate-y-2 pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!expanded}
      >
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label={t("wordsearch.collapse")}
          className="fixed right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full sm:h-8 sm:w-8 border border-border/70 bg-card text-muted-foreground shadow-sm transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <X className="h-4 w-4" />
        </button>

        {renderGrid(expandedGridRef, "expanded")}

        <div className="w-full lg:w-[240px] lg:flex-none lg:max-h-[calc(100dvh-5rem)] lg:self-center lg:overflow-y-auto">
          {focusPanel()}
        </div>
      </div>
    </div>
  );
}
