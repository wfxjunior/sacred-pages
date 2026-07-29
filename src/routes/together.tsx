// TODO: Wire real Journey Together backend (invitations, permissions, shared progress).
// Design-only prototype using mock data.

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site/AppShell";
import { CompanionCard } from "@/components/site/CompanionCard";
import { InviteCompanionModal } from "@/components/site/InviteCompanionModal";
import { SharedJourneyProgress } from "@/components/site/SharedJourneyProgress";
import { SharedReflection } from "@/components/site/SharedReflection";
import { COMPANIONS, ENCOURAGE_OPTIONS } from "@/lib/mock/companions";
import { GROUPS } from "@/lib/mock/groups";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Mail, Sparkles, Users, MoreHorizontal, HandHeart, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/together")({
  head: () => ({
    meta: [
      { title: "Journey Together — Jornadas da Palavra" },
      { name: "description", content: "Walk through the same Scripture with someone you trust — private by default." },
      { property: "og:title", content: "Journey Together — Jornadas da Palavra" },
      { property: "og:description", content: "Shared journeys for spouses, friends, family and small groups." },
    ],
  }),
  component: TogetherPage,
});

function TogetherPage() {
  const active = COMPANIONS.filter((c) => c.status === "active");
  const pending = COMPANIONS.filter((c) => c.status === "pending");
  const archived = COMPANIONS.filter((c) => c.status === "archived");

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-16">
        <IntroBlock />
        <ActiveSection companions={active} />
        <SharedJourneyProgress companions={active} />
        <EncourageAndPray />
        <SharedReflection companions={active} />
        <PendingSection pending={pending} />
        <GroupsSection />
        <ArchivedSection archived={archived} />
      </div>
    </AppShell>
  );
}

function IntroBlock() {
  const { t } = useI18n();
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--walnut)" }}>
          {t("together.eyebrow2")}
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-5xl">
          {t("together.h1a")} <em className="italic">{t("together.h1b")}</em>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          {t("together.desc")}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <InviteCompanionModal
            trigger={
              <Button className="rounded-full px-5">
                <Mail className="mr-1.5 h-4 w-4" /> {t("together.inviteCta")}
              </Button>
            }
          />
          <Button variant="outline" className="rounded-full px-5">
            <Users className="mr-1.5 h-4 w-4" /> {t("together.startGroup")}
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" style={{ color: "var(--sage)" }} /> {t("together.privateDefault")}</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} /> {t("together.premiumFeature")}</span>
        </div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t("together.thisWeek2")}</p>
        <p className="mt-2 font-serif text-3xl leading-none">3</p>
        <p className="text-[13px] text-muted-foreground">{t("together.activeCompanions")}</p>
        <div className="mt-5 h-px bg-border/60" />
        <div className="mt-5 space-y-3 text-[13px]">
          <Row label={t("together.stat.journeys")} value="8" />
          <Row label={t("together.stat.prayers")} value="24" />
          <Row label={t("together.stat.encouragements")} value="17" />
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}

function ActiveSection({ companions }: { companions: typeof COMPANIONS }) {
  const { t } = useI18n();
  return (
    <section>
      <SectionHeader
        eyebrow={t("together.active")}
        title={t("together.activeTitle")}
        action={
          <InviteCompanionModal
            trigger={<Button variant="outline" size="sm" className="rounded-full">{t("ui.invite")}</Button>}
          />
        }
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companions.map((c) => (
          <div key={c.id} className="relative">
            <CompanionCard c={c} />
            <div className="absolute right-4 top-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={t("together.menu.manageAria")}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem>{t("together.menu.change")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("together.menu.sharing")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("together.menu.pause")}</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">{t("together.menu.archive")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EncourageAndPray() {
  const { t } = useI18n();
  const [sent, setSent] = useState<string | null>(null);
  const [prayed, setPrayed] = useState(false);
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{t("together.encourage")}</p>
        <h3 className="mt-2 font-serif text-2xl">{t("together.sendQuiet")}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{t("together.encHint")}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {ENCOURAGE_OPTIONS.map((o) => (
            <button
              key={o}
              onClick={() => { setSent(o); setTimeout(() => setSent(null), 1800); }}
              className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-[13px] transition hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {o}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-4 h-4 text-[12px]" style={{ color: "var(--sage)" }}>
          {sent ? `Sent to Sarah — "${sent}"` : ""}
        </p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{t("together.pray")}</p>
        <h3 className="mt-2 font-serif text-2xl">{t("together.holdPrayer")}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{t("together.holdHint")}</p>
        <div className="mt-5 flex items-center gap-3">
          <Button
            onClick={() => setPrayed((v) => !v)}
            variant={prayed ? "outline" : "default"}
            className="rounded-full"
          >
            <HandHeart className="mr-1.5 h-4 w-4" />
            {prayed ? t("together.prayedToday") : t("together.prayFor")}
          </Button>
          {prayed && <span className="text-[12px]" style={{ color: "var(--sage)" }}>{t("together.prayedNote")}</span>}
        </div>
      </div>
    </section>
  );
}

function PendingSection({ pending }: { pending: typeof COMPANIONS }) {
  const { t } = useI18n();
  return (
    <section>
      <SectionHeader eyebrow={t("together.pending")} title={t("together.pendingTitle")} />
      <div className="mt-6 grid gap-3">
        {pending.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-border/60 bg-card/60 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-medium text-white" style={{ background: c.color }}>
              {c.name[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{c.name}</p>
              <p className="text-[12px] text-muted-foreground">{c.relationship} · {t("together.invitedOn")} {c.invitedOn}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground">{t("ui.resend")}</Button>
              <Button size="sm" variant="ghost" className="rounded-full text-destructive">{t("ui.cancel")}</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GroupsSection() {
  const { t } = useI18n();
  return (
    <section>
      <SectionHeader
        eyebrow={t("together.groups")}
        title={t("together.groupsTitle")}
        action={<Button variant="outline" size="sm" className="rounded-full">{t("together.createGroup")}</Button>}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.id} className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="font-serif text-lg">{g.name}</p>
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{g.privacy}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">{t("together.ledBy")} {g.leader} · {g.members} {t("together.membersLabel")}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t("together.currentJourney")}</p>
            <p className="mt-1 font-serif text-[15px]">{g.journey}</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                <div className="h-full rounded-full" style={{ width: `${g.progress}%`, background: "var(--sage)" }} />
              </div>
              <span className="text-[11px] tabular-nums text-muted-foreground">{g.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchivedSection({ archived }: { archived: typeof COMPANIONS }) {
  const { t } = useI18n();
  return (
    <section>
      <SectionHeader eyebrow={t("together.archived")} title={t("together.archivedTitle")} />
      <div className="mt-6 grid gap-3">
        {archived.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-medium text-white" style={{ background: c.color }}>
              {c.name[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{c.name} · {c.journey}</p>
              <p className="text-[12px] text-muted-foreground">{c.lastActivity}</p>
            </div>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>{eyebrow}</p>
        <h2 className="mt-1 font-serif text-2xl md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// Silence unused import in some build environments.
void Heart;