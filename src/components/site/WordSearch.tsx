import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildRenderablePuzzle } from "@/lib/puzzle/render";
import { validateSelection } from "@/lib/puzzle/validation-service";
import { SELECTION_COLORS } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { celebrateCompletion } from "@/lib/confetti";
import { Check, Eye, EyeOff, Maximize2, Minimize2, Shuffle, Trophy, X } from "lucide-react";

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
  // Deterministic: the same word list and size always yield the same grid, on
  // every device and across re-renders. `words` is a new array identity on each
  // parent render, so the memo keys on its content rather than the array.
  const wordsKey = words.join(" ");
  // A shuffle asks the engine for a different layout of the same words.
  const [shuffleNonce, setShuffleNonce] = useState(0);
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

  const targetWords = useMemo(() => puzzle.words.map((word) => word.normalized), [puzzle]);

  const reducedMotion = useReducedMotion();

  const [colorKey, setColorKey] = useState("gold");
  const selectionColor = SELECTION_COLORS.find((c) => c.key === colorKey)!.value;

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
  const [expanded, setExpanded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const expandedGridRef = useRef<HTMLDivElement | null>(null);
  const prevFoundRef = useRef<string[]>([]);

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
  const storageKey = `lumena:ws:${size}:${wordsKey}`;
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
    setShuffleNonce(typeof saved?.nonce === "number" ? saved!.nonce! : 0);
    setFound(savedFound);
    setRevealed(saved?.revealed === true);
    setElapsedMs(typeof saved?.elapsedMs === "number" ? saved.elapsedMs : 0);
    setStartedAt(typeof saved?.startedAt === "number" ? saved.startedAt : null);
    setHydratedKey(storageKey);
  }, [storageKey, wordsKey, hydratedKey]);

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
    setShuffleNonce(Math.floor(Math.random() * 1_000_000_000) + 1);
    prevFoundRef.current = [];
    setFound([]);
    setRevealed(false);
    setStart(null);
    setEnd(null);
    setRecentlyFound([]);
    setElapsedMs(0);
    setStartedAt(null);
  }, []);

  // Keyed by the normalized form, which is what the engine and `found` use.
  const wordColor = useMemo(() => {
    const map = new Map<string, string>();
    puzzle.words.forEach((word, i) => {
      map.set(word.normalized, SELECTION_COLORS[i % SELECTION_COLORS.length].value);
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
      const complete = found.length === words.length && words.length > 0;
      if (complete) {
        setStartedAt((begin) => {
          if (begin != null) setElapsedMs((ms) => ms + (Date.now() - begin));
          return null;
        });
        celebrateCompletion();
      } else {
        setStartedAt((begin) => begin ?? Date.now());
      }
      // `next` holds normalized forms; the reader is shown their own spelling.
      setToast({ word: displayOf.get(next[0]) ?? next[0], all: found.length === words.length });
      const timer = setTimeout(() => setRecentlyFound([]), 500);
      const toastTimer = setTimeout(() => setToast(null), 2200);
      prevFoundRef.current = found;
      return () => {
        clearTimeout(timer);
        clearTimeout(toastTimer);
      };
    }
    prevFoundRef.current = found;
  }, [found, words.length, displayOf]);

  // A new puzzle (different words or size) always starts hidden again.
  useEffect(() => {
    setRevealed(false);
  }, [wordsKey, size]);

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
    "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]";

  const gridBaseClass =
    "grid select-none gap-1 rounded-lg border border-border bg-card touch-none";

  // Compact toolbar icon buttons: keep a comfortable 32px touch target on mobile.
  const compactIconButtonClass =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground transition active:scale-95 hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]";

  const renderGrid = (
    ref: React.RefObject<HTMLDivElement | null>,
    mode: "normal" | "expanded",
  ) => {
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
        className={`${gridBaseClass} ${
          isCompact ? "w-full flex-none content-start p-2" : "p-3"
        } ${
          isExpanded
            ? "mx-auto w-full max-w-[min(100%,68vh)] flex-none self-start lg:mx-0 lg:max-w-[min(56vw,calc(100dvh-7rem))]"
            : ""
        }`}
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
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
                className={`aspect-square rounded-sm font-medium uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--card)] focus-visible:z-10 focus-visible:relative ${
                  isCompact ? "text-[10px] xs:text-xs sm:text-sm" : "text-xs sm:text-sm"
                } ${recently && !reducedMotion ? "animate-[cell-pop_0.4s_ease-out]" : ""}`}
                style={{
                  touchAction: "none",
                  background: isFound
                    ? `color-mix(in oklab, ${foundColorValue} ${inActive ? 40 : 22}%, transparent)`
                    : inActive
                      ? `color-mix(in oklab, ${selectionColor} 32%, transparent)`
                      : revealColorValue
                        ? `color-mix(in oklab, ${revealColorValue} 10%, transparent)`
                        : "transparent",
                  outline: inActive
                    ? `2px solid color-mix(in oklab, ${selectionColor} 75%, transparent)`
                    : isFound
                      ? `1px solid color-mix(in oklab, ${foundColorValue} 55%, transparent)`
                      : revealColorValue
                        ? `1px dashed color-mix(in oklab, ${revealColorValue} 60%, transparent)`
                        : "none",
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
          {toast.all ? t("wordsearch.foundAll") : `${toast.word} — ${t("wordsearch.found")}`}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(43,41,38,0.04)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("wordsearch.wordsToFind")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {found.length}/{words.length}
            </span>
            <button
              type="button"
              onClick={shuffleGrid}
              title={t("wordsearch.shuffleConfirm")}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
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
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">
                {expanded ? t("wordsearch.collapse") : t("wordsearch.expand")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              aria-pressed={revealed}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
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
          className="mt-4 grid gap-2 sm:grid-cols-2"
          aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${words.length}`}
        >
          {puzzle.words.map(({ display: w, normalized }) => {
            const done = found.includes(normalized);
            const color = wordColor.get(normalized);
            return (
              <li
                key={w}
                aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium uppercase tracking-wider transition ${
                  done ? "border-transparent line-through" : "border-border/70 text-muted-foreground"
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

  return (
    <div className={`relative flex flex-col ${fullBleed ? "h-full min-h-0 gap-2" : "space-y-6"}`}>
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
              {toast.all ? t("wordsearch.foundAll") : `${toast.word} — ${t("wordsearch.found")}`}
            </div>
          )}
        </div>
      )}

      {renderGrid(gridRef, "normal")}

      {!compact && wordsPanel(true)}

      {compact && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-1">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 text-[10px] uppercase tracking-wider">
            <span className="text-muted-foreground">{t("wordsearch.words")}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%`, background: "var(--gold)" }}
              />
            </div>
            <span className="font-medium tabular-nums">
              {found.length}/{words.length}
            </span>
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
            className="flex flex-wrap gap-1.5"
            aria-label={`${t("wordsearch.wordsListLabel")} — ${found.length}/${words.length}`}
          >
            {puzzle.words.map(({ display: w, normalized }) => {
              const done = found.includes(normalized);
              const color = done ? wordColor.get(normalized) : undefined;
              return (
                <li
                  key={w}
                  aria-label={`${w}${done ? `, ${t("wordsearch.cellFound")}` : ""}`}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition ${
                    done ? "border-transparent line-through" : "border-border/60 text-muted-foreground"
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
                  {w}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Focus mode overlay — rendered in the DOM at all times so it can enter
          and leave with a smooth fade/scale transition instead of snapping. */}
      <div
        className={`fixed inset-0 z-[80] flex flex-col gap-4 overflow-y-auto bg-[var(--ivory)] p-4 pt-14 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-6 sm:pt-16 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:overflow-hidden lg:p-8 lg:pt-16 ${
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
          className="fixed right-4 top-4 z-10 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground shadow-sm transition hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">{t("wordsearch.collapse")}</span>
        </button>

        {renderGrid(expandedGridRef, "expanded")}

        <div className="w-full lg:w-[360px] lg:flex-none lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
          {wordsPanel(true)}
        </div>
      </div>
    </div>
  );
}
