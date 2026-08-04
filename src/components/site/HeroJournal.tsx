import { memo, useEffect, useMemo, useState } from "react";
import { buildGrid, type Placement } from "@/lib/word-search";
import { useI18n } from "@/lib/i18n";
import { Clock, RotateCcw, Lightbulb, Shuffle, Check } from "lucide-react";

/**
 * The hero journal spread.
 *
 * Modelled on a real open devotional notebook: two flat ivory pages and a soft
 * gutter where the paper curves into the binding. No leather cover, no spiral,
 * no floating chrome — the reference is a printed journal, and every added
 * ornament made it read as a mockup instead of a page.
 *
 * The palette is deliberately monochrome warm: found words are marked with
 * pencil-soft tan capsules rather than colours, so the grid stays as quiet as
 * the devotional facing it.
 */

const WORDS = ["PEACE", "FAITH", "LIGHT", "GRACE", "HOPE"];

const INK = "#1F1D1B";
const MUTED = "#8A8478";
const PAPER = "#F7F5F0";
const PAPER_WARM = "#F2EFE7";
const MARK = "#B9A882";

const GridCell = memo(function GridCell({
  letter,
  hit,
}: {
  letter: string;
  hit: boolean;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center border-b border-r border-[#1F1D1B]/[0.05]">
      <span
        className="relative z-10 font-['Crimson_Pro',serif] font-medium uppercase leading-none tracking-[0.02em] transition-colors duration-500"
        style={{ color: hit ? INK : "rgba(31,29,27,0.62)", fontSize: "4.6cqw" }}
      >
        {letter}
      </span>
    </div>
  );
});

/**
 * Found-word marks.
 *
 * Drawn as rotated capsules rather than SVG strokes so each mark can carry a
 * real hairline border plus a translucent fill — the pencil-loop look of the
 * reference. The grid is square, so percentage geometry stays true under
 * rotation.
 */
function FoundMarks({
  placements,
  foundWords,
  size,
}: {
  placements: Placement[];
  foundWords: Set<string>;
  size: number;
}) {
  const unit = 100 / size;
  const marks = useMemo(
    () =>
      placements
        .filter((p) => foundWords.has(p.word))
        .map((p) => {
          const span = p.word.length - 1;
          const centerCol = p.col + (p.dc * span) / 2;
          const centerRow = p.row + (p.dr * span) / 2;
          const lengthCells = Math.hypot(p.dc * span, p.dr * span);
          return {
            key: p.word,
            left: (centerCol + 0.5) * unit,
            top: (centerRow + 0.5) * unit,
            width: lengthCells * unit + unit * 0.84,
            height: unit * 0.84,
            angle: (Math.atan2(p.dr, p.dc) * 180) / Math.PI,
          };
        }),
    [placements, foundWords, unit],
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {marks.map((m) => (
        <span
          key={m.key}
          className="absolute rounded-full"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: `${m.width}%`,
            height: `${m.height}%`,
            transform: `translate(-50%, -50%) rotate(${m.angle}deg)`,
            border: `1px solid ${MARK}`,
            background: "rgba(185,168,130,0.16)",
            animation: "fade-in 520ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        />
      ))}
    </div>
  );
}

function PageLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[9px] font-semibold uppercase tracking-[0.24em] sm:text-[10px]"
      style={{ color: MUTED }}
    >
      {children}
    </p>
  );
}

function ToolButton({
  icon: Icon,
  label,
}: {
  icon: typeof RotateCcw;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] sm:text-[10px]"
      style={{ borderColor: "rgba(31,29,27,0.14)", color: INK }}
    >
      <Icon className="h-3 w-3" strokeWidth={1.8} />
      {label}
    </span>
  );
}

