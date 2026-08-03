import { memo, useEffect, useMemo, useState } from "react";
import { buildGrid, type Placement } from "@/lib/word-search";
import { useI18n } from "@/lib/i18n";

const WORDS = ["PEACE", "FAITH", "LIGHT", "GRACE", "HOPE"];
const COLORS = ["#5E9E6E", "#3E7BC8", "#E0A63A", "#E2853F", "#9B6FCB"];

const GridCell = memo(function GridCell({
  letter,
  color,
}: {
  letter: string;
  color?: string;
}) {
  const hit = Boolean(color);
  return (
    <div
      className="flex aspect-square items-center justify-center font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]"
      style={{
        backgroundColor: hit ? `color-mix(in oklab, ${color} 24%, #F9F7F2)` : "transparent",
        borderRight: "1px solid rgba(43,41,38,0.08)",
        borderBottom: "1px solid rgba(43,41,38,0.08)",
        color: hit ? "#1F1D1B" : "rgba(43,41,38,0.55)",
        transition: "background-color 400ms ease-out, color 400ms ease-out",
      }}
    >
      {letter}
    </div>
  );
});

function FoundLines({
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
  const unit = 100 / size;
  const offset = unit / 2;
  const paths = useMemo(
    () =>
      placements
        .filter((p) => foundWords.has(p.word))
        .map((p) => {
          const pad = unit * 0.38;
          const dirLen = Math.hypot(p.dc, p.dr) || 1;
          const ux = p.dc / dirLen;
          const uy = p.dr / dirLen;
          const x1 = p.col * unit + offset - ux * pad;
          const y1 = p.row * unit + offset - uy * pad;
          const x2 = (p.col + p.dc * (p.word.length - 1)) * unit + offset + ux * pad;
          const y2 = (p.row + p.dr * (p.word.length - 1)) * unit + offset + uy * pad;
          const length = Math.hypot(x2 - x1, y2 - y1);
          return {
            key: p.word,
            d: `M ${x1} ${y1} L ${x2} ${y2}`,
            color: wordColor.get(p.word) ?? "#C89F4F",
            length: `${length}`,
          };
        }),
    [placements, foundWords, wordColor, unit, offset],
  );

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
          strokeWidth="2.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: `${length} ${length}`,
            strokeDashoffset: length,
            animation: "draw-line 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
            opacity: 0.92,
          }}
        />
      ))}
    </svg>
  );
}

export function HeroWordGrid() {
  const size = 12;
  const { t } = useI18n();
  const { grid, placements } = useMemo(() => buildGrid(WORDS, size), []);
  const wordColor = useMemo(
    () => new Map(WORDS.map((w, i) => [w, COLORS[i % COLORS.length]])),
    [],
  );

  const [foundCount, setFoundCount] = useState(0);
  const [fading, setFading] = useState(false);
  const [showFoundNote, setShowFoundNote] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setFoundCount(WORDS.length);
      return;
    }
    let raf = 0;
    let last = performance.now();
    let holding = false;
    const tick = (now: number) => {
      if (document.hidden) {
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      const delta = now - last;
      if (!holding && delta >= 1400) {
        last = now;
        setFoundCount((c) => {
          if (c >= WORDS.length) {
            holding = true;
            window.setTimeout(() => setFading(true), 1800);
            window.setTimeout(() => {
              setFading(false);
              setFoundCount(0);
              last = performance.now();
              holding = false;
            }, 2600);
            return c;
          }
          setShowFoundNote(true);
          window.setTimeout(() => setShowFoundNote(false), 900);
          return c + 1;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { foundWords, highlighted } = useMemo(() => {
    const set = new Set(WORDS.slice(0, foundCount));
    const map = new Map<string, string>();
    for (const p of placements) {
      if (!set.has(p.word)) continue;
      const color = wordColor.get(p.word) ?? "#C89F4F";
      for (let i = 0; i < p.word.length; i++) {
        map.set(`${p.row + p.dr * i},${p.col + p.dc * i}`, color);
      }
    }
    return { foundWords: set, highlighted: map };
  }, [foundCount, placements, wordColor]);

  return (
    <div className="relative h-full w-full">
      <div
        className="relative h-full overflow-hidden bg-[#F9F7F2]"
        style={{
          opacity: fading ? 0.35 : 1,
          transition: "opacity 700ms ease-in-out",
        }}
      >
        <div className="p-4 sm:p-5 lg:p-8">
          {/* Header */}
          <header className="mb-3 border-b border-[#C89F4F]/25 pb-2 sm:mb-4 sm:pb-4">
            <p className="font-['Playfair_Display',serif] text-xs italic text-[#C89F4F]">
              {t("hero.notebook.part")}
            </p>
            <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2B2B2B] sm:text-3xl">
              {t("hero.notebook.title")}
            </h2>
          </header>

          {/* Count badge */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B665C]">
              {t("hero.grid.title")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC] px-2 py-1 text-[10px] font-medium text-[#2B2B2B] tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-[#78866B]" />
              {foundCount}/{WORDS.length} {t("hero.grid.found")}
            </span>
          </div>

          {/* Grid — hand-drawn notebook style */}
          <div
            className="relative grid border border-[#2B2B2B]/10 bg-[#FFFCF7]"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}
          >
            <FoundLines
              placements={placements}
              foundWords={foundWords}
              wordColor={wordColor}
              size={size}
            />
            {grid.map((row, r) =>
              row.map((letter, c) => (
                <GridCell
                  key={`${r}-${c}`}
                  letter={letter}
                  color={highlighted.get(`${r},${c}`)}
                />
              )),
            )}

            {/* Handwritten "Found it!" overlay */}
            <div
              className="pointer-events-none absolute -right-2 top-1/4 z-10 font-['Reenie_Beanie',cursive] text-2xl text-[#2E5C9E]/50 transition-all duration-300 sm:text-3xl"
              style={{
                transform: `rotate(12deg) ${showFoundNote ? "scale(1)" : "scale(0.85)"}`,
                opacity: showFoundNote ? 1 : 0,
              }}
              aria-hidden
            >
              {t("hero.notebook.foundIt")}
            </div>
          </div>

          {/* Word checklist */}
          <div className="mt-5">
            <h3 className="mb-3 font-['Playfair_Display',serif] text-sm text-[#78866B] sm:text-base">
              {t("hero.notebook.wordsToSeek")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {WORDS.map((w) => {
                const found = foundWords.has(w);
                const color = wordColor.get(w) ?? "#C89F4F";
                return (
                  <span
                    key={w}
                    className="font-['Crimson_Pro',serif] text-sm italic transition-all duration-500"
                    style={
                      found
                        ? {
                            color: `color-mix(in oklab, ${color} 70%, #1F1F1F)`,
                            textDecoration: "line-through",
                            textDecorationColor: `${color}80`,
                          }
                        : { color: "#2B2B2B" }
                    }
                  >
                    {w}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
