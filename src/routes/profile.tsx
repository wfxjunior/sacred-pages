import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getSubscriptionStatus, createBillingPortalSession } from "@/lib/stripe/billing.functions";
import { AppShell } from "@/components/site/AppShell";
import { Button } from "@/components/ui/button";
import { MilestoneCard } from "@/components/site/MilestoneCard";
import { CompanionCard } from "@/components/site/CompanionCard";
import { ShareModal } from "@/components/site/ShareModal";
import { AvatarUploader } from "@/components/site/AvatarUploader";
import { AccessCircle } from "@/components/site/AccessCircle";
import type { Milestone } from "@/lib/mock/milestones";
import type { LocalizedMilestone } from "@/lib/journey/services";
import {
  Award,
  BookOpenCheck,
  Clock,
  Flame,
  HeartHandshake,
  LogOut,
  Settings as SettingsIcon,
  Share2,
  Sparkles,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { listMyCompanionships } from "@/lib/together/functions";
import { useI18n } from "@/lib/i18n";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";
import { authService } from "@/lib/auth/service";
import { formatDuration, groupByJourney, useBestTimes } from "@/lib/puzzle/best-times";
import { useConsistency, useProgressStats, useMilestones, useTotalTime } from "@/lib/journey/hooks";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Lumena" },
      {
        name: "description",
        content: "Your journey, milestones and companions in one calm place.",
      },
      { property: "og:title", content: "Profile — Lumena" },
      { property: "og:description", content: "A quiet profile — your progress at a glance." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t, locale } = useI18n();
  const user = useCurrentUser();
  // Real rhythm and completion counts — the 7/21/42 placeholders told every
  // reader the same story.
  const { summary, signedIn } = useConsistency();
  const progressStats = useProgressStats();
  const totalTime = useTotalTime();
  // Real membership state — the fake "Premium — annual" card told every free
  // reader they were paying customers.
  const fetchSubscription = useServerFn(getSubscriptionStatus);
  const openPortal = useServerFn(createBillingPortalSession);
  const [portalLoading, setPortalLoading] = useState(false);
  const subscription = useQuery({
    queryKey: ["billing", user.userId ?? "anonymous", "status"],
    enabled: Boolean(user.userId),
    staleTime: 60_000,
    queryFn: () => fetchSubscription({}),
  });
  const isPremium = subscription.data?.isPremium ?? false;

  const handleSignOut = async () => {
    await authService.signOut();
    window.location.assign("/");
  };

  const handleBilling = async () => {
    if (!user.userId) return;
    setPortalLoading(true);
    try {
      const { url } = await openPortal({ data: { returnPath: "/profile" } });
      if (url) {
        window.location.href = url;
        return;
      }
      toast(t("profile.noBillingYet"));
    } catch {
      toast.error(t("pricing.paymentsSoon"));
    }
    setPortalLoading(false);
  };
  const { milestones } = useMilestones();
  const cards = milestones.map((m) => toMilestoneCard(m, locale));
  const achieved = signedIn ? cards.filter((m) => m.achieved) : [];
  const upcoming = signedIn ? cards.filter((m) => !m.achieved).slice(0, 3) : [];
  const { entries: bestTimes } = useBestTimes();
  const fastest = bestTimes[0] ?? null;
  const puzzlesTimed = bestTimes.reduce((sum, entry) => sum + entry.completions, 0);
  const perJourney = groupByJourney(bestTimes, t("profile.times.unnamed"));
  const companionships = useQuery({
    queryKey: ["companionships", "mine"],
    queryFn: () => listMyCompanionships(),
    enabled: !!user.userId,
  });
  const active = (companionships.data ?? []).filter((c) => c.status === "active").slice(0, 2);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-14">
        {/* Stacks on phones: side-by-side put the "journeying since" line
            under the action buttons, overlapping them. */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <AvatarUploader
              userId={user.userId}
              initial={user.initial}
              avatarUrl={user.avatarUrl}
              avatarPath={user.avatarPath}
              onChanged={user.refresh}
            />
            <div className="min-w-0">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                style={{ color: "var(--walnut)" }}
              >
                {t("profile.eyebrow")}
              </p>
              <h1 className="mt-1 truncate font-serif text-3xl leading-tight md:text-4xl">
                {user.displayName ?? ""}
              </h1>
              <p className="mt-1 text-[13px] text-muted-foreground">{t("profile.since")}</p>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">
            <ShareModal
              trigger={
                <Button variant="outline" className="h-11 w-full rounded-full sm:h-10 sm:w-auto">
                  <Share2 className="mr-1.5 h-4 w-4" /> {t("profile.shareJourney")}
                </Button>
              }
              kind={t("profile.share.kind")}
              title={t("profile.share.title")}
              reference={t("profile.share.ref")}
              excerpt={t("profile.share.excerpt")}
            />
            <Button asChild variant="ghost" className="h-11 w-full rounded-full sm:h-10 sm:w-auto">
              <Link to="/settings">
                <SettingsIcon className="mr-1.5 h-4 w-4" /> {t("nav.settings")}
              </Link>
            </Button>
            {user.userId && (
              <Button
                variant="ghost"
                className="h-11 w-full rounded-full text-muted-foreground hover:text-foreground sm:h-10 sm:w-auto"
                onClick={() => void handleSignOut()}
                title={t("auth.signOut")}
              >
                <LogOut className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {t("auth.signOut")}
              </Button>
            )}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label={t("profile.stat.currentStreak")}
            value={signedIn ? `${summary.currentRun}` : "—"}
            hint={t("profile.stat.days")}
            icon={<Flame className="h-4 w-4" style={{ color: "var(--gold)" }} />}
          />
          <Stat
            label={t("profile.stat.longestStreak")}
            value={signedIn ? `${summary.longestRun}` : "—"}
            hint={t("profile.stat.days")}
          />
          <Stat
            label={t("profile.stat.journeysCompleted")}
            value={signedIn ? `${progressStats.journeysCompleted}` : "—"}
          />
          <Stat
            label={t("profile.stat.timeInJourneys")}
            value={signedIn && totalTime.totalMs > 0 ? formatTotalTime(totalTime.totalMs) : "—"}
            hint={t("profile.stat.allSessions")}
            icon={<Clock className="h-4 w-4" style={{ color: "var(--dusty-blue)" }} />}
          />
          <Stat
            label={t("profile.stat.bestTime")}
            value={fastest ? formatDuration(fastest.bestTimeMs) : "—"}
            hint={
              puzzlesTimed
                ? `${puzzlesTimed} ${t("profile.stat.puzzles")}`
                : t("profile.stat.noTimesYet")
            }
          />
          <Stat
            label={t("profile.stat.milestonesReached")}
            value={signedIn ? `${achieved.length}` : "—"}
            hint={cards.length > 0 ? `${t("ui.of")} ${cards.length}` : undefined}
          />
        </section>

        <section>
          <SectionTitle eyebrow={t("profile.times.eyebrow")} title={t("profile.times.title")} />
          {perJourney.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t("profile.times.empty")}</p>
          ) : (
            <ul className="mt-6 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
              {perJourney.map((row) => (
                <li
                  key={row.journey}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg">{row.journey}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      {row.completions}{" "}
                      {t(
                        row.completions === 1
                          ? "profile.times.completion"
                          : "profile.times.completions",
                      )}
                      {row.lastTimeMs != null
                        ? ` · ${t("profile.times.last")} ${formatDuration(row.lastTimeMs)}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl tabular-nums" style={{ color: "var(--gold)" }}>
                      {formatDuration(row.bestTimeMs)}
                    </p>
                    <p
                      className="text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: "var(--walnut)" }}
                    >
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
            {achieved.map((m) => (
              <MilestoneCard key={m.id} m={m} />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle eyebrow={t("profile.ahead")} title={t("profile.comingUp")} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MilestoneCard key={m.id} m={m} />
            ))}
          </div>
        </section>

        <AccessCircle userId={user.userId} email={user.email} />

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--walnut)" }}
              >
                {t("profile.together")}
              </p>
              <h2 className="mt-1 font-serif text-2xl md:text-3xl">{t("profile.walkingWith")}</h2>
            </div>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/together">{t("profile.openTogether")}</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {active.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border/60 bg-card/60 p-6 text-center">
                <p className="text-[14px] font-medium">{t("together.empty")}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{t("together.emptyHint")}</p>
              </div>
            ) : (
              active.map((c) => {
                const isInviter = user.userId === c.inviter_id;
                const other = isInviter ? c.invitee : c.inviter;
                return (
                  <CompanionCard
                    key={c.id}
                    c={{
                      id: c.id,
                      name:
                        other?.display_name ??
                        (isInviter ? c.invitee_email : other?.email) ??
                        t("together.activePlaceholder"),
                      color: "var(--sage)",
                      relationship: c.relationship ?? t("together.invite.relationshipLabel"),
                      journey: "",
                      reference: "",
                      yourProgress: 0,
                      theirProgress: 0,
                      lastActivity: new Date(c.updated_at).toLocaleDateString(),
                      status: c.status,
                      invitedOn: "",
                    }}
                  />
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--gold)" }} />
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: "var(--walnut)" }}
            >
              {t("profile.membership")}
            </p>
          </div>
          <h3 className="mt-2 font-serif text-2xl">
            {isPremium ? t("profile.planPremium") : t("profile.planFree")}
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {isPremium ? t("profile.planPremiumHint") : t("profile.planFreeHint")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/pricing">{t("profile.managePlan")}</Link>
            </Button>
            {user.userId && (
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={handleBilling}
                disabled={portalLoading}
              >
                {t("profile.billing")}
              </Button>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

const MILESTONE_ICONS: Record<string, LucideIcon> = {
  journey: BookOpenCheck,
  puzzle: Award,
  consistency: Flame,
  collection: BookOpenCheck,
  reflection: Sprout,
  prayer: HeartHandshake,
  discovery: Sprout,
};

const MILESTONE_ACCENTS: Record<string, string> = {
  journey: "#5E7FA3",
  puzzle: "#B88A3B",
  consistency: "#B88A3B",
  collection: "#5E7FA3",
  reflection: "#6F8F6A",
  prayer: "#8A6FA8",
  discovery: "#6F8F6A",
};

const MILESTONE_CATEGORY_LABEL: Record<string, Milestone["category"]> = {
  consistency: "Consistency",
  journey: "Journey Progress",
  puzzle: "Journey Progress",
  collection: "Journey Progress",
  prayer: "Shared Journey",
  reflection: "Personal Growth",
  discovery: "Personal Growth",
};

/** The real, database-evaluated milestone in the shape the card renders. */
function toMilestoneCard(m: LocalizedMilestone, locale: string): Milestone {
  const category = m.definition.category;
  return {
    id: m.definition.id,
    title: m.title,
    description: m.description,
    category: MILESTONE_CATEGORY_LABEL[category] ?? "Personal Growth",
    icon: MILESTONE_ICONS[category] ?? Award,
    accent: MILESTONE_ACCENTS[category] ?? "var(--gold)",
    achieved: m.earned,
    date: m.earnedAt
      ? new Date(m.earnedAt).toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : undefined,
  };
}

/** 95 minutes reads as "1h 35m"; under an hour, "42m"; under a minute, "<1m". */
function formatTotalTime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "<1m";
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m`;
  return `${hours}h ${minutes % 60}m`;
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-3 font-serif text-3xl leading-none tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--walnut)" }}
      >
        {eyebrow}
      </p>
      <h2 className="mt-1 font-serif text-2xl md:text-3xl">{title}</h2>
    </div>
  );
}
