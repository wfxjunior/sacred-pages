// TODO: Implement real link generation, image export and native sharing.
// Design prototype only — visual previews for shareable cards.

import { useMemo, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, Lock, MessageSquare, Mail, Square, Smartphone, Check } from "lucide-react";

type Format = "square" | "story" | "message" | "email";
type Theme = "ivory" | "ink";

const FORMATS: { key: Format; label: string; icon: typeof Square; hint: string }[] = [
  { key: "square", label: "Square card", icon: Square, hint: "1:1 · Feed" },
  { key: "story", label: "Vertical story", icon: Smartphone, hint: "9:16 · Story" },
  { key: "message", label: "Message", icon: MessageSquare, hint: "SMS / DM" },
  { key: "email", label: "Email", icon: Mail, hint: "Subject + body" },
];

export function ShareModal({
  trigger,
  title = "Gratitude That Transforms",
  reference = "Philippians 4:6–7",
  excerpt = "Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.",
  kind = "Journey",
}: {
  trigger: ReactNode;
  title?: string;
  reference?: string;
  excerpt?: string;
  kind?: string;
}) {
  const [format, setFormat] = useState<Format>("square");
  const [theme, setTheme] = useState<Theme>("ivory");
  // Progress details — nothing shared unless explicitly selected. Reflection & prayer are
  // locked off by design and never appear in any share surface.
  const [includeStreak, setIncludeStreak] = useState(false);
  const [includeCollection, setIncludeCollection] = useState(true);
  const [includeDayNumber, setIncludeDayNumber] = useState(false);

  const details = useMemo(
    () =>
      [
        includeCollection && `${kind}`,
        includeDayNumber && "Day 12 of 30",
        includeStreak && "12-day streak",
      ].filter(Boolean) as string[],
    [includeCollection, includeDayNumber, includeStreak, kind]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Share this moment</DialogTitle>
          <DialogDescription>
            Choose a format and decide exactly what to include. Private reflections and prayers are never shared.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          {/* Previews — both light and dark shown side-by-side */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Preview · Light &amp; Dark
              </p>
              <div className="inline-flex rounded-full border border-border/60 p-0.5 text-[11px]">
                {(["ivory", "ink"] as Theme[]).map((tt) => (
                  <button
                    key={tt}
                    onClick={() => setTheme(tt)}
                    className={`rounded-full px-2.5 py-0.5 transition ${
                      theme === tt ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-pressed={theme === tt}
                  >
                    {tt === "ivory" ? "Light active" : "Dark active"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(["ivory", "ink"] as Theme[]).map((tt) => (
                <div key={tt} className="space-y-2">
                  <SharePreview
                    format={format}
                    theme={tt}
                    title={title}
                    reference={reference}
                    excerpt={excerpt}
                    details={details}
                    dim={theme !== tt}
                  />
                  <p className="text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {tt === "ivory" ? "Light" : "Dark"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Format</p>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map((f) => {
                  const Icon = f.icon;
                  const active = format === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFormat(f.key)}
                      aria-pressed={active}
                      className={`rounded-lg border p-2.5 text-left transition ${
                        active ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" style={{ color: "var(--walnut)" }} />
                        <p className="text-[12px] font-medium">{f.label}</p>
                      </div>
                      <p className="mt-0.5 text-[10.5px] text-muted-foreground">{f.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Include in share
                </p>
                <span className="text-[10px] text-muted-foreground">Off by default</span>
              </div>
              <div className="space-y-1.5">
                <ToggleRow label="Collection name" checked={includeCollection} onChange={setIncludeCollection} />
                <ToggleRow label="Day number (e.g. Day 12 of 30)" checked={includeDayNumber} onChange={setIncludeDayNumber} />
                <ToggleRow label="Current streak" checked={includeStreak} onChange={setIncludeStreak} />
              </div>
            </div>

            <div
              className="rounded-xl border p-3 text-[11.5px]"
              style={{
                background: "color-mix(in oklab, var(--sage) 8%, transparent)",
                borderColor: "color-mix(in oklab, var(--sage) 30%, transparent)",
              }}
            >
              <p className="flex items-center gap-1.5 font-medium" style={{ color: "var(--sage)" }}>
                <Lock className="h-3 w-3" /> Always private
              </p>
              <p className="mt-1 text-muted-foreground">
                Your reflections and prayers are never shared. Progress details are only shared when you toggle them on above.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="rounded-full">
            <Copy className="mr-1.5 h-4 w-4" /> Copy link
          </Button>
          {(format === "square" || format === "story") && (
            <Button variant="outline" className="rounded-full">
              <Download className="mr-1.5 h-4 w-4" /> Save image
            </Button>
          )}
          <Button className="rounded-full">
            <Share2 className="mr-1.5 h-4 w-4" /> Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-left transition hover:border-border"
    >
      <span className="text-[12px]">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          checked ? "" : "bg-border"
        }`}
        style={checked ? { background: "var(--sage)" } : undefined}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function SharePreview({
  format,
  theme,
  title,
  reference,
  excerpt,
  details,
  dim,
}: {
  format: Format;
  theme: Theme;
  title: string;
  reference: string;
  excerpt: string;
  details: string[];
  dim?: boolean;
}) {
  const bg = theme === "ivory" ? "#F8F6F2" : "#171817";
  const surface = theme === "ivory" ? "#FFFFFF" : "#272927";
  const fg = theme === "ivory" ? "#2B2B2B" : "#F5F2EB";
  const muted = theme === "ivory" ? "#6E5847" : "#C89F4F";
  const border = theme === "ivory" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const wrap = `relative w-full overflow-hidden rounded-xl border shadow-sm transition ${dim ? "opacity-60" : ""}`;

  if (format === "square" || format === "story") {
    const dimCls = format === "square" ? "aspect-square" : "aspect-[9/16]";
    const short = excerpt.length > 120 ? excerpt.slice(0, 120) + "…" : excerpt;
    return (
      <div className={`${wrap} ${dimCls}`} style={{ background: bg, color: fg, borderColor: border }}>
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between text-[8.5px] font-semibold uppercase tracking-[0.22em]" style={{ color: muted }}>
            <span>Scripture</span>
            <span>Jornadas</span>
          </div>
          <div>
            <p className="font-serif text-[15px] leading-snug">{short}</p>
            <p className="mt-2 text-[9.5px] font-medium" style={{ color: muted }}>
              {reference}
            </p>
            {details.length > 0 && (
              <p className="mt-2 text-[9px]" style={{ color: muted }}>
                {details.join(" · ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[9px]" style={{ color: muted }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#B88A3B" }} />
            jornadas.app
          </div>
        </div>
      </div>
    );
  }

  if (format === "message") {
    const short = excerpt.length > 90 ? excerpt.slice(0, 90) + "…" : excerpt;
    return (
      <div className={`${wrap} aspect-square`} style={{ background: bg, borderColor: border }}>
        <div className="flex h-full flex-col justify-end gap-2 p-4">
          <div
            className="max-w-[85%] self-start rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] leading-snug"
            style={{ background: surface, color: fg, borderColor: border, borderWidth: 1 }}
          >
            <p>Reading this today — thought of you.</p>
          </div>
          <div
            className="max-w-[92%] self-start rounded-2xl rounded-bl-sm px-3 py-2.5"
            style={{ background: surface, color: fg, borderColor: border, borderWidth: 1 }}
          >
            <p className="font-serif text-[12px] leading-snug">"{short}"</p>
            <p className="mt-1 text-[9px]" style={{ color: muted }}>{reference}</p>
            {details.length > 0 && (
              <p className="mt-1 text-[9px]" style={{ color: muted }}>{details.join(" · ")}</p>
            )}
            <p className="mt-1.5 text-[9px] underline" style={{ color: muted }}>jornadas.app/j/•••</p>
          </div>
        </div>
      </div>
    );
  }

  // email
  const short = excerpt.length > 140 ? excerpt.slice(0, 140) + "…" : excerpt;
  return (
    <div className={`${wrap} aspect-square`} style={{ background: bg, color: fg, borderColor: border }}>
      <div className="flex h-full flex-col p-3.5">
        <div className="mb-2 space-y-1 border-b pb-2 text-[9.5px]" style={{ borderColor: border, color: muted }}>
          <p><span className="font-semibold">Subject:</span> A passage worth sharing</p>
          <p><span className="font-semibold">From:</span> you@jornadas.app</p>
        </div>
        <p className="text-[10.5px]">Hi —</p>
        <p className="mt-1.5 text-[10.5px]">This passage stayed with me today:</p>
        <div
          className="mt-2 rounded-md p-2.5"
          style={{ borderLeft: "2px solid #B88A3B", background: surface }}
        >
          <p className="font-serif text-[11px] leading-snug">"{short}"</p>
          <p className="mt-1 text-[9px]" style={{ color: muted }}>— {reference}</p>
        </div>
        {details.length > 0 && (
          <p className="mt-2 text-[9.5px]" style={{ color: muted }}>{details.join(" · ")}</p>
        )}
        <p className="mt-auto text-[9.5px]" style={{ color: muted }}>
          Read on Jornadas ↗
        </p>
      </div>
    </div>
  );
}

// Suppress unused import warning while keeping the palette consistent.
void Check;