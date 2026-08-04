import { memo, useEffect, useMemo, useState } from "react";
import { buildGrid, type Placement } from "@/lib/word-search";
import { useI18n } from "@/lib/i18n";
import { Clock, RotateCcw, Maximize2, Check, BookOpen } from "lucide-react";

const WORDS = ["PEACE", "FAITH", "LIGHT", "GRACE", "HOPE"];
const COLORS = [
  { bg: "#BDEBD1", border: "#5E9E6E", fg: "#1F1D1B" },
  { bg: "#C3DDFB", border: "#3E7BC8", fg: "#1F1D1B" },
  { bg: "#FBE7A6", border: "#E0A63A", fg: "#1F1D1B" },
  { bg: "#FCD2AC", border: "#E2853F", fg: "#1F1D1B" },
  { bg: "#E2D5F5", border: "#9B6FCB", fg: "#1F1D1B" },
];

const GridCell = memo(function GridCell({
  letter,
  color,
}: {
  letter: string;
  color?: string;
}) {
  const hit = Boolean(color);
  return (
    <div className="relative flex aspect-square items-center justify-center">
      {hit && (
        <span
          className="absolute inset-[2px] rounded-full"
          style={{ backgroundColor: `${color}40`, border: `1.5px solid ${color}` }}
        />
      )}
      <span
        className="relative z-10 font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]"
        style={{ color: hit ? "#1F1D1B" : "rgba(43,41,38,0.55)" }}
      >
        {letter}
      </span>
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

function HeroWordGrid() {
  const size = 12;
  const { t } = useI18n();
  const { grid, placements } = useMemo(() => buildGrid(WORDS, size), []);
  const wordColor = useMemo(
    () => new Map(WORDS.map((w, i) => [w, COLORS[i % COLORS.length].border])),
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
    <div className="relative flex h-full flex-col bg-[#F9F7F2]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#2B2B2B]/8 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div>
          <p className="mb-1 font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89F4F]">
            {t("hero.grid.title")}
          </p>
          <h2 className="font-['Playfair_Display',serif] text-[22px] font-bold leading-[1.05] text-[#2B2B2B] sm:text-[26px]">
            {t("hero.notebook.title")}
          </h2>
          <p className="mt-1 font-['Crimson_Pro',serif] text-xs uppercase tracking-[0.15em] text-[#6B665C]">
            {t("hero.dev.ref")}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC] px-2.5 py-1 text-[10px] font-medium text-[#2B2B2B] tabular-nums">
          <span className="h-1.5 w-1.5 rounded-full bg-[#78866B]" />
          {foundCount}/{WORDS.length} {t("hero.grid.found")}
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4">
        <div
          className="relative overflow-hidden rounded-lg border border-[#2B2B2B]/10 bg-[#FFFCF7] p-2"
          style={{
            opacity: fading ? 0.35 : 1,
            transition: "opacity 700ms ease-in-out",
          }}
        >
          <div
            className="relative grid"
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

          {/* "Found it!" overlay */}
          <div
            className="pointer-events-none absolute -right-1 top-1/4 z-10 font-['Reenie_Beanie',cursive] text-2xl text-[#2E5C9E]/55 transition-all duration-300 sm:text-3xl"
            style={{
              transform: `rotate(12deg) ${showFoundNote ? "scale(1)" : "scale(0.85)"}`,
              opacity: showFoundNote ? 1 : 0,
            }}
            aria-hidden
          >
            {t("hero.notebook.foundIt")}
          </div>
        </div>
      </div>

      {/* Word chips */}
      <div className="border-t border-[#2B2B2B]/8 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <p className="mb-2.5 font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6B665C]">
          {t("hero.notebook.wordsToSeek")}
        </p>
        <div className="flex flex-wrap gap-2">
          {WORDS.map((w, i) => {
            const found = foundWords.has(w);
            const color = COLORS[i % COLORS.length];
            return (
              <span
                key={w}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-500"
                style={{
                  backgroundColor: found ? `${color.bg}` : "#F3F1EC",
                  borderColor: found ? color.border : "transparent",
                  color: found ? "#1F1D1B" : "#2B2B2B",
                }}
              >
                {found ? (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full"
                    style={{ backgroundColor: color.border }}
                  >
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color.border }}
                  />
                )}
                <span className="font-['Crimson_Pro',serif] tracking-wide">{w}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroDevotionalPage() {
  const { t } = useI18n();
  const words = [
    { key: "peace", color: "#5E9E6E" },
    { key: "faith", color: "#3E7BC8" },
    { key: "light", color: "#E0A63A" },
    { key: "grace", color: "#D26A4E" },
    { key: "hope", color: "#8B5CA8" },
  ] as const;
  const bodyText = t("hero.dev.body");
  const firstLetter = bodyText.charAt(0);
  const restBody = bodyText.slice(1);
  return (
    <div className="relative flex h-full flex-col bg-[#F9F7F2]">
      <div className="flex items-center justify-between border-b border-[#2B2B2B]/8 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div>
          <p className="mb-1 font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89F4F]">
            {t("hero.dev.eyebrow")}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#6B665C]">
            <Clock className="h-3 w-3" />
            <span className="font-['Crimson_Pro',serif] uppercase tracking-wider">
              {t("hero.dev.time")}
            </span>
          </div>
        </div>
        <BookOpen className="h-4 w-4 text-[#C89F4F]/70" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <p className="font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B7355]">
          {t("hero.dev.ref")}
        </p>
        <h3 className="mt-1 font-['Playfair_Display',serif] text-[26px] font-bold leading-[1.05] tracking-[-0.01em] text-[#2B2B2B] sm:text-[30px]">
          {t("hero.dev.title")}
        </h3>

        <div className="mt-4 font-['Crimson_Pro',serif] text-[14px] leading-[1.55] text-[#2B2B2B]/85 sm:text-[15px]">
          <p>
            <span className="float-left mr-2 mt-1 font-['Playfair_Display',serif] text-[40px] font-semibold leading-[0.82] text-[#78866B] sm:text-[48px]">
              {firstLetter}
            </span>
            {restBody}
          </p>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex items-center gap-4 border-b border-[#2B2B2B]/10 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="border-b-2 border-[#C89F4F] pb-2 text-[#2B2B2B]">Scripture</span>
          <span className="pb-2 text-[#6B665C]/70">Devotional</span>
          <span className="pb-2 text-[#6B665C]/70">Reflection</span>
        </div>

        <blockquote className="mt-4 rounded-lg border-l-2 border-[#C89F4F] bg-[#F3F1EC]/50 p-3 font-['Crimson_Pro',serif] text-[13px] italic leading-snug text-[#78866B] sm:p-4 sm:text-[14px]">
          &ldquo;{t("hero.dev.verse")}&rdquo;
          <footer className="mt-2 block font-['Crimson_Pro',serif] text-[10px] not-italic uppercase tracking-[0.2em] text-[#C89F4F]">
            {t("hero.dev.ref")}
          </footer>
        </blockquote>

        {/* Compact word legend for small heights */}
        <div className="mt-4 lg:hidden">
          <p className="font-['Crimson_Pro',serif] text-[10px] font-semibold uppercase tracking-[0.25em] text-[#6B665C]">
            {t("hero.dev.wordsTitle")}
          </p>
          <ul className="mt-2 grid gap-1.5">
            {words.map((w) => (
              <li
                key={w.key}
                className="flex gap-2 font-['Crimson_Pro',serif] text-[11px] leading-[1.4] text-[#2D2926]"
              >
                <span
                  aria-hidden
                  className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: w.color,
                    boxShadow: `0 0 0 3px ${w.color}22`,
                  }}
                />
                <span className="line-clamp-2">{t(`hero.dev.word.${w.key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botanical accent */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-2 h-24 w-24 opacity-20 sm:h-28 sm:w-28"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 100c0-40 20-55 25-75M50 100c0-35-15-50-22-70M50 100c0-20 0-45 0-60"
          stroke="#78866B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M50 55c-8-8-18-10-25-5M50 50c10-10 20-12 28-6M50 70c-12-6-22-5-30 2M50 75c12-8 22-6 30 3"
          stroke="#78866B"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="28" cy="48" r="2.5" fill="#C89F4F" />
        <circle cx="74" cy="52" r="2.5" fill="#C89F4F" />
        <circle cx="22" cy="70" r="2" fill="#C89F4F" />
        <circle cx="80" cy="76" r="2" fill="#C89F4F" />
      </svg>
    </div>
  );
}

function SpiralBinding({ count = 16 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-10 -translate-x-1/2 lg:block">
      {Array.from({ length: count }).map((_, i) => {
        const top = `${(i + 0.5) * (100 / count)}%`;
        return (
          <div
            key={i}
            className="absolute left-1/2 h-4 w-8 -translate-x-1/2 -translate-y-1/2"
            style={{ top }}
          >
            <svg
              viewBox="0 0 32 16"
              className="h-full w-full"
              aria-hidden
            >
              <path
                d="M2 8c0-4 4-6 8-6s8 2 8 6-4 6-8 6"
                fill="none"
                stroke="#8B8375"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M18 8c0-4 4-6 8-6s4 2 4 6-0 6-4 6"
                fill="none"
                stroke="#A89A88"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="8" r="2.2" fill="#B8AA96" />
              <circle cx="24" cy="8" r="1.8" fill="#C8BAA6" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export function HeroJournal() {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,520px)] sm:max-w-[min(640px,calc(100dvh-18rem))] lg:max-w-[min(840px,calc(100dvh-7rem))]">
      {/* Outer shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-[2rem] bg-[#1F1D1B]/12 blur-2xl sm:-inset-4 sm:rounded-[2.5rem]"
      />

      {/* Notebook cover */}
      <div
        className="relative overflow-hidden rounded-[1.5rem] bg-[#78866B] p-3 shadow-2xl sm:rounded-[2rem] sm:p-4 lg:aspect-square lg:p-5"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.14) 100%)",
          boxShadow:
            "0 50px 100px -30px rgba(0,0,0,0.32), 0 24px 48px -24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Leather grain texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
            mixBlendMode: "multiply",
          }}
        />

        {/* Page stack beneath */}
        <div aria-hidden className="pointer-events-none absolute -bottom-5 left-8 right-8 h-6 rounded-b-xl bg-[#F5F3EE]/80 shadow-sm" />
        <div aria-hidden className="pointer-events-none absolute -bottom-9 left-12 right-12 h-6 rounded-b-xl bg-[#F5F3EE]/60 shadow-sm" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-16 right-16 h-5 rounded-b-lg bg-[#F5F3EE]/40 shadow-sm" />

        {/* Silk bookmark */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1 left-1/2 z-30 hidden h-28 w-2.5 -translate-x-1/2 rounded-b-sm shadow-md lg:block"
          style={{
            background:
              "linear-gradient(90deg, #b88a3b 0%, #C89F4F 40%, #d4b466 60%, #b88a3b 100%)",
          }}
        />

        {/* Open spread */}
        <div className="relative flex flex-col overflow-hidden rounded-xl bg-[#F9F7F2] lg:h-full lg:flex-row">
          {/* Paper texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.18]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Left page */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden border-b border-black/[0.08] lg:min-h-0 lg:border-b-0 lg:border-r">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-6 bg-gradient-to-l from-[#1F1D1B]/[0.09] to-transparent lg:block"
            />
            <HeroWordGrid />
          </div>

          {/* Spine / gutter */}
          <div
            aria-hidden
            className="pointer-events-none relative z-20 flex-shrink-0 h-4 bg-[#E8E2D6] lg:h-auto lg:w-12"
            style={{
              background:
                "linear-gradient(180deg, rgba(31,29,27,0.05), rgba(31,29,27,0.14) 50%, rgba(31,29,27,0.05)), linear-gradient(90deg, #E8E2D6 0%, #CFC6B0 50%, #E8E2D6 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <div className="absolute left-1/2 top-1/2 hidden h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-[#1F1D1B]/12 lg:block lg:h-auto lg:w-px lg:-translate-y-0" />
          </div>

          {/* Spiral binding overlay */}
          <SpiralBinding count={18} />

          {/* Right page */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden lg:min-h-0">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-6 bg-gradient-to-r from-[#1F1D1B]/[0.09] to-transparent lg:block"
            />
            <HeroDevotionalPage />
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between sm:bottom-5 sm:left-5 sm:right-5 lg:bottom-6 lg:left-6 lg:right-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2B2B2B] backdrop-blur-sm">
              <RotateCcw className="h-3 w-3" />
              Reset
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F1EC]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2B2B2B] backdrop-blur-sm">
              Hint (3)
            </span>
          </div>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2B2B2B]/90 text-[#F9F7F2] shadow-lg backdrop-blur-sm sm:h-9 sm:w-9">
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
