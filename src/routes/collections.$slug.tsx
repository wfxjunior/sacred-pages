import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AppShell } from "@/components/site/AppShell";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { useCatalogCollection, type CatalogCollection } from "@/lib/content/catalog";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, Heart, Share2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const readable = params.slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const title = `${readable} — Lumen Verse`;
    const description =
      "A guided Bible collection: Scripture, a word search, reflection and prayer, ten quiet minutes a day.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: CollectionNotFound,
  component: CollectionDetail,
});

/**
 * A signed-in reader stays inside the journey shell — the public marketing
 * chrome here used to read as "you were logged out".
 */
function CollectionShell({ children }: { children: React.ReactNode }) {
  const { loading, userId } = useCurrentUser();
  if (loading) return <div className="min-h-screen bg-background">{children}</div>;
  return userId ? <AppShell>{children}</AppShell> : <SiteLayout>{children}</SiteLayout>;
}

function CollectionSkeleton() {
  return (
    <CollectionShell>
      <div className="mx-auto max-w-7xl px-6 py-20" aria-busy="true">
        <div className="h-3 w-24 animate-pulse rounded bg-[color:color-mix(in_oklab,var(--parchment)_55%,var(--card))]" />
        <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-[color:color-mix(in_oklab,var(--parchment)_55%,var(--card))]" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-[color:color-mix(in_oklab,var(--parchment)_45%,var(--card))]" />
        <div className="mt-12 grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-[color:color-mix(in_oklab,var(--parchment)_40%,var(--card))]"
            />
          ))}
        </div>
      </div>
    </CollectionShell>
  );
}

function CollectionNotFound() {
  return (
    <CollectionShell>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
          Library
        </p>
        <h1 className="mt-3 font-serif text-4xl">This collection could not be found</h1>
        <p className="mt-4 text-muted-foreground">
          It may have been renamed or is no longer available. Return to the library to keep exploring.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link to="/collections">Back to collections</Link>
          </Button>
        </div>
      </div>
    </CollectionShell>
  );
}

function CollectionDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading, isError } = useCatalogCollection(slug);

  if (isLoading) return <CollectionSkeleton />;
  if (isError || !data) return <CollectionNotFound />;

  const collection = data.collection;
  // Sessions are the published journeys of this collection, in curated order.
  const sessions = data.journeys.map((j) => ({
    slug: j.slug,
    title: j.title,
    reference: j.subtitle ?? j.theme ?? "",
    minutes: j.estimatedMinutes,
  }));
  const firstSlug = sessions[0]?.slug;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const progressPct = collection.progress ? Math.round(collection.progress * 100) : 0;
  const completed = collection.progress ? Math.round(collection.progress * collection.count) : 0;

  return (
    <CollectionShell>
      <article className="pb-24">
        {/* Hero */}
        <header
          className="relative overflow-hidden border-b border-border"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--parchment) 70%, #FCFBF8) 0%, #FCFBF8 100%)",
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
            <div className="flex flex-col justify-center">
              <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Link to="/collections" className="hover:text-foreground">Library</Link>
                <span aria-hidden>/</span>
                <span style={{ color: "var(--walnut)" }}>{collection.title}</span>
              </nav>
              <h1 className="mt-6 font-serif text-4xl leading-[1.05] md:text-6xl">
                {collection.title}
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                {collection.description}
              </p>

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                <Stat icon={<BookOpen className="h-4 w-4" />} label="Sessions" value={String(collection.count)} />
                <Stat icon={<Clock className="h-4 w-4" />} label="Total time" value={`${totalMinutes} min`} />
                <Stat icon={<Sparkles className="h-4 w-4" />} label="Rhythm" value="Daily · 10 min" />
              </dl>

              {collection.progress != null && (
                <div className="mt-8 max-w-md">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <span>In progress</span>
                    <span style={{ color: "var(--walnut)" }}>
                      {completed}/{collection.count} · {progressPct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary/70">
                    <div
                      className="h-full transition-transform duration-700 ease-out"
                      style={{
                        width: `${progressPct}%`,
                        background:
                          "linear-gradient(90deg, color-mix(in oklab, var(--sage) 70%, var(--gold)) 0%, var(--gold) 100%)",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 gap-2 px-6">
                  <Link to="/today" search={firstSlug ? { journey: firstSlug } : {}}>
                    {collection.progress ? "Continue journey" : "Begin journey"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 gap-2 px-5">
                  <Link to="/favorites">
                    <Heart className="h-4 w-4" />
                    Save
                  </Link>
                </Button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2 rounded-md px-4 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Illustration */}
            <div className="relative">
              <div
                className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-[0_30px_80px_-40px_rgba(110,88,71,0.45)]"
                style={{
                  background: `linear-gradient(160deg, color-mix(in oklab, ${collection.hue} 30%, var(--parchment)) 0%, color-mix(in oklab, ${collection.hue} 10%, var(--background)) 100%)`,
                }}
              >
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-serif text-6xl text-[color:var(--walnut)]/50">
                    {collection.title[0]}
                  </div>
                )}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 55%, color-mix(in oklab, var(--walnut) 55%, transparent) 100%)",
                  }}
                />
                <div className="absolute inset-x-6 bottom-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/85">
                  <span>Collection</span>
                  <span className="text-[color:var(--gold)]">{collection.count} sessions</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Theme + What to expect */}
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              Theme
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
              {themeHeadline(collection)}
            </h2>
            <p className="mt-5 text-base text-muted-foreground">
              {themeParagraph(collection)}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {expectations.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="font-serif text-lg">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Sessions list */}
        <section className="mx-auto max-w-7xl px-6 pb-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
                Sessions
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">What you will walk through</h2>
            </div>
            <p className="hidden text-sm text-muted-foreground md:block">
              {collection.count} sessions · about {totalMinutes} minutes total
            </p>
          </div>

          <ol className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {sessions.map((s, i) => {
              const isDone = collection.progress != null && i < completed;
              return (
                <li key={s.title}>
                  <Link
                    to="/today"
                    search={{ journey: s.slug }}
                    className="group flex w-full items-center gap-5 px-5 py-4 text-left transition-colors hover:bg-[color:color-mix(in_oklab,var(--parchment)_35%,var(--card))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50"
                  >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm"
                    style={{
                      background: isDone
                        ? "color-mix(in oklab, var(--gold) 22%, var(--card))"
                        : "color-mix(in oklab, var(--parchment) 60%, var(--card))",
                      color: isDone ? "var(--gold)" : "var(--walnut)",
                    }}
                    aria-hidden
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base md:text-lg">{s.title}</p>
                    <p className="mt-0.5 truncate text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {s.reference}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {s.minutes} min
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: isDone ? "var(--gold)" : "var(--muted-foreground)" }}
                  >
                    {isDone ? "Done" : "Open"}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Final CTA */}
        <section className="mx-auto mt-16 max-w-5xl px-6">
          <div
            className="relative overflow-hidden rounded-2xl border border-border p-10 text-center md:p-14"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--parchment) 55%, var(--card)) 0%, var(--card) 100%)",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
              A slow walk through Scripture
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight md:text-5xl">
              {collection.progress ? "Pick up where you left off." : "Begin the journey today."}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
              Ten quiet minutes a day. Scripture, reflection, and prayer — gently guided.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 gap-2 px-6">
                <Link to="/today" search={firstSlug ? { journey: firstSlug } : {}}>
                  {collection.progress ? "Continue journey" : "Begin journey"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-5">
                <Link to="/collections">Browse other collections</Link>
              </Button>
            </div>
          </div>
        </section>
      </article>
    </CollectionShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[color:var(--walnut)]" aria-hidden>
        {icon}
      </span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const expectations = [
  {
    title: "Scripture read slowly",
    description: "One passage a day, with room to breathe and re-read.",
  },
  {
    title: "A guided word search",
    description: "Find the words that carry the meaning of each passage.",
  },
  {
    title: "A short reflection",
    description: "One honest question to bring the passage into your day.",
  },
  {
    title: "A written prayer",
    description: "A gentle prayer you can pray, adapt, or set aside.",
  },
];

function themeHeadline(c: CatalogCollection) {
  const map: Record<string, string> = {
    "life-of-jesus": "Walk beside Jesus, page by page.",
    psalms: "Ancient songs for a modern heart.",
    family: "Scripture for the home you are building.",
    proverbs: "Everyday wisdom, slowly practiced.",
    faith: "Trust that grows one step at a time.",
    women: "Voices of courage across the story.",
    men: "Lives that still shape ours today.",
    prayer: "Learn to speak — and to listen.",
    purpose: "The quiet work of a meaningful life.",
  };
  return map[c.slug] ?? c.description;
}

function themeParagraph(c: CatalogCollection) {
  const map: Record<string, string> = {
    "life-of-jesus":
      "Follow the ministry of Jesus from the wilderness to the resurrection. Each session pauses on a scene, a word, a question — so the story becomes yours.",
    psalms:
      "The Psalms hold every human feeling — joy, grief, longing, praise. Pray them slowly and you'll find your own voice inside their lines.",
    family:
      "Passages for marriage, parenting, and the quiet ordinary of home. Small, honest steps toward the family Scripture imagines.",
    proverbs:
      "Short, sharp lines about money, work, words, and friendship. Wisdom is a practice, not a personality — this collection is a training ground.",
    faith:
      "Trust doesn't arrive fully formed. It grows through small yeses. These journeys sit with the people who learned to believe when it was hard.",
    women:
      "Hagar, Ruth, Deborah, Mary. Their stories are not decoration — they are the story. Walk with them and hear what they still say.",
    men:
      "Abraham, David, Peter, Paul. Ordinary men with ordinary flaws, shaped by an extraordinary God. Their lives become mirrors.",
    prayer:
      "Prayer is not a performance. It is presence. This collection gently teaches the shapes of prayer Scripture has always known.",
    purpose:
      "You were made on purpose, for a purpose. These sessions clear space to hear what you're being invited into next.",
  };
  return map[c.slug] ?? "A gentle, guided walk through Scripture — one small step at a time.";
}

