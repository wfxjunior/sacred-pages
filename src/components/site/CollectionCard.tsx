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

  return (
    <Link
      to="/collections/$slug"
      params={{ slug: c.slug }}
      className="group relative flex overflow-hidden rounded-r-2xl border border-border bg-card shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all duration-500 ease-out hover:shadow-[0_20px_40px_-12px_rgba(110,88,71,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {/* Sacred Editorial Spine */}
      <div className="w-12 shrink-0 border-r border-border bg-[#F3F0E9] dark:bg-[#272927] flex flex-col items-center py-6 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-[#D4CFC3] shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] dark:bg-[#3B3E39]"
            aria-hidden
          />
        ))}
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

          {/* Vitral Sagrado overlay */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-tr from-[color:var(--brand)]/20 via-transparent to-[color:var(--gold)]/10 mix-blend-multiply opacity-70 transition-opacity duration-500 group-hover:opacity-90"
          />

          {/* Count badge */}
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center bg-white/85 px-3 py-1 font-serif text-xl text-foreground backdrop-blur-sm dark:bg-[#272927]/85 dark:text-[#F5F2EB]">
              {c.count}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif text-2xl leading-tight text-foreground transition-colors duration-500 group-hover:text-[color:var(--brand)]">
            {c.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {c.description}
          </p>

          {/* Luminous Progress Section */}
          {c.progress != null && (
            <div className="mt-auto pt-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("collection.progressLabel")}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {progressPct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[color:var(--gold)] via-[color:var(--burgundy)] to-[color:var(--brand)] transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                >
                  <span className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right edge page effect */}
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-px bg-border"
      />
    </Link>
  );
}
