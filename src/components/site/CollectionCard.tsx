import type { Collection } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function CollectionCard({ c }: { c: Collection }) {
  const { t } = useI18n();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showImage = c.image && !errored;
  const initials = c.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const progress = c.progress ?? 0;
  const progressPct = Math.round(progress * 100);

  const toRoman = (n: number) => {
    const map: [number, string][] = [
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let r = "", x = Math.max(1, Math.min(39, n));
    for (const [v, s] of map) { while (x >= v) { r += s; x -= v; } }
    return r;
  };

  const vol = (c.slug.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) % 12) + 1;

  return (
    <Link
      to="/collections/$slug"
      params={{ slug: c.slug }}
      className="group relative flex overflow-hidden rounded-sm border border-black/[0.03] bg-card shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {/* Archival linen spine — the volume marker that makes it feel like a real book */}
      <div
        aria-hidden
        className="relative w-10 shrink-0 border-r border-black/5 bg-[#E8E6E2]"
      >
        {/* Subtle thread texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 1px, rgba(0,0,0,0.45) 1px 2px)",
          }}
        />
        {/* Gold-foil volume band */}
        <div className="absolute inset-x-1.5 top-9 h-16 rounded-[2px] bg-gradient-to-b from-[#D4AF37] via-[#C5A059] to-[#B38B45] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <span
            className="font-sans text-[10px] font-bold tracking-[0.2em] text-white/90 uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            VOL · {toRoman(vol)}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Archival illustration header */}
        <div className="relative h-60 flex overflow-hidden bg-[#F5F3EF]">
          {/* Paper texture overlay on the image area */}
          <div
            aria-hidden
            className="absolute inset-0 z-10 opacity-40 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.14 0 0 0 0 0.12 0 0 0 0.35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/></svg>")`,
              backgroundSize: "220px 220px",
            }}
          />

          {showImage ? (
            <>
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                width={1024}
                height={1024}
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)}
                className={`h-full w-full object-cover object-center transition-all duration-[900ms] ease-out will-change-transform group-hover:scale-105 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
              {!loaded && (
                <div
                  aria-hidden
                  className="absolute inset-0 animate-pulse"
                  style={{
                    background:
                      "linear-gradient(110deg, color-mix(in oklab, var(--parchment) 60%, var(--background)) 0%, color-mix(in oklab, var(--parchment) 30%, var(--background)) 50%, color-mix(in oklab, var(--parchment) 60%, var(--background)) 100%)",
                  }}
                />
              )}
            </>
          ) : (
            <div
              className="relative flex h-full w-full flex-1 items-center justify-center"
              style={{
                background: `linear-gradient(160deg, color-mix(in oklab, ${c.hue} 40%, var(--parchment)) 0%, color-mix(in oklab, ${c.hue} 15%, var(--background)) 100%)`,
              }}
            >
              <span
                aria-hidden
                className="font-serif text-5xl tracking-wide text-[color:var(--walnut)]/60"
              >
                {initials}
              </span>
            </div>
          )}

          {/* Journey count badge */}
          <div className="absolute right-4 top-4 z-20">
            <span className="inline-flex items-center rounded-sm border border-black/5 bg-white/90 px-2.5 py-1 font-serif text-lg leading-none text-foreground shadow-sm backdrop-blur-sm">
              {c.count}
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-1 flex-col p-7 sm:p-8">
          <h3 className="font-serif text-2xl font-bold leading-[1.15] tracking-tight text-foreground transition-colors duration-500 group-hover:text-[color:var(--brand)]">
            {c.title}
          </h3>

          <p className="mt-3 line-clamp-2 text-[15px] leading-[1.6] text-muted-foreground">
            {c.description}
          </p>

          {/* Hover reveal: a quiet invitation to click */}
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)] opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
            {t("collection.explore")}
            <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
          </div>

          {/* Progress section */}
          {c.progress != null && (
            <div className="mt-auto pt-6 border-t border-dashed border-[#E5DFCE] dark:border-[#3B3E39]">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("collection.progressLabel")}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {progressPct}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-[#EDE7D6] dark:bg-[#2E3130]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C89F4F] to-[#A78033] transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right fore-edge shadow */}
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent"
      />
    </Link>
  );
}
