import type { Collection } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export function CollectionCard({ c }: { c: Collection }) {
  return (
    <Link
      to="/collections"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {c.image ? (
          <img
            src={c.image}
            alt={c.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
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
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, color-mix(in oklab, var(--ink) 55%, transparent) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-end justify-between p-5">
          <span className="font-serif text-lg leading-tight text-white drop-shadow">
            {c.title}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/85">
            {c.count}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-card p-5">
        <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
        {c.progress != null && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full"
              style={{ width: `${Math.round(c.progress * 100)}%`, background: "var(--gold)" }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}