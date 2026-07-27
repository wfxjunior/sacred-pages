import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { buildGrid, type Placement } from "@/lib/word-search";
import { TODAY } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

// Rotating palette so each word lights up in its own hue
const WORD_COLORS = [
  "var(--gold)",
  "var(--sage)",
  "var(--dusty-blue)",
  "var(--walnut)",
  "var(--gold)",
];

// Memoized cell — re-renders only when its highlight color changes.
const Cell = memo(function Cell({ letter, color }: { letter: string; color?: string }) {
  const hit = Boolean(color);
  return (
    <div
      className="flex aspect-square items-center justify-center rounded-md text-[10px] font-medium uppercase sm:text-[11px]"
      style={{
        backgroundColor: hit ? `color-mix(in oklab, ${color} 18%, transparent)` : "transparent",
        color: hit ? "var(--ink)" : "color-mix(in oklab, var(--ink) 70%, transparent)",
        transform: hit ? "scale(1)" : "scale(0.98)",
        transition: "transform 300ms ease-out, background-color 300ms ease-out",
        willChange: "transform",
      }}
    >
      {letter}
    </div>
  );
});

// Elegant drawn line over found words. SVG is percentage-based so it stays
// locked to the grid at any size, and the path is animated with stroke-dashoffset.
function FoundWordLines({
  placements,
  foundWords,
  wordColor,
  size,
}: {
  placements: Placement[];
  foundWords: Set<string>;
  wordColor: Map<string, string>;
  size: number;
}) {
  const unit = 100 / size; // each cell occupies this % of the SVG viewport
  const offset = unit / 2; // center of the cell

  const paths = useMemo(() => {
    return placements
      .filter((p) => foundWords.has(p.word))
      .map((p) => {
        const color = wordColor.get(p.word) ?? "var(--gold)";
        const x1 = p.col * unit + offset;
        const y1 = p.row * unit + offset;
        const x2 = (p.col + p.dc * (p.word.length - 1)) * unit + offset;
        const y2 = (p.row + p.dr * (p.word.length - 1)) * unit + offset;
        const length = Math.hypot(x2 - x1, y2 - y1);
        return {
          key: `${p.word}-${p.row}-${p.col}`,
          d: `M ${x1} ${y1} L ${x2} ${y2}`,
          color,
          length: `${length}`,
        };
      });
  }, [placements, foundWords, wordColor, unit, offset]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {paths.map(({ key, d, color, length }) => (
        <path
          key={key}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: `${length} ${length}`,
            strokeDashoffset: `${length}`,
            animation: "draw-line 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
            opacity: 0.9,
          }}
        />
      ))}
    </svg>
  );
}

