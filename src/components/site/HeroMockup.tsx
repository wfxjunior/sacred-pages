import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
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
          strokeWidth="0.9"
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
        <div className="grid gap-4 p-4 sm:gap-5 sm:p-5 md:gap-6 md:p-6 lg:grid-cols-[1.15fr_1fr] lg:p-7">
          {/* Word search grid */}
          <div
            className="relative mx-auto grid w-full max-w-[440px] gap-1 rounded-2xl border border-border/60 p-2 sm:p-3 lg:mx-0 lg:max-w-none"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0,1fr))`,
              background: "color-mix(in oklab, var(--ivory) 60%, transparent)",
            }}
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

          {/* Side panel */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-wrap gap-1.5">
              {orderedWords.map((w) => {
                const done = foundWords.has(w);
                const color = wordColor.get(w) ?? "var(--gold)";
                return (
                  <span
                    key={w}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all duration-500 ${
                      done ? "" : "border-border text-muted-foreground"
                    }`}
                    style={
                      done
                        ? {
                            color: "var(--ink)",
                            borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
                            background: `color-mix(in oklab, ${color} 22%, transparent)`,
                          }
                        : undefined
                    }
                  >
                    {done && <Check className="h-2.5 w-2.5" />}
                    {w}
                  </span>
                );
              })}
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{t("mock.progress")}</span>
                <span>
                  {foundCount} / {orderedWords.length} {t("mock.wordsFound")}
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

    </div>
  );
}