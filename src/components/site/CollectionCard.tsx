import type { Collection } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export function CollectionCard({ c }: { c: Collection }) {
  return (
    <Link
      to="/collections"
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(43,43,43,0.04)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-[color:var(--gold)]/40 hover:shadow-[0_18px_40px_-24px_rgba(110,88,71,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--parchment) 70%, #FCFBF8) 0%, #FCFBF8 100%)",
        }}
      >
        {c.image ? (
          <img
            src={c.image}
            alt={c.title}
            loading="lazy"
            width={1024}
            height={1024}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[900ms] ease-out will-change-transform group-hover:scale-[1.045]"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(160deg, color-mix(in oklab, ${c.hue} 40%, var(--parchment)) 0%, color-mix(in oklab, ${c.hue} 15%, var(--background)) 100%)`,
            }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
          style={{
            background:
              "linear-gradient(180deg, transparent 45%, color-mix(in oklab, var(--walnut) 78%, transparent) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-end justify-between p-5">
          <span className="relative font-serif text-lg leading-tight text-white drop-shadow-sm">
            {c.title}
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--gold)] transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/85 transition-colors duration-500 group-hover:text-[color:var(--gold)]">
            {c.count}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-card p-5 transition-colors duration-500 group-hover:bg-[color:color-mix(in_oklab,var(--parchment)_35%,var(--card))]">
        <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
        {c.progress != null && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary/70">
            <div
              className="h-full origin-left transition-transform duration-700 ease-out group-hover:scale-x-[1.02]"
              style={{
                width: `${Math.round(c.progress * 100)}%`,
                background:
                  "linear-gradient(90deg, color-mix(in oklab, var(--sage) 70%, var(--gold)) 0%, var(--gold) 100%)",
              }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}