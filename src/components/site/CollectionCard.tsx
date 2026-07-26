import type { Collection } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export function CollectionCard({ c }: { c: Collection }) {
  return (
    <Link
      to="/collections"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40"
    >
      <div
        className="aspect-[4/3] w-full"
        style={{
          background: `linear-gradient(160deg, color-mix(in oklab, ${c.hue} 40%, var(--parchment)) 0%, color-mix(in oklab, ${c.hue} 15%, var(--background)) 100%)`,
        }}
      >
        <div className="flex h-full items-end p-5">
          <span className="text-[11px] uppercase tracking-widest" style={{ color: c.hue }}>
            {c.count} journeys
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-serif text-lg leading-snug">{c.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
        {c.progress != null && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full"
              style={{ width: `${Math.round(c.progress * 100)}%`, background: "var(--sage)" }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}