function WordSearchPage() {
  const size = 12;
  const { t } = useI18n();
  const { grid, placements } = useMemo(() => buildGrid(WORDS, size), []);

  const [foundCount, setFoundCount] = useState(0);
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
      if (!holding && now - last >= 1500) {
        last = now;
        setFoundCount((c) => {
          if (c >= WORDS.length) {
            holding = true;
            window.setTimeout(() => setFading(true), 2000);
            window.setTimeout(() => {
              setFading(false);
              setFoundCount(0);
              last = performance.now();
              holding = false;
            }, 2800);
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
    const cells = new Set<string>();
    for (const p of placements) {
      if (!set.has(p.word)) continue;
      for (let i = 0; i < p.word.length; i++) {
        cells.add(`${p.row + p.dr * i},${p.col + p.dc * i}`);
      }
    }
    return { foundWords: set, highlighted: cells };
  }, [foundCount, placements]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-6 sm:px-8 sm:py-8 lg:px-6 lg:py-5 xl:px-8 xl:py-6">
      <PageLabel>{t("hero.grid.title")}</PageLabel>

      <h2
        className="mt-1.5 font-['Playfair_Display',serif] text-[22px] font-bold leading-[1.05] tracking-[-0.015em] sm:text-[26px] lg:text-[24px] xl:text-[28px]"
        style={{ color: INK }}
      >
        {t("hero.notebook.title")}
      </h2>

      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p
          className="text-[9px] font-medium uppercase tracking-[0.2em] sm:text-[10px]"
          style={{ color: MUTED }}
        >
          {t("hero.dev.ref")}
        </p>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-medium tabular-nums sm:text-[10px]"
          style={{ background: PAPER_WARM, color: "#6B665C" }}
        >
          {foundCount}/{WORDS.length} {t("hero.grid.found")}
        </span>
      </div>

      {/* Square grid: fills whatever vertical room the page has left. */}
      <div className="mt-3 flex min-h-0 flex-1 items-center justify-center lg:mt-4">
        <div
          className="relative aspect-square h-auto w-full max-w-full rounded-[4px] border border-[#1F1D1B]/10 lg:h-full lg:w-auto"
          style={{
            background: "rgba(255,255,255,0.35)",
            opacity: fading ? 0.4 : 1,
            transition: "opacity 700ms ease-in-out",
          }}
        >
          <div
            className="relative grid h-full w-full overflow-hidden rounded-[4px]"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0,1fr))`,
              gridTemplateRows: `repeat(${size}, minmax(0,1fr))`,
              containerType: "inline-size",
            }}
          >
            {grid.map((row, r) =>
              row.map((letter, c) => (
                <GridCell
                  key={`${r}-${c}`}
                  letter={letter}
                  hit={highlighted.has(`${r},${c}`)}
                />
              )),
            )}
            <FoundMarks placements={placements} foundWords={foundWords} size={size} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex-none lg:mt-3">
        <PageLabel>{t("hero.notebook.wordsToSeek")}</PageLabel>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WORDS.map((w) => {
            const found = foundWords.has(w);
            return (
              <span
                key={w}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] transition-colors duration-500 sm:text-[10px]"
                style={{
                  background: PAPER_WARM,
                  color: found ? INK : "rgba(31,29,27,0.5)",
                }}
              >
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors duration-500"
                  style={{
                    borderColor: found ? INK : "rgba(31,29,27,0.28)",
                    background: found ? INK : "transparent",
                  }}
                >
                  <Check
                    className="h-2 w-2"
                    strokeWidth={3}
                    style={{ color: found ? PAPER : "transparent" }}
                  />
                </span>
                {w}
              </span>
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <ToolButton icon={Shuffle} label="Shuffle" />
          <ToolButton icon={Lightbulb} label="Hint" />
          <ToolButton icon={RotateCcw} label="Reset" />
        </div>
      </div>
    </div>
  );
}

function DevotionalPage() {
  const { t } = useI18n();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-6 sm:px-8 sm:py-8 lg:px-6 lg:py-5 xl:px-8 xl:py-6">
      <div className="flex items-center justify-between gap-3">
        <PageLabel>{t("hero.dev.eyebrow")}</PageLabel>
        <span
          className="inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.18em] sm:text-[10px]"
          style={{ color: MUTED }}
        >
          <Clock className="h-3 w-3" strokeWidth={1.6} />
          {t("hero.dev.time")}
        </span>
      </div>

      <p
        className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px] lg:mt-4"
        style={{ color: "#6B665C" }}
      >
        {t("hero.dev.ref")}
      </p>

      <h3
        className="mt-2 font-['Playfair_Display',serif] text-[25px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-[30px] lg:text-[27px] xl:text-[32px]"
        style={{ color: INK }}
      >
        {t("hero.dev.title")}
      </h3>

      <span aria-hidden className="mt-3.5 block h-px w-10 flex-none" style={{ background: MARK }} />

      <p
        className="mt-3.5 min-h-0 text-[13px] leading-[1.6] sm:text-[13.5px] lg:line-clamp-4 xl:line-clamp-5"
        style={{ color: "rgba(31,29,27,0.78)" }}
      >
        {t("hero.dev.body")}
      </p>

      <div className="mt-4 flex flex-none items-center justify-between border-b border-[#1F1D1B]/10 text-[9px] font-semibold uppercase tracking-[0.16em] sm:text-[10px]">
        <span className="-mb-px border-b pb-2.5" style={{ borderColor: INK, color: INK }}>
          Scripture
        </span>
        <span className="pb-2.5" style={{ color: MUTED }}>
          Devotional
        </span>
        <span className="pb-2.5" style={{ color: MUTED }}>
          Reflection
        </span>
      </div>

      <figure
        className="relative mt-4 flex-none rounded-[6px] px-5 py-4 sm:px-6 sm:py-5 lg:mt-auto"
        style={{ background: "#EDE9DF" }}
      >
        <span
          aria-hidden
          className="absolute left-4 top-3 font-['Playfair_Display',serif] text-[34px] leading-none sm:text-[40px]"
          style={{ color: "rgba(31,29,27,0.28)" }}
        >
          &ldquo;
        </span>
        <blockquote
          className="pl-7 text-[12.5px] leading-[1.6] sm:pl-8 sm:text-[13px]"
          style={{ color: "rgba(31,29,27,0.8)" }}
        >
          {t("hero.dev.verse")}
        </blockquote>
        <figcaption
          className="mt-3 pl-7 text-[9px] font-semibold uppercase tracking-[0.22em] sm:pl-8 sm:text-[10px]"
          style={{ color: MUTED }}
        >
          {t("hero.dev.ref")}
        </figcaption>
      </figure>
    </div>
  );
}

export function HeroJournal() {
  return (
    <div className="relative mx-auto w-full max-w-[min(94vw,540px)] sm:max-w-[640px] lg:max-w-none">
      {/* The book lifts off the desk, nothing more. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-1 h-10 rounded-[50%] bg-[#1F1D1B]/12 blur-2xl"
      />

      <div
        className="relative overflow-hidden rounded-[10px] lg:mx-auto lg:aspect-[1.3/1] lg:h-auto lg:w-[min(100%,calc((100dvh-11rem)*1.3))]"
        style={{
          background: PAPER,
          boxShadow:
            "0 40px 80px -40px rgba(31,29,27,0.30), 0 12px 28px -18px rgba(31,29,27,0.20), 0 0 0 1px rgba(31,29,27,0.06)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.14]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-20 flex flex-col lg:h-full lg:flex-row">
          <div className="min-w-0 flex-1 border-b border-[#1F1D1B]/[0.07] lg:border-b-0">
            <WordSearchPage />
          </div>

          {/* Gutter — the paper curving into the binding, drawn as light only. */}
          <div
            aria-hidden
            className="pointer-events-none relative h-6 w-full flex-shrink-0 lg:h-auto lg:w-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(31,29,27,0) 0%, rgba(31,29,27,0.07) 45%, rgba(31,29,27,0.09) 50%, rgba(31,29,27,0.07) 55%, rgba(31,29,27,0) 100%)",
            }}
          >
            <span
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(90deg, rgba(31,29,27,0) 0%, rgba(31,29,27,0.08) 42%, rgba(31,29,27,0.11) 50%, rgba(31,29,27,0.08) 58%, rgba(31,29,27,0) 100%)",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <DevotionalPage />
          </div>
        </div>
      </div>
    </div>
  );
}