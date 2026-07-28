// TODO: Wire real shared journey progress state, permissions and privacy toggles.
// Design-only prototype using mock companion data.

import type { Companion } from "@/lib/mock/companions";
import { BookOpen, Grid3x3, PenLine, HandHeart, Lock, Check, Clock, Sparkles } from "lucide-react";

type StepKey = "devotional" | "puzzle" | "reflection" | "prayer";

const STEPS: { key: StepKey; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "devotional", label: "Devotional", Icon: BookOpen },
  { key: "puzzle", label: "Word Search", Icon: Grid3x3 },
  { key: "reflection", label: "Reflection", Icon: PenLine },
  { key: "prayer", label: "Prayer", Icon: HandHeart },
];

function statusFor(you?: boolean, them?: boolean) {
  if (you && them) return "both" as const;
  if (you && !them) return "waiting-them" as const;
  if (!you && them) return "waiting-you" as const;
  return "pending" as const;
}

export function SharedJourneyProgress({ companions }: { companions: Companion[] }) {
  const rows = companions.filter((c) => c.completedToday);
  if (rows.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            Shared progress
          </p>
          <h2 className="mt-1 font-serif text-2xl md:text-3xl">Today, together</h2>
          <p className="mt-2 max-w-xl text-[13px] text-muted-foreground">
            See who has walked each step today — devotional, word search, reflection, and prayer.
            Content stays private by default. You only see that a step was done, not what was written.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" style={{ color: "var(--sage)" }} />
          Private by default
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((c) => (
          <CompanionRow key={c.id} c={c} />
        ))}
      </div>

      <Legend />
    </section>
  );
}

function CompanionRow({ c }: { c: Companion }) {
  const done = c.completedToday!;
  const youCount = STEPS.filter((s) => done[s.key]).length;
  // Mock "their" completion loosely from their overall progress to keep design-only realism.
  const themCount = Math.round((c.theirProgress / 100) * STEPS.length);
  const bothCount = STEPS.filter((s, i) => done[s.key] && i < themCount).length;
  const allBoth = bothCount === STEPS.length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-medium text-white"
          style={{ background: c.color }}
        >
          {c.name[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">{c.name}</p>
          <p className="text-[12px] text-muted-foreground">
            {c.journey} {c.reference && <span className="opacity-70">· {c.reference}</span>}
          </p>
        </div>
        {allBoth ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ background: "color-mix(in oklab, var(--sage) 16%, transparent)", color: "var(--sage)" }}
          >
            <Sparkles className="h-3 w-3" /> Completed together
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" /> In progress
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <StepTile
            key={s.key}
            label={s.label}
            Icon={s.Icon}
            state={statusFor(done[s.key], i < themCount)}
            theirName={c.name.split(" ")[0]}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
        <span>
          You <span className="tabular-nums text-foreground">{youCount}/4</span> ·{" "}
          {c.name.split(" ")[0]} <span className="tabular-nums text-foreground">{themCount}/4</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3 w-3" style={{ color: "var(--sage)" }} /> Reflection & prayer content stay private
        </span>
      </div>
    </div>
  );
}

function StepTile({
  label,
  Icon,
  state,
  theirName,
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  state: "both" | "waiting-them" | "waiting-you" | "pending";
  theirName: string;
}) {
  const styles = tileStyles(state);
  const caption =
    state === "both"
      ? "Both completed"
      : state === "waiting-them"
      ? `Waiting for ${theirName}`
      : state === "waiting-you"
      ? "Your turn"
      : "Not started";

  return (
    <div
      className="flex items-center gap-3 rounded-xl border p-3 transition-colors"
      style={{ borderColor: styles.border, background: styles.bg }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ background: styles.iconBg, color: styles.iconFg }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{caption}</p>
      </div>
      <Marks state={state} />
    </div>
  );
}

function Marks({ state }: { state: "both" | "waiting-them" | "waiting-you" | "pending" }) {
  const you = state === "both" || state === "waiting-them";
  const them = state === "both" || state === "waiting-you";
  return (
    <div className="flex items-center gap-1">
      <Dot filled={you} label="You" />
      <Dot filled={them} label="Them" />
    </div>
  );
}

function Dot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <span
      aria-label={`${label} ${filled ? "done" : "pending"}`}
      title={`${label} ${filled ? "done" : "pending"}`}
      className="grid h-5 w-5 place-items-center rounded-full border text-[10px]"
      style={{
        borderColor: filled ? "color-mix(in oklab, var(--sage) 55%, transparent)" : "var(--border)",
        background: filled ? "color-mix(in oklab, var(--sage) 18%, transparent)" : "transparent",
        color: filled ? "var(--sage)" : "var(--muted-foreground)",
      }}
    >
      {filled ? <Check className="h-3 w-3" /> : label[0]}
    </span>
  );
}

function tileStyles(state: "both" | "waiting-them" | "waiting-you" | "pending") {
  switch (state) {
    case "both":
      return {
        border: "color-mix(in oklab, var(--sage) 45%, transparent)",
        bg: "color-mix(in oklab, var(--sage) 8%, transparent)",
        iconBg: "color-mix(in oklab, var(--sage) 18%, transparent)",
        iconFg: "var(--sage)",
      };
    case "waiting-them":
      return {
        border: "color-mix(in oklab, var(--gold) 35%, transparent)",
        bg: "color-mix(in oklab, var(--gold) 6%, transparent)",
        iconBg: "color-mix(in oklab, var(--gold) 16%, transparent)",
        iconFg: "var(--gold)",
      };
    case "waiting-you":
      return {
        border: "color-mix(in oklab, var(--dusty-blue) 30%, transparent)",
        bg: "color-mix(in oklab, var(--dusty-blue) 6%, transparent)",
        iconBg: "color-mix(in oklab, var(--dusty-blue) 16%, transparent)",
        iconFg: "var(--dusty-blue)",
      };
    default:
      return {
        border: "var(--border)",
        bg: "transparent",
        iconBg: "var(--surface-2)",
        iconFg: "var(--muted-foreground)",
      };
  }
}

function Legend() {
  const items = [
    { label: "Both completed", color: "var(--sage)" },
    { label: "Waiting for them", color: "var(--gold)" },
    { label: "Your turn", color: "var(--dusty-blue)" },
    { label: "Not started", color: "var(--muted-foreground)" },
  ];
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} /> {i.label}
        </span>
      ))}
    </div>
  );
}