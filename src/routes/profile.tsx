import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { MilestoneCard } from "@/components/site/MilestoneCard";
import { CompanionCard } from "@/components/site/CompanionCard";
import { ShareModal } from "@/components/site/ShareModal";
import { AvatarUploader } from "@/components/site/AvatarUploader";
import { AccessCircle } from "@/components/site/AccessCircle";
import { MILESTONE_LIST } from "@/lib/mock/milestones";
import { COMPANIONS } from "@/lib/mock/companions";
import { Sparkles, Share2, Settings as SettingsIcon, Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { formatDuration, groupByJourney, useBestTimes } from "@/lib/puzzle/best-times";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Jornadas da Palavra" },
      { name: "description", content: "Your journey, milestones and companions in one calm place." },
      { property: "og:title", content: "Profile — Jornadas da Palavra" },
      { property: "og:description", content: "A quiet profile — your progress at a glance." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const achieved = MILESTONE_LIST.filter((m) => m.achieved);
  const upcoming = MILESTONE_LIST.filter((m) => !m.achieved).slice(0, 3);
  const { entries: bestTimes } = useBestTimes();
  const fastest = bestTimes[0] ?? null;
  const puzzlesTimed = bestTimes.reduce((sum, entry) => sum + entry.completions, 0);
  const perJourney = groupByJourney(bestTimes, t("profile.times.unnamed"));
  const active = COMPANIONS.filter((c) => c.status === "active").slice(0, 2);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-14">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <AvatarUploader
              userId={user.userId}
              initial={user.initial}
              avatarUrl={user.avatarUrl}
              avatarPath={user.avatarPath}
              onChanged={user.refresh}
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>{t("profile.eyebrow")}</p>
              <h1 className="mt-1 truncate font-serif text-3xl leading-tight md:text-4xl">
                {user.displayName ?? ""}
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">{t("profile.since")}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ShareModal
              trigger={
                <Button variant="outline" className="rounded-full">
                  <Share2 className="mr-1.5 h-4 w-4" /> {t("profile.shareJourney")}
                </Button>
              }
              kind={t("profile.share.kind")}
              title={t("profile.share.title")}
              reference={t("profile.share.ref")}
              excerpt={t("profile.share.excerpt")}
            />
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/settings">
                <SettingsIcon className="mr-1.5 h-4 w-4" /> {t("nav.settings")}
              </Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label={t("profile.stat.currentStreak")} value="7" hint={t("profile.stat.days")} icon={<Flame className="h-4 w-4" style={{ color: "var(--gold)" }} />} />
          <Stat label={t("profile.stat.longestStreak")} value="21" hint={t("profile.stat.days")} />
          <Stat label={t("profile.stat.journeysCompleted")} value="42" />
          <Stat
            label={t("profile.stat.bestTime")}
            value={fastest ? formatDuration(fastest.bestTimeMs) : "—"}
            hint={puzzlesTimed ? `${puzzlesTimed} ${t("profile.stat.puzzles")}` : t("profile.stat.noTimesYet")}
          />
          <Stat label={t("profile.stat.milestonesReached")} value={`${achieved.length}`} hint={`${t("ui.of")} ${MILESTONE_LIST.length}`} />
        </section>

        <section>
          <SectionTitle eyebrow={t("profile.times.eyebrow")} title={t("profile.times.title")} />
          {perJourney.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("profile.times.empty")}</p>
          ) : (
            <ul className="mt-6 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
              {perJourney.map((row) => (
                <li key={row.journey} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg">{row.journey}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {row.completions} {t(row.completions === 1 ? "profile.times.completion" : "profile.times.completions")}
                      {row.lastTimeMs != null ? ` · ${t("profile.times.last")} ${formatDuration(row.lastTimeMs)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl tabular-nums" style={{ color: "var(--gold)" }}>
                      {formatDuration(row.bestTimeMs)}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--walnut)" }}>
                      {t("profile.stat.bestTime")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle eyebrow={t("profile.milestones")} title={t("profile.reached")} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achieved.map((m) => <MilestoneCard key={m.id} m={m} />)}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow={t("profile.ahead")} title={t("profile.comingUp")} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => <MilestoneCard key={m.id} m={m} />)}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{t("profile.together")}</p>
              <h2 className="mt-1 font-serif text-2xl md:text-3xl">{t("profile.walkingWith")}</h2>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/together">{t("profile.openTogether")}</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {active.map((c) => <CompanionCard key={c.id} c={c} />)}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{t("profile.membership")}</p>
          </div>
          <h3 className="mt-2 font-serif text-2xl">{t("profile.premiumAnnual")}</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">{t("profile.renews")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full">{t("profile.managePlan")}</Button>
            <Button variant="ghost" className="rounded-full">{t("profile.billing")}</Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-serif text-3xl leading-none tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{eyebrow}</p>
      <h2 className="mt-1 font-serif text-2xl md:text-3xl">{title}</h2>
    </div>
  );
}