import type { Collection } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

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
  // Roman numeral for a subtle "volume" mark on the spine
  const toRoman = (n: number) => {
    const map: [number, string][] = [
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
    ];
    let r = "", x = Math.max(1, Math.min(39, n));
    for (const [v, s] of map) { while (x >= v) { r += s; x -= v; } }
    return r;
  };
  // Stable-ish volume number from slug hash
  const vol = (c.slug.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0) % 12) + 1;

  return (
    <Link
      to="/collections/$slug"
      params={{ slug: c.slug }}
      className="group relative flex overflow-hidden rounded-r-[10px] border border-[#E5DFCE] bg-card shadow-[0_1px_2px_rgba(43,41,38,0.05),0_10px_30px_-18px_rgba(43,41,38,0.18)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(43,41,38,0.06),0_28px_60px_-24px_rgba(43,41,38,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {/* Bound linen spine — a small volume in your library */}
      <div
        aria-hidden
        className="linen-spine relative w-8 shrink-0 border-r border-[#D6CFBE] dark:border-[#3B3E39]"
      >
        {/* Sewn stitch line */}
        <svg
          className="absolute inset-y-4 left-1/2 h-[calc(100%-2rem)] w-[3px] -translate-x-1/2"
          viewBox="0 0 2 100" preserveAspectRatio="none"
        >
          <line x1="1" y1="0" x2="1" y2="100"
            stroke="#8A6A1F" strokeOpacity="0.6" strokeWidth="0.6"
            strokeDasharray="2.2 2" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Gold-foil volume band */}
        <div className="absolute inset-x-1 top-8 h-14 rounded-[2px] bg-gradient-to-b from-[#D9B569] via-[#C89F4F] to-[#A78033] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15)] flex items-center justify-center">
          <span
            className="font-serif text-[10px] font-semibold tracking-[0.18em] text-[#3A2A08]"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            VOL · {toRoman(vol)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Editorial Image Header */}
        <div className="relative aspect-video w-full overflow-hidden">
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
                className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[900ms] ease-out will-change-transform group-hover:scale-[1.045] ${
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
              className="relative flex h-full w-full items-center justify-center"
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

          {/* Vitral Sagrado overlay — subtle light tint, not a dark wash */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1F1D1B]/[0.12]"
          />

          {/* Count badge */}
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center rounded-[3px] border border-white/60 bg-white/85 px-2.5 py-0.5 font-serif text-lg leading-none text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[#272927]/85 dark:text-[#F5F2EB]">
              {c.count}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h3 className="font-serif text-[22px] leading-[1.15] tracking-[-0.01em] text-[#1F1D1B] transition-colors duration-500 group-hover:text-[color:var(--brand)]">
            {c.title}
          </h3>

          <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-[1.55] text-muted-foreground">
            {c.description}
          </p>

          {/* Luminous Progress Section */}
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

      {/* Right page edge (fore-edge shadow) */}
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent"
      />
    </Link>
  );
}