function WordChip({
  word,
  found,
  color,
}: {
  word: string;
  found: boolean;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all duration-500 ${
        found ? "" : "border-border text-muted-foreground"
      }`}
      style={
        found
          ? {
              color: "var(--ink)",
              borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
              background: `color-mix(in oklab, ${color} 22%, transparent)`,
            }
          : undefined
      }
    >
      {found && <Check className="h-2.5 w-2.5" />}
      {word}
    </span>
  );
}

function ProgressBlock({
  foundCount,
  total,
  progressPct,
  compact = false,
}: {
  foundCount: number;
  total: number;
  progressPct: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div
        className={`flex items-center justify-between uppercase tracking-wider text-muted-foreground ${
          compact ? "text-[10px]" : "text-xs"
        }`}
      >
        <span>{t("mock.progress")}</span>
        <span>
          {foundCount} / {total} {t("mock.wordsFound")}
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "color-mix(in oklab, var(--walnut) 12%, transparent)" }}
      >
        {/* GPU-friendly progress: animate transform: scaleX instead of width */}
        <div
          className="h-full w-full origin-left rounded-full"
          style={{
            transform: `scaleX(${progressPct / 100})`,
            transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
            background:
              "linear-gradient(90deg, var(--gold), color-mix(in oklab, var(--gold) 55%, var(--sage)))",
          }}
        />
      </div>
    </div>
  );
}

export function HeroMockup() {
  const { t } = useI18n();
  const size = 10;
  const { grid, placements } = useMemo(
    () => buildGrid(TODAY.words.slice(0, 5), size),
    [],
  );

  const tabs = useMemo(
    () => [
      { key: "read", label: t("mock.tab.read") },
      { key: "search", label: t("mock.tab.search") },
      { key: "reflect", label: t("mock.tab.reflect") },
      { key: "pray", label: t("mock.tab.pray") },
    ],
    [t],
  );

  // Cycle through tabs to make the mockup feel alive.
  // Uses rAF-driven timing and respects prefers-reduced-motion.
  const [activeTab, setActiveTab] = useState(1); // start on Word Search
  const [autoPlay, setAutoPlay] = useState(true);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => {
    if (!autoPlay) return;
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (document.hidden) {
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      if (now - last >= 3800) {
        last = now;
        setActiveTab((i) => (i + 1) % tabs.length);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tabs.length, autoPlay]);

  const focusTab = (i: number) => {
    const next = (i + tabs.length) % tabs.length;
    setActiveTab(next);
    setAutoPlay(false);
    requestAnimationFrame(() => tabRefs.current[next]?.focus());
  };

  // Progressively "find" words while on the Search tab (rAF-based)
  const orderedWords = useMemo(() => TODAY.words.slice(0, 5), []);
  const [foundCount, setFoundCount] = useState(3);
  useEffect(() => {
    if (tabs[activeTab].key !== "search") return;
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFoundCount(2);
    if (reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (document.hidden) {
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      if (now - last >= 900) {
        last = now;
        setFoundCount((c) => (c >= orderedWords.length ? 2 : c + 1));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeTab, tabs, orderedWords.length]);

  const wordColor = useMemo(
    () => new Map(orderedWords.map((w, i) => [w, WORD_COLORS[i % WORD_COLORS.length]])),
    [orderedWords],
  );
  const { foundWords, highlighted } = useMemo(() => {
    const set = new Set(orderedWords.slice(0, foundCount));
    const map = new Map<string, string>();
    for (const p of placements) {
      if (!set.has(p.word)) continue;
      const color = wordColor.get(p.word) ?? "var(--gold)";
      for (let i = 0; i < p.word.length; i++) {
        map.set(`${p.row + p.dr * i},${p.col + p.dc * i}`, color);
      }
    }
    return { foundWords: set, highlighted: map };
  }, [foundCount, orderedWords, placements, wordColor]);

  const progressPct = Math.round((foundCount / orderedWords.length) * 100);

  // Mobile bottom sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  // Lock body scroll while sheet is open (mobile only)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  return (
    <div className="relative">
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[3rem] opacity-60 blur-2xl"
        style={{
          background:
            "radial-gradient(55% 55% at 30% 20%, color-mix(in oklab, var(--gold) 22%, transparent), transparent 65%), radial-gradient(45% 45% at 80% 85%, color-mix(in oklab, var(--sage) 18%, transparent), transparent 65%)",
        }}
      />

      <div
        className="overflow-hidden rounded-[28px] border border-border/60 bg-card/95 backdrop-blur"
        style={{
          boxShadow:
            "0 40px 80px -40px rgba(43,43,43,0.28), 0 12px 32px -20px rgba(43,43,43,0.12)",
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--walnut) 30%, transparent)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--gold) 40%, transparent)" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in oklab, var(--sage) 40%, transparent)" }} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
            {t("hero.label")}
          </p>
          <div className="w-10" />
        </div>

        {/* Header */}
        <div className="px-5 pt-5 sm:px-6 sm:pt-6 md:px-7 md:pt-7">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--gold)" }}>
            {TODAY.reference}
          </p>
          <h3 className="mt-2 font-serif text-xl leading-tight sm:text-[22px] md:text-2xl lg:text-[26px]">
            {TODAY.title}
          </h3>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={t("hero.label")}
          className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-0 border-b border-border/50 px-3 sm:px-5"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); focusTab(activeTab + 1); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); focusTab(activeTab - 1); }
            else if (e.key === "Home") { e.preventDefault(); focusTab(0); }
            else if (e.key === "End") { e.preventDefault(); focusTab(tabs.length - 1); }
          }}
        >
          {tabs.map((tab, i) => {
            const active = i === activeTab;
            return (
              <button
                key={tab.key}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                type="button"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onClick={() => { setActiveTab(i); setAutoPlay(false); }}
                className={`rounded-t-md border-b-2 px-2.5 py-2.5 text-[11px] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:px-3 sm:text-xs ${
                  active
                    ? "border-current font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  color: active ? "var(--walnut)" : undefined,
                  ["--tw-ring-color" as string]: "var(--gold)",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="relative grid gap-4 p-4 sm:gap-5 sm:p-5 md:gap-6 md:p-6 lg:grid-cols-[1.15fr_1fr] lg:p-7">
          {/* Word search grid */}
          <div
            className="relative mx-auto w-full max-w-[440px] rounded-2xl border border-border/60 p-2 sm:p-3 lg:mx-0 lg:max-w-none"
            style={{ background: "color-mix(in oklab, var(--ivory) 60%, transparent)" }}
          >
            <div
              className="relative grid gap-1"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}
            >
              <FoundWordLines
                placements={placements}
                foundWords={foundWords}
                wordColor={wordColor}
                size={size}
              />
              {grid.map((row, r) =>
                row.map((letter, c) => (
                  <Cell
                    key={`${r}-${c}`}
                    letter={letter}
                    color={highlighted.get(`${r},${c}`)}
                  />
                )),
              )}
            </div>

            {/* Mobile floating trigger for the word sheet */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-expanded={sheetOpen}
              aria-controls="word-sheet"
              className="absolute -bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider shadow-lg outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory lg:hidden"
              style={{
                background: "var(--ink)",
                color: "var(--ivory)",
                ["--tw-ring-color" as string]: "var(--gold)",
                boxShadow: "0 12px 28px -10px rgba(43,43,43,0.35)",
              }}
            >
              {t("mock.sheet.words")} {foundCount}/{orderedWords.length}
            </button>
          </div>

          {/* Desktop side panel */}
          <div className="hidden flex-col gap-4 lg:flex lg:gap-5">
            <div className="flex flex-wrap gap-1.5">
              {orderedWords.map((w) => (
                <WordChip
                  key={w}
                  word={w}
                  found={foundWords.has(w)}
                  color={wordColor.get(w) ?? "var(--gold)"}
                />
              ))}
            </div>

            <ProgressBlock
              foundCount={foundCount}
              total={orderedWords.length}
              progressPct={progressPct}
            />

            <div
              key={activeTab}
              className="rounded-xl border border-border/50 p-4 animate-fade-in"
              style={{ background: "color-mix(in oklab, var(--ivory) 55%, transparent)" }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "var(--walnut)" }}
              >
                {tabs[activeTab].label}
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {tabs[activeTab].key === "read"
                  ? TODAY.scripture
                  : tabs[activeTab].key === "pray"
                    ? TODAY.prayer
                    : tabs[activeTab].key === "search"
                      ? TODAY.devotional
                      : TODAY.reflection}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet: word list + progress + reflection */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="word-sheet-title"
          id="word-sheet"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/20 backdrop-blur-sm transition-opacity"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            ref={sheetRef}
            className="relative w-full rounded-t-[2.5rem] bg-[var(--ivory)] shadow-2xl animate-slide-up"
            style={{
              boxShadow: "0 -20px 60px -20px rgba(43,43,43,0.25)",
              maxHeight: "85vh",
            }}
          >
            {/* Drag handle + close */}
            <div className="flex items-center justify-center px-5 pt-4">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="mx-auto h-1.5 w-14 rounded-full bg-ink/15 transition-colors hover:bg-ink/25"
                aria-label="Close word list"
              />
            </div>

            <div className="flex max-h-[85vh] flex-col overflow-y-auto px-6 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
                    {TODAY.reference}
                  </p>
                  <h2
                    id="word-sheet-title"
                    className="mt-1 font-serif text-2xl leading-tight"
                    style={{ color: "var(--ink)" }}
                  >
                    {t("mock.sheet.dailyWalk")}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <ProgressBlock
                  foundCount={foundCount}
                  total={orderedWords.length}
                  progressPct={progressPct}
                />
              </div>

              {/* Word chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {orderedWords.map((w) => (
                  <WordChip
                    key={w}
                    word={w}
                    found={foundWords.has(w)}
                    color={wordColor.get(w) ?? "var(--gold)"}
                  />
                ))}
              </div>

              {/* Reflection card */}
              <div
                className="mt-6 rounded-2xl border p-5"
                style={{
                  background: "color-mix(in oklab, var(--ivory) 90%, white)",
                  borderColor: "color-mix(in oklab, var(--walnut) 15%, transparent)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--walnut)" }}
                >
                  {t("mock.sheet.reflection")}
                </p>
                <p className="mt-3 font-serif text-lg leading-relaxed" style={{ color: "var(--ink)" }}>
                  “{TODAY.reflection}”
                </p>
                <p className="mt-3 text-xs" style={{ color: "var(--walnut)" }}>
                  — {TODAY.reference}
                </p>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="mt-6 w-full rounded-full py-3.5 text-xs font-medium uppercase tracking-wider outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                style={{
                  background: "var(--gold)",
                  color: "var(--ivory)",
                  ["--tw-ring-color" as string]: "var(--walnut)",
                }}
              >
                {t("mock.sheet.continue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
