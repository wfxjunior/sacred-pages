import { memo, useEffect, useMemo, useState } from "react";
import { buildGrid, type Placement } from "@/lib/word-search";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

const WORDS = ["PEACE", "FAITH", "LIGHT", "GRACE", "HOPE"];
const COLORS = ["#5E9E6E", "#3E7BC8", "#E0A63A", "#D26A4E", "#8B5CA8"];

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
      className="flex aspect-square items-center justify-center rounded-[3px] text-[10px] font-semibold sm:text-[11px] md:text-xs"
      style={{
        backgroundColor: hit ? `color-mix(in oklab, ${color} 42%, white)` : "white",
        color: hit ? "#1F1F1F" : "rgba(43,43,43,0.55)",
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

function SpiralBinding({ count = 12 }: { count?: number }) {
  return (
    <div
      className="absolute -left-3 top-4 bottom-4 z-20 hidden flex-col justify-between py-1 sm:flex"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 w-7 rounded-full border border-gray-400 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 shadow-sm"
        />
      ))}
    </div>
  );
}

function CheckBullet({ checked, color }: { checked: boolean; color: string }) {
  return (
    <span
      className="flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-500 sm:h-5 sm:w-5"
      style={
        checked
          ? {
              borderColor: color,
              backgroundColor: color,
              boxShadow: `0 1px 2px ${color}40`,
            }
          : {
              borderColor: "#E4E0D6",
              backgroundColor: "white",
            }
      }
    >
      {checked && (
        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </span>
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
    <div className="relative w-full">
      <div
        className="relative overflow-hidden rounded-lg bg-[#FCFBF8] shadow-[0_24px_60px_-16px_rgba(43,41,38,0.18)] sm:rounded-xl"
        style={{
          opacity: fading ? 0.35 : 1,
          transition: "opacity 700ms ease-in-out",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        }}
      >
        <SpiralBinding count={12} />

        {/* Margin line */}
        <div className="absolute left-10 top-0 bottom-0 hidden w-px bg-[#E8A5A5]/30 sm:block" aria-hidden />

        <div className="p-4 sm:pl-14 sm:pr-6 sm:pt-6 sm:pb-5">
          {/* Header */}
          <div className="mb-4 border-b border-[#C89F4F]/20 pb-3 sm:mb-5 sm:pb-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-normal italic leading-none text-[#2E5C9E] sm:text-3xl">
                  {t("brand.name")}
                </h2>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A4A5E]/80">
                  {t("hero.notebook.volume")}
                </p>
              </div>
              <span
                className="hidden font-['Reenie_Beanie',cursive] text-2xl text-[#7A8F73] sm:block sm:text-3xl"
                style={{ transform: "rotate(-2deg)" }}
              >
                {t("hero.notebook.practice")}
              </span>
            </div>
          </div>

          {/* Count badge */}
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B665C]">
              {t("hero.grid.title")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC] px-2 py-1 text-[10px] font-medium text-[#2B2B2B] tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7A8F73]" />
              {foundCount}/{WORDS.length} {t("hero.grid.found")}
            </span>
          </div>

          {/* Grid */}
          <div
            className="relative grid gap-[2px] rounded-xl bg-[#E4E0D6] p-1.5"
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
              className="pointer-events-none absolute -right-2 top-1/4 z-10 font-['Reenie_Beanie',cursive] text-2xl text-[#2E5C9E]/40 transition-all duration-300 sm:text-3xl"
              style={{
                transform: `rotate(12deg) ${showFoundNote ? "scale(1)" : "scale(0.85)"}`,
                opacity: showFoundNote ? 1 : 0,
              }}
              aria-hidden
            >
              Found it!
            </div>
          </div>

          {/* Word checklist */}
          <div className="mt-4 sm:mt-5">
            <h3 className="mb-2 font-serif text-sm text-[#2E5C9E] sm:mb-3 sm:text-base">
              {t("hero.notebook.wordsToSeek")}
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {WORDS.map((w) => {
                const found = foundWords.has(w);
                const color = wordColor.get(w) ?? "#C89F4F";
                return (
                  <div
                    key={w}
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all duration-500 sm:px-3 sm:py-1.5"
                    style={
                      found
                        ? {
                            color: `color-mix(in oklab, ${color} 70%, #1F1F1F)`,
                            borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
                            background: `color-mix(in oklab, ${color} 12%, white)`,
                          }
                        : {
                            color: "#6B665C",
                            borderColor: "#E4E0D6",
                            background: "white",
                          }
                    }
                  >
                    <CheckBullet checked={found} color={color} />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-[11px]"
                      style={found ? { textDecoration: "line-through", textDecorationColor: `${color}80` } : undefined}
                    >
                      {w}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="mt-4 h-1 w-full overflow-hidden rounded-full sm:mt-5"
            style={{ background: "#F3F1EC" }}
          >
            <div
              className="h-full w-full origin-left rounded-full"
              style={{
                transform: `scaleX(${foundCount / WORDS.length})`,
                transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                background: "linear-gradient(90deg, #C89F4F, color-mix(in oklab, #C89F4F 60%, #7A8F73))",
              }}
            />
          </div>

          {/* Footer: free trial + CTA */}
          <div className="mt-4 flex items-center justify-between border-t border-[#C89F4F]/10 pt-4 sm:mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4ECF8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#2E5C9E]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C89F4F]" />
              {t("hero.notebook.firstFree")}
            </span>
            <Link
              to="/today"
              className="inline-flex items-center justify-center rounded-sm bg-[#2E5C9E] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[#1F3F70] sm:px-5 sm:text-[11px]"
            >
              {t("hero.notebook.continue")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
