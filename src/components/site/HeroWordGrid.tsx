import { memo, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { buildGrid, type Placement } from "@/lib/word-search";

const WORDS = ["PEACE", "FAITH", "LIGHT", "GRACE", "HOPE"];
const COLORS = ["#7A8F73", "#5E7FA3", "#C89F4F", "#6E5847", "#B88A3B"];

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
        backgroundColor: hit ? `color-mix(in oklab, ${color} 22%, white)` : "white",
        color: hit ? "#2B2B2B" : "rgba(43,43,43,0.55)",
        transition: "background-color 400ms ease-out",
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
          const x1 = p.col * unit + offset;
          const y1 = p.row * unit + offset;
          const x2 = (p.col + p.dc * (p.word.length - 1)) * unit + offset;
          const y2 = (p.row + p.dr * (p.word.length - 1)) * unit + offset;
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
          strokeWidth="1.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            strokeDasharray: `${length} ${length}`,
            strokeDashoffset: length,
            animation: "draw-line 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
            opacity: 0.85,
          }}
        />
      ))}
    </svg>
  );
}

export function HeroWordGrid() {
  const size = 12;
  const { grid, placements } = useMemo(() => buildGrid(WORDS, size), []);
  const wordColor = useMemo(
    () => new Map(WORDS.map((w, i) => [w, COLORS[i % COLORS.length]])),
    [],
  );

  // Start with a few words already discovered so the hero never looks empty
  // on first paint (and matches SSR to avoid hydration flashes).
  const [foundCount, setFoundCount] = useState(3);
  const [fading, setFading] = useState(false);

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
      if (!holding && delta >= 1800) {
        last = now;
        setFoundCount((c) => {
          if (c >= WORDS.length) {
            // Hold the complete state, then fade out and restart softly.
            holding = true;
            window.setTimeout(() => setFading(true), 2200);
            window.setTimeout(() => {
              setFading(false);
              setFoundCount(1);
              last = performance.now();
              holding = false;
            }, 3000);
            return c;
          }
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
        className="relative overflow-hidden rounded-2xl border border-[#E4E0D6] bg-white p-3 shadow-[0_12px_40px_-12px_rgba(43,43,43,0.12)] sm:rounded-3xl sm:p-4 md:p-5"
        style={{
          opacity: fading ? 0.35 : 1,
          transition: "opacity 700ms ease-in-out",
        }}
      >
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B665C]">
            Daily word search
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC] px-2 py-1 text-[10px] font-medium text-[#2B2B2B] tabular-nums">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7A8F73]" />
            {foundCount}/{WORDS.length} found
          </span>
        </div>

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
        </div>

        {/* Word chips below the grid */}
        <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
          {WORDS.map((w) => {
            const found = foundWords.has(w);
            const color = wordColor.get(w) ?? "#C89F4F";
            return (
              <span
                key={w}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-500 sm:text-[11px]"
                style={
                  found
                    ? {
                        color: "#2B2B2B",
                        borderColor: `color-mix(in oklab, ${color} 55%, transparent)`,
                        background: `color-mix(in oklab, ${color} 20%, white)`,
                      }
                    : {
                        color: "#6B665C",
                        borderColor: "#E4E0D6",
                        background: "white",
                      }
                }
              >
                {found && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                {w}
              </span>
            );
          })}
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
              background:
                "linear-gradient(90deg, #C89F4F, color-mix(in oklab, #C89F4F 60%, #7A8F73))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
