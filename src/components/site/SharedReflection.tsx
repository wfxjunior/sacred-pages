// TODO: Wire real reflection storage, per-companion sharing preferences and delivery.
// Design-only prototype using mock companions and local state.

import { useMemo, useState } from "react";
import type { Companion } from "@/lib/mock/companions";
import { REFLECTION_VISIBILITY } from "@/lib/mock/companions";
import { Button } from "@/components/ui/button";
import { Lock, Eye, Check, PenLine, Sparkles } from "lucide-react";

type Visibility = "private" | "sentence" | "status";

export function SharedReflection({ companions }: { companions: Companion[] }) {
  const active = companions.filter((c) => c.status === "active");
  const [companionId, setCompanionId] = useState(active[0]?.id ?? "");
  const [text, setText] = useState(
    "Today I noticed how gratitude quiets my anxious thoughts — small mercies I usually overlook."
  );
  const [sentence, setSentence] = useState("Gratitude quiets my anxious thoughts.");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [saved, setSaved] = useState(false);

  const companion = useMemo(
    () => active.find((c) => c.id === companionId) ?? active[0],
    [active, companionId]
  );

  if (!companion) return null;

  const firstName = companion.name.split(" ")[0];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
            Shared reflection
          </p>
          <h2 className="mt-1 font-serif text-2xl md:text-3xl">Your words, your choice.</h2>
          <p className="mt-2 max-w-xl text-[13px] text-muted-foreground">
            Write freely. Nothing leaves this page unless you decide to share it.
            Choose per companion how much of today's reflection they'll see.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" style={{ color: "var(--sage)" }} /> Private by default
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Composer */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
              <PenLine className="h-3.5 w-3.5" style={{ color: "var(--walnut)" }} />
              Today's reflection
            </div>
            <div className="inline-flex items-center gap-2">
              <label htmlFor="companion-select" className="text-[11px] text-muted-foreground">
                Sharing with
              </label>
              <select
                id="companion-select"
                value={companion.id}
                onChange={(e) => { setCompanionId(e.target.value); setSaved(false); }}
                className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {active.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSaved(false); }}
            rows={6}
            placeholder="What is God stirring in you today?"
            className="mt-4 w-full resize-none rounded-xl border border-border/60 bg-background/60 p-4 font-serif text-[15px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              How much to share with {firstName}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {REFLECTION_VISIBILITY.map((v) => {
                const active = visibility === v.key;
                return (
                  <button
                    key={v.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => { setVisibility(v.key as Visibility); setSaved(false); }}
                    className={`relative rounded-xl border p-4 text-left transition ${
                      active ? "border-primary bg-primary/5" : "border-border/60 bg-background/60 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <VisibilityIcon k={v.key as Visibility} />
                      <p className="text-[13px] font-medium">{v.label}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">{v.hint}</p>
                    {active && (
                      <span
                        className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full text-white"
                        style={{ background: "var(--sage)" }}
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {visibility === "sentence" && (
            <div className="mt-5 rounded-xl border border-dashed border-border/60 bg-background/60 p-4">
              <label htmlFor="sentence" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                One sentence to share
              </label>
              <input
                id="sentence"
                value={sentence}
                maxLength={140}
                onChange={(e) => { setSentence(e.target.value); setSaved(false); }}
                className="mt-2 w-full rounded-lg border border-border/60 bg-card px-3 py-2 font-serif text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <p className="mt-1 text-right text-[11px] tabular-nums text-muted-foreground">{sentence.length}/140</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setSaved(true)}
              className="rounded-full"
            >
              {visibility === "private" ? "Save privately" : `Save & share with ${firstName}`}
            </Button>
            <p aria-live="polite" className="text-[12px]" style={{ color: "var(--sage)" }}>
              {saved
                ? visibility === "private"
                  ? "Kept private — only you can see it."
                  : visibility === "status"
                  ? `${firstName} will see that you reflected today.`
                  : `${firstName} will see one sentence.`
                : ""}
            </p>
          </div>
        </div>

        {/* Preview */}
        <aside className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" style={{ color: "var(--dusty-blue)" }} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--walnut)" }}>
              What {firstName} will see
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-4">
            <div className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-medium text-white"
                style={{ background: companion.color }}
              >
                {companion.name[0]}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">You · today</p>
                <p className="truncate text-[11px] text-muted-foreground">{companion.journey}</p>
              </div>
            </div>

            <div className="mt-4 min-h-[110px]">
              {visibility === "private" && (
                <div className="flex h-[110px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 text-center">
                  <Lock className="h-4 w-4" style={{ color: "var(--sage)" }} />
                  <p className="text-[12px] text-muted-foreground">This reflection is private.</p>
                </div>
              )}
              {visibility === "status" && (
                <div className="flex h-[110px] flex-col items-center justify-center gap-2 rounded-lg text-center"
                  style={{ background: "color-mix(in oklab, var(--sage) 8%, transparent)" }}>
                  <Sparkles className="h-4 w-4" style={{ color: "var(--sage)" }} />
                  <p className="text-[13px]"><span className="font-medium">You</span> reflected today.</p>
                  <p className="text-[11px] text-muted-foreground">Content stays private.</p>
                </div>
              )}
              {visibility === "sentence" && (
                <blockquote
                  className="rounded-lg p-4 font-serif text-[15px] leading-snug"
                  style={{
                    background: "color-mix(in oklab, var(--gold) 8%, transparent)",
                    borderLeft: "2px solid var(--gold)",
                  }}
                >
                  "{sentence || "…"}"
                </blockquote>
              )}
            </div>
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            You can change this at any time. Past reflections keep the setting they were saved with.
          </p>
        </aside>
      </div>
    </section>
  );
}

function VisibilityIcon({ k }: { k: Visibility }) {
  const style =
    k === "private"
      ? { color: "var(--sage)" }
      : k === "sentence"
      ? { color: "var(--gold)" }
      : { color: "var(--dusty-blue)" };
  const Icon = k === "private" ? Lock : k === "sentence" ? PenLine : Sparkles;
  return <Icon className="h-3.5 w-3.5" style={style} />;
}