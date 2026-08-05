import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Calendar,
  Clock,
  Copy,
  HelpCircle,
  LayoutGrid,
  Lightbulb,
  Search,
  Shuffle,
  User,
} from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useI18n } from "@/lib/i18n";
import { listGames, type GameIconKey } from "@/lib/games";

// The games library — rendered entirely from the shared game registry, so a
// mode ships here by flipping its availability, never by editing this page.
// Coming-soon modes are quiet, unclickable cards: visible as a promise, never
// pretending to be buttons.

const ICONS: Record<GameIconKey, typeof Search> = {
  search: Search,
  guess: Lightbulb,
  identity: User,
  quiz: HelpCircle,
  verse: BookOpen,
  shuffle: Shuffle,
  builder: LayoutGrid,
  timeline: Clock,
  memory: Copy,
  daily: Calendar,
};

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Play — Lumena" },
      {
        name: "description",
        content: "Quiet Scripture games: word search, word guess, who am I, and more to come.",
      },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { t } = useI18n();
  const games = listGames().filter((game) => game.availability !== "hidden");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <header>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
            {t("games.eyebrow")}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{t("games.hub.title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("games.hub.sub")}</p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const Icon = ICONS[game.iconKey];
            const active = game.availability === "active" && game.route;
            const body = (
              <>
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                  style={{
                    background: active
                      ? "color-mix(in oklab, var(--gold) 14%, transparent)"
                      : "var(--surface-2)",
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: active ? "var(--gold)" : "var(--walnut)" }}
                    aria-hidden="true"
                  />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-serif text-lg">
                    {t(game.nameKey)}
                    {!active && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ background: "var(--surface-2)", color: "var(--walnut)" }}
                      >
                        {t("nav.soon")}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                    {t(game.descriptionKey)}
                  </span>
                </span>
              </>
            );

            return active ? (
              <Link
                key={game.id}
                to={game.route!}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition hover:border-[color:var(--gold)] hover:shadow-[0_10px_30px_-18px_rgba(43,41,38,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              >
                {body}
              </Link>
            ) : (
              <div
                key={game.id}
                className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-card/50 p-5"
              >
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
