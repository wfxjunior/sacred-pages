import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { FAVORITES, FAVORITE_KINDS, type FavoriteKind } from "@/lib/mock/favorites";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Quote, Feather, Library, Sparkles, Heart } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — Lumena" },
      { name: "description", content: "Journeys, verses, devotionals and reflections you've saved." },
      { property: "og:title", content: "Favorites — Lumena" },
      { property: "og:description", content: "Your saved Scripture moments." },
    ],
  }),
  component: Favorites,
});

const KIND_META: Record<FavoriteKind, { icon: typeof BookOpen; color: string; labelKey: string }> = {
  journey: { icon: BookOpen, color: "#B88A3B", labelKey: "favorites.label.journey" },
  verse: { icon: Quote, color: "#5E7FA3", labelKey: "favorites.label.verse" },
  devotional: { icon: Sparkles, color: "#B88A3B", labelKey: "favorites.label.devotional" },
  collection: { icon: Library, color: "#78866B", labelKey: "favorites.label.collection" },
  reflection: { icon: Feather, color: "#6E5847", labelKey: "favorites.label.reflection" },
  prayer: { icon: Heart, color: "#B76E79", labelKey: "favorites.label.prayer" },
};

function Favorites() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<FavoriteKind | "all">("all");

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return FAVORITES.filter((f) => {
      if (kind !== "all" && f.kind !== kind) return false;
      if (!s) return true;
      return (
        f.title.toLowerCase().includes(s) ||
        f.excerpt.toLowerCase().includes(s) ||
        (f.reference?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [q, kind]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{t("favorites.eyebrow")}</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">{t("favorites.title")}</h1>
          <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">{t("favorites.sub")}</p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("favorites.searchPh")}
              className="pl-9"
              aria-label={t("favorites.searchPh")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FAVORITE_KINDS.map((f) => {
              const active = kind === f.key;
              const label = t(`favorites.kind.${f.key}`);
              return (
                <button
                  key={f.key}
                  onClick={() => setKind(f.key)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
            <p className="font-serif text-lg">{t("favorites.empty")}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">{t("favorites.emptyHint")}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((f) => {
              const meta = KIND_META[f.kind];
              const Icon = meta.icon;
              return (
                <article key={f.id} className="group rounded-2xl border border-border/60 bg-card p-5 transition hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `color-mix(in oklab, ${meta.color} 14%, transparent)`, color: meta.color }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t(meta.labelKey)}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{f.savedOn}</span>
                  </div>
                  <p className="mt-4 font-serif text-lg leading-snug">{f.title}</p>
                  {f.reference && <p className="mt-0.5 text-[12px] text-muted-foreground">{f.reference}</p>}
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{f.excerpt}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}