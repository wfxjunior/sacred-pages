import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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

const ROMAN: [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

function toRoman(n: number) {
  let out = "";
  let x = Math.max(1, Math.min(39, n));
  for (const [value, symbol] of ROMAN) {
    while (x >= value) {
      out += symbol;
      x -= value;
    }
  }
  return out;
}

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
      <div className="mx-auto w-full max-w-5xl">
        <header>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
            {t("games.eyebrow")}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{t("games.hub.title")}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("games.hub.sub")}</p>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => {
            const Icon = ICONS[game.iconKey];
            const active = game.availability === "active" && game.route;
            const body = (
              <>
                {/* Archival linen spine, matching the collection volumes */}
                <span
                  aria-hidden
                  className="relative w-9 shrink-0 border-r border-black/5 bg-[#E8E6E2]"
                >
                  <span
                    className="absolute inset-0 block opacity-10"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent 0 1px, rgba(0,0,0,0.45) 1px 2px)",
                    }}
                  />
                  <span
                    className={`absolute inset-x-1.5 top-8 flex h-14 items-center justify-center rounded-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] ${
                      active
                        ? "bg-gradient-to-b from-[#D4AF37] via-[#C5A059] to-[#B38B45]"
                        : "bg-gradient-to-b from-[#CFCAC0] via-[#C2BDB2] to-[#B2ADA2]"
                    }`}
                  >
                    <span
                      className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-white/90"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      No · {toRoman(index + 1)}
                    </span>
                  </span>
                </span>

                <span className="flex min-w-0 flex-1 flex-col p-6">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-sm border border-black/[0.04]"
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

                  <span className="mt-5 flex items-center gap-2">
                    <span className="font-serif text-xl font-bold leading-tight tracking-tight transition-colors duration-500 group-hover:text-[color:var(--brand)]">
                      {t(game.nameKey)}
                    </span>
                    {!active && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ background: "var(--surface-2)", color: "var(--walnut)" }}
                      >
                        {t("nav.soon")}
                      </span>
                    )}
                  </span>

                  <span className="mt-2 block text-[14px] leading-[1.6] text-muted-foreground">
                    {t(game.descriptionKey)}
                  </span>

                  {active && (
                    <span className="mt-auto block border-t border-dashed border-[#E5DFCE] pt-5 dark:border-[#3B3E39]">
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--gold)] opacity-0 -translate-x-2 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                        {t("games.hub.play")}
                        <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                    </span>
                  )}
                </span>
              </>
            );

            return active ? (
              <Link
                key={game.id}
                to={game.route!}
                className="group relative flex min-h-[15rem] overflow-hidden rounded-sm border border-black/[0.03] bg-card shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {body}
                <span
                  aria-hidden
                  className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/[0.06] to-transparent"
                />
              </Link>
            ) : (
              <div
                key={game.id}
                className="group relative flex min-h-[15rem] overflow-hidden rounded-sm border border-dashed border-black/[0.07] bg-card/60"
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
